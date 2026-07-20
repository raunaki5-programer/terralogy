import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'
import MapView from '@/components/MapView'
import WeatherWidget from '@/components/WeatherWidget'

export default function Dashboard() {
  const navigate = useNavigate()
  const { farms, fetchFarms, alerts, fetchAlerts, createFarm } = useAppStore()
  const [newFarm, setNewFarm] = useState<{ lat: number; lng: number } | null>(null)
  const [farmName, setFarmName] = useState('')

  useEffect(() => { fetchFarms(); fetchAlerts() }, [fetchFarms, fetchAlerts])

  const stats = useMemo(() => ({
    totalFarms: farms.length,
    totalFields: farms.reduce((s, f) => s + (f.field_count || 0), 0),
    activeAlerts: alerts.filter(a => !a.read).length,
  }), [farms, alerts])

  const handleMapClick = (lat: number, lng: number) => {
    setNewFarm({ lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 })
    setFarmName('')
  }

  const handleCreateFarm = async () => {
    if (!newFarm || !farmName.trim()) return
    await createFarm(farmName, newFarm.lat, newFarm.lng)
    setNewFarm(null)
    setFarmName('')
  }

  return (
    <div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(0,212,170,0.12)' }}>🌾</div><div><div className="stat-value">{stats.totalFarms}</div><div className="stat-label">Farms</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>⊞</div><div><div className="stat-value">{stats.totalFields}</div><div className="stat-label">Fields</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>⚡</div><div><div className="stat-value">{stats.activeAlerts}</div><div className="stat-label">Alerts</div></div></div>
        <WeatherWidget />
      </div>

      <div className="card mb-3" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
        <div className="map-hint">Click anywhere on the map to add a farm</div>
        <MapView farms={farms} onFarmClick={(f) => navigate(`/farms/${f.id}`)} onMapClick={handleMapClick} />
        {newFarm && (
          <div className="map-popup">
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>New Farm at {newFarm.lat}, {newFarm.lng}</div>
            <input className="form-input" placeholder="Farm name" value={farmName} onChange={e => setFarmName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && handleCreateFarm()} />
            <div className="flex gap-2 mt-2">
              <button className="btn btn-primary btn-sm w-full" onClick={handleCreateFarm} disabled={!farmName.trim()}>Create Farm</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setNewFarm(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Alerts</span></div>
          {alerts.filter(a => !a.read).length === 0 ? <div className="text-muted" style={{ padding: 16 }}>All clear!</div> :
           alerts.filter(a => !a.read).slice(0, 5).map(a => (
            <div key={a.id} className="alert-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/alerts')}>
              <div className="alert-dot" style={{ background: a.severity === 'critical' ? 'var(--danger)' : 'var(--warning)' }} />
              <div className="alert-content">
                <div className="alert-message">{a.message}</div>
                <div className="alert-meta"><span className={`badge badge-${a.severity}`}>{a.severity}</span><span>{a.field_name || 'General'}</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Quick Tips</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            <div>🖱 <strong>Click map</strong> to add a farm</div>
            <div>📍 <strong>Click marker</strong> to view farm details</div>
            <div>💬 <strong>Green button</strong> (bottom-right) to chat with AI</div>
            <div>⊞ <strong>Farms tab</strong> to manage all farms</div>
            <div>🔬 <strong>Field detail</strong> shows health, soil, yield analysis</div>
          </div>
        </div>
      </div>
    </div>
  )
}
