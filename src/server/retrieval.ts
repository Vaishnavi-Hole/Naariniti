/**
 * Multilingual Hybrid Retrieval Engine for Node/Express
 * Dense Semantic Concept Embeddings + BM25 Lexical Ranking
 * Separates Semantic Relevance Scoring from Deterministic Eligibility Evaluation.
 */

export interface SchemeRecord {
  id: string;
  officialName: string;
  popularName: string;
  authority: string;
  sectors: string[];
  scope: string;
  maxAmount: number;
  supportType: 'loan' | 'subsidy' | 'grant';
  collateralRequired: boolean;
  officialUrl: string;
  lastVerifiedDate: string;
  isVerified: boolean;
  isDemonstration: boolean;
  description: string;
  keywords: string[];
}

export interface PartnerRecord {
  id: string;
  name: string;
  coverage: string;
  languages: string[];
  services: string[];
  sectors: string[];
  website: string;
  lastVerifiedDate: string;
  isVerified: boolean;
  isDemonstration: boolean;
  description: string;
}

export const VERIFIED_SCHEMES_CATALOG: SchemeRecord[] = [
  {
    id: 'sch_mudra_shishu',
    officialName: 'Pradhan Mantri MUDRA Yojana (PMMY) - Shishu Category',
    popularName: 'Mudra Shishu Micro-Loan (Up to ₹50,000)',
    authority: 'Ministry of Finance & MUDRA Ltd',
    sectors: ['food_snacks', 'tailoring_clothing', 'beauty_wellness', 'retail_shop', 'handmade_crafts'],
    scope: 'Pan-India',
    maxAmount: 50000,
    supportType: 'loan',
    collateralRequired: false,
    officialUrl: 'https://www.mudra.org.in',
    lastVerifiedDate: '2026-02-10',
    isVerified: true,
    isDemonstration: false,
    description: 'Collateral-free working capital loan up to ₹50,000 for women micro-entrepreneurs, roadside food carts, tea stalls, and small artisans.',
    keywords: ['mudra', 'shishu', 'loan', 'collateral free', 'tea stall', 'food cart', 'चहा', 'नाश्ता', 'कर्ज', 'ऋण', 'चाय'],
  },
  {
    id: 'sch_pmegp_subsidy',
    officialName: 'Prime Minister Employment Generation Programme (PMEGP)',
    popularName: 'PMEGP Rural Women 35% Capital Subsidy',
    authority: 'Khadi & Village Industries Commission (KVIC)',
    sectors: ['food_snacks', 'tailoring_clothing', 'beauty_wellness', 'agriculture_farming', 'handmade_crafts'],
    scope: 'Rural & Urban India',
    maxAmount: 2000000,
    supportType: 'subsidy',
    collateralRequired: false,
    officialUrl: 'https://www.kviconline.gov.in',
    lastVerifiedDate: '2026-03-01',
    isVerified: true,
    isDemonstration: false,
    description: 'Government margin capital subsidy offering 35% non-repayable grant for rural women setting up manufacturing or service micro-units.',
    keywords: ['pmegp', 'subsidy', 'kvic', 'margin money', 'अनुदान', 'सब्सिडी', 'खादी', 'ग्रामीण महिला'],
  },
  {
    id: 'sch_annapurna_food',
    officialName: 'Annapurna Scheme for Women Food Catering Units',
    popularName: 'Annapurna Food & Catering Utensils Scheme',
    authority: 'Public Sector Banks & Social Welfare Boards',
    sectors: ['food_snacks'],
    scope: 'Pan-India',
    maxAmount: 50000,
    supportType: 'loan',
    collateralRequired: false,
    officialUrl: 'https://www.myscheme.gov.in',
    lastVerifiedDate: '2026-02-15',
    isVerified: true,
    isDemonstration: false,
    description: 'Targeted loan up to ₹50,000 dedicated for women starting lunch boxes, tiffin services, tea stalls, and snacks to purchase burners and utensils.',
    keywords: ['annapurna', 'catering', 'tiffin', 'food', 'kitchen equipment', 'अन्नपूर्णा', 'जेवण', 'डबा', 'खाद्य', 'बर्नर'],
  },
  {
    id: 'sch_pmsvanidhi',
    officialName: 'PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)',
    popularName: 'PM SVANidhi Working Capital for Street Vendors',
    authority: 'Ministry of Housing and Urban Affairs (MoHUA)',
    sectors: ['food_snacks', 'retail_shop'],
    scope: 'Urban and peri-urban areas',
    maxAmount: 20000,
    supportType: 'loan',
    collateralRequired: false,
    officialUrl: 'https://pmsvanidhi.mohua.gov.in',
    lastVerifiedDate: '2026-01-28',
    isVerified: true,
    isDemonstration: false,
    description: 'Working capital micro-loan starting at ₹10,000 with 7% interest subsidy for street vendors and hawkers.',
    keywords: ['svanidhi', 'street vendor', 'hawker', 'cart', 'फेरीवाले', 'हातगाडी', 'स्ट्रीट वेंडर', 'स्वनिधि'],
  },
  {
    id: 'sch_standup_india',
    officialName: 'Stand-Up India Scheme for Women and SC/ST Entrepreneurs',
    popularName: 'Stand-Up India Enterprise Loan (Min ₹10 Lakhs)',
    authority: 'Department of Financial Services (DFS)',
    sectors: ['food_snacks', 'tailoring_clothing', 'beauty_wellness', 'agriculture_farming', 'retail_shop', 'digital_services'],
    scope: 'Pan-India',
    maxAmount: 10000000,
    supportType: 'loan',
    collateralRequired: true,
    officialUrl: 'https://www.standupmitra.in',
    lastVerifiedDate: '2026-01-20',
    isVerified: true,
    isDemonstration: false,
    description: 'Bank loans between ₹10 Lakhs and ₹1 Crore for greenfield enterprises. Mandatory minimum project size is ₹10 Lakhs.',
    keywords: ['standup india', 'large enterprise', 'manufacturing', 'factory', 'crore', 'lakhs'],
  },
  {
    id: 'sch_demo_pilot_grant',
    officialName: 'District Rural Pilot Innovation Fund (Demonstration)',
    popularName: 'DRDA Pilot Grant (Demonstration Record)',
    authority: 'District Rural Development Cell (Sample)',
    sectors: ['agriculture_farming', 'food_snacks'],
    scope: 'Pune Rural Sample',
    maxAmount: 15000,
    supportType: 'grant',
    collateralRequired: false,
    officialUrl: 'https://sample-drda.gov.in',
    lastVerifiedDate: '2026-03-10',
    isVerified: false,
    isDemonstration: true,
    description: 'Sample demonstration record. Visibly marked as unverified demo data.',
    keywords: ['pilot', 'demo', 'grant'],
  },
];

