export default function Settings() {
  return (
    <div style={{ maxWidth: 680 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Settings</h2>
      <div className="card mb-4">
        <div className="card-header">
          <div>
            <div className="card-title">API Integrations</div>
            <div className="card-subtitle">External data sources powering Terralogy</div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid-2">
            <div className="metric-card">
              <div className="metric-icon">🛰</div>
              <div className="metric-label">Copernicus</div>
              <div className="metric-value good">Connected</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🌦</div>
              <div className="metric-label">Open-Meteo</div>
              <div className="metric-value good">Free Tier</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🌍</div>
              <div className="metric-label">SoilGrids</div>
              <div className="metric-value good">Connected</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🤖</div>
              <div className="metric-label">AI Agent</div>
              <div className="metric-value good">OpenCode</div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Preferences</div>
            <div className="card-subtitle">Application settings and customization</div>
          </div>
        </div>
        <div className="card-body">
          <div className="flex justify-between items-center" style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-muted text-sm">Dark mode with emerald accent</div>
            </div>
            <span className="badge badge-neutral">Dark</span>
          </div>
          <div className="flex justify-between items-center" style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div className="font-medium">Notifications</div>
              <div className="text-muted text-sm">Alert notifications for critical events</div>
            </div>
            <span className="badge badge-neutral">Coming Soon</span>
          </div>
          <div className="flex justify-between items-center" style={{ padding: '14px 0' }}>
            <div>
              <div className="font-medium">Language</div>
              <div className="text-muted text-sm">Interface language</div>
            </div>
            <span className="badge badge-neutral">English</span>
          </div>
        </div>
      </div>
    </div>
  )
}
