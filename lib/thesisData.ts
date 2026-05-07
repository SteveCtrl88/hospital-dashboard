// Autonomi Market Thesis — Robot Deployment Calculations
// Conservative estimates based on live deployment data (–20% safety factor applied)
// Formula: 0.056 robots per bed (derived from 5 use cases below)

export const ROBOT_FORMULA = {
  pharmacy_patient: { ratio: 0.008, label: 'Pharmacy — Patient-specific meds', description: '1 robot per 100 beds (–20% conservative)' },
  pharmacy_restock: { ratio: 0.008, label: 'Pharmacy — Restock runs',          description: '1 robot per 100 beds (–20% conservative)' },
  labs:             { ratio: 0.004, label: 'Laboratory specimen transport',     description: '1 robot per 200 beds (–20% conservative)' },
  food:             { ratio: 0.012, label: 'Food & nutrition delivery',         description: '1.5 robots per 100 beds (–20% conservative)' },
  evs:              { ratio: 0.024, label: 'Environmental Services (EVS)',      description: '3 robots per 100 beds (–20% conservative)' },
  // total = 0.056 per bed
}

export const ROBOTS_PER_BED = 0.056

export function calcRobots(beds: number) {
  const r = (ratio: number) => Math.round(beds * ratio * 10) / 10
  const total = Math.round(beds * ROBOTS_PER_BED * 10) / 10
  return {
    pharmacy_patient: r(0.008),
    pharmacy_restock: r(0.008),
    labs:             r(0.004),
    food:             r(0.012),
    evs:              r(0.024),
    total,
  }
}

export const MARKET_TIERS = [
  {
    tier: 'TAM',
    label: 'Total Addressable Market',
    description: 'All registered US hospitals — every facility capable of autonomous delivery operations across pharmacy, labs, food, and EVS workflows. The AHA 2024 Annual Survey counts 6,093 hospitals with ~917,000 total staffed beds.',
    hospitals: 6093,
    avg_beds: 150,
    deploy_mult: 1.10,
    deployments: 6702,
    robots_per_deploy: 8.4,
    total_robots: 51352,
    color: '#6366f1',
    source: 'AHA Fast Facts 2026; AHA Annual Survey 2024 (917,000 staffed beds, 6,093 hospitals)',
  },
  {
    tier: 'SAM',
    label: 'Serviceable Addressable Market',
    description: 'Hospitals with 300+ staffed beds — the threshold at which logistics complexity, pharmacy volume, and internal transport demand creates a compelling ROI case for autonomous delivery infrastructure.',
    hospitals: 750,
    avg_beds: 450,
    deploy_mult: 1.25,
    deployments: 938,
    robots_per_deploy: 25.2,
    total_robots: 23638,
    color: '#3b82f6',
    source: 'AHA Annual Survey 2024; Becker\'s 2026; ChatGPT market research Feb 2026',
  },
  {
    tier: 'SOM',
    label: 'Serviceable Obtainable Market',
    description: 'Hospitals with 500+ staffed beds targeted for initial commercial scale — the premium tier where procurement authority sits at the system or hospital executive level, capital budgets support multi-year infrastructure contracts, and operational complexity drives urgency.',
    hospitals: 270,
    avg_beds: 700,
    deploy_mult: 1.35,
    deployments: 364,
    robots_per_deploy: 39.2,
    total_robots: 14269,
    color: '#10b981',
    source: 'Definitive Health HospitalView Aug 2025; AHD Medicare Cost Reports; Becker\'s 2026',
  },
  {
    tier: 'NEAR',
    label: 'Near-Term Pipeline (5–7 Year Target)',
    description: 'The 34 largest and most complex hospital campuses profiled for campus structure — representing 120 deployment units across multi-building and multi-site facilities. This is Autonomi\'s primary commercial focus through 2030–2032.',
    hospitals: 34,
    avg_beds: 1100,
    deploy_mult: 3.5,
    deployments: 120,
    robots_per_deploy: 73,
    total_robots: 6313,
    color: '#f59e0b',
    source: 'Autonomi internal campus analysis; AHD; DH HospitalView; hospital websites',
  },
]

export const BED_SIZE_ROBOTS = [
  { beds: 100,  robots: 5.6,  label: '100 beds' },
  { beds: 200,  robots: 11.2, label: '200 beds' },
  { beds: 300,  robots: 16.8, label: '300 beds' },
  { beds: 500,  robots: 28.0, label: '500 beds' },
  { beds: 750,  robots: 42.0, label: '750 beds' },
  { beds: 1000, robots: 56.0, label: '1,000 beds' },
  { beds: 1500, robots: 84.0, label: '1,500 beds' },
  { beds: 2000, robots: 112.0,label: '2,000 beds' },
  { beds: 3000, robots: 168.0,label: '3,000 beds' },
]

export const KEY_ASSUMPTIONS = [
  {
    title: 'Robot Density Formula',
    body: 'Derived from Autonomi\'s live deployment data across operating hospital sites. Each use case ratio has been reduced by 20% from observed figures to produce a conservative planning estimate. The resulting formula — 0.056 robots per staffed bed — is applied uniformly across hospital size tiers.',
  },
  {
    title: 'Hospital Count Methodology',
    body: 'Total hospital counts sourced from AHA Fast Facts 2026 (6,100 registered US hospitals) and CMS Hospital General Information (7,800+ Medicare-certified facilities). The 300+ and 500+ bed segments are derived from AHD Medicare Cost Report data, Definitive Health HospitalView (August 2025), and Becker\'s Hospital Review (February 2026). Bed-size distributions are consistent with the ChatGPT-sourced research document (February 2026) which estimated ~760 hospitals at 300+ beds and ~270 hospitals at 500+ beds.',
  },
  {
    title: 'Deployment Multiplier',
    body: 'Large hospital campuses are frequently multi-building or multi-site facilities licensed under a single CMS number. A campus complexity multiplier (1.15–1.35×) is applied to convert hospital headcount into deployment units, reflecting facilities that require independent robot fleets per building due to separate elevator banks, pharmacy locations, and logistics zones. The 34 profiled hospitals were individually assessed for campus structure.',
  },
  {
    title: '5–7 Year Commercial Target',
    body: 'The near-term pipeline of 120 deployments across 34 hospital campuses represents Autonomi\'s realistic commercial scale target through 2030–2032. Hospital procurement cycles for autonomous infrastructure average 12–24 months. Assuming commercial availability in 2025–2026 and 15–20 deployments per year at scale, 120 total deployments is achievable by 2031–2032. This represents approximately 33% of the 500+ bed hospital segment — a credible penetration rate for an established robotics platform.',
  },
  {
    title: 'Revenue Implications',
    body: 'At an assumed average contract value of $X per robot per year (RaaS model), the near-term 6,313 robot SOM represents meaningful recurring revenue. The full 500+ bed SAM of 14,269 robots represents the medium-term ceiling. These figures do not include upsell potential from additional use cases, international markets, or sub-300-bed facilities served through IDN system-level contracts.',
  },
]
