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
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [78, 22],
        zoom: 4.5,
        attributionControl: false
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
