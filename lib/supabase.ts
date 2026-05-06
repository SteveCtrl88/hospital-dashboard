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
  campus_type: string | null
  estimated_deployments: number | null
  building_count: number | null
  campus_notes: string | null
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

// Campus complexity types
export type CampusType = 
  | 'Single Building'       // One main structure, single deployment unit
  | 'Multi-Tower'           // Connected towers/wings, still one deployment but complex
  | 'Multi-Building Campus' // Separate buildings on same site, each needs own fleet
  | 'Multi-Site Licensed'   // Multiple physically separate locations under one CMS number

