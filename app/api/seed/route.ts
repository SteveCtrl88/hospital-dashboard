import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase'
import { ref, set, remove } from 'firebase/database'
import { IDN_GROUPS, IDN_HOSPITALS, HOSPITALS_DATA } from '@/lib/seedData'
import { CAMPUS_DATA, getCampusProfile } from '@/lib/campusData'

// Verified large hospitals from Definitive Health Aug 2025 + Becker's Dec 2024
// These override any duplicates in the base dataset with correct bed counts
const VERIFIED_LARGE: Array<{name:string;city:string;state:string;beds:number;idn_name:string|null;idn_rank:number|null;type:string;ownership:string}> = [
  {name:"New York-Presbyterian Weill Cornell Medical Center",city:"New York",state:"NY",beds:2850,idn_name:"NewYork-Presbyterian",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"AdventHealth Orlando",city:"Orlando",state:"FL",beds:2787,idn_name:"AdventHealth",idn_rank:11,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Methodist Hospital San Antonio",city:"San Antonio",state:"TX",beds:1785,idn_name:"HCA Healthcare",idn_rank:1,type:"General Acute Care",ownership:"For-Profit"},
  {name:"NYU Langone Tisch Hospital",city:"New York",state:"NY",beds:1609,idn_name:"NYU Langone Health",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Jackson Memorial Hospital",city:"Miami",state:"FL",beds:1595,idn_name:null,idn_rank:null,type:"Academic Medical Center",ownership:"Government"},
  {name:"Baptist Medical Center San Antonio",city:"San Antonio",state:"TX",beds:1585,idn_name:"HCA Healthcare",idn_rank:1,type:"General Acute Care",ownership:"For-Profit"},
  {name:"Orlando Health Orlando Regional Medical Center",city:"Orlando",state:"FL",beds:1544,idn_name:"Orlando Health",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Norton Hospital Louisville",city:"Louisville",state:"KY",beds:1515,idn_name:"Norton Healthcare",idn_rank:null,type:"General Acute Care",ownership:"Non-Profit"},
  {name:"Montefiore Hospital Moses Campus",city:"Bronx",state:"NY",beds:1444,idn_name:"Montefiore Health System",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Yale New Haven Hospital",city:"New Haven",state:"CT",beds:1411,idn_name:"Yale New Haven Health",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Memorial Hermann Southwest Hospital",city:"Houston",state:"TX",beds:1410,idn_name:"Memorial Hermann",idn_rank:null,type:"General Acute Care",ownership:"Non-Profit"},
  {name:"St. Joseph's Hospital Tampa",city:"Tampa",state:"FL",beds:1354,idn_name:"BayCare Health System",idn_rank:null,type:"General Acute Care",ownership:"Non-Profit"},
  {name:"Methodist University Hospital Memphis",city:"Memphis",state:"TN",beds:1322,idn_name:"Methodist Le Bonheur Healthcare",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Cleveland Clinic Main Campus",city:"Cleveland",state:"OH",beds:1288,idn_name:"Cleveland Clinic",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"IU Health Methodist Hospital Indianapolis",city:"Indianapolis",state:"IN",beds:1274,idn_name:"Indiana University Health",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Mayo Clinic Hospital Saint Marys Campus",city:"Rochester",state:"MN",beds:1265,idn_name:"Mayo Clinic",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"NewYork-Presbyterian Columbia University Irving",city:"New York",state:"NY",beds:1200,idn_name:"NewYork-Presbyterian",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"The Johns Hopkins Hospital",city:"Baltimore",state:"MD",beds:1162,idn_name:"Johns Hopkins Medicine",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"UAB Hospital",city:"Birmingham",state:"AL",beds:1157,idn_name:"UAB Medicine",idn_rank:null,type:"Academic Medical Center",ownership:"Government"},
  {name:"UF Health Shands Hospital",city:"Gainesville",state:"FL",beds:1149,idn_name:"UF Health",idn_rank:null,type:"Academic Medical Center",ownership:"Government"},
  {name:"Ohio State University Wexner Medical Center",city:"Columbus",state:"OH",beds:1122,idn_name:"Ohio State University Wexner Medical Center",idn_rank:null,type:"Academic Medical Center",ownership:"Government"},
  {name:"Mount Sinai Hospital New York",city:"New York",state:"NY",beds:1134,idn_name:"Mount Sinai Health System",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Beaumont Hospital Royal Oak",city:"Royal Oak",state:"MI",beds:1101,idn_name:"Corewell Health",idn_rank:null,type:"General Acute Care",ownership:"Non-Profit"},
  {name:"Vanderbilt University Medical Center",city:"Nashville",state:"TN",beds:1097,idn_name:"Vanderbilt Health",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Our Lady of the Lake Regional Medical Center",city:"Baton Rouge",state:"LA",beds:1088,idn_name:"Franciscan Missionaries of Our Lady",idn_rank:null,type:"General Acute Care",ownership:"Non-Profit"},
  {name:"Spectrum Health Butterworth Hospital",city:"Grand Rapids",state:"MI",beds:1060,idn_name:"Corewell Health",idn_rank:null,type:"General Acute Care",ownership:"Non-Profit"},
  {name:"Memorial Hermann Texas Medical Center",city:"Houston",state:"TX",beds:1068,idn_name:"Memorial Hermann",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Houston Methodist Hospital",city:"Houston",state:"TX",beds:1028,idn_name:"Houston Methodist",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Tampa General Hospital",city:"Tampa",state:"FL",beds:1040,idn_name:null,idn_rank:null,type:"Academic Medical Center",ownership:"Government"},
  {name:"University Hospitals Cleveland Medical Center",city:"Cleveland",state:"OH",beds:1032,idn_name:"University Hospitals",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Massachusetts General Hospital",city:"Boston",state:"MA",beds:1011,idn_name:"Mass General Brigham",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"University of Michigan Michigan Medicine",city:"Ann Arbor",state:"MI",beds:1000,idn_name:"Michigan Medicine",idn_rank:null,type:"Academic Medical Center",ownership:"Government"},
  {name:"Grady Memorial Hospital",city:"Atlanta",state:"GA",beds:953,idn_name:"Grady Health System",idn_rank:null,type:"Academic Medical Center",ownership:"Government"},
  {name:"Duke University Hospital",city:"Durham",state:"NC",beds:957,idn_name:"Duke Health",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Northwestern Memorial Hospital",city:"Chicago",state:"IL",beds:930,idn_name:"Northwestern Medicine",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Thomas Jefferson University Hospital",city:"Philadelphia",state:"PA",beds:905,idn_name:"Jefferson Health",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Cedars-Sinai Medical Center",city:"Los Angeles",state:"CA",beds:886,idn_name:"Cedars-Sinai",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Baylor St. Luke's Medical Center Houston",city:"Houston",state:"TX",beds:881,idn_name:"CommonSpirit Health",idn_rank:3,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Strong Memorial Hospital University of Rochester",city:"Rochester",state:"NY",beds:866,idn_name:"University of Rochester Medicine",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Parkland Memorial Hospital",city:"Dallas",state:"TX",beds:862,idn_name:"Parkland Health",idn_rank:null,type:"Academic Medical Center",ownership:"Government"},
  {name:"Brigham and Women's Hospital",city:"Boston",state:"MA",beds:793,idn_name:"Mass General Brigham",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"University of Maryland Medical Center",city:"Baltimore",state:"MD",beds:757,idn_name:"University of Maryland Medical System",idn_rank:null,type:"Academic Medical Center",ownership:"Government"},
  {name:"Hospital of the University of Pennsylvania",city:"Philadelphia",state:"PA",beds:821,idn_name:"Penn Medicine",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Henry Ford Hospital Detroit",city:"Detroit",state:"MI",beds:877,idn_name:"Henry Ford Health",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
  {name:"Stanford Health Care Stanford Hospital",city:"Stanford",state:"CA",beds:613,idn_name:"Stanford Health Care",idn_rank:null,type:"Academic Medical Center",ownership:"Non-Profit"},
]

const IDN_MAP: Record<string, { name: string; rank: number }> = {
  'hca healthcare': { name: 'HCA Healthcare', rank: 1 },
  'hospital corporation of america': { name: 'HCA Healthcare', rank: 1 },
  'veterans health administration': { name: 'Veterans Health Administration', rank: 2 },
  'department of veterans affairs': { name: 'Veterans Health Administration', rank: 2 },
  'commonspirit health': { name: 'CommonSpirit Health', rank: 3 },
  'dignity health': { name: 'CommonSpirit Health', rank: 3 },
  'lifepoint health': { name: 'LifePoint Health', rank: 4 },
  'ascension health': { name: 'Ascension Health', rank: 5 },
  'ascension': { name: 'Ascension Health', rank: 5 },
  'scionhealth': { name: 'ScionHealth', rank: 6 },
  'trinity health': { name: 'Trinity Health', rank: 7 },
  'advocate health': { name: 'Advocate Health', rank: 8 },
  'advocate aurora health': { name: 'Advocate Health', rank: 8 },
  'christus health': { name: 'Christus Health', rank: 9 },
  'community health systems': { name: 'Community Health Systems', rank: 10 },
  'adventhealth': { name: 'AdventHealth', rank: 11 },
  'adventist health system': { name: 'AdventHealth', rank: 11 },
  'sanford health': { name: 'Sanford Health', rank: 12 },
  'prime healthcare': { name: 'Prime Healthcare', rank: 14 },
  'baylor scott': { name: 'Baylor Scott & White Health', rank: 15 },
  'providence': { name: 'Providence', rank: 16 },
  'tenet healthcare': { name: 'Tenet Healthcare', rank: 17 },
  'bon secours mercy health': { name: 'Bon Secours Mercy Health', rank: 18 },
  'ochsner health': { name: 'Ochsner Health', rank: 19 },
  'upmc': { name: 'UPMC', rank: 20 },
  'university of pittsburgh medical center': { name: 'UPMC', rank: 20 },
}

function resolveIDN(ownerName: string | null): { idn_name: string | null; idn_rank: number | null } {
  if (!ownerName) return { idn_name: null, idn_rank: null }
  const lower = ownerName.toLowerCase()
  for (const [key, val] of Object.entries(IDN_MAP)) {
    if (lower.includes(key)) return { idn_name: val.name, idn_rank: val.rank }
  }
  return { idn_name: ownerName, idn_rank: null }
}

async function fetchCMSHospitals() {
  const results = []
  const LIMIT = 1000
  let offset = 0
  while (true) {
    try {
      const url = `https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0?limit=${LIMIT}&offset=${offset}&keys=true`
      const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(25000) })
      if (!res.ok) break
      const data = await res.json()
      const rows = data.results || data.data || []
      if (!rows.length) break
      for (const row of rows) {
        const name = row['facility_name'] || row['hospital_name'] || ''
        const city = row['city'] || row['city_town'] || ''
        const state = row['state'] || ''
        if (!name || !state) continue
        const ownership = row['hospital_ownership'] || ''
        let ownerCat: string | null = null
        if (ownership.toLowerCase().includes('government')) ownerCat = 'Government'
        else if (ownership.toLowerCase().includes('voluntary') || ownership.toLowerCase().includes('non-profit')) ownerCat = 'Non-Profit'
        else if (ownership.toLowerCase().includes('proprietary') || ownership.toLowerCase().includes('profit')) ownerCat = 'For-Profit'
        const { idn_name, idn_rank } = resolveIDN(ownership)
        results.push({ name, city, state, beds: null, idn_name, idn_rank, type: row['hospital_type'] || 'General Acute Care', ownership: ownerCat || ownership })
      }
      offset += LIMIT
      if (rows.length < LIMIT) break
    } catch { break }
  }
  return results
}

export async function POST() {
  try {
    const db = getDb()
    await Promise.all([remove(ref(db, 'idn_groups')), remove(ref(db, 'idn_hospitals')), remove(ref(db, 'hospitals'))])

    // IDN groups
    const idnGroupsData: Record<string, object> = {}
    for (const g of IDN_GROUPS) { const id = `idn_${g.rank}`; idnGroupsData[id] = { ...g, id } }
    await set(ref(db, 'idn_groups'), idnGroupsData)

    // IDN hospitals
    const idnHospitalsData: Record<string, object> = {}
    let ihCount = 0
    for (const { idn_rank, hospitals } of IDN_HOSPITALS) {
      const idn_id = `idn_${idn_rank}`
      for (const h of hospitals) { const id = `ih_${ihCount++}`; idnHospitalsData[id] = { ...h, id, idn_id } }
    }
    await set(ref(db, 'idn_hospitals'), idnHospitalsData)

    // Build hospital list: start with verified large hospitals (correct bed counts)
    // then add DH CSV data, then CMS data — deduplicating by name+state
    const existing = new Map<string, object>()
    
    // 1. Verified large hospitals go in first (highest confidence)
    for (const h of VERIFIED_LARGE) {
      const key = `${h.name.toLowerCase().trim()}|${h.state}`
      existing.set(key, h)
    }
    
    // 2. Definitive Health CSV data
    for (const h of HOSPITALS_DATA) {
      const key = `${h.name.toLowerCase().trim()}|${h.state}`
      if (!existing.has(key)) existing.set(key, h)
    }

    // 3. CMS live data (fills gaps, no bed count)
    let cmsCount = 0, cmsError: string | null = null
    try {
      const cmsHospitals = await fetchCMSHospitals()
      for (const h of cmsHospitals) {
        const key = `${h.name.toLowerCase().trim()}|${h.state}`
        if (!existing.has(key)) { existing.set(key, h); cmsCount++ }
      }
    } catch (e) { cmsError = String(e) }

    const allHospitals = Array.from(existing.values())
    
    // Enrich with campus complexity data
    const hospitalsData: Record<string, object> = {}
    allHospitals.forEach((h, i) => {
      const hosp = h as { name: string; state: string }
      const campus = getCampusProfile(hosp.name, hosp.state)
      const id = `hosp_${i}`
      hospitalsData[id] = {
        ...(h as object),
        id,
        campus_type: campus?.campus_type ?? null,
        estimated_deployments: campus?.estimated_deployments ?? null,
        building_count: campus?.building_count ?? null,
        campus_notes: campus?.notes ?? null,
      }
    })
    await set(ref(db, 'hospitals'), hospitalsData)

    return NextResponse.json({
      success: true,
      counts: { idn_groups: IDN_GROUPS.length, idn_hospitals: ihCount, hospitals: allHospitals.length, verified_large: VERIFIED_LARGE.length, from_dh: HOSPITALS_DATA.length, from_cms: cmsCount, with_campus_data: CAMPUS_DATA.length },
      cms_error: cmsError,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
