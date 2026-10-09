import { 
  DocumentItem, 
  ActionPlanTask, 
  EntrepreneurProfile, 
  BusinessProject, 
  GovernmentScheme 
} from '../types';
import { VERIFIED_GOVERNMENT_SCHEMES } from '../lib/constants';

/**
 * Verified Official Scheme Requirements Knowledge Base
 * Defines strict requirements with 'mandatory', 'conditional', or 'optional' tags
 * grounded in official scheme circulars and verified government portals.
 */
export interface SchemeVerifiedDocumentRule {
  id: string;
  name: string;
  purpose: string;
  requirementType: 'mandatory' | 'conditional' | 'optional';
  conditionNote?: string;
  howToObtain: string;
  issuingAuthority: string;
  officialReferenceUrl: string;
}

export const VERIFIED_SCHEME_DOCUMENT_REQUIREMENTS: Record<string, SchemeVerifiedDocumentRule[]> = {
  sch_mudra_shishu: [
    {
      id: 'doc_aadhaar',
      name: 'Aadhaar Card (Linked with Active Mobile Number)',
      purpose: 'Primary identity verification and digital e-KYC compliance for banking loan sanction',
      requirementType: 'mandatory',
      howToObtain: 'Available with applicant. Ensure mobile number is active to receive UIDAI OTP.',
      issuingAuthority: 'Unique Identification Authority of India (UIDAI)',
      officialReferenceUrl: 'https://myaadhaar.uidai.gov.in',
    },
    {
      id: 'doc_bank_passbook',
      name: 'Savings Bank Passbook / Bank Statement (Last 6 Months)',
      purpose: 'Proof of active bank account and financial transaction history for loan credit assessment',
      requirementType: 'mandatory',
      howToObtain: 'Get passbook printed or download stamped bank statement from your local bank branch.',
      issuingAuthority: 'Scheduled Commercial Bank / Gramin Bank',
      officialReferenceUrl: 'https://www.mudra.org.in',
    },
    {
      id: 'doc_passport_photos',
      name: 'Two Recent Passport-Size Photographs',
      purpose: 'Attached to physical 1-page Mudra application form for bank KYC dossier',
      requirementType: 'mandatory',
      howToObtain: 'Visit any local photo studio in town/market for 2 color passport photographs.',
      issuingAuthority: 'Applicant Self-Submission',
      officialReferenceUrl: 'https://www.mudra.org.in',
    },
    {
      id: 'doc_quotation_equipment',
      name: 'Itemized Vendor Quotation for Equipment & Machinery',
      purpose: 'Verification of asset purchase cost for direct disbursement to equipment supplier',
      requirementType: 'conditional',
      conditionNote: 'Required only when loan funds are sought for purchasing machinery, utensils, or equipment (capital expenditure).',
      howToObtain: 'Request a formal written estimate/proforma invoice from the local machinery or utensil dealer.',
      issuingAuthority: 'Registered Equipment Merchant / Supplier',
      officialReferenceUrl: 'https://www.mudra.org.in',
    },
    {
      id: 'doc_pan_card',
      name: 'PAN Card or Form 60',
      purpose: 'Tax identification; required for commercial business account opening under RBI guidelines',
      requirementType: 'conditional',
      conditionNote: 'PAN card required if available; otherwise Form 60 declaration is accepted for Shishu loans below ₹50,000.',
      howToObtain: 'Apply online at NSDL/UTIITSL or submit Form 60 declaration directly at the bank counter.',
      issuingAuthority: 'Income Tax Department of India',
      officialReferenceUrl: 'https://www.incometax.gov.in',
    },
    {
      id: 'doc_caste_certificate',
      name: 'Caste Certificate (SC / ST / OBC / Minority)',
      purpose: 'Substantiating special target category allocations and priority lending reporting',
      requirementType: 'conditional',
      conditionNote: 'Required only if claiming priority lending category under SC/ST/OBC/Minority allocations.',
      howToObtain: 'Tehsildar office / MahaOnline portal / Citizen facilitation centre (Aaple Sarkar).',
      issuingAuthority: 'Revenue Department / Sub-Divisional Officer',
      officialReferenceUrl: 'https://aaplesarkar.mahaonline.gov.in',
    },
    {
      id: 'doc_udyam_registration',
      name: 'Udyam Registration Certificate (Micro Enterprise)',
      purpose: 'Official MSME recognition providing priority lending benefits and interest subvention tracking',
      requirementType: 'optional',
      conditionNote: 'Not legally mandatory for Shishu loan sanction up to ₹50,000, but highly recommended for expedited processing.',
      howToObtain: 'Free instant online registration using Aadhaar and mobile OTP on the official portal.',
      issuingAuthority: 'Ministry of Micro, Small and Medium Enterprises (MSME)',
      officialReferenceUrl: 'https://udyamregistration.gov.in',
    },
  ],

  sch_pmegp: [
    {
      id: 'doc_aadhaar',
      name: 'Aadhaar Card',
      purpose: 'Applicant identity and Aadhaar-authenticated e-sign on PMEGP online e-portal',
      requirementType: 'mandatory',
      howToObtain: 'Applicant Aadhaar with active linked mobile.',
      issuingAuthority: 'UIDAI',
      officialReferenceUrl: 'https://myaadhaar.uidai.gov.in',
    },
    {
      id: 'doc_dpr',
      name: 'Detailed Project Report (DPR) / Business Project Plan',
      purpose: 'Technical and financial viability evaluation for loan sanction and 35% margin subsidy',
      requirementType: 'mandatory',
      howToObtain: 'Draft project report showing cost of project, capital expenditure, working capital, and projected cash flow.',
      issuingAuthority: 'Prepared by Entrepreneur / KVIC Template / Nariniti AI Mentor',
      officialReferenceUrl: 'https://www.kviconline.gov.in/pmegpeportal',
    },
    {
      id: 'doc_education_certificate',
      name: '8th Standard Passing Certificate or School Leaving Certificate',
      purpose: 'Statutory educational qualification proof for PMEGP projects above ₹10 Lakhs in manufacturing or ₹5 Lakhs in service',
      requirementType: 'conditional',
      conditionNote: 'Mandatory only for manufacturing projects above ₹10 Lakhs or service projects above ₹5 Lakhs.',
      howToObtain: 'School or board certificate.',
      issuingAuthority: 'State Education Board / School Headmaster',
      officialReferenceUrl: 'https://www.kviconline.gov.in',
    },
    {
      id: 'doc_rural_certificate',
      name: 'Rural Area Certificate / Gram Panchayat Residence Proof',
      purpose: 'Claiming higher 35% rural margin money subsidy rate vs 25% urban subsidy rate',
      requirementType: 'conditional',
      conditionNote: 'Required to obtain the elevated 35% rural subsidy rate rather than the standard 25% urban rate.',
      howToObtain: 'Gram Sevak / Village Sarpanch / Block Development Officer certificate.',
      issuingAuthority: 'Gram Panchayat / Rural Development Dept',
      officialReferenceUrl: 'https://www.kviconline.gov.in',
    },
    {
      id: 'doc_special_category_certificate',
      name: 'Special Category / Woman Entrepreneur Certificate',
      purpose: 'Verification for special 35% subsidy rate and 5% beneficiary own-contribution tier',
      requirementType: 'mandatory',
      howToObtain: 'Proof of identity as female applicant / caste certificate / disability certificate if applicable.',
      issuingAuthority: 'Competent State Authority',
      officialReferenceUrl: 'https://www.kviconline.gov.in',
    },
    {
      id: 'doc_edp_training',
      name: 'Entrepreneurship Development Programme (EDP) Certificate',
      purpose: 'Mandatory training completion before release of final subsidy installment',
      requirementType: 'conditional',
      conditionNote: 'Must be completed through RSETI / online KVIC e-portal before subsidy disbursement.',
      howToObtain: 'Attend 5-day / 10-day physical training at RSETI or complete accredited online EDP modules.',
      issuingAuthority: 'KVIC / RSETI / Ministry of MSME',
      officialReferenceUrl: 'https://www.kviconline.gov.in',
    },
  ],

  sch_annapurna_food: [
    {
      id: 'doc_aadhaar',
      name: 'Aadhaar Card',
      purpose: 'Proof of identity and residential status',
      requirementType: 'mandatory',
      howToObtain: 'Applicant Aadhaar card.',
      issuingAuthority: 'UIDAI',
      officialReferenceUrl: 'https://myaadhaar.uidai.gov.in',
    },
    {
      id: 'doc_residence_certificate',
      name: 'Domicile or Residence Certificate / Ration Card',
      purpose: 'Verification of state residency for state social welfare board quota',
      requirementType: 'mandatory',
      howToObtain: 'Tehsildar office / MahaOnline portal / Ration Card copy.',
      issuingAuthority: 'State Revenue Department',
      officialReferenceUrl: 'https://aaplesarkar.mahaonline.gov.in',
    },
    {
      id: 'doc_kitchen_quotation',
      name: 'Kitchen Utensils & Gas Connection Quotation',
      purpose: 'Itemized vendor estimate for utensils, stoves, cookware, and water containers up to ₹50,000',
      requirementType: 'mandatory',
      howToObtain: 'Obtain from local utensils merchant or commercial gas dealer.',
      issuingAuthority: 'Local Utensils Supplier',
      officialReferenceUrl: 'https://www.myscheme.gov.in',
    },
    {
      id: 'doc_guarantor_consent',
      name: 'Third-Party Guarantor Consent Form & Identity Proof',
      purpose: 'Bank requirement providing surety for Annapurna food loan repayment',
      requirementType: 'mandatory',
      howToObtain: 'Guarantor signature, Aadhaar, and income proof on bank loan guarantee format.',
      issuingAuthority: 'Guarantor / Financing Bank',
      officialReferenceUrl: 'https://www.myscheme.gov.in',
    },
    {
      id: 'doc_fssai_basic',
      name: 'FSSAI Food Safety Basic Registration',
      purpose: 'Hygiene and food safety compliance for meal preparation and catering unit',
      requirementType: 'conditional',
      conditionNote: 'Required for commercial food handling and catering activities.',
      howToObtain: 'Apply on FoSCoS portal (₹100 annual fee).',
      issuingAuthority: 'FSSAI',
      officialReferenceUrl: 'https://foscos.fssai.gov.in',
    },
  ],

  sch_standup_india: [
    {
      id: 'doc_aadhaar',
      name: 'Aadhaar Card',
      purpose: 'Applicant KYC and identity verification',
      requirementType: 'mandatory',
      howToObtain: 'Applicant Aadhaar card.',
      issuingAuthority: 'UIDAI',
      officialReferenceUrl: 'https://myaadhaar.uidai.gov.in',
    },
    {
      id: 'doc_pan_card',
      name: 'PAN Card',
      purpose: 'Mandatory commercial tax identity for credit facility above ₹10 Lakhs',
      requirementType: 'mandatory',
      howToObtain: 'Income Tax Department.',
      issuingAuthority: 'Income Tax Dept',
      officialReferenceUrl: 'https://www.incometax.gov.in',
    },
    {
      id: 'doc_dpr_comprehensive',
      name: 'Comprehensive Bankable Project Report (DPR)',
      purpose: 'Detailed engineering, technical specifications, cash flows, and break-even analysis for ₹10L - ₹100L loan',
      requirementType: 'mandatory',
      howToObtain: 'Prepared with certified Chartered Accountant or MSME project consultant.',
      issuingAuthority: 'Certified Project Consultant / CA',
      officialReferenceUrl: 'https://www.standupmitra.in',
    },
    {
      id: 'doc_greenfield_declaration',
      name: 'Greenfield Enterprise Declaration Certificate',
      purpose: 'Statutory undertaking that the enterprise is a first-time greenfield venture in manufacturing or services',
      requirementType: 'mandatory',
      howToObtain: 'Affidavit / bank-prescribed greenfield undertaking format.',
      issuingAuthority: 'Applicant / Notary Public',
      officialReferenceUrl: 'https://www.standupmitra.in',
    },
    {
      id: 'doc_bank_statements_1yr',
      name: 'Audited Financials or 1-Year Bank Statements',
      purpose: 'Assessment of applicant financial standing and net worth',
      requirementType: 'mandatory',
      howToObtain: 'Bank branch statements / Form 16 / ITR if filed.',
      issuingAuthority: 'Scheduled Commercial Bank',
      officialReferenceUrl: 'https://www.standupmitra.in',
    },
    {
      id: 'doc_udyam',
      name: 'Udyam Registration Certificate',
      purpose: 'MSME classification for priority banking quota',
      requirementType: 'mandatory',
      howToObtain: 'Official Udyam portal.',
      issuingAuthority: 'Ministry of MSME',
      officialReferenceUrl: 'https://udyamregistration.gov.in',
    },
    {
      id: 'doc_caste_if_applicable',
      name: 'Caste Certificate (SC/ST Category)',
      purpose: 'Proof of SC/ST status if applying under non-woman SC/ST quota',
      requirementType: 'conditional',
      conditionNote: 'Required only if applicant is applying under SC/ST category (not required for woman applicants applying under woman entrepreneur quota).',
      howToObtain: 'Sub-Divisional Officer / Tehsildar.',
      issuingAuthority: 'Revenue Dept',
      officialReferenceUrl: 'https://www.standupmitra.in',
    },
  ],

  sch_mahila_samriddhi: [
    {
      id: 'doc_aadhaar',
      name: 'Aadhaar Card',
      purpose: 'Identity verification for backward classes welfare microfinance',
      requirementType: 'mandatory',
      howToObtain: 'Applicant Aadhaar card.',
      issuingAuthority: 'UIDAI',
      officialReferenceUrl: 'https://myaadhaar.uidai.gov.in',
    },
    {
      id: 'doc_income_certificate',
      name: 'Annual Family Income Certificate (< ₹3,00,000 p.a.)',
      purpose: 'Proof of income threshold eligibility under NBCFDC guidelines',
      requirementType: 'mandatory',
      howToObtain: 'Tehsildar office / Aaple Sarkar portal.',
      issuingAuthority: 'Tehsildar / Sub-Divisional Officer',
      officialReferenceUrl: 'https://www.nbcfdc.gov.in',
    },
    {
      id: 'doc_caste_certificate',
      name: 'Backward Class / OBC Caste Certificate',
      purpose: 'Proof of backward class membership under NBCFDC target charter',
      requirementType: 'mandatory',
      howToObtain: 'Competent Revenue Authority.',
      issuingAuthority: 'Revenue Dept',
      officialReferenceUrl: 'https://www.nbcfdc.gov.in',
    },
    {
      id: 'doc_shg_resolution',
      name: 'Self-Help Group (SHG) Resolution Letter',
      purpose: 'Proof of SHG membership and group recommendation for individual micro-loan',
      requirementType: 'conditional',
      conditionNote: 'Mandatory if applying through SHG channel for lower interest rate (4% p.a.).',
      howToObtain: 'Meeting resolution signed by SHG President, Secretary, and members.',
      issuingAuthority: 'Registered Self Help Group (SHG) / SRLM',
      officialReferenceUrl: 'https://www.nbcfdc.gov.in',
    },
  ],

  sch_pm_svanidhi: [
    {
      id: 'doc_aadhaar',
      name: 'Aadhaar Card',
      purpose: 'Primary identity verification and digital KYC for street vendor credit',
      requirementType: 'mandatory',
      howToObtain: 'Applicant Aadhaar.',
      issuingAuthority: 'UIDAI',
      officialReferenceUrl: 'https://myaadhaar.uidai.gov.in',
    },
    {
      id: 'doc_vending_cov',
      name: 'Certificate of Vending (CoV) or Street Vendor Identity Card',
      purpose: 'Proof of registered street vending activity identified in Urban Local Body survey',
      requirementType: 'conditional',
      conditionNote: 'Required if vendor was identified during municipality street survey. If not available, a Letter of Recommendation (LoR) from ULB or Town Vending Committee (TVC) is accepted.',
      howToObtain: 'Urban Local Body / Municipal Council / Town Vending Committee (TVC).',
      issuingAuthority: 'Urban Local Body / Nagar Parishad',
      officialReferenceUrl: 'https://pmsvanidhi.mohua.gov.in',
    },
    {
      id: 'doc_lor_tvm',
      name: 'Letter of Recommendation (LoR) from Town Vending Committee',
      purpose: 'Alternative proof of vending for vendors who were left out of initial town survey',
      requirementType: 'conditional',
      conditionNote: 'Accepted in place of Certificate of Vending for vendors omitted from initial municipal survey.',
      howToObtain: 'Apply through municipal ULB helpdesk with recommendation from local vendor association.',
      issuingAuthority: 'Town Vending Committee / ULB',
      officialReferenceUrl: 'https://pmsvanidhi.mohua.gov.in',
    },
    {
      id: 'doc_bank_account',
      name: 'Bank Account Passbook / Stamped Account Details',
      purpose: 'Direct benefit transfer for working capital and 7% interest subsidy cashbacks',
      requirementType: 'mandatory',
      howToObtain: 'Local bank branch.',
      issuingAuthority: 'Commercial / Cooperative / Gramin Bank',
      officialReferenceUrl: 'https://pmsvanidhi.mohua.gov.in',
    },
  ],
};

