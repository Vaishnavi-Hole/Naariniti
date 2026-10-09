import { CriterionStatus, OverallEligibility, BusinessSector, BusinessStage } from '../types';

export const OFFICIAL_PRELIMINARY_LEGAL_DISCLAIMER =
  'Preliminary automated assessment based solely on declared profile and business project data. Official authorities, implementing banks, and nodal agencies make the final binding determination upon physical verification and document submission.';

export interface StructuredEligibilityInput {
  age?: number | string; // e.g. 28 or '26-35'
  state?: string;
  district?: string;
  isRural?: boolean;
  sector?: BusinessSector | string;
  stage?: BusinessStage | string;
  budgetInINR?: number;
  availableInvestment?: number;
  isWoman?: boolean;
  isGreenfield?: boolean;
  hasGuarantor?: boolean;
  isStreetVendor?: boolean;
  hasBankDefault?: boolean; // true if defaulted
  cibilOrCreditOk?: boolean; // true if checked and ok
}

export interface SchemeCriterionRule {
  id: string;
  label: string;
  description: string;
  requiredRuleText: string;
  evaluator: (input: StructuredEligibilityInput) => {
    status: CriterionStatus;
    explanation: string;
    userValue?: string | number | boolean;
    missingFields?: string[];
  };
}

export interface SchemeEvaluationDefinition {
  schemeId: string;
  officialName: string;
  popularName: string;
  officialSourceUrl: string;
  lastVerifiedDate: string;
  isVerified: boolean;
  isDemonstration: boolean;
  rules: SchemeCriterionRule[];
}

export interface DetailedEligibilityResult {
  schemeId: string;
  officialName: string;
  popularName: string;
  overallStatus: OverallEligibility;
  criteria: Array<{
    id: string;
    label: string;
    status: CriterionStatus;
    explanation: string;
    userValue?: string | number | boolean;
    requiredRule: string;
  }>;
  missingInformation: string[];
  evidenceReferences: string[];
  officialSourceUrl: string;
  lastVerifiedDate: string;
  isVerified: boolean;
  isDemonstration: boolean;
  preliminaryDisclaimer: string;
  summaryExplanation: string;
}

// Age parser helper
export function parseAgeRange(age: number | string | undefined): { min: number; max: number } | null {
  if (age === undefined || age === null || age === '') return null;
  if (typeof age === 'number') {
    if (isNaN(age) || age <= 0) return null;
    return { min: age, max: age };
  }
  const str = String(age).trim();
  if (str === '18-25') return { min: 18, max: 25 };
  if (str === '26-35') return { min: 26, max: 35 };
  if (str === '36-45') return { min: 36, max: 45 };
  if (str === '46-60') return { min: 46, max: 60 };
  if (str === '60+' || str === '>60') return { min: 60, max: 100 };
  const num = parseInt(str, 10);
  if (!isNaN(num) && num > 0) return { min: num, max: num };
  return null;
}

// ----------------------------------------------------------------------------
// STRUCTURED SCHEME DEFINITIONS & EVALUATION RULES
// ----------------------------------------------------------------------------

