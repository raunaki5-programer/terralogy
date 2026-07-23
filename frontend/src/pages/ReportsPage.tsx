import { useEffect, useState } from 'react'
import { API } from '@/lib/api'
import type { Farm } from '@/types'

export default function ReportsPage() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [farmId, setFarmId] = useState('')
  const [reportType, setReportType] = useState('summary')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API}/api/farms`).then(r => r.json()).then(d => {
      const list = d.farms || []
      setFarms(list)
      if (list[0]) setFarmId(list[0].id)
    }).catch(() => {})
  }, [])

  const generate = async () => {
    if (!farmId) { setError('Select a farm'); return }
    setLoading(true)
    setError('')
    setReport(null)
    try {
      const r = await fetch(`${API}/api/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farm_id: farmId, report_type: reportType }),
      })
      if (!r.ok) throw new Error(await r.text())
      const data = await r.json()
      setReport(data)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  const downloadJson = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `terralogy-report-${report.report_id || 'export'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Reports</div>
          <div className="dashboard-subtitle">Generate farm intelligence reports from live data</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Farm</label>
              <select className="form-input" value={farmId} onChange={e => setFarmId(e.target.value)}>
                {farms.length === 0 && <option value="">No farms — create one first</option>}
                {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Type</label>
              <select className="form-input" value={reportType} onChange={e => setReportType(e.target.value)}>
                <option value="summary">Summary</option>
                <option value="vegetation">Vegetation</option>
                <option value="soil">Soil</option>
                <option value="full">Full</option>
              </select>
            </div>
            <button type="button" className="btn btn-primary" onClick={generate} disabled={loading || !farmId}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>{error}</div>}
        </div>
      </div>

      {report && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Report {report.report_id}</div>
              <div className="card-subtitle">{report.summary} · {report.type}</div>
            </div>
            <button type="button" className="btn btn-sm btn-primary" onClick={downloadJson}>Download JSON</button>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 12 }}>
              <strong>Farm:</strong> {report.farm?.name || report.farm?.id}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Fields:</strong> {(report.fields || []).length}
            </div>
            <pre style={{ fontSize: 11, background: 'var(--bg-primary)', padding: 12, borderRadius: 6, overflow: 'auto', maxHeight: 400 }}>
              {JSON.stringify(report, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
