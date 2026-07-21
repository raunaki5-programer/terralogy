import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import type { Farm } from '@/types'

interface Props {
  farms: Farm[]
  onFarmClick?: (farm: Farm) => void
  onMapClick?: (lat: number, lng: number) => void
  onAreaSelect?: (info: { lat: number; lng: number; area_ha: number }) => void
}

type Tool = 'point' | 'rectangle' | 'circle' | 'polygon'

export default function MapView({ farms, onFarmClick, onMapClick, onAreaSelect }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [tool, setTool] = useState<Tool>('point')
  const [hint, setHint] = useState('Click on map to add farm')
  const startRef = useRef<[number, number] | null>(null)
  const pointsRef = useRef<[number, number][]>([])

  useEffect(() => {
    if (!container.current) return
    const map = new maplibregl.Map({
      container: container.current,
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
      center: [78, 22],
      zoom: 4.5,
      maxZoom: 19,
    })
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    mapRef.current = map

    map.on('click', (e: any) => {
      const { lng, lat } = e.lngLat
      if (tool === 'point') {
        onMapClick?.(lat, lng)
      } else if (tool === 'rectangle') {
        if (!startRef.current) {
          startRef.current = [lng, lat]
          setHint('Click opposite corner')
        } else {
          const [sLng, sLat] = startRef.current
          const ring: [number, number][] = [
            [sLng, sLat], [lng, sLat], [lng, lat], [sLng, lat], [sLng, sLat]
          ]
          finishShape(ring, 'rectangle')
          startRef.current = null
          setHint('Click first corner')
        }
      } else if (tool === 'circle') {
        if (!startRef.current) {
          startRef.current = [lng, lat]
          setHint('Click edge of circle')
        } else {
          const [cLng, cLat] = startRef.current
          const dx = lng - cLng, dy = lat - cLat
          const r = Math.sqrt(dx * dx + dy * dy)
          const ring: [number, number][] = []
          for (let i = 0; i <= 64; i++) {
            const a = (i / 64) * 2 * Math.PI
            ring.push([cLng + r * Math.cos(a), cLat + r * Math.sin(a)])
          }
          finishShape(ring, 'circle')
          startRef.current = null
          setHint('Click center of circle')
        }
      } else if (tool === 'polygon') {
        pointsRef.current.push([lng, lat])
        setHint(`${pointsRef.current.length} points — double-click to finish`)
        renderPreview()
      }
    })

    map.on('dblclick', (e: any) => {
      e.preventDefault()
      if (tool === 'polygon' && pointsRef.current.length >= 3) {
        const pts = pointsRef.current
        finishShape([...pts, pts[0]], 'polygon')
        pointsRef.current = []
        setHint('Click to add polygon points')
      }
    })

    map.on('mousemove', (e: any) => {
      const { lng, lat } = e.lngLat
      if (tool === 'rectangle' && startRef.current) {
        const [sLng, sLat] = startRef.current
        renderPoly([[sLng, sLat], [lng, sLat], [lng, lat], [sLng, lat], [sLng, sLat]])
      } else if (tool === 'circle' && startRef.current) {
        const [cLng, cLat] = startRef.current
        const dx = lng - cLng, dy = lat - cLat
        const r = Math.sqrt(dx * dx + dy * dy)
        const ring: [number, number][] = []
        for (let i = 0; i <= 64; i++) {
          const a = (i / 64) * 2 * Math.PI
          ring.push([cLng + r * Math.cos(a), cLat + r * Math.sin(a)])
        }
        renderPoly(ring)
      } else if (tool === 'polygon' && pointsRef.current.length > 0) {
        renderPoly([...pointsRef.current, [lng, lat]])
      }
    })

    return () => { map.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = farms.map((farm) => {
      const el = document.createElement('div')
      el.innerHTML = '<div style="background:#00d4a0;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer" title="' + farm.name + '" />'
      el.onclick = () => onFarmClick?.(farm)
      return new maplibregl.Marker({ element: el }).setLngLat([farm.location.lng, farm.location.lat]).addTo(map)
    })
  }, [farms, onFarmClick])

  useEffect(() => {
    const hints: Record<Tool, string> = {
      point: 'Click on map to add farm',
      rectangle: 'Click first corner',
      circle: 'Click center of circle',
      polygon: 'Click to add points (double-click to finish)',
    }
    setHint(hints[tool])
    startRef.current = null
    pointsRef.current = []
    const map = mapRef.current
    if (map?.getSource('preview')) {
      map.removeLayer('preview'); map.removeLayer('preview-line'); map.removeSource('preview')
    }
    if (map?.getSource('final')) {
      map.removeLayer('final'); map.removeLayer('final-line'); map.removeSource('final')
    }
  }, [tool])

  function renderPreview() {
    if (pointsRef.current.length < 2) return
    renderPoly([...pointsRef.current, pointsRef.current[0]])
  }

  function renderPoly(ring: [number, number][]) {
    const map = mapRef.current
    if (!map) return
    if (map.getSource('preview')) {
      map.getSource('preview').setData({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } })
    } else {
      map.addSource('preview', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } } })
      map.addLayer({ id: 'preview', type: 'fill', source: 'preview', paint: { 'fill-color': '#00d4a0', 'fill-opacity': 0.3 } })
      map.addLayer({ id: 'preview-line', type: 'line', source: 'preview', paint: { 'line-color': '#00d4a0', 'line-width': 2 } })
    }
  }

  function finishShape(ring: [number, number][], shape: string) {
    const map = mapRef.current
    if (!map) return
    if (map.getSource('preview')) {
      map.removeLayer('preview'); map.removeLayer('preview-line'); map.removeSource('preview')
    }
    if (map.getSource('final')) {
      map.removeLayer('final'); map.removeLayer('final-line'); map.removeSource('final')
    }
    map.addSource('final', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } } })
    map.addLayer({ id: 'final', type: 'fill', source: 'final', paint: { 'fill-color': '#00d4a0', 'fill-opacity': 0.4 } })
    map.addLayer({ id: 'final-line', type: 'line', source: 'final', paint: { 'line-color': '#00d4a0', 'line-width': 3 } })

    const R = 6378137
    const rad = (d: number) => (d * Math.PI) / 180
    let area = 0
    for (let i = 0; i < ring.length - 1; i++) {
      area += rad(ring[i + 1][0] - ring[i][0]) * (2 + Math.sin(rad(ring[i][1])) + Math.sin(rad(ring[i + 1][1])))
    }
    const area_ha = Math.round((Math.abs(area * R * R) / 2 / 10000) * 100) / 100

    let sumLat = 0, sumLng = 0
    ring.forEach(([lng, lat]) => { sumLat += lat; sumLng += lng })
    onAreaSelect?.({ lat: sumLat / ring.length, lng: sumLng / ring.length, area_ha })
  }

  const ToolBtn = ({ t, icon, label }: { t: Tool; icon: string; label: string }) => (
    <button className={`map-tool-btn ${tool === t ? 'active' : ''}`} onClick={() => setTool(t)}>
      {icon} {label}
    </button>
  )

  return (
    <div className="map-wrapper">
      <div ref={container} className="map-container" />
      <div className="map-toolbar">
        <ToolBtn t="point" icon="📍" label="Point" />
        <ToolBtn t="rectangle" icon="▬" label="Rectangle" />
        <ToolBtn t="circle" icon="⭕" label="Circle" />
        <ToolBtn t="polygon" icon="⬠" label="Polygon" />
      </div>
      <div className="map-hint">{hint}</div>
    </div>
  )
}
