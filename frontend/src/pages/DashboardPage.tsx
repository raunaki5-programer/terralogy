import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Farm } from '@/types'
import { API } from '@/lib/api'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [farms, setFarms] = useState<Farm[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [satHealth, setSatHealth] = useState<string>('…')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/farms`).then(r => r.json()).then(d => setFarms(d.farms || [])).catch(() => {}),
      fetch(`${API}/api/alerts`).then(r => r.json()).then(d => setAlerts(d.alerts || [])).catch(() => {}),
      fetch(`${API}/api/satellite/health`).then(r => r.json()).then(d => setSatHealth(d.status === 'ok' ? 'Online' : 'Error')).catch(() => setSatHealth('Offline')),
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Dashboard</div>
          <div className="dashboard-subtitle">Live projects, alerts, and Copernicus status</div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={() => navigate('/projects')}>Open Projects</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/map')}>Open Map</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-icon blue">📁</div>
          <div className="stat-info">
            <div className="stat-label">Projects / Farms</div>
            <div className="stat-value">{loading ? '…' : farms.length}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon green">⊞</div>
          <div className="stat-info">
            <div className="stat-label">Total Fields</div>
            <div className="stat-value">{loading ? '…' : farms.reduce((s, f) => s + (f.field_count || 0), 0)}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon orange">⚡</div>
          <div className="stat-info">
            <div className="stat-label">Alerts</div>
            <div className="stat-value">{loading ? '…' : alerts.length}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon red">🛰</div>
          <div className="stat-info">
            <div className="stat-label">Copernicus</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{satHealth}</div>
          </div>
        </div>
      </div>

      <div className="section-title">
        <span>Recent Projects</span>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => navigate('/projects')}>View All</button>
      </div>

      <div className="projects-grid">
        {farms.length === 0 && !loading ? (
          <div className="empty" style={{ gridColumn: 'span 3' }}>
            <div className="empty-text">No projects yet</div>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/projects')}>Create Project</button>
          </div>
        ) : farms.slice(0, 6).map(farm => (
          <div key={farm.id} className="project-card" onClick={() => navigate('/projects')}>
            <div className="project-card-header">
              <div className="project-icon">🗺</div>
              <div style={{ flex: 1 }}>
                <div className="project-name">{farm.name}</div>
                <div className="project-date">{farm.location.lat.toFixed(3)}, {farm.location.lng.toFixed(3)}</div>
              </div>
            </div>
            <div className="project-stats">
              <div className="project-stat"><span>{farm.field_count} fields</span></div>
              <div className="project-stat"><span>{new Date(farm.created_at).toLocaleDateString()}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title" style={{ marginTop: 24 }}><span>Quick Start</span></div>
      <div className="projects-grid">
        <div className="project-card" onClick={() => navigate('/map')}>
          <div className="project-name">Map Workspace</div>
          <div className="project-date">Draw AOI and run live analysis</div>
        </div>
        <div className="project-card" onClick={() => navigate('/satellite')}>
          <div className="project-name">Copernicus Browser</div>
          <div className="project-date">Search Sentinel-2 catalog & imagery</div>
        </div>
        <div className="project-card" onClick={() => navigate('/ai-analysis')}>
          <div className="project-name">AI Analysis</div>
          <div className="project-date">NDVI, health score, soil, browse</div>
        </div>
        <div className="project-card" onClick={() => navigate('/time-series')}>
          <div className="project-name">Time Series</div>
          <div className="project-date">Monthly product availability</div>
        </div>
      </div>
    </div>
  )
}
