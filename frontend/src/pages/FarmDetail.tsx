import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store'

export default function FarmDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { farms, fields, fetchFields, selectFarm, createField, deleteFarm } = useAppStore()
  const [show, setShow] = useState(false)
  const [fName, setFName] = useState('')

  const farm = farms.find(f => f.id === id)

  useEffect(() => { if (id) { selectFarm(farm || null); fetchFields(id) } }, [id])

  const handleCreate = async () => {
    if (!fName || !id) return
    const bbox = [[77.2, 28.6], [77.21, 28.6], [77.21, 28.61], [77.2, 28.61], [77.2, 28.6]]
    await createField(id, fName, bbox)
    setShow(false); setFName('')
  }

  if (!farm) return <div className="empty-state"><h3>Farm not found</h3></div>

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-3" onClick={() => navigate('/farms')}>← Back to Farms</button>
      <div className="flex items-center justify-between mb-4"><h2 style={{ fontSize: 22, fontWeight: 600 }}>{farm.name}</h2><button className="btn btn-danger btn-sm" onClick={() => { deleteFarm(farm.id); navigate('/farms') }}>Delete Farm</button></div>
      <div className="text-muted mb-4">{farm.location.lat.toFixed(4)}, {farm.location.lng.toFixed(4)}</div>
      <div className="flex items-center justify-between mb-3"><h3 style={{ fontSize: 16, fontWeight: 600 }}>Fields ({fields.length})</h3><button className="btn btn-primary btn-sm" onClick={() => setShow(true)}>+ Add Field</button></div>
      {fields.length === 0 ? <p className="text-muted">No fields yet.</p> :
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
