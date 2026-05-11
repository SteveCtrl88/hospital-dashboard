// ─── AUTONOMI MARKET THESIS DATA ─────────────────────────────────────────────
// Revenue model corrected May 2026
// Deployment model: 1 deployment = one autonomous fleet in one ~600-bed building
// Hospital = contracting entity (may contain multiple buildings / deployments)
// Robot count = total beds × 0.056, SPLIT across buildings — does NOT increase with building count

// ── Revenue Model ──────────────────────────────────────────────────────────────
export const REVENUE_MODEL = {
  monthly_per_robot:      3000,    // $ gross
  capex_per_robot:        10000,   // one-time, absorbed by Autonomi
  external_pct:           0.40,
  net_pct:                0.60,
  net_per_robot_month:    1800,    // $3,000 × 60%
  net_per_robot_year:     21600,   // $1,800 × 12
  contract_years:         6,
  net_contract_value:     129600,  // $21,600 × 6
  payback_months:         5.6,     // $10,000 ÷ $1,800
  true_profit_per_robot:  119600,  // $129,600 − $10,000
  capex_return_x:         13.0,
}

// ── Robot Density Formula ──────────────────────────────────────────────────────
export const ROBOT_FORMULA = {
  pharmacy_patient: { ratio: 0.008, label: 'Pharmacy — Patient-specific meds', description: '1 robot per 125 beds', beds_per_robot: 125 },
  pharmacy_restock: { ratio: 0.008, label: 'Pharmacy — Restock runs',           description: '1 robot per 125 beds', beds_per_robot: 125 },
  labs:             { ratio: 0.004, label: 'Laboratory specimen transport',      description: '1 robot per 250 beds', beds_per_robot: 250 },
  food:             { ratio: 0.012, label: 'Food & nutrition delivery',          description: '1 robot per 83 beds',  beds_per_robot: 83  },
  evs:              { ratio: 0.024, label: 'Environmental Services (EVS)',       description: '1 robot per 42 beds',  beds_per_robot: 42  },
}

export const ROBOTS_PER_BED = 0.056

export function calcRobots(beds: number) {
  return {
    pharmacy_patient: Math.round(beds * 0.008),
    pharmacy_restock: Math.round(beds * 0.008),
    labs:             Math.round(beds * 0.004),
    food:             Math.round(beds * 0.012),
    evs:              Math.round(beds * 0.024),
    total:            Math.round(beds * 0.056),
  }
}

// ── Deployment Model ───────────────────────────────────────────────────────────
// 1 deployment = one autonomous fleet in one ~600-bed building
// Never use "campus" — say "building" or "deployment"
export const DEPLOYMENT_MODEL = {
  beds_per_building:        600,
  profiled_hospitals:       34,
  profiled_buildings:       82,   // = deployments
  profiled_robots:          2344,
  avg_robots_per_building:  28.6,
  avg_robots_per_hospital:  68.9,
}

// ── 34 Profiled Hospitals ──────────────────────────────────────────────────────
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

const _totalBeds = PROFILED_HOSPITALS.reduce((a, h) => a + h.beds, 0)
const _totalDeps = PROFILED_HOSPITALS.reduce((a, h) => a + h.deployments, 0)
const _totalRobots = PROFILED_HOSPITALS.reduce((a, h) => a + Math.round(h.beds * ROBOTS_PER_BED), 0)

export const NEAR_TERM = {
  hospitals:        34,
  total_beds:       _totalBeds,
  deployments:      _totalDeps,       // 82 buildings
  total_robots:     _totalRobots,     // 2,344
  robots_per_dep:   Math.round((_totalRobots / _totalDeps) * 10) / 10,  // 28.6
  robots_per_hosp:  Math.round((_totalRobots / 34) * 10) / 10,          // 68.9
  capex_required:   _totalRobots * 10000,
  gross_mrr:        _totalRobots * 3000,
  net_mrr:          _totalRobots * 1800,
  net_arr:          _totalRobots * 21600,
  net_contract_val: _totalRobots * 129600,
  true_profit:      _totalRobots * 119600,
}

// ── Market Tiers (TAM + SAM only — SOM removed) ───────────────────────────────
export const MARKET_TIERS = [
  {
    tier: 'TAM',
    label: 'Total Addressable Market',
    description: 'The total internal logistics spend across all 6,093 US registered hospitals. Internal staff logistics costs represent approximately 3% of hospital operating expenditure. With a 10% national vacancy rate and 27% average attrition in logistics roles, the structural demand for automation is acute. Total annual spend on internal hospital logistics: $34.46 billion.',
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
    description: 'The annual spend addressable by automation and logistics robots — approximately 25% of TAM. This aligns with the ~760 hospitals at 300+ beds where logistics complexity, pharmacy volume, and staffing vacancy costs create the strongest ROI case for Autonomi\'s platform.',
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
    tier: 'NEAR',
    label: 'Near-Term Pipeline (2026–2032)',
    description: '34 individually profiled hospitals comprising 82 buildings / deployment units. 2,344 total robots at avg 28.6 robots per building. 7-year ramp reaches 2,952 robots by 2032 at 20% YoY growth from 2030. At $1,800 net/robot/month (60% of $3,000 gross), end-state generates $5.314M net MRR and $63.76M net ARR. $29.5M total capex absorbed, each robot recovered in 5.6 months. $382.7M total net contract value over 6 years.',
    hospitals: 34,
    total_beds: _totalBeds,
    deployments: _totalDeps,
    total_robots: 2952,
    revenue_b: parseFloat((2952 * 21600 / 1e9).toFixed(3)),
    revenue_label: '$63.76M net ARR',
    revenue_basis: '2,952 robots × $1,800 net/month × 12 (2032 run-rate)',
    color: '#f59e0b',
    source: 'Autonomi internal analysis; AHD Medicare Cost Reports',
  },
]

