import { useState, useEffect } from 'react'

interface StatusBarProps {
  zoom: number
  center: [number, number]
  mousePos?: { lat: number; lng: number }
}

export default function StatusBar({ zoom, center, mousePos }: StatusBarProps) {
  const [memory, setMemory] = useState(2.1)
  const [cpu, setCpu] = useState(23)
  const [networkStatus, setNetworkStatus] = useState('Online')

  useEffect(() => {
    const interval = setInterval(() => {
      setMemory(prev => Math.max(1.5, Math.min(4, prev + (Math.random() - 0.5) * 0.2)))
      setCpu(prev => Math.max(10, Math.min(60, prev + (Math.random() - 0.5) * 5)))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const scale = Math.round(156543.03392 * Math.cos((mousePos?.lat || center[1]) * Math.PI / 180) / Math.pow(2, zoom))

  return (
    <div className="status-bar">
      <div className="status-item">
        <span>CRS: WGS 84 / UTM zone 45N</span>
      </div>
      <div className="status-divider"/>
      <div className="status-item">
        <span>Scale: 1:{scale.toLocaleString()}</span>
      </div>
      <div className="status-divider"/>
      <div className="status-item">
        <span>Zoom: {zoom.toFixed(1)}</span>
      </div>
      <div className="status-divider"/>
      {mousePos && (
        <>
          <div className="status-item">
            <span>Lat: {mousePos.lat.toFixed(6)}°</span>
          </div>
          <div className="status-item">
            <span>Lon: {mousePos.lng.toFixed(6)}°</span>
          </div>
          <div className="status-divider"/>
        </>
      )}
      <div className="status-item">
        <span>Elevation: 18 m</span>
      </div>
      <div className="status-divider"/>
      <div className="status-item">
        <span>Memory: {memory.toFixed(1)} GB</span>
      </div>
      <div className="status-item">
        <span>CPU: {cpu.toFixed(0)}%</span>
      </div>
      <div className="status-divider"/>
      <div className={`status-item ${networkStatus === 'Online' ? 'status-online' : 'status-warning'}`}>
        <span>Network: {networkStatus}</span>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: networkStatus === 'Online' ? 'var(--success)' : 'var(--warning)', marginLeft: 4 }}/>
      </div>
      <div className="status-divider"/>
      <div className="status-item" style={{ marginLeft: 'auto' }}>
        <span>TerraLogy v1.0.0</span>
      </div>
    </div>
  )
}
