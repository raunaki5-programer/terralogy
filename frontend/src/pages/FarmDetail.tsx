import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store'
import type { Farm, Field } from '@/types'

const API = 'https://terralogy-api-v2.onrender.com'

export default function FarmDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { createField, deleteFarm } = useAppStore()
  const [farm, setFarm] = useState<Farm | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)
  const [fName, setFName] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      fetch(`${API}/api/farms/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`${API}/api/farms/${id}/fields`).then(r => r.ok ? r.json() : null),
    ]).then(([f, fl]) => {
      setFarm(f)
      setFields(fl?.fields || [])
    }).finally(() => setLoading(false))
  }, [id])

  const handleCreate = async () => {
    if (!fName || !id) return
    const bbox = [[77.2, 28.6], [77.21, 28.6], [77.21, 28.61], [77.2, 28.61], [77.2, 28.6]]
    await createField(id, fName, bbox)
    setShow(false); setFName('')
    const r = await fetch(`${API}/api/farms/${id}/fields`)
    if (r.ok) setFields((await r.json()).fields || [])
  }

  if (loading) return <div className="empty-state"><div className="loading-spinner" />Loading farm...</div>
  if (!farm) return <div className="empty-state"><h3>Farm not found</h3><button className="btn btn-ghost" onClick={() => navigate('/')}>Go to Dashboard</button></div>

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-3" onClick={() => navigate('/')}>← Dashboard</button>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 600 }}>{farm.name}</h2>
          <div className="text-muted">{farm.location.lat.toFixed(4)}, {farm.location.lng.toFixed(4)}</div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={async () => { await deleteFarm(farm.id); navigate('/') }}>Delete Farm</button>
      </div>
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Fields ({fields.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShow(true)}>+ Add Field</button>
      </div>
      {fields.length === 0 ? <p className="text-muted">No fields yet. Add one to start analysis.</p> :
       <div className="grid-3">{fields.map(f => (
         <div key={f.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/fields/${f.id}`)}>
           <h4 style={{ fontWeight: 600 }}>{f.name}</h4>
           <div className="text-muted mt-1">{f.area_ha} ha</div>
           {f.crop && <span className="badge badge-neutral mt-1">{f.crop.crop_type}</span>}
         </div>
       ))}</div>}
      {show && <div className="modal-overlay" onClick={() => setShow(false)}><div className="modal" onClick={e => e.stopPropagation()}><h3>Add Field</h3><input className="form-input" placeholder="Field Name" value={fName} onChange={e => setFName(e.target.value)} autoFocus /><div className="modal-actions mt-3"><button className="btn btn-ghost" onClick={() => setShow(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></div></div></div>}
    </div>
  )
}
