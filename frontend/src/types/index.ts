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
  crop?: { crop_type: string } | null
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