/**
 * Generate a verified document checklist for a selected scheme.
 * Merges existing user-marked availability states where applicable.
 */
export function generateDocumentChecklistForScheme(
  schemeId: string,
  existingDocuments?: DocumentItem[]
): DocumentItem[] {
  const schemeRules = VERIFIED_SCHEME_DOCUMENT_REQUIREMENTS[schemeId] || VERIFIED_SCHEME_DOCUMENT_REQUIREMENTS.sch_mudra_shishu;
  const verifiedScheme = VERIFIED_GOVERNMENT_SCHEMES.find((s) => s.id === schemeId);

  const existingMap = new Map<string, DocumentItem>();
  if (existingDocuments) {
    for (const doc of existingDocuments) {
      existingMap.set(doc.id, doc);
      existingMap.set(doc.name.toLowerCase().trim(), doc);
    }
  }

  return schemeRules.map((rule) => {
    const existing = existingMap.get(rule.id) || existingMap.get(rule.name.toLowerCase().trim());
    const isMandatory = rule.requirementType === 'mandatory';
    
    // Default status: keep existing user declaration, or default to 'needed'
    let status: DocumentItem['status'] = 'needed';
    if (existing) {
      if (existing.status === 'available') status = 'available';
      else if (existing.status === 'not_applicable') status = 'not_applicable';
      else status = 'needed';
    }

    return {
      id: rule.id,
      name: rule.name,
      purpose: rule.purpose,
      isMandatory,
      requirementType: rule.requirementType,
      conditionNote: rule.conditionNote,
      status,
      howToObtain: rule.howToObtain,
      issuingAuthority: rule.issuingAuthority,
      officialReferenceUrl: rule.officialReferenceUrl,
      sourceSchemeId: schemeId,
      verifiedSourceDate: verifiedScheme?.lastVerifiedDate || '2026-02-15',
    };
  });
}

