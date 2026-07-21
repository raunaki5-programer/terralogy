import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Farm, Field } from '@/types'

const API = 'https://terralogy-api-v2.onrender.com'

export default function FarmDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [farm, setFarm] = useState<Farm | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [fName, setFName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`${API}/api/farms/${id}`).then(r => r.json()),
      fetch(`${API}/api/farms/${id}/fields`).then(r => r.json()),
    ]).then(([f, fl]) => {
      setFarm(f)
      setFields(fl.fields || [])
    }).finally(() => setLoading(false))
  }, [id])

  const handleCreate = async () => {
    if (!fName || !id || creating) return
    setCreating(true)
    try {
      const bbox = [[77.2, 28.6], [77.21, 28.6], [77.21, 28.61], [77.2, 28.61], [77.2, 28.6]]
      await fetch(`${API}/api/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farm_id: id, name: fName, boundary: bbox }),
      })
      const fl = await fetch(`${API}/api/farms/${id}/fields`).then(r => r.json())
      setFields(fl.fields || [])
      setShowAdd(false); setFName('')
    } catch (e) { console.error(e) }
    setCreating(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this farm and all its fields?')) return
    await fetch(`${API}/api/farms/${id}`, { method: 'DELETE' })
    navigate('/farms')
  }

  if (loading) return <div className="empty-state"><div className="loading-spinner" /></div>
  if (!farm) return <div className="empty-state"><h3>Farm not found</h3><button className="btn btn-primary" onClick={() => navigate('/')}>Go to Dashboard</button></div>

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate('/farms')}>← Back to Farms</button>

      <div className="detail-header">
        <div>
          <h2>{farm.name}</h2>
          <div className="detail-meta">{farm.location.lat.toFixed(4)}, {farm.location.lng.toFixed(4)}</div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Fields ({fields.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Field</button>
      </div>

      {fields.length === 0 ? (
        <div className="empty-state" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 40 }}>
          <div className="empty-state-icon">⊞</div>
          <h3>No fields yet</h3>
          <p>Add a field to start satellite analysis</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Field</button>
        </div>
      ) : (
        <div className="field-grid">
          {fields.map((f) => (
            <div key={f.id} className="field-card" onClick={() => navigate(`/fields/${f.id}`)}>
              <div className="field-card-name">{f.name}</div>
              <div className="field-card-meta">{f.area_ha} ha{f.crop ? ` · ${f.crop.crop_type}` : ''}</div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">Add Field</div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Field Name</label>
                <input className="form-input" placeholder="e.g. Wheat Field" value={fName} onChange={e => setFName(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={!fName.trim() || creating}>{creating ? 'Creating...' : 'Create Field'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
