import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet.heat'

/**
 * Inner component that actually renders the heat layer.
 * Must live inside <MapContainer> so it can call useMap().
 */
function HeatLayer({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!points || points.length === 0) return

    // Transform [{lat, lng, intensity}] → [[lat, lng, intensity]]
    const latLngs = points.map(p => [p.lat, p.lng, p.intensity])

    const heat = L.heatLayer(latLngs, {
      radius:    25,
      blur:      18,
      maxZoom:   17,
      max:       1.0,
      gradient: {
        0.0: '#1e3a8a', // deep blue – sparse
        0.4: '#f59e0b', // amber – warning
        0.7: '#ef4444', // red – critical
        1.0: '#7f1d1d', // dark red – extreme
      }
    }).addTo(map)

    return () => {
      map.removeLayer(heat)
    }
  }, [points, map])

  return null
}

/**
 * Incident Heatmap using leaflet.heat.
 * Fetches data from the /api/reports/heatmap admin endpoint.
 * Falls back to empty map if backend is unreachable.
 */
function IncidentHeatmapView({ heatPoints = [] }) {
  return (
    <MapContainer
      center={[6.1167, 125.1667]}
      zoom={12}
      className="h-full w-full"
      zoomControl={false}
      maxBounds={[[5.9, 124.9], [6.3, 125.4]]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HeatLayer points={heatPoints} />
    </MapContainer>
  )
}

export default IncidentHeatmapView
