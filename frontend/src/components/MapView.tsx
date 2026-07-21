import { useEffect, useRef, useState } from 'react'
import type { Farm } from '@/types'

interface Props {
  farms: Farm[]
  onFarmClick?: (farm: Farm) => void
  onMapClick?: (lat: number, lng: number) => void
  onAreaSelect?: (info: { lat: number; lng: number; area_ha: number; shape: string }) => void
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
  const toolRef = useRef<Tool>('point')
  const clickHandlersRef = useRef({ onMapClick, onAreaSelect, onFarmClick })

  clickHandlersRef.current = { onMapClick, onAreaSelect, onFarmClick }

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
        center: [78, 22],
        zoom: 4.5,
        maxZoom: 19,
      })
      map.addControl(new ml.NavigationControl(), 'top-right')
      mapRef.current = map

      function handleClick(lng: number, lat: number) {
        const curTool = toolRef.current
        if (curTool === 'point') {
          clickHandlersRef.current.onMapClick?.(lat, lng)
        } else if (curTool === 'rectangle') {
          if (!startRef.current) {
            startRef.current = [lng, lat]
            setHint('Click opposite corner')
          } else {
            const [sLng, sLat] = startRef.current
            finishShape([[sLng, sLat], [lng, sLat], [lng, lat], [sLng, lat], [sLng, sLat]], 'rectangle')
            startRef.current = null
            setHint('Click first corner')
          }
        } else if (curTool === 'circle') {
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
        } else if (curTool === 'polygon') {
          pointsRef.current.push([lng, lat])
          setHint(`${pointsRef.current.length} points — double-click to finish`)
          if (pointsRef.current.length >= 2) {
            renderPoly([...pointsRef.current, pointsRef.current[0]])
          }
        }
      }

      map.on('click', (e: any) => {
        handleClick(e.lngLat.lng, e.lngLat.lat)
      })

      map.on('dblclick', (e: any) => {
        e.preventDefault()
        if (toolRef.current === 'polygon' && pointsRef.current.length >= 3) {
          finishShape([...pointsRef.current, pointsRef.current[0]], 'polygon')
          pointsRef.current = []
          setHint('Click to add polygon points')
        }
      })

      map.on('mousemove', (e: any) => {
        const { lng, lat } = e.lngLat
        const curTool = toolRef.current
        if (curTool === 'rectangle' && startRef.current) {
          const [sLng, sLat] = startRef.current
          renderPoly([[sLng, sLat], [lng, sLat], [lng, lat], [sLng, lat], [sLng, sLat]])
        } else if (curTool === 'circle' && startRef.current) {
          const [cLng, cLat] = startRef.current
          const dx = lng - cLng, dy = lat - cLat
          const r = Math.sqrt(dx * dx + dy * dy)
          const ring: [number, number][] = []
          for (let i = 0; i <= 64; i++) {
            const a = (i / 64) * 2 * Math.PI
            ring.push([cLng + r * Math.cos(a), cLat + r * Math.sin(a)])
          }
          renderPoly(ring)
        } else if (curTool === 'polygon' && pointsRef.current.length > 0) {
          renderPoly([...pointsRef.current, [lng, lat]])
        }
      })
    })
    return () => { cancelled = true; mapRef.current?.remove() }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    import('maplibre-gl').then(({ default: ml }) => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = farms.map((farm) => {
        const el = document.createElement('div')
        el.innerHTML = '<div style="background:#10b981;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer" title="' + farm.name + '" />'
        el.onclick = () => clickHandlersRef.current.onFarmClick?.(farm)
        return new ml.Marker({ element: el }).setLngLat([farm.location.lng, farm.location.lat]).addTo(map)
      })
    })
  }, [farms])

  useEffect(() => {
    toolRef.current = tool
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

  function renderPoly(ring: [number, number][]) {
    const map = mapRef.current
    if (!map) return
    if (map.getSource('preview')) {
      map.getSource('preview').setData({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } })
    } else {
      map.addSource('preview', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } } })
      map.addLayer({ id: 'preview', type: 'fill', source: 'preview', paint: { 'fill-color': '#10b981', 'fill-opacity': 0.3 } })
      map.addLayer({ id: 'preview-line', type: 'line', source: 'preview', paint: { 'line-color': '#10b981', 'line-width': 2 } })
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
    map.addLayer({ id: 'final', type: 'fill', source: 'final', paint: { 'fill-color': '#10b981', 'fill-opacity': 0.4 } })
    map.addLayer({ id: 'final-line', type: 'line', source: 'final', paint: { 'line-color': '#10b981', 'line-width': 3 } })

    const R = 6378137
    const rad = (d: number) => (d * Math.PI) / 180
    let area = 0
    for (let i = 0; i < ring.length - 1; i++) {
      area += rad(ring[i + 1][0] - ring[i][0]) * (2 + Math.sin(rad(ring[i][1])) + Math.sin(rad(ring[i + 1][1])))
    }
    const area_ha = Math.round((Math.abs(area * R * R) / 2 / 10000) * 100) / 100

    let sumLat = 0, sumLng = 0
    ring.forEach(([lng, lat]) => { sumLat += lat; sumLng += lng })
    clickHandlersRef.current.onAreaSelect?.({ lat: sumLat / ring.length, lng: sumLng / ring.length, area_ha, shape })
  }

  const tools: { key: Tool; icon: string; label: string }[] = [
    { key: 'point', icon: '📍', label: 'Point' },
    { key: 'rectangle', icon: '▬', label: 'Rectangle' },
    { key: 'circle', icon: '⭕', label: 'Circle' },
    { key: 'polygon', icon: '⬠', label: 'Polygon' },
  ]

  return (
    <div className="map-container">
      <div ref={container} className="map-inner" />
      <div className="map-toolbar">
        {tools.map((t) => (
          <button key={t.key} className={`map-tool ${tool === t.key ? 'active' : ''}`} onClick={() => setTool(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div className="map-hint">{hint}</div>
    </div>
  )
}
