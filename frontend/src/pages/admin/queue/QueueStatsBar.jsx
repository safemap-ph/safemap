function QueueStatsBar({ stats, statusFilter, setStatusFilter, setSearchQuery }) {
  const tabs = [
    {
      key: "pending_review",
      label: "Pending",
      count: stats.pending,
      color: "text-amber-500",
      activeRing: "ring-amber-500",
    },
    {
      key: "in_progress",
      label: "In Progress",
      count: stats.inProgress,
      color: "text-blue-600",
      activeRing: "ring-blue-600",
    },
    {
      key: "dismissed",
      label: "Dismissed",
      count: stats.dismissed,
      color: "text-red-500",
      activeRing: "ring-red-500",
    },
    {
      key: "all",
      label: "All",
      count: stats.total,
      color: "text-slate-800",
      activeRing: "ring-slate-800",
    },
  ]

  const handleTabClick = (key) => {
    setStatusFilter(key)
    if (setSearchQuery) setSearchQuery("") // Clear the search field so the user sees actual counts for that tab
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4">
        {tabs.map((t) => {
          const isActive = statusFilter === t.key
          return (
            <button
              key={t.key}
              onClick={() => handleTabClick(t.key)}
              className={`rounded-xl p-3 text-center transition-all duration-150 bg-white ${
                isActive
                  ? `shadow-md ring-2 ${t.activeRing} ring-offset-1`
                  : "shadow-sm border border-gray-100 hover:border-gray-200"
              }`}
            >
              <div
                className={`text-2xl font-extrabold font-['DM_Sans'] leading-none mb-1 ${isActive ? t.color : "text-slate-400"}`}
              >
                {t.count ?? 0}
              </div>
              <div
                className={`text-[9px] font-bold font-['DM_Sans'] uppercase tracking-wide ${
                  isActive ? t.color : "text-slate-400"
                }`}
              >
                {t.label}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default QueueStatsBar
