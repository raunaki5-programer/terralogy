import { useEffect, useRef, useState } from 'react'

interface Props {
  onAreaSelect?: (info: { lat: number; lng: number; area_ha: number; shape: string; coordinates: number[][] }) => void
  onMapClick?: (lat: number, lng: number) => void
  activeTool: string
}

type Tool = 'select' | 'pan' | 'rectangle' | 'circle' | 'polygon'

export default function WorkspaceMap({ onAreaSelect, onMapClick, activeTool }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [zoom, setZoom] = useState(4.5)
  const [center, setCenter] = useState<[number, number]>([78.9629, 20.5937])
  const [mousePos, setMousePos] = useState<{ lat: number; lng: number } | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [coordinates, setCoordinates] = useState<number[][]>([])
  const startRef = useRef<[number, number] | null>(null)
  const pointsRef = useRef<[number, number][]>([])
  const toolRef = useRef<string>('select')
  const callbacksRef = useRef({ onAreaSelect, onMapClick })

  useEffect(() => { toolRef.current = activeTool }, [activeTool])
  useEffect(() => { callbacksRef.current = { onAreaSelect, onMapClick } }, [onAreaSelect, onMapClick])

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
        center: [78.9629, 20.5937],
        zoom: 5,
        maxZoom: 19,
      })
      map.addControl(new ml.NavigationControl({ showCompass: false, showZoom: false }), 'top-right')
      mapRef.current = map

      map.on('click', (e: any) => {
        const { lng, lat } = e.lngLat
        const tool = toolRef.current
        if (tool === 'select' || tool === 'pan') {
          callbacksRef.current.onMapClick?.(lat, lng)
        } else if (tool === 'rectangle') {
          handleRectangleClick(lng, lat, map)
        } else if (tool === 'circle') {
          handleCircleClick(lng, lat, map)
        } else if (tool === 'polygon') {
          handlePolygonClick(lng, lat, map)
        }
      })

      map.on('dblclick', (e: any) => {
        e.preventDefault()
        const tool = toolRef.current
        if (tool === 'polygon' && pointsRef.current.length >= 3) {
          finishPolygon(map)
        }
      })

      map.on('mousemove', (e: any) => {
        setMousePos({ lat: e.lngLat.lat, lng: e.lngLat.lng })
        const tool = toolRef.current
        if (tool === 'rectangle' && startRef.current && drawing) {
          updateRectanglePreview(e.lngLat.lng, e.lngLat.lat, map)
        } else if (tool === 'circle' && startRef.current && drawing) {
          updateCirclePreview(e.lngLat.lng, e.lngLat.lat, map)
        } else if (tool === 'polygon' && pointsRef.current.length > 0) {
          updatePolygonPreview(e.lngLat.lng, e.lngLat.lat, map)
        }
      })

      map.on('zoom', () => setZoom(map.getZoom()))
      map.on('move', () => { const c = map.getCenter(); setCenter([c.lng, c.lat]) })
    })
    return () => { cancelled = true; mapRef.current?.remove() }
  }, [])

  function handleRectangleClick(lng: number, lat: number, map: any) {
    if (!startRef.current) {
      startRef.current = [lng, lat]
      setDrawing(true)
      setCoordinates([[lng, lat]])
    } else {
      const [sLng, sLat] = startRef.current
      const coords = [[sLng, sLat], [lng, sLat], [lng, lat], [sLng, lat], [sLng, sLat]]
      drawShape(coords, map, 'rectangle')
      startRef.current = null
      setDrawing(false)
    }
  }

  function updateRectanglePreview(lng: number, lat: number, map: any) {
    if (!startRef.current) return
    const [sLng, sLat] = startRef.current
    const coords = [[sLng, sLat], [lng, sLat], [lng, lat], [sLng, lat], [sLng, sLat]]
    updatePreview(coords, map)
  }

  function handleCircleClick(lng: number, lat: number, map: any) {
    if (!startRef.current) {
      startRef.current = [lng, lat]
      setDrawing(true)
      setCoordinates([[lng, lat]])
    } else {
      const [cLng, cLat] = startRef.current
      const dx = lng - cLng, dy = lat - cLat
      const r = Math.sqrt(dx * dx + dy * dy)
      const coords: number[][] = []
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * 2 * Math.PI
        coords.push([cLng + r * Math.cos(a), cLat + r * Math.sin(a)])
      }
      drawShape(coords, map, 'circle')
      startRef.current = null
      setDrawing(false)
    }
  }

  function updateCirclePreview(lng: number, lat: number, map: any) {
    if (!startRef.current) return
    const [cLng, cLat] = startRef.current
    const dx = lng - cLng, dy = lat - cLat
    const r = Math.sqrt(dx * dx + dy * dy)
    const coords: number[][] = []
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * 2 * Math.PI
      coords.push([cLng + r * Math.cos(a), cLat + r * Math.sin(a)])
    }
    updatePreview(coords, map)
  }

  function handlePolygonClick(lng: number, lat: number, map: any) {
    pointsRef.current.push([lng, lat])
    setCoordinates([...pointsRef.current])
    if (pointsRef.current.length >= 2) {
      updatePreview([...pointsRef.current, pointsRef.current[0]], map)
    }
  }

  function updatePolygonPreview(lng: number, lat: number, map: any) {
    if (pointsRef.current.length === 0) return
    updatePreview([...pointsRef.current, [lng, lat], pointsRef.current[0]], map)
  }

  function finishPolygon(map: any) {
    const coords = [...pointsRef.current, pointsRef.current[0]]
    drawShape(coords, map, 'polygon')
    pointsRef.current = []
  }

  function updatePreview(coords: number[][], map: any) {
    const geojson = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] } }
    if (map.getSource('preview')) {
      map.getSource('preview').setData(geojson)
    } else {
      map.addSource('preview', { type: 'geojson', data: geojson })
      map.addLayer({ id: 'preview-fill', type: 'fill', source: 'preview', paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.3 } })
      map.addLayer({ id: 'preview-line', type: 'line', source: 'preview', paint: { 'line-color': '#3b82f6', 'line-width': 2 } })
    }
  }

  function drawShape(coords: number[][], map: any, shape: string) {
    if (map.getSource('preview')) {
      map.removeLayer('preview-fill'); map.removeLayer('preview-line'); map.removeSource('preview')
    }
    if (map.getSource('final')) {
      map.removeLayer('final-fill'); map.removeLayer('final-line'); map.removeSource('final')
    }
    const geojson = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] } }
    map.addSource('final', { type: 'geojson', data: geojson })
    map.addLayer({ id: 'final-fill', type: 'fill', source: 'final', paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.4 } })
    map.addLayer({ id: 'final-line', type: 'line', source: 'final', paint: { 'line-color': '#3b82f6', 'line-width': 3 } })

    const R = 6378137
    const rad = (d: number) => (d * Math.PI) / 180
    let area = 0
    for (let i = 0; i < coords.length - 1; i++) {
      area += rad(coords[i + 1][0] - coords[i][0]) * (2 + Math.sin(rad(coords[i][1])) + Math.sin(rad(coords[i + 1][1])))
    }
    const area_ha = Math.round((Math.abs(area * R * R) / 2 / 10000) * 100) / 100

    let sumLat = 0, sumLng = 0
    coords.forEach(([lng, lat]) => { sumLat += lat; sumLng += lng })
    const center = { lat: sumLat / coords.length, lng: sumLng / coords.length }

    callbacksRef.current.onAreaSelect?.({
      lat: center.lat,
      lng: center.lng,
      area_ha,
      shape,
      coordinates: coords
    })
  }

  const handleZoomIn = () => mapRef.current?.zoomIn()
  const handleZoomOut = () => mapRef.current?.zoomOut()
  const handleReset = () => { mapRef.current?.setCenter([78.9629, 20.5937]); mapRef.current?.setZoom(5); }

  const scale = Math.round(156543.03392 * Math.cos(center[1] * Math.PI / 180) / Math.pow(2, zoom))

  return (
    <div className="map-workspace">
      <div ref={container} className="map-container">
        <div className="map-inner" />
      </div>

      {/* Drawing toolbar */}
      <div className="drawing-toolbar">
        <button className={`btn btn-sm ${activeTool === 'select' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => {}}>Select</button>
        <button className={`btn btn-sm ${activeTool === 'rectangle' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => {}}>Rectangle</button>
        <button className={`btn btn-sm ${activeTool === 'circle' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => {}}>Circle</button>
        <button className={`btn btn-sm ${activeTool === 'polygon' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => {}}>Polygon</button>
        {drawing && <button className="btn btn-sm btn-ghost" onClick={() => { setDrawing(false); startRef.current = null; pointsRef.current = []; }}>Cancel</button>}
      </div>

      {/* Map controls */}
      <div className="map-controls">
        <button className="map-control-btn" onClick={handleZoomIn} title="Zoom In">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button className="map-control-btn" onClick={handleZoomOut} title="Zoom Out">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button className="map-control-btn" onClick={handleReset} title="Reset">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
        </button>
      </div>

      <div className="compass">
        <span className="compass-n">N</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor"/>
        </svg>
      </div>

      <div className="scale-bar">
        <div className="scale-line"/>
        <span>{scale < 1000 ? `${scale} m` : `${Math.round(scale / 1000)} km`}</span>
      </div>

      {mousePos && (
        <div className="coordinates">
          <span>Lat: {mousePos.lat.toFixed(6)}°</span>
          <span>Lon: {mousePos.lng.toFixed(6)}°</span>
        </div>
      )}

      <div className="minimap">
        <div className="minimap-inner" style={{ background: 'linear-gradient(135deg, #1a472a 0%, #2d5016 50%, #1a472a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Overview</div>
      </div>
    </div>
  )
}
