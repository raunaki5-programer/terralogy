import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Farm } from '@/types'

const API = 'https://terralogy-api-v2.onrender.com'

export default function Farms() {
  const navigate = useNavigate()
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/farms`).then(r => r.json()).then(d => setFarms(d.farms || [])).finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!name || !lat || !lng || creating) return
    setCreating(true)
    try {
      await fetch(`${API}/api/farms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, lat: parseFloat(lat), lng: parseFloat(lng) }),
      })
      const d = await fetch(`${API}/api/farms`).then(r => r.json())
      setFarms(d.farms || [])
      setShowAdd(false); setName(''); setLat(''); setLng('')
    } catch (e) { console.error(e) }
    setCreating(false)
  }

  const filtered = farms.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="empty-state"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>Farms</h2>
          <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{farms.length} farm{farms.length !== 1 ? 's' : ''} registered</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Farm</button>
      </div>

      {farms.length > 0 && (
        <div className="mb-4">
          <input className="form-input" placeholder="Search farms..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
        </div>
      )}

      {farms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌾</div>
          <h3>No farms yet</h3>
          <p>Add your first farm to start monitoring with satellite intelligence</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Your First Farm</button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Fields</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/farms/${f.id}`)}>
                  <td style={{ fontWeight: 600 }}>{f.name}</td>
                  <td className="text-secondary">{f.location.lat.toFixed(4)}, {f.location.lng.toFixed(4)}</td>
                  <td><span className="badge badge-neutral">{f.field_count}</span></td>
                  <td className="text-secondary" style={{ fontSize: 12 }}>{new Date(f.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>No farms match your search</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">Add Farm</div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Farm Name</label>
                <input className="form-input" placeholder="e.g. Green Valley Farm" value={name} onChange={e => setName(e.target.value)} autoFocus />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input className="form-input" placeholder="28.6139" value={lat} onChange={e => setLat(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input className="form-input" placeholder="77.2090" value={lng} onChange={e => setLng(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={!name || !lat || !lng || creating}>{creating ? 'Creating...' : 'Create Farm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
