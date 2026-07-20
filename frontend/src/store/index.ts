import { create } from 'zustand'
import type { Farm, Field, FieldAnalysis, Alert } from '@/types'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface AppState {
  farms: Farm[]
  selectedFarm: Farm | null
  loading: boolean
  fetchFarms: () => Promise<void>
  selectFarm: (f: Farm | null) => void
  createFarm: (name: string, lat: number, lng: number) => Promise<Farm | null>
  deleteFarm: (id: string) => Promise<void>
  fields: Field[]
  selectedField: Field | null
  fetchFields: (farmId: string) => Promise<void>
  selectField: (f: Field | null) => void
  createField: (farmId: string, name: string, boundary: number[][]) => Promise<Field | null>
  analysis: FieldAnalysis | null
  fetchAnalysis: (fieldId: string) => Promise<void>
  alerts: Alert[]
  unreadAlerts: number
  fetchAlerts: () => Promise<void>
  markAlertRead: (id: string) => Promise<void>
  sidebarOpen: boolean
  toggleSidebar: () => void
}

async function fetchJSON(url: string, options?: RequestInit) {
  const r = await fetch(`${API}${url}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!r.ok) throw new Error(r.statusText)
  return r.json()
}

export const useAppStore = create<AppState>((set, get) => ({
  farms: [],
  selectedFarm: null,
  loading: false,
  fetchFarms: async () => {
    set({ loading: true })
    try { const d = await fetchJSON('/api/farms'); set({ farms: d.farms || [] }) } catch {}
    set({ loading: false })
  },
  selectFarm: (f) => set({ selectedFarm: f, fields: [], selectedField: null }),
  createFarm: async (name, lat, lng) => {
    const farm = await fetchJSON('/api/farms', { method: 'POST', body: JSON.stringify({ name, lat, lng }) })
    set((s) => ({ farms: [...s.farms, farm] }))
    return farm
  },
  deleteFarm: async (id) => {
    await fetchJSON(`/api/farms/${id}`, { method: 'DELETE' })
    set((s) => ({ farms: s.farms.filter((f) => f.id !== id) }))
  },
  fields: [],
  selectedField: null,
  fetchFields: async (farmId) => {
    try { const d = await fetchJSON(`/api/farms/${farmId}/fields`); set({ fields: d.fields || [] }) } catch {}
  },
  selectField: (f) => set({ selectedField: f }),
  createField: async (farmId, name, boundary) => {
    const field = await fetchJSON('/api/fields', { method: 'POST', body: JSON.stringify({ farm_id: farmId, name, boundary }) })
    set((s) => ({ fields: [...s.fields, field] }))
    return field
  },
  analysis: null,
  fetchAnalysis: async (fieldId) => {
    let d = await fetchJSON(`/api/analysis/field/${fieldId}`, { method: 'POST' })
    set({ analysis: d })
  },
  alerts: [],
  unreadAlerts: 0,
  fetchAlerts: async () => {
    try { const d = await fetchJSON('/api/alerts'); set({ alerts: d.alerts || [], unreadAlerts: (d.alerts || []).filter((a: Alert) => !a.read).length }) } catch {}
  },
  markAlertRead: async (id) => {
    try { await fetchJSON(`/api/alerts/${id}/read`, { method: 'PATCH' }); set((s) => ({ alerts: s.alerts.map((a) => a.id === id ? { ...a, read: true } : a), unreadAlerts: Math.max(0, s.unreadAlerts - 1) })) } catch {}
  },
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
