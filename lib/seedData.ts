// SQL schema and seed data for Supabase
// Run this in your Supabase SQL editor to set up the database

export const SCHEMA_SQL = `
-- Drop existing tables if they exist
drop table if exists idn_hospitals cascade;
drop table if exists idn_groups cascade;
drop table if exists hospitals cascade;

-- IDN Groups table
create table idn_groups (
  id serial primary key,
  rank integer not null,
  name text not null,
  hq_city text not null,
  hq_state text not null,
  total_hospitals integer not null,
  total_beds integer not null,
  net_patient_revenue_b numeric,
  ownership_type text not null,
  states_covered integer not null default 1,
  created_at timestamptz default now()
);

-- Individual hospitals within IDNs (top hospitals per IDN)
create table idn_hospitals (
  id serial primary key,
  idn_id integer references idn_groups(id) on delete cascade,
  hospital_name text not null,
  city text not null,
  state text not null,
  beds integer
);

-- All US hospitals with bed data
create table hospitals (
  id serial primary key,
  name text not null,
  city text not null,
  state text not null,
  beds integer,
  idn_name text,
  idn_rank integer,
  type text default 'General Acute Care',
  ownership text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (allow public reads)
alter table idn_groups enable row level security;
alter table idn_hospitals enable row level security;
alter table hospitals enable row level security;

create policy "Public read" on idn_groups for select using (true);
create policy "Public read" on idn_hospitals for select using (true);
create policy "Public read" on hospitals for select using (true);
create policy "Auth insert" on hospitals for insert with check (true);
create policy "Auth update" on hospitals for update using (true);
create policy "Auth delete" on hospitals for delete using (true);
`;

