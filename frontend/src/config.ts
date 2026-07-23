export const GOOGLE_MAPS_KEY = 'AIzaSyA8Wd_B7mJIbURNRaxw8_6xzHMrUOahsY8'
export const GOOGLE_MAPS_SESSION_URL = 'https://tile.googleapis.com/v1/createSession'
export const GOOGLE_TILE_URL = 'https://tile.googleapis.com/v1/2dtiles'

export type BasemapId = 'esri-satellite' | 'google-satellite' | 'google-hybrid' | 'google-roadmap'

export const BASEMAP_LABELS: Record<BasemapId, string> = {
  'esri-satellite': 'Esri Satellite',
  'google-satellite': 'Google Satellite',
  'google-hybrid': 'Google Hybrid',
  'google-roadmap': 'Google Roadmap',
}

export const SESSION_MAP_TYPES: Record<string, string> = {
  'google-satellite': 'satellite',
  'google-hybrid': 'hybrid',
  'google-roadmap': 'roadmap',
}
