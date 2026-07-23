import { useEffect, useState } from 'react'
import { API } from '@/lib/api'
import type { Farm } from '@/types'

export default function ExportsPage() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetch(`${API}/api/farms`).then(r => r.json()).then(d => setFarms(d.farms || [])).catch(() => {})
    fetch(`${API}/api/alerts`).then(r => r.json()).then(d => setAlerts(d.alerts || [])).catch(() => {})
  }, [])

  const download = (filename: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    setStatus(`Downloaded ${filename}`)
  }

  const exportGeoJSON = () => {
    const features = farms.map(f => ({
      type: 'Feature',
      properties: { id: f.id, name: f.name, field_count: f.field_count, created_at: f.created_at },
      geometry: { type: 'Point', coordinates: [f.location.lng, f.location.lat] },
    }))
    download('terralogy-farms.geojson', { type: 'FeatureCollection', features })
  }

  const exportCsv = () => {
    const header = 'id,name,lat,lng,field_count,created_at\n'
    const rows = farms.map(f =>
      `${f.id},"${f.name}",${f.location.lat},${f.location.lng},${f.field_count},${f.created_at}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'terralogy-farms.csv'
    a.click()
    URL.revokeObjectURL(url)
    setStatus('Downloaded terralogy-farms.csv')
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Exports</div>
          <div className="dashboard-subtitle">Download live platform data</div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="stat-info"><div className="stat-label">Farms</div><div className="stat-value">{farms.length}</div></div></div>
        <div className="stat-box"><div className="stat-info"><div className="stat-label">Alerts</div><div className="stat-value">{alerts.length}</div></div></div>
      </div>

      <div className="projects-grid">
        <div className="project-card" onClick={exportGeoJSON}>
          <div className="project-name">Export Farms GeoJSON</div>
          <div className="project-date">Point features for all farms</div>
        </div>
        <div className="project-card" onClick={exportCsv}>
          <div className="project-name">Export Farms CSV</div>
          <div className="project-date">Spreadsheet-ready table</div>
        </div>
        <div className="project-card" onClick={() => download('terralogy-alerts.json', { alerts })}>
          <div className="project-name">Export Alerts JSON</div>
          <div className="project-date">{alerts.length} alert records</div>
        </div>
        <div className="project-card" onClick={() => download('terralogy-farms.json', { farms })}>
          <div className="project-name">Export Farms JSON</div>
          <div className="project-date">Full farm objects</div>
        </div>
      </div>

      {status && <div style={{ marginTop: 16, color: 'var(--success)', fontSize: 13 }}>{status}</div>}
    </div>
  )
}
