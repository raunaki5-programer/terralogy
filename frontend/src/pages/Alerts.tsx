import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'

export default function Alerts() {
  const navigate = useNavigate()
  const { alerts, fetchAlerts, markAlertRead } = useAppStore()
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all')

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  const filtered = useMemo(() => {
    const list = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)
    return [...list].sort((a, b) => { if (a.read !== b.read) return a.read ? 1 : -1; return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() })
  }, [alerts, filter])

  const sevColor = (s: string) => s === 'critical' ? 'var(--danger)' : 'var(--warning)'

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Alerts</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ k: 'all', l: 'All', n: alerts.length }, { k: 'critical', l: 'Critical', n: alerts.filter(a => a.severity === 'critical').length }, { k: 'warning', l: 'Warning', n: alerts.filter(a => a.severity === 'warning').length }].map(f => (
          <button key={f.k} className={`btn btn-sm ${filter === f.k ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f.k as any)}>{f.l} <span className="badge badge-neutral" style={{ marginLeft: 4 }}>{f.n}</span></button>
        ))}
      </div>
      {filtered.length === 0 ? <div className="empty-state"><h3>No alerts</h3><p>{filter === 'all' ? 'All clear!' : `No ${filter} alerts.`}</p></div> :
       <div className="card" style={{ padding: 0 }}>
         {filtered.map((a, i) => (
           <div key={a.id} className={`alert-item ${a.read ? 'read' : 'unread'}`} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }} onClick={() => { if (!a.read) markAlertRead(a.id); if (a.field_id) navigate(`/fields/${a.field_id}`) }}>
             <div className="alert-dot" style={{ background: sevColor(a.severity) }} />
             <div className="alert-content">
               <div className="alert-message">{a.message}</div>
               <div className="alert-meta"><span className={`badge badge-${a.severity}`}>{a.severity}</span>{a.field_name && <span>{a.field_name}</span>}<span>{new Date(a.created_at).toLocaleDateString()}</span>{!a.read && <span style={{ color: 'var(--accent)', fontWeight: 500 }}>NEW</span>}</div>
             </div>
           </div>
         ))}
       </div>}
    </div>
  )
}
