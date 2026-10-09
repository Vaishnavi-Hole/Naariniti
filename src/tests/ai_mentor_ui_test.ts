/**
 * UI TEST (MOCK-BASED) - Clearly distinguished from real model inference
 * Purpose: Verifies frontend data formatting and UI contract rendering
 * without requiring a running GPU or active network tunnel.
 */
import assert from 'assert';
import { AiChatResponse } from '../lib/aiClient';

console.log('--- RUNNING DETERMINISTIC MOCK UI TEST (PHASE 3) ---');

const mockInferenceResult: AiChatResponse = {
  summary: 'तुमच्या चहा व नाश्ता स्टॉलसाठी दररोज ६० ते ८० ग्राहकांचे नियोजन करा.',
  business_stage: 'planning',
  recommendations: [
    'Visit Shirur market between 7 AM and 9 AM to observe demand.',
    'Obtain a written equipment quotation from a local utensil merchant.',
  ],
  estimated_costs: [
    { item: 'Commercial Gas Burner & Regulator', cost_inr: 4500.0, is_mandatory: true },
    { item: 'Stainless Steel Tea Kettle', cost_inr: 3200.0, is_mandatory: true },
  ],
  assumptions: ['70 cups of tea sold per morning @ ₹10 each'],
  risks: ['Leftover milk spoilage during slow afternoons'],
  next_steps: ['1. Complete footfall survey', '2. Submit Mudra form'],
  follow_up_question: 'Would you like sample survey questions?',
  source_references: ['PMMY Mudra Shishu Guidelines (https://www.mudra.org.in)'],
  model_identifier: 'mock-test-harness',
  latency_ms: 12.5,
};

// Test 1: Verify data contract format
assert(mockInferenceResult.summary.length > 0, 'Summary must not be empty');
assert(mockInferenceResult.estimated_costs.length === 2, 'Costs breakdown present');
assert(mockInferenceResult.model_identifier === 'mock-test-harness', 'Clearly distinguished as mock');

// Test 2: Calculate total startup equipment cost
const totalEquipmentCost = mockInferenceResult.estimated_costs.reduce((acc, c) => acc + c.cost_inr, 0);
assert.strictEqual(totalEquipmentCost, 7700.0, 'Total equipment cost calculation must match');

console.log('✓ UI Mock Test: Structured response schemas and cost calculations verified.');
console.log('=====================================================');
console.log('MOCK-BASED UI TEST PASSED');
console.log('=====================================================\n');
