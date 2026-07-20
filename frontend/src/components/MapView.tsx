import { useEffect, useRef } from 'react'
import type { Farm } from '@/types'

interface Props { farms: Farm[]; onFarmClick: (farm: Farm) => void }

export default function MapView({ farms, onFarmClick }: Props) {
  const container = useRef<HTMLDivElement>(null)

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
              tileSize: 256,
              attribution: '&copy; Esri',
              maxzoom: 19,
            },
          },
          layers: [{ id: 'satellite', type: 'raster', source: 'esri-satellite' }],
        },
        center: [78, 22],
        zoom: 4.5,
        maxZoom: 19,
        attributionControl: false,
      })
      map.addControl(new maplibregl.NavigationControl(), 'top-right')

      farms.forEach((farm) => {
        const el = document.createElement('div')
        el.className = 'map-marker'
        el.innerHTML = '📍'
        el.style.cssText = 'font-size:20px;cursor:pointer;'
        el.onclick = () => onFarmClick(farm)
        new maplibregl.Marker({ element: el }).setLngLat([farm.location.lng, farm.location.lat]).addTo(map)
      })

      return () => map.remove()
    })
  }, [farms, onFarmClick])

  return <div ref={container} style={{ width: '100%', height: '400px', borderRadius: 12 }} />
}
