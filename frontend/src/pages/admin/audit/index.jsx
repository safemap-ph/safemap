import { useState, useEffect } from "react"
import { API_BASE } from "@/lib/api-base"
import { Search, Filter, ChevronDown, Activity } from "lucide-react"
import AdminLayout from "../../../components/admin/AdminLayout"
import AuditSummaryCards from "./AuditSummaryCards"
import AuditTimeline from "./AuditTimeline"

function AdminAuditPage() {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [auditEntries, setAuditEntries] = useState([])
  const [auditStats, setAuditStats] = useState({
    total: 0,
    submissions: 0,
    pending: 0,
    approvals: 0,
    dismissals: 0,
    verifications: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/reports?per_page=100`, { headers: getAuthHeaders() })
      if (response.ok) {
        const data = await response.json()
        const entries = buildAuditEntries(data.reports || [])
        setAuditEntries(entries)

        setAuditStats({
          total: entries.length,
          submissions: entries.filter((e) => e.type === "submitted").length,
          pending: entries.filter((e) => e.type === "pending").length,
          approvals: entries.filter((e) => e.type === "approved").length,
          dismissals: entries.filter((e) => e.type === "dismissed").length,
          verifications: entries.filter((e) => e.type === "verified").length,
        })
      }
    } catch (err) {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  const buildAuditEntries = (reports) => {
    const entries = []
    reports.forEach((report) => {
      // Pending reports (submitted but not yet reviewed)
      if (report.status === "pending_review" && report.created_at) {
        entries.push({
          id: `pending-${report.id}`,
          type: "pending",
          reportId: report.id,
          refCode: report.reference_code || `SF-${report.id}`,
          title: report.title,
          category: report.category,
          reviewedBy: "System",
          notes: "Awaiting admin review",
          timestamp: report.created_at,
          description: `Report ${report.reference_code || `#SF-${report.id}`} submitted — pending review`,
        })
      }

      // Submitted (non-pending reports — show their creation as a submission event)
      if (report.status !== "pending_review" && report.created_at) {
        entries.push({
          id: `submit-${report.id}`,
          type: "submitted",
          reportId: report.id,
          refCode: report.reference_code || `SF-${report.id}`,
          title: report.title,
          category: report.category,
          reviewedBy: "Anonymous",
          notes: "",
          timestamp: report.created_at,
          description: `New report submitted: ${report.reference_code || `#SF-${report.id}`} — ${report.title || report.category}`,
        })
      }

      // Approved
      if (report.status === "in_progress" && report.review_date) {
        entries.push({
          id: `approve-${report.id}`,
          type: "approved",
          reportId: report.id,
          refCode: report.reference_code || `SF-${report.id}`,
          title: report.title,
          category: report.category,
          reviewedBy: report.reviewed_by ? `Admin-${String(report.reviewed_by).padStart(2, "0")}` : "System",
          notes: report.review_notes || "",
          timestamp: report.review_date,
          description: `Moved case ${report.reference_code || `#SF-${report.id}`} to in progress`,
        })
      }

      // Dismissed
      if (report.status === "dismissed" && report.review_date) {
        entries.push({
          id: `dismiss-${report.id}`,
          type: "dismissed",
          reportId: report.id,
          refCode: report.reference_code || `SF-${report.id}`,
          title: report.title,
          category: report.category,
          reviewedBy: report.reviewed_by ? `Admin-${String(report.reviewed_by).padStart(2, "0")}` : "System",
          notes: report.review_notes || "Dismissed as spam/duplicate",
          timestamp: report.review_date,
          description: `Dismissed case ${report.reference_code || `#SF-${report.id}`}`,
        })
      }

      // Verified
      if ((report.status === "verified_pnp" || report.status === "verified") && report.review_date) {
        entries.push({
          id: `verify-${report.id}`,
          type: "verified",
          reportId: report.id,
          refCode: report.reference_code || `SF-${report.id}`,
          title: report.title,
          category: report.category,
          reviewedBy: report.reviewed_by ? `Admin-${String(report.reviewed_by).padStart(2, "0")}` : "System",
          notes: report.review_notes || "",
          timestamp: report.review_date,
          description: `PNP verified case ${report.reference_code || `#SF-${report.id}`}${report.pnp_case_number ? ` — Case #${report.pnp_case_number}` : ""}`,
        })
      }

      // False report
      if (report.status === "false_report" && report.review_date) {
        entries.push({
          id: `false-${report.id}`,
          type: "flagged",
          reportId: report.id,
          refCode: report.reference_code || `SF-${report.id}`,
          title: report.title,
          category: report.category,
          reviewedBy: report.reviewed_by ? `Admin-${String(report.reviewed_by).padStart(2, "0")}` : "System",
          notes: report.review_notes || "Marked as false report",
          timestamp: report.review_date,
          description: `Flagged case ${report.reference_code || `#SF-${report.id}`} as false report`,
        })
      }

      // Spam
      if (report.status === "spam" && report.review_date) {
        entries.push({
          id: `spam-${report.id}`,
          type: "flagged",
          reportId: report.id,
          refCode: report.reference_code || `SF-${report.id}`,
          title: report.title,
          category: report.category,
          reviewedBy: report.reviewed_by ? `Admin-${String(report.reviewed_by).padStart(2, "0")}` : "System",
          notes: report.review_notes || "Marked as spam",
          timestamp: report.review_date,
          description: `Flagged case ${report.reference_code || `#SF-${report.id}`} as spam`,
        })
      }
    })

    entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    return entries
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const filteredEntries = auditEntries.filter((entry) => {
    if (typeFilter && entry.type !== typeFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        (entry.description || "").toLowerCase().includes(q) ||
        (entry.refCode || "").toLowerCase().includes(q) ||
        (entry.reviewedBy || "").toLowerCase().includes(q) ||
        (entry.title || "").toLowerCase().includes(q)
      )
    }
    return true
  })

  const groupedEntries = {
    /* ignore */
  }
  filteredEntries.forEach((entry) => {
    const date = formatDate(entry.timestamp)
    if (!groupedEntries[date]) groupedEntries[date] = []
    groupedEntries[date].push(entry)
  })

  return (
    <AdminLayout activeTab="audit">
      <div className="w-full max-w-sm px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-zinc-800 text-2xl font-extrabold font-['DM_Sans']">System Audit</h1>
          <div className="px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-200 flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-indigo-500" />
            <span className="text-indigo-600 text-[11px] font-semibold font-['DM_Sans']">
              {auditStats.total} Events
            </span>
          </div>
        </div>
      </div>

      <AuditSummaryCards stats={auditStats} loading={loading} />

      <div className="w-full max-w-sm px-4 mt-4 space-y-3">
        <div className="w-full h-12 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex items-center px-4 gap-3 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-normal text-zinc-800 font-['DM_Sans'] placeholder-gray-400"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-[#1e3a8a] text-xs font-bold font-['DM_Sans']"
        >
          <Filter className="w-3.5 h-3.5" />
          Filter by Event Type
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>

        {showFilters && (
          <div className="flex flex-wrap gap-2">
            {[
              { key: "", label: "All" },
              { key: "submitted", label: "Submitted" },
              { key: "pending", label: "Pending" },
              { key: "approved", label: "Approvals" },
              { key: "dismissed", label: "Dismissals" },
              { key: "verified", label: "PNP Verify" },
              { key: "flagged", label: "Flagged" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTypeFilter(t.key)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-['DM_Sans'] uppercase transition-colors ${
                  typeFilter === t.key ? "bg-[#1f295b] text-white" : "bg-white text-gray-500 border border-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <AuditTimeline groupedEntries={groupedEntries} loading={loading} />

      <div className="w-full max-w-sm px-4 mt-5">
        <div className="w-full bg-[#3b53cc] rounded-xl p-5">
          <h3 className="text-white text-sm font-bold font-['DM_Sans'] mb-2">Audit Compliance Notice</h3>
          <p className="text-blue-100 text-[11px] font-normal font-['DM_Sans'] leading-relaxed">
            All administrative actions are logged and retained for 180 days per SafeMap data governance policy. Audit
            records are immutable and tamper-proof.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminAuditPage
