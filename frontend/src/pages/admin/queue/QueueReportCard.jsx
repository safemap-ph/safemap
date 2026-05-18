import { Eye, MapPin } from "lucide-react"

const STATUS_BADGES = {
  pending_review: {
    bg: "bg-amber-100",
    text: "text-amber-600",
    label: "PENDING",
    border: "border-amber-400",
  },
  in_progress: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "IN PROGRESS",
    border: "border-blue-500",
  },
  // Backend returns 'verified' (not 'verified_pnp')
  verified: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "VERIFIED",
    border: "border-green-600",
  },
  verified_pnp: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "VERIFIED",
    border: "border-green-600",
  },
  dismissed: {
    bg: "bg-red-100",
    text: "text-red-500",
    label: "DISMISSED",
    border: "border-red-400",
  },
}

const SEVERITY_COLORS = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-400",
  low: "bg-green-400",
}

function formatDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(dateStr) {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function QueueReportCard({ report, onView }) {
  const badge = STATUS_BADGES[report.status] || {
    bg: "bg-gray-100",
    text: "text-gray-500",
    label: report.status,
    border: "border-gray-300",
  }
  const sevColor = SEVERITY_COLORS[report.severity] || "bg-gray-400"

  return (
    <div
      className={`w-full bg-white rounded-xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] border-l-[5px] ${badge.border} p-5 relative`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-[10px] font-bold font-['DM_Sans'] tracking-wider">
            {report.reference_code || `SF-${report.id}`}
          </span>
          <div className={`w-2 h-2 rounded-full ${sevColor}`} title={report.severity} />
        </div>
        <span
          className={`px-2 py-0.5 ${badge.bg} ${badge.text} text-[8px] font-bold font-['DM_Sans'] rounded tracking-wider`}
        >
          {badge.label}
        </span>
      </div>

      {/* Title & Category */}
      <div className="mb-2">
        <div className="text-zinc-800 text-sm font-bold font-['DM_Sans'] leading-tight mb-1">
          {report.title || "Untitled Report"}
        </div>
        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-500 text-[9px] font-bold font-['DM_Sans'] uppercase">
          {report.category?.replace("_", " ").toUpperCase() || "REPORT"}
        </span>
      </div>

      {/* Location */}
      <div className="text-gray-400 text-[11px] font-normal font-['DM_Sans'] flex items-center gap-1.5 mb-3">
        <MapPin className="w-3 h-3" />
        {report.location?.barangay || report.location?.city || "General Santos City"}
      </div>

      {/* Description */}
      <div className="text-gray-400 text-[10px] font-normal font-['DM_Sans'] leading-relaxed mb-4 line-clamp-3">
        {report.description}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex flex-col">
          <span className="text-gray-400 text-[10px] font-['DM_Sans']">{formatDate(report.created_at)}</span>
          <span className="text-gray-300 text-[9px] font-['DM_Sans']">{formatTime(report.created_at)}</span>
        </div>

        <div className="flex items-center gap-2">
          {report.status === "pending_review" && (
            <button
              onClick={() => onView && onView(report)}
              className="h-9 px-4 bg-[#1f295b] hover:bg-[#151c3d] transition-colors rounded-lg flex items-center gap-2"
            >
              <Eye className="w-3 h-3 text-white" />
              <span className="text-white text-[10px] font-bold font-['DM_Sans']">Review</span>
            </button>
          )}
          {report.status !== "pending_review" && (
            <button
              onClick={() => onView && onView(report)}
              className="h-9 px-4 bg-[#eff6ff] hover:bg-blue-100 transition-colors rounded-lg flex items-center gap-2"
            >
              <Eye className="w-3 h-3 text-[#1e3a8a]" />
              <span className="text-[#1e3a8a] text-[10px] font-bold font-['DM_Sans']">View</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QueueReportCard
