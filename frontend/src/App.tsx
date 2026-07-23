import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DesktopLayout from '@/components/DesktopLayout'
import DashboardPage from '@/pages/DashboardPage'
import AIAnalysisPage from '@/pages/AIAnalysisPage'
import CopernicusBrowser from '@/pages/CopernicusBrowser'
import ProjectsPage from '@/pages/ProjectsPage'
import LayersPage from '@/pages/LayersPage'
import ReportsPage from '@/pages/ReportsPage'
import ExportsPage from '@/pages/ExportsPage'
import SettingsPage from '@/pages/SettingsPage'
import TimeSeriesPage from '@/pages/TimeSeriesPage'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<DesktopLayout />}>
            <Route index element={null} />
            <Route path="map" element={null} />
            <Route path="aoi" element={null} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="ai-analysis" element={<AIAnalysisPage />} />
            <Route path="satellite" element={<CopernicusBrowser />} />
            <Route path="layers" element={<LayersPage />} />
            <Route path="time-series" element={<TimeSeriesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="exports" element={<ExportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
