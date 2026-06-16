import { useCallback, useEffect, useRef, useState } from "react"
import { X, MapPin, Phone, Building2 } from "lucide-react"
import { Map, MapMarker, MarkerContent, MapControls, useMap } from "@/components/ui/map"
import { createPortal } from "react-dom"

const DEFAULT_COORDS = {
  lat: 6.1167,
  lng: 125.1667,
}

function MapClickCapture({ onPick }) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded) return

    const handleClick = (event) => {
      onPick(event.lngLat.lat, event.lngLat.lng)
    }

    map.on("click", handleClick)
    return () => {
      map.off("click", handleClick)
    }
  }, [map, isLoaded, onPick])

  return null
}

export default function DirectoryAddDialog({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    type: "hospital",
    location: "",
    lat: DEFAULT_COORDS.lat.toFixed(6),
    lng: DEFAULT_COORDS.lng.toFixed(6),
  })
  const [isResolvingAddress, setIsResolvingAddress] = useState(false)
  const [geocodeHint, setGeocodeHint] = useState("")
  const [errors, setErrors] = useState({})
  const geocodeRequestRef = useRef(0)
  const lastGeocodedCoordsRef = useRef("")

  const parsedLat = parseFloat(formData.lat)
  const parsedLng = parseFloat(formData.lng)
  const hasValidCoords = Number.isFinite(parsedLat) && Number.isFinite(parsedLng)
  const markerLat = hasValidCoords ? parsedLat : DEFAULT_COORDS.lat
  const markerLng = hasValidCoords ? parsedLng : DEFAULT_COORDS.lng

  const buildAddressFromBigDataCloud = useCallback((result) => {
    const parts = [
      result?.locality,
      result?.city,
      result?.principalSubdivision,
      result?.postcode,
      result?.countryName,
    ].filter(Boolean)
    return parts.join(", ")
  }, [])

  const reverseGeocode = useCallback(
    async (lat, lng) => {
      const requestId = geocodeRequestRef.current + 1
      geocodeRequestRef.current = requestId
      setIsResolvingAddress(true)
      setGeocodeHint("")

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`
        )

        let result = null
        if (response.ok) {
          result = await response.json()
        }

        if (requestId !== geocodeRequestRef.current) return

        if (result?.display_name) {
          setFormData((prev) => ({
            ...prev,
            location: result.display_name,
          }))
          return
        }

        const fallbackResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&localityLanguage=en`
        )

        if (requestId !== geocodeRequestRef.current) return

        if (!fallbackResponse.ok) {
          throw new Error("Fallback reverse geocoding request failed")
        }

        const fallbackResult = await fallbackResponse.json()
        const fallbackAddress = buildAddressFromBigDataCloud(fallbackResult)

        if (fallbackAddress) {
          setFormData((prev) => ({
            ...prev,
            location: fallbackAddress,
          }))
        } else {
          setGeocodeHint("No address found from this pin. You can enter it manually.")
        }
      } catch (error) {
        if (requestId !== geocodeRequestRef.current) return
        setGeocodeHint("Unable to auto-fill address right now. You can still type the address manually.")
      } finally {
        if (requestId === geocodeRequestRef.current) {
          setIsResolvingAddress(false)
        }
      }
    },
    [buildAddressFromBigDataCloud]
  )

  const updateCoords = useCallback((lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }))
    setErrors((prev) => ({ ...prev, coords: undefined }))
  }, [])

  useEffect(() => {
    if (!hasValidCoords || !isOpen) return

    const lat = Number(parsedLat.toFixed(6))
    const lng = Number(parsedLng.toFixed(6))
    const key = `${lat},${lng}`

    if (key === lastGeocodedCoordsRef.current) return

    lastGeocodedCoordsRef.current = key
    void reverseGeocode(lat, lng)
  }, [hasValidCoords, parsedLat, parsedLng, reverseGeocode, isOpen])

  if (!isOpen) return null

  const validateForm = () => {
    const nextErrors = {}

    if (!formData.name.trim()) {
      nextErrors.name = "Organization name is required."
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Contact number is required."
    }

    if (!formData.location.trim()) {
      nextErrors.location = "Full address is required."
    }

    if (!hasValidCoords) {
      nextErrors.coords = "Please select a valid location on the map."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const newEntry = {
      name: formData.name,
      phone: formData.phone,
      address: formData.location || "Pending Location",
      latitude: formData.lat ? parseFloat(formData.lat) : 0,
      longitude: formData.lng ? parseFloat(formData.lng) : 0,
      category: formData.type,
      description: `Contact for ${formData.name}`,
      is_24_7: true,
    }

    onAdd(newEntry)
    geocodeRequestRef.current += 1
    lastGeocodedCoordsRef.current = ""
    setIsResolvingAddress(false)
    setGeocodeHint("")
    setFormData({
      name: "",
      phone: "",
      type: "hospital",
      location: "",
      lat: DEFAULT_COORDS.lat.toFixed(6),
      lng: DEFAULT_COORDS.lng.toFixed(6),
    })
    setErrors({})
    onClose()
  }

  if (typeof document === "undefined") return null

  return createPortal(
    <div
      className="fixed inset-0 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      style={{ zIndex: 2147483647 }}
    >
      <div className="bg-white rounded-3xl w-full max-w-90 h-[calc(100dvh-1.5rem)] sm:h-auto sm:max-h-[92vh] overflow-hidden shadow-2xl relative flex flex-col my-auto">
        {/* Header */}
        <div className="bg-[#1f295b] p-5 text-center relative border-b-4 border-blue-400 shrink-0">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <h2 className="text-white text-lg font-bold font-['DM_Sans'] tracking-wide">Add Directory Entry</h2>
          <p className="text-[#a4b4f0] text-xs mt-1 font-medium">Create a new organizational contact</p>
        </div>

        {/* Body Form */}
        <form id="directory-add-form" onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
          <div className="px-6 pt-6 pb-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div>
              <label className="block text-slate-700 text-[11px] font-bold font-['DM_Sans'] uppercase tracking-wider mb-1.5">
                Organization Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Gensan Medical Center"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                onInput={() => setErrors((prev) => ({ ...prev, name: undefined }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:font-normal focus:border-[#1f295b] focus:ring-1 focus:ring-[#1f295b] outline-none transition-all shadow-sm"
              />
              {errors.name && <p className="text-[10px] text-red-600 font-medium mt-1">{errors.name}</p>}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-slate-700 text-[11px] font-bold font-['DM_Sans'] uppercase tracking-wider mb-1.5">
                  Category Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#1f295b] bg-slate-50 focus:border-[#1f295b] focus:ring-1 focus:ring-[#1f295b] outline-none transition-all shadow-sm appearance-none"
                >
                  <option value="hospital">Hospital</option>
                  <option value="police">Police</option>
                  <option value="fire">Fire / BFP</option>
                  <option value="rescue">Rescue</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-slate-700 text-[11px] font-bold font-['DM_Sans'] uppercase tracking-wider mb-1.5">
                  Contact *
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="text"
                    placeholder="Number"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                      })
                      setErrors((prev) => ({ ...prev, phone: undefined }))
                    }}
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-3 text-sm font-bold text-slate-800 placeholder:font-normal focus:border-[#1f295b] focus:ring-1 focus:ring-[#1f295b] outline-none transition-all shadow-sm"
                  />
                </div>
                {errors.phone && <p className="text-[10px] text-red-600 font-medium mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-slate-700 text-[11px] font-bold font-['DM_Sans'] uppercase tracking-wider mb-1.5">
                Location Address
              </label>
              <div className="mb-3 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <div className="h-40 w-full">
                  <Map center={[markerLng, markerLat]} zoom={13} className="h-full w-full" theme="light">
                    <MapClickCapture onPick={updateCoords} />
                    <MapControls
                      position="top-right"
                      showZoom={true}
                      showLocate={true}
                      onLocate={(coords) => updateCoords(coords.latitude, coords.longitude)}
                    />
                    <MapMarker
                      longitude={markerLng}
                      latitude={markerLat}
                      draggable={true}
                      onDragEnd={(coords) => updateCoords(coords.lat, coords.lng)}
                    >
                      <MarkerContent />
                    </MapMarker>
                  </Map>
                </div>
                <div className="px-3 py-2 border-t border-slate-200 text-[10px] text-slate-500 font-medium">
                  Click on the map, drag the pin, or use the locate button. Manual address and coordinates are still
                  available below.
                </div>
              </div>
              <div className="relative mb-3">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Full address"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      location: e.target.value,
                    })
                    setErrors((prev) => ({ ...prev, location: undefined }))
                  }}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-800 placeholder:font-normal focus:border-[#1f295b] focus:ring-1 focus:ring-[#1f295b] outline-none transition-all shadow-sm"
                />
              </div>
              {errors.location && <p className="text-[10px] text-red-600 font-medium mb-2">{errors.location}</p>}
              <p className="text-[10px] font-medium text-slate-500 mb-3">
                {isResolvingAddress
                  ? "Auto-filling address from selected map pin..."
                  : geocodeHint || "Tip: picking a point on the map will auto-fill this address."}
              </p>
              {errors.coords && <p className="text-[10px] text-red-600 font-medium">{errors.coords}</p>}
            </div>
          </div>

          <div className="px-6 pt-3 pb-4 bg-white border-t border-slate-100 shrink-0">
            <button
              type="submit"
              className="w-full bg-[#1f295b] text-white py-3.5 rounded-xl font-bold font-['DM_Sans'] shadow-md shadow-[#1f295b]/30 hover:bg-[#151c3d] hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Add to Directory
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
