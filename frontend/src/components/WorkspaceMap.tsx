import { useEffect, useRef, useState, useCallback } from 'react'
import { GOOGLE_MAPS_KEY, GOOGLE_MAPS_SESSION_URL, GOOGLE_TILE_URL, SESSION_MAP_TYPES, BASEMAP_LABELS, type BasemapId } from '@/config'

interface Props {
  onAreaSelect?: (info: { lat: number; lng: number; area_ha: number; shape: string; coordinates: number[][] }) => void
  onMapClick?: (lat: number, lng: number) => void
  activeTool: string
  onToolChange: (tool: string) => void
}

export default function WorkspaceMap({ onAreaSelect, onMapClick, activeTool, onToolChange }: Props) {
  const mapDiv = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const startRef = useRef<[number, number] | null>(null)
  const pointsRef = useRef<[number, number][]>([])
  const drawingRef = useRef(false)
  const toolRef = useRef(activeTool)
  const cbRef = useRef({ onAreaSelect, onMapClick })

  const [zoom, setZoom] = useState(5)
  const [center, setCenter] = useState<[number, number]>([78.9629, 20.5937])
  const [mousePos, setMousePos] = useState<{ lat: number; lng: number } | null>(null)
  const [hint, setHint] = useState('Select a draw tool, then click on the map')
  const [isDrawing, setIsDrawing] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [basemap, setBasemap] = useState<BasemapId>('esri-satellite')
  const sessionRef = useRef<string | null>(null)
  const [showBasemapPicker, setShowBasemapPicker] = useState(false)

  useEffect(() => {
    toolRef.current = activeTool
    startRef.current = null
    pointsRef.current = []
    drawingRef.current = false
    setIsDrawing(false)
    clearLayer('preview')
    const hints: Record<string, string> = {
      select: 'Click map to place a point',
      pan: 'Drag to pan the map',
      rectangle: 'Click first corner, then opposite corner',
      circle: 'Click center, then edge of circle',
      polygon: 'Click points, double-click to finish (min 3)',
    }
    setHint(hints[activeTool] || 'Select a tool')
    const map = mapRef.current
    if (map) {
      map.getCanvas().style.cursor = ['rectangle', 'circle', 'polygon'].includes(activeTool) ? 'crosshair' : ''
      map.doubleClickZoom[activeTool === 'polygon' ? 'disable' : 'enable']()
      map.dragPan[activeTool === 'pan' || activeTool === 'select' ? 'enable' : 'enable']()
    }
  }, [activeTool])

  useEffect(() => {
    cbRef.current = { onAreaSelect, onMapClick }
  }, [onAreaSelect, onMapClick])

  useEffect(() => {
    if (!mapDiv.current) return
    let cancelled = false
    let map: any = null

    import('maplibre-gl').then(({ default: maplibregl }) => {
      if (cancelled || !mapDiv.current) return

      map = new maplibregl.Map({
        container: mapDiv.current,
        style: {
          version: 8,
          sources: {
            basemap: {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
              attribution: 'Esri',
              maxzoom: 19,
            },
          },
          layers: [{ id: 'basemap-layer', type: 'raster', source: 'basemap' }],
        },
        center: [78.9629, 20.5937],
        zoom: 5,
        maxZoom: 18,
      })

      mapRef.current = map

      map.on('load', () => {
        if (cancelled) return
        setMapReady(true)
        map.resize()
      })

      map.on('click', (e: any) => {
        if (cancelled) return
        const { lng, lat } = e.lngLat
        const tool = toolRef.current

        if (tool === 'select') {
          cbRef.current.onMapClick?.(lat, lng)
          return
        }
        if (tool === 'pan') return

        if (tool === 'rectangle') {
          if (!startRef.current) {
            startRef.current = [lng, lat]
            drawingRef.current = true
            setIsDrawing(true)
            setHint('Click opposite corner to finish rectangle')
          } else {
            const [sLng, sLat] = startRef.current
            finishShape(
              [[sLng, sLat], [lng, sLat], [lng, lat], [sLng, lat], [sLng, sLat]],
              'rectangle'
            )
          }
          return
        }

        if (tool === 'circle') {
          if (!startRef.current) {
            startRef.current = [lng, lat]
            drawingRef.current = true
            setIsDrawing(true)
            setHint('Click edge of circle to finish')
          } else {
            const [cLng, cLat] = startRef.current
            const r = Math.hypot(lng - cLng, lat - cLat)
            const ring: number[][] = []
            for (let i = 0; i <= 64; i++) {
              const a = (i / 64) * Math.PI * 2
              ring.push([cLng + r * Math.cos(a), cLat + r * Math.sin(a)])
            }
            finishShape(ring, 'circle')
          }
          return
        }

        if (tool === 'polygon') {
          pointsRef.current.push([lng, lat])
          drawingRef.current = true
          setIsDrawing(true)
          const n = pointsRef.current.length
          setHint(n < 3 ? `${n} points — need at least 3, double-click to finish` : `${n} points — double-click to finish`)
          if (n >= 2) {
            setPreview([...pointsRef.current, pointsRef.current[0]])
          }
        }
      })

      map.on('dblclick', (e: any) => {
        e.preventDefault()
        if (toolRef.current === 'polygon' && pointsRef.current.length >= 3) {
          finishShape([...pointsRef.current, pointsRef.current[0]], 'polygon')
        }
      })

      map.on('mousemove', (e: any) => {
        const { lng, lat } = e.lngLat
        setMousePos({ lat, lng })
        if (!drawingRef.current) return
        const tool = toolRef.current

        if (tool === 'rectangle' && startRef.current) {
          const [sLng, sLat] = startRef.current
          setPreview([[sLng, sLat], [lng, sLat], [lng, lat], [sLng, lat], [sLng, sLat]])
        } else if (tool === 'circle' && startRef.current) {
          const [cLng, cLat] = startRef.current
          const r = Math.hypot(lng - cLng, lat - cLat)
          const ring: number[][] = []
          for (let i = 0; i <= 64; i++) {
            const a = (i / 64) * Math.PI * 2
            ring.push([cLng + r * Math.cos(a), cLat + r * Math.sin(a)])
          }
          setPreview(ring)
        } else if (tool === 'polygon' && pointsRef.current.length > 0) {
          setPreview([...pointsRef.current, [lng, lat], pointsRef.current[0]])
        }
      })

      map.on('zoom', () => setZoom(map.getZoom()))
      map.on('move', () => {
        const c = map.getCenter()
        setCenter([c.lng, c.lat])
      })
    })

    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
    }
  }, [])

  function clearLayer(id: string) {
    const map = mapRef.current
    if (!map) return
    try {
      if (map.getLayer(`${id}-fill`)) map.removeLayer(`${id}-fill`)
      if (map.getLayer(`${id}-line`)) map.removeLayer(`${id}-line`)
      if (map.getSource(id)) map.removeSource(id)
    } catch { /* ignore */ }
  }

  function setPreview(ring: number[][]) {
    const map = mapRef.current
    if (!map || ring.length < 3) return
    const data = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } }
    try {
      if (map.getSource('preview')) {
        map.getSource('preview').setData(data)
      } else {
        map.addSource('preview', { type: 'geojson', data })
        map.addLayer({ id: 'preview-fill', type: 'fill', source: 'preview', paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.25 } })
        map.addLayer({ id: 'preview-line', type: 'line', source: 'preview', paint: { 'line-color': '#60a5fa', 'line-width': 2 } })
      }
    } catch { /* ignore */ }
  }

  function finishShape(ring: number[][], shape: string) {
    const map = mapRef.current
    if (!map) return

    clearLayer('preview')
    clearLayer('final')

    const data = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } }
    try {
      map.addSource('final', { type: 'geojson', data })
      map.addLayer({ id: 'final-fill', type: 'fill', source: 'final', paint: { 'fill-color': '#22c55e', 'fill-opacity': 0.35 } })
      map.addLayer({ id: 'final-line', type: 'line', source: 'final', paint: { 'line-color': '#4ade80', 'line-width': 3 } })
    } catch { /* ignore */ }

    const R = 6378137
    const rad = (d: number) => (d * Math.PI) / 180
    let area = 0
    for (let i = 0; i < ring.length - 1; i++) {
      area += rad(ring[i + 1][0] - ring[i][0]) * (2 + Math.sin(rad(ring[i][1])) + Math.sin(rad(ring[i + 1][1])))
    }
    const area_ha = Math.round((Math.abs(area * R * R) / 2 / 10000) * 100) / 100

    let sumLat = 0, sumLng = 0
    ring.forEach(([lng, lat]) => { sumLat += lat; sumLng += lng })
    const n = ring.length
    const lat = sumLat / n
    const lng = sumLng / n

    startRef.current = null
    pointsRef.current = []
    drawingRef.current = false
    setIsDrawing(false)
    setHint(`${shape} drawn — ${area_ha} ha. Analyzing...`)

    cbRef.current.onAreaSelect?.({ lat, lng, area_ha, shape, coordinates: ring })
  }

  function cancelDraw() {
    startRef.current = null
    pointsRef.current = []
    drawingRef.current = false
    setIsDrawing(false)
    clearLayer('preview')
    setHint('Drawing cancelled. Select a tool and try again.')
  }

  const changeBasemap = useCallback(async (id: BasemapId) => {
    const map = mapRef.current
    if (!map) return
    setBasemap(id)
    setShowBasemapPicker(false)

    if (id === 'esri-satellite') {
      if (map.getSource('basemap')) {
        map.removeLayer('basemap-layer')
        map.removeSource('basemap')
      }
      map.addSource('basemap', {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'Esri',
        maxzoom: 19,
      })
      map.addLayer({ id: 'basemap-layer', type: 'raster', source: 'basemap' })
      return
    }

    const mapType = SESSION_MAP_TYPES[id]
    if (!mapType) return

    try {
      const res = await fetch(`${GOOGLE_MAPS_SESSION_URL}?key=${GOOGLE_MAPS_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapType, language: 'en-US', region: 'US' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      sessionRef.current = data.session

      if (map.getSource('basemap')) {
        map.removeLayer('basemap-layer')
        map.removeSource('basemap')
      }
      map.addSource('basemap', {
        type: 'raster',
        tiles: [`${GOOGLE_TILE_URL}/{z}/{x}/{y}?session=${data.session}&key=${GOOGLE_MAPS_KEY}`],
        tileSize: 256,
        attribution: 'Google',
        maxzoom: 20,
      })
      map.addLayer({ id: 'basemap-layer', type: 'raster', source: 'basemap' })
    } catch {
      setHint(`Failed to load ${BASEMAP_LABELS[id]}, using current basemap`)
    }
  }, [])

  const BASEMAP_ICONS: Record<BasemapId, string> = {
    'esri-satellite': '🗺',
    'google-satellite': '🛰',
    'google-hybrid': '🌍',
    'google-roadmap': '🗾',
  }

  const scale = Math.round(156543.03392 * Math.cos((center[1] * Math.PI) / 180) / Math.pow(2, zoom))
  const tools = [
    { id: 'select', label: 'Select' },
    { id: 'rectangle', label: 'Rectangle' },
    { id: 'circle', label: 'Circle' },
    { id: 'polygon', label: 'Polygon' },
  ]

  return (
    <div className="map-workspace" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div ref={mapDiv} style={{ flex: 1, minHeight: 300, width: '100%', position: 'relative' }} />

      {!mapReady && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', zIndex: 5 }}>
          <div className="spinner" />
          <span style={{ marginLeft: 12, color: 'var(--text-secondary)' }}>Loading map...</span>
        </div>
      )}

      <div className="drawing-toolbar">
        {tools.map(t => (
          <button
            key={t.id}
            type="button"
            className={`btn btn-sm ${activeTool === t.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onToolChange(t.id)}
          >
            {t.label}
          </button>
        ))}
        {isDrawing && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={cancelDraw}>Cancel</button>
        )}
      </div>

      <div className="map-hint" style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(17,24,39,0.95)', border: '1px solid var(--border)', borderRadius: 20,
        padding: '8px 16px', fontSize: 12, color: 'var(--text-secondary)', zIndex: 10, whiteSpace: 'nowrap',
      }}>
        {hint}
      </div>

      <div className="map-controls">
        <div style={{ position: 'relative' }}>
          <button type="button" className="map-control-btn" onClick={() => setShowBasemapPicker(p => !p)} style={{ fontSize: 16 }} title="Switch basemap">
            {BASEMAP_ICONS[basemap]}
          </button>
          {showBasemapPicker && (
            <div style={{
              position: 'absolute', left: 44, top: 0, background: 'var(--bg-secondary)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              padding: 4, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 2, whiteSpace: 'nowrap',
            }}>
              {(Object.keys(BASEMAP_LABELS) as BasemapId[]).map(id => (
                <button key={id} type="button"
                  className={`btn btn-sm ${basemap === id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => changeBasemap(id)}
                  style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  {BASEMAP_ICONS[id]} {BASEMAP_LABELS[id]}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" className="map-control-btn" onClick={() => mapRef.current?.zoomIn()}>+</button>
        <button type="button" className="map-control-btn" onClick={() => mapRef.current?.zoomOut()}>−</button>
      </div>

      <div className="scale-bar">
        <div className="scale-line" />
        <span>{scale < 1000 ? `${scale} m` : `${Math.round(scale / 1000)} km`}</span>
      </div>

      {mousePos && (
        <div className="coordinates">
          <span>Lat: {mousePos.lat.toFixed(5)}°</span>
          <span>Lon: {mousePos.lng.toFixed(5)}°</span>
        </div>
      )}
    </div>
  )
}
