"""
Nariniti Multilingual Hybrid Retrieval Engine (Phase 5)
Combines Dense Semantic Embeddings (Cosine Similarity) with BM25 Lexical Retrieval.
Separates semantic relevance matching from deterministic eligibility evaluation.
"""
import math
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# -----------------------------------------------------------------------------
# STRUCTURED DATASETS (VERIFIED SCHEMES & VERIFIED NGOS/MENTORS)
# -----------------------------------------------------------------------------

VERIFIED_SCHEMES_DATASET = [
    {
        "id": "sch_mudra_shishu",
        "official_name": "Pradhan Mantri MUDRA Yojana (PMMY) - Shishu Category",
        "popular_name": "Mudra Shishu Micro-Loan (Up to ₹50,000)",
        "implementing_authority": "Ministry of Finance & MUDRA Ltd, Govt. of India",
        "sectors": ["food_snacks", "tailoring_clothing", "beauty_wellness", "retail_shop", "handmade_crafts"],
        "geographic_scope": "Pan-India (Urban, Semi-Urban, and Rural bank branches)",
        "max_funding_amount": 50000.0,
        "support_type": "loan",
        "interest_rate": "8.5% p.a.",
        "collateral_required": False,
        "official_url": "https://www.mudra.org.in",
        "application_url": "https://www.udyamimitra.in",
        "last_verified_date": "2026-02-10",
        "is_verified": True,
        "is_demonstration": False,
        "description": "Collateral-free working capital and equipment loan up to ₹50,000 for women micro-entrepreneurs, small food stalls, roadside tea carts, and home artisans.",
        "keywords": ["mudra", "shishu", "loan", "collateral free", "tea stall", "food cart", "चहा", "नाश्ता", "कर्ज", "ऋण", "चाय"],
    },
    {
        "id": "sch_pmegp_subsidy",
        "official_name": "Prime Minister Employment Generation Programme (PMEGP)",
        "popular_name": "PMEGP Rural Women 35% Capital Subsidy",
        "implementing_authority": "Khadi and Village Industries Commission (KVIC) / Ministry of MSME",
        "sectors": ["food_snacks", "tailoring_clothing", "beauty_wellness", "agriculture_farming", "handmade_crafts", "retail_shop"],
        "geographic_scope": "Pan-India (Special 35% margin subsidy in rural areas for women)",
        "max_funding_amount": 2000000.0,
        "support_type": "subsidy",
        "interest_rate": "9.0% p.a.",
        "collateral_required": False,
        "official_url": "https://www.kviconline.gov.in",
        "application_url": "https://www.kviconline.gov.in/pmegp",
        "last_verified_date": "2026-03-01",
        "is_verified": True,
        "is_demonstration": False,
        "description": "Credit-linked government capital subsidy providing up to 35% grant for rural women setting up manufacturing or service enterprises.",
        "keywords": ["pmegp", "subsidy", "kvic", "margin money", "अनुदान", "सब्सिडी", "खादी", "ग्रामीण महिला"],
    },
    {
        "id": "sch_annapurna_food",
        "official_name": "Annapurna Scheme for Women Food Catering Units",
        "popular_name": "Annapurna Food & Catering Utensils Scheme",
        "implementing_authority": "Public Sector Banks & State Social Welfare Boards",
        "sectors": ["food_snacks"],
        "geographic_scope": "Pan-India (Nationalized banks)",
        "max_funding_amount": 50000.0,
        "support_type": "loan",
        "interest_rate": "8.75% p.a.",
        "collateral_required": False,
        "official_url": "https://www.myscheme.gov.in",
        "application_url": "https://www.myscheme.gov.in",
        "last_verified_date": "2026-02-15",
        "is_verified": True,
        "is_demonstration": False,
        "description": "Dedicated funding assistance up to ₹50,000 specifically for women setting up lunch, tiffin, snacks, and catering stalls to purchase kitchen equipment and gas burners.",
        "keywords": ["annapurna", "catering", "tiffin", "food", "kitchen equipment", "अन्नपूर्णा", "जेवण", "डबा", "खाद्य", "बर्नर"],
    },
    {
        "id": "sch_pmsvanidhi",
        "official_name": "PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)",
        "popular_name": "PM SVANidhi Working Capital for Street Vendors",
        "implementing_authority": "Ministry of Housing and Urban Affairs (MoHUA)",
        "sectors": ["food_snacks", "retail_shop", "handmade_crafts"],
        "geographic_scope": "Urban and peri-urban areas / Town Vending Committees",
        "max_funding_amount": 20000.0,
        "support_type": "loan",
        "interest_rate": "7% interest subsidy on digital transactions",
        "collateral_required": False,
        "official_url": "https://pmsvanidhi.mohua.gov.in",
        "application_url": "https://pmsvanidhi.mohua.gov.in",
        "last_verified_date": "2026-01-28",
        "is_verified": True,
        "is_demonstration": False,
        "description": "Affordable micro-credit up to ₹10,000 (first tranche) and ₹20,000 (second tranche) with 7% interest subsidy for street vendors and cart operators.",
        "keywords": ["svanidhi", "street vendor", "hawker", "cart", "फेरीवाले", "हातगाडी", "स्ट्रीट वेंडर", "स्वनिधि"],
    },
    {
        "id": "sch_standup_india",
        "official_name": "Stand-Up India Scheme for Women and SC/ST Entrepreneurs",
        "popular_name": "Stand-Up India Enterprise Scheme (Min ₹10 Lakhs)",
        "implementing_authority": "Department of Financial Services (DFS), Govt. of India",
        "sectors": ["food_snacks", "tailoring_clothing", "beauty_wellness", "agriculture_farming", "retail_shop", "digital_services"],
        "geographic_scope": "Pan-India (Scheduled Commercial Banks)",
        "max_funding_amount": 10000000.0,
        "support_type": "loan",
        "interest_rate": "9.25% p.a.",
        "collateral_required": True,
        "official_url": "https://www.standupmitra.in",
        "application_url": "https://www.standupmitra.in",
        "last_verified_date": "2026-01-20",
        "is_verified": True,
        "is_demonstration": False,
        "description": "Bank loans between ₹10 Lakhs and ₹1 Crore for greenfield enterprises led by women. Note: Minimum loan ticket size is ₹10 Lakhs.",
        "keywords": ["standup india", "greenfield", "large enterprise", "स्टँडअप इंडिया"],
    },
    {
        "id": "sch_demo_pilot_grant",
        "official_name": "District Rural Development Pilot Innovation Fund",
        "popular_name": "DRDA Rural Pilot Assistance (Demo Record)",
        "implementing_authority": "District Rural Development Cell (Sample)",
        "sectors": ["agriculture_farming", "food_snacks"],
        "geographic_scope": "Pune Rural Trial Block",
        "max_funding_amount": 15000.0,
        "support_type": "grant",
        "collateral_required": False,
        "official_url": "https://sample-drda.gov.in",
        "application_url": "https://sample-drda.gov.in",
        "last_verified_date": "2026-03-10",
        "is_verified": False,
        "is_demonstration": True,
        "description": "Demonstration grant record for system evaluation. Clearly flagged as unverified demonstration data.",
        "keywords": ["pilot", "demo", "grant", "चाचणी", "प्रायोगिक"],
    }
]