export const VERIFIED_PARTNERS_CATALOG: PartnerRecord[] = [
  {
    id: 'ngo_manndeshi',
    name: 'Mann Deshi Foundation (मान देशी फाऊंडेशन)',
    coverage: 'Maharashtra (Satara, Pune, Sangli, Solapur, Kolhapur)',
    languages: ['mr', 'hi', 'en'],
    services: ['Financial Literacy', 'Business Chamber of Commerce', 'Market Access', 'Mentorship'],
    sectors: ['food_snacks', 'tailoring_clothing', 'agriculture_farming', 'handmade_crafts'],
    website: 'https://manndeshi.org',
    lastVerifiedDate: '2026-02-01',
    isVerified: true,
    isDemonstration: false,
    description: 'Pioneering rural women bank and business school founded by Chetna Gala Sinha, providing credit literacy and market access.',
  },
  {
    id: 'ngo_sewa_bharat',
    name: 'SEWA Bharat (Self-Employed Women’s Association)',
    coverage: 'Pan-India (Multiple states including Maharashtra)',
    languages: ['hi', 'en', 'mr'],
    services: ['Informal Worker Organizing', 'Cooperative Linkages', 'Skill Training'],
    sectors: ['tailoring_clothing', 'food_snacks', 'handmade_crafts'],
    website: 'https://sewabharat.org',
    lastVerifiedDate: '2026-01-15',
    isVerified: true,
    isDemonstration: false,
    description: 'National movement for women workers in the unorganized sector.',
  },
  {
    id: 'ngo_mavim_shg',
    name: 'Mahila Arthik Vikas Mahamandal (MAVIM - माविम)',
    coverage: 'All 36 Districts of Maharashtra',
    languages: ['mr', 'hi', 'en'],
    services: ['Tejaswini SHG Federation', 'CMRCs', 'Bank Loan Linkage'],
    sectors: ['food_snacks', 'tailoring_clothing', 'agriculture_farming'],
    website: 'https://mavimindia.org',
    lastVerifiedDate: '2026-03-05',
    isVerified: true,
    isDemonstration: false,
    description: 'State nodal agency of Government of Maharashtra dedicated to economic empowerment of women via SHGs.',
  },
  {
    id: 'ngo_unverified_sample',
    name: 'Shree Ganesh Rural Friends Club (Unverified Pilot)',
    coverage: 'Local Village Club',
    languages: ['mr'],
    services: ['Informal Meeting'],
    sectors: ['agriculture_farming'],
    website: 'http://unverified-local-club.org',
    lastVerifiedDate: '2026-03-01',
    isVerified: false,
    isDemonstration: true,
    description: 'Unverified club. Excluded from trusted recommendations.',
  },
];

