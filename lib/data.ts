// ─── Core data types ────────────────────────────────────────────────────────

export interface IDN {
  id: number;
  name: string;
  hq_state: string;
  hospital_count: number;
  total_beds: number;
  net_patient_revenue: number; // $B
  annual_discharges: number;
  ownership: "For-Profit" | "Non-Profit" | "Government" | "Religious";
  color: string;
}

export interface Hospital {
  id: number;
  name: string;
  city: string;
  state: string;
  beds: number | null;
  idn_id: number | null;
  idn_name: string | null;
  type: "General Acute" | "Teaching" | "Children's" | "Critical Access" | "Specialty" | "Psychiatric";
  ownership: "Non-Profit" | "For-Profit" | "Government" | "Religious";
}

// ─── Top 20 IDNs  (sources: Ampliz 2026, Becker's 2026, Definitive HC) ─────

export const IDN_DATA: IDN[] = [
  { id: 1,  name: "HCA Healthcare",              hq_state: "TN", hospital_count: 222, total_beds: 42190, net_patient_revenue: 42.7, annual_discharges: 1923773, ownership: "For-Profit",  color: "#e74c3c" },
  { id: 2,  name: "Universal Health Services",   hq_state: "PA", hospital_count: 187, total_beds: 20800, net_patient_revenue: 15.1, annual_discharges: 840000,  ownership: "For-Profit",  color: "#e67e22" },
  { id: 3,  name: "Encompass Health",             hq_state: "AL", hospital_count: 178, total_beds: 19200, net_patient_revenue: 5.4,  annual_discharges: 290000,  ownership: "For-Profit",  color: "#f39c12" },
  { id: 4,  name: "CommonSpirit Health",          hq_state: "IL", hospital_count: 197, total_beds: 23358, net_patient_revenue: 29.4, annual_discharges: 959084,  ownership: "Religious",   color: "#8e44ad" },
  { id: 5,  name: "Ascension Health",             hq_state: "MO", hospital_count: 117, total_beds: 16713, net_patient_revenue: 18.8, annual_discharges: 679089,  ownership: "Religious",   color: "#9b59b6" },
  { id: 6,  name: "Kaiser Permanente",            hq_state: "CA", hospital_count: 43,  total_beds: 9625,  net_patient_revenue: 29.2, annual_discharges: 444072,  ownership: "Non-Profit",  color: "#2980b9" },
  { id: 7,  name: "Tenet Healthcare",             hq_state: "TX", hospital_count: 60,  total_beds: 14800, net_patient_revenue: 20.5, annual_discharges: 710000,  ownership: "For-Profit",  color: "#c0392b" },
  { id: 8,  name: "Trinity Health",               hq_state: "MI", hospital_count: 88,  total_beds: 14200, net_patient_revenue: 21.5, annual_discharges: 680000,  ownership: "Religious",   color: "#16a085" },
  { id: 9,  name: "Providence Health & Services", hq_state: "WA", hospital_count: 56,  total_beds: 10345, net_patient_revenue: 16.3, annual_discharges: 463500,  ownership: "Religious",   color: "#1abc9c" },
  { id: 10, name: "Advocate Health",              hq_state: "NC", hospital_count: 68,  total_beds: 12800, net_patient_revenue: 23.1, annual_discharges: 690000,  ownership: "Non-Profit",  color: "#27ae60" },
  { id: 11, name: "Northwell Health",             hq_state: "NY", hospital_count: 21,  total_beds: 8200,  net_patient_revenue: 17.8, annual_discharges: 405000,  ownership: "Non-Profit",  color: "#2ecc71" },
  { id: 12, name: "Mass General Brigham",         hq_state: "MA", hospital_count: 16,  total_beds: 6400,  net_patient_revenue: 18.2, annual_discharges: 273000,  ownership: "Non-Profit",  color: "#3498db" },
  { id: 13, name: "AdventHealth",                 hq_state: "FL", hospital_count: 57,  total_beds: 22000, net_patient_revenue: 13.2, annual_discharges: 550000,  ownership: "Religious",   color: "#00857c" },
  { id: 14, name: "Dignity Health (CommonSpirit)",hq_state: "CA", hospital_count: 40,  total_beds: 8700,  net_patient_revenue: 8.4,  annual_discharges: 290000,  ownership: "Religious",   color: "#a569bd" },
  { id: 15, name: "Sutter Health",                hq_state: "CA", hospital_count: 24,  total_beds: 5300,  net_patient_revenue: 15.4, annual_discharges: 240000,  ownership: "Non-Profit",  color: "#45b39d" },
  { id: 16, name: "Banner Health",                hq_state: "AZ", hospital_count: 33,  total_beds: 6800,  net_patient_revenue: 9.4,  annual_discharges: 310000,  ownership: "Non-Profit",  color: "#1a8db5" },
  { id: 17, name: "Intermountain Health",         hq_state: "UT", hospital_count: 33,  total_beds: 6100,  net_patient_revenue: 11.2, annual_discharges: 338000,  ownership: "Non-Profit",  color: "#2471a3" },
  { id: 18, name: "Memorial Hermann Health",      hq_state: "TX", hospital_count: 17,  total_beds: 5400,  net_patient_revenue: 6.8,  annual_discharges: 195000,  ownership: "Non-Profit",  color: "#28b463" },
  { id: 19, name: "Cedars-Sinai Health System",   hq_state: "CA", hospital_count: 5,   total_beds: 1900,  net_patient_revenue: 5.2,  annual_discharges: 107000,  ownership: "Non-Profit",  color: "#1f618d" },
  { id: 20, name: "OhioHealth",                   hq_state: "OH", hospital_count: 15,  total_beds: 4200,  net_patient_revenue: 5.1,  annual_discharges: 198000,  ownership: "Non-Profit",  color: "#117a65" },
];

