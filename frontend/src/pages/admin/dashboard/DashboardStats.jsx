import Skeleton from "@/components/ui/Skeleton"

function DashboardStats({ stats, loading = false }) {
  const renderValue = (value) => {
    if (loading) {
      return <Skeleton className="h-7 w-16" />
    }
    return <span className="text-[#1e3a8a] text-[28px] font-black font-['DM_Sans'] leading-none">{value ?? 0}</span>
  }

  return (
    <div className="w-full max-w-sm px-4 mt-6 space-y-3">
      {/* Total Reports */}
      <div className="w-full h-20 bg-white rounded-xl shadow-[0px_0px_10px_rgba(0,0,0,0.03)] border-l-4 border-[#00c853] flex flex-col justify-center px-5">
        <div className="text-gray-400 text-[10px] font-bold font-['DM_Sans'] mb-0.5 uppercase">Total Reports</div>
        <div className="flex items-baseline gap-2">{renderValue(stats?.total)}</div>
      </div>

      {/* Pending Review */}
      <div className="w-full h-20 bg-white rounded-xl shadow-[0px_0px_10px_rgba(0,0,0,0.03)] border-l-4 border-amber-500 flex flex-col justify-center px-5">
        <div className="text-gray-400 text-[10px] font-bold font-['DM_Sans'] mb-0.5 uppercase">Pending Review</div>
        <div className="flex items-baseline gap-2">{renderValue(stats?.pending_review)}</div>
      </div>

      {/* Resolved Reports */}
      <div className="w-full h-20 bg-white rounded-xl shadow-[0px_0px_10px_rgba(0,0,0,0.03)] border-l-4 border-green-500 flex flex-col justify-center px-5">
        <div className="text-gray-400 text-[10px] font-bold font-['DM_Sans'] mb-0.5 uppercase">Resolved Reports</div>
        <div className="flex items-baseline gap-2">{renderValue(stats?.pnp_verified)}</div>
      </div>
    </div>
  )
}

export default DashboardStats
