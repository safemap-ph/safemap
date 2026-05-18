function CriticalAnomalies() {
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

        <div className="py-8 text-center">
          <span className="text-gray-400 text-[10px] italic">No active priority flags detected.</span>
        </div>
      </div>
    </div>
  )
}

export default CriticalAnomalies
