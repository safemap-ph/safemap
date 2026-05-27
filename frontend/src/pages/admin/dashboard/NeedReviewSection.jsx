import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { API_BASE } from "@/lib/api-base"
import { MapPin, X, CheckCircle, Ban, AlertOctagon, Calendar } from "lucide-react"
import { useNavigate } from "react-router-dom"

function ReviewOverlay({ report, onClose, onAction }) {
  const [loading, setLoading] = useState(null)
  const navigate = useNavigate()
  const isInProgress = report.status === "in_progress"
  const hasSeverity = Boolean(report.severity)
  const primaryAction = isInProgress ? "verify" : "approve"
  const primaryLabel = !hasSeverity ? "Review" : isInProgress ? "Resolve" : "Approve"

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  })

  const handleAction = async (action) => {
    setLoading(action)
    try {
      const endpoints = {
        approve: `${API_BASE}/reports/${report.id}/approve`,
        verify: `${API_BASE}/reports/${report.id}/verify`,
        spam: `${API_BASE}/reports/${report.id}/spam`,
        dismiss: `${API_BASE}/reports/${report.id}/dismiss`,
      }
      const bodies = {
        approve: { notes: "Approved for public awareness" },
        verify: { notes: "Resolved by admin" },
        spam: {},
        dismiss: { reason: "Dismissed by admin" },
      }
      const res = await fetch(endpoints[action], {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(bodies[action]),
      })
      if (res.ok) {
        onAction(report.id, action)
        onClose()
      }
    } catch (err) {
      /* ignore */
    } finally {
      setLoading(null)
    }
  }

  const severityColor = {
    critical: "bg-red-100 text-red-600",
    high: "bg-amber-100 text-amber-600",
    medium: "bg-blue-100 text-blue-600",
    low: "bg-slate-100 text-slate-500",
    unassigned: "bg-slate-100 text-slate-500",
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{ zIndex: 999999 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Bottom sheet */}
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-3 pb-4 border-b border-slate-100">
          <div>
            <p className="text-slate-400 text-[10px] font-bold font-['DM_Sans'] uppercase tracking-widest mb-1">
              {report.reference_code || `#${report.id}`}
            </p>
            <h2 className="text-[#1f295b] text-base font-extrabold font-['DM_Sans'] leading-tight pr-6">
              {report.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 px-5 pt-4">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-['DM_Sans'] uppercase ${severityColor[report.severity] || severityColor.unassigned}`}
          >
            {report.severity || "unassigned"}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-['DM_Sans'] uppercase bg-slate-100 text-slate-600">
            {report.category?.replace(/_/g, " ")}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-['DM_Sans'] uppercase bg-amber-50 text-amber-600">
            {report.status?.replace(/_/g, " ")}
          </span>
        </div>

        {/* Description */}
        <div className="px-5 pt-4">
          <p className="text-slate-400 text-[10px] font-bold font-['DM_Sans'] uppercase tracking-wider mb-1.5">
            Description
          </p>
          <p className="text-slate-700 text-sm font-['DM_Sans'] leading-relaxed">{report.description}</p>
        </div>

        {/* Meta */}
        <div className="px-5 pt-4 space-y-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-['DM_Sans']">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            {report.location?.barangay
              ? `${report.location.barangay}, ${report.location.city || "General Santos City"}`
              : report.location?.city || "General Santos City"}
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-['DM_Sans']">
            <Calendar size={13} className="text-slate-400" />
            {new Date(report.created_at).toLocaleString()}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pt-6 pb-8 grid grid-cols-3 gap-3">
          <button
            onClick={() => {
              if (!hasSeverity) {
                onClose()
                navigate(`/admin-queue?id=${report.id}`)
                return
              }
              handleAction(primaryAction)
            }}
            disabled={!!loading}
            className="flex flex-col items-center gap-1.5 py-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            <CheckCircle size={20} />
            <span className="text-[10px] font-bold font-['DM_Sans'] uppercase">
              {loading === primaryAction ? "..." : primaryLabel}
            </span>
          </button>
          <button
            onClick={() => handleAction("spam")}
            disabled={!!loading}
            className="flex flex-col items-center gap-1.5 py-3 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            <AlertOctagon size={20} />
            <span className="text-[10px] font-bold font-['DM_Sans'] uppercase">
              {loading === "spam" ? "..." : "Spam"}
            </span>
          </button>
          <button
            onClick={() => handleAction("dismiss")}
            disabled={!!loading}
            className="flex flex-col items-center gap-1.5 py-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Ban size={20} />
            <span className="text-[10px] font-bold font-['DM_Sans'] uppercase">
              {loading === "dismiss" ? "..." : "Dismiss"}
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

function NeedReviewSection({ reports: initialReports, loading }) {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [processingIds, setProcessingIds] = useState(new Set())

  useEffect(() => {
    if (initialReports) setReports(initialReports)
  }, [initialReports])

  const handleAction = (id) => {
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  const handleQuickAction = async (report, action) => {
    if (processingIds.has(report.id)) return
    setProcessingIds((prev) => new Set(prev).add(report.id))

    const endpoints = {
      approve: `${API_BASE}/reports/${report.id}/approve`,
      verify: `${API_BASE}/reports/${report.id}/verify`,
      dismiss: `${API_BASE}/reports/${report.id}/dismiss`,
    }
    const bodies = {
      approve: { notes: "Approved for public awareness" },
      verify: { notes: "Resolved by admin" },
      dismiss: { reason: "Dismissed by admin" },
    }

    try {
      const res = await fetch(endpoints[action], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(bodies[action]),
      })
      if (res.ok) handleAction(report.id)
    } catch (err) {
      /* ignore */
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(report.id)
        return next
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending_review": return "border-amber-500"
      case "in_progress": return "border-blue-900"
      default: return "border-gray-200"
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending_review": return "bg-amber-100 text-amber-600"
      case "in_progress": return "bg-blue-100 text-blue-900"
      case "verified": return "bg-green-100 text-green-600"       // backend value
      case "verified_pnp": return "bg-green-100 text-green-600"   // legacy fallback
      case "dismissed": return "bg-red-100 text-red-500"
      default: return "bg-gray-100 text-gray-500"
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending_review": return "Pending Review"
      case "in_progress": return "In Progress"
      case "verified": return "Resolved"        // backend value
      case "verified_pnp": return "Resolved"   // legacy fallback
      case "dismissed": return "Dismissed"
      default: return status
    }
  }

  return (
    <>
      <div className="w-full max-w-sm px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans']">Need Review</h2>
          <button
            onClick={() => navigate("/admin-queue")}
            className="text-[#1e3a8a] text-xs font-bold font-['DM_Sans'] hover:underline"
          >
            View Queue →
          </button>
        </div>

        <div className="space-y-3">
          {loading && reports.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs italic font-['DM_Sans']">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs italic font-['DM_Sans']">
              No reports currently need review.
            </div>
          ) : (
            reports.slice(0, 5).map((report, idx) => {
              const isProcessing = processingIds.has(report.id)
              return (
                <div
                  key={report.id || idx}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full bg-white rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border-l-4 p-4 flex gap-3 ${getStatusColor(report.status)} cursor-pointer hover:bg-slate-50 transition-colors ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-gray-400 text-[10px] font-bold font-['DM_Sans']">
                        {report.reference_code || `SF-${report.id}`}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-['DM_Sans'] uppercase tracking-wider ${getStatusBadge(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold font-['DM_Sans'] uppercase tracking-wider bg-gray-100 text-gray-500">
                        {report.category?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <h3 className="text-zinc-800 text-[13px] font-bold font-['DM_Sans'] leading-tight mb-1.5">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-3 text-gray-400 text-[10px] font-['DM_Sans']">
                      <MapPin className="w-3 h-3" />
                      {report.location?.barangay || report.location?.city || "General Santos City"}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-400 text-[10px] font-['DM_Sans']">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleQuickAction(report, "dismiss") }}
                          disabled={isProcessing}
                          className="h-7 px-3 bg-red-50 hover:bg-red-100 transition-colors rounded-lg text-red-500 text-[10px] font-bold font-['DM_Sans'] flex items-center justify-center min-w-16"
                        >
                          {isProcessing ? "..." : "Dismiss"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!report.severity) { setSelectedReport(report); return }
                            handleQuickAction(report, report.status === "in_progress" ? "verify" : "approve")
                          }}
                          disabled={isProcessing}
                          className="h-7 px-3 bg-[#1f295b] hover:bg-[#151c3d] transition-colors rounded-lg text-white text-[10px] font-bold font-['DM_Sans'] flex items-center justify-center min-w-16"
                        >
                          {isProcessing ? "..." : !report.severity ? "Review" : report.status === "in_progress" ? "Resolve" : "Approve"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {selectedReport && (
        <ReviewOverlay
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onAction={handleAction}
        />
      )}
    </>
  )
}

export default NeedReviewSection
