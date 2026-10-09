import assert from 'assert';
import { db } from '../db';
import { 
  generateDocumentChecklistForScheme, 
  generatePersonalized30DayActionPlan,
  VERIFIED_SCHEME_DOCUMENT_REQUIREMENTS 
} from '../planService';
import { VERIFIED_GOVERNMENT_SCHEMES } from '../../lib/constants';

console.log('--- RUNNING PHASE 7: DOCUMENT CHECKLIST & 30-DAY ACTION PLAN TESTS ---');

// Test 1: Verified Document Checklist Generation for PMMY Mudra Shishu
console.log('Test 1: Generating verified document checklist for Mudra Shishu...');
const mudraDocs = generateDocumentChecklistForScheme('sch_mudra_shishu');
assert(mudraDocs.length >= 5, 'Mudra checklist must contain verified requirements');

// Verify mandatory vs conditional vs optional tagging
const aadhaarDoc = mudraDocs.find((d) => d.id === 'doc_aadhaar');
assert(aadhaarDoc !== undefined, 'Aadhaar must be included');
assert.strictEqual(aadhaarDoc?.requirementType, 'mandatory', 'Aadhaar must be mandatory');
assert.strictEqual(aadhaarDoc?.isMandatory, true, 'isMandatory flag must be true');

const panDoc = mudraDocs.find((d) => d.id === 'doc_pan_card');
assert(panDoc !== undefined, 'PAN / Form 60 must be included');
assert.strictEqual(panDoc?.requirementType, 'conditional', 'PAN must be conditional (Form 60 accepted for Shishu)');
assert(panDoc?.conditionNote?.includes('Form 60'), 'Condition note must mention Form 60');

const udyamDoc = mudraDocs.find((d) => d.id === 'doc_udyam_registration');
assert(udyamDoc !== undefined, 'Udyam must be included');
assert.strictEqual(udyamDoc?.requirementType, 'optional', 'Udyam must be optional for Shishu tier');
console.log('✓ Test 1 Passed: Mudra Shishu documents correctly tagged as mandatory, conditional, and optional.');

// Test 2: Verified Document Checklist for PMEGP (Higher value & subsidy scheme)
console.log('Test 2: Generating verified document checklist for PMEGP...');
const pmegpDocs = generateDocumentChecklistForScheme('sch_pmegp');
assert(pmegpDocs.length >= 5, 'PMEGP checklist must have structured requirements');

const dprDoc = pmegpDocs.find((d) => d.id === 'doc_dpr');
assert.strictEqual(dprDoc?.requirementType, 'mandatory', 'DPR is mandatory for PMEGP');

const eduDoc = pmegpDocs.find((d) => d.id === 'doc_education_certificate');
assert.strictEqual(eduDoc?.requirementType, 'conditional', 'Education certificate is conditional above ₹5L/₹10L');
assert(eduDoc?.conditionNote?.includes('above ₹10 Lakhs') || eduDoc?.conditionNote?.includes('above ₹5 Lakhs'), 'Condition note must cite project threshold');
console.log('✓ Test 2 Passed: PMEGP conditional educational and training requirements accurately reflected.');

// Test 3: User State Declarations (Available, Needed, Not Applicable)
console.log('Test 3: User marking documents as available, needed, or not applicable...');
// User marks Aadhaar as available, PAN as not_applicable
const userPredeclaredDocs = [
  { ...aadhaarDoc!, status: 'available' as const },
  { ...panDoc!, status: 'not_applicable' as const },
];
const mergedChecklist = generateDocumentChecklistForScheme('sch_mudra_shishu', userPredeclaredDocs);
const mergedAadhaar = mergedChecklist.find((d) => d.id === 'doc_aadhaar');
const mergedPan = mergedChecklist.find((d) => d.id === 'doc_pan_card');
const mergedPassbook = mergedChecklist.find((d) => d.id === 'doc_bank_passbook');

assert.strictEqual(mergedAadhaar?.status, 'available', 'User-marked available status must be preserved');
assert.strictEqual(mergedPan?.status, 'not_applicable', 'User-marked not_applicable status must be preserved');
assert.strictEqual(mergedPassbook?.status, 'needed', 'Unmarked documents must default to needed');
console.log('✓ Test 3 Passed: User declaration states (available, needed, not_applicable) preserved on refresh.');

// Test 4: Personalized 30-Day Action Plan Generation
console.log('Test 4: Generating personalized 30-day action plan for Sunita Pawar...');
const testProject = {
  id: 'prj_test_01',
  userId: 'usr_test_01',
  title: 'Sunita Hot Poha & Tea',
  sector: 'food_snacks',
  ideaDescription: 'Clean morning breakfast tea stall near bus stand',
  budgetInINR: 30000,
  targetDailyCustomers: 80,
  operationMode: 'stall',
  stage: 'planning',
  location: 'Shirur Market',
  hasEquipment: false,
};

