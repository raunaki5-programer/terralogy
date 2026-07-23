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
  areaData?: any
}

export default function PropertiesPanel({ selectedLayer, areaData }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState('info')
  const [opacity, setOpacity] = useState(selectedLayer?.opacity || 100)
  const [bandCombination, setBandCombination] = useState('True Color (Red - Green - Blue)')

  const tabs = ['Info', 'Visualization', 'Band View', 'Metadata']

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
        {activeTab === 'info' && (
          <>
            {areaData && !areaData.error ? (
              <>
                <div className="props-section">
                  <div className="props-label">Location</div>
                  <div className="props-row">
                    <span className="props-row-label">Latitude</span>
                    <span className="props-row-value">{areaData.location?.lat?.toFixed(5) ?? areaData.lat?.toFixed(5) ?? '—'}</span>
                  </div>
                  <div className="props-row">
                    <span className="props-row-label">Longitude</span>
                    <span className="props-row-value">{areaData.location?.lng?.toFixed(5) ?? areaData.lng?.toFixed(5) ?? '—'}</span>
                  </div>
                  <div className="props-row">
                    <span className="props-row-label">Area</span>
                    <span className="props-row-value">{areaData.area_ha} ha</span>
                  </div>
                  <div className="props-row">
                    <span className="props-row-label">Shape</span>
                    <span className="props-row-value">{areaData.shape || '—'}</span>
                  </div>
                </div>

                {areaData.vegetation && (
                  <div className="props-section">
                    <div className="props-label">Vegetation</div>
                    <div className="props-row">
                      <span className="props-row-label">NDVI</span>
                      <span className="props-row-value" style={{ color: (areaData.vegetation.ndvi ?? 0) >= 0.4 ? 'var(--success)' : 'var(--warning)' }}>
                        {areaData.vegetation.ndvi ?? '—'}
                      </span>
                    </div>
                    <div className="props-row">
                      <span className="props-row-label">NDMI</span>
                      <span className="props-row-value">{areaData.vegetation.ndmi ?? '—'}</span>
                    </div>
                  </div>
                )}

                {areaData.health && (
                  <div className="props-section">
                    <div className="props-label">Health</div>
                    <div className="props-row">
                      <span className="props-row-label">Score</span>
                      <span className="props-row-value" style={{ color: (areaData.health.score ?? 0) >= 75 ? 'var(--success)' : 'var(--warning)' }}>
                        {areaData.health.score ?? '—'}
                      </span>
                    </div>
                    <div className="props-row">
                      <span className="props-row-label">Status</span>
                      <span className="props-row-value">{areaData.health.label ?? '—'}</span>
                    </div>
                  </div>
                )}

                {areaData.soil && (
                  <div className="props-section">
                    <div className="props-label">Soil</div>
                    <div className="props-row">
                      <span className="props-row-label">pH</span>
                      <span className="props-row-value">{areaData.soil.ph ?? '—'}</span>
                    </div>
                    <div className="props-row">
                      <span className="props-row-label">Moisture</span>
                      <span className="props-row-value">{areaData.soil.moisture ?? '—'}%</span>
                    </div>
                    {areaData.soil.clay && (
                      <div className="props-row">
                        <span className="props-row-label">Clay</span>
                        <span className="props-row-value">{areaData.soil.clay}%</span>
                      </div>
                    )}
                    {areaData.soil.organic_carbon && (
                      <div className="props-row">
                        <span className="props-row-label">Organic Carbon</span>
                        <span className="props-row-value">{areaData.soil.organic_carbon}%</span>
                      </div>
                    )}
                  </div>
                )}

                {areaData.weather?.temp && (
                  <div className="props-section">
                    <div className="props-label">Weather</div>
                    <div className="props-row">
                      <span className="props-row-label">Temperature</span>
                      <span className="props-row-value">{areaData.weather.temp}°C</span>
                    </div>
                    <div className="props-row">
                      <span className="props-row-label">Humidity</span>
                      <span className="props-row-value">{areaData.weather.humidity}%</span>
                    </div>
                  </div>
                )}

                {areaData.yield_potential && (
                  <div className="props-section">
                    <div className="props-label">Yield Potential</div>
                    <div className="props-row">
                      <span className="props-row-label">Estimate</span>
                      <span className="props-row-value">{areaData.yield_potential.estimated_tons_ha ?? '—'} t/ha</span>
                    </div>
                    <div className="props-row">
                      <span className="props-row-label">Rating</span>
                      <span className="props-row-value">{areaData.yield_potential.rating ?? '—'}</span>
                    </div>
                  </div>
                )}

                {areaData.irrigation && (
                  <div className="props-section">
                    <div className="props-label">Irrigation</div>
                    <div className="props-row">
                      <span className="props-row-label">Need</span>
                      <span className="props-row-value">{areaData.irrigation.need_mm ?? '—'} mm</span>
                    </div>
                    <div className="props-row">
                      <span className="props-row-label">Urgency</span>
                      <span className="props-row-value">{areaData.irrigation.urgency ?? '—'}</span>
                    </div>
                  </div>
                )}
              </>
            ) : areaData?.error ? (
              <div className="props-section">
                <div className="props-label">Error</div>
                <div style={{ fontSize: 12, color: 'var(--danger)' }}>{areaData.error}</div>
              </div>
            ) : (
              <div className="props-section">
                <div className="props-label">No Data</div>
                <div className="props-row"><span className="props-row-label">Draw an area on the map</span></div>
                <div className="props-row"><span className="props-row-label">or select a layer</span></div>
                <div className="props-row"><span className="props-row-label">to view properties</span></div>
              </div>
            )}
          </>
        )}

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
              <div className="props-label">Legend</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { name: 'Water', color: '#3b82f6' },
                  { name: 'Forest', color: '#10b981' },
                  { name: 'Agriculture', color: '#f59e0b' },
                  { name: 'Built-up', color: '#ef4444' },
                  { name: 'Bare Soil', color: '#8b5a3c' },
                ].map(item => (
                  <div key={item.name} className="props-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 12, height: 12, background: item.color, borderRadius: 2 }}/>
                      <span className="props-row-label">{item.name}</span>
                    </div>
                  </div>
                ))}
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
                <span className="props-row-value">{areaData?.date || '—'}</span>
              </div>
              <div className="props-row">
                <span className="props-row-label">Sensor</span>
                <span className="props-row-value">Sentinel-2 MSI</span>
              </div>
              <div className="props-row">
                <span className="props-row-label">Cloud Cover</span>
                <span className="props-row-value">{areaData?.cloud_cover != null ? `${areaData.cloud_cover}%` : '—'}</span>
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
