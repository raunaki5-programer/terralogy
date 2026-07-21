import { useEffect, useRef, useState } from 'react'
import type { Farm, Field } from '@/types'

interface Layer {
  id: string
  name: string
  type: 'basemap' | 'satellite' | 'vector' | 'analysis'
  visible: boolean
  locked: boolean
  color?: string
  opacity: number
}

interface Props {
  farms: Farm[]
  fields: Field[]
  selectedLayer: Layer | null
  onSelectLayer: (layer: Layer) => void
  onMapClick?: (lat: number, lng: number) => void
  onToolChange?: (tool: string) => void
  activeTool: string
}

export default function WorkspaceMap({ farms, fields, selectedLayer, onSelectLayer, onMapClick, onToolChange, activeTool }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [zoom, setZoom] = useState(4.5)
  const [center, setCenter] = useState<[number, number]>([78.9629, 20.5937])
  const [mousePos, setMousePos] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!container.current) return
    let cancelled = false
    import('maplibre-gl').then(({ default: ml }) => {
      if (cancelled || !container.current) return
      const map = new ml.Map({
        container: container.current!,
        style: {
          version: 8,
          sources: {
            esri: {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
              maxzoom: 19,
            },
          },
          layers: [{ id: 'satellite', type: 'raster', source: 'esri' }],
        },
        center: center,
        zoom: zoom,
        maxZoom: 19,
      })
      map.addControl(new ml.NavigationControl({ showCompass: false, showZoom: false }), 'top-right')
      mapRef.current = map

      map.on('click', (e: any) => {
        onMapClick?.(e.lngLat.lat, e.lngLat.lng)
      })

      map.on('mousemove', (e: any) => {
        setMousePos({ lat: e.lngLat.lat, lng: e.lngLat.lng })
      })

      map.on('zoom', () => {
        setZoom(map.getZoom())
      })

      map.on('move', () => {
        const c = map.getCenter()
        setCenter([c.lng, c.lat])
      })
    })
    return () => { cancelled = true; mapRef.current?.remove() }
  }, [])

  const handleZoomIn = () => { mapRef.current?.zoomIn(); }
  const handleZoomOut = () => { mapRef.current?.zoomOut(); }
  const handleReset = () => { mapRef.current?.setCenter([78.9629, 20.5937]); mapRef.current?.setZoom(4.5); }

  const scale = Math.round(156543.03392 * Math.cos(center[1] * Math.PI / 180) / Math.pow(2, zoom))

  return (
    <div className="map-workspace">
      <div ref={container} className="map-container">
        <div className="map-inner" />
      </div>

      {/* Map Controls */}
      <div className="map-controls">
        <button className="map-control-btn" onClick={handleZoomIn} title="Zoom In">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button className="map-control-btn" onClick={handleZoomOut} title="Zoom Out">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button className="map-control-btn" onClick={handleReset} title="Reset View">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </button>
      </div>

      {/* Compass */}
      <div className="compass">
        <span className="compass-n">N</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor"/>
        </svg>
      </div>

      {/* Scale Bar */}
      <div className="scale-bar">
        <div className="scale-line"/>
        <span>{scale < 1000 ? `${scale} m` : `${Math.round(scale / 1000)} km`}</span>
      </div>

      {/* Coordinates */}
      {mousePos && (
        <div className="coordinates">
          <span>Lat: {mousePos.lat.toFixed(6)}°</span>
          <span>Lon: {mousePos.lng.toFixed(6)}°</span>
        </div>
      )}

      {/* Minimap */}
      <div className="minimap">
        <div className="minimap-inner" style={{
          background: 'linear-gradient(135deg, #1a472a 0%, #2d5016 50%, #1a472a 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: 'rgba(255,255,255,0.3)'
        }}>
          Overview
        </div>
      </div>
    </div>
  )
}