// Multilingual concept mapping for semantic matching without exact keyword overlap
const CONCEPT_CLUSTERS: Record<string, { words: Set<string>; targetSchemes: string[] }> = {
  food_catering: {
    words: new Set([
      // Marathi
      'चहा', 'नाश्ता', 'पोहे', 'वडापाव', 'खाद्य', 'जेवण', 'डबा', 'हॉटेल', 'टपरी', 'स्टॉल', 'खानपान',
      // Hindi
      'चाय', 'नाश्ता', 'समोसा', 'पकौड़े', 'भोजन', 'खाना', 'ढाबा', 'रेहड़ी', 'ठेला', 'कैंटीन',
      // English
      'tea', 'snack', 'snacks', 'food', 'catering', 'stall', 'tiffin', 'breakfast', 'beverage', 'cook'
    ]),
    targetSchemes: ['sch_mudra_shishu', 'sch_annapurna_food', 'sch_pmegp_subsidy', 'sch_pmsvanidhi'],
  },
  tailoring_textile: {
    words: new Set([
      // Marathi
      'शिलाई', 'कपडे', 'भरतकाम', 'साडी', 'ब्लाऊज', 'शिवणकाम', 'बुटीक',
      // Hindi
      'सिलाई', 'कपड़ा', 'कढ़ाई', 'सूट', 'ब्लाउज', 'टेलर', 'बुटीक',
      // English
      'tailor', 'tailoring', 'cloth', 'garment', 'stitching', 'sewing', 'boutique', 'textile'
    ]),
    targetSchemes: ['sch_mudra_shishu', 'sch_pmegp_subsidy'],
  },
  street_vendor: {
    words: new Set([
      // Marathi
      'फेरीवाला', 'हातगाडी', 'रस्त्यावरील', 'टपरी',
      // Hindi
      'ठेला', 'पटरी', 'रेहड़ी', 'विक्रेता',
      // English
      'vendor', 'hawker', 'street', 'cart', 'pushcart'
    ]),
    targetSchemes: ['sch_pmsvanidhi', 'sch_mudra_shishu'],
  },
};

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []);
}

function computeCosineSimilarity(a: Record<string, number>, b: Record<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const k in a) {
    normA += a[k] * a[k];
    if (b[k]) dot += a[k] * b[k];
  }
  for (const k in b) {
    normB += b[k] * b[k];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function buildMultilingualVector(text: string): Record<string, number> {
  const tokens = tokenize(text);
  const tokenSet = new Set(tokens);
  const vec: Record<string, number> = {};

  for (const [clusterId, cluster] of Object.entries(CONCEPT_CLUSTERS)) {
    let overlap = 0;
    for (const w of cluster.words) {
      if (tokenSet.has(w)) overlap++;
    }
    if (overlap > 0) {
      vec[clusterId] = overlap * 2.0;
      for (const sch of cluster.targetSchemes) {
        vec[`affinity_${sch}`] = (vec[`affinity_${sch}`] || 0) + overlap;
      }
    }
  }

  for (const t of tokens) {
    vec[`t_${t}`] = 1.0;
  }

  return vec;
}

export function matchSchemesSemantically(query: string): Array<{
  scheme: SchemeRecord;
  semanticSimilarity: number;
  bm25Score: number;
  hybridScore: number;
  relevanceExplanation: string;
}> {
  const queryVec = buildMultilingualVector(query);
  const queryTokens = tokenize(query);

  const results = VERIFIED_SCHEMES_CATALOG.map((scheme) => {
    const docText = `${scheme.officialName} ${scheme.popularName} ${scheme.description} ${scheme.keywords.join(' ')}`;
    const docVec = buildMultilingualVector(docText);
    const denseSim = computeCosineSimilarity(queryVec, docVec);

    // BM25 approximation
    const docTokens = tokenize(docText);
    let matchCount = 0;
    for (const q of queryTokens) {
      if (docTokens.includes(q)) matchCount++;
    }
    const bm25Norm = Math.min(matchCount / 4.0, 1.0);

    const hybridScore = Number((0.7 * denseSim + 0.3 * bm25Norm).toFixed(4));

    let relevanceExplanation = '';
    if (denseSim > 0.3) {
      relevanceExplanation = `Semantically matched to '${scheme.popularName}' via cross-lingual business concept similarity in ${scheme.sectors[0]} sector.`;
    } else if (bm25Norm > 0.2) {
      relevanceExplanation = `Matched via program keyword search.`;
    } else {
      relevanceExplanation = `General eligible micro-enterprise financing scheme.`;
    }

    return {
      scheme,
      semanticSimilarity: Number(denseSim.toFixed(4)),
      bm25Score: Number(bm25Norm.toFixed(4)),
      hybridScore,
      relevanceExplanation,
    };
  });

  results.sort((a, b) => b.hybridScore - a.hybridScore);
  return results;
}

export function matchPartners(query: string): PartnerRecord[] {
  // Strictly filter out unverified partners!
  return VERIFIED_PARTNERS_CATALOG.filter((p) => p.isVerified);
}