// ─── Hospital data  (sources: Becker's 2026, Definitive HC, Wikipedia, AHA) ─
// Includes top ~80 large hospitals + representative sample from each IDN

export const HOSPITAL_DATA: Hospital[] = [
  // ── MEGA (1000+ beds) ──────────────────────────────────────────────────────
  { id: 1,  name: "AdventHealth Orlando",                    city: "Orlando",       state: "FL", beds: 2247, idn_id: 13, idn_name: "AdventHealth",              type: "Teaching",       ownership: "Non-Profit" },
  { id: 2,  name: "Montefiore Medical Center",               city: "Bronx",         state: "NY", beds: 1558, idn_id: null, idn_name: "Montefiore Health",        type: "Teaching",       ownership: "Non-Profit" },
  { id: 3,  name: "Jackson Memorial Hospital",               city: "Miami",         state: "FL", beds: 1550, idn_id: null, idn_name: "Jackson Health System",    type: "Teaching",       ownership: "Government" },
  { id: 4,  name: "Yale New Haven Hospital",                 city: "New Haven",     state: "CT", beds: 1541, idn_id: null, idn_name: "Yale New Haven Health",    type: "Teaching",       ownership: "Non-Profit" },
  { id: 5,  name: "UAB Hospital",                            city: "Birmingham",    state: "AL", beds: 1400, idn_id: null, idn_name: "UAB Health System",        type: "Teaching",       ownership: "Government" },
  { id: 6,  name: "Barnes-Jewish Hospital",                  city: "St. Louis",     state: "MO", beds: 1315, idn_id: null, idn_name: "BJC HealthCare",           type: "Teaching",       ownership: "Non-Profit" },
  { id: 7,  name: "Cleveland Clinic",                        city: "Cleveland",     state: "OH", beds: 1299, idn_id: null, idn_name: "Cleveland Clinic",         type: "Teaching",       ownership: "Non-Profit" },
  { id: 8,  name: "Mayo Clinic – Saint Marys Campus",        city: "Rochester",     state: "MN", beds: 1265, idn_id: null, idn_name: "Mayo Clinic",              type: "Teaching",       ownership: "Non-Profit" },
  { id: 9,  name: "The Johns Hopkins Hospital",              city: "Baltimore",     state: "MD", beds: 1145, idn_id: null, idn_name: "Johns Hopkins Medicine",   type: "Teaching",       ownership: "Non-Profit" },
  { id: 10, name: "UF Health Shands Hospital",               city: "Gainesville",   state: "FL", beds: 1145, idn_id: null, idn_name: "UF Health",                type: "Teaching",       ownership: "Non-Profit" },
  { id: 11, name: "Mount Sinai Hospital",                    city: "New York",      state: "NY", beds: 1139, idn_id: null, idn_name: "Mount Sinai Health",       type: "Teaching",       ownership: "Non-Profit" },
  { id: 12, name: "Memorial Hermann Texas Medical Center",   city: "Houston",       state: "TX", beds: 1137, idn_id: 18, idn_name: "Memorial Hermann Health",   type: "Teaching",       ownership: "Non-Profit" },
  { id: 13, name: "Saint Francis Hospital",                  city: "Tulsa",         state: "OK", beds: 1112, idn_id: null, idn_name: "Saint Francis Health",     type: "General Acute",  ownership: "Non-Profit" },
  { id: 14, name: "Duke University Hospital",                city: "Durham",        state: "NC", beds: 1106, idn_id: null, idn_name: "Duke Health",              type: "Teaching",       ownership: "Non-Profit" },
  { id: 15, name: "Corewell Health William Beaumont Univ.",  city: "Royal Oak",     state: "MI", beds: 1090, idn_id: null, idn_name: "Corewell Health",          type: "Teaching",       ownership: "Non-Profit" },
  { id: 16, name: "Bergen New Bridge Medical Center",        city: "Paramus",       state: "NJ", beds: 1070, idn_id: null, idn_name: "Bergen New Bridge",        type: "General Acute",  ownership: "Non-Profit" },
  { id: 17, name: "Atrium Health Carolinas Medical Center",  city: "Charlotte",     state: "NC", beds: 1064, idn_id: null, idn_name: "Advocate Health",          type: "Teaching",       ownership: "Non-Profit" },
  { id: 18, name: "Massachusetts General Hospital",          city: "Boston",        state: "MA", beds: 1059, idn_id: 12, idn_name: "Mass General Brigham",      type: "Teaching",       ownership: "Non-Profit" },
  { id: 19, name: "OhioHealth Riverside Methodist Hospital", city: "Columbus",      state: "OH", beds: 1059, idn_id: 20, idn_name: "OhioHealth",                type: "Teaching",       ownership: "Non-Profit" },
  { id: 20, name: "Michigan Medicine",                       city: "Ann Arbor",     state: "MI", beds: 1043, idn_id: null, idn_name: "Michigan Medicine",        type: "Teaching",       ownership: "Government" },
  { id: 21, name: "Christiana Hospital",                     city: "Newark",        state: "DE", beds: 1039, idn_id: null, idn_name: "ChristianaCare",           type: "General Acute",  ownership: "Non-Profit" },
  { id: 22, name: "UH Cleveland Medical Center",             city: "Cleveland",     state: "OH", beds: 1032, idn_id: null, idn_name: "University Hospitals",     type: "Teaching",       ownership: "Non-Profit" },
  { id: 23, name: "Baptist Hospital of Miami",               city: "Miami",         state: "FL", beds: 1020, idn_id: null, idn_name: "Baptist Health S. Florida",type: "General Acute",  ownership: "Non-Profit" },
  { id: 24, name: "Tampa General Hospital",                  city: "Tampa",         state: "FL", beds: 1017, idn_id: null, idn_name: "Tampa General",            type: "Teaching",       ownership: "Non-Profit" },
  { id: 25, name: "Ochsner Medical Center",                  city: "New Orleans",   state: "LA", beds: 1023, idn_id: null, idn_name: "Ochsner Health",           type: "Teaching",       ownership: "Non-Profit" },
  // ── 800–999 beds ──────────────────────────────────────────────────────────
  { id: 26, name: "Northwestern Memorial Hospital",          city: "Chicago",       state: "IL", beds: 930,  idn_id: null, idn_name: "Northwestern Medicine",    type: "Teaching",       ownership: "Non-Profit" },
  { id: 27, name: "Brigham and Women's Hospital",            city: "Boston",        state: "MA", beds: 826,  idn_id: 12, idn_name: "Mass General Brigham",      type: "Teaching",       ownership: "Non-Profit" },
  { id: 28, name: "Cedars-Sinai Medical Center",             city: "Los Angeles",   state: "CA", beds: 908,  idn_id: 19, idn_name: "Cedars-Sinai",              type: "Teaching",       ownership: "Non-Profit" },
  { id: 29, name: "Texas Children's Hospital",               city: "Houston",       state: "TX", beds: 905,  idn_id: null, idn_name: "Texas Children's",         type: "Children's",     ownership: "Non-Profit" },
  { id: 30, name: "Huntsville Hospital",                     city: "Huntsville",    state: "AL", beds: 904,  idn_id: null, idn_name: "Huntsville Hospital Health",type: "General Acute",  ownership: "Non-Profit" },
  { id: 31, name: "Miami Valley Hospital",                   city: "Dayton",        state: "OH", beds: 899,  idn_id: null, idn_name: "Premier Health",           type: "General Acute",  ownership: "Non-Profit" },
  { id: 32, name: "Inova Fairfax Hospital",                  city: "Falls Church",  state: "VA", beds: 908,  idn_id: null, idn_name: "Inova Health System",      type: "Teaching",       ownership: "Non-Profit" },
  { id: 33, name: "Thomas Jefferson University Hospital",    city: "Philadelphia",  state: "PA", beds: 868,  idn_id: null, idn_name: "Jefferson Health",         type: "Teaching",       ownership: "Non-Profit" },
  { id: 34, name: "Aurora St. Luke's Medical Center",        city: "Milwaukee",     state: "WI", beds: 932,  idn_id: null, idn_name: "Advocate Aurora Health",   type: "Teaching",       ownership: "Non-Profit" },
  { id: 35, name: "Lehigh Valley Hospital Cedar Crest",      city: "Allentown",     state: "PA", beds: 888,  idn_id: null, idn_name: "Lehigh Valley Health Network",type:"Teaching",      ownership: "Non-Profit" },
  // ── 500–799 beds ──────────────────────────────────────────────────────────
  { id: 36, name: "AdventHealth Tampa",                      city: "Tampa",         state: "FL", beds: 559,  idn_id: 13, idn_name: "AdventHealth",              type: "General Acute",  ownership: "Non-Profit" },
  { id: 37, name: "AdventHealth Shawnee Mission",            city: "Merriam",       state: "KS", beds: 504,  idn_id: 13, idn_name: "AdventHealth",              type: "Teaching",       ownership: "Non-Profit" },
  { id: 38, name: "AdventHealth Winter Park",                city: "Winter Park",   state: "FL", beds: 521,  idn_id: 13, idn_name: "AdventHealth",              type: "General Acute",  ownership: "Non-Profit" },
  { id: 39, name: "AdventHealth Redmond",                    city: "Rome",          state: "GA", beds: 530,  idn_id: 13, idn_name: "AdventHealth",              type: "General Acute",  ownership: "Non-Profit" },
  { id: 40, name: "HCA Florida Kendall Hospital",            city: "Miami",         state: "FL", beds: 515,  idn_id: 1,  idn_name: "HCA Healthcare",            type: "General Acute",  ownership: "For-Profit" },
  { id: 41, name: "Methodist Hospital San Antonio",          city: "San Antonio",   state: "TX", beds: 786,  idn_id: null, idn_name: "Methodist Healthcare",     type: "General Acute",  ownership: "For-Profit" },
  { id: 42, name: "NewYork-Presbyterian Weill Cornell",      city: "New York",      state: "NY", beds: 862,  idn_id: null, idn_name: "NewYork-Presbyterian",     type: "Teaching",       ownership: "Non-Profit" },
  { id: 43, name: "St. David's Medical Center",              city: "Austin",        state: "TX", beds: 560,  idn_id: 1,  idn_name: "HCA Healthcare",            type: "General Acute",  ownership: "For-Profit" },
  { id: 44, name: "Houston Methodist Hospital",              city: "Houston",       state: "TX", beds: 976,  idn_id: null, idn_name: "Houston Methodist",        type: "Teaching",       ownership: "Non-Profit" },
  { id: 45, name: "University of Kansas Hospital",           city: "Kansas City",   state: "KS", beds: 955,  idn_id: null, idn_name: "The Univ. of Kansas Health",type:"Teaching",       ownership: "Non-Profit" },
  // ── 300–499 beds ──────────────────────────────────────────────────────────
  { id: 46, name: "AdventHealth Daytona Beach",              city: "Daytona Beach", state: "FL", beds: 362,  idn_id: 13, idn_name: "AdventHealth",              type: "General Acute",  ownership: "Non-Profit" },
  { id: 47, name: "AdventHealth Altamonte Springs",          city: "Altamonte Spr.",state: "FL", beds: 341,  idn_id: 13, idn_name: "AdventHealth",              type: "General Acute",  ownership: "Non-Profit" },
  { id: 48, name: "AdventHealth Porter (Denver)",            city: "Denver",        state: "CO", beds: 368,  idn_id: 13, idn_name: "AdventHealth",              type: "General Acute",  ownership: "Non-Profit" },
  { id: 49, name: "HCA Florida Blake Hospital",              city: "Bradenton",     state: "FL", beds: 383,  idn_id: 1,  idn_name: "HCA Healthcare",            type: "General Acute",  ownership: "For-Profit" },
  { id: 50, name: "Tenet Hahnemann Univ. Hospital",          city: "Philadelphia",  state: "PA", beds: 496,  idn_id: 7,  idn_name: "Tenet Healthcare",          type: "Teaching",       ownership: "For-Profit" },
  { id: 51, name: "Ascension St. Vincent Indianapolis",      city: "Indianapolis",  state: "IN", beds: 473,  idn_id: 5,  idn_name: "Ascension Health",          type: "General Acute",  ownership: "Religious"  },
  { id: 52, name: "Providence Regional Medical Center",      city: "Everett",       state: "WA", beds: 512,  idn_id: 9,  idn_name: "Providence Health",         type: "General Acute",  ownership: "Religious"  },
  { id: 53, name: "Banner University Medical Center",        city: "Phoenix",       state: "AZ", beds: 483,  idn_id: 16, idn_name: "Banner Health",             type: "Teaching",       ownership: "Non-Profit" },
  { id: 54, name: "Intermountain Medical Center",            city: "Murray",        state: "UT", beds: 427,  idn_id: 17, idn_name: "Intermountain Health",      type: "General Acute",  ownership: "Non-Profit" },
  { id: 55, name: "Sutter Medical Center Sacramento",        city: "Sacramento",    state: "CA", beds: 452,  idn_id: 15, idn_name: "Sutter Health",             type: "General Acute",  ownership: "Non-Profit" },
  // ── 100–299 beds (sample) ─────────────────────────────────────────────────
  { id: 56, name: "AdventHealth Sebring",                    city: "Sebring",       state: "FL", beds: 204,  idn_id: 13, idn_name: "AdventHealth",              type: "General Acute",  ownership: "Non-Profit" },
  { id: 57, name: "AdventHealth Wesley Chapel",              city: "Wesley Chapel", state: "FL", beds: 169,  idn_id: 13, idn_name: "AdventHealth",              type: "General Acute",  ownership: "Non-Profit" },
  { id: 58, name: "HCA Houston Healthcare Kingwood",         city: "Kingwood",      state: "TX", beds: 263,  idn_id: 1,  idn_name: "HCA Healthcare",            type: "General Acute",  ownership: "For-Profit" },
  { id: 59, name: "Tenet Doctors Hospital",                  city: "Augusta",       state: "GA", beds: 162,  idn_id: 7,  idn_name: "Tenet Healthcare",          type: "General Acute",  ownership: "For-Profit" },
  { id: 60, name: "Advocate BroMenn Medical Center",         city: "Normal",        state: "IL", beds: 221,  idn_id: 10, idn_name: "Advocate Health",           type: "General Acute",  ownership: "Non-Profit" },
  { id: 61, name: "Kaiser Permanente Oakland Medical Ctr",   city: "Oakland",       state: "CA", beds: 280,  idn_id: 6,  idn_name: "Kaiser Permanente",         type: "General Acute",  ownership: "Non-Profit" },
  { id: 62, name: "Trinity Health Grand Rapids",             city: "Grand Rapids",  state: "MI", beds: 294,  idn_id: 8,  idn_name: "Trinity Health",            type: "General Acute",  ownership: "Religious"  },
  { id: 63, name: "AdventHealth UChicago Hinsdale",          city: "Hinsdale",      state: "IL", beds: 261,  idn_id: 13, idn_name: "AdventHealth",              type: "General Acute",  ownership: "Non-Profit" },
  { id: 64, name: "UHS Universal Behavioral Health",         city: "King of Prussia",state:"PA", beds: 210,  idn_id: 2,  idn_name: "Universal Health Services", type: "Psychiatric",    ownership: "For-Profit" },
  { id: 65, name: "Encompass Health Rehab Birmingham",       city: "Birmingham",    state: "AL", beds: 150,  idn_id: 3,  idn_name: "Encompass Health",          type: "Specialty",      ownership: "For-Profit" },
  // ── Critical Access / Small (<100 beds) ──────────────────────────────────
  { id: 66, name: "AdventHealth Gordon",                     city: "Calhoun",       state: "GA", beds: 69,   idn_id: 13, idn_name: "AdventHealth",              type: "Critical Access",ownership: "Non-Profit" },
  { id: 67, name: "AdventHealth Manchester",                 city: "Manchester",    state: "KY", beds: 49,   idn_id: 13, idn_name: "AdventHealth",              type: "Critical Access",ownership: "Non-Profit" },
  { id: 68, name: "AdventHealth Lake Placid",                city: "Lake Placid",   state: "FL", beds: 33,   idn_id: 13, idn_name: "AdventHealth",              type: "Critical Access",ownership: "Non-Profit" },
  { id: 69, name: "HCA Brigham City Community Hospital",     city: "Brigham City",  state: "UT", beds: 39,   idn_id: 1,  idn_name: "HCA Healthcare",            type: "Critical Access",ownership: "For-Profit" },
  { id: 70, name: "Banner Lassen Medical Center",            city: "Susanville",    state: "CA", beds: 25,   idn_id: 16, idn_name: "Banner Health",             type: "Critical Access",ownership: "Non-Profit" },
];

// ─── Bed size distribution (AHA 2022/2023 + Definitive HC estimates) ────────

export const BED_DISTRIBUTION = [
  { range: "<25",     aha_count: 1356, pct: 22.2 },
  { range: "25–49",   aha_count: 1473, pct: 24.1 },
  { range: "50–99",   aha_count: 862,  pct: 14.1 },
  { range: "100–199", aha_count: 992,  pct: 16.2 },
  { range: "200–299", aha_count: 512,  pct: 8.4  },
  { range: "300–399", aha_count: 308,  pct: 5.0  },
  { range: "400–499", aha_count: 155,  pct: 2.5  },
  { range: "500–799", aha_count: 240,  pct: 3.9  },
  { range: "800+",    aha_count: 242,  pct: 4.0  },
];
