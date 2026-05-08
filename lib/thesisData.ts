// Autonomi Market Thesis — Robot Deployment Calculations
// Conservative estimates based on live deployment data (–20% safety factor applied)
//
// KEY LOGIC:
// Robots are calculated PER HOSPITAL based on total staffed beds × 0.056
// Deployments = number of separate fleet installs (robots are DIVIDED across
// deployments, not multiplied — a multi-building campus splits its robot
// fleet between buildings, it does not get extra robots)
//
// Formula derivation (–20% from observed):
//   Pharmacy patient-specific:  beds/100 × 0.8 = 0.008 per bed
//   Pharmacy restock:           beds/100 × 0.8 = 0.008 per bed
//   Labs:                       beds/200 × 0.8 = 0.004 per bed
//   Food & nutrition:    beds×1.5/100 × 0.8 = 0.012 per bed
//   EVS:                 beds×3.0/100 × 0.8 = 0.024 per bed
//   TOTAL:                                   = 0.056 per bed

export const ROBOT_FORMULA = {
  pharmacy_patient: { ratio: 0.008, label: 'Pharmacy — Patient-specific meds', description: '1 robot per 100 beds (–20% conservative)' },
  pharmacy_restock: { ratio: 0.008, label: 'Pharmacy — Restock runs',          description: '1 robot per 100 beds (–20% conservative)' },
  labs:             { ratio: 0.004, label: 'Laboratory specimen transport',     description: '1 robot per 200 beds (–20% conservative)' },
  food:             { ratio: 0.012, label: 'Food & nutrition delivery',         description: '1.5 robots per 100 beds (–20% conservative)' },
  evs:              { ratio: 0.024, label: 'Environmental Services (EVS)',      description: '3 robots per 100 beds (–20% conservative)' },
}

export const ROBOTS_PER_BED = 0.056

export function calcRobots(beds: number) {
  const r = (ratio: number) => Math.round(beds * ratio * 10) / 10
  return {
    pharmacy_patient: r(0.008),
    pharmacy_restock: r(0.008),
    labs:             r(0.004),
    food:             r(0.012),
    evs:              r(0.024),
    total:            Math.round(beds * ROBOTS_PER_BED),
  }
}

// Near-term profiled hospitals with exact deployment counts
// Robots = beds × 0.056 per HOSPITAL (split across deployments, not multiplied)
export const PROFILED_HOSPITALS = [
  { name: "NYP Weill Cornell",     beds: 3286, deployments: 4 },
  { name: "AdventHealth Orlando",  beds: 2966, deployments: 4 },
  { name: "Methodist SA",          beds: 1785, deployments: 3 },
  { name: "Montefiore Moses",      beds: 1521, deployments: 2 },
  { name: "Long Island Jewish",    beds: 1486, deployments: 2 },
  { name: "Yale New Haven",        beds: 1411, deployments: 2 },
  { name: "Baptist Jacksonville",  beds: 1119, deployments: 2 },
  { name: "Cleveland Clinic",      beds: 1288, deployments: 4 },
  { name: "Mayo Saint Marys",      beds: 1265, deployments: 3 },
  { name: "Barnes-Jewish",         beds: 1265, deployments: 3 },
  { name: "Johns Hopkins",         beds: 1162, deployments: 3 },
  { name: "UAB Hospital",          beds: 1157, deployments: 3 },
  { name: "UF Health Shands",      beds: 1149, deployments: 2 },
  { name: "Ohio State Wexner",     beds: 1122, deployments: 3 },
  { name: "Mount Sinai NY",        beds: 1139, deployments: 2 },
  { name: "Beaumont Royal Oak",    beds: 1090, deployments: 2 },
  { name: "Vanderbilt",            beds: 1097, deployments: 3 },
  { name: "Our Lady of Lake",      beds: 1088, deployments: 2 },
  { name: "Spectrum Butterworth",  beds: 1060, deployments: 2 },
  { name: "Houston Methodist",     beds: 1028, deployments: 3 },
  { name: "UH Cleveland",          beds: 1032, deployments: 3 },
  { name: "Tampa General",         beds: 1040, deployments: 2 },
  { name: "MGH Boston",            beds: 1011, deployments: 3 },
  { name: "Michigan Medicine",     beds: 1000, deployments: 3 },
  { name: "ECU Health",            beds:  974, deployments: 2 },
  { name: "Duke University",       beds:  957, deployments: 3 },
  { name: "Grady Memorial",        beds:  953, deployments: 2 },
  { name: "Northwestern Memorial", beds:  930, deployments: 3 },
  { name: "Inova Fairfax",         beds:  928, deployments: 2 },
  { name: "Thomas Jefferson",      beds:  926, deployments: 2 },
  { name: "Aurora St. Luke's",     beds:  938, deployments: 2 },
  { name: "Baylor University MC",  beds:  914, deployments: 2 },
  { name: "Cedars-Sinai",          beds:  908, deployments: 2 },
  { name: "Parkland Dallas",       beds:  862, deployments: 1 },
]

