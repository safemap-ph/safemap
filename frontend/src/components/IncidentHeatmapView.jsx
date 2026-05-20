import { useEffect, useId, useMemo, useState } from "react"
import { Map, useMap, MapMarker, MarkerContent, MarkerTooltip, MarkerPopup } from "@/components/ui/map"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx"
import { Settings2, Sliders, Filter, Sparkles, Layers, ChevronDown, ChevronUp, Eye } from "lucide-react"

// Color configurations for categories and severities
const SEVERITY_COLORS = {
  critical: "bg-red-600 border-red-800 text-red-500",
  high: "bg-orange-500 border-orange-700 text-orange-500",
  medium: "bg-amber-400 border-amber-600 text-amber-500",
  low: "bg-green-500 border-green-700 text-green-500",
}

const CATEGORY_LABELS = {
  police: "Police / PNP",
  pnp: "Police / PNP",
  wcpd: "WCPD Station",
  medical: "Medical / Hospital",
  hospital: "Medical / Hospital",
  fire: "Fire Station",
  rescue: "Rescue / CDRRMO",
  other: "Other Incident",
}

const formatCategoryLabel = (value) => {
  if (!value) return "Unassigned"
  if (CATEGORY_LABELS[value]) return CATEGORY_LABELS[value]
  return value
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

// Local Popup Card Component for individual pin details
function IncidentPopupCard({ title, category, severity, status, barangay, city, date }) {
  const statusColors = {
    pending_review: "bg-yellow-500",
    in_progress: "bg-blue-600",
    verified: "bg-green-600",
    verified_pnp: "bg-green-600",
    dismissed: "bg-gray-500",
    false_report: "bg-red-600",
    spam: "bg-orange-600",
  }

  const statusLabels = {
    pending_review: "Pending Review",
    in_progress: "In Progress",
    verified: "Resolved",
    verified_pnp: "Verified",
    dismissed: "Dismissed",
    false_report: "False Report",
    spam: "Spam",
  }

  const severityBg = SEVERITY_COLORS[severity] || "bg-gray-500"

  return (
    <div className="min-w-[180px] p-1 font-['DM_Sans']">
      <h4 className="font-bold text-[#1f295b] text-xs leading-snug mb-1">{title}</h4>
      <p className="text-[10px] text-gray-500 mb-2">
        📍 {barangay || "Unknown"}, {city || "General Santos"}
      </p>
      <div className="flex flex-wrap gap-1 mb-1.5">
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase text-white ${severityBg}`}>
          {severity || "unassigned"}
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase text-white ${statusColors[status] || "bg-gray-500"}`}
        >
          {statusLabels[status] || status}
        </span>
      </div>
      <div className="flex justify-between items-center text-[8px] text-gray-400 mt-1 border-t border-gray-100 pt-1">
        <span>{formatCategoryLabel(category)}</span>
        {date && <span>{new Date(date).toLocaleDateString()}</span>}
      </div>
    </div>
  )
}

function HeatLayer({ points, radius, intensity, opacity }) {
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
      maxzoom: 18,
      paint: {
        "heatmap-weight": ["interpolate", ["linear"], ["coalesce", ["get", "intensity"], 0], 0, 0, 1, 1],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 12, intensity],
        "heatmap-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          Math.max(1, radius - 10),
          12,
          radius,
          16,
          radius + 10,
        ],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(30,58,138,0)",
          0.2,
          "rgba(30,58,138,0.35)",
          0.4,
          "rgba(245,158,11,0.6)",
          0.7,
          "rgba(239,68,68,0.75)",
          1,
          "rgba(127,29,29,0.9)",
        ],
        "heatmap-opacity": opacity,
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

  // React to dynamic sliders immediately without reloading the source data
  useEffect(() => {
    if (!map || !isLoaded || !map.getLayer(layerId)) return
    map.setPaintProperty(layerId, "heatmap-radius", [
      "interpolate",
      ["linear"],
      ["zoom"],
      0,
      Math.max(1, radius - 10),
      12,
      radius,
      16,
      radius + 10,
    ])
  }, [map, isLoaded, radius, layerId])

  useEffect(() => {
    if (!map || !isLoaded || !map.getLayer(layerId)) return
    map.setPaintProperty(layerId, "heatmap-intensity", [
      "interpolate",
      ["linear"],
      ["zoom"],
      0,
      intensity / 2.5,
      12,
      intensity,
    ])
  }, [map, isLoaded, intensity, layerId])

  useEffect(() => {
    if (!map || !isLoaded || !map.getLayer(layerId)) return
    map.setPaintProperty(layerId, "heatmap-opacity", opacity)
  }, [map, isLoaded, opacity, layerId])

  // Sync data points when filters change
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
 * Enhanced Incident Heatmap using mapcn (MapLibre components).
 * Offers:
 * - Dynamic parameter adjustments (Radius, Intensity, Opacity)
 * - Severity and Category filters
 * - Seamless macro-to-micro view (Heatmap fades to interactive marker pins at high zoom levels)
 * - High-fidelity admin customizer dashboard panel
 */
