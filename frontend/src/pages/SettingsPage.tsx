import { useEffect, useState } from 'react'
import { API } from '@/lib/api'

export default function SettingsPage() {
  const [apiHealth, setApiHealth] = useState<any>(null)
  const [satHealth, setSatHealth] = useState<any>(null)
  const [apiUrl] = useState(API)

  useEffect(() => {
    fetch(`${API}/api/health`).then(r => r.json()).then(setApiHealth).catch(e => setApiHealth({ status: 'error', detail: String(e) }))
    fetch(`${API}/api/satellite/health`).then(r => r.json()).then(setSatHealth).catch(e => setSatHealth({ status: 'error', detail: String(e) }))
  }, [])

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Settings</div>
          <div className="dashboard-subtitle">Platform configuration and service status</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, maxWidth: 640 }}>
        <div className="card-header"><div className="card-title">API Connection</div></div>
        <div className="card-body" style={{ fontSize: 13 }}>
          <div className="props-row"><span className="props-row-label">Backend URL</span><span className="props-row-value">{apiUrl}</span></div>
          <div className="props-row"><span className="props-row-label">API Health</span><span className="props-row-value" style={{ color: apiHealth?.status === 'ok' ? 'var(--success)' : 'var(--danger)' }}>{apiHealth?.status || 'checking...'}</span></div>
          <div className="props-row"><span className="props-row-label">API Version</span><span className="props-row-value">{apiHealth?.version || '—'}</span></div>
          <div className="props-row"><span className="props-row-label">Copernicus</span><span className="props-row-value" style={{ color: satHealth?.status === 'ok' ? 'var(--success)' : 'var(--warning)' }}>{satHealth?.status === 'ok' ? 'Authenticated' : (satHealth?.copernicus || satHealth?.status || 'checking...')}</span></div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-header"><div className="card-title">Data Sources</div></div>
        <div className="card-body" style={{ fontSize: 13 }}>
          <div className="props-row"><span className="props-row-label">Satellite</span><span className="props-row-value">Copernicus Sentinel-2 L2A (CDSE)</span></div>
          <div className="props-row"><span className="props-row-label">Catalog</span><span className="props-row-value">STAC + OData</span></div>
          <div className="props-row"><span className="props-row-label">Weather</span><span className="props-row-value">Open-Meteo</span></div>
          <div className="props-row"><span className="props-row-label">Soil</span><span className="props-row-value">ISRIC SoilGrids</span></div>
          <div className="props-row"><span className="props-row-label">Database</span><span className="props-row-value">Supabase</span></div>
          <div className="props-row"><span className="props-row-label">Frontend</span><span className="props-row-value">TerraLogy v1.0.0</span></div>
        </div>
      </div>
    </div>
  )
}
