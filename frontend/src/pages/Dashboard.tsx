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

  const handleAreaSelect = async (info: { lat: number; lng: number; area_ha: number }) => {
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
        <div className="stat-card accent">
          <div className="stat-label">Total Farms</div>
          <div className="stat-value">{stats.farms}</div>
          <div className="stat-trend up">↑ Active monitoring</div>
        </div>
        <div className="stat-card info">
          <div className="stat-label">Total Fields</div>
          <div className="stat-value">{stats.fields}</div>
          <div className="stat-trend">Across all farms</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Active Alerts</div>
          <div className="stat-value">{stats.alerts}</div>
          <div className="stat-trend">{stats.alerts > 0 ? '⚠ Requires attention' : '✓ All clear'}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Satellite</div>
          <div className="stat-value" style={{ fontSize: 18, paddingTop: 8 }}>Sentinel-2</div>
          <div className="stat-trend">Updates every 5 days</div>
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
        <div className="data-panel" style={{ textAlign: 'center', padding: 40 }}>
          <div className="loading-spinner" />
          <div className="text-muted mt-3">Fetching satellite, soil, and weather data...</div>
        </div>
      )}

      {areaData && (
        <div className="data-panel">
          <div className="data-header">
            <div>
              <div className="data-title">Area Analysis</div>
              <div className="data-subtitle">{areaData.area_ha} hectares • {areaData.lat?.toFixed(4)}, {areaData.lng?.toFixed(4)}</div>
            </div>
            <span className="badge badge-neutral">{areaData.shape || 'Selected'}</span>
          </div>

          <div className="health-score">
            <div>
              <div className="health-value" style={{ color: areaData.health?.score >= 75 ? '#00d4a0' : areaData.health?.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                {areaData.health?.score ?? '—'}
              </div>
              <div className="health-label">{areaData.health?.label || 'No Data'}</div>
            </div>
            <div className="health-bar">
              <div className="health-fill" style={{ width: `${areaData.health?.score || 0}%`, background: areaData.health?.score >= 75 ? '#00d4a0' : areaData.health?.score >= 50 ? '#f59e0b' : '#ef4444' }} />
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{areaData.yield_potential?.estimated_tons_ha ?? '—'} <span style={{ fontSize: 14, color: '#64748b' }}>t/ha</span></div>
              <div className="text-muted text-xs">{areaData.yield_potential?.rating || 'Yield Potential'}</div>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">NDVI</div>
              <div className={`metric-value ${areaData.vegetation?.ndvi >= 0.4 ? 'good' : areaData.vegetation?.ndvi >= 0.2 ? 'warning' : 'danger'}`}>{areaData.vegetation?.ndvi ?? '—'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">NDMI</div>
              <div className="metric-value info">{areaData.vegetation?.ndmi ?? '—'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Soil pH</div>
              <div className="metric-value">{areaData.soil?.ph ?? '—'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Moisture</div>
              <div className="metric-value">{areaData.soil?.moisture ?? '—'}<span className="metric-unit">%</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Temp</div>
              <div className="metric-value">{areaData.weather?.temp ?? '—'}<span className="metric-unit">°C</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Irrigation</div>
              <div className="metric-value info">{areaData.irrigation?.need_mm ?? 0}<span className="metric-unit">mm</span></div>
            </div>
          </div>

          {areaData.soil?.organic_carbon && (
            <div className="text-muted text-sm" style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <span className="mr-4">Carbon: {areaData.soil.organic_carbon}%</span>
              <span className="mr-4">Clay: {areaData.soil.clay}%</span>
              <span className="mr-4">Sand: {areaData.soil.sand}%</span>
              <span>Nitrogen: {areaData.soil.nitrogen}%</span>
            </div>
          )}

          {areaData.health?.alerts?.length > 0 && (
            <div style={{ marginTop: 16, padding: 12, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, borderLeft: '3px solid #ef4444' }}>
              {areaData.health.alerts.map((a: any, i: number) => (
                <div key={i} style={{ fontSize: 13, color: '#ef4444', marginBottom: 4 }}>⚠ {a.message}</div>
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
          <div className="card-header"><span className="card-title">Recent Alerts</span></div>
          {alerts.filter(a => !a.read).length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              <p>No active alerts</p>
              <p className="text-xs">All fields are healthy</p>
            </div>
          ) : alerts.filter(a => !a.read).slice(0, 5).map((a) => (
            <div key={a.id} className="alert-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/alerts')}>
              <div className={`alert-dot ${a.severity}`} />
              <div className="alert-content">
                <div className="alert-message">{a.message}</div>
                <div className="alert-meta">
                  <span>{a.field_name || 'General'}</span>
                  <span className={`badge badge-${a.severity}`}>{a.severity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Quick Actions</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn" onClick={() => navigate('/farms')} style={{ justifyContent: 'flex-start' }}>⊞ View All Farms</button>
            <button className="btn" onClick={() => navigate('/alerts')} style={{ justifyContent: 'flex-start' }}>⚡ View All Alerts</button>
            <button className="btn" style={{ justifyContent: 'flex-start' }}>🛰 Satellite Data</button>
            <button className="btn" style={{ justifyContent: 'flex-start' }}>📊 Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  )
}
