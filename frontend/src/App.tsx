import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DesktopLayout from '@/components/DesktopLayout'
import DashboardPage from '@/pages/DashboardPage'
import AIAnalysisPage from '@/pages/AIAnalysisPage'
import ErrorBoundary from '@/components/ErrorBoundary'

function SimplePage({ title, description }: { title: string; description: string }) {
  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">{title}</div>
          <div className="dashboard-subtitle">{description}</div>
        </div>
      </div>
      <div className="empty" style={{ padding: 60, border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
        <div className="empty-icon"></div>
        <div className="empty-text">This module is under development</div>
        <button className="btn btn-primary">Back to Dashboard</button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<DesktopLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="ai-analysis" element={<AIAnalysisPage />} />
            <Route path="projects" element={<SimplePage title="Projects" description="Manage your geospatial projects" />} />
            <Route path="map" element={<SimplePage title="Map Workspace" description="Interactive satellite map viewer" />} />
            <Route path="satellite" element={<SimplePage title="Satellite Data" description="Import and manage satellite imagery" />} />
            <Route path="layers" element={<SimplePage title="Layer Manager" description="Organize and configure map layers" />} />
            <Route path="aoi" element={<SimplePage title="AOI Manager" description="Manage Areas of Interest" />} />
            <Route path="time-series" element={<SimplePage title="Time Series" description="Temporal analysis and change detection" />} />
            <Route path="reports" element={<SimplePage title="Reports" description="Generate and export analysis reports" />} />
            <Route path="exports" element={<SimplePage title="Exports" description="Download processed data and results" />} />
            <Route path="settings" element={<SimplePage title="Settings" description="Application configuration" />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
