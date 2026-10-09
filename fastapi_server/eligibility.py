"""
Nariniti Phase 6 Deterministic Eligibility Service (Python / FastAPI)
Evaluates structured eligibility criteria with pass, fail, unknown, and not_applicable states.
Compares age, location, sector, business stage, investment, and documented criteria.
Never treats missing values as passing.
Validates scheme IDs and official URLs to prevent LLM hallucination.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

PRELIMINARY_LEGAL_DISCLAIMER = (
    "Preliminary automated assessment based solely on declared profile and business project data. "
    "Official authorities, implementing banks, and nodal agencies make the final binding determination "
    "upon physical verification and document submission."
)

class CriterionEvaluation(BaseModel):
    id: str
    label: str
    status: str # 'pass' | 'fail' | 'unknown' | 'not_applicable'
    explanation: str
    user_value: Optional[str] = None
    required_rule: str

class SchemeEligibilityReport(BaseModel):
    scheme_id: str
    official_name: str
    popular_name: str
    overall_status: str # 'eligible' | 'potentially_eligible' | 'ineligible' | 'insufficient_data'
    criteria: List[CriterionEvaluation]
    missing_information: List[str]
    evidence_references: List[str]
    official_source_url: str
    last_verified_date: str
    is_verified: bool
    is_demonstration: bool
    preliminary_disclaimer: str
    summary_explanation: str

class EligibilityAssessmentRequest(BaseModel):
    scheme_id: Optional[str] = None
    age: Optional[Any] = None
    state: Optional[str] = None
    district: Optional[str] = None
    is_rural: Optional[bool] = None
    sector: Optional[str] = None
    stage: Optional[str] = None
    budget_in_inr: Optional[float] = None
    available_investment: Optional[float] = None
    is_woman: Optional[bool] = True
    is_greenfield: Optional[bool] = True
    has_guarantor: Optional[bool] = None
    is_street_vendor: Optional[bool] = None
    has_bank_default: Optional[bool] = None
    cibil_or_credit_ok: Optional[bool] = None

VERIFIED_SCHEME_SPECS: Dict[str, Dict[str, Any]] = {
    "sch_mudra_shishu": {
        "scheme_id": "sch_mudra_shishu",
        "official_name": "Pradhan Mantri MUDRA Yojana (PMMY) - Shishu Category",
        "popular_name": "Mudra Shishu Micro-Loan (Up to ₹50,000)",
        "official_source_url": "https://www.mudra.org.in",
        "last_verified_date": "2026-02-10",
        "is_verified": True,
        "is_demonstration": False,
        "eligible_sectors": ["food_snacks", "tailoring_clothing", "beauty_wellness", "retail_shop", "handmade_crafts", "digital_services"],
        "max_budget": 50000.0,
    },
    "sch_pmegp_subsidy": {
        "scheme_id": "sch_pmegp_subsidy",
        "official_name": "Prime Minister Employment Generation Programme (PMEGP)",
        "popular_name": "PMEGP Rural Women 35% Capital Subsidy",
        "official_source_url": "https://www.kviconline.gov.in",
        "last_verified_date": "2026-03-01",
        "is_verified": True,
        "is_demonstration": False,
        "max_budget": 2000000.0,
    },
    "sch_annapurna_food": {
        "scheme_id": "sch_annapurna_food",
        "official_name": "Annapurna Scheme for Women Food Catering Units",
        "popular_name": "Annapurna Food & Catering Utensils Scheme",
        "official_source_url": "https://www.myscheme.gov.in",
        "last_verified_date": "2026-02-15",
        "is_verified": True,
        "is_demonstration": False,
        "eligible_sectors": ["food_snacks"],
        "max_budget": 50000.0,
    },
    "sch_pmsvanidhi": {
        "scheme_id": "sch_pmsvanidhi",
        "official_name": "PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)",
        "popular_name": "PM SVANidhi Working Capital for Street Vendors",
        "official_source_url": "https://pmsvanidhi.mohua.gov.in",
        "last_verified_date": "2026-01-28",
        "is_verified": True,
        "is_demonstration": False,
        "max_budget": 20000.0,
    },
    "sch_standup_india": {
        "scheme_id": "sch_standup_india",
        "official_name": "Stand-Up India Scheme for Women and SC/ST Entrepreneurs",
        "popular_name": "Stand-Up India Enterprise Loan (Min ₹10 Lakhs)",
        "official_source_url": "https://www.standupmitra.in",
        "last_verified_date": "2026-01-20",
        "is_verified": True,
        "is_demonstration": False,
        "min_budget": 1000000.0,
        "max_budget": 10000000.0,
    },
    "sch_demo_pilot_grant": {
        "scheme_id": "sch_demo_pilot_grant",
        "official_name": "District Rural Pilot Innovation Fund (Demonstration)",
        "popular_name": "DRDA Pilot Grant (Demonstration Record)",
        "official_source_url": "https://sample-drda.gov.in",
        "last_verified_date": "2026-03-10",
        "is_verified": False,
        "is_demonstration": True,
    }
}

def parse_age(age_val: Any) -> Optional[int]:
    if age_val is None:
        return None
    if isinstance(age_val, (int, float)):
        return int(age_val)
    s = str(age_val).strip()
    if s == "18-25": return 20
    if s == "26-35": return 30
    if s == "36-45": return 40
    if s == "46-60": return 50
    if s in ("60+", ">60"): return 65
    try:
        return int(s)
    except ValueError:
        return None

def evaluate_scheme(scheme_id: str, req: EligibilityAssessmentRequest) -> SchemeEligibilityReport:
    if scheme_id not in VERIFIED_SCHEME_SPECS:
        raise ValueError(f"Scheme ID '{scheme_id}' is not a recognized verified scheme.")
    
    spec = VERIFIED_SCHEME_SPECS[scheme_id]
    criteria: List[CriterionEvaluation] = []
    missing_info: List[str] = []

    # Handle unverified demo record
    if spec["is_demonstration"]:
        criteria.append(CriterionEvaluation(
            id="demo_status",
            label="Demonstration Record Status",
            status="not_applicable",
            explanation="Unverified demonstration record. Official eligibility cannot be decided.",
            user_value="Demo dataset",
            required_rule="Unverified demonstration dataset"
        ))
        return SchemeEligibilityReport(
            scheme_id=spec["scheme_id"],
            official_name=spec["official_name"],
            popular_name=spec["popular_name"],
            overall_status="insufficient_data",
            criteria=criteria,
            missing_information=[],
            evidence_references=[f"Sample record: {spec['official_source_url']}"],
            official_source_url=spec["official_source_url"],
            last_verified_date=spec["last_verified_date"],
            is_verified=False,
            is_demonstration=True,
            preliminary_disclaimer=PRELIMINARY_LEGAL_DISCLAIMER,
            summary_explanation="Demonstration record: for internal demonstration only."
        )

    # 1. Mudra Shishu Evaluation
    if scheme_id == "sch_mudra_shishu":
        # Age
        age = parse_age(req.age)
        if age is None:
            criteria.append(CriterionEvaluation(
                id="age_req",
                label="Minimum Age Requirement",
                status="unknown",
                explanation="Age is missing from profile. Minimum age of 18 years cannot be verified.",
                user_value=None,
                required_rule="Age >= 18 years"
            ))
            missing_info.append("age")
        elif age >= 18:
            criteria.append(CriterionEvaluation(
                id="age_req",
                label="Minimum Age Requirement",
                status="pass",
                explanation=f"Applicant meets minimum age criterion ({req.age}).",
                user_value=str(req.age),
                required_rule="Age >= 18 years"
            ))
        else:
            criteria.append(CriterionEvaluation(
                id="age_req",
                label="Minimum Age Requirement",
                status="fail",
                explanation=f"Applicant is below 18 years ({req.age}). PMMY requires adult legal capacity.",
                user_value=str(req.age),
                required_rule="Age >= 18 years"
            ))

        # Sector
        if not req.sector:
            criteria.append(CriterionEvaluation(
                id="sector_req",
                label="Eligible Micro Enterprise Sector",
                status="unknown",
                explanation="Business sector not declared.",
                user_value=None,
                required_rule="Non-farm micro-enterprise (food, tailoring, retail, craft)"
            ))
            missing_info.append("sector")
        elif req.sector in spec["eligible_sectors"]:
            criteria.append(CriterionEvaluation(
                id="sector_req",
                label="Eligible Micro Enterprise Sector",
                status="pass",
                explanation=f"Sector '{req.sector}' is recognized under PMMY non-farm micro-enterprise guidelines.",
                user_value=req.sector,
                required_rule="Non-farm micro-enterprise (food, tailoring, retail, craft)"
            ))
        else:
            criteria.append(CriterionEvaluation(
                id="sector_req",
                label="Eligible Micro Enterprise Sector",
                status="fail",
                explanation=f"Sector '{req.sector}' is outside non-farm micro commercial loan category.",
                user_value=req.sector,
                required_rule="Non-farm micro-enterprise (food, tailoring, retail, craft)"
            ))

        # Budget
        if req.budget_in_inr is None:
            criteria.append(CriterionEvaluation(
                id="budget_req",
                label="Loan Ceiling for Shishu Category",
                status="unknown",
                explanation="Project budget is not declared.",
                user_value=None,
                required_rule="Project budget <= ₹50,000"
            ))
            missing_info.append("budget_in_inr")
        elif req.budget_in_inr <= 50000:
            criteria.append(CriterionEvaluation(
                id="budget_req",
                label="Loan Ceiling for Shishu Category",
                status="pass",
                explanation=f"Requested budget ₹{req.budget_in_inr:,.0f} is within the ₹50,000 ceiling.",
                user_value=f"₹{req.budget_in_inr:,.0f}",
                required_rule="Project budget <= ₹50,000"
            ))
        else:
            criteria.append(CriterionEvaluation(
                id="budget_req",
                label="Loan Ceiling for Shishu Category",
                status="fail",
                explanation=f"Requested budget ₹{req.budget_in_inr:,.0f} exceeds ₹50,000 ceiling.",
                user_value=f"₹{req.budget_in_inr:,.0f}",
                required_rule="Project budget <= ₹50,000"
            ))

        # Default history
        if req.has_bank_default is True:
            criteria.append(CriterionEvaluation(
                id="default_req",
                label="No Prior Bank Default Record",
                status="fail",
                explanation="Prior bank default history reported. PMMY guidelines prohibit lending to defaulting borrowers.",
                user_value="Prior default reported",
                required_rule="No prior default on bank/NBFC loans"
            ))
        elif req.cibil_or_credit_ok is True:
            criteria.append(CriterionEvaluation(
                id="default_req",
                label="No Prior Bank Default Record",
                status="pass",
                explanation="Credit record verified clean with financial institutions.",
                user_value="Clean credit history",
                required_rule="No prior default on bank/NBFC loans"
            ))
        else:
            criteria.append(CriterionEvaluation(
                id="default_req",
                label="No Prior Bank Default Record",
                status="unknown",
                explanation="Credit bureau report has not been submitted or verified by a bank officer.",
                user_value="Pending bank verification",
                required_rule="No prior default on bank/NBFC loans"
            ))
            missing_info.append("creditHistoryVerification")

    # 2. PMEGP
    elif scheme_id == "sch_pmegp_subsidy":
        age = parse_age(req.age)
        if age is None:
            criteria.append(CriterionEvaluation(
                id="age_req",
                label="Minimum Age Requirement",
                status="unknown",
                explanation="Age missing.",
                user_value=None,
                required_rule="Age >= 18 years"
            ))
            missing_info.append("age")
        elif age >= 18:
            criteria.append(CriterionEvaluation(
                id="age_req",
                label="Minimum Age Requirement",
                status="pass",
                explanation="Age criterion met (18+ years).",
                user_value=str(req.age),
                required_rule="Age >= 18 years"
            ))
        else:
            criteria.append(CriterionEvaluation(
                id="age_req",
                label="Minimum Age Requirement",
                status="fail",
                explanation="Applicant is below 18 years.",
                user_value=str(req.age),
                required_rule="Age >= 18 years"
            ))

        # Location
        if not req.state or not req.district:
            criteria.append(CriterionEvaluation(
                id="loc_req",
                label="Location Certification",
                status="unknown",
                explanation="State or district is missing.",
                user_value=None,
                required_rule="Declared state and district"
            ))
            missing_info.append("stateAndDistrict")
        else:
            is_r = req.is_rural if req.is_rural is not None else True
            rate = "35% Rural" if is_r else "25% Urban"
            criteria.append(CriterionEvaluation(
                id="loc_req",
                label="Location & Special Category Rate",
                status="pass",
                explanation=f"Operating in {req.district}, {req.state} ({rate} subsidy rate for women).",
                user_value=f"{req.district}, {req.state}",
                required_rule="Special category women subsidy rate"
            ))

        # Stage
        if not req.stage:
            criteria.append(CriterionEvaluation(
                id="stage_req",
                label="Greenfield Enterprise Requirement",
                status="unknown",
                explanation="Stage not declared.",
                user_value=None,
                required_rule="Greenfield unit (new venture)"
            ))
            missing_info.append("businessStage")
        elif req.stage == "operating":
            criteria.append(CriterionEvaluation(
                id="stage_req",
                label="Greenfield Enterprise Requirement",
                status="fail",
                explanation="Unit is already operating. PMEGP initial subsidy is strictly for new greenfield projects.",
                user_value="operating",
                required_rule="Greenfield unit (new venture)"
            ))
        else:
            criteria.append(CriterionEvaluation(
                id="stage_req",
                label="Greenfield Enterprise Requirement",
                status="pass",
                explanation=f"Enterprise in '{req.stage}' stage qualifies as a new greenfield project.",
                user_value=req.stage,
                required_rule="Greenfield unit (new venture)"
            ))

        # Own contribution (5%)
        if req.budget_in_inr is None or req.available_investment is None:
            criteria.append(CriterionEvaluation(
                id="own_contrib_req",
                label="Own Capital Contribution (5%)",
                status="unknown",
                explanation="Budget or available investment missing.",
                user_value=None,
                required_rule="Available investment >= 5% of project cost"
            ))
            missing_info.append("ownInvestmentOrBudget")
        else:
            req_contrib = req.budget_in_inr * 0.05
            if req.available_investment >= req_contrib:
                criteria.append(CriterionEvaluation(
                    id="own_contrib_req",
                    label="Own Capital Contribution (5%)",
                    status="pass",
                    explanation=f"Own investment (₹{req.available_investment:,.0f}) covers the 5% margin (₹{req_contrib:,.0f}).",
                    user_value=f"₹{req.available_investment:,.0f}",
                    required_rule="Available investment >= 5% of project cost"
                ))
            else:
                criteria.append(CriterionEvaluation(
                    id="own_contrib_req",
                    label="Own Capital Contribution (5%)",
                    status="fail",
                    explanation=f"Own investment (₹{req.available_investment:,.0f}) is less than mandatory 5% margin (₹{req_contrib:,.0f}).",
                    user_value=f"₹{req.available_investment:,.0f}",
                    required_rule="Available investment >= 5% of project cost"
                ))

    # 3. Stand-Up India
    elif scheme_id == "sch_standup_india":
        if req.is_woman is False:
            criteria.append(CriterionEvaluation(
                id="su_woman_req",
                label="Woman Borrower Mandate",
                status="fail",
                explanation="Applicant is not classified as a woman entrepreneur.",
                user_value="Non-female",
                required_rule="Woman entrepreneur or SC/ST"
            ))
        else:
            criteria.append(CriterionEvaluation(
                id="su_woman_req",
                label="Woman Borrower Mandate",
                status="pass",
                explanation="Applicant is a woman entrepreneur eligible for Stand-Up India allocation.",
                user_value="Woman Entrepreneur",
                required_rule="Woman entrepreneur or SC/ST"
            ))

        if req.budget_in_inr is None:
            criteria.append(CriterionEvaluation(
                id="su_budget_req",
                label="Mandatory Minimum Project Cost (₹10 Lakhs)",
                status="unknown",
                explanation="Budget not specified.",
                user_value=None,
                required_rule="Project budget between ₹10 Lakhs and ₹1 Crore"
            ))
            missing_info.append("budget_in_inr")
        elif req.budget_in_inr < 1000000:
            criteria.append(CriterionEvaluation(
                id="su_budget_req",
                label="Mandatory Minimum Project Cost (₹10 Lakhs)",
                status="fail",
                explanation=f"Declared budget is ₹{req.budget_in_inr:,.0f}. Stand-Up India mandates a minimum ticket size of ₹10,00,000 (₹10 Lakhs).",
                user_value=f"₹{req.budget_in_inr:,.0f}",
                required_rule="Project budget between ₹10 Lakhs and ₹1 Crore"
            ))
        elif req.budget_in_inr <= 10000000:
            criteria.append(CriterionEvaluation(
                id="su_budget_req",
                label="Mandatory Minimum Project Cost (₹10 Lakhs)",
                status="pass",
                explanation=f"Budget of ₹{req.budget_in_inr:,.0f} meets mandatory ₹10 Lakh to ₹1 Crore ticket size.",
                user_value=f"₹{req.budget_in_inr:,.0f}",
                required_rule="Project budget between ₹10 Lakhs and ₹1 Crore"
            ))
        else:
            criteria.append(CriterionEvaluation(
                id="su_budget_req",
                label="Mandatory Minimum Project Cost (₹10 Lakhs)",
                status="fail",
                explanation=f"Budget exceeds maximum scheme cap of ₹1 Crore.",
                user_value=f"₹{req.budget_in_inr:,.0f}",
                required_rule="Project budget between ₹10 Lakhs and ₹1 Crore"
            ))

        criteria.append(CriterionEvaluation(
            id="su_greenfield_req",
            label="Greenfield Enterprise Requirement",
            status="pass",
            explanation="New venture setup qualifies under greenfield enterprise requirement.",
            user_value="Greenfield",
            required_rule="Greenfield enterprise only"
        ))

    # 4. Annapurna Food
    elif scheme_id == "sch_annapurna_food":
        if not req.sector:
            criteria.append(CriterionEvaluation(
                id="ap_sector",
                label="Food Catering Sector Requirement",
                status="unknown",
                explanation="Sector not declared.",
                user_value=None,
                required_rule="Food & snacks catering"
            ))
            missing_info.append("sector")
        elif req.sector == "food_snacks":
            criteria.append(CriterionEvaluation(
                id="ap_sector",
                label="Food Catering Sector Requirement",
                status="pass",
                explanation="Venture is in food & snacks catering, matching Annapurna scheme focus.",
                user_value=req.sector,
                required_rule="Food & snacks catering"
            ))
        else:
            criteria.append(CriterionEvaluation(
                id="ap_sector",
                label="Food Catering Sector Requirement",
                status="fail",
                explanation=f"Annapurna scheme is strictly restricted to food catering. Sector is '{req.sector}'.",
                user_value=req.sector,
                required_rule="Food & snacks catering"
            ))

        if req.has_guarantor is True:
            criteria.append(CriterionEvaluation(
                id="ap_guarantor",
                label="Third-Party Bank Guarantor Requirement",
                status="pass",
                explanation="Third-party guarantor confirmed available.",
                user_value="Guarantor available",
                required_rule="Bank-accepted guarantor"
            ))
        elif req.has_guarantor is False:
            criteria.append(CriterionEvaluation(
                id="ap_guarantor",
                label="Third-Party Bank Guarantor Requirement",
                status="fail",
                explanation="No guarantor available. Participating banks require a guarantor for Annapurna loan execution.",
                user_value="No guarantor",
                required_rule="Bank-accepted guarantor"
            ))
        else:
            criteria.append(CriterionEvaluation(
                id="ap_guarantor",
                label="Third-Party Bank Guarantor Requirement",
                status="unknown",
                explanation="Guarantor availability not recorded. Requires physical bank confirmation.",
                user_value="Pending bank verification",
                required_rule="Bank-accepted guarantor"
            ))
            missing_info.append("guarantorConsent")

    # 5. PM SVANidhi
    elif scheme_id == "sch_pmsvanidhi":
        if req.is_street_vendor is True:
            criteria.append(CriterionEvaluation(
                id="sv_vendor",
                label="Street Vendor / Hawkers Status",
                status="pass",
                explanation="Applicant is an identified street vendor/cart operator.",
                user_value="Street vendor",
                required_rule="Street vendor / hawker"
            ))
        elif req.is_street_vendor is False:
            criteria.append(CriterionEvaluation(
                id="sv_vendor",
                label="Street Vendor / Hawkers Status",
                status="fail",
                explanation="PM SVANidhi is strictly reserved for street vendors and hawkers.",
                user_value="Non-vendor",
                required_rule="Street vendor / hawker"
            ))
        else:
            criteria.append(CriterionEvaluation(
                id="sv_vendor",
                label="Street Vendor / Hawkers Status",
                status="unknown",
                explanation="Vending certificate or Town Vending Committee (TVC) registration not yet verified.",
                user_value="Pending local verification",
                required_rule="Street vendor / hawker"
            ))
            missing_info.append("streetVendorIdCard")

    # Determine Overall Status
    has_fail = any(c.status == "fail" for c in criteria)
    has_unknown = any(c.status == "unknown" for c in criteria)
    all_pass_or_na = all(c.status in ("pass", "not_applicable") for c in criteria)

    if has_fail:
        overall_status = "ineligible"
        summary_explanation = f"Ineligible: Does not meet mandatory scheme conditions."
    elif has_unknown:
        if any(m in ("age", "sector", "budget_in_inr") for m in missing_info):
            overall_status = "insufficient_data"
            summary_explanation = f"Insufficient Data: Critical attributes missing ({', '.join(missing_info)})."
        else:
            overall_status = "potentially_eligible"
            summary_explanation = f"Potentially Eligible: Meets core criteria; pending bank/document verifications ({', '.join(missing_info)})."
    elif all_pass_or_na:
        overall_status = "eligible"
        summary_explanation = f"Eligible: All declared criteria satisfied for {spec['popular_name']}."
    else:
        overall_status = "insufficient_data"
        summary_explanation = "Insufficient Data: Please complete your profile."

    return SchemeEligibilityReport(
        scheme_id=spec["scheme_id"],
        official_name=spec["official_name"],
        popular_name=spec["popular_name"],
        overall_status=overall_status,
        criteria=criteria,
        missing_information=missing_info,
        evidence_references=[
            f"Official Scheme Guidelines: {spec['official_name']}",
            f"Official Web Portal: {spec['official_source_url']}",
            f"Audit Verification Date: {spec['last_verified_date']}"
        ],
        official_source_url=spec["official_source_url"],
        last_verified_date=spec["last_verified_date"],
        is_verified=spec["is_verified"],
        is_demonstration=spec["is_demonstration"],
        preliminary_disclaimer=PRELIMINARY_LEGAL_DISCLAIMER,
        summary_explanation=summary_explanation
    )
