import Skeleton from "@/components/ui/Skeleton"

function StatsCards({ stats, loading = false }) {
  const renderValue = (value) => {
    if (loading) return <Skeleton className="h-7 w-16" />
    return value ?? 0
  }

  return (
    <div className="w-full max-w-sm px-4 mt-4 space-y-3">
      {/* Total Reports */}
      <div className="w-full h-22 bg-white rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-blue-500 px-5 relative flex flex-col justify-center">
        <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase">Total Reports</div>
        <div className="text-[#1e3a8a] text-[28px] font-extrabold font-['DM_Sans'] leading-none mt-1 mb-1">
          {renderValue(stats?.total)}
        </div>
      </div>

      {/* Pending Review */}
      <div className="w-full h-22 bg-white rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-amber-500 px-5 relative flex flex-col justify-center">
        <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase">Pending Review</div>
        <div className="text-[#1e3a8a] text-[28px] font-extrabold font-['DM_Sans'] leading-none mt-1 mb-1">
          {renderValue(stats?.pending_review)}
        </div>
      </div>

      {/* Resolved */}
      <div className="w-full h-22 bg-white rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-green-500 px-5 relative flex flex-col justify-center">
        <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase">Resolved</div>
        <div className="text-[#1e3a8a] text-[28px] font-extrabold font-['DM_Sans'] leading-none mt-1 mb-1">
          {renderValue(stats?.resolved ?? stats?.pnp_verified)}
        </div>
      </div>

      {/* Dismissed */}
      <div className="w-full h-22 bg-white rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-red-500 px-5 relative flex flex-col justify-center">
        <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase">Dismissed</div>
        <div className="text-[#1e3a8a] text-[28px] font-extrabold font-['DM_Sans'] leading-none mt-1 mb-1">
          {renderValue(stats?.dismissed ?? stats?.by_status?.dismissed)}
        </div>
      </div>
    </div>
  )
}

export default StatsCards
