import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase'
import { ref, set, remove } from 'firebase/database'
import { IDN_GROUPS, IDN_HOSPITALS, HOSPITALS_DATA } from '@/lib/seedData'

// CMS network name → our IDN mapping
const IDN_MAP: Record<string, { name: string; rank: number }> = {
  'hca healthcare': { name: 'HCA Healthcare', rank: 1 },
  'hospital corporation of america': { name: 'HCA Healthcare', rank: 1 },
  'veterans health administration': { name: 'Veterans Health Administration', rank: 2 },
  'department of veterans affairs': { name: 'Veterans Health Administration', rank: 2 },
  'commonspirit health': { name: 'CommonSpirit Health', rank: 3 },
  'dignity health': { name: 'CommonSpirit Health', rank: 3 },
  'lifepoint health': { name: 'LifePoint Health', rank: 4 },
  'lifepoint hospitals': { name: 'LifePoint Health', rank: 4 },
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
  'mercy': { name: 'Mercy', rank: 13 },
  'prime healthcare': { name: 'Prime Healthcare', rank: 14 },
  'prime healthcare services': { name: 'Prime Healthcare', rank: 14 },
  'baylor scott & white health': { name: 'Baylor Scott & White Health', rank: 15 },
  'baylor scott and white': { name: 'Baylor Scott & White Health', rank: 15 },
  'providence': { name: 'Providence', rank: 16 },
  'providence st joseph health': { name: 'Providence', rank: 16 },
  'tenet healthcare': { name: 'Tenet Healthcare', rank: 17 },
  'bon secours mercy health': { name: 'Bon Secours Mercy Health', rank: 18 },
  'ochsner health': { name: 'Ochsner Health', rank: 19 },
  'ochsner health system': { name: 'Ochsner Health', rank: 19 },
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

// Fetch all hospitals from CMS public API (paginated)
async function fetchCMSHospitals(): Promise<Array<{
  name: string; city: string; state: string; zip: string;
  type: string; ownership: string; beds: null;
  idn_name: string | null; idn_rank: number | null;
}>> {
  const results = []
  const LIMIT = 1000
  let offset = 0
  
  while (true) {
    try {
      const url = `https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0?limit=${LIMIT}&offset=${offset}&keys=true`
      const res = await fetch(url, { 
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(30000)
      })
      if (!res.ok) break
      const data = await res.json()
      const rows = data.results || data.data || []
      if (!rows.length) break
      
      for (const row of rows) {
        const name = row['facility_name'] || row['hospital_name'] || ''
        const city = row['city'] || row['city_town'] || ''
        const state = row['state'] || ''
        const zip = row['zip_code'] || row['zip'] || ''
        const type = row['hospital_type'] || 'Acute Care'
        const ownership = row['hospital_ownership'] || ''
        
        if (!name || !state) continue
        
        // Map CMS ownership to our categories
        let ownerCat: string | null = null
        if (ownership.toLowerCase().includes('government')) ownerCat = 'Government'
        else if (ownership.toLowerCase().includes('voluntary') || ownership.toLowerCase().includes('non-profit')) ownerCat = 'Non-Profit'
        else if (ownership.toLowerCase().includes('proprietary') || ownership.toLowerCase().includes('profit')) ownerCat = 'For-Profit'
        
        const { idn_name, idn_rank } = resolveIDN(ownership)
        
        results.push({ name, city, state, zip, type, ownership: ownerCat || ownership, beds: null, idn_name, idn_rank })
      }
      
      offset += LIMIT
      if (rows.length < LIMIT) break
    } catch {
      break
    }
  }
  
  return results
}

export async function POST() {
  try {
    const db = getDb()

    // Clear existing data
    await Promise.all([
      remove(ref(db, 'idn_groups')),
      remove(ref(db, 'idn_hospitals')),
      remove(ref(db, 'hospitals')),
    ])

    // Seed IDN groups
    const idnGroupsData: Record<string, object> = {}
    for (const g of IDN_GROUPS) {
      const id = `idn_${g.rank}`
      idnGroupsData[id] = { ...g, id }
    }
    await set(ref(db, 'idn_groups'), idnGroupsData)

    // Seed IDN hospitals  
    const idnHospitalsData: Record<string, object> = {}
    let ihCount = 0
    for (const { idn_rank, hospitals } of IDN_HOSPITALS) {
      const idn_id = `idn_${idn_rank}`
      for (const h of hospitals) {
        const id = `ih_${ihCount++}`
        idnHospitalsData[id] = { ...h, id, idn_id }
      }
    }
    await set(ref(db, 'idn_hospitals'), idnHospitalsData)

    // Build merged hospital list: start with our verified Definitive Health data (has beds),
    // then supplement with CMS data for hospitals not already in our set
    let allHospitals = [...HOSPITALS_DATA]
    let cmsCount = 0
    let cmsError: string | null = null

    try {
      const cmsHospitals = await fetchCMSHospitals()
      
      // Build a lookup set of existing names+states to avoid duplicates
      const existing = new Set(allHospitals.map(h => `${h.name.toLowerCase().trim()}|${h.state}`))
      
      for (const h of cmsHospitals) {
        const key = `${h.name.toLowerCase().trim()}|${h.state}`
        if (!existing.has(key)) {
          allHospitals.push(h)
          existing.add(key)
          cmsCount++
        }
      }
    } catch (e) {
      cmsError = String(e)
    }

    // Write all hospitals to Firebase
    const hospitalsData: Record<string, object> = {}
    allHospitals.forEach((h, i) => {
      const id = `hosp_${i}`
      hospitalsData[id] = { ...h, id }
    })
    await set(ref(db, 'hospitals'), hospitalsData)

    return NextResponse.json({
      success: true,
      counts: {
        idn_groups: IDN_GROUPS.length,
        idn_hospitals: ihCount,
        hospitals: allHospitals.length,
        from_definitive_health: HOSPITALS_DATA.length,
        from_cms_api: cmsCount,
      },
      cms_error: cmsError,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
