import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Props {
  lat: number
  lng: number
}

export default function SatelliteViewer({ lat, lng }: Props) {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadImage = async () => {
    setLoading(true)
    setError('')
    try {
      const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`
      const r = await fetch(`${API}/api/satellite/true-color?bbox=${bbox}`)
      const data = await r.json()
      if (data.image) setImage(data.image)
    } catch { setError('Failed to load satellite image') }
    setLoading(false)
  }

  useEffect(() => { loadImage() }, [lat, lng])

  return (
    <div className="card">
      <div className="card-header">
        <span>🛰 Sentinel-2 Satellite View</span>
        <button className="btn btn-ghost btn-sm" onClick={loadImage} disabled={loading}>Refresh</button>
      </div>
      {loading ? (
        <div className="empty-state" style={{ padding: 30 }}><div className="loading-spinner" />Fetching latest Sentinel-2 imagery...</div>
      ) : error ? (
        <div className="text-muted text-center" style={{ padding: 30 }}>{error}</div>
      ) : image ? (
        <img src={image} alt="Satellite view" style={{ width: '100%', borderRadius: 8 }} />
      ) : (
        <div className="text-muted text-center" style={{ padding: 30 }}>
          <p>Sentinel-2 satellite image will appear here.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Updates every 5 days from ESA Copernicus</p>
        </div>
      )}
      <div className="text-muted" style={{ fontSize: 11, marginTop: 8, textAlign: 'center' }}>
        Source: ESA Copernicus Sentinel-2 · Resolution: 10m · Update: every 5 days
      </div>
    </div>
  )
}
