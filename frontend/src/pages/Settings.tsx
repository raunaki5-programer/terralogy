export default function Settings() {
  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Settings</h2>
      <div className="card mb-4">
        <div className="card-header"><span className="card-title">API Configuration</span></div>
        <div className="text-muted mb-4">Terralogy uses multiple satellite and weather APIs for real-time farm intelligence.</div>
        <div className="grid-2">
          <div className="metric-card">
            <div className="metric-label">Copernicus</div>
            <div className="metric-value good">Connected</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Open-Meteo</div>
            <div className="metric-value good">Free Tier</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">SoilGrids</div>
            <div className="metric-value good">Connected</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">AI Agent</div>
            <div className="metric-value good">OpenCode</div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Preferences</span></div>
        <div className="flex justify-between items-center" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="font-medium">Theme</div>
            <div className="text-muted text-sm">Dark mode enabled</div>
          </div>
          <span className="badge badge-neutral">Dark</span>
        </div>
        <div className="flex justify-between items-center" style={{ padding: '12px 0' }}>
          <div>
            <div className="font-medium">Notifications</div>
            <div className="text-muted text-sm">Alert notifications</div>
          </div>
          <span className="badge badge-neutral">Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
