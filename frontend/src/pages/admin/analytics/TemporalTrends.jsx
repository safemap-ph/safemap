import Skeleton from "@/components/ui/Skeleton"

function TemporalTrends({ series = [], loading = false }) {
  const maxValue = Math.max(1, ...series.map((item) => Math.max(item.newCount || 0, item.resolvedCount || 0)))

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 py-4 px-5">
      <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] leading-tight">Temporal Case Trends</h2>
      <p className="text-gray-400 text-[10px] font-normal font-['DM_Sans'] mb-4">
        Comparison of reported cases vs resolution velocity
      </p>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#1e3a8a]" />
          <span className="text-gray-400 text-[10px] font-medium font-['DM_Sans']">New Reports</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full border border-[#1e3a8a] bg-white" />
          <span className="text-gray-400 text-[10px] font-medium font-['DM_Sans']">Resolved Cases</span>
        </div>
      </div>

      {loading && (
        <div className="relative h-40 w-full flex items-end justify-between px-2">
          <div className="absolute inset-0 flex flex-col justify-between p-0 m-0 z-0">
            {[100, 80, 60, 40, 20, 0].map((val) => (
              <div key={val} className="w-full flex items-center gap-2">
                <span className="text-gray-300 text-[9px] w-6 text-right mb-px">{val}</span>
                <div className="flex-1 h-px border-b border-dashed border-gray-200" />
              </div>
            ))}
          </div>

          <div className="relative z-10 w-full h-32 flex items-end justify-around ml-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((bar) => (
              <div key={`trend-skel-${bar}`} className="flex flex-col items-center gap-1">
                <div className="flex items-end gap-1">
                  <Skeleton className="w-3 h-20 rounded-t-sm" />
                  <Skeleton className="w-3 h-14 rounded-t-sm" />
                </div>
                <Skeleton className="h-2 w-8" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && series.length === 0 && (
        <div className="space-y-4 min-h-25 flex items-center justify-center">
          <span className="text-gray-400 text-[10px] italic">No trend data available.</span>
        </div>
      )}

      {!loading && series.length > 0 && (
        <>
          <div className="relative h-40 w-full flex items-end justify-between px-2">
            <div className="absolute inset-0 flex flex-col justify-between p-0 m-0 z-0">
              {[100, 80, 60, 40, 20, 0].map((val) => (
                <div key={val} className="w-full flex items-center gap-2">
                  <span className="text-gray-400 text-[9px] w-6 text-right mb-px">{val}</span>
                  <div className="flex-1 h-px border-b border-dashed border-gray-200" />
                </div>
              ))}
            </div>

            <div className="relative z-10 w-full h-32 flex items-end justify-around ml-6 gap-2">
              {series.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1">
                  <div className="flex items-end gap-1">
                    <div
                      className="w-3 bg-[#1e3a8a] rounded-t-sm"
                      style={{ height: `${Math.round((item.newCount / maxValue) * 100)}%` }}
                    />
                    <div
                      className="w-3 border border-[#1e3a8a] bg-white rounded-t-sm"
                      style={{ height: `${Math.round((item.resolvedCount / maxValue) * 100)}%` }}
                    />
                  </div>
                  <span className="text-gray-500 text-[9px] font-['DM_Sans']">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TemporalTrends