// Top 20 IDN Groups (sourced from Becker's 2026, Definitive Health, AHA)
export const IDN_GROUPS = [
  { rank: 1,  name: "HCA Healthcare",            hq_city: "Nashville",       hq_state: "TN", total_hospitals: 190, total_beds: 41000, net_patient_revenue_b: 56.3, ownership_type: "For-Profit",   states_covered: 21 },
  { rank: 2,  name: "Veterans Health Administration", hq_city: "Washington", hq_state: "DC", total_hospitals: 170, total_beds: 25200, net_patient_revenue_b: null, ownership_type: "Government",   states_covered: 50 },
  { rank: 3,  name: "CommonSpirit Health",        hq_city: "Chicago",         hq_state: "IL", total_hospitals: 158, total_beds: 19000, net_patient_revenue_b: 29.4, ownership_type: "Non-Profit",   states_covered: 21 },
  { rank: 4,  name: "LifePoint Health",           hq_city: "Brentwood",       hq_state: "TN", total_hospitals: 135, total_beds: 16000, net_patient_revenue_b: 10.2, ownership_type: "For-Profit",   states_covered: 30 },
  { rank: 5,  name: "Ascension Health",           hq_city: "St. Louis",       hq_state: "MO", total_hospitals: 119, total_beds: 15162, net_patient_revenue_b: 22.0, ownership_type: "Non-Profit",   states_covered: 19 },
  { rank: 6,  name: "ScionHealth",                hq_city: "Louisville",       hq_state: "KY", total_hospitals: 94,  total_beds: 8200,  net_patient_revenue_b: 4.1,  ownership_type: "For-Profit",   states_covered: 25 },
  { rank: 7,  name: "Trinity Health",             hq_city: "Livonia",          hq_state: "MI", total_hospitals: 92,  total_beds: 14914, net_patient_revenue_b: 19.5, ownership_type: "Non-Profit",   states_covered: 26 },
  { rank: 8,  name: "Advocate Health",            hq_city: "Charlotte",        hq_state: "NC", total_hospitals: 69,  total_beds: 10615, net_patient_revenue_b: 27.0, ownership_type: "Non-Profit",   states_covered: 6  },
  { rank: 9,  name: "Christus Health",            hq_city: "Irving",           hq_state: "TX", total_hospitals: 66,  total_beds: 7500,  net_patient_revenue_b: 7.2,  ownership_type: "Non-Profit",   states_covered: 7  },
  { rank: 10, name: "Community Health Systems",   hq_city: "Franklin",         hq_state: "TN", total_hospitals: 65,  total_beds: 9046,  net_patient_revenue_b: 12.3, ownership_type: "For-Profit",   states_covered: 16 },
  { rank: 11, name: "AdventHealth",               hq_city: "Altamonte Springs",hq_state: "FL", total_hospitals: 57,  total_beds: 8809,  net_patient_revenue_b: 14.0, ownership_type: "Non-Profit",   states_covered: 9  },
  { rank: 12, name: "Sanford Health",             hq_city: "Sioux Falls",      hq_state: "SD", total_hospitals: 56,  total_beds: 5800,  net_patient_revenue_b: 6.8,  ownership_type: "Non-Profit",   states_covered: 9  },
  { rank: 13, name: "Mercy",                      hq_city: "St. Louis",        hq_state: "MO", total_hospitals: 55,  total_beds: 7200,  net_patient_revenue_b: 8.1,  ownership_type: "Non-Profit",   states_covered: 6  },
  { rank: 14, name: "Prime Healthcare",           hq_city: "Ontario",          hq_state: "CA", total_hospitals: 54,  total_beds: 6324,  net_patient_revenue_b: 4.5,  ownership_type: "For-Profit",   states_covered: 14 },
  { rank: 15, name: "Baylor Scott & White Health",hq_city: "Dallas",           hq_state: "TX", total_hospitals: 53,  total_beds: 7100,  net_patient_revenue_b: 11.2, ownership_type: "Non-Profit",   states_covered: 3  },
  { rank: 16, name: "Providence",                 hq_city: "Renton",           hq_state: "WA", total_hospitals: 51,  total_beds: 9256,  net_patient_revenue_b: 24.0, ownership_type: "Non-Profit",   states_covered: 6  },
  { rank: 17, name: "Tenet Healthcare",           hq_city: "Dallas",           hq_state: "TX", total_hospitals: 50,  total_beds: 12073, net_patient_revenue_b: 20.0, ownership_type: "For-Profit",   states_covered: 18 },
  { rank: 18, name: "Bon Secours Mercy Health",   hq_city: "Cincinnati",       hq_state: "OH", total_hospitals: 47,  total_beds: 5500,  net_patient_revenue_b: 11.0, ownership_type: "Non-Profit",   states_covered: 7  },
  { rank: 19, name: "Ochsner Health",             hq_city: "New Orleans",      hq_state: "LA", total_hospitals: 47,  total_beds: 4800,  net_patient_revenue_b: 4.7,  ownership_type: "Non-Profit",   states_covered: 4  },
  { rank: 20, name: "UPMC",                       hq_city: "Pittsburgh",       hq_state: "PA", total_hospitals: 40,  total_beds: 8000,  net_patient_revenue_b: 26.0, ownership_type: "Non-Profit",   states_covered: 5  },
];

