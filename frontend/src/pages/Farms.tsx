import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'

export default function Farms() {
  const navigate = useNavigate()
  const { farms, loading, fetchFarms, createFarm, deleteFarm } = useAppStore()
  const [show, setShow] = useState(false)
  const [name, setName] = useState(''); const [lat, setLat] = useState(''); const [lng, setLng] = useState('')
  const [confirmDel, setConfirmDel] = useState<string | null>(null)

  useEffect(() => { fetchFarms() }, [fetchFarms])

  const handleCreate = async () => {
    if (!name || !lat || !lng) return
    await createFarm(name, parseFloat(lat), parseFloat(lng))
    setShow(false); setName(''); setLat(''); setLng('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 style={{ fontSize: 22, fontWeight: 600 }}>Farms</h2><p className="text-muted">{farms.length} farm{farms.length !== 1 ? 's' : ''}</p></div>
        <button className="btn btn-primary" onClick={() => setShow(true)}>+ Add Farm</button>
      </div>
      {loading ? <div className="grid-3">{[1,2,3].map(i => <div key={i} className="card"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-text" /></div>)}</div> :
       farms.length === 0 ? <div className="empty-state"><h3>No farms yet</h3><p>Add your first farm to get started.</p><button className="btn btn-primary" onClick={() => setShow(true)}>Add Farm</button></div> :
       <div className="grid-3">{farms.map(f => (
         <div key={f.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/farms/${f.id}`)}>
           <div className="flex items-center justify-between mb-2"><h3 style={{ fontSize: 16, fontWeight: 600 }}>{f.name}</h3><button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setConfirmDel(f.id) }}>🗑</button></div>
           <div className="text-muted" style={{ fontSize: 13 }}>{f.location.lat.toFixed(4)}, {f.location.lng.toFixed(4)}</div>
           <div className="flex items-center gap-3 mt-2"><span className="badge badge-neutral">{f.field_count} fields</span></div>
         </div>
       ))}</div>}
      {show && <div className="modal-overlay" onClick={() => setShow(false)}><div className="modal" onClick={e => e.stopPropagation()}><h3>Add Farm</h3><input className="form-input" placeholder="Farm Name" value={name} onChange={e => setName(e.target.value)} autoFocus /><div className="grid-2 mt-3"><input className="form-input" placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} /><input className="form-input" placeholder="Longitude" value={lng} onChange={e => setLng(e.target.value)} /></div><div className="modal-actions mt-3"><button className="btn btn-ghost" onClick={() => setShow(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></div></div></div>}
      {confirmDel && <div className="modal-overlay" onClick={() => setConfirmDel(null)}><div className="modal" onClick={e => e.stopPropagation()}><h3>Delete Farm?</h3><p>This will permanently delete the farm and all its fields.</p><div className="modal-actions mt-3"><button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancel</button><button className="btn btn-danger" onClick={() => { deleteFarm(confirmDel); setConfirmDel(null) }}>Delete</button></div></div></div>}
    </div>
  )
}
