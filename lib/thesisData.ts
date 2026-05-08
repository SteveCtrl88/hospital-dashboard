// ─── AUTONOMI MARKET THESIS DATA ────────────────────────────────────────────
// All revenue figures sourced from Autonomi/Ctrl Seed Investment Document (project knowledge)
// Robot density formula derived from live Autonomi deployment data (–20% conservative)
// Hospital counts: AHA Annual Survey 2024, Definitive Health HospitalView Aug 2025
//
// REVENUE MODEL (from Seed Document):
//   $2,500 average monthly revenue per deployed robot
//   6-year RaaS contracts with optional upgrades
//   Revenue split: 59% ops/maintenance/insurance, 26% commissions, 15% net
//   Net revenue per robot per month: $2,500 × 15% = $375
//
// ROBOT DENSITY (from live deployments, –20% conservative):
//   Pharmacy patient-specific:  0.008 robots/bed
//   Pharmacy restock:           0.008 robots/bed
//   Lab specimen transport:     0.004 robots/bed
//   Food & nutrition:           0.012 robots/bed
//   EVS:                        0.024 robots/bed
//   TOTAL:                      0.056 robots/bed
//
// KEY LOGIC: Robots = beds × 0.056 per HOSPITAL (not per deployment)
// Deployments = separate fleet installs; robots are SPLIT across them, not multiplied

export const REVENUE_MODEL = {
  monthly_per_robot:     2500,   // $ gross (from Seed Document)
  net_pct:               0.15,   // 15% net after ops/commissions
  net_per_robot_month:   375,    // $2,500 × 15%
  net_per_robot_year:    4500,   // $375 × 12
  contract_years:        6,
}

export const ROBOT_FORMULA = {
  pharmacy_patient: { ratio: 0.008, label: 'Pharmacy — Patient-specific meds', description: '1 robot per 100 beds (–20% conservative)' },
  pharmacy_restock: { ratio: 0.008, label: 'Pharmacy — Restock runs',           description: '1 robot per 100 beds (–20% conservative)' },
  labs:             { ratio: 0.004, label: 'Laboratory specimen transport',      description: '1 robot per 200 beds (–20% conservative)' },
  food:             { ratio: 0.012, label: 'Food & nutrition delivery',          description: '1.5 robots per 100 beds (–20% conservative)' },
  evs:              { ratio: 0.024, label: 'Environmental Services (EVS)',       description: '3 robots per 100 beds (–20% conservative)' },
}

export const ROBOTS_PER_BED = 0.056

export function calcRobots(beds: number) {
  return {
    pharmacy_patient: Math.round(beds * 0.008 * 10) / 10,
    pharmacy_restock: Math.round(beds * 0.008 * 10) / 10,
    labs:             Math.round(beds * 0.004 * 10) / 10,
    food:             Math.round(beds * 0.012 * 10) / 10,
    evs:              Math.round(beds * 0.024 * 10) / 10,
    total:            Math.round(beds * 0.056),
  }
}

// ── 34 profiled hospital campuses ────────────────────────────────────────────
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

const _totalBeds   = PROFILED_HOSPITALS.reduce((a, h) => a + h.beds, 0)
const _totalDeps   = PROFILED_HOSPITALS.reduce((a, h) => a + h.deployments, 0)
const _totalRobots = PROFILED_HOSPITALS.reduce((a, h) => a + Math.round(h.beds * ROBOTS_PER_BED), 0)

export const NEAR_TERM = {
  hospitals:        34,
  total_beds:       _totalBeds,
  deployments:      _totalDeps,       // 86
  total_robots:     _totalRobots,     // 2,345
  robots_per_dep:   Math.round(_totalRobots / _totalDeps),    // ~27
  robots_per_hosp:  Math.round(_totalRobots / 34),            // ~69
  // Revenue at $2,500/robot/month gross
  gross_mrr:        _totalRobots * 2500,
  net_arr:          _totalRobots * 4500,   // $375/robot/month × 12
}

