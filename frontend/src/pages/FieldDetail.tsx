import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Field } from '@/types'

const API = 'https://terralogy-api-v2.onrender.com'

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [field, setField] = useState<Field | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

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
      <button className="btn btn-ghost btn-sm mb-3" onClick={() => navigate(-1)}>← Back</button>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{field.name}</h2>
          <div className="text-muted">{field.area_ha} hectares</div>
        </div>
        <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>{analyzing ? 'Analyzing...' : 'Run Analysis'}</button>
      </div>

      {a ? (
        <>
          <div className="data-panel mb-4">
            <div className="data-header">
              <div>
                <div className="data-title">Field Health Analysis</div>
                <div className="data-subtitle">Satellite + Soil + Weather intelligence</div>
              </div>
              <span className={`badge badge-${a.health?.status === 'good' ? 'success' : a.health?.status === 'warning' ? 'warning' : 'critical'}`}>{a.health?.label || 'Unknown'}</span>
            </div>

            <div className="health-section">
              <div className="health-gauge">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={a.health?.score >= 75 ? '#10b981' : a.health?.score >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="8" strokeDasharray={`${(a.health?.score || 0) * 2.64} 264`} strokeLinecap="round" />
                </svg>
                <div className="health-gauge-text" style={{ color: a.health?.score >= 75 ? '#10b981' : a.health?.score >= 50 ? '#f59e0b' : '#ef4444' }}>{a.health?.score ?? '—'}</div>
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

            {a.soil?.organic_carbon && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-2)' }}>
                <span>Carbon: <strong>{a.soil.organic_carbon}%</strong></span>
                <span>Clay: <strong>{a.soil.clay}%</strong></span>
                <span>Sand: <strong>{a.soil.sand}%</strong></span>
                <span>Nitrogen: <strong>{a.soil.nitrogen}%</strong></span>
              </div>
            )}

            {a.health?.alerts?.length > 0 && (
              <div style={{ marginTop: 16, padding: 14, background: 'rgba(239, 68, 68, 0.08)', borderRadius: 8, borderLeft: '3px solid var(--danger)' }}>
                <div className="font-semibold mb-2" style={{ color: 'var(--danger)' }}>⚠ Field Alerts</div>
                {a.health.alerts.map((al: any, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 4 }}>• {al.message}</div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🛰</div>
          <h3>No analysis yet</h3>
          <p>Run satellite analysis to see NDVI, soil health, yield predictions, and disease risk</p>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>{analyzing ? 'Analyzing...' : 'Run Analysis'}</button>
        </div>
      )}
    </div>
  )
}
