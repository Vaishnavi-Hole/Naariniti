import assert from 'assert';
import { 
  evaluateSchemeEligibility, 
  evaluateAllSchemes, 
  validateSchemeRecordIntegrity, 
  OFFICIAL_PRELIMINARY_LEGAL_DISCLAIMER 
} from '../eligibility';

console.log('--- RUNNING PHASE 6: DETERMINISTIC ELIGIBILITY SERVICE TESTS ---');

// Test 1: Standard Eligible Profile (Sunita Tai: 30yo woman, Shirur Pune, food_snacks, ₹30,000 budget, ₹30,000 savings)
console.log('Test 1: Standard Eligible Profile (Sunita Pawar / Mudra Shishu & PMEGP)...');
const sunitaProfile = {
  age: '26-35',
  state: 'Maharashtra',
  district: 'Pune',
  isRural: true,
  sector: 'food_snacks',
  stage: 'planning',
  budgetInINR: 30000,
  availableInvestment: 30000,
  isWoman: true,
  isGreenfield: true,
  cibilOrCreditOk: true,
};

const mudraEval = evaluateSchemeEligibility('sch_mudra_shishu', sunitaProfile);
assert.strictEqual(mudraEval.overallStatus, 'eligible', 'Sunita must be eligible for Mudra Shishu');
assert(mudraEval.criteria.every((c) => c.status === 'pass'), 'All Mudra criteria must pass');
assert(mudraEval.preliminaryDisclaimer.includes('Preliminary automated assessment'), 'Disclaimer must be present');
console.log('✓ Test 1 Passed: Standard applicant passes all Mudra criteria deterministically.');

// Test 2: Ineligible Case - Stand-Up India minimum budget boundary (₹30,000 vs ₹10,00,000 minimum)
console.log('Test 2: Boundary & Ineligible Case - Stand-Up India minimum budget threshold...');
const standupEval = evaluateSchemeEligibility('sch_standup_india', sunitaProfile);
assert.strictEqual(standupEval.overallStatus, 'ineligible', 'Must fail overall due to mandatory budget requirement');

const minBudgetCrit = standupEval.criteria.find((c) => c.id === 'su_min_budget');
assert(minBudgetCrit !== undefined, 'Minimum budget criterion must exist');
assert.strictEqual(minBudgetCrit.status, 'fail', 'Criterion must fail because 30k < 10 Lakhs');
assert(minBudgetCrit.explanation.includes('minimum ticket size of ₹10,00,000'), 'Explanation must cite 10L threshold');
console.log('✓ Test 2 Passed: Ineligible applicant fails with clear rule violation.');

// Test 3: Stand-Up India Passing at Boundary (₹10 Lakhs)
console.log('Test 3: Stand-Up India Passing at Boundary (₹10,00,000 project)...');
const largeProject = {
  ...sunitaProfile,
  budgetInINR: 1000000, // Exactly ₹10 Lakhs
};
const standupPassing = evaluateSchemeEligibility('sch_standup_india', largeProject);
assert.strictEqual(standupPassing.overallStatus, 'eligible', 'Must pass Stand-Up India with 10L budget');
const passingBudgetCrit = standupPassing.criteria.find((c) => c.id === 'su_min_budget');
assert.strictEqual(passingBudgetCrit?.status, 'pass', '10 Lakhs is the inclusive lower bound');
console.log('✓ Test 3 Passed: Boundary value (₹10 Lakhs) passes successfully.');

// Test 4: Missing Information Must NEVER Treat as Passing (Unknown / Insufficient Data)
console.log('Test 4: Missing Information Handling (Never treat missing values as passing)...');
const emptyProfile = {};
const emptyMudraEval = evaluateSchemeEligibility('sch_mudra_shishu', emptyProfile);

assert.strictEqual(emptyMudraEval.overallStatus, 'insufficient_data', 'Missing age/sector/budget must yield insufficient_data');
assert(emptyMudraEval.missingInformation.length > 0, 'Must report missing fields');
assert(emptyMudraEval.missingInformation.includes('age'), 'Must record age as missing');
assert(emptyMudraEval.missingInformation.includes('sector'), 'Must record sector as missing');
assert(emptyMudraEval.missingInformation.includes('budgetInINR'), 'Must record budgetInINR as missing');

// Age criterion must be 'unknown', NOT 'pass'
const ageCrit = emptyMudraEval.criteria.find((c) => c.id === 'mudra_age');
assert.strictEqual(ageCrit?.status, 'unknown', 'Missing age must evaluate to unknown, NEVER pass');
console.log('✓ Test 4 Passed: Missing values evaluated as unknown and never assumed to pass.');

