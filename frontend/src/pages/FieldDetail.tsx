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
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>{field.name}</h2>
          <div className="text-muted">{field.area_ha} hectares</div>
        </div>
        <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>{analyzing ? 'Analyzing...' : 'Run Analysis'}</button>
      </div>

      {a ? (
        <>
          <div className="data-panel mb-4">
            <div className="data-header">
              <div className="data-title">Field Health</div>
              <span className={`badge badge-${a.health?.status === 'good' ? 'success' : a.health?.status === 'warning' ? 'warning' : 'critical'}`}>{a.health?.label || 'Unknown'}</span>
            </div>
            <div className="health-score">
              <div>
                <div className="health-value" style={{ color: a.health?.score >= 75 ? '#00d4a0' : a.health?.score >= 50 ? '#f59e0b' : '#ef4444' }}>{a.health?.score ?? '—'}</div>
                <div className="health-label">Score</div>
              </div>
              <div className="health-bar">
                <div className="health-fill" style={{ width: `${a.health?.score || 0}%`, background: a.health?.score >= 75 ? '#00d4a0' : a.health?.score >= 50 ? '#f59e0b' : '#ef4444' }} />
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#f59e0b' }}>{a.yield_potential?.estimated_tons_ha ?? '—'} t/ha</div>
                <div className="text-muted text-xs">{a.yield_potential?.rating || 'Yield Potential'}</div>
              </div>
            </div>

            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">NDVI</div>
                <div className={`metric-value ${a.vegetation?.ndvi >= 0.4 ? 'good' : a.vegetation?.ndvi >= 0.2 ? 'warning' : 'danger'}`}>{a.vegetation?.ndvi ?? '—'}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">NDMI</div>
                <div className="metric-value info">{a.vegetation?.ndmi ?? '—'}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Soil pH</div>
                <div className="metric-value">{a.soil?.ph ?? '—'}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Moisture</div>
                <div className="metric-value">{a.soil?.moisture ?? '—'}<span className="metric-unit">%</span></div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Disease Risk</div>
                <div className={`metric-value ${a.disease_risk?.risk_level === 'High' ? 'danger' : 'warning'}`}>{a.disease_risk?.risk_score ?? 0}<span className="metric-unit">%</span></div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Irrigation</div>
                <div className="metric-value info">{a.irrigation?.need_mm ?? 0}<span className="metric-unit">mm</span></div>
              </div>
            </div>

            {a.soil?.organic_carbon && (
              <div className="text-muted text-sm" style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
                <span className="mr-4">Carbon: {a.soil.organic_carbon}%</span>
                <span className="mr-4">Clay: {a.soil.clay}%</span>
                <span className="mr-4">Sand: {a.soil.sand}%</span>
                <span>Nitrogen: {a.soil.nitrogen}%</span>
              </div>
            )}

            {a.health?.alerts?.length > 0 && (
              <div style={{ marginTop: 16, padding: 12, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, borderLeft: '3px solid #ef4444' }}>
                <div className="font-semibold mb-2" style={{ color: '#ef4444' }}>⚠ Alerts</div>
                {a.health.alerts.map((al: any, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: '#ef4444', marginBottom: 4 }}>• {al.message}</div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h3>No analysis yet</h3>
          <p>Run satellite analysis to see NDVI, soil health, and yield predictions</p>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>{analyzing ? 'Analyzing...' : 'Run Analysis'}</button>
        </div>
      )}
    </div>
  )
}
