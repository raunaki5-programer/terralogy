import { useState } from 'react'

interface LayerRow {
  id: string
  name: string
  type: string
  visible: boolean
  opacity: number
  source: string
}

const DEFAULT: LayerRow[] = [
  { id: '1', name: 'Esri World Imagery', type: 'basemap', visible: true, opacity: 100, source: 'ArcGIS' },
  { id: '2', name: 'Sentinel-2 True Color', type: 'satellite', visible: true, opacity: 100, source: 'Copernicus CDSE' },
  { id: '3', name: 'NDVI Overlay', type: 'analysis', visible: true, opacity: 80, source: 'Copernicus Process API' },
  { id: '4', name: 'NDMI Moisture', type: 'analysis', visible: false, opacity: 70, source: 'Copernicus Process API' },
  { id: '5', name: 'AOI Boundaries', type: 'vector', visible: true, opacity: 100, source: 'Local' },
  { id: '6', name: 'Farm Markers', type: 'vector', visible: true, opacity: 100, source: 'Supabase' },
]

export default function LayersPage() {
  const [layers, setLayers] = useState(DEFAULT)
  const [name, setName] = useState('')
  const [type, setType] = useState('vector')

  const toggle = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l))
  }

  const setOpacity = (id: string, opacity: number) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, opacity } : l))
  }

  const remove = (id: string) => setLayers(prev => prev.filter(l => l.id !== id))

  const add = () => {
    if (!name.trim()) return
    setLayers(prev => [...prev, {
      id: String(Date.now()),
      name,
      type,
      visible: true,
      opacity: 100,
      source: 'User',
    }])
    setName('')
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Layer Manager</div>
          <div className="dashboard-subtitle">{layers.filter(l => l.visible).length} visible / {layers.length} total</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><div className="card-title">Add Layer</div></div>
        <div className="card-body" style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Layer name" />
          </div>
          <div className="form-group" style={{ width: 160, margin: 0 }}>
            <label className="form-label">Type</label>
            <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
              <option value="basemap">Basemap</option>
              <option value="satellite">Satellite</option>
              <option value="vector">Vector</option>
              <option value="analysis">Analysis</option>
            </select>
          </div>
          <button type="button" className="btn btn-primary" onClick={add}>Add</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Visible</th>
              <th>Name</th>
              <th>Type</th>
              <th>Source</th>
              <th>Opacity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {layers.map(l => (
              <tr key={l.id}>
                <td>
                  <input type="checkbox" checked={l.visible} onChange={() => toggle(l.id)} />
                </td>
                <td style={{ fontWeight: 600 }}>{l.name}</td>
                <td><span className="badge badge-blue">{l.type}</span></td>
                <td>{l.source}</td>
                <td style={{ minWidth: 140 }}>
                  <input type="range" min={0} max={100} value={l.opacity} onChange={e => setOpacity(l.id, Number(e.target.value))} style={{ width: '70%' }} />
                  <span style={{ marginLeft: 8, fontSize: 11 }}>{l.opacity}%</span>
                </td>
                <td><button type="button" className="btn btn-sm btn-ghost" onClick={() => remove(l.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
