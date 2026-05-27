import { useEffect, useId, useMemo } from "react"
import { Map, useMap } from "@/components/ui/map"

function HeatLayer({ points }) {
  const { map, isLoaded } = useMap()
  const baseId = useId()
  const safeId = useMemo(() => baseId.replace(/[^a-zA-Z0-9_-]/g, ""), [baseId])
  const sourceId = `heatmap-source-${safeId}`
  const layerId = `heatmap-layer-${safeId}`

  useEffect(() => {
    if (!map || !isLoaded) return

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    })

    map.addLayer({
      id: layerId,
      type: "heatmap",
      source: sourceId,
      maxzoom: 17,
      paint: {
        "heatmap-weight": ["interpolate", ["linear"], ["coalesce", ["get", "intensity"], 0], 0, 0, 1, 1],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 12, 2.5],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 8, 12, 18, 16, 28],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(30,58,138,0)",
          0.25,
          "rgba(30,58,138,0.55)",
          0.45,
          "rgba(245,158,11,0.7)",
          0.7,
          "rgba(239,68,68,0.8)",
          1,
          "rgba(127,29,29,0.9)",
        ],
        "heatmap-opacity": 0.9,
      },
    })

    return () => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // ignore
      }
    }
  }, [map, isLoaded, layerId, sourceId])

  useEffect(() => {
    if (!map || !isLoaded) return

    const source = map.getSource(sourceId)
    if (!source) return

    const features = (points || []).map((point) => ({
      type: "Feature",
      properties: {
        intensity: point.intensity ?? 1,
      },
      geometry: {
        type: "Point",
        coordinates: [point.lng, point.lat],
      },
    }))

    source.setData({
      type: "FeatureCollection",
      features,
    })
  }, [points, map, isLoaded, sourceId])

  return null
}

/**
 * Incident Heatmap using mapcn (MapLibre heatmap layer).
 * Fetches data from the /api/reports/heatmap admin endpoint.
 * Falls back to empty map if backend is unreachable.
 */
function IncidentHeatmapView({ heatPoints = [] }) {
  return (
    <Map
      center={[125.1667, 6.1167]}
      zoom={12}
      minZoom={11}
      maxZoom={17}
      className="h-full w-full"
      theme="light"
      maxBounds={[124.9, 5.9, 125.4, 6.3]}
      maxBoundsViscosity={1.0}
    >
      <HeatLayer points={heatPoints} />
    </Map>
  )
}

export default IncidentHeatmapView
