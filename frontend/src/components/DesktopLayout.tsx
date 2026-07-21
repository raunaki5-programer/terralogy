import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import ProjectExplorer from './ProjectExplorer'
import PropertiesPanel from './PropertiesPanel'
import BottomPanel from './BottomPanel'
import StatusBar from './StatusBar'
import WorkspaceMap from './WorkspaceMap'
import type { Farm, Field } from '@/types'

interface Layer {
  id: string
  name: string
  type: 'basemap' | 'satellite' | 'vector' | 'analysis'
  visible: boolean
  locked: boolean
  opacity: number
  color?: string
}

interface ConsoleMessage {
  timestamp: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}

const API = 'https://terralogy-api-v2.onrender.com'

export default function DesktopLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [farms, setFarms] = useState<Farm[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null)
  const [activeTool, setActiveTool] = useState('select')
  const [mousePos, setMousePos] = useState<{ lat: number; lng: number } | undefined>(undefined)
  const [zoom, setZoom] = useState(4.5)
  const [center, setCenter] = useState<[number, number]>([78.9629, 20.5937])

  const [messages, setMessages] = useState<ConsoleMessage[]>([
    { timestamp: '10:24:15', type: 'info', message: 'Project loaded successfully' },
    { timestamp: '10:24:16', type: 'info', message: 'Sentinel-2 L2A image loaded (2024-05-20)' },
    { timestamp: '10:24:18', type: 'success', message: 'NDVI layer generated successfully' },
  ])

  useEffect(() => {
    fetch(`${API}/api/farms`).then(r => r.json()).then(d => setFarms(d.farms || [])).catch(() => {})
    fetch(`${API}/api/fields`).then(r => r.json()).then(d => setFields(d.fields || [])).catch(() => {})
  }, [])

  const folders = [
    { name: 'Layers', layers: [
      { id: '1', name: 'Basemap', type: 'basemap' as const, visible: true, locked: false, opacity: 100, color: '#3b82f6' },
      { id: '2', name: 'Sentinel-2 L2A', type: 'satellite' as const, visible: true, locked: false, opacity: 100 },
      { id: '3', name: 'NDVI Layer', type: 'analysis' as const, visible: true, locked: false, opacity: 80, color: '#10b981' },
      { id: '4', name: 'LULC Classification', type: 'analysis' as const, visible: true, locked: false, opacity: 70, color: '#f59e0b' },
    ]},
    { name: 'Vector Layers', layers: [
      { id: '5', name: 'Water Bodies', type: 'vector' as const, visible: false, locked: false, opacity: 100, color: '#06b6d4' },
      { id: '6', name: 'Road Network', type: 'vector' as const, visible: false, locked: false, opacity: 100 },
    ]},
    { name: 'AOI (2)', layers: [
      { id: '7', name: 'Study Area', type: 'vector' as const, visible: true, locked: true, opacity: 100, color: '#8b5cf6' },
      { id: '8', name: 'Farm Zone', type: 'vector' as const, visible: true, locked: false, opacity: 100, color: '#10b981' },
    ]},
    { name: 'AI Results', layers: [
      { id: '9', name: 'LULC Result (May 2024)', type: 'analysis' as const, visible: true, locked: false, opacity: 100 },
      { id: '10', name: 'Change Detection', type: 'analysis' as const, visible: true, locked: false, opacity: 100 },
    ]},
    { name: 'Reports', layers: [] },
    { name: 'Exports', layers: [] },
  ]

  const handleMapClick = (lat: number, lng: number) => {
    setMousePos({ lat, lng })
  }

  const isMapPage = location.pathname === '/map' || location.pathname === '/'

  return (
    <div className="desktop-app">
      {/* Menu Bar */}
      <div className="menu-bar">
        <div className="menu-logo">
          <div className="menu-logo-icon">T</div>
          <span>TerraLogy</span>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 8 }}>v1.0.0</span>
        </div>
        {['File', 'Edit', 'View', 'Layers', 'Analysis', 'AI Tools', 'Window', 'Help'].map(item => (
          <div key={item} className="menu-item">{item}</div>
        ))}
        <div className="menu-right">
          <input className="menu-search" placeholder="Search Location..." />
          <button className="menu-icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </button>
          <button className="menu-icon-btn">
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 600 }}>RG</div>
          </button>
          <div className="window-controls">
            <div className="window-btn">—</div>
            <div className="window-btn">□</div>
            <div className="window-btn close">✕</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span className="tooltip">New Project</span></button>
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg><span className="tooltip">Open</span></button>
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg><span className="tooltip">Save</span></button>
        </div>
        <div className="toolbar-group">
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg><span className="tooltip">Undo</span></button>
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg><span className="tooltip">Redo</span></button>
        </div>
        <div className="toolbar-group">
          <button className={`toolbar-btn ${activeTool === 'select' ? 'active' : ''}`} onClick={() => setActiveTool('select')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg><span className="tooltip">Select</span></button>
          <button className={`toolbar-btn ${activeTool === 'pan' ? 'active' : ''}`} onClick={() => setActiveTool('pan')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 11V6a2 2 0 00-4 0v1M14 10V4a2 2 0 00-4 0v6M10 10V6a2 2 0 00-4 0v8l-2.3-2.3a2 2 0 00-2.83 2.83l5.66 5.66a2 2 0 002.83-2.83L7 15"/></svg><span className="tooltip">Pan</span></button>
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg><span className="tooltip">Zoom In</span></button>
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg><span className="tooltip">Zoom Out</span></button>
        </div>
        <div className="toolbar-group">
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><span className="tooltip">Measure</span></button>
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg><span className="tooltip">Draw Polygon</span></button>
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg><span className="tooltip">Draw Line</span></button>
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg><span className="tooltip">Draw Point</span></button>
        </div>
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={() => navigate('/ai-analysis')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 6v6l4 2"/></svg><span className="tooltip">AI Analysis</span></button>
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span className="tooltip">Import Data</span></button>
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span className="tooltip">Export</span></button>
        </div>
        <div className="toolbar-group">
          <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg><span className="tooltip">Layout</span></button>
          <button className="toolbar-btn" onClick={() => navigate('/settings')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg><span className="tooltip">Settings</span></button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="workspace">
        {/* Left Sidebar Navigation */}
        <div className="sidebar-nav">
          <button className={`nav-item ${location.pathname === '/' || location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
            <span className="nav-tooltip">Dashboard</span>
          </button>
          <button className={`nav-item ${location.pathname === '/projects' ? 'active' : ''}`} onClick={() => navigate('/projects')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
            <span className="nav-tooltip">Projects</span>
          </button>
          <button className={`nav-item ${location.pathname === '/map' ? 'active' : ''}`} onClick={() => navigate('/map')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            <span className="nav-tooltip">Map</span>
          </button>
          <button className={`nav-item ${location.pathname === '/satellite' ? 'active' : ''}`} onClick={() => navigate('/satellite')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <span className="nav-tooltip">Satellite Data</span>
          </button>
          <button className={`nav-item ${location.pathname === '/layers' ? 'active' : ''}`} onClick={() => navigate('/layers')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            <span className="nav-tooltip">Layers</span>
          </button>
          <button className={`nav-item ${location.pathname === '/aoi' ? 'active' : ''}`} onClick={() => navigate('/aoi')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="nav-tooltip">AOI Manager</span>
          </button>
          <button className={`nav-item ${location.pathname === '/ai-analysis' ? 'active' : ''}`} onClick={() => navigate('/ai-analysis')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 6v6l4 2"/></svg>
            <span className="nav-tooltip">AI Analysis</span>
          </button>
          <button className={`nav-item ${location.pathname === '/time-series' ? 'active' : ''}`} onClick={() => navigate('/time-series')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span className="nav-tooltip">Time Series</span>
          </button>
          <button className={`nav-item ${location.pathname === '/reports' ? 'active' : ''}`} onClick={() => navigate('/reports')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span className="nav-tooltip">Reports</span>
          </button>
          <button className={`nav-item ${location.pathname === '/exports' ? 'active' : ''}`} onClick={() => navigate('/exports')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span className="nav-tooltip">Exports</span>
          </button>
          <button className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`} onClick={() => navigate('/settings')} style={{ marginTop: 'auto' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            <span className="nav-tooltip">Settings</span>
          </button>
        </div>

        {/* Project Explorer */}
        <ProjectExplorer
          projectName="My Project 01"
          folders={folders}
          selectedLayer={selectedLayer}
          onSelectLayer={(layer: Layer) => setSelectedLayer(layer)}
        />

        {/* Map Workspace or Page Content */}
        {isMapPage ? (
          <WorkspaceMap
            farms={farms}
            fields={fields}
            selectedLayer={selectedLayer}
            onSelectLayer={setSelectedLayer}
            onMapClick={handleMapClick}
            onToolChange={setActiveTool}
            activeTool={activeTool}
          />
        ) : (
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Outlet />
          </div>
        )}

        {/* Properties Panel */}
        <PropertiesPanel selectedLayer={selectedLayer} />
      </div>

      {/* Bottom Panel */}
      <BottomPanel messages={messages} height={200} />

      {/* Status Bar */}
      <StatusBar zoom={zoom} center={center} mousePos={mousePos} />
    </div>
  )
}
