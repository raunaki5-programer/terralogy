import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'
import MapView from '@/components/MapView'
import WeatherWidget from '@/components/WeatherWidget'

const API = 'https://terralogy-api-v2.onrender.com'

export default function Dashboard() {
  const navigate = useNavigate()
  const { farms, fetchFarms, alerts, fetchAlerts } = useAppStore()
  const [newFarm, setNewFarm] = useState<{ lat: number; lng: number } | null>(null)
  const [farmName, setFarmName] = useState('')
  const [creating, setCreating] = useState(false)
  const [areaData, setAreaData] = useState<any>(null)
  const [areaLoading, setAreaLoading] = useState(false)

  useEffect(() => { fetchFarms(); fetchAlerts() }, [])

  const handleMapClick = (lat: number, lng: number) => {
    setNewFarm({ lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 })
    setFarmName('')
  }

  const handleCreate = async () => {
    if (!newFarm || !farmName.trim() || creating) return
    setCreating(true)
    try {
      const r = await fetch(`${API}/api/farms`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: farmName, lat: newFarm.lat, lng: newFarm.lng }),
      })
      if (r.ok) { await fetchFarms(); setNewFarm(null); setFarmName('') }
    } catch (e) { console.error(e) }
    setCreating(false)
  }

  const handleAreaSelect = async (geometry: any, area_ha: number) => {
    setAreaLoading(true)
    setAreaData(null)
    try {
      const coords = geometry.coordinates[0]
      let sumLat = 0, sumLng = 0
      coords.forEach((c: number[]) => { sumLat += c[1]; sumLng += c[0] })
      const lat = Math.round(sumLat / coords.length * 10000) / 10000
      const lng = Math.round(sumLng / coords.length * 10000) / 10000

      const [wRes, sRes] = await Promise.all([
        fetch(`${API}/api/weather?lat=${lat}&lon=${lng}`).then(r => r.json()).catch(() => null),
        fetch(`${API}/api/soil?lat=${lat}&lon=${lng}`).then(r => r.json()).catch(() => null),
      ])
      setAreaData({ area_ha, lat, lng, weather: wRes?.current, soil: sRes })
    } catch (e) { console.error(e) }
    setAreaLoading(false)
  }

  const stats = useMemo(() => ({
    farms: farms.length,
    alerts: alerts.filter((a) => !a.read).length,
  }), [farms, alerts])

  return (
    <div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(0,212,170,0.12)' }}>🌾</div><div><div className="stat-value">{stats.farms}</div><div className="stat-label">Farms</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>⊞</div><div><div className="stat-value">{farms.reduce((s, f) => s + (f.field_count || 0), 0)}</div><div className="stat-label">Fields</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>⚡</div><div><div className="stat-value">{stats.alerts}</div><div className="stat-label">Alerts</div></div></div>
        <WeatherWidget />
      </div>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(10,15,26,0.9)', color: '#94a3b8', padding: '6px 16px', borderRadius: 20, fontSize: 13, pointerEvents: 'none' }}>
          Click anywhere on the map to add a farm
        </div>
        <MapView farms={farms} onFarmClick={(f) => navigate(`/farms/${f.id}`)} onMapClick={handleMapClick} onAreaSelect={handleAreaSelect} />
        {newFarm && (
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: '#111827', border: '2px solid #00d4aa', borderRadius: 12, padding: 16, minWidth: 300, boxShadow: '0 8px 32px rgba(0,212,170,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#f1f5f9' }}>New farm at {newFarm.lat}, {newFarm.lng}</div>
            <input style={{ width: '100%', padding: '10px 14px', background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none' }} placeholder="Farm name" value={farmName} onChange={(e) => setFarmName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={handleCreate} disabled={!farmName.trim() || creating} style={{ flex: 1, padding: '8px 16px', background: '#00d4aa', color: '#0a0f1a', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', opacity: !farmName.trim() || creating ? 0.5 : 1 }}>{creating ? 'Creating...' : 'Create Farm'}</button>
              <button onClick={() => setNewFarm(null)} style={{ padding: '8px 16px', background: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {areaLoading && (
        <div style={{ marginBottom: 24, padding: 20, background: '#111827', border: '1px solid #1e293b', borderRadius: 12, textAlign: 'center', color: '#94a3b8' }}>
          Fetching weather & soil data for selected area...
        </div>
      )}
      {areaData && (
        <div style={{ marginBottom: 24, padding: 20, background: '#111827', border: '1px solid #00d4aa', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#00d4aa' }}>📐 Selected Area: {areaData.area_ha} ha</h3>
            <span style={{ color: '#64748b', fontSize: 13 }}>{areaData.lat}, {areaData.lng}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div style={{ padding: 12, background: '#0a0f1a', borderRadius: 8 }}>
              <div style={{ color: '#64748b', fontSize: 12 }}>Temperature</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{areaData.weather?.temperature_2m ?? '—'}°C</div>
            </div>
            <div style={{ padding: 12, background: '#0a0f1a', borderRadius: 8 }}>
              <div style={{ color: '#64748b', fontSize: 12 }}>Humidity</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{areaData.weather?.relative_humidity_2m ?? '—'}%</div>
            </div>
            <div style={{ padding: 12, background: '#0a0f1a', borderRadius: 8 }}>
              <div style={{ color: '#64748b', fontSize: 12 }}>Soil pH</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{areaData.soil?.ph ?? '—'}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={async () => {
              if (!areaData) return
              setCreating(true)
              try {
                const r = await fetch(`${API}/api/farms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `Area ${areaData.lat},${areaData.lng}`, lat: areaData.lat, lng: areaData.lng }) })
                if (r.ok) { await fetchFarms(); setAreaData(null) }
              } catch (e) { console.error(e) }
              setCreating(false)
            }} style={{ padding: '8px 16px', background: '#00d4aa', color: '#0a0f1a', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Save as Farm</button>
            <button onClick={() => setAreaData(null)} style={{ padding: '8px 16px', background: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 8, cursor: 'pointer' }}>Dismiss</button>
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Alerts</span></div>
          {alerts.filter((a) => !a.read).length === 0 ? (
            <div style={{ padding: 16, color: '#64748b' }}>All clear — no active alerts.</div>
          ) : alerts.filter((a) => !a.read).slice(0, 5).map((a) => (
            <div key={a.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #1e293b', cursor: 'pointer' }} onClick={() => navigate('/alerts')}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.severity === 'critical' ? '#ef4444' : '#f59e0b', marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14 }}>{a.message}</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  <span>{a.field_name || 'General'}</span>
                  <span style={{ padding: '1px 6px', borderRadius: 10, background: a.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: a.severity === 'critical' ? '#ef4444' : '#f59e0b' }}>{a.severity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Getting Started</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
            <div>🖱 <strong>Click map</strong> → name your farm → created</div>
            <div>📍 <strong>Click green dot</strong> → farm detail page</div>
            <div>⊞ <strong>Add Field</strong> → run satellite + soil analysis</div>
            <div>💬 <strong>Chat button</strong> bottom-right → AI assistant</div>
          </div>
        </div>
      </div>
    </div>
  )
}
