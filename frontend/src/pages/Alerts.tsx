import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Alert } from '@/types'

const API = 'https://terralogy-api-v2.onrender.com'

export default function Alerts() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all')

  useEffect(() => {
    fetch(`${API}/api/alerts`).then(r => r.json()).then(d => setAlerts(d.alerts || [])).catch(() => {})
  }, [])

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)
  const sorted = [...filtered].sort((a, b) => (a.read ? 1 : 0) - (b.read ? 1 : 0) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const markRead = async (id: string) => {
    await fetch(`${API}/api/alerts/${id}/read`, { method: 'PATCH' })
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a))
  }

  const counts = {
    all: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Alerts</h2>

      <div className="flex gap-2 mb-4">
        {([['all', 'All'], ['critical', 'Critical'], ['warning', 'Warning']] as const).map(([k, label]) => (
          <button key={k} className={`btn btn-sm ${filter === k ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(k)}>
            {label} <span className="badge badge-neutral ml-1">{counts[k]}</span>
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <h3>No alerts</h3>
          <p>{filter === 'all' ? 'All clear!' : `No ${filter} alerts.`}</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {sorted.map((a, i) => (
            <div key={a.id} className="alert-item" style={{ opacity: a.read ? 0.6 : 1 }} onClick={() => { if (!a.read) markRead(a.id); if (a.field_id) navigate(`/fields/${a.field_id}`) }}>
              <div className={`alert-dot ${a.severity}`} />
              <div className="alert-content">
                <div className="alert-message">{a.message}</div>
                <div className="alert-meta">
                  <span className={`badge badge-${a.severity}`}>{a.severity}</span>
                  {a.field_name && <span>{a.field_name}</span>}
                  <span>{new Date(a.created_at).toLocaleDateString()}</span>
                  {!a.read && <span style={{ color: 'var(--accent)', fontWeight: 600 }}>NEW</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
