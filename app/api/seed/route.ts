import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { ref, set, remove } from 'firebase/database'
import { IDN_GROUPS, IDN_HOSPITALS, HOSPITALS_DATA } from '@/lib/seedData'

export async function POST() {
  try {
    // Clear existing data
    await Promise.all([
      remove(ref(db, 'idn_groups')),
      remove(ref(db, 'idn_hospitals')),
      remove(ref(db, 'hospitals')),
    ])

    // Seed IDN groups — keyed by rank
    const idnGroupsData: Record<string, object> = {}
    for (const g of IDN_GROUPS) {
      const id = `idn_${g.rank}`
      idnGroupsData[id] = { ...g, id }
    }
    await set(ref(db, 'idn_groups'), idnGroupsData)

    // Seed IDN hospitals — keyed by idn_rank + index
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

    // Seed hospitals — keyed by index
    const hospitalsData: Record<string, object> = {}
    HOSPITALS_DATA.forEach((h, i) => {
      const id = `hosp_${i}`
      hospitalsData[id] = { ...h, id }
    })
    await set(ref(db, 'hospitals'), hospitalsData)

    return NextResponse.json({
      success: true,
      counts: {
        idn_groups: IDN_GROUPS.length,
        idn_hospitals: ihCount,
        hospitals: HOSPITALS_DATA.length,
      }
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
