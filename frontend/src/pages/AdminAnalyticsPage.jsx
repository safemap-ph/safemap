import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Download, MapPin } from "lucide-react"
import logoImg from "/src/assets/images/Logo.svg"
import backImg from "/src/assets/images/rpt_back.svg"
import AdminBottomNav from "../components/AdminBottomNav"
import IncidentHeatmapView from "../components/IncidentHeatmapView"

function AdminAnalyticsPage() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [heatPoints, setHeatPoints] = useState([])

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/admin")
            return
        }
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const headers = token ? { Authorization: `Bearer ${token}` } : {}

            // Fetch stats
            const statsRes = await fetch(
                "http://localhost:5000/api/reports/stats",
                { headers },
            )
            if (statsRes.status === 401) {
                localStorage.removeItem("token")
                navigate("/admin")
                return
            }
            if (statsRes.ok) {
                const data = await statsRes.json()
                setStats(data)
            }

            // Fetch heatmap points (admin endpoint – needs token)
            const heatRes = await fetch(
                "http://localhost:5000/api/reports/heatmap",
                { headers },
            )
            if (heatRes.status === 401) {
                localStorage.removeItem("token")
                navigate("/admin")
                return
            }
            if (heatRes.ok) {
                const data = await heatRes.json()
                setHeatPoints(data.points || [])
            }
        } catch (err) {
            console.error("Error fetching data:", err)
            // Leave heatPoints empty – map renders but without heatmap
        } finally {
            setLoading(false)
        }
    }

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

                <div className="flex flex-col gap-4 mt-2">
                    <h1 className="text-zinc-800 text-xl font-extrabold font-['DM_Sans']">
                        System Analytics & Trends
                    </h1>

                    <div className="flex gap-3">
                        <button className="flex-1 h-10 bg-white border border-[#1e3a8a] rounded-lg flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4 text-[#1e3a8a]" />
                            <span className="text-[#1e3a8a] text-xs font-bold font-['DM_Sans']">
                                Last 30 Days
                            </span>
                        </button>
                        <button className="flex-1 h-10 bg-[#1f295b] rounded-lg flex items-center justify-center gap-2">
                            <Download className="w-4 h-4 text-white" />
                            <span className="text-white text-xs font-bold font-['DM_Sans']">
                                Export Report
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            {/* Stats Cards */}
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
                <div className="w-full h-22 bg-white rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-orange-500 px-5 relative flex flex-col justify-center">
                    <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase">
                        Pending Review
                    </div>
                    <div className="text-[#1e3a8a] text-[28px] font-extrabold font-['DM_Sans'] leading-none mt-1 mb-1">
                        {stats?.pending_review || 0}
                    </div>
                </div>

                {/* Approved */}
                <div className="w-full h-22 bg-white rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-green-500 px-5 relative flex flex-col justify-center">
                    <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase">
                        Approved
                    </div>
                    <div className="text-[#1e3a8a] text-[28px] font-extrabold font-['DM_Sans'] leading-none mt-1 mb-1">
                        {stats?.public_visible || 0}
                    </div>
                </div>

                {/* Dismissed */}
                <div className="w-full h-22 bg-white rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] border-l-[6px] border-gray-400 px-5 relative flex flex-col justify-center">
                    <div className="text-gray-400 text-[11px] font-bold font-['DM_Sans'] uppercase">
                        Dismissed
                    </div>
                    <div className="text-[#1e3a8a] text-[28px] font-extrabold font-['DM_Sans'] leading-none mt-1 mb-1">
                        {stats?.by_status?.dismissed || 0}
                    </div>
                </div>
            </div>
            {/* Contains everything below in big white card backgrounds */}
            <div className="w-full max-w-sm px-4 mt-6 mb-8 space-y-4">
                {/* Incident Heatmap Placeholder */}
                <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] leading-tight">
                        Incident Heatmap
                    </h2>
                    <p className="text-gray-400 text-[10px] font-normal font-['DM_Sans'] mb-3">
                        INTERNAL USE ONLY: Detailed per-district density
                    </p>

                    <div className="w-full h-60 relative rounded-lg overflow-hidden border border-blue-100">
                        <IncidentHeatmapView heatPoints={heatPoints} />

                        <div className="absolute bottom-3 left-3 bg-[#1e3a8a] rounded-lg p-3 w-40 shadow-lg z-998">
                            <div className="text-blue-100 text-[9px] font-bold font-['DM_Sans'] tracking-wider mb-2">
                                DENSITY INDEX
                            </div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                <span className="text-white text-[10px] font-medium font-['DM_Sans']">
                                    Critical {">"} 15 cases
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                                <span className="text-white text-[10px] font-medium font-['DM_Sans']">
                                    Warning 5-14 cases
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recurring Hotspots */}
                <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 py-4 px-5">
                    <div className="flex items-center gap-2 mb-5">
                        <MapPin className="w-4 h-4 text-[#1e3a8a]" />
                        <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] leading-tight">
                            Recurring Hotspots
                        </h2>
                    </div>

                    <div className="space-y-5">
                        {(() => {
                            const locations = {}
                            heatPoints.forEach(p => {
                                const key = p.barangay || p.city || "Unknown"
                                if (!locations[key])
                                    locations[key] = {
                                        count: 0,
                                        severity: p.severity,
                                        name: key,
                                    }
                                locations[key].count++
                                if (p.severity === "critical")
                                    locations[key].severity = "critical"
                            })

                            const hotspots = Object.values(locations).filter(
                                l => l.count >= 2,
                            )

                            if (hotspots.length === 0) {
                                return (
                                    <div className="text-center py-4 text-gray-400 text-xs italic">
                                        No recurring hotspots detected (minimum
                                        2 reports required)
                                    </div>
                                )
                            }

                            return hotspots.map((spot, i) => (
                                <div
                                    key={i}
                                    className={`border-l-[3px] ${spot.severity === "critical" ? "border-red-500" : "border-orange-400"} pl-4 py-1 relative`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <div className="text-zinc-800 text-xs font-bold font-['DM_Sans']">
                                                {spot.name}
                                            </div>
                                            <div className="text-gray-400 text-[10px] font-normal font-['DM_Sans']">
                                                {spot.count} reports in this
                                                area.
                                            </div>
                                        </div>
                                        <div
                                            className={`px-2 py-0.5 ${spot.severity === "critical" ? "bg-red-100 text-red-500" : "bg-orange-100 text-orange-500"} rounded text-[9px] font-bold font-['DM_Sans']`}>
                                            {spot.severity === "critical"
                                                ? "High Risk"
                                                : "Developing"}
                                        </div>
                                    </div>
                                </div>
                            ))
                        })()}
                    </div>
                </div>

                {/* Case Composition */}
                <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 py-4 px-5">
                    <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] leading-tight mb-4">
                        Case Composition
                    </h2>
                    <div className="space-y-4">
                        {stats?.by_category &&
                        Object.keys(stats.by_category).length > 0 ? (
                            Object.entries(stats.by_category).map(
                                ([cat, count]) => {
                                    const pct = Math.round(
                                        (count / stats.total) * 100,
                                    )
                                    return (
                                        <div key={cat}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-zinc-800 text-[10px] font-bold font-['DM_Sans'] uppercase">
                                                    {cat.replace("_", " ")}
                                                </span>
                                                <span className="text-[#1e3a8a] text-[11px] font-extrabold font-['DM_Sans']">
                                                    {pct}%
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                                <div
                                                    className="h-full bg-[#1e3a8a] rounded-full"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                },
                            )
                        ) : (
                            <div className="text-center py-4 text-gray-400 text-xs italic">
                                No data available for case composition
                            </div>
                        )}
                    </div>
                </div>

                {/* Temporal Case Trends */}
                <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 py-4 px-5">
                    <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] leading-tight">
                        Temporal Case Trends
                    </h2>
                    <p className="text-gray-400 text-[10px] font-normal font-['DM_Sans'] mb-4">
                        Comparison of reported cases vs resolution velocity
                    </p>

                    <div className="flex gap-4 mb-6">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#1e3a8a]" />
                            <span className="text-gray-400 text-[10px] font-medium font-['DM_Sans']">
                                New Reports
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full border border-[#1e3a8a] bg-white" />
                            <span className="text-gray-400 text-[10px] font-medium font-['DM_Sans']">
                                Resolved Cases
                            </span>
                        </div>
                    </div>

                    <div className="relative h-50 w-full flex items-end justify-between px-2">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between p-0 m-0 z-0">
                            {[100, 80, 60, 40, 20, 0].map(val => (
                                <div
                                    key={val}
                                    className="w-full flex items-center gap-2">
                                    <span className="text-gray-400 text-[9px] w-4 text-right mb-px">
                                        {val}
                                    </span>
                                    <div className="flex-1 h-px border-b border-dashed border-gray-200" />
                                </div>
                            ))}
                        </div>

                        {/* Bars */}
                        <div className="relative z-10 w-full h-45 flex items-end justify-around ml-6">
                            <div className="w-4 bg-[#1e3a8a] h-[20%] rounded-t-sm" />
                            <div className="w-4 bg-[#1e3a8a] h-[40%] rounded-t-sm" />
                            <div className="w-4 bg-[#1e3a8a] h-[60%] rounded-t-sm" />
                            <div className="w-4 bg-[#1e3a8a] h-[35%] rounded-t-sm" />
                            <div className="w-4 bg-[#1e3a8a] h-[75%] rounded-t-sm" />
                            <div className="w-4 bg-[#1e3a8a] h-[55%] rounded-t-sm" />
                        </div>
                    </div>

                    <div className="flex justify-around ml-6 mt-2 pb-1 border-b border-gray-200">
                        <span className="text-gray-500 text-[9px] font-['DM_Sans']">
                            Jan
                        </span>
                        <span className="text-gray-500 text-[9px] font-['DM_Sans']">
                            Feb
                        </span>
                        <span className="text-gray-500 text-[9px] font-['DM_Sans']">
                            Mar
                        </span>
                        <span className="text-gray-500 text-[9px] font-['DM_Sans']">
                            Apr
                        </span>
                        <span className="text-gray-500 text-[9px] font-['DM_Sans']">
                            May
                        </span>
                        <span className="text-gray-500 text-[9px] font-['DM_Sans']">
                            Jun
                        </span>
                    </div>
                    <div className="flex justify-center items-center mt-2.5 gap-1.5">
                        <div className="w-1.5 h-1.5 bg-[#1e3a8a]" />
                        <span className="text-gray-500 text-[9px] font-['DM_Sans']">
                            2026
                        </span>
                    </div>
                </div>

                {/* Critical Anomalies & Priority Flags */}
                <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 py-4 px-5">
                    <h2 className="text-zinc-800 text-[15px] font-extrabold font-['DM_Sans'] leading-tight mb-4">
                        Critical Anomalies & Priority Flags
                    </h2>

                    <div className="w-full">
                        <div className="grid grid-cols-[80px_1fr_60px_60px] gap-2 pb-2 border-b border-gray-100">
                            <div className="text-gray-400 text-[9px] font-bold font-['DM_Sans']">
                                Flag Time
                            </div>
                            <div className="text-gray-400 text-[9px] font-bold font-['DM_Sans']">
                                Metric Type
                            </div>
                            <div className="text-gray-400 text-[9px] font-bold font-['DM_Sans']">
                                Region
                            </div>
                            <div className="text-gray-400 text-[9px] font-bold font-['DM_Sans']">
                                Severity
                            </div>
                        </div>

                        <div className="grid grid-cols-[80px_1fr_60px_60px] gap-2 py-4 border-b border-gray-100 items-center">
                            <div className="text-zinc-800 text-[9px] font-medium font-['DM_Sans']">
                                2023-08-14
                                <br />
                                09:21
                            </div>
                            <div className="text-[#1e3a8a] text-[10px] font-bold font-['DM_Sans'] leading-tight">
                                Hotspot Cluster
                                <br />
                                Detected
                            </div>
                            <div className="text-[#1e3a8a] text-[9px] font-medium font-['DM_Sans']">
                                District 4
                            </div>
                            <div>
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-500 text-[8px] font-bold font-['DM_Sans'] rounded">
                                    CRITICAL
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-[80px_1fr_60px_60px] gap-2 py-4 border-b border-gray-100 items-center">
                            <div className="text-zinc-800 text-[9px] font-medium font-['DM_Sans']">
                                2023-08-14
                                <br />
                                11:46
                            </div>
                            <div className="text-[#1e3a8a] text-[10px] font-bold font-['DM_Sans'] leading-tight">
                                SLA Violation
                                <br />
                                Alert
                            </div>
                            <div className="text-[#1e3a8a] text-[9px] font-medium font-['DM_Sans']">
                                District 2
                            </div>
                            <div>
                                <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-600 text-[8px] font-bold font-['DM_Sans'] rounded">
                                    WARNING
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-28"></div> {/* Spacer for bottom nav */}
            {/* Bottom Navigation */}
            <AdminBottomNav activeTab="analytics" />
            {/* Back Button */}
            <button
                onClick={handleLogout}
                className="absolute top-4 left-4 p-2 flex items-center gap-2 text-gray-600 hover:text-blue-900">
                <img src={backImg} alt="Back" className="w-5 h-5" />
            </button>
        </div>
    )
}

export default AdminAnalyticsPage