// Test 5: Underage Applicant Boundary (Age 17 vs 18)
console.log('Test 5: Underage Applicant Boundary (Age 17 vs 18)...');
const underageProfile = {
  ...sunitaProfile,
  age: 17,
};
const underageEval = evaluateSchemeEligibility('sch_mudra_shishu', underageProfile);
assert.strictEqual(underageEval.overallStatus, 'ineligible', 'Underage applicant must be ineligible');
const underageAgeCrit = underageEval.criteria.find((c) => c.id === 'mudra_age');
assert.strictEqual(underageAgeCrit?.status, 'fail', 'Age 17 must fail age criterion');

const adultProfile = {
  ...sunitaProfile,
  age: 18,
};
const adultEval = evaluateSchemeEligibility('sch_mudra_shishu', adultProfile);
const adultAgeCrit = adultEval.criteria.find((c) => c.id === 'mudra_age');
assert.strictEqual(adultAgeCrit?.status, 'pass', 'Age 18 must pass minimum age boundary');
console.log('✓ Test 5 Passed: Age boundaries (17 fail, 18 pass) verified deterministically.');

// Test 6: Sector Ineligibility (Agriculture vs Food Catering Scheme)
console.log('Test 6: Sector Mismatch Ineligibility...');
const agricultureProfile = {
  ...sunitaProfile,
  sector: 'agriculture_farming',
};
const annapurnaAgriEval = evaluateSchemeEligibility('sch_annapurna_food', agricultureProfile);
assert.strictEqual(annapurnaAgriEval.overallStatus, 'ineligible', 'Annapurna requires food sector');
const annapurnaSectorCrit = annapurnaAgriEval.criteria.find((c) => c.id === 'annapurna_sector');
assert.strictEqual(annapurnaSectorCrit?.status, 'fail', 'Agriculture sector must fail catering requirement');
console.log('✓ Test 6 Passed: Ineligible sector correctly rejected.');

// Test 7: Unverified Demonstration Scheme Handling
console.log('Test 7: Unverified Demonstration Scheme Handling...');
const demoEval = evaluateSchemeEligibility('sch_demo_pilot_grant', sunitaProfile);
assert.strictEqual(demoEval.isDemonstration, true, 'Must be flagged as demonstration');
assert.strictEqual(demoEval.isVerified, false, 'Must be flagged as unverified');
assert.strictEqual(demoEval.overallStatus, 'insufficient_data', 'Unverified demo records cannot grant official eligibility');
const demoCrit = demoEval.criteria.find((c) => c.id === 'demo_record_rule');
assert.strictEqual(demoCrit?.status, 'not_applicable', 'Demo record rule evaluated as not_applicable');
console.log('✓ Test 7 Passed: Unverified demo scheme safely handled with not-applicable state.');

// Test 8: Non-Fabrication & URL / Scheme ID Validation
console.log('Test 8: Scheme ID & Official Source URL Integrity Validation...');
assert.strictEqual(
  validateSchemeRecordIntegrity('sch_mudra_shishu', 'https://www.mudra.org.in'),
  true,
  'Verified Mudra URL must validate'
);
assert.strictEqual(
  validateSchemeRecordIntegrity('sch_mudra_shishu', 'https://fake-scam-loans.com'),
  false,
  'Hallucinated or spoofed URL must be rejected'
);
assert.strictEqual(
  validateSchemeRecordIntegrity('sch_invented_by_llm'),
  false,
  'Hallucinated scheme ID must be rejected'
);
console.log('✓ Test 8 Passed: URL and scheme ID integrity checks prevent model hallucinations.');

// Test 9: Preliminary Disclaimer & Evidence Citations Present on All Reports
console.log('Test 9: Verifying Preliminary Disclaimer and Evidence Citations...');
const allEvals = evaluateAllSchemes(sunitaProfile);
assert(allEvals.length >= 6, 'Must evaluate all catalog schemes');
for (const report of allEvals) {
  assert(
    report.preliminaryDisclaimer === OFFICIAL_PRELIMINARY_LEGAL_DISCLAIMER,
    'Each report must contain preliminary disclaimer'
  );
  assert(report.evidenceReferences.length > 0, 'Each report must cite evidence references');
  assert(report.officialSourceUrl.startsWith('https://'), 'Must have official https source URL');
}
console.log('✓ Test 9 Passed: All evaluation reports provide disclaimers and verified evidence.');

console.log('\n=============================================================');
console.log('ALL PHASE 6 DETERMINISTIC ELIGIBILITY TESTS PASSED (9/9)');
console.log('=============================================================\n');
