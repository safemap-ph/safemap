import Skeleton from "@/components/ui/Skeleton"

const severityClasses = {
  Critical: "bg-red-100 text-red-500",
  Warning: "bg-yellow-100 text-yellow-600",
  Info: "bg-blue-100 text-blue-600",
}

function CriticalAnomalies({ items = [], loading = false }) {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 py-4 px-5">
      <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] leading-tight mb-4">
        Critical Anomalies & Priority Flags
      </h2>

      <div className="w-full">
        <div className="grid grid-cols-[80px_1fr_60px_60px] gap-2 pb-2 border-b border-gray-100">
          {["Flag Time", "Metric Type", "Region", "Severity"].map((h) => (
            <div key={h} className="text-gray-400 text-[9px] font-bold font-['DM_Sans']">
              {h}
            </div>
          ))}
        </div>

        {loading && (
          <div className="py-4 space-y-3">
            {[1, 2, 3].map((row) => (
              <div
                key={`anomaly-skel-${row}`}
                className="grid grid-cols-[80px_1fr_60px_60px] gap-2 py-3 border-b border-gray-100 items-center"
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="py-8 text-center">
            <span className="text-gray-400 text-[10px] italic">No active priority flags detected.</span>
          </div>
        )}

        {!loading &&
          items.map((item, index) => (
            <div
              key={`${item.metric}-${index}`}
              className="grid grid-cols-[80px_1fr_60px_60px] gap-2 py-4 border-b border-gray-100 items-center"
            >
              <div className="text-zinc-800 text-[9px] font-medium font-['DM_Sans']">{item.time}</div>
              <div className="text-[#1e3a8a] text-[10px] font-bold font-['DM_Sans'] leading-tight">{item.metric}</div>
              <div className="text-[#1e3a8a] text-[9px] font-medium font-['DM_Sans']">{item.region}</div>
              <div>
                <span
                  className={`px-1.5 py-0.5 text-[8px] font-bold font-['DM_Sans'] rounded ${
                    severityClasses[item.severity] || severityClasses.Info
                  }`}
                >
                  {item.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default CriticalAnomalies
