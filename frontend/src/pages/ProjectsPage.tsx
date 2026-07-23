import { useEffect, useState } from 'react'
import { API } from '@/lib/api'
import type { Farm } from '@/types'

export default function ProjectsPage() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [lat, setLat] = useState('28.6139')
  const [lng, setLng] = useState('77.2090')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    fetch(`${API}/api/farms`).then(r => r.json()).then(d => setFarms(d.farms || [])).catch(e => setError(String(e))).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!name.trim()) return
    setCreating(true)
    setError('')
    try {
      const r = await fetch(`${API}/api/farms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, lat: parseFloat(lat), lng: parseFloat(lng) }),
      })
      if (!r.ok) throw new Error(await r.text())
      setName('')
      load()
    } catch (e: any) {
      setError(e.message)
    }
    setCreating(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this project/farm?')) return
    await fetch(`${API}/api/farms/${id}`, { method: 'DELETE' })
    load()
  }

  const filtered = farms.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Projects</div>
          <div className="dashboard-subtitle">{farms.length} farms registered — live from Supabase</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><div className="card-title">Create Project</div></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Farm name" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Lat</label>
              <input className="form-input" value={lat} onChange={e => setLat(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Lng</label>
              <input className="form-input" value={lng} onChange={e => setLng(e.target.value)} />
            </div>
            <button type="button" className="btn btn-primary" onClick={create} disabled={creating || !name.trim()}>
              {creating ? 'Saving...' : 'Create'}
            </button>
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>{error}</div>}
        </div>
      </div>

      <input className="form-input" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320, marginBottom: 12 }} />

      {loading ? <div className="loading"><div className="spinner" /> Loading...</div> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Fields</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>{f.name}</td>
                  <td>{f.location.lat.toFixed(4)}, {f.location.lng.toFixed(4)}</td>
                  <td>{f.field_count}</td>
                  <td>{new Date(f.created_at).toLocaleDateString()}</td>
                  <td><button type="button" className="btn btn-sm btn-ghost" onClick={() => remove(f.id)}>Delete</button></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No projects yet — create one above</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
