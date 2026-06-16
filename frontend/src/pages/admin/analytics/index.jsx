import { useState, useEffect } from "react"
import { API_BASE } from "@/lib/api-base"
import { Calendar, Download } from "lucide-react"
import AdminLayout from "../../../components/admin/AdminLayout"
import StatsCards from "./StatsCards"
import HeatmapSection from "./HeatmapSection"
import RecurringHotspots from "./RecurringHotspots"
import CaseComposition from "./CaseComposition"
import TemporalTrends from "./TemporalTrends"
import CriticalAnomalies from "./CriticalAnomalies"

function AdminAnalyticsPage() {
    const [stats, setStats] = useState(null)
    const [heatPoints, setHeatPoints] = useState([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const token = localStorage.getItem("token")
        if (!token) return

        try {
            const headers = { Authorization: `Bearer ${token}` }

            const statsRes = await fetch(`${API_BASE}/reports/stats`, { headers })
            if (statsRes.status === 401) {
                localStorage.removeItem("token")
                window.location.href = "/admin"
                return
            }
            if (statsRes.ok) setStats(await statsRes.json())

            const heatRes = await fetch(`${API_BASE}/reports/heatmap`, { headers })
            if (heatRes.status === 401) {
                localStorage.removeItem("token")
                window.location.href = "/admin"
                return
            }
            if (heatRes.ok) {
                const data = await heatRes.json()
                setHeatPoints(data.points || [])
            }
        } catch (err) { /* ignore */ }
    }

    return (
        <AdminLayout activeTab="analytics">
            {/* Title & Actions — rendered inside the header's max-w-sm container */}
            <div className="w-full max-w-sm px-4">
                <div className="flex flex-col gap-4 mt-2">
                    <h1 className="text-zinc-800 text-xl font-extrabold font-['DM_Sans']">
                        System Analytics & Trends
                    </h1>
                    <div className="flex gap-3">
                        <button className="flex-1 h-10 bg-white border border-[#1e3a8a] rounded-lg flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4 text-[#1e3a8a]" />
                            <span className="text-[#1e3a8a] text-xs font-bold font-['DM_Sans']">Last 30 Days</span>
                        </button>
                        <button className="flex-1 h-10 bg-[#1f295b] rounded-lg flex items-center justify-center gap-2">
                            <Download className="w-4 h-4 text-white" />
                            <span className="text-white text-xs font-bold font-['DM_Sans']">Export Report</span>
                        </button>
                    </div>
                </div>
            </div>

            <StatsCards stats={stats} />

            <div className="w-full max-w-sm px-4 mt-6 mb-8 space-y-4">
                <HeatmapSection heatPoints={heatPoints} />
                <RecurringHotspots />
                <CaseComposition />
                <TemporalTrends />
                <CriticalAnomalies />
            </div>
        </AdminLayout>
    )
}

export default AdminAnalyticsPage
