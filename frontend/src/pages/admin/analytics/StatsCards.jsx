function StatsCards({ stats }) {
    return (
        <div className="w-full max-w-sm px-4 mt-4 space-y-3">
            {/* Total Reports */}
            <div className="w-full h-22 bg-white rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-blue-500 px-5 relative flex flex-col justify-center">
                <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase">
                    Total Reports
                </div>
                <div className="text-[#1e3a8a] text-[28px] font-extrabold font-['DM_Sans'] leading-none mt-1 mb-1">
                    {stats?.total || 0}
                </div>
            </div>

            {/* Pending Review */}
            <div className="w-full h-22 bg-white rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-amber-500 px-5 relative flex flex-col justify-center">
                <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase">
                    Pending Review
                </div>
                <div className="text-[#1e3a8a] text-[28px] font-extrabold font-['DM_Sans'] leading-none mt-1 mb-1">
                    {stats?.pending_review || 0}
                </div>
            </div>

            {/* Resolved */}
            <div className="w-full h-22 bg-white rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-green-500 px-5 relative flex flex-col justify-center">
                <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase">
                    Resolved
                </div>
                <div className="text-[#1e3a8a] text-[28px] font-extrabold font-['DM_Sans'] leading-none mt-1 mb-1">
                    {stats?.pnp_verified || 0}
                </div>
            </div>

            {/* Dismissed */}
            <div className="w-full h-22 bg-white rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-red-500 px-5 relative flex flex-col justify-center">
                <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase">
                    Dismissed
                </div>
                <div className="text-[#1e3a8a] text-[28px] font-extrabold font-['DM_Sans'] leading-none mt-1 mb-1">
                    {stats?.by_status?.dismissed || 0}
                </div>
            </div>
        </div>
    )
}

export default StatsCards
