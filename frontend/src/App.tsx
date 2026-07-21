import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DesktopLayout from '@/components/DesktopLayout'
import DashboardPage from '@/pages/DashboardPage'
import AIAnalysisPage from '@/pages/AIAnalysisPage'
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
            <Route path="projects" element={<DashboardPage />} />
            <Route path="ai-analysis" element={<AIAnalysisPage />} />
            <Route path="satellite" element={<AIAnalysisPage />} />
            <Route path="layers" element={<DashboardPage />} />
            <Route path="time-series" element={<AIAnalysisPage />} />
            <Route path="reports" element={<DashboardPage />} />
            <Route path="exports" element={<DashboardPage />} />
            <Route path="settings" element={<DashboardPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