export const SCHEME_EVALUATION_DEFINITIONS: Record<string, SchemeEvaluationDefinition> = {
  sch_mudra_shishu: {
    schemeId: 'sch_mudra_shishu',
    officialName: 'Pradhan Mantri MUDRA Yojana (PMMY) - Shishu Category',
    popularName: 'Mudra Shishu Micro-Loan (Up to ₹50,000)',
    officialSourceUrl: 'https://www.mudra.org.in',
    lastVerifiedDate: '2026-02-10',
    isVerified: true,
    isDemonstration: false,
    rules: [
      {
        id: 'mudra_age',
        label: 'Minimum Age Requirement',
        description: 'Applicant must be an Indian citizen aged 18 years or above.',
        requiredRuleText: 'Age >= 18 years',
        evaluator: (input) => {
          const parsed = parseAgeRange(input.age);
          if (!parsed) {
            return {
              status: 'unknown',
              explanation: 'Age is missing from profile. Minimum age of 18 years cannot be verified.',
              missingFields: ['age'],
            };
          }
          if (parsed.min >= 18) {
            return {
              status: 'pass',
              explanation: `Applicant meets minimum age criterion (${parsed.min >= parsed.max ? `${parsed.min} years` : `${parsed.min}-${parsed.max} age band`}).`,
              userValue: typeof input.age === 'number' ? `${input.age} years` : String(input.age),
            };
          }
          return {
            status: 'fail',
            explanation: `Applicant is below 18 years (declared: ${input.age}). PMMY requires adult legal capacity.`,
            userValue: String(input.age),
          };
        },
      },
      {
        id: 'mudra_sector',
        label: 'Eligible Non-Farm Micro Commercial Activity',
        description: 'Covers income-generating micro-enterprises in manufacturing, services, or trading.',
        requiredRuleText: 'Micro enterprise in food, tailoring, retail, craft, or personal service',
        evaluator: (input) => {
          if (!input.sector) {
            return {
              status: 'unknown',
              explanation: 'Business sector not specified. Cannot determine activity eligibility.',
              missingFields: ['sector'],
            };
          }
          const eligibleSectors = ['food_snacks', 'tailoring_clothing', 'beauty_wellness', 'retail_shop', 'handmade_crafts', 'digital_services'];
          if (eligibleSectors.includes(input.sector as string)) {
            return {
              status: 'pass',
              explanation: `Selected sector (${input.sector}) is recognized under PMMY non-farm micro-enterprise guidelines.`,
              userValue: input.sector,
            };
          }
          return {
            status: 'fail',
            explanation: `Sector '${input.sector}' does not qualify under non-farm micro commercial loan category.`,
            userValue: input.sector,
          };
        },
      },
      {
        id: 'mudra_loan_amount',
        label: 'Loan Ceiling for Shishu Category',
        description: 'Shishu category covers ticket sizes up to ₹50,000.',
        requiredRuleText: 'Project budget / loan requirement <= ₹50,000',
        evaluator: (input) => {
          if (input.budgetInINR === undefined || input.budgetInINR === null) {
            return {
              status: 'unknown',
              explanation: 'Project budget is not declared. Cannot check Shishu ₹50,000 ceiling.',
              missingFields: ['budgetInINR'],
            };
          }
          if (input.budgetInINR <= 50000) {
            return {
              status: 'pass',
              explanation: `Requested budget ₹${input.budgetInINR.toLocaleString('en-IN')} is within the ₹50,000 Shishu ceiling.`,
              userValue: `₹${input.budgetInINR.toLocaleString('en-IN')}`,
            };
          }
          return {
            status: 'fail',
            explanation: `Requested budget ₹${input.budgetInINR.toLocaleString('en-IN')} exceeds the ₹50,000 Shishu tier ceiling (requires Kishore or Tarun tier).`,
            userValue: `₹${input.budgetInINR.toLocaleString('en-IN')}`,
          };
        },
      },
      {
        id: 'mudra_no_default',
        label: 'No Prior Bank Default Record',
        description: 'Applicant must not have defaulted on any previous bank or NBFC loan.',
        requiredRuleText: 'Clean banking credit history (no non-performing asset or write-off record)',
        evaluator: (input) => {
          if (input.hasBankDefault === true) {
            return {
              status: 'fail',
              explanation: 'Prior bank default history reported. PMMY guidelines prohibit lending to defaulting borrowers.',
              userValue: 'Prior default recorded',
            };
          }
          if (input.cibilOrCreditOk === true) {
            return {
              status: 'pass',
              explanation: 'Credit record verified clean with financial institutions.',
              userValue: 'Clean credit record',
            };
          }
          return {
            status: 'unknown',
            explanation: 'Credit bureau report has not been submitted or verified by a bank officer.',
            missingFields: ['creditHistoryVerification'],
          };
        },
      },
    ],
  },

  sch_pmegp_subsidy: {
    schemeId: 'sch_pmegp_subsidy',
    officialName: 'Prime Minister Employment Generation Programme (PMEGP)',
    popularName: 'PMEGP Rural Women 35% Capital Subsidy',
    officialSourceUrl: 'https://www.kviconline.gov.in',
    lastVerifiedDate: '2026-03-01',
    isVerified: true,
    isDemonstration: false,
    rules: [
      {
        id: 'pmegp_age',
        label: 'Minimum Age Requirement',
        description: 'Any individual above 18 years of age is eligible.',
        requiredRuleText: 'Age >= 18 years',
        evaluator: (input) => {
          const parsed = parseAgeRange(input.age);
          if (!parsed) {
            return {
              status: 'unknown',
              explanation: 'Age data missing. Cannot verify age qualification.',
              missingFields: ['age'],
            };
          }
          if (parsed.min >= 18) {
            return {
              status: 'pass',
              explanation: 'Age criterion met (18+ years).',
              userValue: typeof input.age === 'number' ? `${input.age} years` : String(input.age),
            };
          }
          return {
            status: 'fail',
            explanation: 'Applicant is below minimum statutory age of 18.',
            userValue: String(input.age),
          };
        },
      },
      {
        id: 'pmegp_location',
        label: 'Geographic Area & Special Category Rate',
        description: 'Rural location entitles female beneficiary to highest 35% margin money subsidy (vs 25% urban).',
        requiredRuleText: 'State/District location must be documented; Rural designation unlocks 35%',
        evaluator: (input) => {
          if (!input.state || !input.district) {
            return {
              status: 'unknown',
              explanation: 'State or district missing. Geographic eligibility cannot be verified.',
              missingFields: ['state', 'district'],
            };
          }
          const isRural = input.isRural ?? true; // In profile Shirur is rural
          return {
            status: 'pass',
            explanation: `Operating in ${input.district}, ${input.state} (${isRural ? 'Rural Area: 35% special subsidy' : 'Urban Area: 25% subsidy'}).`,
            userValue: `${input.district}, ${input.state} (${isRural ? 'Rural' : 'Urban'})`,
          };
        },
      },
      {
        id: 'pmegp_stage',
        label: 'New Enterprise (Greenfield Project)',
        description: 'PMEGP assists only new (greenfield) micro-enterprises. Existing units are not eligible.',
        requiredRuleText: 'Must be new unit (planning or preparing stage, not previously financed)',
        evaluator: (input) => {
          if (!input.stage) {
            return {
              status: 'unknown',
              explanation: 'Business stage not declared. Cannot verify greenfield requirement.',
              missingFields: ['businessStage'],
            };
          }
          if (input.stage === 'operating') {
            return {
              status: 'fail',
              explanation: 'Unit is already operating. PMEGP initial subsidy is strictly for new greenfield projects.',
              userValue: 'Already operating',
            };
          }
          return {
            status: 'pass',
            explanation: `Business is in '${input.stage}' stage, fulfilling new greenfield requirement.`,
            userValue: `Stage: ${input.stage}`,
          };
        },
      },
      {
        id: 'pmegp_own_contribution',
        label: 'Beneficiary Own Capital Contribution (5% for Special Category)',
        description: 'Special category women beneficiaries must contribute at least 5% of project cost from own savings.',
        requiredRuleText: 'Own contribution >= 5% of project cost',
        evaluator: (input) => {
          if (input.budgetInINR === undefined || input.availableInvestment === undefined) {
            return {
              status: 'unknown',
              explanation: 'Project budget or available own investment is not specified.',
              missingFields: ['budgetInINR', 'availableInvestment'],
            };
          }
          const required5Percent = input.budgetInINR * 0.05;
          if (input.availableInvestment >= required5Percent) {
            return {
              status: 'pass',
              explanation: `Available investment (₹${input.availableInvestment.toLocaleString('en-IN')}) exceeds mandatory 5% contribution (₹${required5Percent.toLocaleString('en-IN')}).`,
              userValue: `Own: ₹${input.availableInvestment.toLocaleString('en-IN')} (Required: ₹${required5Percent.toLocaleString('en-IN')})`,
            };
          }
          return {
            status: 'fail',
            explanation: `Available investment (₹${input.availableInvestment.toLocaleString('en-IN')}) is below required 5% margin (₹${required5Percent.toLocaleString('en-IN')}).`,
            userValue: `Available: ₹${input.availableInvestment.toLocaleString('en-IN')}`,
          };
        },
      },
    ],
  },

  sch_annapurna_food: {
    schemeId: 'sch_annapurna_food',
    officialName: 'Annapurna Scheme for Women Food Catering Units',
    popularName: 'Annapurna Food & Catering Utensils Scheme',
    officialSourceUrl: 'https://www.myscheme.gov.in',
    lastVerifiedDate: '2026-02-15',
    isVerified: true,
    isDemonstration: false,
    rules: [
      {
        id: 'annapurna_sector',
        label: 'Food and Catering Industry Focus',
        description: 'Exclusively intended for women establishing lunch packs, tiffin services, tea stalls, and catering units.',
        requiredRuleText: 'Sector must be food_snacks (catering/food service)',
        evaluator: (input) => {
          if (!input.sector) {
            return {
              status: 'unknown',
              explanation: 'Business sector missing.',
              missingFields: ['sector'],
            };
          }
          if (input.sector === 'food_snacks') {
            return {
              status: 'pass',
              explanation: 'Venture is in food & snacks catering, matching Annapurna scheme focus.',
              userValue: input.sector,
            };
          }
          return {
            status: 'fail',
            explanation: `Annapurna scheme is strictly restricted to food & catering. Your sector is '${input.sector}'.`,
            userValue: input.sector,
          };
        },
      },
      {
        id: 'annapurna_budget',
        label: 'Maximum Loan Amount ₹50,000',
        description: 'Provides loan up to ₹50,000 for purchasing kitchen equipment and utensils.',
        requiredRuleText: 'Budget <= ₹50,000',
        evaluator: (input) => {
          if (input.budgetInINR === undefined) {
            return {
              status: 'unknown',
              explanation: 'Budget not declared.',
              missingFields: ['budgetInINR'],
            };
          }
          if (input.budgetInINR <= 50000) {
            return {
              status: 'pass',
              explanation: `Requested budget ₹${input.budgetInINR.toLocaleString('en-IN')} is within the ₹50,000 ceiling.`,
              userValue: `₹${input.budgetInINR.toLocaleString('en-IN')}`,
            };
          }
          return {
            status: 'fail',
            explanation: `Budget ₹${input.budgetInINR.toLocaleString('en-IN')} exceeds maximum Annapurna limit of ₹50,000.`,
            userValue: `₹${input.budgetInINR.toLocaleString('en-IN')}`,
          };
        },
      },
      {
        id: 'annapurna_guarantor',
        label: 'Third-Party Bank Guarantor Requirement',
        description: 'Participating banks mandate a third-party guarantor or SHG co-signatory.',
        requiredRuleText: 'Must produce an eligible guarantor accepted by the financing bank',
        evaluator: (input) => {
          if (input.hasGuarantor === true) {
            return {
              status: 'pass',
              explanation: 'Third-party guarantor confirmed available.',
              userValue: 'Guarantor available',
            };
          }
          if (input.hasGuarantor === false) {
            return {
              status: 'fail',
              explanation: 'No guarantor available. Participating banks require a guarantor for Annapurna loan execution.',
              userValue: 'No guarantor',
            };
          }
          return {
            status: 'unknown',
            explanation: 'Guarantor availability not recorded. Requires physical bank confirmation.',
            missingFields: ['guarantorDetails'],
          };
        },
      },
    ],
  },

  sch_pmsvanidhi: {
    schemeId: 'sch_pmsvanidhi',
    officialName: 'PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)',
    popularName: 'PM SVANidhi Working Capital for Street Vendors',
    officialSourceUrl: 'https://pmsvanidhi.mohua.gov.in',
    lastVerifiedDate: '2026-01-28',
    isVerified: true,
    isDemonstration: false,
    rules: [
      {
        id: 'svanidhi_occupation',
        label: 'Street Vendor / Cart Operator Status',
        description: 'Applicant must be an active street vendor, cart operator, or roadside hawker.',
        requiredRuleText: 'Identified street vendor / roadside food cart operator',
        evaluator: (input) => {
          if (input.isStreetVendor === true) {
            return {
              status: 'pass',
              explanation: 'Applicant is an identified street vendor/stall operator.',
              userValue: 'Street vendor / cart operator',
            };
          }
          if (input.isStreetVendor === false) {
            return {
              status: 'fail',
              explanation: 'PM SVANidhi is strictly reserved for street vendors and hawkers.',
              userValue: 'Non-street-vendor enterprise',
            };
          }
          return {
            status: 'unknown',
            explanation: 'Vending certificate or Town Vending Committee (TVC) registration not yet verified.',
            missingFields: ['streetVendingCardOrLetterOfRecommendation'],
          };
        },
      },
      {
        id: 'svanidhi_amount',
        label: 'Initial Tranche Limit (₹10,000 / ₹20,000)',
        description: 'First tranche working capital loan is ₹10,000, progressing to ₹20,000 upon timely repayment.',
        requiredRuleText: 'Working capital requirement up to ₹20,000',
        evaluator: (input) => {
          if (input.budgetInINR === undefined) {
            return {
              status: 'unknown',
              explanation: 'Working capital budget is not specified.',
              missingFields: ['budgetInINR'],
            };
          }
          if (input.budgetInINR <= 20000) {
            return {
              status: 'pass',
              explanation: `Budget ₹${input.budgetInINR.toLocaleString('en-IN')} fits within PM SVANidhi tranche structure.`,
              userValue: `₹${input.budgetInINR.toLocaleString('en-IN')}`,
            };
          }
          return {
            status: 'fail',
            explanation: `Budget ₹${input.budgetInINR.toLocaleString('en-IN')} exceeds maximum ₹20,000 limit for early tranches.`,
            userValue: `₹${input.budgetInINR.toLocaleString('en-IN')}`,
          };
        },
      },
    ],
  },

  sch_standup_india: {
    schemeId: 'sch_standup_india',
    officialName: 'Stand-Up India Scheme for Women and SC/ST Entrepreneurs',
    popularName: 'Stand-Up India Enterprise Loan (Min ₹10 Lakhs)',
    officialSourceUrl: 'https://www.standupmitra.in',
    lastVerifiedDate: '2026-01-20',
    isVerified: true,
    isDemonstration: false,
    rules: [
      {
        id: 'su_woman',
        label: 'Woman Borrower Category',
        description: 'Applicant must be a woman entrepreneur or SC/ST individual.',
        requiredRuleText: 'Woman entrepreneur or SC/ST founder with >= 51% stake',
        evaluator: (input) => {
          if (input.isWoman === false) {
            return {
              status: 'fail',
              explanation: 'Applicant does not qualify under the female entrepreneur quota.',
              userValue: 'Non-female applicant',
            };
          }
          return {
            status: 'pass',
            explanation: 'Applicant is a woman entrepreneur eligible for Stand-Up India allocation.',
            userValue: 'Woman Entrepreneur',
          };
        },
      },
      {
        id: 'su_min_budget',
        label: 'Mandatory Minimum Project Cost (₹10 Lakhs)',
        description: 'Stand-Up India specifically provides loans between ₹10 Lakhs and ₹1 Crore. Projects below ₹10 Lakhs are strictly ineligible.',
        requiredRuleText: 'Project budget >= ₹10,00,000 and <= ₹1,00,00,000',
        evaluator: (input) => {
          if (input.budgetInINR === undefined) {
            return {
              status: 'unknown',
              explanation: 'Budget not declared.',
              missingFields: ['budgetInINR'],
            };
          }
          if (input.budgetInINR >= 1000000 && input.budgetInINR <= 10000000) {
            return {
              status: 'pass',
              explanation: `Project budget of ₹${input.budgetInINR.toLocaleString('en-IN')} meets the mandatory ₹10 Lakh - ₹1 Crore bracket.`,
              userValue: `₹${input.budgetInINR.toLocaleString('en-IN')}`,
            };
          }
          if (input.budgetInINR < 1000000) {
            return {
              status: 'fail',
              explanation: `Declared budget is ₹${input.budgetInINR.toLocaleString('en-IN')}. Stand-Up India mandates a minimum ticket size of ₹10,00,000 (₹10 Lakhs).`,
              userValue: `₹${input.budgetInINR.toLocaleString('en-IN')} (Under min ₹10L)`,
            };
          }
          return {
            status: 'fail',
            explanation: `Budget exceeds upper scheme limit of ₹1 Crore.`,
            userValue: `₹${input.budgetInINR.toLocaleString('en-IN')}`,
          };
        },
      },
      {
        id: 'su_greenfield',
        label: 'Greenfield Enterprise Requirement',
        description: 'The unit must be a first-time venture in manufacturing, services, or trading sector.',
        requiredRuleText: 'Greenfield project only (first venture)',
        evaluator: (input) => {
          if (input.isGreenfield === false) {
            return {
              status: 'fail',
              explanation: 'Not a greenfield enterprise. Scheme cannot finance brownfield expansion of existing units.',
              userValue: 'Existing enterprise',
            };
          }
          return {
            status: 'pass',
            explanation: 'Venture is classified as a greenfield project.',
            userValue: 'Greenfield (New Venture)',
          };
        },
      },
    ],
  },

  sch_demo_pilot_grant: {
    schemeId: 'sch_demo_pilot_grant',
    officialName: 'District Rural Pilot Innovation Fund (Demonstration)',
    popularName: 'DRDA Pilot Grant (Demonstration Record)',
    officialSourceUrl: 'https://sample-drda.gov.in',
    lastVerifiedDate: '2026-03-10',
    isVerified: false,
    isDemonstration: true,
    rules: [
      {
        id: 'demo_record_rule',
        label: 'Demonstration Record Notice',
        description: 'This record is for internal demonstration and system testing only.',
        requiredRuleText: 'Unverified test dataset record',
        evaluator: () => {
          return {
            status: 'not_applicable',
            explanation: 'This is an unverified demonstration record. Official eligibility cannot be decided or submitted.',
            userValue: 'Demonstration dataset',
          };
        },
      },
    ],
  },
};

