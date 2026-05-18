import { useState } from "react"
import { X, MapPin, Phone, Building2 } from "lucide-react"

export default function DirectoryAddDialog({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    type: "SOCIAL CARE",
    location: "",
    lat: "",
    lng: "",
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()

    const newEntry = {
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

    onAdd(newEntry)
    setFormData({
      name: "",
      phone: "",
      type: "SOCIAL CARE",
      location: "",
      lat: "",
      lng: "",
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-85 overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-[#1f295b] p-5 text-center relative border-b-4 border-blue-400">
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
                <option value="CRITICAL">Critical</option>
                <option value="REGIONAL">Regional</option>
                <option value="SOCIAL CARE">Social Care</option>
                <option value="DRAFT">Draft</option>
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-3 text-sm font-bold text-slate-800 placeholder:font-normal focus:border-[#1f295b] focus:ring-1 focus:ring-[#1f295b] outline-none transition-all shadow-sm"
                />
              </div>
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

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-slate-700 text-[11px] font-bold font-['DM_Sans'] uppercase tracking-wider mb-1.5">
                  Latitude
                </label>
                <input
                  type="text"
                  placeholder="Lat"
                  value={formData.lat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lat: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#1f295b] outline-none shadow-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-slate-700 text-[11px] font-bold font-['DM_Sans'] uppercase tracking-wider mb-1.5">
                  Longitude
                </label>
                <input
                  type="text"
                  placeholder="Lng"
                  value={formData.lng}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lng: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#1f295b] outline-none shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#1f295b] text-white py-3.5 rounded-xl font-bold font-['DM_Sans'] shadow-md shadow-[#1f295b]/30 hover:bg-[#151c3d] hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Add to Directory
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
