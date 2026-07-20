import { useEffect, useRef, useState } from 'react'
import type { Farm, Field } from '@/types'

interface Props {
  farms: Farm[]
  fields?: Field[]
  onFarmClick?: (farm: Farm) => void
  onMapClick?: (lat: number, lng: number) => void
  selectMode?: boolean
}

export default function MapView({ farms, fields, onFarmClick, onMapClick, selectMode }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!container.current) return
    import('maplibre-gl').then(({ default: maplibregl }) => {
      const map = new maplibregl.Map({
        container: container.current!,
        style: {
          version: 8,
          sources: {
            'esri-satellite': {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256, attribution: '&copy; Esri', maxzoom: 19,
            },
          },
          layers: [{ id: 'satellite', type: 'raster', source: 'esri-satellite' }],
        },
        center: [78, 22], zoom: 4.5, maxZoom: 19,
      })
      map.addControl(new maplibregl.NavigationControl(), 'top-right')

      map.on('click', (e) => {
        if (onMapClick) onMapClick(e.lngLat.lat, e.lngLat.lng)
      })

      map.on('load', () => setMapReady(true))

      if (selectMode) map.getCanvas().style.cursor = 'crosshair'

      return () => map.remove()
    })
  }, [])

  // Add farm markers
  useEffect(() => {
    if (!mapReady || !container.current) return
    // Need to re-import to get map instance
    import('maplibre-gl').then(({ default: maplibregl }) => {
      const mapEl = container.current?.querySelector('.maplibregl-map') as any
      if (!mapEl?._map) return
      const map = mapEl._map

      // Clear existing markers
      document.querySelectorAll('.map-marker').forEach(el => el.remove())

      farms.forEach((farm) => {
        const el = document.createElement('div')
        el.className = 'map-marker'
        el.innerHTML = '📍'
        el.title = farm.name
        el.style.cssText = 'font-size:22px;cursor:pointer;'
        el.onclick = () => onFarmClick?.(farm)
        new maplibregl.Marker({ element: el }).setLngLat([farm.location.lng, farm.location.lat]).addTo(map)
      })
    })
  }, [farms, mapReady])

  return <div ref={container} className="map-container" />
}
