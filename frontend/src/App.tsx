import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Farms from '@/pages/Farms'
import FarmDetail from '@/pages/FarmDetail'
import FieldDetail from '@/pages/FieldDetail'
import Alerts from '@/pages/Alerts'
import Settings from '@/pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="farms" element={<Farms />} />
          <Route path="farms/:id" element={<FarmDetail />} />
          <Route path="fields/:id" element={<FieldDetail />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
