    import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    Search,
    CheckCircle,
    XCircle,
    Edit2,
    LogIn,
    Shield,
    AlertTriangle,
    Clock,
    FileText,
    Filter,
    ChevronDown,
    Activity,
} from "lucide-react"
import logoImg from "/src/assets/images/Logo.svg"
import backImg from "/src/assets/images/rpt_back.svg"
import AdminBottomNav from "../components/AdminBottomNav"

// Audit event type definitions
const AUDIT_TYPES = {
    submitted: {
        icon: FileText,
        bg: "bg-purple-50",
        iconColor: "text-purple-500",
        label: "SUBMITTED",
        labelBg: "bg-purple-100",
        labelText: "text-purple-600",
    },
    pending: {
        icon: Clock,
        bg: "bg-yellow-50",
        iconColor: "text-yellow-500",
        label: "PENDING",
        labelBg: "bg-yellow-100",
        labelText: "text-yellow-600",
    },
    approved: {
        icon: CheckCircle,
        bg: "bg-green-50",
        iconColor: "text-green-500",
        label: "APPROVAL",
        labelBg: "bg-green-100",
        labelText: "text-green-600",
    },
    dismissed: {
        icon: XCircle,
        bg: "bg-red-50",
        iconColor: "text-red-500",
        label: "DISMISSAL",
        labelBg: "bg-red-100",
        labelText: "text-red-500",
    },
    verified: {
        icon: Shield,
        bg: "bg-blue-50",
        iconColor: "text-blue-600",
        label: "PNP_VERIFY",
        labelBg: "bg-blue-100",
        labelText: "text-blue-700",
    },
    modified: {
        icon: Edit2,
        bg: "bg-slate-100",
        iconColor: "text-gray-500",
        label: "META_UPDATE",
        labelBg: "bg-gray-100",
        labelText: "text-gray-500",
    },
    login: {
        icon: LogIn,
        bg: "bg-indigo-50",
        iconColor: "text-indigo-500",
        label: "AUTH_EVENT",
        labelBg: "bg-indigo-100",
        labelText: "text-indigo-600",
    },
    flagged: {
        icon: AlertTriangle,
        bg: "bg-amber-50",
        iconColor: "text-amber-500",
        label: "AUTO_FLAG",
        labelBg: "bg-amber-100",
        labelText: "text-amber-600",
    },
}