// Pre-calculated totals
export const NEAR_TERM = {
  hospitals:       34,
  total_beds:      PROFILED_HOSPITALS.reduce((a, h) => a + h.beds, 0),
  deployments:     PROFILED_HOSPITALS.reduce((a, h) => a + h.deployments, 0),  // 86
  total_robots:    PROFILED_HOSPITALS.reduce((a, h) => a + Math.round(h.beds * ROBOTS_PER_BED), 0),  // 2,345
  robots_per_dep:  27,
  robots_per_hosp: 69,
}

export const MARKET_TIERS = [
  {
    tier: 'TAM',
    label: 'Total Addressable Market',
    description: 'All 6,093 registered US hospitals per AHA 2024 Annual Survey, accounting for ~917,000 total staffed beds. Every facility is a candidate for autonomous pharmacy, lab, food, and EVS delivery. Robot count = 917,000 beds × 0.056.',
    hospitals: 6093,
    avg_beds: 150,
    total_beds: 917000,
    deployments: 6702,
    robots_per_deploy: 8,
    total_robots: 51352,
    color: '#6366f1',
    source: 'AHA Annual Survey 2024 (917,000 staffed beds across 6,093 hospitals)',
  },
  {
    tier: 'SAM',
    label: 'Serviceable Addressable Market',
    description: 'The ~760 hospitals with 300+ staffed beds — the threshold at which logistics complexity, pharmacy volume, and internal transport workflows create a compelling ROI case for autonomous delivery infrastructure. Average 450 beds × 760 hospitals × 0.056.',
    hospitals: 760,
    avg_beds: 450,
    total_beds: 342000,
    deployments: 950,
    robots_per_deploy: 20,
    total_robots: 19152,
    color: '#3b82f6',
    source: "AHA Annual Survey 2024; Becker's 2026; independent market research (Feb 2026)",
  },
  {
    tier: 'SOM',
    label: 'Serviceable Obtainable Market',
    description: 'The ~270 hospitals with 500+ staffed beds — the premium tier where procurement authority sits at executive level, capital budgets support multi-year infrastructure contracts, and operational complexity is highest. Average 700 beds × 270 hospitals × 0.056.',
    hospitals: 270,
    avg_beds: 700,
    total_beds: 189000,
    deployments: 364,
    robots_per_deploy: 29,
    total_robots: 10584,
    color: '#10b981',
    source: 'Definitive Health HospitalView Aug 2025; AHD Medicare Cost Reports; Becker\'s 2026',
  },
  {
    tier: 'NEAR',
    label: 'Near-Term Pipeline (5–7 Year Target)',
    description: `The 34 largest and most complex hospital campuses individually profiled by Autonomi — representing ${NEAR_TERM.deployments} separate fleet deployments across multi-building and multi-site facilities. Average ${NEAR_TERM.robots_per_dep} robots per deployment, ${NEAR_TERM.robots_per_hosp} per hospital. This is Autonomi's primary commercial focus through 2030–2032.`,
    hospitals: NEAR_TERM.hospitals,
    avg_beds: Math.round(NEAR_TERM.total_beds / NEAR_TERM.hospitals),
    total_beds: NEAR_TERM.total_beds,
    deployments: NEAR_TERM.deployments,
    robots_per_deploy: NEAR_TERM.robots_per_dep,
    total_robots: NEAR_TERM.total_robots,
    color: '#f59e0b',
    source: 'Autonomi internal campus analysis; AHD; Definitive Health HospitalView; hospital websites',
  },
]

