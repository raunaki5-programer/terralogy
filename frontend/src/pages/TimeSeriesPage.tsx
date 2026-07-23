import { useState } from 'react'
import { API } from '@/lib/api'

export default function TimeSeriesPage() {
  const [lat, setLat] = useState('28.6139')
  const [lng, setLng] = useState('77.2090')
  const [loading, setLoading] = useState(false)
  const [series, setSeries] = useState<any[]>([])
  const [error, setError] = useState('')

  const run = async () => {
    setLoading(true)
    setError('')
    setSeries([])
    try {
      const end = new Date()
      const points: any[] = []
      const la = parseFloat(lat)
      const ln = parseFloat(lng)
      const d = 0.05
      const west = ln - d, south = la - d, east = ln + d, north = la + d

      for (let i = 5; i >= 0; i--) {
        const to = new Date(end)
        to.setDate(to.getDate() - i * 30)
        const from = new Date(to)
        from.setDate(from.getDate() - 25)
        const date_from = from.toISOString().slice(0, 10)
        const date_to = to.toISOString().slice(0, 10)
        const cat = await fetch(
          `${API}/api/satellite/catalog?west=${west}&south=${south}&east=${east}&north=${north}&date_from=${date_from}&date_to=${date_to}&max_cloud=80&limit=5`
        ).then(r => r.json())
        points.push({
          period: `${date_from} → ${date_to}`,
          products: cat.count || 0,
          sample: (cat.products || [])[0]?.datetime || null,
          cloud: (cat.products || [])[0]?.cloud_cover ?? null,
        })
      }

      const bbox = `${west},${south},${east},${north}`
      const idx = await fetch(`${API}/api/satellite/indices?bbox=${bbox}`).then(r => r.json())
      points.push({
        period: 'Current indices',
        products: '—',
        ndvi: idx.ndvi?.mean,
        ndmi: idx.ndmi?.mean,
        source: idx.source,
      })
      setSeries(points)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Time Series</div>
          <div className="dashboard-subtitle">Monthly Sentinel-2 availability + current vegetation indices</div>
        </div>
        <button type="button" className="btn btn-primary" onClick={run} disabled={loading}>
          {loading ? 'Running...' : 'Run Time Series'}
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ display: 'flex', gap: 12 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Lat</label>
            <input className="form-input" value={lat} onChange={e => setLat(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Lng</label>
            <input className="form-input" value={lng} onChange={e => setLng(e.target.value)} />
          </div>
        </div>
        {error && <div style={{ color: 'var(--danger)', padding: '0 20px 16px', fontSize: 12 }}>{error}</div>}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Products</th>
              <th>Sample Date</th>
              <th>Cloud %</th>
              <th>NDVI</th>
              <th>NDMI</th>
            </tr>
          </thead>
          <tbody>
            {series.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>Click Run Time Series to query Copernicus catalog</td></tr>
            ) : series.map((row, i) => (
              <tr key={i}>
                <td>{row.period}</td>
                <td>{row.products}</td>
                <td>{row.sample ? new Date(row.sample).toLocaleDateString() : '—'}</td>
                <td>{row.cloud != null ? Number(row.cloud).toFixed(1) : '—'}</td>
                <td>{row.ndvi ?? '—'}</td>
                <td>{row.ndmi ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
