import { useEffect, useRef, useState } from 'react'
import type { Farm } from '@/types'

interface Props {
  farms: Farm[]
  onFarmClick?: (farm: Farm) => void
  onAreaSelect?: (info: { lat: number; lng: number; area_ha: number; shape: string }) => void
}

type Tool = 'point' | 'rectangle' | 'polygon' | 'circle'

export default function MapView({ farms, onFarmClick, onAreaSelect }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [tool, setTool] = useState<Tool>('point')
  const pointsRef = useRef<number[][]>([])
  const startRef = useRef<number[] | null>(null)
  const [hint, setHint] = useState('Click map to add farm')

  useEffect(() => {
    if (!container.current) return
    let cancelled = false
    import('maplibre-gl').then(({ default: ml }) => {
      if (cancelled) return
      const map = new ml.Map({
        container: container.current!,
        style: { version: 8, sources: { esri: { type: 'raster', tiles: ['https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 19 } }, layers: [{ id: 'sat', type: 'raster', source: 'esri' }] },
        center: [78, 22], zoom: 4.5, maxZoom: 19,
      })
      map.addControl(new ml.NavigationControl(), 'top-right')
      mapRef.current = map

      map.on('click', (e: any) => {
        const { lat, lng } = e.lngLat
        if (tool === 'point') {
          onFarmClick?.({ id: '_new', name: 'New', location: { lat, lng }, created_at: '', field_count: 0 })
        } else if (tool === 'rectangle') {
          if (!startRef.current) {
            startRef.current = [lng, lat]
            setHint('Click opposite corner')
          } else {
            const s = startRef.current
            const ring = [[s[0], s[1]], [lng, s[1]], [lng, lat], [s[0], lat], [s[0], s[1]]]
            finishShape(ring, 'rectangle')
            startRef.current = null
            setHint('Click map to start rectangle')
          }
        } else if (tool === 'circle') {
          if (!startRef.current) {
            startRef.current = [lng, lat]
            setHint('Click edge of circle')
          } else {
            const c = startRef.current
            const dx = lng - c[0], dy = lat - c[1]
            const r = Math.sqrt(dx * dx + dy * dy)
            const ring: number[][] = []
            for (let i = 0; i <= 64; i++) {
              const a = (i / 64) * 2 * Math.PI
              ring.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)])
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
        if (tool === 'rectangle' && startRef.current) {
          const s = startRef.current
          const { lng, lat } = e.lngLat
          renderRect([s[0], s[1]], [lng, lat])
        } else if (tool === 'circle' && startRef.current) {
          const c = startRef.current
          const { lng, lat } = e.lngLat
          const dx = lng - c[0], dy = lat - c[1]
          const r = Math.sqrt(dx * dx + dy * dy)
          const ring: number[][] = []
          for (let i = 0; i <= 64; i++) {
            const a = (i / 64) * 2 * Math.PI
            ring.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)])
          }
          renderPoly(ring)
        } else if (tool === 'polygon' && pointsRef.current.length > 0) {
          renderPoly([...pointsRef.current, [e.lngLat.lng, e.lngLat.lat]])
        }
      })

      function renderRect(s: number[], e: number[]) {
        renderPoly([[s[0], s[1]], [e[0], s[1]], [e[0], e[1]], [s[0], e[1]], [s[0], s[1]]])
      }
      function renderPoly(ring: number[][]) {
        const m = mapRef.current; if (!m) return
        if (m.getSource('preview')) m.getSource('preview').setData({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } })
        else { m.addSource('preview', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } } }); m.addLayer({ id: 'preview', type: 'fill', source: 'preview', paint: { 'fill-color': '#00d4aa', 'fill-opacity': 0.3 } }); m.addLayer({ id: 'preview-line', type: 'line', source: 'preview', paint: { 'line-color': '#00d4aa', 'line-width': 2 } }) }
      }
      function renderPreview() {
        if (pointsRef.current.length < 2) return
        renderPoly([...pointsRef.current, pointsRef.current[0]])
      }

      function finishShape(ring: number[][], shape: string) {
        const m = mapRef.current; if (!m) return
        if (m.getLayer('preview')) { m.removeLayer('preview'); m.removeLayer('preview-line') }
        if (m.getSource('preview')) m.removeSource('preview')
        if (m.getLayer('final')) m.removeLayer('final')
        if (m.getSource('final')) m.removeSource('final')
        m.addSource('final', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } } })
        m.addLayer({ id: 'final', type: 'fill', source: 'final', paint: { 'fill-color': '#00d4aa', 'fill-opacity': 0.4 } })
        m.addLayer({ id: 'final-line', type: 'line', source: 'final', paint: { 'line-color': '#00d4aa', 'line-width': 3 } })
        const area = calcArea(ring)
        let sl = 0, slg = 0
        ring.forEach(p => { sl += p[1]; slg += p[0] })
        onAreaSelect?.({ lat: sl / ring.length, lng: slg / ring.length, area_ha: area, shape })
      }

      function calcArea(ring: number[][]): number {
        const R = 6378137; const rad = (d: number) => d * Math.PI / 180; let a = 0
        for (let i = 0; i < ring.length - 1; i++) {
          a += rad(ring[i + 1][0] - ring[i][0]) * (2 + Math.sin(rad(ring[i][1])) + Math.sin(rad(ring[i + 1][1])))
        }
        return Math.round(Math.abs(a * R * R / 2) / 10000 * 100) / 100
      }
    })
    return () => { cancelled = true; mapRef.current?.remove() }
  }, [])

  useEffect(() => {
    const map = mapRef.current; if (!map) return
    import('maplibre-gl').then(({ default: ml }) => {
      markersRef.current.forEach(k => k.remove())
      markersRef.current = farms.filter(f => f.id !== '_new').map(farm => {
        const el = document.createElement('div')
        el.innerHTML = '<div style="background:#00d4aa;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:pointer"></div>'
        el.title = farm.name
        el.onclick = () => onFarmClick?.(farm)
        return new ml.Marker({ element: el }).setLngLat([farm.location.lng, farm.location.lat]).addTo(map)
      })
    })
  }, [farms])

  useEffect(() => {
    const map = mapRef.current; if (!map) return
    map.getCanvas().style.cursor = tool === 'point' ? 'crosshair' : 'crosshair'
    const hints: Record<Tool, string> = { point: 'Click map to add farm', rectangle: 'Click first corner', circle: 'Click center', polygon: 'Click to add points (double-click to finish)' }
    setHint(hints[tool])
    pointsRef.current = []
    startRef.current = null
  }, [tool])

  const btn = (t: Tool, label: string, icon: string) => (
    <button onClick={() => setTool(t)} style={{ padding: '6px 10px', background: tool === t ? '#00d4aa' : 'rgba(15,23,42,0.9)', color: tool === t ? '#0a0f1a' : '#94a3b8', border: tool === t ? 'none' : '1px solid #334155', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{icon} {label}</button>
  )

  return (
    <div style={{ position: 'relative' }}>
      <div ref={container} style={{ width: '100%', height: '500px', borderRadius: 12 }} />
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {btn('point', 'Point', '📍')}
        {btn('rectangle', 'Rectangle', '▬')}
        {btn('circle', 'Circle', '⭕')}
        {btn('polygon', 'Polygon', '⬠')}
      </div>
      <div style={{ position: 'absolute', top: 10, right: 50, zIndex: 10, background: 'rgba(10,15,26,0.9)', color: '#94a3b8', padding: '4px 12px', borderRadius: 6, fontSize: 12 }}>{hint}</div>
    </div>
  )
}
