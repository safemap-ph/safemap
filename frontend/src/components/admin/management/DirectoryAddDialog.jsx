import { useCallback, useEffect, useRef, useState } from "react"
import { X, MapPin, Phone, Building2, Loader2 } from "lucide-react"
import { Map, MapMarker, MarkerContent, MapControls, useMap } from "@/components/ui/map"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx"
import { API_BASE } from "@/lib/api-base"
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

export default function DirectoryAddDialog({ isOpen, onClose, onAdd, editContact }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    type: "hospital",
    location: "",
    lat: DEFAULT_COORDS.lat.toFixed(6),
    lng: DEFAULT_COORDS.lng.toFixed(6),
  })
  const [isResolvingAddress, setIsResolvingAddress] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
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

  const handleMapPick = useCallback(
    (lat, lng) => {
      updateCoords(lat, lng)
      const coordsKey = `${lat.toFixed(6)},${lng.toFixed(6)}`
      if (lastGeocodedCoordsRef.current === coordsKey) return
      lastGeocodedCoordsRef.current = coordsKey
      reverseGeocode(lat, lng)
    },
    [reverseGeocode, updateCoords]
  )

  useEffect(() => {
    if (isOpen) {
      if (editContact) {
        let rawLat = DEFAULT_COORDS.lat
        let rawLng = DEFAULT_COORDS.lng

        if (editContact.latitude !== undefined && editContact.latitude !== null) {
          rawLat = editContact.latitude
        } else if (editContact.location?.latitude !== undefined && editContact.location?.latitude !== null) {
          rawLat = editContact.location.latitude
        } else if (editContact.lat !== undefined && editContact.lat !== null) {
          const parsed = parseFloat(editContact.lat)
          if (!isNaN(parsed)) rawLat = parsed
        }

        if (editContact.longitude !== undefined && editContact.longitude !== null) {
          rawLng = editContact.longitude
        } else if (editContact.location?.longitude !== undefined && editContact.location?.longitude !== null) {
          rawLng = editContact.location.longitude
        } else if (editContact.lng !== undefined && editContact.lng !== null) {
          const parsed = parseFloat(editContact.lng)
          if (!isNaN(parsed)) rawLng = parsed
        }

        setFormData({
          name: editContact.name || "",
          phone: editContact.phone || "",
          type: editContact.category || editContact.type?.toLowerCase() || "hospital",
          location: editContact.address || editContact.location || "",
          lat: rawLat.toFixed(6),
          lng: rawLng.toFixed(6),
        })
      } else {
        setFormData({
          name: "",
          phone: "",
          type: "hospital",
          location: "",
          lat: DEFAULT_COORDS.lat.toFixed(6),
          lng: DEFAULT_COORDS.lng.toFixed(6),
        })
      }
      setErrors({})
      setSubmitError("")
    }
  }, [isOpen, editContact])

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError("")

    const token = localStorage.getItem("token")
    const isEdit = !!editContact
    const method = isEdit ? "PUT" : "POST"
    const url = isEdit ? `${API_BASE}/help/contacts/${editContact.id}` : `${API_BASE}/help/contacts`

    const payload = {
      name: formData.name,
      phone: formData.phone,
      address: formData.location || "Pending Location",
      latitude: formData.lat ? parseFloat(formData.lat) : 0,
      longitude: formData.lng ? parseFloat(formData.lng) : 0,
      category: formData.type.toLowerCase().replace(" ", "_"),
      category_label: formData.type,
      description: `Contact for ${formData.name}`,
      is_24_7: true,
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Server error ${res.status}`)
      }

      const data = await res.json()
      onAdd(data.contact || payload)
    } catch (err) {
      setSubmitError(err.message || "Failed to save. Please try again.")
      setIsSubmitting(false)
      return
    }

    // Reset form on success
    geocodeRequestRef.current += 1
    lastGeocodedCoordsRef.current = ""
    setIsResolvingAddress(false)
    setIsSubmitting(false)
    setSubmitError("")
    setGeocodeHint("")
    setFormData({
      name: "",
      phone: "",
      type: "hospital",
      location: "",
      lat: "",
      lng: "",
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-[680px] overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-white p-5 text-center relative border-b border-slate-200">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 className="text-[#1f295b] w-6 h-6" />
          </div>
          <h2 className="text-slate-900 text-lg font-bold font-['DM_Sans'] tracking-wide">
            {editContact ? "Edit Directory Entry" : "Add Directory Entry"}
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            {editContact ? "Modify an existing organizational contact" : "Create a new organizational contact"}
          </p>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:font-normal focus:border-[#1f295b] focus:ring-1 focus:ring-[#1f295b] outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-slate-700 text-[11px] font-bold font-['DM_Sans'] uppercase tracking-wider mb-1.5">
                Category Type
              </label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="w-full h-12 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-800 bg-white focus:border-[#1f295b] focus:ring-1 focus:ring-[#1f295b] outline-none transition-all shadow-sm">
                  <SelectValue placeholder="Select category type" />
                </SelectTrigger>
                <SelectContent className="w-full min-w-full">
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="police">Police</SelectItem>
                  <SelectItem value="pnp">PNP Police</SelectItem>
                  <SelectItem value="wcpd">WCPD</SelectItem>
                  <SelectItem value="vawc">VAWC</SelectItem>
                  <SelectItem value="fire">Fire / BFP</SelectItem>
                  <SelectItem value="rescue">Rescue</SelectItem>
                  <SelectItem value="dswd">DSWD</SelectItem>
                  <SelectItem value="disaster">Disaster / CDRRMO</SelectItem>
                  <SelectItem value="emergency">Emergency / 911</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="relative mb-3">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Full address"
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-800 placeholder:font-normal focus:border-[#1f295b] focus:ring-1 focus:ring-[#1f295b] outline-none transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-2">
              <span>Pin the location on the map to auto-fill the address.</span>
              {isResolvingAddress && (
                <span className="flex items-center gap-1 text-slate-500">
                  <Loader2 size={12} className="animate-spin" /> Updating
                </span>
              )}
            </div>
            <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-200">
              <Map center={[markerLng, markerLat]} zoom={14} className="h-full w-full" theme="light">
                <MapControls
                  position="top-right"
                  showLocate
                  onLocate={({ latitude, longitude }) => handleMapPick(latitude, longitude)}
                />
                <MapClickCapture onPick={handleMapPick} />
                <MapMarker
                  longitude={markerLng}
                  latitude={markerLat}
                  draggable
                  onDragEnd={({ lat, lng }) => handleMapPick(lat, lng)}
                >
                  <MarkerContent />
                </MapMarker>
              </Map>
            </div>
            {errors.coords && <p className="text-[10px] text-red-600 font-medium mt-2">{errors.coords}</p>}
            {geocodeHint && <p className="text-[10px] text-slate-500 font-medium mt-2">{geocodeHint}</p>}
          </div>

          <div className="px-6 pt-3 pb-4 bg-white border-t border-slate-100 shrink-0">
            {submitError && (
              <p className="text-[11px] text-red-600 font-medium mb-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1f295b] text-white py-3.5 rounded-xl font-bold font-['DM_Sans'] shadow-md shadow-[#1f295b]/30 hover:bg-[#151c3d] hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : editContact ? (
                "Save Changes"
              ) : (
                "Add to Directory"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
