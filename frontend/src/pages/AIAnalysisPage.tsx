import { useState } from 'react'
import { API } from '@/lib/api'

interface AnalysisCard {
  id: string
  name: string
  description: string
  icon: string
  color: string
  endpoint: 'area' | 'indices' | 'ndvi' | 'browse'
}

const ANALYSES: AnalysisCard[] = [
  { id: 'ndvi', name: 'NDVI Analysis', description: 'Vegetation health from Sentinel-2', icon: '🌿', color: '#10b981', endpoint: 'indices' },
  { id: 'ndwi', name: 'NDMI Moisture', description: 'Canopy moisture index', icon: '💧', color: '#06b6d4', endpoint: 'indices' },
  { id: 'crop', name: 'Crop Health', description: 'Full area health + yield scoring', icon: '🌾', color: '#22c55e', endpoint: 'area' },
  { id: 'soil', name: 'Soil Context', description: 'SoilGrids + moisture analysis', icon: '🏜', color: '#8b5a3c', endpoint: 'area' },
  { id: 'browse', name: 'Copernicus Browse', description: 'Catalog + true color + NDVI image', icon: '🛰', color: '#3b82f6', endpoint: 'browse' },
  { id: 'ndvi_img', name: 'NDVI Image', description: 'False-color NDVI raster from CDSE', icon: '🗺', color: '#166534', endpoint: 'ndvi' },
]

export default function AIAnalysisPage() {
  const [lat, setLat] = useState('28.6139')
  const [lng, setLng] = useState('77.2090')
  const [running, setRunning] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [image, setImage] = useState<string | null>(null)

  const run = async (card: AnalysisCard) => {
    setRunning(card.id)
    setError('')
    setResult(null)
    setImage(null)
    const la = parseFloat(lat)
    const ln = parseFloat(lng)
    const d = 0.05
    const bbox = `${ln - d},${la - d},${ln + d},${la + d}`

    try {
      if (card.endpoint === 'area') {
        const r = await fetch(`${API}/api/analysis/area?lat=${la}&lng=${ln}`, { method: 'POST' })
        if (!r.ok) throw new Error(await r.text())
        setResult(await r.json())
      } else if (card.endpoint === 'indices') {
        const r = await fetch(`${API}/api/satellite/indices?bbox=${bbox}`)
        if (!r.ok) throw new Error(await r.text())
        setResult(await r.json())
      } else if (card.endpoint === 'ndvi') {
        const r = await fetch(`${API}/api/satellite/ndvi-image?bbox=${bbox}&width=512&height=512`)
        if (!r.ok) throw new Error(await r.text())
        const d = await r.json()
        setResult(d)
        if (d.data_url) setImage(d.data_url)
      } else if (card.endpoint === 'browse') {
        const r = await fetch(`${API}/api/satellite/browse?lat=${la}&lng=${ln}&delta=0.05`)
        if (!r.ok) throw new Error(await r.text())
        const d = await r.json()
        setResult(d)
        if (d.true_color?.data_url) setImage(d.true_color.data_url)
      }
    } catch (e: any) {
      setError(e.message || 'Analysis failed')
    }
    setRunning(null)
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">AI Analysis</div>
          <div className="dashboard-subtitle">Run live Copernicus + ML scoring on any coordinate</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Latitude</label>
            <input className="form-input" value={lat} onChange={e => setLat(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Longitude</label>
            <input className="form-input" value={lng} onChange={e => setLng(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="ai-cards">
        {ANALYSES.map(a => (
          <div key={a.id} className="ai-card" style={{ borderLeft: `3px solid ${a.color}` }}>
            <div className="ai-card-icon" style={{ background: `${a.color}22`, color: a.color }}>{a.icon}</div>
            <div className="ai-card-title">{a.name}</div>
            <div className="ai-card-desc">{a.description}</div>
            <div className="ai-card-actions">
              <button type="button" className="btn btn-sm btn-primary" onClick={() => run(a)} disabled={!!running}>
                {running === a.id ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {image && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><div className="card-title">Imagery Result</div></div>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <img src={image} alt="result" style={{ maxWidth: '100%', maxHeight: 420, borderRadius: 8 }} />
          </div>
        </div>
      )}

      {result && (
        <div className="card">
          <div className="card-header"><div className="card-title">Analysis Output</div></div>
          <div className="card-body">
            {result.vegetation && (
              <div className="stats-row" style={{ marginBottom: 16 }}>
                <div className="stat-box"><div className="stat-info"><div className="stat-label">NDVI</div><div className="stat-value">{result.vegetation?.ndvi ?? '—'}</div></div></div>
                <div className="stat-box"><div className="stat-info"><div className="stat-label">NDMI</div><div className="stat-value">{result.vegetation?.ndmi ?? '—'}</div></div></div>
                <div className="stat-box"><div className="stat-info"><div className="stat-label">Health</div><div className="stat-value">{result.health?.score ?? '—'}</div></div></div>
                <div className="stat-box"><div className="stat-info"><div className="stat-label">Soil pH</div><div className="stat-value">{result.soil?.ph ?? '—'}</div></div></div>
              </div>
            )}
            {result.ndvi?.mean != null && (
              <div className="stats-row" style={{ marginBottom: 16 }}>
                <div className="stat-box"><div className="stat-info"><div className="stat-label">NDVI</div><div className="stat-value">{result.ndvi.mean}</div></div></div>
                <div className="stat-box"><div className="stat-info"><div className="stat-label">NDMI</div><div className="stat-value">{result.ndmi?.mean ?? '—'}</div></div></div>
                <div className="stat-box"><div className="stat-info"><div className="stat-label">Source</div><div className="stat-value" style={{ fontSize: 14 }}>{result.source || result.status}</div></div></div>
              </div>
            )}
            {result.catalog && (
              <div style={{ marginBottom: 12, fontSize: 13 }}>Catalog products: <strong>{result.catalog.count}</strong> ({result.catalog.source})</div>
            )}
            <pre style={{ fontSize: 11, background: 'var(--bg-primary)', padding: 12, borderRadius: 6, overflow: 'auto', maxHeight: 360 }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
