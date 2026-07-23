import { useState, useRef } from 'react'
import { API } from '@/lib/api'

interface Product {
  id: string
  datetime?: string
  cloud_cover?: number
  platform?: string
  bbox?: number[]
  thumbnail?: string
  collection?: string
  name?: string
}

export default function CopernicusBrowser() {
  const [lat, setLat] = useState('28.6139')
  const [lng, setLng] = useState('77.2090')
  const [delta, setDelta] = useState('0.08')
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 90)
    return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [maxCloud, setMaxCloud] = useState('60')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [source, setSource] = useState('')
  const [trueColor, setTrueColor] = useState<string | null>(null)
  const [ndviImage, setNdviImage] = useState<string | null>(null)
  const [indices, setIndices] = useState<any>(null)
  const [selected, setSelected] = useState<Product | null>(null)
  const [authStatus, setAuthStatus] = useState<string>('')
  const bboxRef = useRef({ west: 0, south: 0, east: 0, north: 0, str: '' })

  const bbox = () => {
    const la = parseFloat(lat), ln = parseFloat(lng), d = parseFloat(delta)
    return {
      west: ln - d, south: la - d, east: ln + d, north: la + d,
      str: `${ln - d},${la - d},${ln + d},${la + d}`,
    }
  }

  const checkAuth = async () => {
    try {
      const r = await fetch(`${API}/api/satellite/health`)
      const d = await r.json()
      setAuthStatus(d.status === 'ok' ? 'Copernicus authenticated' : `Error: ${d.copernicus}`)
    } catch (e: any) {
      setAuthStatus(`Offline: ${e.message}`)
    }
  }

  const updateBboxRef = () => { bboxRef.current = bbox() }

  const clearAll = () => {
    setTrueColor(null)
    setNdviImage(null)
    setIndices(null)
    setProducts([])
    setError('')
  }

  const searchCatalog = async () => {
    setLoading(true)
    setError('')
    updateBboxRef()
    const b = bboxRef.current
    try {
      const q = new URLSearchParams({
        west: String(b.west), south: String(b.south), east: String(b.east), north: String(b.north),
        date_from: dateFrom, date_to: dateTo, max_cloud: maxCloud, limit: '25',
      })
      const r = await fetch(`${API}/api/satellite/catalog?${q}`)
      if (!r.ok) throw new Error(await r.text())
      const d = await r.json()
      setProducts(d.products || [])
      setSource(d.source || '')
      if (!(d.products || []).length) setError('No products found for this area/date range. Try wider dates or larger area.')
    } catch (e: any) {
      setError(e.message || 'Catalog search failed')
    }
    setLoading(false)
  }

  const loadImagery = async () => {
    setLoading(true)
    clearAll()
    updateBboxRef()
    try {
      const b = bboxRef.current
      const [tc, nd, idx] = await Promise.all([
        fetch(`${API}/api/satellite/true-color?bbox=${b.str}&width=512&height=512`).then(r => r.json()),
        fetch(`${API}/api/satellite/ndvi-image?bbox=${b.str}&width=512&height=512`).then(r => r.json()),
        fetch(`${API}/api/satellite/indices?bbox=${b.str}`).then(r => r.json()),
      ])
      if (tc.data_url) setTrueColor(tc.data_url)
      if (tc.status === 'error') setError(`True color: ${tc.detail || tc.code}`)
      if (nd.data_url) setNdviImage(nd.data_url)
      if (nd.status === 'error') setError(`NDVI: ${nd.detail || nd.code}`)
      setIndices(idx)
    } catch (e: any) {
      setError(e.message || 'Imagery load failed')
    }
    setLoading(false)
  }

  const fullBrowse = async () => {
    setLoading(true)
    clearAll()
    updateBboxRef()
    try {
      const q = new URLSearchParams({
        lat, lng, delta,
        date_from: dateFrom, date_to: dateTo,
      })
      const r = await fetch(`${API}/api/satellite/browse?${q}`)
      if (!r.ok) throw new Error(await r.text())
      const d = await r.json()
      setProducts(d.catalog?.products || [])
      setSource(d.catalog?.source || '')
      if (d.true_color?.data_url) setTrueColor(d.true_color.data_url)
      if (d.ndvi_image?.data_url) setNdviImage(d.ndvi_image.data_url)
      setIndices(d.indices)
    } catch (e: any) {
      setError(e.message || 'Browse failed')
    }
    setLoading(false)
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Copernicus Browser</div>
          <div className="dashboard-subtitle">Search Sentinel-2 catalog and load true-color / NDVI imagery via CDSE</div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={checkAuth}>Check Auth</button>
          <button type="button" className="btn btn-primary" onClick={fullBrowse} disabled={loading}>
            {loading ? 'Loading...' : 'Full Browse'}
          </button>
        </div>
      </div>

      {authStatus && (
        <div style={{ marginBottom: 12, fontSize: 12, color: authStatus.includes('authenticated') ? 'var(--success)' : 'var(--warning)' }}>
          {authStatus}
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><div className="card-title">Search Parameters</div></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input className="form-input" value={lat} onChange={e => setLat(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input className="form-input" value={lng} onChange={e => setLng(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Half-extent (deg)</label>
              <input className="form-input" value={delta} onChange={e => setDelta(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Date From</label>
              <input className="form-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Date To</label>
              <input className="form-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Cloud %</label>
              <input className="form-input" value={maxCloud} onChange={e => setMaxCloud(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn btn-primary" onClick={searchCatalog} disabled={loading}>Search Catalog</button>
            <button type="button" className="btn" onClick={loadImagery} disabled={loading}>Load True Color + NDVI</button>
          </div>
          {error && <div style={{ marginTop: 12, color: 'var(--danger)', fontSize: 12 }}>{error}</div>}
        </div>
      </div>

      {indices && (
        <div className="stats-row" style={{ marginBottom: 16 }}>
          <div className="stat-box">
            <div className="stat-info">
              <div className="stat-label">NDVI Mean</div>
              <div className="stat-value">{indices.ndvi?.mean ?? '—'}</div>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-info">
              <div className="stat-label">NDMI Mean</div>
              <div className="stat-value">{indices.ndmi?.mean ?? '—'}</div>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-info">
              <div className="stat-label">Source</div>
              <div className="stat-value" style={{ fontSize: 14 }}>{indices.source || indices.status || '—'}</div>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-info">
              <div className="stat-label">Products</div>
              <div className="stat-value">{products.length}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">True Color (Sentinel-2)</div></div>
          <div className="card-body" style={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {trueColor ? (
              <img src={trueColor} alt="True color" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 6 }} />
            ) : (
              <span className="text-muted">Load imagery to preview true color</span>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">NDVI False Color</div></div>
          <div className="card-body" style={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {ndviImage ? (
              <img src={ndviImage} alt="NDVI" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 6 }} />
            ) : (
              <span className="text-muted">Load imagery to preview NDVI</span>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Catalog Results</div>
            <div className="card-subtitle">{products.length} products {source ? `via ${source}` : ''}</div>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID / Name</th>
                <th>Date</th>
                <th>Cloud %</th>
                <th>Platform</th>
                <th>Collection</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-tertiary)' }}>Search the catalog to list Sentinel-2 products</td></tr>
              ) : products.map(p => (
                <tr key={p.id} style={{ cursor: 'pointer', background: selected?.id === p.id ? 'var(--bg-tertiary)' : undefined }} onClick={() => setSelected(p)}>
                  <td style={{ fontWeight: 500, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name || p.id}</td>
                  <td>{p.datetime ? new Date(p.datetime).toLocaleString() : '—'}</td>
                  <td>{p.cloud_cover != null ? Number(p.cloud_cover).toFixed(1) : '—'}</td>
                  <td>{p.platform || '—'}</td>
                  <td>{p.collection || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header"><div className="card-title">Selected Product</div></div>
          <div className="card-body" style={{ fontSize: 12, fontFamily: 'Consolas, monospace', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
            {JSON.stringify(selected, null, 2)}
          </div>
        </div>
      )}
    </div>
  )
}
