import { useEffect, useRef } from 'react'
import type { Farm } from '@/types'

interface Props {
  farms: Farm[]
  onFarmClick?: (farm: Farm) => void
  onMapClick?: (lat: number, lng: number) => void
}

export default function MapView({ farms, onFarmClick, onMapClick }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!container.current) return
    let cancelled = false
    import('maplibre-gl').then((m) => {
      if (cancelled) return
      const maplibregl = m.default
      const map = new maplibregl.Map({
        container: container.current!,
        style: {
          version: 8,
          sources: { esri: { type: 'raster', tiles: ['https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 19 } },
          layers: [{ id: 'satellite', type: 'raster', source: 'esri' }],
        },
        center: [78, 22], zoom: 4.5, maxZoom: 19,
      })
      map.addControl(new maplibregl.NavigationControl(), 'top-right')
      map.on('click', (e: any) => onMapClick?.(e.lngLat.lat, e.lngLat.lng))
      mapRef.current = map
    })
    return () => { cancelled = true; mapRef.current?.remove() }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    import('maplibre-gl').then((m) => {
      const maplibregl = m.default
      markersRef.current.forEach((mk) => mk.remove())
      markersRef.current = farms.map((farm) => {
        const el = document.createElement('div')
        el.innerHTML = '<div style="background:#00d4aa;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:pointer" title="' + farm.name + '" />'
        el.onclick = () => onFarmClick?.(farm)
        return new maplibregl.Marker({ element: el }).setLngLat([farm.location.lng, farm.location.lat]).addTo(map)
      })
    })
  }, [farms])

  return <div ref={container} style={{ width: '100%', height: '500px', borderRadius: 12 }} />
}
