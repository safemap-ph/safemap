import { MapPin } from "lucide-react"

function RecurringHotspots() {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 py-4 px-5">
      <div className="flex items-center gap-2 mb-5">
        <MapPin className="w-4 h-4 text-[#1e3a8a]" />
        <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] leading-tight">Recurring Hotspots</h2>
      </div>

      <div className="space-y-5">
        {/* This section will be populated with live data when the backend provides it. */}
      </div>
    </div>
  )
}

export default RecurringHotspots