function IncidentHeatmapView({ heatPoints = [] }) {
  // Advanced Visual Settings State
  const [radius, setRadius] = useState(18)
  const [intensity, setIntensity] = useState(2.5)
  const [opacity, setOpacity] = useState(0.8)
  const [showControls, setShowControls] = useState(true)

  // Filters & View Mode State
  const [selectedSeverity, setSelectedSeverity] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState("both") // options: heatmap, points, both
  const [zoom, setZoom] = useState(12)

  // Filter coordinates and properties
  const filteredPoints = useMemo(() => {
    return heatPoints.filter((p) => {
      const matchSeverity = selectedSeverity === "all" || p.severity === selectedSeverity
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory
      return matchSeverity && matchCategory
    })
  }, [heatPoints, selectedSeverity, selectedCategory])

  // Fade out heatmap and fade in markers as user zooms in (for 'both' mode)
  const showHeatmap = viewMode === "heatmap" || viewMode === "both"
  const showMarkers = viewMode === "points" || (viewMode === "both" && zoom >= 13.2)

  const activeFiltersCount = (selectedSeverity !== "all" ? 1 : 0) + (selectedCategory !== "all" ? 1 : 0)

  const categoryOptions = useMemo(() => {
    const values = new Set()
    heatPoints.forEach((point) => {
      if (point.category) values.add(point.category)
    })
    return Array.from(values)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: formatCategoryLabel(value) }))
  }, [heatPoints])

  return (
    <div className="relative w-full h-full">
      <Map
        center={[125.1667, 6.1167]}
        zoom={12}
        minZoom={11}
        maxZoom={18}
        className="h-full w-full"
        theme="light"
        maxBounds={[124.9, 5.9, 125.4, 6.3]}
        maxBoundsViscosity={1.0}
        onViewportChange={(vp) => setZoom(vp.zoom)}
      >
        {showHeatmap && <HeatLayer points={filteredPoints} radius={radius} intensity={intensity} opacity={opacity} />}

        {showMarkers &&
          filteredPoints.map((point, index) => {
            const pinColor = SEVERITY_COLORS[point.severity] || "bg-blue-500"
            return (
              <MapMarker key={`heat-pin-${index}`} longitude={point.lng} latitude={point.lat}>
                <MarkerContent>
                  <div className="relative flex items-center justify-center -translate-y-2 drop-shadow-md group">
                    <div
                      className={`w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-125 duration-200 ${pinColor}`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                </MarkerContent>
                <MarkerTooltip>
                  <span className="font-semibold">{point.severity?.toUpperCase()} Incident</span>
                </MarkerTooltip>
                <MarkerPopup closeButton>
                  <IncidentPopupCard
                    title={formatCategoryLabel(point.category) || "Incident Report"}
                    category={point.category}
                    severity={point.severity}
                    status={point.status}
                    barangay={point.barangay}
                    city={point.city}
                    date={point.created_at}
                  />
                </MarkerPopup>
              </MapMarker>
            )
          })}
      </Map>

      {/* Enhanced Glassmorphic Density Index / Heatmap Indicator */}
      {showHeatmap && (
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-lg p-3.5 w-44 z-[998] font-['DM_Sans'] animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="text-[#1e3a8a] text-[10px] font-bold tracking-wider uppercase mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Density Status
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-700 shadow-sm shrink-0" />
              <div className="flex flex-col">
                <span className="text-zinc-800 text-[10px] font-extrabold leading-none">Critical Zone</span>
                <span className="text-slate-500 text-[8px] font-medium mt-0.5">&gt; 15 active cases</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500 shadow-sm shrink-0" />
              <div className="flex flex-col">
                <span className="text-zinc-800 text-[10px] font-extrabold leading-none">Warning Area</span>
                <span className="text-slate-500 text-[8px] font-medium mt-0.5">5 - 14 active cases</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-blue-700 shadow-sm shrink-0" />
              <div className="flex flex-col">
                <span className="text-zinc-800 text-[10px] font-extrabold leading-none">Low Density</span>
                <span className="text-slate-500 text-[8px] font-medium mt-0.5">&lt; 5 active cases</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Glassmorphic Controls Panel */}
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-xl w-72 overflow-hidden z-[999] transition-all duration-300 font-['DM_Sans']">
        <button
          onClick={() => setShowControls(!showControls)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100 hover:bg-slate-100/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[#1e3a8a]" />
            <span className="text-zinc-800 text-xs font-bold tracking-tight">Heatmap Customizer</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#1e3a8a] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          {showControls ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>

        {showControls && (
          <div className="p-4 space-y-4 max-h-[360px] overflow-y-auto">
            {/* View Mode Segmented Picker */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" /> View Mode
              </label>
              <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5 border border-slate-200/30">
                {["heatmap", "points", "both"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex-1 text-[9px] font-bold py-1.5 rounded-md transition-all uppercase ${
                      viewMode === mode ? "bg-white text-[#1e3a8a] shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {mode === "both" ? "Combined" : mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Severity */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-400" /> Severity Filter
              </label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-2 text-zinc-800 font-bold">
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="all">🔴 All Severities</SelectItem>
                  <SelectItem value="critical">Critical Severity Only</SelectItem>
                  <SelectItem value="high">High Severity Only</SelectItem>
                  <SelectItem value="medium">Medium Severity Only</SelectItem>
                  <SelectItem value="low">Low Severity Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Category */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-400" /> Category Filter
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-2 text-zinc-800 font-bold">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="all">🔍 All Categories</SelectItem>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Heatmap Parameters */}
            {(viewMode === "heatmap" || viewMode === "both") && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                {/* Heatmap Radius Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span className="uppercase flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-slate-400" /> Radius
                    </span>
                    <span className="text-[#1e3a8a]">{radius}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="40"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1e3a8a]"
                  />
                </div>

                {/* Heatmap Intensity Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span className="uppercase flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-slate-400" /> Intensity
                    </span>
                    <span className="text-[#1e3a8a]">{intensity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={intensity}
                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1e3a8a]"
                  />
                </div>

                {/* Opacity Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span className="uppercase flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" /> Opacity
                    </span>
                    <span className="text-[#1e3a8a]">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1e3a8a]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info panel at bottom */}
        {showControls && (
          <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 flex items-center justify-between text-[9px] font-semibold text-slate-500">
            <span>Points mapped: {filteredPoints.length}</span>
            <span>Zoom: {zoom.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default IncidentHeatmapView