// Key hospitals per IDN (flagship/notable hospitals)
export const IDN_HOSPITALS: { idn_rank: number; hospitals: { name: string; city: string; state: string; beds: number | null }[] }[] = [
  { idn_rank: 1, hospitals: [
    { name: "HCA Florida Kendall Hospital", city: "Miami", state: "FL", beds: 725 },
    { name: "Sunrise Hospital & Medical Center", city: "Las Vegas", state: "NV", beds: 716 },
    { name: "Medical City Dallas", city: "Dallas", state: "TX", beds: 694 },
    { name: "Chippenham Hospital", city: "Richmond", state: "VA", beds: 670 },
    { name: "HCA Florida Blake Hospital", city: "Bradenton", state: "FL", beds: 383 },
    { name: "HCA Houston Healthcare West", city: "Houston", state: "TX", beds: 359 },
    { name: "St. David's Medical Center", city: "Austin", state: "TX", beds: 354 },
    { name: "Coliseum Medical Centers", city: "Macon", state: "GA", beds: 310 },
  ]},
  { idn_rank: 2, hospitals: [
    { name: "VA New York Harbor Healthcare", city: "New York", state: "NY", beds: 450 },
    { name: "VA Greater Los Angeles", city: "Los Angeles", state: "CA", beds: 389 },
    { name: "VA Medical Center – Houston", city: "Houston", state: "TX", beds: 479 },
    { name: "VA Medical Center – Chicago", city: "Chicago", state: "IL", beds: 215 },
    { name: "VA Medical Center – Boston", city: "Boston", state: "MA", beds: 375 },
    { name: "VA Medical Center – Pittsburgh", city: "Pittsburgh", state: "PA", beds: 186 },
  ]},
  { idn_rank: 3, hospitals: [
    { name: "Dignity Health St. Joseph Medical Center", city: "Stockton", state: "CA", beds: 395 },
    { name: "CHI St. Luke's Health–Baylor St. Luke's", city: "Houston", state: "TX", beds: 850 },
    { name: "Mercy Medical Center", city: "Des Moines", state: "IA", beds: 802 },
    { name: "St. Anthony Hospital", city: "Oklahoma City", state: "OK", beds: 555 },
    { name: "Penrose Hospital", city: "Colorado Springs", state: "CO", beds: 364 },
  ]},
  { idn_rank: 4, hospitals: [
    { name: "Conemaugh Memorial Medical Center", city: "Johnstown", state: "PA", beds: 539 },
    { name: "Highpoint Regional Health", city: "High Point", state: "NC", beds: 391 },
    { name: "Lake Cumberland Regional Hospital", city: "Somerset", state: "KY", beds: 295 },
    { name: "Frye Regional Medical Center", city: "Hickory", state: "NC", beds: 355 },
  ]},
  { idn_rank: 5, hospitals: [
    { name: "Ascension Saint Thomas Hospital West", city: "Nashville", state: "TN", beds: 708 },
    { name: "Ascension Providence Rochester Hospital", city: "Rochester Hills", state: "MI", beds: 293 },
    { name: "Ascension Sacred Heart Hospital", city: "Pensacola", state: "FL", beds: 566 },
    { name: "Ascension Seton Medical Center", city: "Austin", state: "TX", beds: 424 },
    { name: "Ascension Via Christi St. Francis", city: "Wichita", state: "KS", beds: 564 },
  ]},
  { idn_rank: 6, hospitals: [
    { name: "Kindred Hospital Louisville", city: "Louisville", state: "KY", beds: 217 },
    { name: "Cornerstone Hospital of Austin", city: "Austin", state: "TX", beds: 118 },
    { name: "St. Luke's Rehabilitation Hospital", city: "Boise", state: "ID", beds: 112 },
  ]},
  { idn_rank: 7, hospitals: [
    { name: "Trinity Health Ann Arbor Hospital", city: "Ann Arbor", state: "MI", beds: 537 },
    { name: "Mercy Medical Center", city: "Baltimore", state: "MD", beds: 174 },
    { name: "Saint Joseph Regional Medical Center", city: "Mishawaka", state: "IN", beds: 254 },
    { name: "St. Mary's Medical Center", city: "Grand Junction", state: "CO", beds: 282 },
  ]},
  { idn_rank: 8, hospitals: [
    { name: "Atrium Health Carolinas Medical Center", city: "Charlotte", state: "NC", beds: 1064 },
    { name: "Advocate Christ Medical Center", city: "Oak Lawn", state: "IL", beds: 695 },
    { name: "Atrium Health Wake Forest Baptist", city: "Winston-Salem", state: "NC", beds: 885 },
    { name: "Atrium Health Navicent Medical Center", city: "Macon", state: "GA", beds: 637 },
    { name: "Advocate Good Samaritan Hospital", city: "Downers Grove", state: "IL", beds: 333 },
  ]},
  { idn_rank: 9, hospitals: [
    { name: "CHRISTUS Mother Frances Hospital – Tyler", city: "Tyler", state: "TX", beds: 433 },
    { name: "CHRISTUS Spohn Hospital Corpus Christi", city: "Corpus Christi", state: "TX", beds: 660 },
    { name: "CHRISTUS Health Shreveport-Bossier", city: "Shreveport", state: "LA", beds: 204 },
  ]},
  { idn_rank: 10, hospitals: [
    { name: "Tennova Healthcare-Cleveland", city: "Cleveland", state: "TN", beds: 186 },
    { name: "Brandywine Hospital", city: "Coatesville", state: "PA", beds: 169 },
    { name: "Plateau Medical Center", city: "Oak Hill", state: "WV", beds: 25 },
    { name: "Flowers Hospital", city: "Dothan", state: "AL", beds: 365 },
  ]},
  { idn_rank: 11, hospitals: [
    { name: "AdventHealth Orlando", city: "Orlando", state: "FL", beds: 1364 },
    { name: "AdventHealth Tampa", city: "Tampa", state: "FL", beds: 559 },
    { name: "AdventHealth Shawnee Mission", city: "Merriam", state: "KS", beds: 504 },
    { name: "AdventHealth Winter Park", city: "Winter Park", state: "FL", beds: 422 },
    { name: "AdventHealth Redmond", city: "Rome", state: "GA", beds: 530 },
    { name: "AdventHealth Daytona Beach", city: "Daytona Beach", state: "FL", beds: 362 },
    { name: "AdventHealth Altamonte Springs", city: "Altamonte Springs", state: "FL", beds: 341 },
    { name: "AdventHealth Porter", city: "Denver", state: "CO", beds: 368 },
  ]},
  { idn_rank: 12, hospitals: [
    { name: "Sanford USD Medical Center", city: "Sioux Falls", state: "SD", beds: 545 },
    { name: "Sanford Medical Center Fargo", city: "Fargo", state: "ND", beds: 559 },
    { name: "Sanford Bemidji Medical Center", city: "Bemidji", state: "MN", beds: 99 },
  ]},
  { idn_rank: 13, hospitals: [
    { name: "Mercy Hospital St. Louis", city: "St. Louis", state: "MO", beds: 815 },
    { name: "Mercy Hospital Springfield", city: "Springfield", state: "MO", beds: 866 },
    { name: "Mercy Hospital Oklahoma City", city: "Oklahoma City", state: "OK", beds: 370 },
    { name: "Mercy Hospital Fort Smith", city: "Fort Smith", state: "AR", beds: 339 },
  ]},
  { idn_rank: 14, hospitals: [
    { name: "Prime Healthcare Centinela Hospital", city: "Inglewood", state: "CA", beds: 369 },
    { name: "St. Mary Medical Center", city: "Long Beach", state: "CA", beds: 389 },
    { name: "Garden Grove Hospital", city: "Garden Grove", state: "CA", beds: 167 },
  ]},
  { idn_rank: 15, hospitals: [
    { name: "Baylor Scott & White Medical Center – Temple", city: "Temple", state: "TX", beds: 636 },
    { name: "Baylor University Medical Center", city: "Dallas", state: "TX", beds: 838 },
    { name: "Scott & White Clinic", city: "Round Rock", state: "TX", beds: 100 },
  ]},
  { idn_rank: 16, hospitals: [
    { name: "Providence Saint Joseph Medical Center", city: "Burbank", state: "CA", beds: 454 },
    { name: "Providence Regional Medical Center Everett", city: "Everett", state: "WA", beds: 511 },
    { name: "Providence Portland Medical Center", city: "Portland", state: "OR", beds: 403 },
    { name: "Swedish Medical Center – First Hill", city: "Seattle", state: "WA", beds: 631 },
  ]},
  { idn_rank: 17, hospitals: [
    { name: "Detroit Medical Center Harper University Hospital", city: "Detroit", state: "MI", beds: 385 },
    { name: "Tenet Health Central Palm Beach", city: "Lantana", state: "FL", beds: 204 },
    { name: "Doctors Hospital at Renaissance", city: "Edinburg", state: "TX", beds: 535 },
    { name: "United Regional Health Care System", city: "Wichita Falls", state: "TX", beds: 298 },
  ]},
  { idn_rank: 18, hospitals: [
    { name: "Mercy Health – Youngstown", city: "Youngstown", state: "OH", beds: 388 },
    { name: "Bon Secours St. Mary's Hospital", city: "Richmond", state: "VA", beds: 391 },
    { name: "St. Elizabeth Medical Center", city: "Edgewood", state: "KY", beds: 551 },
  ]},
  { idn_rank: 19, hospitals: [
    { name: "Ochsner Medical Center – Main Campus", city: "New Orleans", state: "LA", beds: 1023 },
    { name: "Ochsner Medical Center – Baton Rouge", city: "Baton Rouge", state: "LA", beds: 283 },
    { name: "Ochsner St. Anne General Hospital", city: "Raceland", state: "LA", beds: 35 },
  ]},
  { idn_rank: 20, hospitals: [
    { name: "UPMC Presbyterian", city: "Pittsburgh", state: "PA", beds: 757 },
    { name: "UPMC Shadyside", city: "Pittsburgh", state: "PA", beds: 520 },
    { name: "UPMC Children's Hospital of Pittsburgh", city: "Pittsburgh", state: "PA", beds: 296 },
    { name: "UPMC Hamot", city: "Erie", state: "PA", beds: 439 },
  ]},
];