/**
 * Generate a personalized 30-day action plan based on business idea, budget, location,
 * business stage, skills, scheme eligibility, and available resources.
 * Each task contains simple language, estimated time, cost estimate, dependencies,
 * completion state, and related source/recommendation.
 */
export function generatePersonalized30DayActionPlan(params: {
  project: BusinessProject;
  profile: EntrepreneurProfile;
  eligibleSchemeId?: string;
  schemeEligibilityStatus?: string;
}): ActionPlanTask[] {
  const { project, profile, eligibleSchemeId, schemeEligibilityStatus } = params;
  const budget = project.budgetInINR || 30000;
  const location = project.location || profile.villageTown || profile.district || 'Local Market';
  const sector = project.sector || 'food_snacks';
  const stage = project.stage || 'planning';
  const activeSchemeId = eligibleSchemeId || 'sch_mudra_shishu';

  const schemeName = activeSchemeId === 'sch_mudra_shishu' 
    ? 'Mudra Shishu Micro-Loan (PMMY)' 
    : activeSchemeId === 'sch_pmegp'
    ? 'PMEGP Scheme'
    : activeSchemeId === 'sch_annapurna_food'
    ? 'Annapurna Catering Loan'
    : 'Pradhan Mantri MUDRA Yojana';

  const sectorEquipmentCost = sector === 'food_snacks' 
    ? Math.round(budget * 0.45) 
    : sector === 'tailoring_clothing'
    ? Math.round(budget * 0.50)
    : Math.round(budget * 0.40);

  const sectorWorkingCapitalCost = sector === 'food_snacks'
    ? Math.round(budget * 0.15)
    : sector === 'tailoring_clothing'
    ? Math.round(budget * 0.20)
    : Math.round(budget * 0.18);

  const sampleCost = 250;
  const licenseFee = sector === 'food_snacks' ? 100 : 0;
  const brandingCost = 450;

  return [
    // Phase 1: Days 1 to 7 (Discovery & Location Validation)
    {
      id: 'task_phase1_survey',
      phase: 'days_1_7',
      title: 'Customer Demand & Footfall Survey in ' + location,
      description: `Visit your intended setup spot around ${location} during peak hours (morning and evening). Observe competitor prices and note customer count to validate daily demand for your ${project.title}.`,
      estimatedDays: 3,
      estimatedCostINR: sampleCost,
      materialsNeeded: ['Pocket notepad', 'Pen', 'Sample items for 5 neighbor taste/quality checks'],
      dependencies: [],
      scheduledDate: 'Day 1–3',
      completionState: 'completed',
      isCompleted: true,
      status: 'completed',
      relatedRecommendationOrSource: 'Field demand validation before capital outlay',
    },
    {
      id: 'task_phase1_location',
      phase: 'days_1_7',
      title: 'Finalize Workspace or Stall Spot Permission',
      description: `Confirm permission with the premises owner, shopfront, or Gram Panchayat in ${location}. Ensure dry floor, safe overhead shade, and access to clean drinking water.`,
      estimatedDays: 4,
      estimatedCostINR: 0,
      materialsNeeded: ['Aadhaar copy', 'Written consent note or receipt'],
      dependencies: ['task_phase1_survey'],
      scheduledDate: 'Day 4–7',
      completionState: 'completed',
      isCompleted: true,
      status: 'completed',
      relatedRecommendationOrSource: 'Local municipal & panchayat vending compliance',
    },

    // Phase 2: Days 8 to 14 (Budgeting & Equipment Quotations)
    {
      id: 'task_phase2_quotations',
      phase: 'days_8_14',
      title: 'Collect Itemized Equipment Quotations from 2 Local Dealers',
      description: `Obtain written price estimates from 2 merchants in ${location} for core equipment (estimated at ₹${sectorEquipmentCost.toLocaleString('en-IN')}). These quotations are required for the bank loan application.`,
      estimatedDays: 3,
      estimatedCostINR: 0,
      materialsNeeded: ['Shop visit', 'Vendor proforma estimate sheet'],
      dependencies: ['task_phase1_location'],
      scheduledDate: 'Day 8–10',
      completionState: 'in_progress',
      isCompleted: false,
      status: 'in_progress',
      relatedSchemeId: activeSchemeId,
      relatedRecommendationOrSource: `Official requirement for ${schemeName} asset verification`,
    },
    {
      id: 'task_phase2_working_capital',
      phase: 'days_8_14',
      title: 'Calculate 7-Day Ingredient & Raw Material Reserve',
      description: `Reserve working capital of approximately ₹${sectorWorkingCapitalCost.toLocaleString('en-IN')} for your first 7 days of raw materials. Purchase in wholesale quantities to protect daily profit margins.`,
      estimatedDays: 3,
      estimatedCostINR: sectorWorkingCapitalCost,
      materialsNeeded: ['Wholesale merchant contacts', 'Weekly stock ledger'],
      dependencies: ['task_phase2_quotations'],
      scheduledDate: 'Day 11–14',
      completionState: 'pending',
      isCompleted: false,
      status: 'pending',
      relatedRecommendationOrSource: 'Cash flow reserve to avoid running out of stock before receivables',
    },

    // Phase 3: Days 15 to 21 (Government Scheme Application & Mandatory Registrations)
    {
      id: 'task_phase3_loan_application',
      phase: 'days_15_21',
      title: `Submit Loan Application under ${schemeName}`,
      description: `Visit your nearest bank branch in ${location}. Submit the 1-page form along with Aadhaar, bank passbook, and the equipment quotation. Request support under the collateral-free scheme.`,
      estimatedDays: 5,
      estimatedCostINR: 50,
      materialsNeeded: ['Aadhaar photocopy', 'Bank passbook copy', '2 Passport photos', 'Vendor quotation'],
      dependencies: ['task_phase2_quotations', 'task_phase2_working_capital'],
      scheduledDate: 'Day 15–19',
      completionState: 'pending',
      isCompleted: false,
      status: 'pending',
      relatedSchemeId: activeSchemeId,
      relatedRecommendationOrSource: `Preliminary status: ${schemeEligibilityStatus || 'Eligible'}. Official decision by branch manager.`,
    },
    {
      id: 'task_phase3_registration',
      phase: 'days_15_21',
      title: sector === 'food_snacks' 
        ? 'Register for FSSAI Basic Food Safety Certificate' 
        : 'Register for Free Udyam MSME Certificate',
      description: sector === 'food_snacks'
        ? 'Complete basic online registration on FoSCoS portal (₹100 annual fee) to display clean hygiene compliance to customers and officials.'
        : 'Register your micro-enterprise on the official government Udyam portal using Aadhaar for zero fee to access priority MSME benefits.',
      estimatedDays: 2,
      estimatedCostINR: licenseFee,
      materialsNeeded: ['Aadhaar OTP', 'Passport size photo', 'Mobile phone'],
      dependencies: ['task_phase1_location'],
      scheduledDate: 'Day 20–21',
      completionState: 'pending',
      isCompleted: false,
      status: 'pending',
      relatedRecommendationOrSource: sector === 'food_snacks' ? 'https://foscos.fssai.gov.in' : 'https://udyamregistration.gov.in',
    },

    // Phase 4: Days 22 to 30 (Trial Run, Digital Payments & Launch)
    {
      id: 'task_phase4_trial_run',
      phase: 'days_22_30',
      title: 'Batch Production Trial Run & Speed Practice',
      description: `Run a full rehearsal preparing products in realistic quantities. Time your preparation speed, inspect taste and cleanliness, and ask 5 trusted community members for candid feedback.`,
      estimatedDays: 3,
      estimatedCostINR: 350,
      materialsNeeded: ['Trial batch ingredients', 'Cleaning cloths', 'Feedback checklist'],
      dependencies: ['task_phase2_working_capital'],
      scheduledDate: 'Day 22–24',
      completionState: 'pending',
      isCompleted: false,
      status: 'pending',
      relatedRecommendationOrSource: 'Quality stabilization prior to commercial debut',
    },
    {
      id: 'task_phase4_digital_payments',
      phase: 'days_22_30',
      title: 'Set Up UPI QR Code & Small Cash Change Reserve',
      description: `Link your bank account to a business UPI QR standee (PhonePe / Google Pay / BHIM). Prepare ₹500 in small change (₹10 and ₹20 notes) for day 1 cash transactions.`,
      estimatedDays: 2,
      estimatedCostINR: 0,
      materialsNeeded: ['Bank account with active UPI', 'Laminated QR standee', 'Small coin/cash box'],
      dependencies: ['task_phase3_loan_application'],
      scheduledDate: 'Day 25–26',
      completionState: 'pending',
      isCompleted: false,
      status: 'pending',
      relatedRecommendationOrSource: 'Encouraging fast digital sales and eliminating counterfeit change disputes',
    },
    {
      id: 'task_phase4_grand_opening',
      phase: 'days_22_30',
      title: 'Opening Day Launch with Welcome Offers in ' + location,
      description: `Open your setup with a clean display. Offer free sample tastings to the first 25 passers-by. Maintain a clean workspace, greet every customer warmly, and record day 1 sales in your ledger.`,
      estimatedDays: 4,
      estimatedCostINR: brandingCost,
      materialsNeeded: ['Laminated name board / banner', 'First day stock', 'Sales diary & pen'],
      dependencies: ['task_phase4_trial_run', 'task_phase4_digital_payments'],
      scheduledDate: 'Day 27–30',
      completionState: 'pending',
      isCompleted: false,
      status: 'pending',
      relatedRecommendationOrSource: 'Community launch and establishing repeat customer habit',
    },
  ];
}
