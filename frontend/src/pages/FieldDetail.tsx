import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store'

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fields, analysis, fetchAnalysis, selectField } = useAppStore()
  const [loading, setLoading] = useState(false)

  const field = fields.find(f => f.id === id)

  useEffect(() => { if (id) selectField(field || null) }, [id])

  const analyze = async () => {
    if (!id) return
    setLoading(true)
    await fetchAnalysis(id)
    setLoading(false)
  }

  if (!field) return <div className="empty-state"><h3>Field not found</h3></div>

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-3" onClick={() => navigate(-1)}>← Back</button>
      <h2 style={{ fontSize: 22, fontWeight: 600 }}>{field.name}</h2>
      <div className="text-muted mb-4">Area: {field.area_ha} ha | {field.crop?.crop_type || 'No crop'}</div>

      <div className="card mb-3">
        <div className="card-header"><span className="card-title">Field Analysis</span></div>
        {!analysis ? (
          <div className="text-center py-4">
            <p className="text-muted mb-3">Run analysis to get satellite indices, soil health, and weather data.</p>
            <button className="btn btn-primary" onClick={analyze} disabled={loading}>{loading ? 'Analyzing...' : 'Run Analysis'}</button>
          </div>
        ) : (
          <div>
            <div className="grid-3 mb-3">
              <div className="stat-card"><div className="stat-value">{analysis.vegetation.ndvi ?? '-'}</div><div className="stat-label">NDVI</div></div>
              <div className="stat-card"><div className="stat-value">{analysis.soil.moisture ?? '-'}%</div><div className="stat-label">Soil Moisture</div></div>
              <div className="stat-card"><div className="stat-value" style={{ color: analysis.health.status === 'good' ? '#00d4aa' : '#ef4444' }}>{analysis.health.label}</div><div className="stat-label">Health</div></div>
            </div>
            {analysis.soil.ph && <div className="grid-2"><div className="text-muted">pH: {analysis.soil.ph}</div><div className="text-muted">Carbon: {analysis.soil.organic_carbon}%</div></div>}
            {analysis.alerts.length > 0 && (
              <div className="mt-3">
                <h4 style={{ fontWeight: 600, marginBottom: 8 }}>Alerts</h4>
                {analysis.alerts.map((a, i) => <div key={i} className="alert-item unread"><div className="alert-dot" style={{ background: 'var(--danger)' }} /><div className="alert-message">{a.message}</div></div>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
