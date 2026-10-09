import assert from 'assert';
import { db } from '../db';
import { generateToken, verifyToken } from '../auth';

console.log('--- RUNNING PHASE 2 AUTHENTICATION & OWNERSHIP TESTS ---');

// Test 1: User Signup & Password Hashing
console.log('Test 1: User Signup with salted PBKDF2 password hashing...');
const testEmail = `test_entrepreneur_${Date.now()}@example.com`;
const user1 = db.createUser({
  fullName: 'Kavita Shinde',
  emailOrPhone: testEmail,
  password: 'Password123!',
  state: 'Maharashtra',
  district: 'Nashik',
});
assert.strictEqual(user1.fullName, 'Kavita Shinde');
assert.strictEqual(user1.role, 'entrepreneur');
assert.notStrictEqual(user1.passwordHash, 'Password123!', 'Password MUST NOT be stored in plaintext');
assert(user1.salt && user1.salt.length > 10, 'Salt must be generated');
console.log('✓ Test 1 Passed: Password hashed securely with salt.');

// Test 2: Duplicate Prevention
console.log('Test 2: Prevent duplicate signup with same email/phone...');
assert.throws(() => {
  db.createUser({
    fullName: 'Duplicate User',
    emailOrPhone: testEmail,
    password: 'AnotherPassword',
  });
}, /already exists/);
console.log('✓ Test 2 Passed: Duplicate user registration rejected.');

// Test 3: Password Verification
console.log('Test 3: Password verification (correct vs wrong password)...');
const isCorrectPass = db.verifyPassword('Password123!', user1);
const isWrongPass = db.verifyPassword('WrongPassword!', user1);
assert.strictEqual(isCorrectPass, true, 'Correct password must verify');
assert.strictEqual(isWrongPass, false, 'Wrong password must fail');
console.log('✓ Test 3 Passed: Password validation logic verified.');

// Test 4: JWT Token Generation & Verification
console.log('Test 4: JWT Token signing and verification...');
const token = generateToken(user1);
assert(typeof token === 'string' && token.split('.').length === 3, 'Token must be valid 3-part JWT');
const payload = verifyToken(token);
assert(payload !== null, 'Token verification must succeed');
assert.strictEqual(payload?.userId, user1.id);
assert.strictEqual(payload?.role, 'entrepreneur');

// Tampered token test
const tamperedToken = token.substring(0, token.length - 4) + 'abcd';
const tamperedPayload = verifyToken(tamperedToken);
assert.strictEqual(tamperedPayload, null, 'Tampered token must be rejected');
console.log('✓ Test 4 Passed: JWT Token cryptographic verification working.');

// Test 5: Profile Isolation & Updates
console.log('Test 5: Profile Isolation between users...');
const profile1 = db.getProfile(user1.id);
assert(profile1 !== undefined, 'Profile must be automatically initialized');
assert.strictEqual(profile1?.state, 'Maharashtra');

db.updateProfile(user1.id, {
  villageTown: 'Niphad',
  availableInvestment: 45000,
});
const updatedP1 = db.getProfile(user1.id);
assert.strictEqual(updatedP1?.villageTown, 'Niphad');
assert.strictEqual(updatedP1?.availableInvestment, 45000);
console.log('✓ Test 5 Passed: Profile updates correctly persisted.');

// Test 6: Multi-User Project Isolation & Ownership Enforcement
console.log('Test 6: Business Project Isolation & Cross-User Security Enforcement...');
// Create a second user (Attacker / Unrelated User)
const user2 = db.createUser({
  fullName: 'Rohini Patil',
  emailOrPhone: `rohini_${Date.now()}@example.com`,
  password: 'Password456!',
});

// User 1 creates Project A
const projectA = db.createProject(user1.id, {
  title: 'Nashik Organic Grape Jam Stall',
  sector: 'food_snacks',
  ideaDescription: 'Homemade grape jams and fruit snacks near railway station',
  budgetInINR: 35000,
  targetDailyCustomers: 60,
  operationMode: 'stall',
  stage: 'planning',
  location: 'Niphad Market',
  hasEquipment: false,
  planCompletionPercentage: 30,
});
assert.strictEqual(projectA.userId, user1.id);

// User 1 can view their own projects
const user1Projects = db.getUserProjects(user1.id);
assert(user1Projects.some((p) => p.id === projectA.id));

// User 2 lists projects -> MUST NOT see User 1's project!
const user2Projects = db.getUserProjects(user2.id);
assert(!user2Projects.some((p) => p.id === projectA.id), "User 2 MUST NOT see User 1's project");

// User 2 attempts to direct-fetch User 1's project by ID -> MUST throw FORBIDDEN!
assert.throws(() => {
  db.getProjectById(projectA.id, user2.id);
}, /FORBIDDEN_PROJECT_ACCESS/, 'Unauthorized project read attempt must be blocked');

// User 2 attempts to update User 1's project -> MUST throw FORBIDDEN!
assert.throws(() => {
  db.updateProject(projectA.id, user2.id, { title: 'Hacked Title' });
}, /FORBIDDEN_PROJECT_ACCESS/, 'Unauthorized project update attempt must be blocked');

// User 2 attempts to delete User 1's project -> MUST throw FORBIDDEN!
assert.throws(() => {
  db.deleteProject(projectA.id, user2.id);
}, /FORBIDDEN_PROJECT_ACCESS/, 'Unauthorized project deletion attempt must be blocked');

console.log('✓ Test 6 Passed: Multi-user project isolation strictly enforced on backend.');

// Test 7: Multi-Project Management for Single User
console.log('Test 7: Support for multiple projects per user...');
const projectB = db.createProject(user1.id, {
  title: 'Nashik Khadi Alterations',
  sector: 'tailoring_clothing',
  ideaDescription: 'Home tailoring boutique',
  budgetInINR: 20000,
  targetDailyCustomers: 10,
  operationMode: 'home',
  stage: 'exploring',
  location: 'Home',
  hasEquipment: true,
  planCompletionPercentage: 15,
});
const updatedUser1Projects = db.getUserProjects(user1.id);
assert.strictEqual(updatedUser1Projects.length, 2, 'User 1 must now have 2 active projects');
console.log('✓ Test 7 Passed: User can create and manage multiple business projects.');

console.log('\n======================================================');
console.log('ALL PHASE 2 BACKEND & AUTHENTICATION TESTS PASSED (7/7)');
console.log('======================================================\n');
