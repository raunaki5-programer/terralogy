import { useEffect, useState } from 'react'
import type { Alert } from '@/types'

const API = 'https://terralogy-api-v2.onrender.com'

type Filter = 'all' | 'critical' | 'warning' | 'info'

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    fetch(`${API}/api/alerts`).then(r => r.json()).then(d => setAlerts(d.alerts || [])).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)
  const counts = {
    all: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
  }

  if (loading) return <div className="empty-state"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="mb-6">
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>Alerts</h2>
        <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{alerts.length} total alerts</div>
      </div>

      <div className="filter-pills">
        {(['all', 'critical', 'warning', 'info'] as Filter[]).map(f => (
          <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <div className="empty-state-icon">&#10003;</div>
          <h3>No alerts</h3>
          <p>No {filter !== 'all' ? filter : ''} alerts at this time.</p>
        </div>
      ) : (
        <div className="card">
          <div className="alert-list">
            {filtered.map((a) => (
              <div key={a.id} className="alert-item">
                <div className={`alert-icon ${a.severity}`}>&#9889;</div>
                <div className="alert-content">
                  <div className="alert-title">{a.message}</div>
                  <div className="alert-meta">
                    <span>{a.field_name || 'General'}</span>
                    <span className={`badge badge-${a.severity}`}>{a.severity}</span>
                    <span>{new Date(a.created_at).toLocaleDateString()} {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