export const BED_SIZE_ROBOTS = [
  { label: '100 beds',   beds: 100,  robots: Math.round(100  * 0.056) },
  { label: '200 beds',   beds: 200,  robots: Math.round(200  * 0.056) },
  { label: '300 beds',   beds: 300,  robots: Math.round(300  * 0.056) },
  { label: '500 beds',   beds: 500,  robots: Math.round(500  * 0.056) },
  { label: '750 beds',   beds: 750,  robots: Math.round(750  * 0.056) },
  { label: '1,000 beds', beds: 1000, robots: Math.round(1000 * 0.056) },
  { label: '1,500 beds', beds: 1500, robots: Math.round(1500 * 0.056) },
  { label: '2,000 beds', beds: 2000, robots: Math.round(2000 * 0.056) },
  { label: '3,000 beds', beds: 3000, robots: Math.round(3000 * 0.056) },
]

export const KEY_ASSUMPTIONS = [
  {
    title: 'Robot Density Formula — 0.056 Robots Per Bed',
    body: "Derived from Autonomi's live deployment data across operating hospital sites, then reduced by 20% to produce a conservative planning baseline. Five use cases drive demand: patient-specific pharmacy (0.008/bed), pharmacy restock (0.008/bed), lab specimen transport (0.004/bed), food delivery (0.012/bed), and EVS (0.024/bed). These sum to 0.056 robots per staffed bed.",
  },
  {
    title: 'Robots Per Hospital vs Robots Per Deployment',
    body: "A critical distinction: robots are calculated once per hospital based on total staffed beds. Deployments represent the number of separate autonomous fleet installs required — a multi-building campus needs separate fleets per building, but the total robot count is unchanged. A 1,000-bed hospital split across 3 buildings requires 56 robots total, approximately 19 per building — not 56 × 3 = 168.",
  },
  {
    title: 'Hospital Count Methodology',
    body: "The AHA 2024 Annual Survey is the authoritative source: 6,093 registered US hospitals, ~917,000 total staffed beds, average of ~150 beds per hospital. The Definitive Health HospitalView CSV covers 3,712 unique hospitals with 522,032 verified beds — approximately 57% of total US hospital beds. The 300+ and 500+ bed segments are consistent with independent research estimating ~760 hospitals at 300+ beds and ~270 at 500+ beds.",
  },
  {
    title: 'Deployment Multiplier',
    body: "Large hospital campuses frequently require multiple independent robot fleets — separate elevator banks, pharmacy locations, and logistics zones across buildings that cannot share a single fleet. The 34 profiled hospitals were individually assessed, yielding 86 total deployments (average 2.5 per hospital). For the broader SAM/SOM, a 1.25–1.35× multiplier is applied to convert hospital headcount into deployment units.",
  },
  {
    title: '5–7 Year Commercial Target Rationale',
    body: "Hospital procurement cycles for autonomous infrastructure average 12–24 months. Starting from 2025–2026 commercial availability and ramping to 15–20 new deployments per year, 86 deployments across the 34 profiled campuses is achievable by 2031–2032. At 27 robots per deployment on average, this represents 2,345 robots — approximately 22% of the SOM robot total and a credible near-term commercial milestone.",
  },
  {
    title: 'Revenue Implications',
    body: "Under a Robotics-as-a-Service (RaaS) model, recurring revenue scales directly with robot count. The near-term 2,345-robot pipeline and the full SOM of 10,584 robots define the range of achievable recurring revenue at contracted per-robot rates. These figures exclude international markets, sub-300-bed facilities served through IDN system contracts, and additional use cases beyond the five modelled here.",
  },
]
