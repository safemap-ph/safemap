import { MapPin } from "lucide-react"
import Skeleton from "@/components/ui/Skeleton"

const severityStyles = {
  critical: { border: "border-red-500", badge: "bg-red-100 text-red-500" },
  high: { border: "border-orange-400", badge: "bg-orange-100 text-orange-500" },
  medium: { border: "border-amber-400", badge: "bg-amber-100 text-amber-600" },
  low: { border: "border-slate-300", badge: "bg-slate-100 text-slate-600" },
}

function RecurringHotspots({ items = [], loading = false }) {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 py-4 px-5">
      <div className="flex items-center gap-2 mb-5">
        <MapPin className="w-4 h-4 text-[#1e3a8a]" />
        <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] leading-tight">Recurring Hotspots</h2>
      </div>

      <div className="space-y-5">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((row) => (
              <div key={`hotspot-skel-${row}`} className="border-l-[3px] border-slate-200 pl-4 py-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <Skeleton className="h-3 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-xs italic">
            No recurring hotspots detected (minimum 2 reports required).
          </div>
        )}
        {!loading &&
          items.map((spot) => {
            const style = severityStyles[spot.severity] || severityStyles.low
            return (
              <div key={spot.name} className={`border-l-[3px] pl-4 py-1 relative ${style.border}`}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <div className="text-zinc-800 text-xs font-bold font-['DM_Sans']">{spot.name}</div>
                    <div className="text-gray-400 text-[10px] font-normal font-['DM_Sans']">
                      {spot.count} reports in this area.
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[9px] font-bold font-['DM_Sans'] ${style.badge}`}>
                    {spot.severity === "critical" ? "High Risk" : "Developing"}
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default RecurringHotspots
