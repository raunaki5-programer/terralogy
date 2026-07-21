import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Farm } from '@/types'

const API = 'https://terralogy-api-v2.onrender.com'

export default function Farms() {
  const navigate = useNavigate()
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
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

  if (loading) return <div className="empty-state"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>Farms</h2>
          <div className="text-muted">{farms.length} farm{farms.length !== 1 ? 's' : ''} registered</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Farm</button>
      </div>

      {farms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌾</div>
          <h3>No farms yet</h3>
          <p>Add your first farm to start monitoring with satellite intelligence</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Your First Farm</button>
        </div>
      ) : (
        <div className="grid-3">
          {farms.map((f) => (
            <div key={f.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/farms/${f.id}`)}>
              <div className="card-body">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{f.name}</h3>
                    <div className="text-muted text-sm">{f.location.lat.toFixed(4)}, {f.location.lng.toFixed(4)}</div>
                  </div>
                  <span className="badge badge-neutral">{f.field_count} fields</span>
                </div>
                <div className="text-xs text-muted mt-3">Registered {new Date(f.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '90%', maxWidth: 440 }}>
            <div className="card-header"><span className="card-title">Add Farm</span></div>
            <div className="card-body">
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
              <div className="flex gap-2 justify-end">
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreate} disabled={!name || !lat || !lng || creating}>{creating ? 'Creating...' : 'Create Farm'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