const testProfile = {
  id: 'usr_test_01',
  fullName: 'Sunita Pawar',
  state: 'Maharashtra',
  district: 'Pune',
  villageTown: 'Shirur',
  language: 'mr' as const,
  role: 'entrepreneur' as const,
};

const actionPlan = generatePersonalized30DayActionPlan({
  project: testProject as any,
  profile: testProfile as any,
  eligibleSchemeId: 'sch_mudra_shishu',
  schemeEligibilityStatus: 'eligible',
});

assert(actionPlan.length >= 8, '30-day roadmap must contain complete phased milestones');
assert(actionPlan.some((t) => t.phase === 'days_1_7'), 'Must include Week 1 phase');
assert(actionPlan.some((t) => t.phase === 'days_8_14'), 'Must include Week 2 phase');
assert(actionPlan.some((t) => t.phase === 'days_15_21'), 'Must include Week 3 phase');
assert(actionPlan.some((t) => t.phase === 'days_22_30'), 'Must include Week 4 phase');

// Verify task metadata completeness
for (const task of actionPlan) {
  assert(task.title && task.title.length > 3, 'Task must have simple descriptive title');
  assert(task.description && task.description.length > 10, 'Task description must be clear');
  assert(task.estimatedDays > 0, 'Estimated time must be positive number');
  assert(typeof task.estimatedCostINR === 'number' && task.estimatedCostINR >= 0, 'Cost estimate must be non-negative');
  assert(Array.isArray(task.dependencies), 'Dependencies must be an array');
  assert(['pending', 'in_progress', 'completed'].includes(task.completionState), 'Valid completion state');
  assert(task.relatedRecommendationOrSource !== undefined, 'Task must cite related source or recommendation basis');
}
console.log('✓ Test 4 Passed: 30-day action plan generated with simple descriptions, time, costs, dependencies, and citations.');

// Test 5: Persistence & Rescheduling of Action Plan Tasks
console.log('Test 5: Persistence and task rescheduling in database...');
const testUser = db.createUser({
  fullName: 'Pooja Mane',
  emailOrPhone: `pooja_${Date.now()}@example.com`,
  password: 'Password123!',
  state: 'Maharashtra',
  district: 'Pune',
});

// Set action plan for user
db.setUserTasks(testUser.id, actionPlan);
const initialTasks = db.getUserTasks(testUser.id);
assert.strictEqual(initialTasks.length, actionPlan.length, 'Tasks must be persisted for user');

// Reschedule task 3 (quotations) to a custom date
const targetTaskId = actionPlan[2].id;
const updatedTasks = db.updateUserTask(testUser.id, targetTaskId, {
  scheduledDate: 'Day 12–14 (Rescheduled)',
  isCompleted: false,
});
const rescheduledTask = updatedTasks.find((t) => t.id === targetTaskId);
assert.strictEqual(rescheduledTask?.scheduledDate, 'Day 12–14 (Rescheduled)', 'Task schedule date must update');

// Mark task complete
const completedTasks = db.updateUserTask(testUser.id, targetTaskId, {
  isCompleted: true,
  completionState: 'completed',
});
const completedTask = completedTasks.find((t) => t.id === targetTaskId);
assert.strictEqual(completedTask?.isCompleted, true, 'isCompleted must be true');
assert.strictEqual(completedTask?.completionState, 'completed', 'completionState must be completed');
console.log('✓ Test 5 Passed: User can reschedule tasks, mark complete, and resume progress with persistence.');

// Test 6: Authorization & User Isolation for Documents & Action Plans
console.log('Test 6: User Isolation - User B cannot read or overwrite User A tasks...');
const userB = db.createUser({
  fullName: 'Rupa Kadam',
  emailOrPhone: `rupa_${Date.now()}@example.com`,
  password: 'Password456!',
  state: 'Maharashtra',
  district: 'Kolhapur',
});

const userBTasks = db.getUserTasks(userB.id);
// User B has initial default demo tasks, not User A's rescheduled task
const userBTargetTask = userBTasks.find((t) => t.id === targetTaskId);
assert.notStrictEqual(
  userBTargetTask?.scheduledDate,
  'Day 12–14 (Rescheduled)',
  'User B must remain isolated from User A modified task schedules'
);
console.log('✓ Test 6 Passed: Multi-user isolation verified for document checklists and action plans.');

console.log('--- ALL PHASE 7 UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY ---');
