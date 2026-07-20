import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'
import MapView from '@/components/MapView'
import WeatherWidget from '@/components/WeatherWidget'

export default function Dashboard() {
  const navigate = useNavigate()
  const { farms, fetchFarms, alerts, fetchAlerts } = useAppStore()

  useEffect(() => { fetchFarms(); fetchAlerts() }, [fetchFarms, fetchAlerts])

  const stats = useMemo(() => ({
    totalFarms: farms.length,
    totalFields: farms.reduce((s, f) => s + (f.field_count || 0), 0),
    activeAlerts: alerts.filter(a => !a.read).length,
  }), [farms, alerts])

  const recentAlerts = useMemo(() =>
    [...alerts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
  , [alerts])

  const sev = (s: string) => s === 'critical' ? 'var(--danger)' : 'var(--warning)'

  return (
    <div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0,212,170,0.12)' }}>🌾</div>
          <div><div className="stat-value">{stats.totalFarms}</div><div className="stat-label">Farms</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>⊞</div>
          <div><div className="stat-value">{stats.totalFields}</div><div className="stat-label">Fields</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>⚡</div>
          <div><div className="stat-value">{stats.activeAlerts}</div><div className="stat-label">Alerts</div></div>
        </div>
        <WeatherWidget />
      </div>
      <div className="grid-2">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <MapView farms={farms} onFarmClick={(f) => navigate(`/farms/${f.id}`)} />
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Alerts</span></div>
          {recentAlerts.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}><p>All fields healthy</p></div>
          ) : recentAlerts.map(a => (
            <div key={a.id} className="alert-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/alerts')}>
              <div className="alert-dot" style={{ background: sev(a.severity) }} />
              <div className="alert-content">
                <div className="alert-message">{a.message}</div>
                <div className="alert-meta"><span>{a.field_name || 'General'}</span><span className={`badge badge-${a.severity}`}>{a.severity}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