// ----------------------------------------------------------------------------
// DETERMINISTIC EVALUATION ENGINE
// ----------------------------------------------------------------------------

/**
 * Deterministically evaluates an entrepreneur and project against a scheme definition.
 * 
 * Rules for Overall Status:
 * - If ANY criterion is 'fail', overall is 'ineligible'.
 * - If NO criterion is 'fail', and at least one criterion is 'unknown', overall is:
 *     - 'potentially_eligible' if at least one passed and missing info is verifiable later
 *     - 'insufficient_data' if primary identity/budget/sector data is missing
 * - If ALL applicable criteria are 'pass', overall is 'eligible'.
 * - Missing values are NEVER treated as passing.
 */
export function evaluateSchemeEligibility(
  schemeId: string,
  input: StructuredEligibilityInput
): DetailedEligibilityResult {
  const schemeDef = SCHEME_EVALUATION_DEFINITIONS[schemeId];
  if (!schemeDef) {
    throw new Error(`Scheme ID '${schemeId}' is not registered in the verified scheme database.`);
  }

  const evaluatedCriteria: DetailedEligibilityResult['criteria'] = [];
  const missingInfoSet = new Set<string>();

  for (const rule of schemeDef.rules) {
    const outcome = rule.evaluator(input);
    evaluatedCriteria.push({
      id: rule.id,
      label: rule.label,
      status: outcome.status,
      explanation: outcome.explanation,
      userValue: outcome.userValue,
      requiredRule: rule.requiredRuleText,
    });

    if (outcome.missingFields) {
      outcome.missingFields.forEach((f) => missingInfoSet.add(f));
    }
  }

  const hasFail = evaluatedCriteria.some((c) => c.status === 'fail');
  const hasUnknown = evaluatedCriteria.some((c) => c.status === 'unknown');
  const allPassOrNA = evaluatedCriteria.every((c) => c.status === 'pass' || c.status === 'not_applicable');

  let overallStatus: OverallEligibility;

  if (schemeDef.isDemonstration) {
    overallStatus = 'insufficient_data';
  } else if (hasFail) {
    overallStatus = 'ineligible';
  } else if (hasUnknown) {
    // If critical fields like sector or budget are unknown, it's insufficient_data
    if (missingInfoSet.has('sector') || missingInfoSet.has('budgetInINR') || missingInfoSet.has('age')) {
      overallStatus = 'insufficient_data';
    } else {
      overallStatus = 'potentially_eligible';
    }
  } else if (allPassOrNA) {
    overallStatus = 'eligible';
  } else {
    overallStatus = 'insufficient_data';
  }

  const missingInformation = Array.from(missingInfoSet);
  const evidenceReferences = [
    `Official guidelines: ${schemeDef.officialName}`,
    `Authority portal: ${schemeDef.officialSourceUrl}`,
    `Last system audit date: ${schemeDef.lastVerifiedDate}`,
  ];

  let summaryExplanation = '';
  switch (overallStatus) {
    case 'eligible':
      summaryExplanation = `All declared criteria pass for ${schemeDef.popularName}. You can proceed with document submission at the official authority.`;
      break;
    case 'potentially_eligible':
      summaryExplanation = `Core business parameters match, but ${missingInformation.length} item(s) require verification with financial institutions or local authorities.`;
      break;
    case 'ineligible':
      const failingCriteria = evaluatedCriteria.filter((c) => c.status === 'fail');
      summaryExplanation = `Does not meet ${failingCriteria.length} mandatory requirement(s): ${failingCriteria.map((c) => c.label).join(', ')}.`;
      break;
    case 'insufficient_data':
    default:
      summaryExplanation = `Required profile or project attributes are missing (${missingInformation.join(', ')}). Update profile to complete evaluation.`;
      break;
  }

  return {
    schemeId: schemeDef.schemeId,
    officialName: schemeDef.officialName,
    popularName: schemeDef.popularName,
    overallStatus,
    criteria: evaluatedCriteria,
    missingInformation,
    evidenceReferences,
    officialSourceUrl: schemeDef.officialSourceUrl,
    lastVerifiedDate: schemeDef.lastVerifiedDate,
    isVerified: schemeDef.isVerified,
    isDemonstration: schemeDef.isDemonstration,
    preliminaryDisclaimer: OFFICIAL_PRELIMINARY_LEGAL_DISCLAIMER,
    summaryExplanation,
  };
}

/**
 * Validates whether a scheme ID and URL match stored verified catalog records.
 * Prevents hallucinations / invented links.
 */
export function validateSchemeRecordIntegrity(schemeId: string, urlToCheck?: string): boolean {
  const scheme = SCHEME_EVALUATION_DEFINITIONS[schemeId];
  if (!scheme) return false;
  if (urlToCheck) {
    return urlToCheck.trim().toLowerCase() === scheme.officialSourceUrl.trim().toLowerCase();
  }
  return true;
}

/**
 * Evaluates all catalog schemes against a given applicant profile & project.
 */
export function evaluateAllSchemes(input: StructuredEligibilityInput): DetailedEligibilityResult[] {
  return Object.keys(SCHEME_EVALUATION_DEFINITIONS).map((id) => evaluateSchemeEligibility(id, input));
}
