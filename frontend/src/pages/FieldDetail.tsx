import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fields, fetchAnalysis } = useAppStore()
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState<any>(null)

  const field = fields.find(f => f.id === id)

  useEffect(() => {
    if (!field || !id) return
    setLoading(true)
    Promise.all([
      fetch(`${API}/api/analysis/field/${id}`).then(r => r.ok ? r.json() : fetch(`${API}/api/analysis/field/${id}`, { method: 'POST' }).then(r => r.json())),
      fetch(`${API}/api/weather?lat=${field.center.lat}&lon=${field.center.lng}`).then(r => r.json()).catch(() => null),
    ]).then(([a, w]) => { setAnalysis(a); setWeather(w) }).finally(() => setLoading(false))
  }, [id])

  if (!field) return <div className="empty-state"><h3>Field not found</h3></div>
  if (loading) return <div className="empty-state"><div className="loading-spinner" /></div>

  const a = analysis
  const w = weather?.current
  const bar = (v: number | null | undefined, max: number, color: string) => (
    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, ((v || 0) / max) * 100)}%`, height: '100%', background: color, borderRadius: 3 }} />
    </div>
  )

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-3" onClick={() => navigate(-1)}>← Back</button>
      <h2 style={{ fontSize: 22, fontWeight: 600 }}>{field.name}</h2>
      <p className="text-muted mb-4">{field.area_ha} ha · {field.crop?.crop_type || 'No crop'}</p>

      {a && (
        <>
          {/* Health Score Card */}
          <div className="card mb-3" style={{ borderLeft: `4px solid ${a.health?.status === 'good' ? '#00d4aa' : a.health?.status === 'warning' ? '#f59e0b' : '#ef4444'}` }}>
            <div className="grid-4">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: a.health?.score >= 75 ? '#00d4aa' : a.health?.score >= 50 ? '#f59e0b' : '#ef4444' }}>{a.health?.score || 0}</div>
                <div className="stat-label">Health Score</div>
                <div>{bar(a.health?.score, 100, a.health?.score >= 75 ? '#00d4aa' : '#f59e0b')}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#3b82f6' }}>{a.soil_score?.score || 0}</div>
                <div className="stat-label">Soil Quality</div>
                <div>{bar(a.soil_score?.score, 100, '#3b82f6')}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#f59e0b' }}>{a.yield_potential?.estimated_tons_ha || '—'}<span style={{ fontSize: 16 }}> t/ha</span></div>
                <div className="stat-label">Yield Potential</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{a.yield_potential?.rating}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: a.disease_risk?.risk_level === 'High' ? '#ef4444' : '#f59e0b' }}>{a.disease_risk?.risk_score || 0}<span style={{ fontSize: 16 }}>%</span></div>
                <div className="stat-label">Disease Risk</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{a.disease_risk?.risk_level}</div>
              </div>
            </div>
          </div>

          {/* Vegetation + Weather + Soil */}
          <div className="grid-3 mb-3">
            <div className="card">
              <div className="card-header"><span>🌿 Vegetation</span></div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div><div className="stat-label">NDVI</div><div style={{ fontWeight: 600 }}>{a.vegetation?.ndvi ?? '—'}</div></div>
                <div><div className="stat-label">NDMI</div><div style={{ fontWeight: 600 }}>{a.vegetation?.ndmi ?? '—'}</div></div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span>☀️ Weather</span></div>
              {w ? <div className="grid-2" style={{ gap: 8 }}>
                <div><div className="stat-label">Temp</div><div style={{ fontWeight: 600 }}>{w.temperature_2m}°C</div></div>
                <div><div className="stat-label">Humidity</div><div style={{ fontWeight: 600 }}>{w.relative_humidity_2m}%</div></div>
                <div><div className="stat-label">Wind</div><div style={{ fontWeight: 600 }}>{w.wind_speed_10m} km/h</div></div>
                <div><div className="stat-label">Precip</div><div style={{ fontWeight: 600 }}>{w.precipitation || 0} mm</div></div>
              </div> : <div className="text-muted">Loading...</div>}
            </div>
            <div className="card">
              <div className="card-header"><span>🧪 Soil</span></div>
              <div className="grid-2" style={{ gap: 8 }}>
                <div><div className="stat-label">pH</div><div style={{ fontWeight: 600 }}>{a.soil?.ph ?? '—'}</div></div>
                <div><div className="stat-label">Carbon</div><div style={{ fontWeight: 600 }}>{a.soil?.organic_carbon ?? '—'}%</div></div>
                <div><div className="stat-label">Moisture</div><div style={{ fontWeight: 600 }}>{a.soil?.moisture ?? '—'}%</div></div>
                <div><div className="stat-label">Nitrogen</div><div style={{ fontWeight: 600 }}>{a.soil?.nitrogen ?? '—'}%</div></div>
              </div>
            </div>
          </div>

          {/* Disease + Irrigation cards */}
          <div className="grid-2 mb-3">
            {a.disease_risk?.potential_diseases?.length > 0 && (
              <div className="card">
                <div className="card-header"><span>🦠 Disease Risk</span></div>
                {a.disease_risk.potential_diseases.map((d: any, i: number) => (
                  <div key={i} className="alert-item unread" style={{ borderBottom: '1px solid var(--border)', borderRadius: 0 }}>
                    <div className="alert-dot" style={{ background: d.probability === 'High' ? 'var(--danger)' : 'var(--warning)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{d.disease} · {d.probability}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>{d.remedy}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {a.irrigation && (
              <div className="card">
                <div className="card-header"><span>💧 Irrigation</span></div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#3b82f6' }}>{a.irrigation.need_mm}mm</div>
                <div className={`badge ${a.irrigation.urgency === 'High' ? 'badge-critical' : 'badge-warning'}`} style={{ marginTop: 4 }}>{a.irrigation.urgency}</div>
                <div className="text-muted mt-2" style={{ fontSize: 13 }}>{a.irrigation.message}</div>
              </div>
            )}
          </div>

          {/* Alerts */}
          {a.health?.alerts?.length > 0 && (
            <div className="card mb-3">
              <div className="card-header"><span>⚠️ Alerts</span></div>
              {a.health.alerts.map((al: any, i: number) => (
                <div key={i} className="alert-item unread" style={{ borderBottom: i < a.health.alerts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div className="alert-dot" style={{ background: al.severity === 'critical' ? 'var(--danger)' : 'var(--warning)' }} />
                  <div className="alert-message">{al.message}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
