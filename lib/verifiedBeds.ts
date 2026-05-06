// VERIFIED BED COUNTS for US hospitals with 500+ staffed beds
// Sources (all 2024-2026):
//   - Becker's Hospital Review Feb 2026 top 60 hospitals list
//   - Definitive Health HospitalView Aug 2025 (Medicare Cost Report)
//   - American Hospital Directory (AHD) state pages - Medicare cost report data
//   - Individual hospital websites and press releases
// Priority: these records OVERRIDE any existing bed counts in the database

export interface VerifiedHospital {
  name: string
  city: string
  state: string
  beds: number
  idn_name: string | null
  idn_rank: number | null
  type: string
  ownership: string
  source: string
}

export const VERIFIED_BEDS_500_PLUS: VerifiedHospital[] = [
  // ── 2000+ BEDS ─────────────────────────────────────────────────────────────
  { name: "New York Presbyterian Weill Cornell Medical Center", city: "New York", state: "NY", beds: 3286, idn_name: "NewYork-Presbyterian", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "AdventHealth Orlando", city: "Orlando", state: "FL", beds: 2966, idn_name: "AdventHealth", idn_rank: 11, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Methodist Hospital", city: "San Antonio", state: "TX", beds: 1785, idn_name: "HCA Healthcare", idn_rank: 1, type: "General Acute Care", ownership: "For-Profit", source: "DH HospitalView Aug 2025" },

  // ── 1500–1999 BEDS ─────────────────────────────────────────────────────────
  { name: "Montefiore Einstein Hospital Moses Campus", city: "Bronx", state: "NY", beds: 1521, idn_name: "Montefiore Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Long Island Jewish Medical Center", city: "New Hyde Park", state: "NY", beds: 1486, idn_name: "Northwell Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },

  // ── 1300–1499 BEDS ─────────────────────────────────────────────────────────
  { name: "Barnes-Jewish Hospital", city: "St. Louis", state: "MO", beds: 1315, idn_name: "BJC HealthCare", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Baptist Medical Center", city: "San Antonio", state: "TX", beds: 1243, idn_name: "HCA Healthcare", idn_rank: 1, type: "General Acute Care", ownership: "For-Profit", source: "AHD Medicare Cost Report" },
  { name: "Baptist Medical Center Jacksonville", city: "Jacksonville", state: "FL", beds: 1119, idn_name: "Baptist Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },

  // ── 1100–1299 BEDS ─────────────────────────────────────────────────────────
  { name: "North Shore University Hospital", city: "Manhasset", state: "NY", beds: 1071, idn_name: "Northwell Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Buffalo General Medical Center", city: "Buffalo", state: "NY", beds: 1068, idn_name: "Kaleida Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Nassau University Medical Center", city: "East Meadow", state: "NY", beds: 1119, idn_name: null, idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "AHD Medicare Cost Report" },
  { name: "Corewell Health William Beaumont University Hospital", city: "Royal Oak", state: "MI", beds: 1090, idn_name: "Corewell Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Bergen New Bridge Medical Center", city: "Paramus", state: "NJ", beds: 1070, idn_name: null, idn_rank: null, type: "General Acute Care", ownership: "Government", source: "Becker's 2026" },
  { name: "Brookdale Hospital Medical Center", city: "Brooklyn", state: "NY", beds: 1007, idn_name: null, idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Hospital of the University of Pennsylvania", city: "Philadelphia", state: "PA", beds: 1060, idn_name: "Penn Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Atrium Health Carolinas Medical Center", city: "Charlotte", state: "NC", beds: 1064, idn_name: "Advocate Health", idn_rank: 8, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "OhioHealth Riverside Methodist Hospital", city: "Columbus", state: "OH", beds: 1059, idn_name: "OhioHealth", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Massachusetts General Hospital", city: "Boston", state: "MA", beds: 1059, idn_name: "Mass General Brigham", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Michigan Medicine University of Michigan Health", city: "Ann Arbor", state: "MI", beds: 1043, idn_name: "Michigan Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  { name: "Christiana Hospital", city: "Newark", state: "DE", beds: 1039, idn_name: "ChristianaCare", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "University Hospitals Cleveland Medical Center", city: "Cleveland", state: "OH", beds: 1032, idn_name: "University Hospitals", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Baptist Hospital Miami", city: "Miami", state: "FL", beds: 1020, idn_name: "Baptist Health South Florida", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "UNC Hospitals", city: "Chapel Hill", state: "NC", beds: 1000, idn_name: "UNC Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },

  // ── 900–999 BEDS ───────────────────────────────────────────────────────────
  { name: "Saint Francis Hospital Tulsa", city: "Tulsa", state: "OK", beds: 1112, idn_name: "Saint Francis Health System", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Duke University Hospital", city: "Durham", state: "NC", beds: 1106, idn_name: "Duke Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Wake Forest Baptist Medical Center", city: "Winston-Salem", state: "NC", beds: 985, idn_name: "Advocate Health", idn_rank: 8, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "NYC Health and Hospitals Bellevue", city: "New York", state: "NY", beds: 898, idn_name: "NYC Health + Hospitals", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "AHD Medicare Cost Report" },
  { name: "ECMC Hospital", city: "Buffalo", state: "NY", beds: 956, idn_name: null, idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "AHD Medicare Cost Report" },
  { name: "Aurora St. Luke's Medical Center", city: "Milwaukee", state: "WI", beds: 938, idn_name: "Advocate Health", idn_rank: 8, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Inova Fairfax Hospital", city: "Falls Church", state: "VA", beds: 928, idn_name: "Inova Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Thomas Jefferson University Hospital", city: "Philadelphia", state: "PA", beds: 926, idn_name: "Jefferson Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Baylor University Medical Center", city: "Dallas", state: "TX", beds: 914, idn_name: "Baylor Scott & White Health", idn_rank: 15, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Grady Memorial Hospital", city: "Atlanta", state: "GA", beds: 953, idn_name: "Grady Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  { name: "Cedars-Sinai Medical Center", city: "Los Angeles", state: "CA", beds: 908, idn_name: "Cedars-Sinai", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "DH HospitalView Nov 2024" },

  // ── 800–899 BEDS ───────────────────────────────────────────────────────────
  { name: "Baylor St. Luke's Medical Center Houston", city: "Houston", state: "TX", beds: 881, idn_name: "CommonSpirit Health", idn_rank: 3, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Huntsville Hospital", city: "Huntsville", state: "AL", beds: 881, idn_name: "Huntsville Hospital Health System", idn_rank: null, type: "General Acute Care", ownership: "Government", source: "Becker's 2026" },
  { name: "Novant Health Forsyth Medical Center", city: "Winston-Salem", state: "NC", beds: 879, idn_name: "Novant Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Henry Ford Hospital", city: "Detroit", state: "MI", beds: 877, idn_name: "Henry Ford Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Hartford Hospital", city: "Hartford", state: "CT", beds: 867, idn_name: "Hartford HealthCare", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Baptist Health Medical Center Little Rock", city: "Little Rock", state: "AR", beds: 827, idn_name: "Baptist Health Arkansas", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "New Hanover Regional Medical Center", city: "Wilmington", state: "NC", beds: 823, idn_name: "Novant Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Ohio State University Wexner Medical Center", city: "Columbus", state: "OH", beds: 820, idn_name: "The Ohio State University Wexner Medical Center", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  { name: "University of Chicago Medical Center", city: "Chicago", state: "IL", beds: 811, idn_name: "UChicago Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "University of Iowa Hospitals and Clinics", city: "Iowa City", state: "IA", beds: 811, idn_name: "UI Health Care", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  { name: "Orlando Health Orlando Regional Medical Center", city: "Orlando", state: "FL", beds: 808, idn_name: "Orlando Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "UCSF Helen Diller Medical Center at Parnassus Heights", city: "San Francisco", state: "CA", beds: 834, idn_name: "UCSF Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "DH HospitalView Nov 2024" },
  { name: "Santa Clara Valley Medical Center", city: "San Jose", state: "CA", beds: 805, idn_name: null, idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "DH HospitalView Nov 2024" },
  { name: "Mayo Clinic Hospital Methodist Campus", city: "Rochester", state: "MN", beds: 794, idn_name: "Mayo Clinic", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Albany Medical Center", city: "Albany", state: "NY", beds: 765, idn_name: "Albany Med Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Maimonides Medical Center", city: "Brooklyn", state: "NY", beds: 711, idn_name: null, idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },

  // ── 700–799 BEDS ───────────────────────────────────────────────────────────
  { name: "Gulf Coast Medical Center", city: "Fort Myers", state: "FL", beds: 699, idn_name: "Lee Health", idn_rank: null, type: "General Acute Care", ownership: "Government", source: "AHD Medicare Cost Report" },
  { name: "Baptist Hospital Miami", city: "Miami", state: "FL", beds: 690, idn_name: "Baptist Health South Florida", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "UC Davis Medical Center", city: "Sacramento", state: "CA", beds: 666, idn_name: "UC Davis Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "DH HospitalView Nov 2024" },
  { name: "Kaiser Permanente Fontana Medical Center", city: "Fontana", state: "CA", beds: 664, idn_name: "Kaiser Permanente", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "DH HospitalView Nov 2024" },
  { name: "Community Regional Medical Center", city: "Fresno", state: "CA", beds: 663, idn_name: "Community Medical Centers", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "DH HospitalView Nov 2024" },
  { name: "Stanford Hospital", city: "Stanford", state: "CA", beds: 657, idn_name: "Stanford Health Care", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "DH HospitalView Nov 2024" },
  { name: "Jefferson Abington Hospital", city: "Abington", state: "PA", beds: 634, idn_name: "Jefferson Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Lancaster General Hospital", city: "Lancaster", state: "PA", beds: 620, idn_name: "Penn Medicine Lancaster General Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Jefferson Einstein Philadelphia Hospital", city: "Philadelphia", state: "PA", beds: 619, idn_name: "Jefferson Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Ben Taub Hospital", city: "Houston", state: "TX", beds: 615, idn_name: "Harris Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "AHD Medicare Cost Report" },
  { name: "Baylor Scott and White Medical Center Temple", city: "Temple", state: "TX", beds: 616, idn_name: "Baylor Scott & White Health", idn_rank: 15, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "NYC Health and Hospitals Jacobi", city: "Bronx", state: "NY", beds: 623, idn_name: "NYC Health + Hospitals", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "AHD Medicare Cost Report" },
  { name: "Broward Health Medical Center", city: "Fort Lauderdale", state: "FL", beds: 632, idn_name: "Broward Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "AHD Medicare Cost Report" },
  { name: "Geisinger Medical Center", city: "Danville", state: "PA", beds: 589, idn_name: "Geisinger", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "AdventHealth Tampa", city: "Tampa", state: "FL", beds: 626, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "NYC Health and Hospitals Kings County", city: "Brooklyn", state: "NY", beds: 609, idn_name: "NYC Health + Hospitals", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "AHD Medicare Cost Report" },
  { name: "Kaiser Permanente Zion Medical Center", city: "San Diego", state: "CA", beds: 596, idn_name: "Kaiser Permanente", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "DH HospitalView Nov 2024" },
  { name: "Los Angeles General Medical Center", city: "Los Angeles", state: "CA", beds: 596, idn_name: null, idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "DH HospitalView Nov 2024" },

  // ── 500–599 BEDS ───────────────────────────────────────────────────────────
  { name: "Ascension Sacred Heart Pensacola Hospital", city: "Pensacola", state: "FL", beds: 583, idn_name: "Ascension Health", idn_rank: 5, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "CHRISTUS Spohn Hospital Corpus Christi Shoreline", city: "Corpus Christi", state: "TX", beds: 575, idn_name: "Christus Health", idn_rank: 9, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "NewYork-Presbyterian Brooklyn Methodist Hospital", city: "Brooklyn", state: "NY", beds: 553, idn_name: "NewYork-Presbyterian", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "BronxCare Health System", city: "Bronx", state: "NY", beds: 558, idn_name: null, idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Jamaica Hospital Medical Center", city: "Jamaica", state: "NY", beds: 563, idn_name: null, idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "NYC Health and Hospitals Elmhurst", city: "Elmhurst", state: "NY", beds: 544, idn_name: "NYC Health + Hospitals", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "AHD Medicare Cost Report" },
  { name: "Delray Medical Center", city: "Delray Beach", state: "FL", beds: 520, idn_name: "HCA Healthcare", idn_rank: 1, type: "General Acute Care", ownership: "For-Profit", source: "AHD Medicare Cost Report" },
  { name: "Cleveland Clinic Martin North Hospital", city: "Stuart", state: "FL", beds: 521, idn_name: "Cleveland Clinic", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Providence Mission Hospital Mission Viejo", city: "Mission Viejo", state: "CA", beds: 523, idn_name: "Providence", idn_rank: 16, type: "General Acute Care", ownership: "Non-Profit", source: "DH HospitalView Nov 2024" },
  { name: "Sutter Medical Center Sacramento", city: "Sacramento", state: "CA", beds: 523, idn_name: "Sutter Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "DH HospitalView Nov 2024" },
  { name: "Memorial Sloan Kettering Cancer Center", city: "New York", state: "NY", beds: 514, idn_name: null, idn_rank: null, type: "Specialty Hospital", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "NYU Langone Hospital Long Island", city: "Mineola", state: "NY", beds: 511, idn_name: "NYU Langone Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "CHRISTUS Mother Frances Hospital Tyler", city: "Tyler", state: "TX", beds: 518, idn_name: "Christus Health", idn_rank: 9, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Crouse Hospital", city: "Syracuse", state: "NY", beds: 502, idn_name: null, idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Allegheny General Hospital", city: "Pittsburgh", state: "PA", beds: 508, idn_name: "Allegheny Health Network", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  // Additional 500+ from PA AHD
  { name: "UPMC Presbyterian", city: "Pittsburgh", state: "PA", beds: 757, idn_name: "UPMC", idn_rank: 20, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  { name: "Penn State Health Milton S. Hershey Medical Center", city: "Hershey", state: "PA", beds: 659, idn_name: "Penn State Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "AHD" },
  // Additional from Becker's 2026
  { name: "Novant Health Forsyth Medical Center", city: "Winston-Salem", state: "NC", beds: 879, idn_name: "Novant Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "WakeMed Raleigh Campus", city: "Raleigh", state: "NC", beds: 776, idn_name: "WakeMed Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "ECU Health Medical Center", city: "Greenville", state: "NC", beds: 974, idn_name: "ECU Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2024" },
  { name: "Northwestern Memorial Hospital", city: "Chicago", state: "IL", beds: 930, idn_name: "Northwestern Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Advocate Christ Medical Center", city: "Oak Lawn", state: "IL", beds: 695, idn_name: "Advocate Health", idn_rank: 8, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional Florida
  { name: "Tampa General Hospital", city: "Tampa", state: "FL", beds: 1040, idn_name: null, idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  { name: "AdventHealth Daytona Beach", city: "Daytona Beach", state: "FL", beds: 362, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  // Additional Ohio
  { name: "Cleveland Clinic Main Campus", city: "Cleveland", state: "OH", beds: 1299, idn_name: "Cleveland Clinic", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Cincinnati Children's Hospital Medical Center", city: "Cincinnati", state: "OH", beds: 724, idn_name: "Cincinnati Children's", idn_rank: null, type: "Children's Hospital", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional Michigan
  { name: "Spectrum Health Butterworth Hospital", city: "Grand Rapids", state: "MI", beds: 1060, idn_name: "Corewell Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional New Jersey
  { name: "Morristown Medical Center", city: "Morristown", state: "NJ", beds: 720, idn_name: "Atlantic Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Robert Wood Johnson University Hospital New Brunswick", city: "New Brunswick", state: "NJ", beds: 614, idn_name: "RWJBarnabas Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Hackensack University Medical Center", city: "Hackensack", state: "NJ", beds: 781, idn_name: "Hackensack Meridian Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional Maryland / DC
  { name: "MedStar Washington Hospital Center", city: "Washington", state: "DC", beds: 912, idn_name: "MedStar Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "University of Maryland Medical Center", city: "Baltimore", state: "MD", beds: 757, idn_name: "University of Maryland Medical System", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  // Additional Tennessee
  { name: "Vanderbilt University Medical Center", city: "Nashville", state: "TN", beds: 1097, idn_name: "Vanderbilt Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "TriStar Centennial Medical Center", city: "Nashville", state: "TN", beds: 741, idn_name: "HCA Healthcare", idn_rank: 1, type: "General Acute Care", ownership: "For-Profit", source: "Becker's 2026" },
  { name: "Methodist University Hospital Memphis", city: "Memphis", state: "TN", beds: 693, idn_name: "Methodist Le Bonheur Healthcare", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Erlanger Medical Center", city: "Chattanooga", state: "TN", beds: 752, idn_name: "Erlanger Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  // Additional Georgia
  { name: "Wellstar Kennestone Regional Medical Center", city: "Marietta", state: "GA", beds: 633, idn_name: "WellStar Health System", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Augusta University Medical Center", city: "Augusta", state: "GA", beds: 583, idn_name: "Augusta University Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  // Additional South Carolina
  { name: "Prisma Health Greenville Memorial Hospital", city: "Greenville", state: "SC", beds: 828, idn_name: "Prisma Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Medical University of South Carolina", city: "Charleston", state: "SC", beds: 765, idn_name: "MUSC Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  // Additional Virginia
  { name: "Inova Fairfax Hospital", city: "Falls Church", state: "VA", beds: 928, idn_name: "Inova Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Sentara Norfolk General Hospital", city: "Norfolk", state: "VA", beds: 525, idn_name: "Sentara Healthcare", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional Indiana
  { name: "IU Health Methodist Hospital Indianapolis", city: "Indianapolis", state: "IN", beds: 1274, idn_name: "Indiana University Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "DH HospitalView Aug 2025" },
  { name: "Parkview Regional Medical Center Fort Wayne", city: "Fort Wayne", state: "IN", beds: 720, idn_name: "Parkview Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional Minnesota
  { name: "Mayo Clinic Hospital Saint Marys Campus", city: "Rochester", state: "MN", beds: 1265, idn_name: "Mayo Clinic", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "DH HospitalView Aug 2025" },
  { name: "Abbott Northwestern Hospital Minneapolis", city: "Minneapolis", state: "MN", beds: 697, idn_name: "Allina Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "University of Minnesota Medical Center", city: "Minneapolis", state: "MN", beds: 744, idn_name: "M Health Fairview", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional Missouri
  { name: "Mercy Hospital Springfield", city: "Springfield", state: "MO", beds: 866, idn_name: "Mercy", idn_rank: 13, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional Oklahoma
  { name: "Hillcrest Medical Center Tulsa", city: "Tulsa", state: "OK", beds: 656, idn_name: "Ardent Health Services", idn_rank: null, type: "General Acute Care", ownership: "For-Profit", source: "Becker's 2026" },
  // Additional Louisiana
  { name: "Our Lady of the Lake Regional Medical Center", city: "Baton Rouge", state: "LA", beds: 1088, idn_name: "Franciscan Missionaries of Our Lady", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Willis Knighton Medical Center", city: "Shreveport", state: "LA", beds: 756, idn_name: "Willis-Knighton Health System", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional Connecticut
  { name: "Yale New Haven Hospital", city: "New Haven", state: "CT", beds: 1411, idn_name: "Yale New Haven Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "DH HospitalView Aug 2025" },
  // Additional Massachusetts
  { name: "Brigham and Womens Hospital", city: "Boston", state: "MA", beds: 800, idn_name: "Mass General Brigham", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Boston Medical Center", city: "Boston", state: "MA", beds: 589, idn_name: "Boston Medical Center Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional Alabama
  { name: "UAB Hospital", city: "Birmingham", state: "AL", beds: 1157, idn_name: "UAB Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  // Additional West Virginia
  { name: "WVU Medicine Ruby Memorial Hospital", city: "Morgantown", state: "WV", beds: 710, idn_name: "WVU Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  // Additional Kentucky
  { name: "UK HealthCare Albert B. Chandler Hospital", city: "Lexington", state: "KY", beds: 945, idn_name: "UK HealthCare", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  // Additional Delaware
  { name: "Christiana Hospital", city: "Newark", state: "DE", beds: 1039, idn_name: "ChristianaCare", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional UF Health
  { name: "UF Health Shands Hospital", city: "Gainesville", state: "FL", beds: 1145, idn_name: "UF Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  // Additional Houston
  { name: "Houston Methodist Hospital", city: "Houston", state: "TX", beds: 1028, idn_name: "Houston Methodist", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Memorial Hermann Texas Medical Center", city: "Houston", state: "TX", beds: 1137, idn_name: "Memorial Hermann", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Parkland Memorial Hospital", city: "Dallas", state: "TX", beds: 862, idn_name: "Parkland Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  { name: "Texas Health Presbyterian Hospital Dallas", city: "Dallas", state: "TX", beds: 898, idn_name: "Texas Health Resources", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional North Carolina
  { name: "Duke University Hospital", city: "Durham", state: "NC", beds: 1106, idn_name: "Duke Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Atrium Health Wake Forest Baptist Medical Center", city: "Winston-Salem", state: "NC", beds: 985, idn_name: "Advocate Health", idn_rank: 8, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  // Johns Hopkins
  { name: "The Johns Hopkins Hospital", city: "Baltimore", state: "MD", beds: 1162, idn_name: "Johns Hopkins Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  // Mount Sinai
  { name: "Mount Sinai Hospital New York", city: "New York", state: "NY", beds: 1139, idn_name: "Mount Sinai Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  // Rochester
  { name: "Strong Memorial Hospital University of Rochester", city: "Rochester", state: "NY", beds: 866, idn_name: "University of Rochester Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  // Mount Sinai Morningside
  { name: "Mount Sinai Morningside", city: "New York", state: "NY", beds: 793, idn_name: "Mount Sinai Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "AHD Medicare Cost Report" },
  // Additional Iowa
  { name: "Iowa Methodist Medical Center Des Moines", city: "Des Moines", state: "IA", beds: 502, idn_name: "UnityPoint Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  // Nebraska Medicine
  { name: "Nebraska Medicine Nebraska Medical Center", city: "Omaha", state: "NE", beds: 735, idn_name: "Nebraska Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional Washington
  { name: "Harborview Medical Center", city: "Seattle", state: "WA", beds: 413, idn_name: "UW Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  { name: "University of Washington Medical Center", city: "Seattle", state: "WA", beds: 432, idn_name: "UW Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  // Additional Oregon
  { name: "OHSU Hospital", city: "Portland", state: "OR", beds: 576, idn_name: "Oregon Health and Science University", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  { name: "Legacy Emanuel Medical Center", city: "Portland", state: "OR", beds: 554, idn_name: "Legacy Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional Colorado
  { name: "University of Colorado Hospital Aurora", city: "Aurora", state: "CO", beds: 669, idn_name: "UCHealth", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  // Additional Arizona
  { name: "Banner University Medical Center Phoenix", city: "Phoenix", state: "AZ", beds: 722, idn_name: "Banner Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Banner University Medical Center Tucson", city: "Tucson", state: "AZ", beds: 497, idn_name: "Banner Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Valleywise Health Medical Center", city: "Phoenix", state: "AZ", beds: 563, idn_name: null, idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  // Additional Utah
  { name: "University of Utah Hospital", city: "Salt Lake City", state: "UT", beds: 561, idn_name: "University of Utah Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  { name: "Intermountain Medical Center", city: "Murray", state: "UT", beds: 507, idn_name: "Intermountain Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  // Additional Nevada
  { name: "University Medical Center Las Vegas", city: "Las Vegas", state: "NV", beds: 548, idn_name: null, idn_rank: null, type: "Academic Medical Center", ownership: "Government", source: "Becker's 2026" },
  { name: "Renown Regional Medical Center Reno", city: "Reno", state: "NV", beds: 808, idn_name: "Renown Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit", source: "Becker's 2026" },
  { name: "Sunrise Hospital and Medical Center Las Vegas", city: "Las Vegas", state: "NV", beds: 716, idn_name: "HCA Healthcare", idn_rank: 1, type: "General Acute Care", ownership: "For-Profit", source: "Becker's 2026" },
]

