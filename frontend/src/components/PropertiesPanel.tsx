import { useState } from 'react'

interface Layer {
  id: string
  name: string
  type: string
  visible: boolean
  locked: boolean
  opacity: number
  color?: string
}

interface PropertiesPanelProps {
  selectedLayer: Layer | null
}

export default function PropertiesPanel({ selectedLayer }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState('visualization')
  const [opacity, setOpacity] = useState(selectedLayer?.opacity || 100)
  const [bandCombination, setBandCombination] = useState('False Color (NIR - SWIR - Red)')

  const tabs = ['Visualization', 'Info', 'Band View', 'Metadata']

  return (
    <div className="panel panel-right">
      <div className="panel-header">
        <span>Properties</span>
        {selectedLayer && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 400, color: 'var(--text-tertiary)' }}>{selectedLayer.name}</span>}
      </div>

      <div className="props-tabs">
        {tabs.map(tab => (
          <div
            key={tab}
            className={`props-tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.toLowerCase())}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="panel-content">
        {activeTab === 'visualization' && (
          <>
            <div className="props-section">
              <div className="props-label">Band Combination</div>
              <select className="props-control" value={bandCombination} onChange={(e) => setBandCombination(e.target.value)}>
                <option>True Color (Red - Green - Blue)</option>
                <option>False Color (NIR - Red - Green)</option>
                <option>False Color (NIR - SWIR - Red)</option>
                <option>Vegetation (NDVI)</option>
                <option>Moisture (NDWI)</option>
              </select>
            </div>

            <div className="props-section">
              <div className="props-label">Opacity</div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  className="props-slider"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', minWidth: 36 }}>{opacity}%</span>
              </div>
            </div>

            <div className="props-section">
              <div className="props-label">Histogram</div>
              <div style={{ height: 100, background: 'var(--bg-primary)', borderRadius: 4, padding: 8, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                {[40, 55, 70, 85, 100, 95, 80, 65, 50, 35, 25, 15, 10, 5, 3, 2, 1].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--accent)', borderRadius: '2px 2px 0 0', opacity: 0.7 }}/>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: 'var(--text-tertiary)' }}>
                <span>0</span>
                <span>10000</span>
              </div>
            </div>

            <div className="props-section">
              <div className="props-label">Enhancement</div>
              <select className="props-control">
                <option>Histogram Equalization</option>
                <option>Linear Stretch</option>
                <option>Gamma Correction</option>
                <option>None</option>
              </select>
            </div>

            <div className="props-section">
              <div className="props-label">AI Quick Analysis</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {['LULC Classification', 'Change Detection', 'NDVI', 'NDWI', 'Bare Soil', 'Built-up Area'].map(item => (
                  <button key={item} className="btn btn-sm" style={{ fontSize: 10, padding: '6px 4px' }}>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="props-section">
              <div className="props-label">Layer Legend</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { name: 'Water', color: '#3b82f6' },
                  { name: 'Forest', color: '#10b981' },
                  { name: 'Agriculture', color: '#f59e0b' },
                  { name: 'Built-up', color: '#ef4444' },
                  { name: 'Bare Soil', color: '#8b5a3c' },
                ].map(item => (
                  <div key={item.name} className="props-row">
                    <div className="flex items-center gap-2">
                      <div style={{ width: 12, height: 12, background: item.color, borderRadius: 2 }}/>
                      <span className="props-row-label">{item.name}</span>
                    </div>
                    <button className="layer-action-btn" style={{ opacity: 1 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 10, height: 10 }}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="props-section">
              <div className="props-label">Statistics</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span className="props-row-label">Overall Accuracy</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>92.34%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '92.34%' }}/>
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="props-row">
                  <span className="props-row-label">Kappa Coefficient</span>
                  <span className="props-row-value">0.89</span>
                </div>
                <div className="props-row">
                  <span className="props-row-label">Resolution</span>
                  <span className="props-row-value">10m/px</span>
                </div>
                <div className="props-row">
                  <span className="props-row-label">Area</span>
                  <span className="props-row-value">2,847 km²</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'info' && (
          <>
            <div className="props-section">
              <div className="props-label">Feature Information</div>
              <div className="props-row">
                <span className="props-row-label">Name</span>
                <span className="props-row-value">{selectedLayer?.name || 'N/A'}</span>
              </div>
              <div className="props-row">
                <span className="props-row-label">Type</span>
                <span className="props-row-value">{selectedLayer?.type || 'N/A'}</span>
              </div>
              <div className="props-row">
                <span className="props-row-label">CRS</span>
                <span className="props-row-value">EPSG:4326</span>
              </div>
              <div className="props-row">
                <span className="props-row-label">Extent</span>
                <span className="props-row-value">77.2, 28.6</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'bandview' && (
          <>
            <div className="props-section">
              <div className="props-label">Band Selection</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Red', 'Green', 'Blue', 'NIR', 'SWIR'].map((band, i) => (
                  <div key={band} className="props-row">
                    <span className="props-row-label">Band {i + 1}: {band}</span>
                    <span className="props-row-value">{[665, 560, 490, 842, 1610][i]} nm</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'metadata' && (
          <>
            <div className="props-section">
              <div className="props-label">Metadata</div>
              <div className="props-row">
                <span className="props-row-label">Acquisition Date</span>
                <span className="props-row-value">2024-05-20</span>
              </div>
              <div className="props-row">
                <span className="props-row-label">Sensor</span>
                <span className="props-row-value">Sentinel-2 MSI</span>
              </div>
              <div className="props-row">
                <span className="props-row-label">Cloud Cover</span>
                <span className="props-row-value">3.2%</span>
              </div>
              <div className="props-row">
                <span className="props-row-label">Processing Level</span>
                <span className="props-row-value">L2A</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
