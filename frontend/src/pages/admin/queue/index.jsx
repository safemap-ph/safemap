import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { useLocation } from "react-router-dom"
import { API_BASE } from "@/lib/api-base"
import { Search, Filter, Clock, ChevronDown, X, MapPin, Calendar, Tag, AlertCircle, Phone } from "lucide-react"
import AdminLayout from "../../../components/admin/AdminLayout"
import QueueStatsBar from "./QueueStatsBar"
import QueueReportCard from "./QueueReportCard"

function AdminQueuePage() {
  const location = useLocation()
  const [allReports, setAllReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending_review")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    dismissed: 0,
    total: 0,
    urgent: 0,
  })
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedSeverity, setSelectedSeverity] = useState("")
  const [hasScrolled, setHasScrolled] = useState(false)
  const [actionLoading, setActionLoading] = useState("")
  const reviewScrollRef = useRef(null)

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  })

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const statsRes = await fetch(`${API_BASE}/reports/stats`, { 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })
      if (statsRes.status === 401) {
        localStorage.removeItem("token")
        window.location.href = "/admin"
        return
      }
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats({
          pending: data.pending_review || 0,
          inProgress: data.by_status?.in_progress || 0,
          dismissed: data.by_status?.dismissed || 0,
          total: data.total || 0,
          urgent: data.urgent || 0,
        })
      }
    } catch (err) { /* ignore */ }
  }, [])

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const reportId = queryParams.get("id")
    if (reportId) {
      setSearchQuery(reportId)
      setStatusFilter("all")
    }
  }, [location.search])

  // Fetch stats on mount
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchData()
  }, [statusFilter, categoryFilter])

  useEffect(() => {
    if (!selectedReport) return
    setSelectedSeverity("")
    setHasScrolled(false)
    setActionLoading("")
    requestAnimationFrame(() => {
      const el = reviewScrollRef.current
      if (!el) return
      if (el.scrollHeight <= el.clientHeight + 4) {
        setHasScrolled(true)
      }
    })
  }, [selectedReport])

  useEffect(() => {
    if (selectedReport) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [selectedReport])

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    setLoading(true)
    try {
      let url = `${API_BASE}/reports?per_page=50`
      if (statusFilter && statusFilter !== "all") url += `&status=${statusFilter}`
      if (categoryFilter) url += `&category=${categoryFilter}`

      const response = await fetch(url, { headers: getAuthHeaders() })
      if (response.status === 401) {
        localStorage.removeItem("token")
        window.location.href = "/admin"
        return
      }
      if (response.ok) setAllReports((await response.json()).reports || [])
    } catch (err) {
      /* ignore */
    } finally {
      setLoading(false)
    }
    // Refresh stats after every data fetch
    fetchStats()
  }

  const handleApprove = async (id, severity) => {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}/approve`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes: "Moved to in progress", severity }),
      })
      if (res.ok) { await fetchData(); return true }
    } catch (err) { /* ignore */ }
    return false
  }

  const handleDismiss = async (id, severity) => {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}/dismiss`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: "Dismissed by admin", severity }),
      })
      if (res.ok) { await fetchData(); return true }
    } catch (err) { /* ignore */ }
    return false
  }

  const handleVerify = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}/verify`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes: "Resolved by admin" }),
      })
      if (res.ok) { await fetchData(); return true }
    } catch (err) { /* ignore */ }
    return false
  }

  const handleReviewScroll = () => {
    const el = reviewScrollRef.current
    if (!el || hasScrolled) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setHasScrolled(true)
    }
  }

  const handleReviewAction = async (action) => {
    if (!selectedReport || actionLoading) return
    setActionLoading(action)
    const ok =
      action === "approve"
        ? await handleApprove(selectedReport.id, selectedSeverity)
        : action === "verify"
          ? await handleVerify(selectedReport.id)
          : await handleDismiss(selectedReport.id, selectedSeverity)
    if (ok) {
      setSelectedReport(null)
      fetchStats() // update counts immediately after action
    }
    setActionLoading("")
  }

  // Also search by raw numeric ID so deep-link from dashboard (?id=N) works
  const filteredReports = allReports
    .filter((r) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase().trim()
      return (
        String(r.id) === q ||
        (r.reference_code || "").toLowerCase().includes(q) ||
        (r.title || "").toLowerCase().includes(q) ||
        (r.category || "").toLowerCase().includes(q) ||
        (r.location?.barangay || "").toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q)
      )
    })
    // Urgent reports always float to the top
    .sort((a, b) => {
      if (a.is_urgent && !b.is_urgent) return -1
      if (!a.is_urgent && b.is_urgent) return 1
      return 0
    })

  const CATEGORIES = [
    "",
    "sexual_assault",
    "physical_abuse",
    "domestic_violence",
    "stalking",
    "verbal_abuse",
    "emotional_abuse",
    "other",
  ]

  const SEVERITY_OPTIONS = [
    { key: "critical", label: "Critical", color: "bg-red-500" },
    { key: "high", label: "High", color: "bg-orange-500" },
    { key: "medium", label: "Medium", color: "bg-amber-400" },
    { key: "low", label: "Low", color: "bg-green-400" },
  ]

  // Report Details Modal — rendered via portal so it's never clipped
  const reportModal = selectedReport && createPortal(
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{ zIndex: 999999 }}
      onClick={() => setSelectedReport(null)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Bottom sheet */}
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div>
            <p className="text-slate-400 text-[10px] font-bold font-['DM_Sans'] uppercase tracking-widest mb-0.5">
              {selectedReport.reference_code || `SF-${selectedReport.id}`}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[#1f295b] text-base font-extrabold font-['DM_Sans'] leading-tight pr-6">
                {selectedReport.title || "Untitled Report"}
              </h3>
              {selectedReport.is_urgent && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 border border-red-300 rounded-full text-red-600 text-[9px] font-extrabold uppercase tracking-widest shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Urgent
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedReport(null)}
            className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          ref={reviewScrollRef}
          onScroll={handleReviewScroll}
          className="p-5 overflow-y-auto flex-1"
        >
          <div className="space-y-5">
            {/* Status & Severity row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Status</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    selectedReport.status === "pending_review" ? "bg-amber-100 text-amber-600"
                    : selectedReport.status === "in_progress" ? "bg-blue-100 text-blue-700"
                    : selectedReport.status === "verified" ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-500"
                  }`}
                >
                  {selectedReport.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Severity</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    selectedReport.severity === "critical" ? "bg-red-500"
                    : selectedReport.severity === "high" ? "bg-orange-500"
                    : selectedReport.severity === "medium" ? "bg-amber-400"
                    : selectedReport.severity === "low" ? "bg-green-400"
                    : "bg-slate-400"
                  }`} />
                  <span className="text-xs font-bold text-gray-700 capitalize">
                    {selectedReport.severity || "unassigned"}
                  </span>
                </div>
              </div>
            </div>

            {/* Title & Category */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Tag className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase">Title & Category</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-zinc-800 font-bold text-sm mb-1">{selectedReport.title || "Untitled Report"}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase">
                  {selectedReport.category?.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase">Description</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-600 text-sm leading-relaxed italic">
                &ldquo;{selectedReport.description}&rdquo;
              </div>
            </div>

            {/* Contact Phone — only shown for urgent reports */}
            {selectedReport.is_urgent && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase text-red-500">Reporter Contact</span>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-red-700 font-bold text-sm">
                    {selectedReport.contact_phone || "—"}
                  </span>
                  {selectedReport.contact_phone && (
                    <a
                      href={`tel:${selectedReport.contact_phone}`}
                      className="ml-auto px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Call
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase">Location</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold">BARANGAY</span>
                  <span className="text-xs font-bold text-gray-700">{selectedReport.location?.barangay || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold">CITY</span>
                  <span className="text-xs font-bold text-gray-700">{selectedReport.location?.city || "General Santos City"}</span>
                </div>
                {selectedReport.location?.address && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block mb-1">ADDRESS</span>
                    <p className="text-xs text-gray-600">{selectedReport.location.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase">Submission Date</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between">
                <span className="text-xs font-bold text-gray-700">
                  {new Date(selectedReport.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
                <span className="text-xs font-bold text-gray-400">
                  {new Date(selectedReport.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            {/* Severity picker — only for pending_review */}
            {selectedReport?.status === "pending_review" && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase">Severity <span className="text-red-400">(Required)</span></span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SEVERITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedSeverity(opt.key)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold uppercase transition-colors ${
                        selectedSeverity === opt.key
                          ? "border-[#1f295b] bg-[#eef2ff] text-[#1f295b]"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${opt.color}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400">Select a severity level to enable actions.</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-gray-100 pb-4">
              {selectedReport?.status === "pending_review" && (
                <p className="text-[10px] text-gray-400 italic">
                  {!hasScrolled
                    ? "Scroll through all details before taking action."
                    : selectedSeverity ? "Ready to take action." : "Select a severity level above."}
                </p>
              )}

              {selectedReport?.status === "pending_review" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReviewAction("dismiss")}
                    disabled={!hasScrolled || !selectedSeverity || !!actionLoading}
                    className="flex-1 py-3.5 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-red-100 active:scale-95 transition-all disabled:opacity-40"
                  >
                    {actionLoading === "dismiss" ? "Dismissing..." : "Dismiss"}
                  </button>
                  <button
                    onClick={() => handleReviewAction("approve")}
                    disabled={!hasScrolled || !selectedSeverity || !!actionLoading}
                    className="flex-1 py-3.5 bg-[#1f295b] text-white text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-[#151c3d] active:scale-95 transition-all disabled:opacity-40"
                  >
                    {actionLoading === "approve" ? "Approving..." : "Approve"}
                  </button>
                </div>
              )}

              {selectedReport?.status === "in_progress" && (
                <button
                  onClick={() => handleReviewAction("verify")}
                  disabled={!!actionLoading}
                  className="w-full py-3.5 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {actionLoading === "verify" ? "Resolving..." : "Resolve Report"}
                </button>
              )}

              <button
                onClick={() => setSelectedReport(null)}
                className="w-full py-3 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )

  return (
    <AdminLayout activeTab="queue">
      <div className="w-full max-w-sm px-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-zinc-800 text-2xl font-extrabold font-['DM_Sans']">Report Queue</h1>
          <div className="px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-amber-500" />
            <span className="text-amber-600 text-[11px] font-semibold font-['DM_Sans']">{stats.pending} Pending</span>
          </div>
        </div>
      </div>

      {/* Stats tabs */}
      <QueueStatsBar
        stats={stats}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setSearchQuery={setSearchQuery}
      />

      {/* Search & Filters */}
      <div className="w-full max-w-sm px-4 mt-4 space-y-3">
        <div className="w-full h-12 bg-white rounded-xl outline outline-1 -outline-offset-1 outline-gray-200 flex items-center px-4 gap-3 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by title, code, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-normal text-zinc-800 font-['DM_Sans'] placeholder-gray-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-[#1e3a8a] text-xs font-bold font-['DM_Sans']"
        >
          <Filter className="w-3.5 h-3.5" />
          Filter by Category
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>

        {showFilters && (
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-['DM_Sans'] uppercase transition-colors ${
                  categoryFilter === cat ? "bg-[#1f295b] text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {cat ? cat.replace(/_/g, " ") : "All Categories"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Report list — single column, tab-like */}
      <div className="w-full max-w-sm px-4 mt-5 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm font-['DM_Sans']">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-4xl mb-3">📋</div>
            <div className="text-gray-400 text-sm font-['DM_Sans']">No reports found</div>
          </div>
        ) : (
          filteredReports.map((report) => (
            <QueueReportCard key={report.id} report={report} onView={(r) => setSelectedReport(r)} />
          ))
        )}
      </div>

      {reportModal}
    </AdminLayout>
  )
}

export default AdminQueuePage
