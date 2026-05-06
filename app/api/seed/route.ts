import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase'
import { ref, set, remove, get } from 'firebase/database'
import { IDN_GROUPS, IDN_HOSPITALS, HOSPITALS_DATA } from '@/lib/seedData'

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

    // Seed all hospitals in batches of 500 to stay within Firebase payload limits
    const BATCH = 500
    let hCount = 0
    for (let start = 0; start < HOSPITALS_DATA.length; start += BATCH) {
      const chunk = HOSPITALS_DATA.slice(start, start + BATCH)
      const batchData: Record<string, object> = {}
      chunk.forEach((h, j) => {
        const id = `hosp_${start + j}`
        batchData[id] = { ...h, id }
        hCount++
      })
      // Merge into existing data for this path
      const existingSnap = await get(ref(db, 'hospitals'))
      const existing = existingSnap.exists() ? existingSnap.val() as Record<string, object> : {}
      await set(ref(db, 'hospitals'), { ...existing, ...batchData })
    }

    return NextResponse.json({
      success: true,
      counts: {
        idn_groups: IDN_GROUPS.length,
        idn_hospitals: ihCount,
        hospitals: hCount,
      }
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
