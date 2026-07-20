export default function Settings() {
  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Settings</h2>
      <div className="card mb-3">
        <div className="card-header"><span className="card-title">API Configuration</span></div>
        <p className="text-muted" style={{ marginBottom: 12 }}>Terralogy uses satellite, weather, soil, and AI APIs to power its intelligence.</p>
        <div className="grid-2">
          <div className="stat-card"><div className="stat-label">Copernicus</div><div className="stat-value" style={{ fontSize: 14, color: '#00d4aa' }}>Connected</div></div>
          <div className="stat-card"><div className="stat-label">Open-Meteo</div><div className="stat-value" style={{ fontSize: 14, color: '#00d4aa' }}>Free Tier</div></div>
          <div className="stat-card"><div className="stat-label">SoilGrids</div><div className="stat-value" style={{ fontSize: 14, color: '#00d4aa' }}>Connected</div></div>
          <div className="stat-card"><div className="stat-label">AI Agent</div><div className="stat-value" style={{ fontSize: 14, color: '#00d4aa' }}>OpenCode Go</div></div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Preferences</span></div>
        <div className="flex items-center justify-between py-2"><div><div>Theme</div><div className="text-muted" style={{ fontSize: 12 }}>Dark mode</div></div><span className="badge badge-neutral">Dark</span></div>
        <div className="flex items-center justify-between py-2"><div><div>Notifications</div><div className="text-muted" style={{ fontSize: 12 }}>Alert notifications</div></div><span className="badge badge-neutral">Coming soon</span></div>
      </div>
    </div>
  )
}
