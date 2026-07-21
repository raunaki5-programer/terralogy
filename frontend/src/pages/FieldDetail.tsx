import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Field } from '@/types'

const API = 'https://terralogy-api-v2.onrender.com'

type Tab = 'overview' | 'vegetation' | 'soil' | 'weather'

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [field, setField] = useState<Field | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`${API}/api/fields/${id}`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/analysis/field/${id}`).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([f, a]) => {
      setField(f)
      setAnalysis(a)
    }).finally(() => setLoading(false))
  }, [id])

  const handleAnalyze = async () => {
    if (!id) return
    setAnalyzing(true)
    try {
      const r = await fetch(`${API}/api/analysis/field/${id}`, { method: 'POST' })
      const data = await r.json()
      setAnalysis(data)
    } catch (e) { console.error(e) }
    setAnalyzing(false)
  }

  if (loading) return <div className="empty-state"><div className="loading-spinner" /></div>
  if (!field) return <div className="empty-state"><h3>Field not found</h3><button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button></div>

  const a = analysis

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-header">
        <div>
          <h2>{field.name}</h2>
          <div className="detail-meta">{field.area_ha} hectares</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {!a ? (
        <div className="empty-state" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 48 }}>
          <div className="empty-state-icon">🛰</div>
          <h3>No analysis yet</h3>
          <p>Run satellite analysis to see NDVI, soil health, yield predictions, and disease risk</p>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>{analyzing ? 'Analyzing...' : 'Run Analysis'}</button>
        </div>
      ) : (
        <>
          <div className="tabs">
            {(['overview', 'vegetation', 'soil', 'weather'] as Tab[]).map(t => (
              <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'overview' ? 'Overview' : t === 'vegetation' ? 'Vegetation' : t === 'soil' ? 'Soil' : 'Weather'}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="data-panel" style={{ marginTop: 0 }}>
              <div className="health-section">
                <div className="health-gauge">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={a.health?.score >= 75 ? '#22c55e' : a.health?.score >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="8" strokeDasharray={`${(a.health?.score || 0) * 2.64} 264`} strokeLinecap="round" />
                  </svg>
                  <div className="health-gauge-text" style={{ color: a.health?.score >= 75 ? '#22c55e' : a.health?.score >= 50 ? '#f59e0b' : '#ef4444' }}>{a.health?.score ?? '—'}</div>
                </div>
                <div className="health-info">
                  <div className="health-label">{a.health?.label || 'No Data'}</div>
                  <div className="health-desc">Based on NDVI, soil moisture, and temperature</div>
                </div>
                <div className="yield-info">
                  <div className="yield-value">{a.yield_potential?.estimated_tons_ha ?? '—'}<span className="yield-unit"> t/ha</span></div>
                  <div className="yield-label">{a.yield_potential?.rating || 'Yield Potential'}</div>
                </div>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">🌿</div>
                  <div className="metric-label">NDVI</div>
                  <div className={`metric-value ${a.vegetation?.ndvi >= 0.4 ? 'good' : a.vegetation?.ndvi >= 0.2 ? 'warning' : 'danger'}`}>{a.vegetation?.ndvi ?? '—'}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">💧</div>
                  <div className="metric-label">NDMI</div>
                  <div className="metric-value info">{a.vegetation?.ndmi ?? '—'}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🧪</div>
                  <div className="metric-label">Soil pH</div>
                  <div className="metric-value">{a.soil?.ph ?? '—'}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">💦</div>
                  <div className="metric-label">Moisture</div>
                  <div className="metric-value">{a.soil?.moisture ?? '—'}<span className="metric-unit">%</span></div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🦠</div>
                  <div className="metric-label">Disease Risk</div>
                  <div className={`metric-value ${a.disease_risk?.risk_level === 'High' ? 'danger' : 'warning'}`}>{a.disease_risk?.risk_score ?? 0}<span className="metric-unit">%</span></div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🚰</div>
                  <div className="metric-label">Irrigation</div>
                  <div className="metric-value info">{a.irrigation?.need_mm ?? 0}<span className="metric-unit">mm</span></div>
                </div>
              </div>

              {a.health?.alerts?.length > 0 && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--danger-dim)', borderRadius: 8, borderLeft: '3px solid var(--danger)' }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--danger)', marginBottom: 6 }}>&#9888; Field Alerts</div>
                  {a.health.alerts.map((al: any, i: number) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 3 }}>&bull; {al.message}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'vegetation' && (
            <div className="data-panel" style={{ marginTop: 0 }}>
              <div className="data-title mb-4">Vegetation Indices</div>
              <div className="grid-2">
                <div className="metric-card" style={{ textAlign: 'left', padding: 20 }}>
                  <div className="metric-label" style={{ fontSize: 11 }}>NDVI (Normalized Difference Vegetation Index)</div>
                  <div className="metric-value" style={{ fontSize: 32, marginTop: 8 }}>{a.vegetation?.ndvi ?? '—'}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-3)' }}>
                    {a.vegetation?.ndvi >= 0.4 ? 'Dense vegetation, healthy crops' : a.vegetation?.ndvi >= 0.2 ? 'Moderate vegetation cover' : 'Sparse or stressed vegetation'}
                  </div>
                </div>
                <div className="metric-card" style={{ textAlign: 'left', padding: 20 }}>
                  <div className="metric-label" style={{ fontSize: 11 }}>NDMI (Normalized Difference Moisture Index)</div>
                  <div className="metric-value" style={{ fontSize: 32, marginTop: 8 }}>{a.vegetation?.ndmi ?? '—'}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-3)' }}>
                    {a.vegetation?.ndmi >= 0.2 ? 'High moisture content' : a.vegetation?.ndmi >= 0 ? 'Moderate moisture' : 'Low moisture, possible drought stress'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'soil' && (
            <div className="data-panel" style={{ marginTop: 0 }}>
              <div className="data-title mb-4">Soil Analysis</div>
              <div className="grid-4">
                <div className="metric-card" style={{ textAlign: 'left', padding: 16 }}>
                  <div className="metric-label">pH Level</div>
                  <div className="metric-value" style={{ fontSize: 24 }}>{a.soil?.ph ?? '—'}</div>
                  <div className="text-muted text-sm mt-2">
                    {a.soil?.ph && (a.soil.ph < 6 ? 'Acidic' : a.soil.ph > 7.5 ? 'Alkaline' : 'Neutral')}
                  </div>
                </div>
                <div className="metric-card" style={{ textAlign: 'left', padding: 16 }}>
                  <div className="metric-label">Moisture</div>
                  <div className="metric-value" style={{ fontSize: 24 }}>{a.soil?.moisture ?? '—'}<span className="metric-unit">%</span></div>
                </div>
                <div className="metric-card" style={{ textAlign: 'left', padding: 16 }}>
                  <div className="metric-label">Organic Carbon</div>
                  <div className="metric-value" style={{ fontSize: 24 }}>{a.soil?.organic_carbon ?? '—'}<span className="metric-unit">%</span></div>
                </div>
                <div className="metric-card" style={{ textAlign: 'left', padding: 16 }}>
                  <div className="metric-label">Nitrogen</div>
                  <div className="metric-value" style={{ fontSize: 24 }}>{a.soil?.nitrogen ?? '—'}<span className="metric-unit">%</span></div>
                </div>
              </div>
              {a.soil?.clay && (
                <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div className="text-muted text-sm mb-3">Soil Composition</div>
                  <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
                    <span>Sand: <strong>{a.soil.sand}%</strong></span>
                    <span>Silt: <strong>{a.soil.silt}%</strong></span>
                    <span>Clay: <strong>{a.soil.clay}%</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'weather' && (
            <div className="data-panel" style={{ marginTop: 0 }}>
              <div className="data-title mb-4">Current Weather</div>
              <div className="grid-4">
                <div className="metric-card" style={{ textAlign: 'left', padding: 16 }}>
                  <div className="metric-label">Temperature</div>
                  <div className="metric-value" style={{ fontSize: 24 }}>{a.weather?.temp ?? '—'}<span className="metric-unit">°C</span></div>
                </div>
                <div className="metric-card" style={{ textAlign: 'left', padding: 16 }}>
                  <div className="metric-label">Humidity</div>
                  <div className="metric-value" style={{ fontSize: 24 }}>{a.weather?.humidity ?? '—'}<span className="metric-unit">%</span></div>
                </div>
                <div className="metric-card" style={{ textAlign: 'left', padding: 16 }}>
                  <div className="metric-label">Disease Risk</div>
                  <div className={`metric-value ${a.disease_risk?.risk_level === 'High' ? 'danger' : 'warning'}`} style={{ fontSize: 24 }}>{a.disease_risk?.risk_score ?? 0}<span className="metric-unit">%</span></div>
                </div>
                <div className="metric-card" style={{ textAlign: 'left', padding: 16 }}>
                  <div className="metric-label">Irrigation Need</div>
                  <div className="metric-value info" style={{ fontSize: 24 }}>{a.irrigation?.need_mm ?? 0}<span className="metric-unit">mm</span></div>
                </div>
              </div>
              {a.weather?.temp && (
                <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-3)' }}>
                  {a.weather.temp > 35 ? 'High temperature — consider irrigation scheduling' : a.weather.temp > 25 ? 'Warm conditions favorable for growth' : a.weather.temp > 15 ? 'Moderate temperatures' : 'Cool conditions'}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
