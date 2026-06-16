import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE } from "@/lib/api-base"
import { Check, Edit2, Ban, LogIn, Search, Shield, Mail } from "lucide-react"
import logoImg from "/src/assets/images/Logo.svg"
import backImg from "/src/assets/images/rpt_back.svg"
import AdminBottomNav from "../components/AdminBottomNav"

function AdminDashboardPage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("dashboard")
    const [reports, setReports] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/admin")
            return
        }
        fetchData()
    }, [activeTab])

    const getAuthHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    })

    const fetchData = async () => {
        const token = localStorage.getItem("token")
        if (!token) return

        setLoading(true)
        try {
            if (activeTab === "dashboard" || activeTab === "review") {
                const response = await fetch(
                    `${API_BASE}/reports/pending`,
                    {
                        headers: getAuthHeaders(),
                    },
                )
                if (response.status === 401) {
                    localStorage.removeItem("token")
                    navigate("/admin")
                    return
                }
                if (response.ok) {
                    const data = await response.json()
                    setReports(data.reports || [])
                }
            }
            if (activeTab === "dashboard" || activeTab === "analytics") {
                const response = await fetch(
                    `${API_BASE}/reports/stats`,
                    {
                        headers: getAuthHeaders(),
                    },
                )
                if (response.status === 401) {
                    localStorage.removeItem("token")
                    navigate("/admin")
                    return
                }
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            }
        } catch (err) { /* ignore */ } finally {
            setLoading(false)
        }
    }

    const handleApprove = async reportId => {
        if (!confirm("Are you sure you want to resolve this report?")) return

        try {
            const response = await fetch(
                `${API_BASE}/reports/${reportId}/verify`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        notes: "Verified by administrator",
                        case_number: "ADMIN-RESOLVED",
                    }),
                },
            )
            if (response.ok) {
                fetchData()
            } else {
                const data = await response.json()
                alert(data.error || "Failed to resolve report")
            }
        } catch (err) {
            alert("Network error. Please try again.")
        }
    }

    const handleDismiss = async reportId => {
        const reason = prompt(
            "Enter dismissal reason (optional):",
            "Dismissed by admin",
        )
        if (reason === null) return

        if (!confirm("Are you sure you want to dismiss this report?")) return

        try {
            const response = await fetch(
                `${API_BASE}/reports/${reportId}/dismiss`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ reason }),
                },
            )
            if (response.ok) {
                fetchData()
            } else {
                const data = await response.json()
                alert(data.error || "Failed to dismiss report")
            }
        } catch (err) {
            alert("Network error. Please try again.")
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/admin")
    }

    const getStatusColor = status => {
        switch (status) {
            case "pending_review":
                return "border-amber-500"
            case "in_progress":
                return "border-blue-900"
            case "verified":
            case "verified_pnp":
                return "border-green-500"
            case "dismissed":
                return "border-red-500"
            default:
                return "border-gray-300"
        }
    }

    const getStatusBadge = status => {
        switch (status) {
            case "pending_review":
                return "bg-amber-100 text-amber-600 border-amber-200"
            case "in_progress":
                return "bg-blue-100 text-blue-900 border-blue-200"
            case "verified":
            case "verified_pnp":
                return "bg-green-100 text-green-600 border-green-200"
            case "dismissed":
                return "bg-red-100 text-red-500 border-red-200"
            default:
                return "bg-gray-100 text-gray-500 border-gray-200"
        }
    }

    const getStatusLabel = status => {
        switch (status) {
            case "pending_review":
                return "Pending Review"
            case "in_progress":
                return "In Progress"
            case "verified":
            case "verified_pnp":
                return "Resolved"
            case "dismissed":
                return "Dismissed"
            default:
                return status
        }
    }

    const getCategoryColor = category => {
        switch (category?.toLowerCase()) {
            case "sexual_assault":
                return "bg-red-100 text-red-500"
            case "physical_abuse":
                return "bg-red-100 text-red-500"
            case "domestic_violence":
                return "bg-red-100 text-red-500"
            case "stalking":
                return "bg-amber-100 text-amber-500"
            case "verbal_abuse":
                return "bg-yellow-100 text-yellow-500"
            case "emotional_abuse":
                return "bg-yellow-100 text-yellow-500"
            default:
                return "bg-gray-100 text-gray-500"
        }
    }

    return (
        <div className="w-full min-h-screen bg-slate-50 overflow-x-hidden flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-sm px-4 pt-8 pb-2">
                {/* Top row: logo centered, icons right */}
                <div className="relative flex items-center justify-center mb-5">
                    <img className="h-12 w-auto" src={logoImg} alt="SafeMap" />
                    {/* Bell + Avatar */}
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

                {/* Dashboard title row + status badge */}
                <div className="flex items-center justify-between">
                    <h1 className="text-zinc-800 text-2xl font-extrabold font-['DM_Sans']">
                        Dashboard
                    </h1>
                    <div className="px-3 py-1.5 bg-green-50 rounded-full border border-emerald-100 flex items-center">
                        <span className="text-green-500 text-[11px] font-semibold font-['DM_Sans']">
                            All Systems Operational
                        </span>
                    </div>
                </div>
            </div>
            {/* Stats Cards */}
            <div className="w-full max-w-sm px-4 mt-6 space-y-3">
                {/* Active Cases */}
                <div className="w-full h-18 bg-white rounded-r-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[5px] border-blue-500 px-5 flex flex-col justify-center gap-1">
                    <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase tracking-wide">
                        Total Reports
                    </div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-[#1e3a8a] text-[26px] font-extrabold font-['DM_Sans'] leading-none">
                            {stats?.total || 0}
                        </div>
                    </div>
                </div>

                {/* Pending Review */}
                <div className="w-full h-18 bg-white rounded-r-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[5px] border-amber-500 px-5 flex flex-col justify-center gap-1">
                    <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase tracking-wide">
                        Pending Review
                    </div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-[#1e3a8a] text-[26px] font-extrabold font-['DM_Sans'] leading-none">
                            {stats?.pending_review || 0}
                        </div>
                    </div>
                </div>

                {/* Resolved Reports */}
                <div className="w-full h-18 bg-white rounded-r-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[5px] border-green-500 px-5 flex flex-col justify-center gap-1">
                    <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase tracking-wide">
                        Resolved Reports
                    </div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-[#1e3a8a] text-[26px] font-extrabold font-['DM_Sans'] leading-none">
                            {stats?.pnp_verified || 0}
                        </div>
                    </div>
                </div>
            </div>
            {/* Need Review Section */}
            <div className="mt-8 px-4 w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-zinc-800 text-lg font-extrabold font-['DM_Sans']">
                        Need Review
                    </div>
                    <div
                        onClick={() => navigate("/admin-queue")}
                        className="text-blue-900 text-xs font-bold font-['DM_Sans'] cursor-pointer hover:underline">
                        View Queue
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">
                        Loading...
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No pending reports
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.slice(0, 3).map(report => (
                            <div
                                key={report.id}
                                className={`w-full bg-white rounded-xl shadow-sm border-l-[5px] ${getStatusColor(report.status)} p-4 flex flex-col gap-3 relative`}>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                        <div className="w-4 h-3.5 bg-red-500 rounded-sm" />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="text-gray-400 text-[10px] font-semibold font-['DM_Sans']">
                                                {report.reference_code ||
                                                    `SF-${report.id}`}
                                            </div>
                                            <div
                                                className={`px-2 py-0.5 rounded text-[9px] font-bold font-['DM_Sans'] uppercase ${getStatusBadge(report.status)}`}>
                                                {getStatusLabel(report.status)}
                                            </div>
                                            <div className="px-2 py-0.5 bg-gray-100 rounded text-gray-500 text-[9px] font-bold font-['DM_Sans'] uppercase">
                                                {report.category
                                                    ?.replace("_", " ")
                                                    .toUpperCase() || "REPORT"}
                                            </div>
                                        </div>
                                        <div className="text-zinc-800 text-sm font-bold font-['DM_Sans'] leading-tight">
                                            {report.title || "Untitled Report"}
                                        </div>
                                        <div className="text-gray-500 text-xs font-normal font-['DM_Sans'] flex items-center gap-1.5 pt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                            {report.barangay ||
                                                report.city ||
                                                "General Santos City"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-100">
                                    <div className="text-gray-400 text-xs font-normal font-['DM_Sans']">
                                        {new Date(
                                            report.created_at,
                                        ).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                handleDismiss(report.id)
                                            }
                                            className="h-8 px-3 bg-red-50 hover:bg-red-100 transition-colors rounded-lg flex items-center justify-center cursor-pointer">
                                            <span className="text-red-500 text-xs font-bold font-['DM_Sans']">
                                                Dismiss
                                            </span>
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleApprove(report.id)
                                            }
                                            className="h-8 px-3 bg-[#1f295b] hover:bg-[#151c3d] transition-colors rounded-lg flex items-center justify-center cursor-pointer">
                                            <span className="text-white text-xs font-bold font-['DM_Sans']">
                                                Resolve
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Audit Feed */}
            <div className="mt-8 px-4 w-full max-w-sm">
                <div className="text-zinc-800 text-lg font-extrabold font-['DM_Sans'] mb-4">
                    Audit Feed
                </div>
                <div className="w-full bg-white rounded-xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] outline -outline-offset-1 outline-gray-100 p-6 flex justify-center">
                    <div className="relative pl-6 border-l-[1.5px] border-gray-200 space-y-8 w-full max-w-70">
                        {/* Audit items */}
                        <div className="relative">
                            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center absolute -left-10.25 -top-1 border-4 border-white">
                                <Check className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <div className="flex flex-col -mt-1">
                                <div className="text-zinc-800 text-sm font-semibold font-['DM_Sans'] leading-tight">
                                    Admin-04 approved Case #
                                    {reports[0]?.reference_code || "SF-8291"}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-400 text-xs font-normal font-['DM_Sans']">
                                        12:42 PM
                                    </span>
                                    <span className="text-gray-500 text-[10px] font-bold font-['DM_Sans'] uppercase">
                                        SECURITY_ACTION
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center absolute -left-10.25 -top-1 border-4 border-white">
                                <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <div className="flex flex-col -mt-1">
                                <div className="text-zinc-800 text-sm font-semibold font-['DM_Sans'] leading-tight">
                                    Staff-21 updated description for #SF-8110
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-400 text-xs font-normal font-['DM_Sans']">
                                        11:15 AM
                                    </span>
                                    <span className="text-gray-500 text-[10px] font-bold font-['DM_Sans'] uppercase">
                                        META_UPDATE
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center absolute -left-10.25 -top-1 border-4 border-white">
                                <Ban className="w-3.5 h-3.5 text-red-500" />
                            </div>
                            <div className="flex flex-col -mt-1">
                                <div className="text-zinc-800 text-sm font-semibold font-['DM_Sans'] leading-tight">
                                    System flagged #SF-8299 as duplicate
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-400 text-xs font-normal font-['DM_Sans']">
                                        10:02 AM
                                    </span>
                                    <span className="text-gray-500 text-[10px] font-bold font-['DM_Sans'] uppercase">
                                        AUTO_MOD
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center absolute -left-10.25 -top-1 border-4 border-white">
                                <LogIn className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div className="flex flex-col -mt-1">
                                <div className="text-zinc-800 text-sm font-semibold font-['DM_Sans'] leading-tight">
                                    Admin-01 signed into HQ Terminal
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-400 text-xs font-normal font-['DM_Sans']">
                                        08:00 AM
                                    </span>
                                    <span className="text-gray-500 text-[10px] font-bold font-['DM_Sans'] uppercase">
                                        AUTH_EVENT
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Staff Management */}
            <div className="mt-8 px-4 w-full max-w-sm">
                {/* Search */}
                <div className="mt-4 mb-8">
                    <div className="w-full h-12 bg-white rounded-xl outline -outline-offset-1 outline-gray-200 flex items-center px-4 gap-3 shadow-sm">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search staff members..."
                            className="flex-1 bg-transparent outline-none text-sm font-normal text-zinc-800 font-['DM_Sans'] placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-5">
                    <div className="text-zinc-800 text-lg font-extrabold font-['DM_Sans']">
                        Staff Management
                    </div>
                    {/* Add New Staff Button */}
                    <button className="h-8 px-4 bg-[#1f295b] rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold font-['DM_Sans']">
                            + Add New Staff
                        </span>
                    </button>
                </div>

                {/* Staff List */}
                <div className="flex flex-col gap-5">
                    {/* Staff 1: Linda Walker */}
                    <div className="w-full bg-white rounded-xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-[#1e3a8a] py-5 px-6 relative">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-gray-400 text-[10px] font-bold font-['DM_Sans'] tracking-wider">
                                EMP-ID: 8829 - X
                            </span>
                            <div className="px-2.5 py-1 bg-[#eff6ff] rounded text-[#1e40af] text-[9px] font-bold font-['DM_Sans'] tracking-wider">
                                ACTIVE
                            </div>
                        </div>

                        <div className="mb-5">
                            <div className="text-[#1e3a8a] text-lg font-bold font-['DM_Sans'] mb-2.5">
                                Linda Walker
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="text-gray-500 text-xs font-medium font-['DM_Sans'] text-left">
                                        Administrator
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="text-gray-500 text-xs font-medium font-['DM_Sans'] text-left">
                                        walkerlinda_safemapph@gmail.com
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex-1 h-8 bg-[#eff6ff] rounded flex items-center justify-center gap-2">
                                <Edit2 className="w-3 h-3 text-[#1e3a8a]" />
                                <span className="text-[#1e3a8a] text-xs font-bold font-['DM_Sans']">
                                    Edit
                                </span>
                            </button>
                            <button className="flex-1 h-8 bg-[#ffe4e6] rounded flex items-center justify-center">
                                <span className="text-[#ef4444] text-xs font-bold font-['DM_Sans']">
                                    Deactivate
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Staff 2: Kritaffa Abaok */}
                    <div className="w-full bg-white rounded-xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-[#1e3a8a] py-5 px-6 relative">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-gray-400 text-[10px] font-bold font-['DM_Sans'] tracking-wider">
                                EMP-ID: 4412 - X
                            </span>
                            <div className="px-2.5 py-1 bg-[#eff6ff] rounded text-[#1e40af] text-[9px] font-bold font-['DM_Sans'] tracking-wider">
                                ACTIVE
                            </div>
                        </div>

                        <div className="mb-5">
                            <div className="text-[#1e3a8a] text-lg font-bold font-['DM_Sans'] mb-2.5">
                                Kritaffa Abaok
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="text-gray-500 text-xs font-medium font-['DM_Sans'] text-left">
                                        Senior Developer
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="text-gray-500 text-xs font-medium font-['DM_Sans'] text-left">
                                        kristaffa_safemaphph@gmail.com
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex-1 h-8 bg-[#eff6ff] rounded flex items-center justify-center gap-2">
                                <Edit2 className="w-3 h-3 text-[#1e3a8a]" />
                                <span className="text-[#1e3a8a] text-xs font-bold font-['DM_Sans']">
                                    Edit
                                </span>
                            </button>
                            <button className="flex-1 h-8 bg-[#ffe4e6] rounded flex items-center justify-center">
                                <span className="text-[#ef4444] text-xs font-bold font-['DM_Sans']">
                                    Deactivate
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Staff 3: Elias Thorne */}
                    <div className="w-full bg-[#fafafa] rounded-xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-[#e5e7eb] py-5 px-6 relative">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-gray-400 text-[10px] font-bold font-['DM_Sans'] tracking-wider">
                                EMP-ID: 9901 - X
                            </span>
                            <div className="px-2.5 py-1 bg-[#e5e7eb] rounded text-gray-500 text-[9px] font-bold font-['DM_Sans'] tracking-wider">
                                OFFLINE
                            </div>
                        </div>

                        <div className="mb-5">
                            <div className="text-gray-500 text-lg font-bold font-['DM_Sans'] mb-2.5">
                                Elias Thorne
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="text-gray-500 text-xs font-medium font-['DM_Sans'] text-left">
                                        Network Admin
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="text-gray-500 text-xs font-medium font-['DM_Sans'] text-left">
                                        eliasthorne_safemaphph@gmail.com
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex-1 h-8 bg-[#eff6ff] rounded flex items-center justify-center gap-2">
                                <Edit2 className="w-3 h-3 text-[#1e3a8a]" />
                                <span className="text-[#1e3a8a] text-xs font-bold font-['DM_Sans']">
                                    Edit
                                </span>
                            </button>
                            <button className="flex-1 h-8 bg-[#ffe4e6] rounded flex items-center justify-center">
                                <span className="text-[#ef4444] text-xs font-bold font-['DM_Sans']">
                                    Deactivate
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Internal Announcement */}
                    <div className="w-full bg-[#3b53cc] rounded-xl p-5 mt-2">
                        <h3 className="text-white text-sm font-bold font-['DM_Sans'] mb-2">
                            Internal Announcement
                        </h3>
                        <p className="text-blue-100 text-[12px] font-normal font-['DM_Sans'] leading-relaxed pr-8">
                            System-wide maintenance scheduled for Saturday 02:00
                            UTC. Audit logs will remain active.
                        </p>
                    </div>
                </div>
            </div>
            <div className="h-28"></div> {/* Spacer for bottom nav */}
            {/* Bottom Navigation */}
            <AdminBottomNav activeTab="dashboard" />
            {/* Back Button */}
            <button
                onClick={handleLogout}
                className="absolute top-4 left-4 p-2 flex items-center gap-2 text-gray-600 hover:text-blue-900">
                <img src={backImg} alt="Back" className="w-5 h-5" />
            </button>
        </div>
    )
}

export default AdminDashboardPage
