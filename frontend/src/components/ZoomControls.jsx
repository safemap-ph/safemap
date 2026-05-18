import { Plus, Minus, Locate, Home } from "lucide-react"
import { useMap } from "@/components/ui/map"

function ZoomControls() {
  const { map } = useMap()

  const handleZoomIn = () => map?.zoomTo(map.getZoom() + 1, { duration: 200 })
  const handleZoomOut = () => map?.zoomTo(map.getZoom() - 1, { duration: 200 })

  const handleCityCentral = () => {
    map?.flyTo({ center: [125.1667, 6.1167], zoom: 13, duration: 800 })
  }

  const handleLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 15, duration: 1000 })
      },
      () => alert("Unable to get your location. Please enable location services.")
    )
  }

  const btn =
    "w-12 h-12 rounded-[10px] bg-white shadow-md flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <button className={btn} onClick={handleCityCentral} title="City Center">
        <Home className="w-5 h-5 text-[#1f295b]" />
      </button>
      <button className={btn} onClick={handleZoomIn} title="Zoom In">
        <Plus className="w-5 h-5 text-black" />
      </button>
      <button className={btn} onClick={handleZoomOut} title="Zoom Out">
        <Minus className="w-5 h-5 text-black" />
      </button>
      <button
        className="w-12 h-12 rounded-[10px] bg-blue-600 shadow-md flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
        onClick={handleLocation}
        title="My Location"
      >
        <Locate className="w-5 h-5 text-white" />
      </button>
    </div>
  )
}

export default ZoomControls
