import Skeleton from "@/components/ui/Skeleton"

function CaseComposition({ items = [], loading = false }) {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 py-4 px-5">
      <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] leading-tight mb-4">Case Composition</h2>
      <div className="space-y-4">
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((row) => (
              <div key={`composition-skel-${row}`}>
                <div className="flex justify-between items-center mb-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-xs italic">No data available for case composition.</div>
        )}
        {!loading &&
          items.map((item) => (
            <div key={item.key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-800 text-[10px] font-bold font-['DM_Sans'] uppercase">{item.label}</span>
                <span className="text-[#1e3a8a] text-[11px] font-extrabold font-['DM_Sans']">{item.percent}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full">
                <div className="h-full bg-[#1e3a8a] rounded-full" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default CaseComposition
