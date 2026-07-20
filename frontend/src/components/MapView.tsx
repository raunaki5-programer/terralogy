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
    import('maplibre-gl').then(({ default: maplibregl }) => {
      if (cancelled || !container.current) return
      const map = new maplibregl.Map({
        container: container.current,
        style: {
          version: 8,
          sources: { 'esri': { type: 'raster', tiles: ['https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 19 } },
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
    if (!mapRef.current) return
    const map = mapRef.current
    import('maplibre-gl').then(({ default: maplibregl }) => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      farms.forEach((farm) => {
        const el = document.createElement('div')
        el.innerHTML = '<div style="background:#00d4aa;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);cursor:pointer" />'
        el.title = farm.name
        el.onclick = () => onFarmClick?.(farm)
        const marker = new maplibregl.Marker({ element: el }).setLngLat([farm.location.lng, farm.location.lat]).addTo(map)
        markersRef.current.push(marker)
      })
    })
  }, [farms, onFarmClick])

  return <div ref={container} style={{ width: '100%', height: '500px' }} />
}
