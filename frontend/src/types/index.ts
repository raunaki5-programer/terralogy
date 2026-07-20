export interface Farm {
  id: string
  name: string
  description?: string
  location: { lat: number; lng: number }
  created_at: string
  field_count: number
}

export interface Field {
  id: string
  farm_id: string
  name: string
  boundary: number[][]
  center: { lat: number; lng: number }
  area_ha: number
  created_at: string
  crop?: Crop | null
}

export interface Crop {
  id: string
  field_id: string
  crop_type: string
  variety: string
  planting_date: string | null
  expected_harvest: string | null
}

export interface FieldAnalysis {
  field_id: string
  soil: { ph: number | null; organic_carbon: number | null; clay: number | null; sand: number | null; silt: number | null; moisture: number | null }
  vegetation: { ndvi: number | null; ndmi: number | null }
  weather: { temp: number | null; humidity: number | null }
  health: { status: string; label: string }
  alerts: Alert[]
}

export interface Alert {
  id: string
  field_id?: string
  field_name?: string
  type: string
  severity: string
  message: string
  read: boolean
  created_at: string
}
