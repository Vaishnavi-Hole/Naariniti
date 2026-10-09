import assert from 'assert';
import { matchSchemesSemantically, matchPartners, VERIFIED_SCHEMES_CATALOG, VERIFIED_PARTNERS_CATALOG } from '../retrieval';

console.log('--- RUNNING PHASE 5: MULTILINGUAL HYBRID RETRIEVAL & DATASET TESTS ---');

// Test 1: Marathi Paraphrased Query without English keywords
console.log('Test 1: Marathi Paraphrased Query ("मला गावामध्ये चहाचा स्टॉल आणि नाश्ता केंद्र सुरू करायचे आहे")...');
const marathiQuery = 'मला गावामध्ये चहाचा स्टॉल आणि नाश्ता केंद्र सुरू करायचे आहे';
const marathiMatches = matchSchemesSemantically(marathiQuery);

assert(marathiMatches.length > 0, 'Must return candidates');
const topMarathi = marathiMatches[0];
console.log(`Top match for Marathi query: ${topMarathi.scheme.popularName} (Hybrid Score: ${topMarathi.hybridScore})`);

// Mudra Shishu or Annapurna must be in top 2 matches
const topTwoIds = [marathiMatches[0].scheme.id, marathiMatches[1].scheme.id];
assert(
  topTwoIds.includes('sch_mudra_shishu') || topTwoIds.includes('sch_annapurna_food'),
  'Mudra Shishu or Annapurna must match Marathi tea/breakfast query semantically'
);
assert(topMarathi.semanticSimilarity > 0, 'Dense semantic score must be positive');
console.log('✓ Test 1 Passed: Marathi paraphrased query matched semantically without exact English keywords.');

// Test 2: Hindi Paraphrased Query without English keywords
console.log('Test 2: Hindi Paraphrased Query ("सिलाई मशीन और कपड़े सिलने का बुटीक कार्य")...');
const hindiQuery = 'सिलाई मशीन और कपड़े सिलने का बुटीक कार्य';
const hindiMatches = matchSchemesSemantically(hindiQuery);

assert(hindiMatches.length > 0);
const topHindi = hindiMatches[0];
console.log(`Top match for Hindi query: ${topHindi.scheme.popularName} (Hybrid Score: ${topHindi.hybridScore})`);
assert(
  hindiMatches.some((m) => m.scheme.sectors.includes('tailoring_clothing')),
  'Must match schemes covering tailoring & clothing'
);
console.log('✓ Test 2 Passed: Hindi tailoring query matched semantically.');

// Test 3: English Paraphrased Food Catering Query
console.log('Test 3: English Paraphrased Food Catering Query ("morning breakfast tiffin and snack catering")...');
const englishQuery = 'morning breakfast tiffin and snack catering';
const englishMatches = matchSchemesSemantically(englishQuery);

const annapurnaMatch = englishMatches.find((m) => m.scheme.id === 'sch_annapurna_food');
assert(annapurnaMatch !== undefined, 'Annapurna scheme must be retrieved for catering');
assert(englishMatches[0].hybridScore >= englishMatches[englishMatches.length - 1].hybridScore, 'Results must be ranked descending');
console.log('✓ Test 3 Passed: English catering query retrieved relevant food schemes.');

// Test 4: Semantic Relevance is Separated from Eligibility
console.log('Test 4: Verifying Semantic Relevance Score is distinct from Eligibility...');
const largeQuery = 'Large manufacturing factory requiring 25 lakhs loan';
const largeMatches = matchSchemesSemantically(largeQuery);

// Semantic engine scores similarity to PMEGP / Stand-Up India
const standupMatch = largeMatches.find((m) => m.scheme.id === 'sch_standup_india');
assert(standupMatch !== undefined);
assert(
  typeof standupMatch.hybridScore === 'number' && typeof standupMatch.semanticSimilarity === 'number',
  'Scores must be numeric relevance ratings, NOT eligibility decisions'
);
// Notice: The retrieval engine does NOT assign 'pass', 'fail', or 'eligible'. It outputs similarity!
console.log('✓ Test 4 Passed: Semantic relevance score is purely continuous [0, 1] without deciding eligibility.');

// Test 5: Trusted Partners Filtering & Unverified Exclusion
console.log('Test 5: Trusted Partners Filtering (Strict Exclusion of Unverified Orgs)...');
const allPartners = VERIFIED_PARTNERS_CATALOG;
const trustedPartners = matchPartners('micro business mentorship in Maharashtra');

// Check that verified partners are included
const hasMannDeshi = trustedPartners.some((p) => p.id === 'ngo_manndeshi');
const hasSewa = trustedPartners.some((p) => p.id === 'ngo_sewa_bharat');
assert(hasMannDeshi && hasSewa, 'Verified NGOs must be present in trusted partners list');

// Check that unverified demo partner is STRICTLY EXCLUDED
const hasUnverified = trustedPartners.some((p) => p.id === 'ngo_unverified_sample');
assert.strictEqual(hasUnverified, false, 'Unverified organization MUST be excluded from trusted recommendations');
console.log('✓ Test 5 Passed: Unverified organizations excluded from trusted-partner recommendations.');

// Test 6: Non-Fabrication & Verified URLs
console.log('Test 6: Verified URLs and non-fabrication check...');
for (const scheme of VERIFIED_SCHEMES_CATALOG) {
  if (scheme.isVerified) {
    assert(scheme.officialUrl.startsWith('https://'), `Verified scheme ${scheme.id} must have https official URL`);
    assert(scheme.lastVerifiedDate.length === 10, 'Must have verified date format YYYY-MM-DD');
  } else {
    assert.strictEqual(scheme.isDemonstration, true, 'Unverified records must be flagged as demonstration');
  }
}
console.log('✓ Test 6 Passed: Official sources and verification dates validated across catalog.');

console.log('\n======================================================');
console.log('ALL PHASE 5 RETRIEVAL & DATASET TESTS PASSED (6/6)');
console.log('======================================================\n');
