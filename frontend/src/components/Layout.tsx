import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store'
import ChatWidget from './ChatWidget'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '◉' },
  { path: '/farms', label: 'Farms', icon: '⊞' },
  { path: '/alerts', label: 'Alerts', icon: '⚡' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Layout() {
  const location = useLocation()
  const { sidebarOpen, toggleSidebar, unreadAlerts } = useAppStore()
  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header"><Link to="/" className="sidebar-logo">Terralogy</Link></div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span><span className="nav-label">{item.label}</span>
              {item.path === '/alerts' && unreadAlerts > 0 && <span className="nav-badge">{unreadAlerts}</span>}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <button className="btn-ghost btn-icon" onClick={toggleSidebar}>☰</button>
          <div className="topbar-title">{navItems.find(n => isActive(n.path))?.label || 'Terralogy'}</div>
        </header>
        <main className="main-content"><Outlet /></main>
      </div>
      <ChatWidget />
    </div>
  )
}
