import { useEffect, useRef, useState } from 'react'
import type { Farm } from '@/types'

interface Props {
  farms: Farm[]
  onFarmClick?: (farm: Farm) => void
  onMapClick?: (lat: number, lng: number) => void
  onAreaSelect?: (geometry: any, area_ha: number) => void
}

type DrawTool = null | 'circle' | 'rectangle' | 'polygon'

export default function MapView({ farms, onFarmClick, onAreaSelect }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const drawRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [activeTool, setActiveTool] = useState<DrawTool>(null)

  useEffect(() => {
    if (!container.current) return
    let cancelled = false
    const p = import('maplibre-gl')
    p.then((m) => {
      if (cancelled) return
      const ml = m.default
      const map = new ml.Map({
        container: container.current!,
        style: { version: 8, sources: { esri: { type: 'raster', tiles: ['https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 19 } }, layers: [{ id: 'satellite', type: 'raster', source: 'esri' }] },
        center: [78, 22], zoom: 4.5, maxZoom: 19,
      })
      map.addControl(new ml.NavigationControl(), 'top-right')
      mapRef.current = map
    })
    return () => { cancelled = true; mapRef.current?.remove() }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    import('maplibre-gl').then((m) => {
      const ml = m.default
      markersRef.current.forEach((k) => k.remove())
      markersRef.current = farms.map((farm) => {
        const el = document.createElement('div')
        el.innerHTML = '<div style="background:#00d4aa;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:pointer" title="' + farm.name + '" />'
        el.onclick = () => onFarmClick?.(farm)
        return new ml.Marker({ element: el }).setLngLat([farm.location.lng, farm.location.lat]).addTo(map)
      })
    })
  }, [farms])

  // Drawing tool logic
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove existing draw if any
    if (drawRef.current) {
      try { map.removeControl(drawRef.current) } catch {}
      drawRef.current = null
    }

    if (!activeTool) return

    import('@mapbox/mapbox-gl-draw').then((DrawModule) => {
      const MapboxDraw = DrawModule.default
      let modes: any = MapboxDraw.modes

      if (activeTool === 'circle') {
        modes = { ...MapboxDraw.modes, draw_circle: CircleMode }
      }

      const draw = new MapboxDraw({
        displayControlsDefault: false,
        defaultMode: activeTool === 'circle' ? 'draw_circle' : activeTool === 'rectangle' ? 'draw_rectangle' : 'draw_polygon',
        modes,
      })

      map.addControl(draw)
      drawRef.current = draw

      const onDraw = (e: any) => {
        const data = draw.getAll()
        if (data.features.length > 0) {
          const feature = data.features[0]
          const geom = feature.geometry
          const area = turfArea(geom)
          const area_ha = Math.round(area / 10000 * 100) / 100

          // Draw the shape on map as a visual
          if (map.getLayer('draw-highlight')) map.removeLayer('draw-highlight')
          if (map.getSource('draw-highlight')) map.removeSource('draw-highlight')
          map.addSource('draw-highlight', { type: 'geojson', data: feature })
          map.addLayer({ id: 'draw-highlight', type: 'fill', source: 'draw-highlight', paint: { 'fill-color': '#00d4aa', 'fill-opacity': 0.25 } })

          onAreaSelect?.(geom, area_ha)
          draw.deleteAll()
          setActiveTool(null)
        }
      }

      map.on('draw.create', onDraw)
      return () => { map.off('draw.create', onDraw) }
    })
  }, [activeTool])

  return (
    <div style={{ position: 'relative' }}>
      <div ref={container} style={{ width: '100%', height: '500px', borderRadius: 12 }} />
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', gap: 6 }}>
        <button onClick={() => setActiveTool(activeTool === 'circle' ? null : 'circle')} style={btnStyle(activeTool === 'circle')}>⭕ Circle</button>
        <button onClick={() => setActiveTool(activeTool === 'rectangle' ? null : 'rectangle')} style={btnStyle(activeTool === 'rectangle')}>▬ Rectangle</button>
        <button onClick={() => setActiveTool(activeTool === 'polygon' ? null : 'polygon')} style={btnStyle(activeTool === 'polygon')}>⬠ Polygon</button>
        {activeTool && <span style={{ padding: '4px 10px', background: 'rgba(0,212,170,0.15)', borderRadius: 8, color: '#00d4aa', fontSize: 12 }}>Draw on map →</span>}
      </div>
    </div>
  )
}

const btnStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 12px',
  background: active ? '#00d4aa' : 'rgba(15,23,42,0.9)',
  color: active ? '#0a0f1a' : '#94a3b8',
  border: active ? 'none' : '1px solid #334155',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
  backdropFilter: 'blur(8px)',
})

const CircleMode: any = {}
// turf area helper
function turfArea(geom: any): number {
  if (geom.type === 'Polygon') {
    const coords = geom.coordinates[0]
    return polygonArea(coords)
  }
  return 0
}

function polygonArea(ring: number[][]): number {
  const R = 6378137
  let area = 0
  const toRad = (d: number) => d * Math.PI / 180
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = [toRad(ring[i][0]), Math.sin(toRad(ring[i][1]))]
    const [x2, y2] = [toRad(ring[i + 1][0]), Math.sin(toRad(ring[i + 1][1]))]
    area += (x2 - x1) * (2 + y1 + y2)
  }
  return Math.abs(area * R * R / 2)
}
