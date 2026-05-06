// Campus complexity data for large US hospitals
// Sources: hospital websites, Wikipedia, CMS Cost Reports, press releases
// Researched May 2026

export type CampusType = 
  | 'Single Building'
  | 'Multi-Tower'
  | 'Multi-Building Campus'
  | 'Multi-Site Licensed'

export interface CampusProfile {
  hospital_name_key: string  // matches name in DB (lowercase)
  state: string
  campus_type: CampusType
  estimated_deployments: number  // # of autonomous delivery fleets needed
  building_count: number
  notes: string
}

export const CAMPUS_DATA: CampusProfile[] = [
  // ── MULTI-SITE LICENSED (multiple separate addresses rolled into one CMS number) ──
  {
    hospital_name_key: 'new york-presbyterian weill cornell medical center',
    state: 'NY',
    campus_type: 'Multi-Site Licensed',
    estimated_deployments: 4,
    building_count: 9,
    notes: 'NYP operates 9 campuses across NYC totalling 4,000+ beds. Weill Cornell CMS number aggregates main tower, Komansky Children\'s, and Koch Center outpatient. Columbia Irving is a separate campus 4 miles away.'
  },
  {
    hospital_name_key: 'adventhealth orlando',
    state: 'FL',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 4,
    building_count: 5,
    notes: '172-acre Health Village with physically separate: main adult tower, AdventHealth for Women, AdventHealth for Children (Arnold Palmer), Innovation Tower, and Winnie Palmer (0.3 miles away). New 14-story surgical tower opening 2030.'
  },
  {
    hospital_name_key: 'methodist hospital san antonio',
    state: 'TX',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 4,
    notes: 'Methodist Healthcare system campus includes main hospital, Methodist Children\'s Hospital, Northeast Methodist, and Stone Oak — some under shared CMS license.'
  },
  {
    hospital_name_key: 'jackson memorial hospital',
    state: 'FL',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 4,
    notes: 'Shared campus with UHealth (University of Miami), Ryder Trauma Center, and Holtz Children\'s Hospital — separate buildings, separate elevator banks, one campus.'
  },
  {
    hospital_name_key: 'orlando health orlando regional medical center',
    state: 'FL',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 3,
    notes: 'Arnold Palmer Hospital for Children and Winnie Palmer Hospital for Women are separate buildings connected by skybridge — effectively 3 deployment zones sharing one license.'
  },
  {
    hospital_name_key: 'uab hospital',
    state: 'AL',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 4,
    notes: 'UAB Medicine campus includes main hospital, Children\'s of Alabama (adjacent), and UAB Highlands — all connected or adjacent.'
  },
  {
    hospital_name_key: 'university of michigan michigan medicine',
    state: 'MI',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 4,
    notes: 'Main hospital, C.S. Mott Children\'s, Von Voigtlander Women\'s, and Cardiovascular Center — separate towers on same campus block.'
  },
  {
    hospital_name_key: 'the johns hopkins hospital',
    state: 'MD',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 5,
    notes: 'Sheikh Zayed Tower, Charlotte Bloomberg Children\'s Center, Nelson Harvey Buildings, and Weinberg Building — all connected via tunnel/bridge system on East Baltimore campus.'
  },
  {
    hospital_name_key: 'mayo clinic hospital saint marys campus',
    state: 'MN',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 5,
    notes: 'Saint Marys and Methodist Hospital campuses (connected by subway tunnel) plus Gonda, Charlton, and Baldwin Buildings. Genuinely one of the most complex logistics environments in US healthcare.'
  },
  {
    hospital_name_key: 'vanderbilt university medical center',
    state: 'TN',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 4,
    notes: 'Main tower, Monroe Carell Jr. Children\'s Hospital, and Vanderbilt Psychiatric Hospital on connected campus. 1+ mile of internal corridors.'
  },
  {
    hospital_name_key: 'barnes-jewish hospital',
    state: 'MO',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 4,
    notes: 'Connected to St. Louis Children\'s Hospital and Washington University School of Medicine via internal corridors. Center for Advanced Medicine is a separate tower.'
  },
  {
    hospital_name_key: 'cleveland clinic main campus',
    state: 'OH',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 4,
    building_count: 10,
    notes: 'Over 40 buildings on 166-acre campus including the Heart & Vascular Institute, Sydell & Arnold Miller Family Pavilion, Lerner Research Institute, and Cole Eye Institute — largest hospital campus in Ohio.'
  },
  {
    hospital_name_key: 'northwestern memorial hospital',
    state: 'IL',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 3,
    notes: 'Prentice Women\'s Hospital (separate tower), Lurie Children\'s Hospital (separate building across street), and main Feinberg Pavilion. All in Streeterville block.'
  },
  {
    hospital_name_key: 'grady memorial hospital',
    state: 'GA',
    campus_type: 'Multi-Tower',
    estimated_deployments: 2,
    building_count: 3,
    notes: 'Main tower plus Hughes Spalding Children\'s Hospital wing and Marcus Stroke & Neuroscience Center — physically connected as one large complex.'
  },
  {
    hospital_name_key: 'ohio state university wexner medical center',
    state: 'OH',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 5,
    notes: 'Main hospital, James Cancer Hospital, Brain & Spine Hospital, and Nationwide Children\'s (adjacent) — all on OSU health sciences campus.'
  },
  {
    hospital_name_key: 'uf health shands hospital',
    state: 'FL',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 2,
    building_count: 3,
    notes: 'Main Shands tower, UF Health Shands Children\'s Hospital, and UF Health Heart & Vascular Hospital — connected buildings on Gainesville campus.'
  },
  {
    hospital_name_key: 'massachusetts general hospital',
    state: 'MA',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 6,
    notes: 'White, Gray, Wang, Ellison, and Lunder Buildings plus main pavilion — all connected via internal walkways on Charles River campus.'
  },
  {
    hospital_name_key: 'brigham and women\'s hospital',
    state: 'MA',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 2,
    building_count: 3,
    notes: 'Main hospital, Carl J. and Ruth Shapiro Cardiovascular Center, and Connors Center — physically connected on Longwood Medical campus.'
  },
  {
    hospital_name_key: 'houston methodist hospital',
    state: 'TX',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 5,
    notes: 'Main Dunn Tower, Fondren Brown Building, Scurlock Tower, Walter Tower, and Smith Tower — all connected on Texas Medical Center campus.'
  },
  {
    hospital_name_key: 'memorial hermann texas medical center',
    state: 'TX',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 4,
    notes: 'Main tower, TIRR Memorial Hermann (rehab), McGovern Medical School facilities — interconnected on Texas Medical Center campus.'
  },
  // ── MULTI-TOWER (connected via bridges/tunnels but functionally one building) ──
  {
    hospital_name_key: 'nyu langone tisch hospital',
    state: 'NY',
    campus_type: 'Multi-Tower',
    estimated_deployments: 2,
    building_count: 3,
    notes: 'Tisch Hospital, Kimmel Pavilion (2018 tower), and Rusk Rehabilitation — connected via bridge on First Avenue. Separate elevator banks but shared logistics.'
  },
  {
    hospital_name_key: 'baptist medical center san antonio',
    state: 'TX',
    campus_type: 'Multi-Tower',
    estimated_deployments: 2,
    building_count: 3,
    notes: 'Main Baptist tower plus North tower and Children\'s building — connected campus with separate elevator systems.'
  },
  {
    hospital_name_key: 'montefiore hospital moses campus',
    state: 'NY',
    campus_type: 'Multi-Tower',
    estimated_deployments: 2,
    building_count: 4,
    notes: 'Moses campus has multiple connected pavilions. Children\'s Hospital at Montefiore is a separate building 0.3 miles north.'
  },
  {
    hospital_name_key: 'university hospitals cleveland medical center',
    state: 'OH',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 5,
    notes: 'Main Lakeside Hospital, Rainbow Babies & Children\'s, MacDonald Women\'s Hospital, Seidman Cancer Center — connected on University Circle campus.'
  },
  {
    hospital_name_key: 'spectrum health butterworth hospital',
    state: 'MI',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 2,
    building_count: 3,
    notes: 'Butterworth Hospital connected to Helen DeVos Children\'s Hospital via enclosed walkway. Separate pharmacy and logistics operations.'
  },
  {
    hospital_name_key: 'stanford health care stanford hospital',
    state: 'CA',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 2,
    building_count: 3,
    notes: 'New 824,000 sq ft main hospital (2019), connected to Lucile Packard Children\'s Hospital via tunnel — separate pharmacy operations despite physical connection.'
  },
  {
    hospital_name_key: 'duke university hospital',
    state: 'NC',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 4,
    notes: 'Main hospital connected to Duke Children\'s Hospital, Duke Cancer Center, and Duke Heart Center — 1+ mile of internal corridors on Durham campus.'
  },
  {
    hospital_name_key: 'university of michigan michigan medicine',
    state: 'MI',
    campus_type: 'Multi-Building Campus',
    estimated_deployments: 3,
    building_count: 4,
    notes: 'Main hospital, C.S. Mott Children\'s, Von Voigtlander Women\'s, and Cardiovascular Center — separate towers on same campus block connected by bridge.'
  },
  // ── SINGLE BUILDING or MULTI-TOWER (one deployment) ──
  {
    hospital_name_key: 'yale new haven hospital',
    state: 'CT',
    campus_type: 'Multi-Tower',
    estimated_deployments: 2,
    building_count: 3,
    notes: 'York Street campus (main) and Saint Raphael campus (1.5 miles away) merged in 2012 but operate separately. Smilow Cancer Hospital is attached to main campus.'
  },
  {
    hospital_name_key: 'norton hospital louisville',
    state: 'KY',
    campus_type: 'Multi-Tower',
    estimated_deployments: 2,
    building_count: 2,
    notes: 'Main tower and connected Kosair Children\'s Hospital — physically joined but separate operational units.'
  },
  {
    hospital_name_key: 'parkland memorial hospital',
    state: 'TX',
    campus_type: 'Single Building',
    estimated_deployments: 1,
    building_count: 1,
    notes: 'Single state-of-the-art 862-bed tower opened 2015. One of the largest single-building hospitals in the US. Excellent autonomous delivery candidate.'
  },
  {
    hospital_name_key: 'tampa general hospital',
    state: 'FL',
    campus_type: 'Multi-Tower',
    estimated_deployments: 2,
    building_count: 3,
    notes: 'Main hospital plus Bayshore Pavilion and Gene Sirbio Surgical Center — connected on Davis Islands campus.'
  },
  {
    hospital_name_key: 'beaumont hospital royal oak',
    state: 'MI',
    campus_type: 'Multi-Tower',
    estimated_deployments: 2,
    building_count: 3,
    notes: 'Multiple connected towers on Royal Oak campus. Main tower plus children\'s and surgical pavilions — all internal connections.'
  },
  {
    hospital_name_key: 'henry ford hospital detroit',
    state: 'MI',
    campus_type: 'Multi-Tower',
    estimated_deployments: 2,
    building_count: 3,
    notes: 'New Center One, Clara Ford Pavilion, and K-Building — connected towers on Detroit campus with extensive underground tunnel system.'
  },
]

// Helper to look up campus profile by hospital name
export function getCampusProfile(hospitalName: string, state: string): CampusProfile | null {
  const key = hospitalName.toLowerCase().trim()
  return CAMPUS_DATA.find(c => 
    c.state === state && (
      key.includes(c.hospital_name_key) || 
      c.hospital_name_key.includes(key) ||
      key === c.hospital_name_key
    )
  ) || null
}
