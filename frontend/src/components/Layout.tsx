import { Link, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '◉' },
  { path: '/farms', label: 'Farms', icon: '⊞' },
  { path: '/alerts', label: 'Alerts', icon: '⚡' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Layout() {
  const location = useLocation()
  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <div className="logo-icon">T</div>
            <div>
              <div className="logo-text">Terralogy</div>
              <div className="logo-sub">Precision Ag Intelligence</div>
            </div>
          </Link>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">Monitoring</div>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.path === '/alerts' && <span className="nav-badge">3</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footer-card">
            <div className="sidebar-footer-title">🌾 Farm Intelligence</div>
            <div className="sidebar-footer-text">Satellite-powered crop monitoring with AI-driven insights for Indian farmers.</div>
          </div>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <div>
              <div className="topbar-title">{navItems.find(n => isActive(n.path))?.label || 'Terralogy'}</div>
              <div className="topbar-subtitle">Enterprise Precision Agriculture Platform</div>
            </div>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
