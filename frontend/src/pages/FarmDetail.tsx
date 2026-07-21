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

  const load = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [fr, flr] = await Promise.all([
        fetch(`${API}/api/farms/${id}`),
        fetch(`${API}/api/farms/${id}/fields`),
      ])
      if (fr.ok) setFarm(await fr.json())
      if (flr.ok) setFields((await flr.json()).fields || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const handleCreate = async () => {
    if (!fName || !id || creating) return
    setCreating(true)
    try {
      const bbox = [[77.2, 28.6], [77.21, 28.6], [77.21, 28.61], [77.2, 28.61], [77.2, 28.6]]
      const r = await fetch(`${API}/api/fields`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farm_id: id, name: fName, boundary: bbox }),
      })
      if (r.ok) { setShowAdd(false); setFName(''); load() }
    } catch (e) { console.error(e) }
    setCreating(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this farm and all its fields?')) return
    try {
      await fetch(`${API}/api/farms/${id}`, { method: 'DELETE' })
      navigate('/')
    } catch (e) { console.error(e) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}>Loading...</div>
  if (!farm) return <div style={{ textAlign: 'center', padding: 60 }}><h3>Farm not found</h3><button onClick={() => navigate('/')} style={{ marginTop: 12, padding: '8px 16px', background: '#00d4aa', color: '#0a0f1a', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Go to Dashboard</button></div>

  return (
    <div>
      <button onClick={() => navigate('/')} style={{ padding: '6px 12px', background: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 8, cursor: 'pointer', marginBottom: 16 }}>← Dashboard</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#f1f5f9' }}>{farm.name}</h2>
          <div style={{ color: '#64748b', fontSize: 14 }}>{farm.location.lat.toFixed(4)}, {farm.location.lng.toFixed(4)}</div>
        </div>
        <button onClick={handleDelete} style={{ padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Delete</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Fields ({fields.length})</h3>
        <button onClick={() => setShowAdd(true)} style={{ padding: '6px 14px', background: '#00d4aa', color: '#0a0f1a', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>+ Add Field</button>
      </div>

      {fields.length === 0 ? (
        <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>No fields yet. Add one to start satellite analysis.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {fields.map((f) => (
            <div key={f.id} onClick={() => navigate(`/fields/${f.id}`)} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 10, padding: 20, cursor: 'pointer' }}>
              <h4 style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>{f.name}</h4>
              <div style={{ color: '#64748b', fontSize: 13 }}>{f.area_ha} ha</div>
              {f.crop && <div style={{ marginTop: 8, padding: '2px 8px', borderRadius: 20, background: '#1e293b', color: '#94a3b8', fontSize: 11, display: 'inline-block' }}>{f.crop.crop_type}</div>}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 12, padding: 24, width: '90%', maxWidth: 400 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#f1f5f9' }}>Add Field</h3>
            <input style={{ width: '100%', padding: '10px 14px', background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none' }} placeholder="Field name" value={fName} onChange={(e) => setFName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowAdd(false)} style={{ padding: '8px 16px', background: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreate} disabled={!fName.trim() || creating} style={{ padding: '8px 16px', background: '#00d4aa', color: '#0a0f1a', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, opacity: !fName.trim() || creating ? 0.5 : 1 }}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
