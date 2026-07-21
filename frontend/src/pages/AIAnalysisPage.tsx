import { useState } from 'react'

interface AnalysisCard {
  id: string
  name: string
  description: string
  icon: string
  color: string
  status: 'ready' | 'running' | 'completed'
}

export default function AIAnalysisPage() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null)
  const [runningAnalyses, setRunningAnalyses] = useState<Set<string>>(new Set())

  const analyses: AnalysisCard[] = [
    { id: 'lulc', name: 'Land Use Land Cover', description: 'Classify land cover types using deep learning', icon: '🗺', color: '#3b82f6', status: 'ready' },
    { id: 'ndvi', name: 'NDVI Analysis', description: 'Vegetation health and density assessment', icon: '🌿', color: '#10b981', status: 'completed' },
    { id: 'ndwi', name: 'NDWI (Water Index)', description: 'Water body detection and mapping', icon: '💧', color: '#06b6d4', status: 'ready' },
    { id: 'change', name: 'Change Detection', description: 'Multi-temporal land cover change analysis', icon: '🔄', color: '#f59e0b', status: 'completed' },
    { id: 'soil', name: 'Bare Soil Detection', description: 'Identify exposed soil and erosion areas', icon: '🏜', color: '#8b5a3c', status: 'ready' },
    { id: 'crop', name: 'Crop Health', description: 'Agricultural crop monitoring and assessment', icon: '🌾', color: '#22c55e', status: 'ready' },
    { id: 'forest', name: 'Forest Monitoring', description: 'Forest cover and deforestation tracking', icon: '🌲', color: '#166534', status: 'ready' },
    { id: 'urban', name: 'Urban Expansion', description: 'Urban growth and sprawl analysis', icon: '🏙', color: '#6366f1', status: 'ready' },
    { id: 'flood', name: 'Flood Detection', description: 'Flood extent mapping and damage assessment', icon: '🌊', color: '#0ea5e9', status: 'ready' },
    { id: 'water', name: 'Water Extraction', description: 'Precise water body boundary extraction', icon: '💦', color: '#0284c7', status: 'ready' },
    { id: 'object', name: 'Object Detection', description: 'Detect and classify objects in imagery', icon: '🎯', color: '#ec4899', status: 'ready' },
    { id: 'building', name: 'Building Detection', description: 'Extract building footprints from imagery', icon: '🏠', color: '#8b5cf6', status: 'ready' },
    { id: 'road', name: 'Road Extraction', description: 'Road network mapping and classification', icon: '🛣', color: '#64748b', status: 'ready' },
  ]

  const handleRunAnalysis = (id: string) => {
    setRunningAnalyses(prev => new Set(prev).add(id))
    setTimeout(() => {
      setRunningAnalyses(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 3000)
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">AI Analysis</div>
          <div className="dashboard-subtitle">Run machine learning models on your satellite imagery</div>
        </div>
        <div className="flex gap-2">
          <button className="btn">⚙ Model Settings</button>
          <button className="btn btn-primary"> Run Batch</button>
        </div>
      </div>

      <div className="ai-cards">
        {analyses.map(analysis => (
          <div
            key={analysis.id}
            className={`ai-card ${selectedAnalysis === analysis.id ? 'selected' : ''}`}
            onClick={() => setSelectedAnalysis(analysis.id)}
            style={{
              borderLeft: `3px solid ${analysis.color}`,
              background: selectedAnalysis === analysis.id ? 'var(--bg-tertiary)' : undefined,
            }}
          >
            <div className="ai-card-icon" style={{ background: `${analysis.color}20`, color: analysis.color }}>
              {analysis.icon}
            </div>
            <div className="ai-card-title">{analysis.name}</div>
            <div className="ai-card-desc">{analysis.description}</div>
            <div className="ai-card-actions">
              <button
                className="btn btn-sm btn-primary"
                onClick={(e) => { e.stopPropagation(); handleRunAnalysis(analysis.id); }}
                disabled={runningAnalyses.has(analysis.id)}
              >
                {runningAnalyses.has(analysis.id) ? '⏳ Running...' : analysis.status === 'completed' ? '✓ Run Again' : '▶ Run'}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={(e) => e.stopPropagation()}>
                ⚙
              </button>
            </div>
            {analysis.status === 'completed' && (
              <div style={{ marginTop: 8, fontSize: 10, color: 'var(--success)' }}>✓ Completed</div>
            )}
          </div>
        ))}
      </div>

      {selectedAnalysis && (
        <div className="chart-container">
          <div className="chart-header">Analysis Results: {analyses.find(a => a.id === selectedAnalysis)?.name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 16 }}>
            <div className="metric-card" style={{ textAlign: 'left', padding: 16 }}>
              <div className="metric-label">Overall Accuracy</div>
              <div className="metric-value" style={{ fontSize: 24, color: 'var(--success)' }}>92.34%</div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div className="progress-fill" style={{ width: '92.34%' }}/>
              </div>
            </div>
            <div className="metric-card" style={{ textAlign: 'left', padding: 16 }}>
              <div className="metric-label">Kappa Coefficient</div>
              <div className="metric-value" style={{ fontSize: 24 }}>0.89</div>
            </div>
            <div className="metric-card" style={{ textAlign: 'left', padding: 16 }}>
              <div className="metric-label">Processing Time</div>
              <div className="metric-value" style={{ fontSize: 24 }}>3m 17s</div>
            </div>
            <div className="metric-card" style={{ textAlign: 'left', padding: 16 }}>
              <div className="metric-label">Resolution</div>
              <div className="metric-value" style={{ fontSize: 24 }}>10m</div>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="chart-header">Classification Results</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 16, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-tertiary)' }}>
                Classification Map Preview
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>Class Distribution</div>
                {[
                  { name: 'Water', pct: 12.43, color: '#3b82f6' },
                  { name: 'Forest', pct: 38.21, color: '#10b981' },
                  { name: 'Agriculture', pct: 32.14, color: '#f59e0b' },
                  { name: 'Built-up', pct: 8.67, color: '#ef4444' },
                  { name: 'Bare Soil', pct: 8.55, color: '#8b5a3c' },
                ].map(item => (
                  <div key={item.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${item.pct * 2}%`, background: item.color }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost">Export Results</button>
            <button className="btn btn-primary">📊 Generate Report</button>
          </div>
        </div>
      )}
    </div>
  )
}