VERIFIED_PARTNERS_DATASET = [
    {
        "id": "ngo_manndeshi",
        "name": "Mann Deshi Foundation (मान देशी फाऊंडेशन)",
        "coverage": "Maharashtra (Satara, Pune, Sangli, Solapur, Kolhapur)",
        "languages": ["mr", "hi", "en"],
        "services": ["Financial Literacy", "Micro-enterprise Chamber of Commerce", "Market Access & Exhibitions", "Mentorship"],
        "sectors": ["food_snacks", "tailoring_clothing", "agriculture_farming", "handmade_crafts"],
        "website": "https://manndeshi.org",
        "last_verified_date": "2026-02-01",
        "is_verified": True,
        "is_demonstration": False,
        "description": "Dedicated rural women entrepreneurship foundation founded by Chetna Gala Sinha, offering business coaching, financial literacy, and marketing networks for women.",
    },
    {
        "id": "ngo_sewa_bharat",
        "name": "SEWA Bharat (Self-Employed Women’s Association)",
        "coverage": "Pan-India (Multiple states including Maharashtra)",
        "languages": ["hi", "en", "mr"],
        "services": ["Informal Worker Organizing", "Cooperative Formation", "Credit Linkage", "Skill Training"],
        "sectors": ["tailoring_clothing", "food_snacks", "handmade_crafts", "retail_shop"],
        "website": "https://sewabharat.org",
        "last_verified_date": "2026-01-15",
        "is_verified": True,
        "is_demonstration": False,
        "description": "National federation supporting self-employed women in the informal economy with skill development and institutional linkages.",
    },
    {
        "id": "ngo_mavim_shg",
        "name": "Mahila Arthik Vikas Mahamandal (MAVIM - माविम)",
        "coverage": "All 36 Districts of Maharashtra",
        "languages": ["mr", "hi", "en"],
        "services": ["Tejaswini SHG Federation", "CMRCs Community Managed Resource Centres", "Bank Loan Linkage"],
        "sectors": ["food_snacks", "tailoring_clothing", "beauty_wellness", "agriculture_farming"],
        "website": "https://mavimindia.org",
        "last_verified_date": "2026-03-05",
        "is_verified": True,
        "is_demonstration": False,
        "description": "State nodal agency of Government of Maharashtra dedicated to economic empowerment of women through Self-Help Group federations.",
    },
    {
        "id": "ngo_unverified_sample",
        "name": "Shree Ganesh Rural Friends Club (Unverified Pilot)",
        "coverage": "Local Village Club",
        "languages": ["mr"],
        "services": ["Informal Community Meeting"],
        "sectors": ["agriculture_farming"],
        "website": "http://unverified-local-club.org",
        "last_verified_date": "2026-03-01",
        "is_verified": False,
        "is_demonstration": True,
        "description": "Unverified community club. MUST be excluded from trusted partner recommendations per Phase 5 guidelines.",
    }
]

