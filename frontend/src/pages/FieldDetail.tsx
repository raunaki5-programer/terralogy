import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store'

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fields, analysis, fetchAnalysis } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState<any>(null)

  const field = fields.find(f => f.id === id)

  useEffect(() => {
    if (field) {
      setLoading(true)
      Promise.all([
        fetchAnalysis(field.id),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/weather?lat=${field.center.lat}&lon=${field.center.lng}`).then(r => r.json()).catch(() => null),
      ]).finally(() => setLoading(false))
    }
  }, [id])

  if (!field) return <div className="empty-state"><h3>Field not found</h3></div>
  if (loading) return <div className="empty-state"><div className="loading-spinner" /></div>

  const a = analysis
  const w = weather?.current

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-3" onClick={() => navigate(-1)}>← Back</button>
      <h2 style={{ fontSize: 22, fontWeight: 600 }}>{field.name}</h2>
      <p className="text-muted mb-4">{field.area_ha} ha | {field.crop?.crop_type || 'No crop planted'}</p>

      {/* Health score */}
      {a && (
        <div className="card mb-3" style={{ borderLeft: `4px solid ${a.health?.status === 'good' ? '#00d4aa' : a.health?.status === 'warning' ? '#f59e0b' : '#ef4444'}` }}>
          <div className="flex items-center justify-between">
            <div><div className="card-title">Field Health</div><div style={{ fontSize: 28, fontWeight: 700, color: a.health?.status === 'good' ? '#00d4aa' : '#f59e0b' }}>{a.health?.label || 'Unknown'}</div></div>
            <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-secondary)' }}>
              <div>NDVI: {a.vegetation?.ndvi ?? '—'}</div>
              <div>NDMI: {a.vegetation?.ndmi ?? '—'}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2 mb-3">
        {/* Weather */}
        <div className="card">
          <div className="card-header"><span className="card-title">☀️ Weather</span></div>
          {w ? (
            <div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{w.temperature_2m}°C</div>
              <div className="grid-2 mt-2" style={{ gap: 8 }}>
                <div className="text-muted" style={{ fontSize: 13 }}>Humidity: {w.relative_humidity_2m}%</div>
                <div className="text-muted" style={{ fontSize: 13 }}>Wind: {w.wind_speed_10m} km/h</div>
              </div>
            </div>
          ) : <div className="text-muted">Loading weather...</div>}
        </div>

        {/* Soil */}
        <div className="card">
          <div className="card-header"><span className="card-title">🧪 Soil</span></div>
          {a?.soil ? (
            <div>
              <div className="grid-3" style={{ gap: 12 }}>
                <div><div className="stat-value" style={{ fontSize: 18 }}>{a.soil.ph ?? '—'}</div><div className="stat-label">pH</div></div>
                <div><div className="stat-value" style={{ fontSize: 18 }}>{a.soil.organic_carbon ?? '—'}%</div><div className="stat-label">Carbon</div></div>
                <div><div className="stat-value" style={{ fontSize: 18 }}>{a.soil.moisture ?? '—'}%</div><div className="stat-label">Moisture</div></div>
              </div>
              <div className="grid-3 mt-2" style={{ gap: 8 }}>
                <div className="text-muted" style={{ fontSize: 13 }}>Clay: {a.soil.clay ?? '—'}%</div>
                <div className="text-muted" style={{ fontSize: 13 }}>Sand: {a.soil.sand ?? '—'}%</div>
                <div className="text-muted" style={{ fontSize: 13 }}>Silt: {a.soil.silt ?? '—'}%</div>
              </div>
            </div>
          ) : <div className="text-muted">No soil data. Run analysis first.</div>}
        </div>
      </div>

      {/* Alerts */}
      {a?.alerts && a.alerts.length > 0 && (
        <div className="card mb-3">
          <div className="card-header"><span className="card-title">Alerts ({a.alerts.length})</span></div>
          {a.alerts.map((al: any, i: number) => (
            <div key={i} className="alert-item unread">
              <div className="alert-dot" style={{ background: al.severity === 'critical' ? 'var(--danger)' : 'var(--warning)' }} />
              <div className="alert-message">{al.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Crop info */}
      {field.crop && (
        <div className="card">
          <div className="card-header"><span className="card-title">🌱 Crop</span></div>
          <div className="grid-3" style={{ gap: 12 }}>
            <div><div className="stat-label">Type</div><div style={{ fontWeight: 600 }}>{field.crop.crop_type}</div></div>
            <div><div className="stat-label">Variety</div><div style={{ fontWeight: 600 }}>{field.crop.variety || '—'}</div></div>
            <div><div className="stat-label">Planted</div><div style={{ fontWeight: 600 }}>{field.crop.planting_date || '—'}</div></div>
          </div>
        </div>
      )}
    </div>
  )
}
