import { useState } from 'react'

export default function Settings() {
  const [notify, setNotify] = useState(true)
  const [interval, setInterval] = useState('5')

  return (
    <div>
      <div className="mb-6">
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>Settings</h2>
        <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>Platform configuration</div>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Notifications</div>
            <div className="card-subtitle">Configure alert preferences</div>
          </div>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Enable Alerts</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: notify ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'background 0.2s',
                  padding: 0,
                }}
                onClick={() => setNotify(!notify)}
              >
                <span style={{
                  position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                  left: notify ? 22 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
              <span className="text-secondary text-sm">{notify ? 'Alerts enabled' : 'Alerts disabled'}</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Satellite Check Interval (days)</label>
            <select className="form-input" value={interval} onChange={e => setInterval(e.target.value)} style={{ maxWidth: 200 }}>
              <option value="1">Every day</option>
              <option value="3">Every 3 days</option>
              <option value="5">Every 5 days</option>
              <option value="7">Weekly</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn btn-primary">Save Settings</button>
            <button className="btn btn-ghost">Reset</button>
          </div>
        </div>
      </div>

      <div className="card mt-4" style={{ maxWidth: 600 }}>
        <div className="card-header">
          <div>
            <div className="card-title">About</div>
            <div className="card-subtitle">Platform information</div>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div><span className="text-muted">Platform:</span> Terralogy Precision Agriculture</div>
            <div><span className="text-muted">Version:</span> 5.0.0</div>
            <div><span className="text-muted">Satellite:</span> Copernicus Sentinel-2</div>
            <div><span className="text-muted">Weather:</span> Open-Meteo</div>
            <div><span className="text-muted">Soil Data:</span> ISRIC SoilGrids</div>
          </div>
        </div>
      </div>
    </div>
  )
}
