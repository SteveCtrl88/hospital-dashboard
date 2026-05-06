// Types shared across the app (formerly supabase.ts — now Firebase-backed)
export interface Hospital {
  id: string
  name: string
  city: string
  state: string
  beds: number | null
  idn_name: string | null
  idn_rank: number | null
  type: string | null
  ownership: string | null
}

export interface IDNGroup {
  id: string
  rank: number
  name: string
  hq_city: string
  hq_state: string
  total_hospitals: number
  total_beds: number
  net_patient_revenue_b: number | null
  ownership_type: string
  states_covered: number
}

export interface IDNHospital {
  id: string
  idn_id: string
  hospital_name: string
  city: string
  state: string
  beds: number | null
}
