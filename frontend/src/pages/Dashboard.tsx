import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MapView from '@/components/MapView'
import type { Farm, Alert } from '@/types'

const API = 'https://terralogy-api-v2.onrender.com'

export default function Dashboard() {
  const navigate = useNavigate()
  const [farms, setFarms] = useState<Farm[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [newFarm, setNewFarm] = useState<{ lat: number; lng: number } | null>(null)
  const [farmName, setFarmName] = useState('')
  const [creating, setCreating] = useState(false)
  const [areaData, setAreaData] = useState<any>(null)
  const [areaLoading, setAreaLoading] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/farms`).then(r => r.json()).then(d => setFarms(d.farms || [])).catch(() => {})
    fetch(`${API}/api/alerts`).then(r => r.json()).then(d => setAlerts(d.alerts || [])).catch(() => {})
  }, [])

  const handleMapClick = (lat: number, lng: number) => {
    setNewFarm({ lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 })
    setFarmName('')
  }

  const handleCreate = async () => {
    if (!newFarm || !farmName.trim() || creating) return
    setCreating(true)
    try {
      const r = await fetch(`${API}/api/farms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: farmName, lat: newFarm.lat, lng: newFarm.lng }),
      })
      if (r.ok) {
        const d = await fetch(`${API}/api/farms`).then(r => r.json())
        setFarms(d.farms || [])
        setNewFarm(null)
        setFarmName('')
      }
    } catch (e) { console.error(e) }
    setCreating(false)
  }

  const handleAreaSelect = async (info: { lat: number; lng: number; area_ha: number; shape: string }) => {
    setAreaLoading(true)
    setAreaData(null)
    try {
      const r = await fetch(`${API}/api/analysis/area?lat=${info.lat}&lng=${info.lng}`, { method: 'POST' })
      const data = await r.json()
      setAreaData({ ...info, ...data })
    } catch (e) { console.error(e) }
    setAreaLoading(false)
  }

  const stats = {
    farms: farms.length,
    fields: farms.reduce((s, f) => s + (f.field_count || 0), 0),
    alerts: alerts.filter(a => !a.read).length,
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-icon green">🌾</div>
          <div className="stat-label">Total Farms</div>
          <div className="stat-value">{stats.farms}</div>
          <div className="stat-desc">Active monitoring</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue">⊞</div>
          <div className="stat-label">Total Fields</div>
          <div className="stat-value">{stats.fields}</div>
          <div className="stat-desc">Across all farms</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber">⚡</div>
          <div className="stat-label">Active Alerts</div>
          <div className="stat-value">{stats.alerts}</div>
          <div className="stat-desc">{stats.alerts > 0 ? 'Requires attention' : 'All clear'}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red">🛰</div>
          <div className="stat-label">Satellite</div>
          <div className="stat-value" style={{ fontSize: 18, paddingTop: 6 }}>Sentinel-2</div>
          <div className="stat-desc">Updates every 5 days</div>
        </div>
      </div>

      <MapView
        farms={farms}
        onFarmClick={(f) => navigate(`/farms/${f.id}`)}
        onMapClick={handleMapClick}
        onAreaSelect={handleAreaSelect}
      />

      {newFarm && (
        <div className="data-panel">
          <div className="data-header">
            <div>
              <div className="data-title">New Farm</div>
              <div className="data-subtitle">{newFarm.lat}, {newFarm.lng}</div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Farm Name</label>
            <input className="form-input" placeholder="Enter farm name" value={farmName} onChange={e => setFarmName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={handleCreate} disabled={!farmName.trim() || creating}>{creating ? 'Creating...' : 'Create Farm'}</button>
            <button className="btn btn-ghost" onClick={() => setNewFarm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {areaLoading && (
        <div className="data-panel" style={{ textAlign: 'center', padding: 50 }}>
          <div className="loading-spinner" />
          <div className="text-muted mt-3">Analyzing satellite, soil, and weather data...</div>
        </div>
      )}

      {areaData && (
        <div className="data-panel">
          <div className="data-header">
            <div>
              <div className="data-title">Area Analysis</div>
              <div className="data-subtitle">{areaData.area_ha} hectares • {areaData.lat?.toFixed(4)}, {areaData.lng?.toFixed(4)}</div>
            </div>
            <span className="badge badge-success">{areaData.shape}</span>
          </div>

          <div className="health-section">
            <div className="health-gauge">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={areaData.health?.score >= 75 ? '#10b981' : areaData.health?.score >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="8" strokeDasharray={`${(areaData.health?.score || 0) * 2.64} 264`} strokeLinecap="round" />
              </svg>
              <div className="health-gauge-text" style={{ color: areaData.health?.score >= 75 ? '#10b981' : areaData.health?.score >= 50 ? '#f59e0b' : '#ef4444' }}>{areaData.health?.score ?? '—'}</div>
            </div>
            <div className="health-info">
              <div className="health-label">{areaData.health?.label || 'No Data'}</div>
              <div className="health-desc">Crop health based on NDVI, soil moisture, and temperature</div>
            </div>
            <div className="yield-info">
              <div className="yield-value">{areaData.yield_potential?.estimated_tons_ha ?? '—'}<span className="yield-unit"> t/ha</span></div>
              <div className="yield-label">{areaData.yield_potential?.rating || 'Yield Potential'}</div>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">🌿</div>
              <div className="metric-label">NDVI</div>
              <div className={`metric-value ${areaData.vegetation?.ndvi >= 0.4 ? 'good' : areaData.vegetation?.ndvi >= 0.2 ? 'warning' : 'danger'}`}>{areaData.vegetation?.ndvi ?? '—'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">💧</div>
              <div className="metric-label">NDMI</div>
              <div className="metric-value info">{areaData.vegetation?.ndmi ?? '—'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🧪</div>
              <div className="metric-label">Soil pH</div>
              <div className="metric-value">{areaData.soil?.ph ?? '—'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">💦</div>
              <div className="metric-label">Moisture</div>
              <div className="metric-value">{areaData.soil?.moisture ?? '—'}<span className="metric-unit">%</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🌡</div>
              <div className="metric-label">Temp</div>
              <div className="metric-value">{areaData.weather?.temp ?? '—'}<span className="metric-unit">°C</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🚰</div>
              <div className="metric-label">Irrigation</div>
              <div className="metric-value info">{areaData.irrigation?.need_mm ?? 0}<span className="metric-unit">mm</span></div>
            </div>
          </div>

          {areaData.soil?.organic_carbon && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-2)' }}>
              <span>Carbon: <strong>{areaData.soil.organic_carbon}%</strong></span>
              <span>Clay: <strong>{areaData.soil.clay}%</strong></span>
              <span>Sand: <strong>{areaData.soil.sand}%</strong></span>
              <span>Nitrogen: <strong>{areaData.soil.nitrogen}%</strong></span>
            </div>
          )}

          {areaData.health?.alerts?.length > 0 && (
            <div style={{ marginTop: 16, padding: 14, background: 'rgba(239, 68, 68, 0.08)', borderRadius: 8, borderLeft: '3px solid var(--danger)' }}>
              {areaData.health.alerts.map((a: any, i: number) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 4 }}>⚠ {a.message}</div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button className="btn btn-primary" onClick={async () => {
              setCreating(true)
              try {
                await fetch(`${API}/api/farms`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: `Area @${areaData.lat?.toFixed(2)},${areaData.lng?.toFixed(2)}`, lat: areaData.lat, lng: areaData.lng }),
                })
                const d = await fetch(`${API}/api/farms`).then(r => r.json())
                setFarms(d.farms || [])
                setAreaData(null)
              } catch (e) { console.error(e) }
              setCreating(false)
            }}>Save as Farm</button>
            <button className="btn btn-ghost" onClick={() => setAreaData(null)}>Dismiss</button>
          </div>
        </div>
      )}

      <div className="grid-2 mt-4">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Alerts</div>
              <div className="card-subtitle">Critical notifications from your fields</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/alerts')}>View All</button>
          </div>
          <div className="alert-list">
            {alerts.filter(a => !a.read).length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}>
                <div className="empty-state-icon">✓</div>
                <h3>All clear</h3>
                <p>No active alerts. Your fields are healthy.</p>
              </div>
            ) : alerts.filter(a => !a.read).slice(0, 5).map((a) => (
              <div key={a.id} className="alert-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/alerts')}>
                <div className={`alert-icon ${a.severity}`}>⚡</div>
                <div className="alert-content">
                  <div className="alert-title">{a.message}</div>
                  <div className="alert-meta">
                    <span>{a.field_name || 'General'}</span>
                    <span className={`badge badge-${a.severity}`}>{a.severity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Quick Actions</div>
              <div className="card-subtitle">Common tasks and shortcuts</div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn" onClick={() => navigate('/farms')} style={{ justifyContent: 'flex-start' }}>⊞ View All Farms</button>
              <button className="btn" onClick={() => navigate('/alerts')} style={{ justifyContent: 'flex-start' }}>⚡ View All Alerts</button>
              <button className="btn" style={{ justifyContent: 'flex-start' }}>🛰 Satellite Analysis</button>
              <button className="btn" style={{ justifyContent: 'flex-start' }}>📊 Generate Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
