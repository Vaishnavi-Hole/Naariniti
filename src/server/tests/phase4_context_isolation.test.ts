import assert from 'assert';
import { db } from '../db';

console.log('--- RUNNING PHASE 4: CONTEXT MEMORY & BUSINESS PROJECT ISOLATION TESTS ---');

// Setup: Create 2 Users
const userA = db.createUser({
  fullName: 'Mangal Kamble',
  emailOrPhone: `mangal_${Date.now()}@example.com`,
  password: 'Password123!',
});

const userB = db.createUser({
  fullName: 'Seema Jadhav',
  emailOrPhone: `seema_${Date.now()}@example.com`,
  password: 'Password456!',
});

// User A creates 2 distinct business projects: Project 1 (Tea Stall) and Project 2 (Tailoring)
const projectA1 = db.createProject(userA.id, {
  title: 'Mangal Tea Corner',
  sector: 'food_snacks',
  ideaDescription: 'Morning breakfast tea stall',
  budgetInINR: 30000,
  targetDailyCustomers: 70,
  operationMode: 'stall',
  stage: 'planning',
  location: 'Shirur',
  hasEquipment: false,
  planCompletionPercentage: 35,
});

const projectA2 = db.createProject(userA.id, {
  title: 'Mangal Tailoring Works',
  sector: 'tailoring_clothing',
  ideaDescription: 'Home blouse stitching boutique',
  budgetInINR: 20000,
  targetDailyCustomers: 10,
  operationMode: 'home',
  stage: 'exploring',
  location: 'Shirur',
  hasEquipment: true,
  planCompletionPercentage: 10,
});

// Test 1: Add conversation messages to Project A1
console.log('Test 1: Adding conversation messages to Project A1 (Tea Stall)...');
db.addProjectMessage(
  projectA1.id,
  userA.id,
  'user',
  'What is the price of a commercial tea burner in Shirur?'
);
db.addProjectMessage(
  projectA1.id,
  userA.id,
  'assistant',
  'A standard commercial burner costs ₹4,000 to ₹4,500.',
  { estimated_costs: [{ item: 'Commercial Burner', cost_inr: 4500 }] }
);

const convA1 = db.getProjectConversation(projectA1.id, userA.id);
assert.strictEqual(convA1.messages.length, 2, 'Project A1 must have 2 messages');
assert(convA1.messages[0].content.includes('tea burner'));
console.log('✓ Test 1 Passed: Project A1 conversation messages stored.');

// Test 2: Project-Level Isolation (Same User, Different Projects)
console.log('Test 2: Verifying Project-Level Isolation (Project A1 vs Project A2)...');
db.addProjectMessage(
  projectA2.id,
  userA.id,
  'user',
  'How much do high-speed tailoring scissors and sewing machine oil cost?'
);

const convA2 = db.getProjectConversation(projectA2.id, userA.id);
assert.strictEqual(convA2.messages.length, 1, 'Project A2 must only have its own 1 message');
assert(convA2.messages[0].content.includes('tailoring scissors'));

// Confirm Project A1 still only has its tea stall messages and NEVER tailoring messages!
const convA1Check = db.getProjectConversation(projectA1.id, userA.id);
assert.strictEqual(convA1Check.messages.length, 2, 'Project A1 must strictly retain its 2 messages');
assert(!convA1Check.messages.some((m) => m.content.includes('tailoring scissors')), 'Project A1 must NOT contain Project A2 context!');
console.log('✓ Test 2 Passed: Strict project isolation confirmed for the same user.');

// Test 3: User-Level Isolation & Security (Cross-User Access Prohibition)
console.log('Test 3: Cross-User Security (User B attempts to access User A’s conversation)...');
assert.throws(() => {
  db.getProjectConversation(projectA1.id, userB.id);
}, /FORBIDDEN_PROJECT_ACCESS/, 'Unauthorized conversation read must be rejected');

assert.throws(() => {
  db.addProjectMessage(projectA1.id, userB.id, 'user', 'Injected unauthorized message');
}, /FORBIDDEN_PROJECT_ACCESS/, 'Unauthorized message injection must be rejected');

console.log('✓ Test 3 Passed: User B is strictly prohibited from accessing User A’s conversation.');

// Test 4: Structured Business Plan Creation, Modification & Assumptions
console.log('Test 4: Structured Business Plan generation, editing, and assumptions...');
const initialPlan = {
  concept: 'Roadside morning tea and poha stall',
  estimated_startup_costs: [
    { item: 'Commercial Gas Burner', cost_inr: 4500, is_mandatory: true },
    { item: 'Stainless Steel Kettle', cost_inr: 3200, is_mandatory: true },
  ],
  working_capital_7_days: 4500,
  pricing_strategy: '₹10 tea, ₹20 poha',
  break_even_units_daily: 35,
  daily_revenue_estimate: 1400,
  monthly_net_profit_estimate: 15400,
  assumptions: ['70 cups of tea daily', '26 working days'],
};

db.saveProjectBusinessPlan(projectA1.id, userA.id, initialPlan, false);
const savedPlan = db.getProjectBusinessPlan(projectA1.id, userA.id);
assert(savedPlan !== null);
assert.strictEqual(savedPlan?.isEdited, false);
assert.strictEqual(savedPlan?.planData.estimated_startup_costs[0].cost_inr, 4500);

// User edits figure (burners found for ₹3,800 locally)
const editedPlan = {
  ...initialPlan,
  estimated_startup_costs: [
    { item: 'Commercial Gas Burner (Discounted in Shirur Market)', cost_inr: 3800, is_mandatory: true },
    { item: 'Stainless Steel Kettle', cost_inr: 3200, is_mandatory: true },
  ],
};
db.saveProjectBusinessPlan(projectA1.id, userA.id, editedPlan, true);
const updatedPlan = db.getProjectBusinessPlan(projectA1.id, userA.id);
assert.strictEqual(updatedPlan?.isEdited, true, 'isEdited flag must be true after user edit');
assert.strictEqual(updatedPlan?.planData.estimated_startup_costs[0].cost_inr, 3800);

// Cross-user plan protection
assert.throws(() => {
  db.getProjectBusinessPlan(projectA1.id, userB.id);
}, /FORBIDDEN_PROJECT_ACCESS/);
console.log('✓ Test 4 Passed: Structured business plan stored, edited, and isolated.');

// Test 5: Context Window Memory Bounding (Limit to 10 recent messages)
console.log('Test 5: Context Window Bounding (Preventing indefinite context blowup)...');
for (let i = 1; i <= 15; i++) {
  db.addProjectMessage(projectA1.id, userA.id, 'user', `Step question ${i}`);
}
const boundedConv = db.getProjectConversation(projectA1.id, userA.id);
assert.strictEqual(boundedConv.messages.length, 10, 'Messages must be capped to latest 10 items');
assert.strictEqual(boundedConv.messages[9].content, 'Step question 15', 'Latest message must be retained');
console.log('✓ Test 5 Passed: Context memory correctly bounds history.');

console.log('\n======================================================');
console.log('ALL PHASE 4 CONTEXT & ISOLATION TESTS PASSED (5/5)');
console.log('======================================================\n');