# -----------------------------------------------------------------------------
# MULTILINGUAL SEMANTIC VOCABULARY & EMBEDDING SIMULATOR
# -----------------------------------------------------------------------------

# Multilingual concept clusters mapping across Marathi, Hindi, and English
MULTILINGUAL_CONCEPT_CLUSTERS = {
    "food_catering": {
        "tokens": {
            # Marathi
            "चहा", "नाश्ता", "पोहे", "वडापाव", "खाद्य", "जेवण", "डबा", "हॉटेल", "टपरी", "स्टॉल", "खानपान",
            # Hindi
            "चाय", "नाश्ता", "समोसा", "पकौड़े", "भोजन", "खाना", "ढाबा", "रेहड़ी", "ठेला", "कैंटीन",
            # English
            "tea", "snack", "snacks", "food", "catering", "stall", "tiffin", "breakfast", "beverage", "cook"
        },
        "target_schemes": ["sch_mudra_shishu", "sch_annapurna_food", "sch_pmegp_subsidy", "sch_pmsvanidhi"],
    },
    "tailoring_textile": {
        "tokens": {
            # Marathi
            "शिलाई", "कपडे", "भरतकाम", "साडी", "ब्लाऊज", "शिवणकाम", "बुटीक",
            # Hindi
            "सिलाई", "कपड़ा", "कढ़ाई", "सूट", "ब्लाउज", "टेलर", "बुटीक",
            # English
            "tailor", "tailoring", "cloth", "garment", "stitching", "sewing", "boutique", "textile"
        },
        "target_schemes": ["sch_mudra_shishu", "sch_pmegp_subsidy"],
    },
    "street_vendor_micro": {
        "tokens": {
            # Marathi
            "फेरीवाला", "हातगाडी", "रस्त्यावरील", "टपरी", "भाजीपाला",
            # Hindi
            "ठेला", "पटरी", "रेहड़ी", "विक्रेता", "सब्जी",
            # English
            "vendor", "hawker", "street", "cart", "pushcart", "peddler"
        },
        "target_schemes": ["sch_pmsvanidhi", "sch_mudra_shishu"],
    },
    "rural_subsidy_large": {
        "tokens": {
            # Marathi
            "अनुदान", "सब्सिडी", "मोठा", "प्रकल्प", "उद्योग", "कारखाना",
            # Hindi
            "सब्सिडी", "अनुदान", "बड़ा", "कारखाना", "उद्योग",
            # English
            "subsidy", "grant", "factory", "kvic", "margin", "large", "crore", "lakhs"
        },
        "target_schemes": ["sch_pmegp_subsidy", "sch_standup_india"],
    }
}

def tokenize(text: str) -> List[str]:
    """Extract lowercased tokens supporting Devanagari and Latin characters."""
    return re.findall(r'[\w]+', text.lower())

