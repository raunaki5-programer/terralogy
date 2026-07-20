import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null)

  useEffect(() => {
    fetch(`${API}/api/weather?lat=28.6&lon=77.2`).then(r => r.json()).then(setWeather).catch(() => {})
  }, [])

  if (!weather?.current) return null
  const c = weather.current
  const codes: Record<number, string> = { 0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️', 45: '🌫', 51: '🌦', 61: '🌧', 71: '🌨', 95: '⛈' }
  const icon = codes[c.weather_code] || '🌤'

  return (
    <div className="weather-widget">
      <div className="weather-icon">{icon}</div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{c.temperature_2m}°C</div>
        <div className="text-muted" style={{ fontSize: 12 }}>{c.relative_humidity_2m}% humidity</div>
      </div>
    </div>
  )
}