// ── Market tiers — revenue from Seed Document, robots from formula ─────────
export const MARKET_TIERS = [
  {
    tier: 'TAM',
    label: 'Total Addressable Market',
    description: 'The total internal logistics spend across all 6,093 US registered hospitals. Internal staff logistics costs represent approximately 3% of hospital operating expenditure. With 920,000 hospital beds nationally and an average ops cost of $3,000/day per logistics role, the total annual spend on internal hospital logistics is $34.46 billion.',
    hospitals: 6093,
    total_beds: 917000,
    deployments: 6702,
    total_robots: Math.round(917000 * 0.056),
    revenue_b: 34.46,
    revenue_label: '$34.46B/year',
    revenue_basis: 'Total internal hospital logistics spend (Autonomi Seed Document)',
    color: '#6366f1',
    source: 'Autonomi/Ctrl Seed Investment Document; AHA Annual Survey 2024',
  },
  {
    tier: 'SAM',
    label: 'Serviceable Addressable Market',
    description: 'The annual spend addressable by automation and logistics robots — approximately 25% of TAM, targeting hospitals where logistics complexity and staffing vacancy rates (10% nationally, 27% attrition) create the strongest ROI case. This aligns with the ~760 hospitals at 300+ beds where Autonomi\'s platform generates compelling unit economics.',
    hospitals: 760,
    total_beds: 342000,
    deployments: 950,
    total_robots: Math.round(342000 * 0.056),
    revenue_b: 8.6,
    revenue_label: '$8.6B/year',
    revenue_basis: 'Annual spend addressable by automation (Autonomi Seed Document)',
    color: '#3b82f6',
    source: 'Autonomi/Ctrl Seed Investment Document; AHA Annual Survey 2024',
  },
  {
    tier: 'SOM',
    label: 'Serviceable Obtainable Market',
    description: 'Revenue potential within 5 years at 10% penetration of large hospitals — the 270 facilities with 500+ staffed beds where procurement authority sits at executive level and logistics automation has the highest ROI. At $2,500/robot/month gross and 15% net, the 10,584 robot opportunity generates significant recurring revenue.',
    hospitals: 270,
    total_beds: 189000,
    deployments: 364,
    total_robots: Math.round(189000 * 0.056),
    revenue_b: 0.647,
    revenue_label: '$647M/year',
    revenue_basis: '10% penetration of large hospitals within 5 years (Autonomi Seed Document)',
    color: '#10b981',
    source: 'Autonomi/Ctrl Seed Investment Document; Definitive Health HospitalView Aug 2025',
  },
  {
    tier: 'NEAR',
    label: 'Near-Term Pipeline (5–7 Years)',
    description: `34 individually profiled hospital campuses representing ${_totalDeps} fleet deployments. At $2,500/robot/month gross, ${_totalRobots.toLocaleString()} robots generates $${(_totalRobots * 2500 / 1000000).toFixed(1)}M gross MRR — $${(_totalRobots * 4500 / 1000000).toFixed(1)}M net ARR at 15% net margin. This is Autonomi's primary commercial focus through 2030–2032.`,
    hospitals: 34,
    total_beds: _totalBeds,
    deployments: _totalDeps,
    total_robots: _totalRobots,
    revenue_b: parseFloat((_totalRobots * 4500 / 1e9).toFixed(3)),
    revenue_label: `$${(_totalRobots * 4500 / 1e6).toFixed(1)}M net ARR`,
    revenue_basis: `${_totalRobots.toLocaleString()} robots × $375 net/robot/month × 12`,
    color: '#f59e0b',
    source: 'Autonomi internal campus analysis; AHD Medicare Cost Reports',
  },
]

export const BED_SIZE_ROBOTS = [
  { label: '100 beds',   beds: 100,  robots: 6  },
  { label: '200 beds',   beds: 200,  robots: 11 },
  { label: '300 beds',   beds: 300,  robots: 17 },
  { label: '500 beds',   beds: 500,  robots: 28 },
  { label: '750 beds',   beds: 750,  robots: 42 },
  { label: '1,000 beds', beds: 1000, robots: 56 },
  { label: '1,500 beds', beds: 1500, robots: 84 },
  { label: '2,000 beds', beds: 2000, robots: 112 },
  { label: '3,000 beds', beds: 3000, robots: 168 },
]

export const KEY_ASSUMPTIONS = [
  {
    title: 'Revenue Model — $2,500/Robot/Month Gross',
    body: 'Autonomi operates a Robotics-as-a-Service (RaaS) model with monthly subscription per deployed robot, inclusive of fleet software, AI orchestration, and support. Average monthly gross revenue per robot in the field is $2,500, structured as 6-year contracts with optional upgrade paths. Revenue is split: 59% operations/maintenance/insurance, 26% commissions, 15% net — yielding $375 net per robot per month, or $4,500 net per robot per year.',
  },
  {
    title: 'TAM/SAM/SOM — From Autonomi Seed Investment Document',
    body: 'The $34.46B TAM, $8.6B SAM, and $647M SOM figures are sourced directly from the Autonomi/Ctrl Seed Investment Document. Internal staff logistics costs represent ~3% of hospital operating expenditure. A 10% national vacancy rate and 27% average attrition rate in logistics roles create structural demand for automation. The SAM represents the spend addressable by automation logistics robots; the SOM represents 10% penetration of large hospitals within 5 years.',
  },
  {
    title: 'Robot Density — 0.056 Robots Per Staffed Bed',
    body: "Derived from Autonomi's live deployment data across operating hospital sites across five use cases: patient-specific pharmacy (0.008/bed), pharmacy restock (0.008/bed), lab specimen transport (0.004/bed), food delivery (0.012/bed), and EVS (0.024/bed). All ratios reduced by 20% from observed figures to produce a conservative planning baseline. A 600-bed hospital moves 37,000 items and 90,000 lbs daily — the density formula captures the robot requirement to automate this workflow.",
  },
  {
    title: 'Robots Per Hospital vs Per Deployment',
    body: 'Robots are calculated once per hospital based on total staffed beds. Deployments represent separate autonomous fleet installs — a multi-building campus requires independent fleets per building (separate elevator banks, pharmacy locations, logistics zones), but the total robot count does not increase. A 1,000-bed hospital split across 3 buildings requires 56 robots total (~19 per building), not 56 × 3 = 168.',
  },
  {
    title: '5–7 Year Commercial Target',
    body: 'Hospital procurement cycles for autonomous infrastructure average 12–24 months. At 12–15 new deployments per year from 2026 onwards, 86 deployments across the 34 profiled campuses is achievable by 2031–2032. This aligns with the seed document target of 10 active sites and 6 continuous pilots in the near term, scaling to the 34-campus pipeline over the 5–7 year horizon. Current live deployments: 2 IDNs, with 6 US pilots under negotiation.',
  },
  {
    title: 'Hospital Size & Logistics Scale',
    body: 'A 600-bed hospital moves 37,000 items and 90,000 lbs daily — mostly by foot (Autonomi Seed Document). At 0.056 robots/bed, a 600-bed facility requires approximately 34 robots across pharmacy, lab, food, and EVS workflows. The 300+ bed threshold (SAM) represents the point at which logistics complexity, daily item volume, and staffing vacancy costs create a sustainable ROI case for autonomous delivery infrastructure.',
  },
]
