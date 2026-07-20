import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'
import MapView from '@/components/MapView'

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

  const sevColor = (s: string) => s === 'critical' ? 'var(--danger)' : s === 'warning' ? 'var(--warning)' : 'var(--info)'

  return (
    <div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[{ v: stats.totalFarms, l: 'Farms', c: '#00d4aa' }, { v: stats.totalFields, l: 'Fields', c: '#3b82f6' }, { v: stats.activeAlerts, l: 'Alerts', c: '#ef4444' }, { v: farms.length, l: 'Monitoring', c: '#f59e0b' }].map(s => (
          <div key={s.l} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.c}20` }}><span style={{ fontSize: 18, color: s.c }}>{s.l[0]}</span></div>
            <div><div className="stat-value">{s.v}</div><div className="stat-label">{s.l}</div></div>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <MapView farms={farms} onFarmClick={(f) => navigate(`/farms/${f.id}`)} />
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Alerts</span></div>
          {recentAlerts.length === 0 ? (
            <div className="empty-state"><h3>No alerts</h3><p>All fields are healthy.</p></div>
          ) : recentAlerts.map(a => (
            <div key={a.id} className={`alert-item ${a.read ? 'read' : 'unread'}`} onClick={() => navigate('/alerts')}>
              <div className="alert-dot" style={{ background: sevColor(a.severity) }} />
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
