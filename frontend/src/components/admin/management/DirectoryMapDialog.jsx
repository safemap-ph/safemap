import { X, MapPin, Phone, Building2 } from "lucide-react"
import { Map, MapMarker, MarkerContent } from "@/components/ui/map"
import { createPortal } from "react-dom"

export default function DirectoryMapDialog({ isOpen, onClose, contact }) {
  if (!isOpen || !contact) return null

  let rawLat = 6.1167
  let rawLng = 125.1667

  if (contact.latitude !== undefined && contact.latitude !== null) {
    rawLat = contact.latitude
  } else if (contact.location?.latitude !== undefined && contact.location?.latitude !== null) {
    rawLat = contact.location.latitude
  } else if (contact.lat !== undefined && contact.lat !== null) {
    const parsed = parseFloat(contact.lat)
    if (!isNaN(parsed)) rawLat = parsed
  }

  if (contact.longitude !== undefined && contact.longitude !== null) {
    rawLng = contact.longitude
  } else if (contact.location?.longitude !== undefined && contact.location?.longitude !== null) {
    rawLng = contact.location.longitude
  } else if (contact.lng !== undefined && contact.lng !== null) {
    const parsed = parseFloat(contact.lng)
    if (!isNaN(parsed)) rawLng = parsed
  }

  if (typeof document === "undefined") return null

  return createPortal(
    <div
      className="fixed inset-0 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      style={{ zIndex: 2147483647 }}
    >
      <div className="bg-white rounded-3xl w-full max-w-90 h-[calc(100dvh-1.5rem)] sm:h-auto sm:max-h-[92vh] overflow-hidden shadow-2xl relative flex flex-col my-auto border border-slate-100">
        {/* Header */}
        <div className="bg-white p-5 text-center relative border-b border-slate-200 shrink-0">
          <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 className="text-[#1f295b] w-6 h-6" />
          </div>
          <h2 className="text-slate-900 text-lg font-bold font-['DM_Sans'] tracking-wide">{contact.name}</h2>
          <p className="text-slate-500 text-xs mt-1 font-medium capitalize">
            {contact.category || contact.type || "Other"} Contact
          </p>
        </div>

        {/* Map Body */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="h-60 sm:h-80 w-full relative">
            <Map center={[rawLng, rawLat]} zoom={15} className="h-full w-full" theme="light">
              <MapMarker longitude={rawLng} latitude={rawLat}>
                <MarkerContent />
              </MapMarker>
            </Map>
          </div>

          <div className="p-5 space-y-3 bg-slate-50 border-t border-slate-200">
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Number</p>
                <p className="text-sm font-bold text-slate-800">{contact.phone || contact.phone_alt || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#1f295b] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address Location</p>
                <p className="text-sm font-bold text-slate-800 leading-snug">{contact.address || contact.location || "N/A"}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase">
                  Coordinates: {rawLat.toFixed(6)}, {rawLng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-[#1f295b] text-white py-3.5 rounded-xl font-bold font-['DM_Sans'] shadow-md shadow-[#1f295b]/30 hover:bg-[#151c3d] hover:shadow-lg transition-all active:scale-[0.98]"
          >
            Close Map Preview
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
