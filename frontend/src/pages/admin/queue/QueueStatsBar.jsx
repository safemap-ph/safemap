function QueueStatsBar({ stats, statusFilter, setStatusFilter }) {
    const tabs = [
        { key: "", label: "All", count: stats.total, color: "text-[#1e3a8a]" },
        { key: "pending_review", label: "Pending", count: stats.pending, color: "text-amber-500" },
        { key: "approved_awareness", label: "Approved", count: stats.approved, color: "text-green-500" },
        { key: "dismissed", label: "Dismissed", count: stats.dismissed, color: "text-red-500" },
    ]

    return (
        <div className="w-full max-w-sm px-4 mt-4">
            <div className="grid grid-cols-4 gap-2">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setStatusFilter(t.key)}
                        className={`rounded-xl p-3 text-center transition-colors ${
                            statusFilter === t.key
                                ? "bg-[#1f295b] shadow-md"
                                : "bg-white shadow-sm border border-gray-100"
                        }`}>
                        <div className={`text-lg font-extrabold font-['DM_Sans'] ${
                            statusFilter === t.key ? "text-white" : t.color
                        }`}>
                            {t.count}
                        </div>
                        <div className={`text-[8px] font-bold font-['DM_Sans'] uppercase ${
                            statusFilter === t.key ? "text-blue-200" : "text-gray-400"
                        }`}>
                            {t.label}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default QueueStatsBar