def compute_cosine_similarity(vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
    """Computes cosine similarity between two sparse vector representations."""
    intersection = set(vec_a.keys()).intersection(set(vec_b.keys()))
    dot_product = sum(vec_a[k] * vec_b[k] for k in intersection)
    
    norm_a = math.sqrt(sum(v ** 2 for v in vec_a.values()))
    norm_b = math.sqrt(sum(v ** 2 for v in vec_b.values()))
    
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def build_multilingual_semantic_vector(text: str) -> Dict[str, float]:
    """
    Builds dense semantic projection vector for query/document in multilingual concept space.
    Maps Marathi, Hindi, and English words into cross-lingual concept dimensions.
    """
    tokens = set(tokenize(text))
    vec: Dict[str, float] = {}

    for concept_id, cluster in MULTILINGUAL_CONCEPT_CLUSTERS.items():
        overlap = len(tokens.intersection(cluster["tokens"]))
        if overlap > 0:
            vec[concept_id] = float(overlap) * 2.0
            for scheme_id in cluster["target_schemes"]:
                vec[f"scheme_affinity_{scheme_id}"] = vec.get(f"scheme_affinity_{scheme_id}", 0.0) + overlap

    # Add raw token weights
    for t in tokens:
        vec[f"token_{t}"] = 1.0

    return vec

def compute_bm25_score(query_tokens: List[str], doc: Dict[str, Any]) -> float:
    """Computes BM25 lexical relevance score for acronyms and exact keyword matching."""
    doc_text = f"{doc['official_name']} {doc['popular_name']} {doc['description']} {' '.join(doc.get('keywords', []))}"
    doc_tokens = tokenize(doc_text)
    
    k1 = 1.5
    b = 0.75
    avg_dl = 40.0
    doc_len = len(doc_tokens)
    
    score = 0.0
    for q in query_tokens:
        tf = doc_tokens.count(q)
        if tf > 0:
            numerator = tf * (k1 + 1)
            denominator = tf + k1 * (1 - b + b * (doc_len / avg_dl))
            score += (numerator / denominator)
            
    return score

# -----------------------------------------------------------------------------
# RETRIEVAL SERVICE
# -----------------------------------------------------------------------------

class MatchedSchemeResult(BaseModel):
    scheme_id: str
    official_name: str
    popular_name: str
    semantic_similarity: float
    lexical_bm25_score: float
    hybrid_score: float
    relevance_explanation: str
    official_url: str
    last_verified_date: str
    is_verified: bool
    is_demonstration: bool
    max_funding_amount: float
    support_type: str

class MatchedPartnerResult(BaseModel):
    partner_id: str
    name: str
    coverage: str
    services: List[str]
    website: str
    relevance_explanation: str
    is_verified: bool

def retrieve_schemes(query: str, sector: Optional[str] = None, budget: Optional[float] = None) -> List[MatchedSchemeResult]:
    """
    Runs Hybrid Multilingual Dense + BM25 Lexical Retrieval.
    Crucial: Separates semantic relevance from eligibility!
    """
    query_tokens = tokenize(query)
    query_vec = build_multilingual_semantic_vector(query)

    results = []

    for doc in VERIFIED_SCHEMES_DATASET:
        # 1. Dense Semantic Cosine Similarity
        doc_text = f"{doc['official_name']} {doc['popular_name']} {doc['description']} {' '.join(doc.get('keywords', []))}"
        doc_vec = build_multilingual_semantic_vector(doc_text)
        dense_sim = compute_cosine_similarity(query_vec, doc_vec)

        # 2. Lexical BM25 Score
        bm25_raw = compute_bm25_score(query_tokens, doc)
        bm25_norm = min(bm25_raw / 5.0, 1.0) # normalized to [0, 1]

        # 3. Hybrid Combination (0.7 Dense + 0.3 Lexical)
        hybrid_score = round((0.7 * dense_sim) + (0.3 * bm25_norm), 4)

        # Context-aware relevance explanation
        if dense_sim > 0.4:
            explanation = f"Matched semantically with '{doc['popular_name']}' based on concept overlap in '{doc['sectors'][0]}' sector."
        elif bm25_norm > 0.3:
            explanation = f"Matched via keyword/acronym match against official program name."
        else:
            explanation = f"General government scheme match for micro-enterprises."

        results.append(
            MatchedSchemeResult(
                scheme_id=doc["id"],
                official_name=doc["official_name"],
                popular_name=doc["popular_name"],
                semantic_similarity=round(dense_sim, 4),
                lexical_bm25_score=round(bm25_norm, 4),
                hybrid_score=hybrid_score,
                relevance_explanation=explanation,
                official_url=doc["official_url"],
                last_verified_date=doc["last_verified_date"],
                is_verified=doc["is_verified"],
                is_demonstration=doc["is_demonstration"],
                max_funding_amount=doc["max_funding_amount"],
                support_type=doc["support_type"],
            )
        )

    # Sort descending by hybrid relevance score
    results.sort(key=lambda x: x.hybrid_score, reverse=True)
    return results

def retrieve_partners(query: str, district: str = "Pune") -> List[MatchedPartnerResult]:
    """
    Retrieves NGO & Mentor Partners, strictly EXCLUDING unverified partners from trusted recommendations!
    """
    query_tokens = set(tokenize(query))
    results = []

    for partner in VERIFIED_PARTNERS_DATASET:
        # Exclusion Rule: Do not recommend unverified organizations as trusted partners!
        if not partner["is_verified"]:
            continue

        explanation = f"Verified organization operating in {partner['coverage']} supporting {', '.join(partner['services'][:2])}."
        results.append(
            MatchedPartnerResult(
                partner_id=partner["id"],
                name=partner["name"],
                coverage=partner["coverage"],
                services=partner["services"],
                website=partner["website"],
                relevance_explanation=explanation,
                is_verified=partner["is_verified"],
            )
        )

    return results
