import { useState, useEffect } from "react"
import AdminLayout from "../../../components/admin/AdminLayout"
import DashboardStats from "./DashboardStats"
import NeedReviewSection from "./NeedReviewSection"
import SystemAnnouncement from "./SystemAnnouncement"

function AdminDashboardPage() {
    const [stats, setStats] = useState(null)
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getAuthHeaders = () => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        })

        const fetchData = async () => {
            setLoading(true)
            try {
                const statsRes = await fetch('http://localhost:5000/api/reports/stats', { headers: getAuthHeaders() })
                if (statsRes.ok) {
                    const data = await statsRes.json()
                    setStats(data)
                }

                const reportsRes = await fetch('http://localhost:5000/api/reports/pending', { headers: getAuthHeaders() })
                if (reportsRes.ok) {
                    const data = await reportsRes.json()
                    setReports(data.reports || [])
                }
            } catch (err) {
                console.error('Error fetching data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <AdminLayout activeTab="dashboard">
            {/* Header Area */}
            <div className="w-full max-w-sm px-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-zinc-800 text-lg font-extrabold font-['DM_Sans']">Dashboard</h1>
                    <div className="px-3 py-1 bg-green-50 rounded-full border border-green-200">
                        <span className="text-green-500 text-[9px] font-bold font-['DM_Sans']">All Systems Operational</span>
                    </div>
                </div>
            </div>

            <DashboardStats stats={stats} />
            <NeedReviewSection reports={reports} loading={loading} />
            <SystemAnnouncement 
                title="Internal Announcement" 
                message="System-wide maintenance scheduled for Saturday 02:00 UTC. Audit logs will remain active." 
            />

        </AdminLayout>
    )
}

export default AdminDashboardPage