function AdminAuditPage() {
    const navigate = useNavigate()
    const [reports, setReports] = useState([])
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
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/admin")
            return
        }
        fetchData()
    }, [])

    const getAuthHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    })

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch all reports to derive audit entries from review data
            const response = await fetch(
                "http://localhost:5000/api/reports?per_page=100",
                { headers: getAuthHeaders() },
            )
            
            console.log('Fetch response status:', response.status) // Debug
            
            if (response.ok) {
                const data = await response.json()
                console.log('Fetched reports data:', data) // Debug
                
                const allReports = data.reports || []
                console.log('Total reports:', allReports.length) // Debug
                
                setReports(allReports)

                // Build audit entries from reviewed reports
                const entries = buildAuditEntries(allReports)
                setAuditEntries(entries)

                // Stats
                setAuditStats({
                    total: entries.length,
                    submissions: entries.filter((e) => e.type === "submitted").length,
                    pending: entries.filter((e) => e.type === "pending").length,
                    approvals: entries.filter((e) => e.type === "approved")
                        .length,
                    dismissals: entries.filter((e) => e.type === "dismissed")
                        .length,
                    verifications: entries.filter((e) => e.type === "verified")
                        .length,
                })
            } else {
                console.error('Fetch failed with status:', response.status)
            }
        } catch (err) {
            console.error("Error fetching data:", err)
        } finally {
            setLoading(false)
        }
    }

    const buildAuditEntries = (reports) => {
        const entries = []

        reports.forEach((report) => {
            // 1. Report submission (created_at) - only for non-pending reports
            // For pending reports, we'll show "pending" instead of "submitted"
            if (report.created_at && report.status !== "pending_review") {
                entries.push({
                    id: `submit-${report.id}`,
                    type: "submitted",
                    reportId: report.id,
                    refCode: report.reference_code || `SF-${report.id}`,
                    title: report.title,
                    category: report.category,
                    reviewedBy: "Anonymous User",
                    notes: "",
                    timestamp: report.created_at,
                    description: `New report submitted: ${report.reference_code || `#SF-${report.id}`}`,
                })
            }

            // 2. Pending review (if status is pending_review)
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
                    description: `Report ${report.reference_code || `#SF-${report.id}`} pending review`,
                })
            }

            // 3. Approved reports
            if (
                report.status === "approved_awareness" &&
                report.review_date
            ) {
                entries.push({
                    id: `approve-${report.id}`,
                    type: "approved",
                    reportId: report.id,
                    refCode: report.reference_code || `SF-${report.id}`,
                    title: report.title,
                    category: report.category,
                    reviewedBy: report.reviewed_by
                        ? `Admin-${String(report.reviewed_by).padStart(2, "0")}`
                        : "System",
                    notes: report.review_notes || "",
                    timestamp: report.review_date,
                    description: `Approved case ${report.reference_code || `#SF-${report.id}`} for public awareness`,
                })
            }

            // 4. Dismissed reports
            if (report.status === "dismissed" && report.review_date) {
                entries.push({
                    id: `dismiss-${report.id}`,
                    type: "dismissed",
                    reportId: report.id,
                    refCode: report.reference_code || `SF-${report.id}`,
                    title: report.title,
                    category: report.category,
                    reviewedBy: report.reviewed_by
                        ? `Admin-${String(report.reviewed_by).padStart(2, "0")}`
                        : "System",
                    notes:
                        report.review_notes || "Dismissed as spam/duplicate",
                    timestamp: report.review_date,
                    description: `Dismissed case ${report.reference_code || `#SF-${report.id}`}`,
                })
            }

            // 5. Verified reports
            if ((report.status === "verified_pnp" || report.status === "verified") && report.review_date) {
                entries.push({
                    id: `verify-${report.id}`,
                    type: "verified",
                    reportId: report.id,
                    refCode: report.reference_code || `SF-${report.id}`,
                    title: report.title,
                    category: report.category,
                    pnpCase: report.pnp_case_number,
                    reviewedBy: report.reviewed_by
                        ? `Admin-${String(report.reviewed_by).padStart(2, "0")}`
                        : "System",
                    notes: report.review_notes || "",
                    timestamp: report.review_date,
                    description: `PNP verified case ${report.reference_code || `#SF-${report.id}`}${report.pnp_case_number ? ` — Case #${report.pnp_case_number}` : ""}`,
                })
            }

            // 6. False reports
            if (report.status === "false_report" && report.review_date) {
                entries.push({
                    id: `false-${report.id}`,
                    type: "flagged",
                    reportId: report.id,
                    refCode: report.reference_code || `SF-${report.id}`,
                    title: report.title,
                    category: report.category,
                    reviewedBy: report.reviewed_by
                        ? `Admin-${String(report.reviewed_by).padStart(2, "0")}`
                        : "System",
                    notes: report.review_notes || "Marked as false report",
                    timestamp: report.review_date,
                    description: `Flagged case ${report.reference_code || `#SF-${report.id}`} as false report`,
                })
            }

            // 7. Spam reports
            if (report.status === "spam" && report.review_date) {
                entries.push({
                    id: `spam-${report.id}`,
                    type: "flagged",
                    reportId: report.id,
                    refCode: report.reference_code || `SF-${report.id}`,
                    title: report.title,
                    category: report.category,
                    reviewedBy: report.reviewed_by
                        ? `Admin-${String(report.reviewed_by).padStart(2, "0")}`
                        : "System",
                    notes: report.review_notes || "Marked as spam",
                    timestamp: report.review_date,
                    description: `Flagged case ${report.reference_code || `#SF-${report.id}`} as spam`,
                })
            }
        })

        // Sort by timestamp (newest first)
        entries.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
        )

        console.log('Built audit entries:', entries) // Debug log

        return entries
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return "—"
        const d = new Date(dateStr)
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    const formatTime = (dateStr) => {
        if (!dateStr) return ""
        const d = new Date(dateStr)
        return d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // Group entries by date
    const groupByDate = (entries) => {
        const groups = {}
        entries.forEach((entry) => {
            const date = formatDate(entry.timestamp)
            if (!groups[date]) groups[date] = []
            groups[date].push(entry)
        })
        return groups
    }

    // Filter entries
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

    const groupedEntries = groupByDate(filteredEntries)

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/admin")
    }

    return (
        <div className="w-full min-h-screen bg-slate-50 overflow-x-hidden flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-sm px-4 pt-8 pb-2">
                <div className="relative flex items-center justify-center mb-5">
                    <img className="h-12 w-auto" src={logoImg} alt="SafeMap" />
                    <div className="absolute right-0 flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#1f295b] rounded-lg flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </div>
                        <img
                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                            src="https://placehold.co/32x32"
                            alt="User"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <h1 className="text-zinc-800 text-2xl font-extrabold font-['DM_Sans']">
                        System Audit
                    </h1>
                    <div className="px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-200 flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-indigo-500" />
                        <span className="text-indigo-600 text-[11px] font-semibold font-['DM_Sans']">
                            {auditStats.total} Events
                        </span>
                    </div>
                </div>
            </div>

            {/* Audit Summary Cards */}
            <div className="w-full max-w-sm px-4 mt-4">
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                        <FileText className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                        <div className="text-lg font-extrabold font-['DM_Sans'] text-purple-600">
                            {auditStats.submissions}
                        </div>
                        <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">
                            Submitted
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                        <Clock className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                        <div className="text-lg font-extrabold font-['DM_Sans'] text-yellow-600">
                            {auditStats.pending}
                        </div>
                        <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">
                            Pending
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                        <div className="text-lg font-extrabold font-['DM_Sans'] text-green-600">
                            {auditStats.approvals}
                        </div>
                        <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">
                            Approved
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                        <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                        <div className="text-lg font-extrabold font-['DM_Sans'] text-red-500">
                            {auditStats.dismissals}
                        </div>
                        <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">
                            Dismissed
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                        <Shield className="w-5 h-5 text-[#1e3a8a] mx-auto mb-1" />
                        <div className="text-lg font-extrabold font-['DM_Sans'] text-[#1e3a8a]">
                            {auditStats.verifications}
                        </div>
                        <div className="text-[8px] font-bold font-['DM_Sans'] uppercase text-gray-400">
                            Verified
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
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
                    className="flex items-center gap-2 text-[#1e3a8a] text-xs font-bold font-['DM_Sans']">
                    <Filter className="w-3.5 h-3.5" />
                    Filter by Event Type
                    <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`}
                    />
                </button>

                {showFilters && (
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: "", label: "All" },
                            { key: "submitted", label: "Submissions" },
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
                                    typeFilter === t.key
                                        ? "bg-[#1f295b] text-white"
                                        : "bg-white text-gray-500 border border-gray-200"
                                }`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Audit Timeline */}
            <div className="w-full max-w-sm px-4 mt-5 space-y-5">
                {loading ? (
                    <div className="text-center py-12 text-gray-400 text-sm font-['DM_Sans']">
                        Loading audit logs...
                    </div>
                ) : Object.keys(groupedEntries).length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-300 text-4xl mb-3">📝</div>
                        <div className="text-gray-400 text-sm font-['DM_Sans']">
                            No audit entries found
                        </div>
                    </div>
                ) : (
                    Object.entries(groupedEntries).map(
                        ([date, entries]) => (
                            <div key={date}>
                                {/* Date Header */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="text-gray-400 text-[10px] font-bold font-['DM_Sans'] uppercase tracking-wider whitespace-nowrap">
                                        {date}
                                    </div>
                                    <div className="flex-1 h-[1px] bg-gray-200" />
                                </div>

                                {/* Timeline Card */}
                                <div className="w-full bg-white rounded-xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-gray-100 p-5">
                                    <div className="relative pl-7 border-l-[2px] border-gray-200 space-y-6">
                                        {entries.map((entry) => {
                                            const typeInfo =
                                                AUDIT_TYPES[entry.type] ||
                                                AUDIT_TYPES.modified
                                            const Icon = typeInfo.icon

                                            return (
                                                <div
                                                    key={entry.id}
                                                    className="relative">
                                                    {/* Timeline dot */}
                                                    <div
                                                        className={`w-8 h-8 ${typeInfo.bg} rounded-full flex items-center justify-center absolute -left-[43px] -top-1 border-[4px] border-white`}>
                                                        <Icon
                                                            className={`w-3.5 h-3.5 ${typeInfo.iconColor}`}
                                                        />
                                                    </div>

                                                    <div className="flex flex-col -mt-1">
                                                        {/* Description */}
                                                        <div className="text-zinc-800 text-[12px] font-semibold font-['DM_Sans'] leading-tight">
                                                            {entry.description}
                                                        </div>

                                                        {/* Review notes if present */}
                                                        {entry.notes && (
                                                            <div className="text-gray-400 text-[10px] font-normal font-['DM_Sans'] mt-1 line-clamp-2 italic">
                                                                "
                                                                {entry.notes}
                                                                "
                                                            </div>
                                                        )}

                                                        {/* Meta row */}
                                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                            <span className="text-gray-400 text-[10px] font-normal font-['DM_Sans']">
                                                                {formatTime(
                                                                    entry.timestamp,
                                                                )}
                                                            </span>
                                                            <span
                                                                className={`px-1.5 py-0.5 ${typeInfo.labelBg} ${typeInfo.labelText} text-[8px] font-bold font-['DM_Sans'] rounded tracking-wider`}>
                                                                {
                                                                    typeInfo.label
                                                                }
                                                            </span>
                                                            {entry.reviewedBy && (
                                                                <span className="text-gray-400 text-[9px] font-medium font-['DM_Sans']">
                                                                    by{" "}
                                                                    {
                                                                        entry.reviewedBy
                                                                    }
                                                                </span>
                                                            )}
                                                            {entry.category && (
                                                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-bold font-['DM_Sans'] rounded uppercase">
                                                                    {entry.category?.replace(
                                                                        "_",
                                                                        " ",
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ),
                    )
                )}
            </div>

            {/* System Info */}
            <div className="w-full max-w-sm px-4 mt-5">
                <div className="w-full bg-[#3b53cc] rounded-xl p-5">
                    <h3 className="text-white text-sm font-bold font-['DM_Sans'] mb-2">
                        Audit Compliance Notice
                    </h3>
                    <p className="text-blue-100 text-[11px] font-normal font-['DM_Sans'] leading-relaxed">
                        All administrative actions are logged and retained for
                        180 days per SafeMap data governance policy. Audit
                        records are immutable and tamper-proof.
                    </p>
                </div>
            </div>

            <div className="h-28"></div>

            <AdminBottomNav activeTab="audit" />

            {/* Back Button */}
            <button
                onClick={handleLogout}
                className="absolute top-4 left-4 p-2 flex items-center gap-2 text-gray-600 hover:text-blue-900">
                <img src={backImg} alt="Back" className="w-5 h-5" />
            </button>
        </div>
    )
}

export default AdminAuditPage
