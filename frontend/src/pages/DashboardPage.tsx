import { useEffect, useState } from 'react'
import type { Farm } from '@/types'

const API = 'https://terralogy-api-v2.onrender.com'

export default function DashboardPage() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/farms`).then(r => r.json()).then(d => setFarms(d.farms || [])).finally(() => setLoading(false))
  }, [])

  const stats = {
    totalProjects: farms.length,
    totalArea: farms.reduce((s, f) => s + (f.field_count || 0) * 10, 0),
    activeAnalyses: 3,
    storageUsed: 128,
    storageTotal: 512,
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Dashboard</div>
          <div className="dashboard-subtitle">Overview of your geospatial projects and analyses</div>
        </div>
        <div className="flex gap-2">
          <button className="btn">📁 Open Project</button>
          <button className="btn btn-primary">+ New Project</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-icon blue">📁</div>
          <div className="stat-info">
            <div className="stat-label">Total Projects</div>
            <div className="stat-value">{stats.totalProjects}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon green">🗺</div>
          <div className="stat-info">
            <div className="stat-label">Total Area (km²)</div>
            <div className="stat-value">{stats.totalArea.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon orange">🔬</div>
          <div className="stat-info">
            <div className="stat-label">Active Analyses</div>
            <div className="stat-value">{stats.activeAnalyses}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon red">💾</div>
          <div className="stat-info">
            <div className="stat-label">Storage Used</div>
            <div className="stat-value">{stats.storageUsed} GB</div>
            <div className="progress-bar" style={{ marginTop: 4 }}>
              <div className="progress-fill" style={{ width: `${(stats.storageUsed / stats.storageTotal) * 100}%` }}/>
            </div>
          </div>
        </div>
      </div>

      <div className="section-title">
        <span>Recent Projects</span>
        <button className="btn btn-sm btn-ghost">View All</button>
      </div>

      <div className="projects-grid">
        {farms.length === 0 ? (
          <div className="empty" style={{ gridColumn: 'span 3', padding: 40 }}>
            <div className="empty-icon">📁</div>
            <div className="empty-text">No projects yet. Create your first project to get started.</div>
            <button className="btn btn-primary">+ New Project</button>
          </div>
        ) : farms.map(farm => (
          <div key={farm.id} className="project-card">
            <div className="project-card-header">
              <div className="project-icon">🗺</div>
              <div style={{ flex: 1 }}>
                <div className="project-name">{farm.name}</div>
                <div className="project-date">{new Date(farm.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="project-stats">
              <div className="project-stat">
                <span>📍</span>
                <span>{farm.field_count} fields</span>
              </div>
              <div className="project-stat">
                <span>📊</span>
                <span>2 analyses</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title">
        <span>Latest AI Models</span>
        <button className="btn btn-sm btn-ghost">View All</button>
      </div>

      <div className="projects-grid">
        {[
          { name: 'LULC Classification', desc: 'Land Use Land Cover mapping', accuracy: '92.34%' },
          { name: 'Change Detection', desc: 'Multi-temporal analysis', accuracy: '89.12%' },
          { name: 'Object Detection', desc: 'Building & infrastructure', accuracy: '94.56%' },
        ].map(model => (
          <div key={model.name} className="project-card">
            <div className="project-card-header">
              <div className="project-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>🤖</div>
              <div style={{ flex: 1 }}>
                <div className="project-name">{model.name}</div>
                <div className="project-date">{model.desc}</div>
              </div>
            </div>
            <div className="project-stats">
              <div className="project-stat">
                <span>✓</span>
                <span>Accuracy: {model.accuracy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title">
        <span>Quick Start</span>
      </div>

      <div className="projects-grid">
        {[
          { icon: '🛰', title: 'Import Satellite Data', desc: 'Load Sentinel-2, Landsat, or other imagery' },
          { icon: '', title: 'Create New Project', desc: 'Start a new geospatial analysis project' },
          { icon: '🤖', title: 'Run AI Analysis', desc: 'Process imagery with machine learning models' },
          { icon: '📊', title: 'Generate Report', desc: 'Export analysis results and statistics' },
        ].map(item => (
          <div key={item.title} className="project-card" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
            <div className="project-name" style={{ marginBottom: 6 }}>{item.title}</div>
            <div className="project-date">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
