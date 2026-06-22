import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import {
    Search,
    Filter,
    Clock,
    ChevronDown,
    X,
    MapPin,
    Calendar,
    Tag,
    AlertCircle,
} from "lucide-react"
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
        approved: 0,
        dismissed: 0,
        total: 0,
    })
    const [selectedReport, setSelectedReport] = useState(null)

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search)
        const reportId = queryParams.get("id")
        if (reportId) {
            setSearchQuery(reportId)
            setStatusFilter("") // Show all statuses if searching for specific ID
        }
    }, [location.search])

    useEffect(() => {
        fetchData()
    }, [statusFilter, categoryFilter])

    const getAuthHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    })

    const fetchData = async () => {
        const token = localStorage.getItem("token")
        if (!token) return

        setLoading(true)
        try {
            let url = "http://localhost:5000/api/reports?per_page=50"
            if (statusFilter) url += `&status=${statusFilter}`
            if (categoryFilter) url += `&category=${categoryFilter}`

            const response = await fetch(url, { headers: getAuthHeaders() })
            if (response.status === 401) {
                localStorage.removeItem("token")
                window.location.href = "/admin"
                return
            }
            if (response.ok)
                setAllReports((await response.json()).reports || [])

            const statsRes = await fetch(
                "http://localhost:5000/api/reports/stats",
                { headers: getAuthHeaders() },
            )
            if (statsRes.status === 401) {
                localStorage.removeItem("token")
                window.location.href = "/admin"
                return
            }
            if (statsRes.ok) {
                const data = await statsRes.json()
                setStats({
                    pending: data.pending_review || 0,
                    approved: data.public_visible || 0,
                    dismissed: data.by_status?.dismissed || 0,
                    total: data.total || 0,
                })
            }
        } catch (err) {
            console.error("Error fetching data:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async id => {
        try {
            const res = await fetch(
                `http://localhost:5000/api/reports/${id}/approve`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        notes: "Approved for public awareness",
                    }),
                },
            )
            if (res.ok) fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    const handleDismiss = async id => {
        try {
            const res = await fetch(
                `http://localhost:5000/api/reports/${id}/dismiss`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ reason: "Dismissed by admin" }),
                },
            )
            if (res.ok) fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    const handleView = report => {
        setSelectedReport(report)
    }

    const filteredReports = allReports.filter(r => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            (r.title || "").toLowerCase().includes(q) ||
            (r.reference_code || "").toLowerCase().includes(q) ||
            (r.category || "").toLowerCase().includes(q) ||
            (r.location?.barangay || "").toLowerCase().includes(q)
        )
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

    return (
        <AdminLayout activeTab="queue">
            <div className="w-full max-w-sm px-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-zinc-800 text-2xl font-extrabold font-['DM_Sans']">
                        Report Queue
                    </h1>
                    <div className="px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className="text-amber-600 text-[11px] font-semibold font-['DM_Sans']">
                            {stats.pending} Pending
                        </span>
                    </div>
                </div>
            </div>

            <QueueStatsBar
                stats={stats}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
            />

            {/* Search & Filters */}
            <div className="w-full max-w-sm px-4 mt-4 space-y-3">
                <div className="w-full h-12 bg-white rounded-xl outline-1 -outline-offset-1 outline-gray-200 flex items-center px-4 gap-3 shadow-sm">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title, code, category..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm font-normal text-zinc-800 font-['DM_Sans'] placeholder-gray-400"
                    />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-[#1e3a8a] text-xs font-bold font-['DM_Sans']">
                    <Filter className="w-3.5 h-3.5" />
                    Filter by Category
                    <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`}
                    />
                </button>

                {showFilters && (
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-['DM_Sans'] uppercase transition-colors ${
                                    categoryFilter === cat
                                        ? "bg-[#1f295b] text-white"
                                        : "bg-white text-gray-500 border border-gray-200"
                                }`}>
                                {cat ? cat.replace("_", " ") : "All Categories"}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Report Cards */}
            <div className="w-full max-w-sm px-4 mt-5 space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-gray-400 text-sm font-['DM_Sans']">
                        Loading reports...
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-300 text-4xl mb-3">📋</div>
                        <div className="text-gray-400 text-sm font-['DM_Sans']">
                            No reports found
                        </div>
                    </div>
                ) : (
                    filteredReports.map(report => (
                        <QueueReportCard
                            key={report.id}
                            report={report}
                            onApprove={handleApprove}
                            onDismiss={handleDismiss}
                            onView={handleView}
                        />
                    ))
                )}
            </div>

            {/* Report Details Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-[#1f295b] text-white">
                            <div>
                                <h3 className="font-bold text-lg leading-tight">
                                    Report Details
                                </h3>
                                <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">
                                    {selectedReport.reference_code ||
                                        `SF-${selectedReport.id}`}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                {/* Status & Severity */}
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                            Status
                                        </span>
                                        <span
                                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                selectedReport.status ===
                                                "pending_review"
                                                    ? "bg-amber-100 text-amber-600"
                                                    : selectedReport.status ===
                                                        "approved_awareness"
                                                      ? "bg-green-100 text-green-600"
                                                      : selectedReport.status ===
                                                          "verified_pnp"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-red-100 text-red-500"
                                            }`}>
                                            {selectedReport.status.replace(
                                                "_",
                                                " ",
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight text-right">
                                            Severity
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className={`w-2.5 h-2.5 rounded-full ${
                                                    selectedReport.severity ===
                                                    "critical"
                                                        ? "bg-red-500"
                                                        : selectedReport.severity ===
                                                            "high"
                                                          ? "bg-orange-500"
                                                          : selectedReport.severity ===
                                                              "medium"
                                                            ? "bg-amber-400"
                                                            : "bg-green-400"
                                                }`}
                                            />
                                            <span className="text-xs font-bold text-gray-700 capitalize">
                                                {selectedReport.severity}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Title & Category */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Tag className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">
                                            Title & Category
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <h4 className="text-zinc-800 font-bold text-sm mb-1">
                                            {selectedReport.title ||
                                                "Untitled Report"}
                                        </h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">
                                            {selectedReport.category?.replace(
                                                "_",
                                                " ",
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">
                                            Incident Description
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 italic text-gray-600 text-sm leading-relaxed">
                                        "{selectedReport.description}"
                                    </div>
                                </div>

                                {/* Location Details */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">
                                            Location Details
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-gray-400 font-bold">
                                                BARANGAY
                                            </span>
                                            <span className="text-xs font-bold text-gray-700">
                                                {selectedReport.location
                                                    ?.barangay || "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-gray-400 font-bold">
                                                CITY
                                            </span>
                                            <span className="text-xs font-bold text-gray-700">
                                                {selectedReport.location
                                                    ?.city ||
                                                    "General Santos City"}
                                            </span>
                                        </div>
                                        {selectedReport.location?.address && (
                                            <div className="pt-2 border-t border-gray-200 mt-2">
                                                <span className="text-[10px] text-gray-400 font-bold block mb-1">
                                                    SPECIFIC ADDRESS
                                                </span>
                                                <p className="text-xs text-gray-600 leading-tight">
                                                    {
                                                        selectedReport.location
                                                            .address
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="space-y-2 pb-2">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">
                                            Submission Date
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between">
                                        <span className="text-xs font-bold text-gray-700">
                                            {new Date(
                                                selectedReport.created_at,
                                            ).toLocaleDateString("en-US", {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400">
                                            {new Date(
                                                selectedReport.created_at,
                                            ).toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50 border-t flex gap-3">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}

export default AdminQueuePage