// Comprehensive US hospital data by bed size
// Sources: AHA 2022-2024, Becker's 2023-2026, Definitive Health CSV, Wikipedia
// Covers notable hospitals + representative sample by size category
export const HOSPITALS_DATA = [
  // MEGA HOSPITALS (1000+ beds)
  { name: "AdventHealth Orlando", city: "Orlando", state: "FL", beds: 1364, idn_name: "AdventHealth", idn_rank: 11, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Jackson Memorial Hospital", city: "Miami", state: "FL", beds: 1504, idn_name: null, idn_rank: null, type: "Academic Medical Center", ownership: "Government" },
  { name: "NYU Langone – Tisch Hospital", city: "New York", state: "NY", beds: 1024, idn_name: "NYU Langone Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Barnes-Jewish Hospital", city: "St. Louis", state: "MO", beds: 1216, idn_name: "BJC HealthCare", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Cleveland Clinic Main Campus", city: "Cleveland", state: "OH", beds: 1299, idn_name: "Cleveland Clinic", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Mayo Clinic Hospital – St. Marys Campus", city: "Rochester", state: "MN", beds: 1154, idn_name: "Mayo Clinic", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Montefiore Medical Center – Moses", city: "Bronx", state: "NY", beds: 1444, idn_name: "Montefiore Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "UAB Hospital", city: "Birmingham", state: "AL", beds: 1149, idn_name: "UAB Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Government" },
  { name: "The Johns Hopkins Hospital", city: "Baltimore", state: "MD", beds: 1038, idn_name: "Johns Hopkins Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "UPMC Presbyterian", city: "Pittsburgh", state: "PA", beds: 757, idn_name: "UPMC", idn_rank: 20, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Massachusetts General Hospital", city: "Boston", state: "MA", beds: 997, idn_name: "Mass General Brigham", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Ochsner Medical Center – Main Campus", city: "New Orleans", state: "LA", beds: 1023, idn_name: "Ochsner Health", idn_rank: 19, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Tampa General Hospital", city: "Tampa", state: "FL", beds: 1017, idn_name: null, idn_rank: null, type: "Academic Medical Center", ownership: "Government" },
  { name: "Baptist Medical Center San Antonio", city: "San Antonio", state: "TX", beds: 1498, idn_name: "Baptist Health System", idn_rank: null, type: "General Acute Care", ownership: "For-Profit" },
  { name: "ECU Health Medical Center", city: "Greenville", state: "NC", beds: 1013, idn_name: "ECU Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Atrium Health Carolinas Medical Center", city: "Charlotte", state: "NC", beds: 1064, idn_name: "Advocate Health", idn_rank: 8, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Houston Methodist Hospital", city: "Houston", state: "TX", beds: 976, idn_name: "Houston Methodist", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Memorial Hermann Texas Medical Center", city: "Houston", state: "TX", beds: 1089, idn_name: "Memorial Hermann", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Michigan Medicine – University Hospital", city: "Ann Arbor", state: "MI", beds: 951, idn_name: "Michigan Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Government" },

  // LARGE HOSPITALS (500-999 beds)
  { name: "Lehigh Valley Hospital – Cedar Crest", city: "Allentown", state: "PA", beds: 1190, idn_name: "Lehigh Valley Health Network", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Northwestern Memorial Hospital", city: "Chicago", state: "IL", beds: 930, idn_name: "Northwestern Medicine", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Cedars-Sinai Medical Center", city: "Los Angeles", state: "CA", beds: 908, idn_name: "Cedars-Sinai", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Inova Fairfax Hospital", city: "Falls Church", state: "VA", beds: 908, idn_name: "Inova Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "VCU Medical Center", city: "Richmond", state: "VA", beds: 842, idn_name: "VCU Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government" },
  { name: "Brigham and Women's Hospital", city: "Boston", state: "MA", beds: 826, idn_name: "Mass General Brigham", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Mercy Hospital Springfield", city: "Springfield", state: "MO", beds: 866, idn_name: "Mercy", idn_rank: 13, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Thomas Jefferson University Hospital", city: "Philadelphia", state: "PA", beds: 868, idn_name: "Jefferson Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "AdventHealth Shawnee Mission", city: "Merriam", state: "KS", beds: 504, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Redmond", city: "Rome", state: "GA", beds: 530, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Tampa", city: "Tampa", state: "FL", beds: 559, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "NewYork-Presbyterian/Weill Cornell", city: "New York", state: "NY", beds: 862, idn_name: "NewYork-Presbyterian", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "OhioHealth Riverside Methodist Hospital", city: "Columbus", state: "OH", beds: 1059, idn_name: "OhioHealth", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "UF Health Shands Hospital", city: "Gainesville", state: "FL", beds: 1145, idn_name: "UF Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government" },
  { name: "Duke University Hospital", city: "Durham", state: "NC", beds: 1106, idn_name: "Duke Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "UCSF Medical Center at Parnassus", city: "San Francisco", state: "CA", beds: 834, idn_name: "UCSF Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government" },
  { name: "Sanford USD Medical Center", city: "Sioux Falls", state: "SD", beds: 545, idn_name: "Sanford Health", idn_rank: 12, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Atrium Health Wake Forest Baptist", city: "Winston-Salem", state: "NC", beds: 885, idn_name: "Advocate Health", idn_rank: 8, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Christus Spohn Hospital Corpus Christi", city: "Corpus Christi", state: "TX", beds: 660, idn_name: "Christus Health", idn_rank: 9, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Ascension Sacred Heart Hospital", city: "Pensacola", state: "FL", beds: 566, idn_name: "Ascension Health", idn_rank: 5, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "HCA Florida Kendall Hospital", city: "Miami", state: "FL", beds: 725, idn_name: "HCA Healthcare", idn_rank: 1, type: "General Acute Care", ownership: "For-Profit" },
  { name: "Medical City Dallas", city: "Dallas", state: "TX", beds: 694, idn_name: "HCA Healthcare", idn_rank: 1, type: "General Acute Care", ownership: "For-Profit" },
  { name: "Sunrise Hospital and Medical Center", city: "Las Vegas", state: "NV", beds: 716, idn_name: "HCA Healthcare", idn_rank: 1, type: "General Acute Care", ownership: "For-Profit" },
  { name: "Advocate Christ Medical Center", city: "Oak Lawn", state: "IL", beds: 695, idn_name: "Advocate Health", idn_rank: 8, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Baylor University Medical Center", city: "Dallas", state: "TX", beds: 838, idn_name: "Baylor Scott & White Health", idn_rank: 15, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Swedish Medical Center – First Hill", city: "Seattle", state: "WA", beds: 631, idn_name: "Providence", idn_rank: 16, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Aurora St. Luke's Medical Center", city: "Milwaukee", state: "WI", beds: 932, idn_name: "Advocate Health", idn_rank: 8, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "The University of Kansas Hospital", city: "Kansas City", state: "KS", beds: 955, idn_name: "The University of Kansas Health System", idn_rank: null, type: "Academic Medical Center", ownership: "Government" },
  { name: "St. Elizabeth Medical Center", city: "Edgewood", state: "KY", beds: 551, idn_name: "Bon Secours Mercy Health", idn_rank: 18, type: "General Acute Care", ownership: "Non-Profit" },

  // MID-SIZE HOSPITALS (200-499 beds) - representative sample
  { name: "AdventHealth Altamonte Springs", city: "Altamonte Springs", state: "FL", beds: 341, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Porter", city: "Denver", state: "CO", beds: 368, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth East Orlando", city: "Orlando", state: "FL", beds: 295, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Celebration", city: "Celebration", state: "FL", beds: 227, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Waterman", city: "Tavares", state: "FL", beds: 288, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Heart of Florida", city: "Davenport", state: "FL", beds: 202, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Sebring", city: "Sebring", state: "FL", beds: 204, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "UPMC Shadyside", city: "Pittsburgh", state: "PA", beds: 520, idn_name: "UPMC", idn_rank: 20, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "UPMC Hamot", city: "Erie", state: "PA", beds: 439, idn_name: "UPMC", idn_rank: 20, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "St. David's Medical Center", city: "Austin", state: "TX", beds: 354, idn_name: "HCA Healthcare", idn_rank: 1, type: "General Acute Care", ownership: "For-Profit" },
  { name: "Flowers Hospital", city: "Dothan", state: "AL", beds: 365, idn_name: "Community Health Systems", idn_rank: 10, type: "General Acute Care", ownership: "For-Profit" },
  { name: "Ochsner Medical Center Baton Rouge", city: "Baton Rouge", state: "LA", beds: 283, idn_name: "Ochsner Health", idn_rank: 19, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Ascension Saint Thomas Hospital West", city: "Nashville", state: "TN", beds: 708, idn_name: "Ascension Health", idn_rank: 5, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Ascension Via Christi St. Francis", city: "Wichita", state: "KS", beds: 564, idn_name: "Ascension Health", idn_rank: 5, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Sanford Medical Center Fargo", city: "Fargo", state: "ND", beds: 559, idn_name: "Sanford Health", idn_rank: 12, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Mercy Hospital Oklahoma City", city: "Oklahoma City", state: "OK", beds: 370, idn_name: "Mercy", idn_rank: 13, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Providence Regional Medical Center Everett", city: "Everett", state: "WA", beds: 511, idn_name: "Providence", idn_rank: 16, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Trinity Health Ann Arbor Hospital", city: "Ann Arbor", state: "MI", beds: 537, idn_name: "Trinity Health", idn_rank: 7, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Conemaugh Memorial Medical Center", city: "Johnstown", state: "PA", beds: 539, idn_name: "LifePoint Health", idn_rank: 4, type: "General Acute Care", ownership: "For-Profit" },
  { name: "Baylor Scott & White Medical Center Temple", city: "Temple", state: "TX", beds: 636, idn_name: "Baylor Scott & White Health", idn_rank: 15, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Daytona Beach", city: "Daytona Beach", state: "FL", beds: 362, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Kissimmee", city: "Kissimmee", state: "FL", beds: 282, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Winter Park", city: "Winter Park", state: "FL", beds: 422, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "UChicago Medicine AdventHealth Hinsdale", city: "Hinsdale", state: "IL", beds: 261, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "Doctors Hospital at Renaissance", city: "Edinburg", state: "TX", beds: 535, idn_name: "Tenet Healthcare", idn_rank: 17, type: "General Acute Care", ownership: "For-Profit" },
  { name: "Mercy Hospital St. Louis", city: "St. Louis", state: "MO", beds: 815, idn_name: "Mercy", idn_rank: 13, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "North Shore University Hospital", city: "Manhasset", state: "NY", beds: 756, idn_name: "Northwell Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Long Island Jewish Medical Center", city: "New Hyde Park", state: "NY", beds: 583, idn_name: "Northwell Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Staten Island University Hospital", city: "Staten Island", state: "NY", beds: 669, idn_name: "Northwell Health", idn_rank: null, type: "General Acute Care", ownership: "Non-Profit" },

  // SMALL-MID HOSPITALS (100-199 beds)
  { name: "AdventHealth DeLand", city: "DeLand", state: "FL", beds: 167, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Wesley Chapel", city: "Wesley Chapel", state: "FL", beds: 169, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth North Pinellas", city: "Tarpon Springs", state: "FL", beds: 136, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Hendersonville", city: "Hendersonville", state: "NC", beds: 98, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Castle Rock", city: "Castle Rock", state: "CO", beds: 89, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth New Smyrna Beach", city: "New Smyrna Beach", state: "FL", beds: 152, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "CAMC General Hospital", city: "Charleston", state: "WV", beds: 803, idn_name: null, idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Santa Clara Valley Medical Center", city: "San Jose", state: "CA", beds: 805, idn_name: null, idn_rank: null, type: "General Acute Care", ownership: "Government" },
  { name: "Miami Valley Hospital", city: "Dayton", state: "OH", beds: 899, idn_name: "Premier Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "Huntsville Hospital", city: "Huntsville", state: "AL", beds: 904, idn_name: "Huntsville Hospital Health System", idn_rank: null, type: "General Acute Care", ownership: "Government" },
  { name: "Texas Children's Hospital", city: "Houston", state: "TX", beds: 905, idn_name: "Texas Children's", idn_rank: null, type: "Children's Hospital", ownership: "Non-Profit" },
  { name: "Vanderbilt University Medical Center", city: "Nashville", state: "TN", beds: 800, idn_name: "Vanderbilt Health", idn_rank: null, type: "Academic Medical Center", ownership: "Non-Profit" },
  { name: "UNC Hospitals", city: "Chapel Hill", state: "NC", beds: 1000, idn_name: "UNC Health", idn_rank: null, type: "Academic Medical Center", ownership: "Government" },

  // SMALL HOSPITALS (25-99 beds) - representative sample
  { name: "AdventHealth Zephyrhills", city: "Zephyrhills", state: "FL", beds: 149, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Fish Memorial", city: "Orange City", state: "FL", beds: 99, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Palm Coast", city: "Palm Coast", state: "FL", beds: 100, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Gordon", city: "Calhoun", state: "GA", beds: 69, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Manchester", city: "Manchester", state: "KY", beds: 49, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Ottawa", city: "Ottawa", state: "KS", beds: 44, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Murray", city: "Chatsworth", state: "GA", beds: 29, idn_name: "AdventHealth", idn_rank: 11, type: "General Acute Care", ownership: "Non-Profit" },
  { name: "AdventHealth Lake Placid", city: "Lake Placid", state: "FL", beds: 33, idn_name: "AdventHealth", idn_rank: 11, type: "Critical Access", ownership: "Non-Profit" },
  { name: "AdventHealth Polk", city: "Columbus", state: "NC", beds: 25, idn_name: "AdventHealth", idn_rank: 11, type: "Critical Access", ownership: "Non-Profit" },
  { name: "Ochsner St. Anne General Hospital", city: "Raceland", state: "LA", beds: 35, idn_name: "Ochsner Health", idn_rank: 19, type: "Critical Access", ownership: "Non-Profit" },
];
