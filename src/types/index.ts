export type Language = 'en' | 'hi' | 'mr';

export type UserRole = 'entrepreneur' | 'admin' | 'partner';

export type BusinessStage = 'exploring' | 'planning' | 'preparing' | 'operating';

export type BusinessSector = 
  | 'food_snacks' 
  | 'tailoring_clothing' 
  | 'beauty_wellness' 
  | 'agriculture_farming' 
  | 'handmade_crafts' 
  | 'retail_shop' 
  | 'digital_services' 
  | 'other';

export interface EntrepreneurProfile {
  id: string;
  fullName: string;
  preferredName: string;
  ageBand: '18-25' | '26-35' | '36-45' | '46-60' | '60+';
  state: string;
  district: string;
  villageTown: string;
  language: Language;
  interactionMode: 'text' | 'voice' | 'both';
  educationLevel: 'no_formal' | 'primary' | 'secondary' | 'higher_secondary' | 'graduate' | 'prefer_not_to_say';
  existingOccupation: string;
  previousBusinessExperience: boolean;
  businessSector: BusinessSector;
  businessStage: BusinessStage;
  availableInvestment: number; // in INR
  monthlyIncomeBand?: string;
  monthlyInvestableAmount?: number;
  hasSmartphone: boolean;
  hasInternet: boolean;
  hasWorkspace: boolean;
  accessibilityPreferences?: string[];
  role: UserRole;
  createdAt: string;
}

export interface BusinessProject {
  id: string;
  userId: string;
  title: string;
  sector: BusinessSector;
  ideaDescription: string;
  budgetInINR: number;
  targetDailyCustomers: number;
  operationMode: 'home' | 'stall' | 'rented_shop' | 'mobile_cart';
  stage: BusinessStage;
  location: string;
  hasEquipment: boolean;
  equipmentNotes?: string;
  planCompletionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export type CriterionStatus = 'pass' | 'fail' | 'unknown' | 'not_applicable';

export interface CriterionCheck {
  id: string;
  label: string;
  status: CriterionStatus;
  explanation: string;
  userValue?: string | number | boolean;
  requiredRule?: string;
}

export type OverallEligibility = 
  | 'eligible' 
  | 'potentially_eligible' 
  | 'ineligible' 
  | 'insufficient_data';

export interface GovernmentScheme {
  id: string;
  officialName: string;
  popularName: string;
  schemeType: 'loan' | 'subsidy' | 'grant' | 'training' | 'composite';
  implementingAuthority: string;
  description: string;
  targetBeneficiaries: string[];
  eligibleSectors: BusinessSector[];
  geographicScope: string;
  maxFundingAmountINR: number;
  interestRateAnnualPercent?: number;
  subsidyPercentage?: number;
  collateralRequired: boolean;
  applicationUrl: string;
  officialSourceUrl: string;
  lastVerifiedDate: string;
  recordStatus: 'active' | 'verification_required' | 'demonstration';
  sourceExcerpt: string;
  whyRecommended?: string;
  criteria: CriterionCheck[];
  overallStatus: OverallEligibility;
  requiredDocuments: string[];
  missingInformation?: string[];
  preliminaryDisclaimer?: string;
  evidenceReferences?: string[];
}

export interface DocumentItem {
  id: string;
  name: string;
  purpose: string;
  isMandatory: boolean;
  requirementType: 'mandatory' | 'conditional' | 'optional';
  conditionNote?: string;
  status: 'available' | 'needed' | 'not_applicable';
  howToObtain: string;
  issuingAuthority: string;
  officialReferenceUrl?: string;
  sourceSchemeId?: string;
  verifiedSourceDate?: string;
}

export interface ActionPlanTask {
  id: string;
  phase: 'days_1_7' | 'days_8_14' | 'days_15_21' | 'days_22_30';
  title: string;
  description: string;
  estimatedDays: number;
  estimatedCostINR: number;
  materialsNeeded: string[];
  dependencies: string[];
  scheduledDate?: string;
  completionState: 'pending' | 'in_progress' | 'completed';
  isCompleted: boolean;
  relatedSchemeId?: string;
  relatedRecommendationOrSource?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ApiHealthStatus {
  status: 'online' | 'offline' | 'checking';
  modelId?: string;
  serviceUrl: string;
  checkedAt?: string;
  latencyMs?: number;
  message?: string;
}

export type AppPage = 
  | 'landing' 
  | 'signup' 
  | 'login' 
  | 'wizard' 
  | 'dashboard' 
  | 'mentor' 
  | 'schemes' 
  | 'scheme-detail' 
  | 'documents' 
  | 'action-plan' 
  | 'profile';