export const BED_SIZE_ROBOTS = [
  { label: '100 beds',   beds: 100,  robots: 6   },
  { label: '200 beds',   beds: 200,  robots: 11  },
  { label: '300 beds',   beds: 300,  robots: 17  },
  { label: '500 beds',   beds: 500,  robots: 28  },
  { label: '750 beds',   beds: 750,  robots: 42  },
  { label: '1,000 beds', beds: 1000, robots: 56  },
  { label: '1,500 beds', beds: 1500, robots: 84  },
  { label: '2,000 beds', beds: 2000, robots: 112 },
  { label: '3,000 beds', beds: 3000, robots: 168 },
]

// ── Ramp Total (2032 end-state) ────────────────────────────────────────────────
export const RAMP_TOTAL = {
  robots:       2952,
  deployments:  82,
  grossMRR:     8856000,   // 2,952 × $3,000
  netMRR:       5313600,   // 2,952 × $1,800
  netARR:       63763200,  // 2,952 × $21,600
  capex:        29520000,  // 2,952 × $10,000
  contractVal:  382579200, // 2,952 × $129,600
  trueProfit:   353059200, // 2,952 × $119,600
}

// ── 7-Year Deployment Ramp ─────────────────────────────────────────────────────
export const DEPLOYMENT_RAMP = [
  { year: 1, label: "2026", phase: "Validation",   newRobots:  50, description: "2 live IDN deployments + 6 pilots converting. Market validation and reference case development." },
  { year: 2, label: "2027", phase: "Validation",   newRobots: 150, description: "First IDN system-wide contract signed. Business case proven. Sales cycle compression begins." },
  { year: 3, label: "2028", phase: "Early Scale",  newRobots: 300, description: "3–4 new hospital system contracts. Reference customers driving inbound pipeline growth." },
  { year: 4, label: "2029", phase: "Growth",       newRobots: 450, description: "Procurement cycle shortens with established references. 6–8 new contracts per year." },
  { year: 5, label: "2030", phase: "Growth",       newRobots: 550, description: "SAM penetration deepening. IDN-wide rollouts across multi-building hospital networks." },
  { year: 6, label: "2031", phase: "Scale (+20%)", newRobots: 660, description: "20% YoY growth on 2030 baseline. Premium tier 800+ bed hospitals entering." },
  { year: 7, label: "2032", phase: "Scale (+20%)", newRobots: 792, description: "20% YoY growth on 2031 baseline. Pipeline expansion beyond initial 34 hospitals." },
].map((y, i, arr) => {
  const cumulative = arr.slice(0, i + 1).reduce((a, r) => a + r.newRobots, 0)
  return {
    ...y,
    cumulative,
    grossMRR:  cumulative * 3000,
    netMRR:    cumulative * 1800,
    netARR:    cumulative * 21600,
    capexYear: y.newRobots * 10000,
  }
})

export const KEY_ASSUMPTIONS = [
  {
    title: 'Revenue Model — $3,000 Gross / $1,800 Net Per Robot Per Month',
    body: 'Autonomi operates a RaaS model at $3,000/robot/month fixed. 40% ($1,200) covers external servicing, insurance, and operational expenses. Autonomi retains 60% net — $1,800/robot/month, $21,600/robot/year. Contracts run 6 years, yielding $129,600 net contract value per robot. A $10,000 one-time capex is absorbed by Autonomi per robot, recovered in 5.6 months. After payback, each robot generates $1,800/month for the remaining ~66 months — a 13× return on capex. Conservative base assumption; upside case of ~$3,600+/robot/month is possible as scale reduces external cost ratios.',
  },
  {
    title: 'TAM / SAM — From Autonomi Seed Investment Document',
    body: 'The $34.46B TAM and $8.6B SAM figures are sourced directly from the Autonomi/Ctrl Seed Investment Document. Internal staff logistics costs represent ~3% of hospital operating expenditure. A 10% national vacancy rate and 27% average attrition rate in logistics roles create structural demand for automation.',
  },
  {
    title: 'Deployment Model — One Building, One Fleet',
    body: 'The standard Autonomi deployment unit is one autonomous fleet serving one ~600-bed building. A hospital with 1,800 beds across 3 physically separate buildings = 3 deployments. Total robot count is calculated on total staffed beds (× 0.056) and then divided across buildings — it does not increase with building count. The 34 profiled hospitals contain 82 buildings, 2,344 total robots, and average 28.6 robots per building.',
  },
  {
    title: 'Robot Density — 0.056 Robots Per Staffed Bed',
    body: "Derived from Autonomi's live deployment data across five use cases, reduced 20% for conservatism. A 600-bed building moves 37,000 items and 90,000 lbs daily — the density formula captures the robot requirement to automate this. Use case breakdown: pharmacy patient-specific (1:125 beds), pharmacy restock (1:125), lab transport (1:250), food delivery (1:83), EVS (1:42).",
  },
  {
    title: '5–7 Year Commercial Target & Sales Cycle',
    body: 'Hospital procurement currently averages 12–24 months. Autonomi models 18 months as the base case. Compressing to 10–14 months via pre-negotiated IDN master service agreements is a defined strategic goal and the single highest-leverage variable in the revenue model — compressing by 4–8 months roughly doubles the deployable pipeline within the same 7-year window. Current status: 2 live IDN deployments, 6 US pilots under negotiation.',
  },
]
