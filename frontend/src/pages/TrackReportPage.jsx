import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { API_BASE } from "@/lib/api-base"
import logoImg from "/src/assets/images/Logo.svg"
import rptBackImg from "/src/assets/images/rpt_back.svg"
import { Button } from "@/components/ui/button"
import BottomNav from "@/components/BottomNav"

export default function TrackReportPage() {
    const navigate = useNavigate()
    const [referenceCode, setReferenceCode] = useState("")
    const [recentSearches, setRecentSearches] = useState([])
    const [reportStatus, setReportStatus] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("recentSearches")
        if (saved) {
            setRecentSearches(JSON.parse(saved))
        }
    }, [])

    // Save to recent searches
    const addToRecentSearches = code => {
        const updated = [code, ...recentSearches.filter(c => c !== code)].slice(
            0,
            3,
        )
        setRecentSearches(updated)
        localStorage.setItem("recentSearches", JSON.stringify(updated))
    }

    // Handle track now
    const handleTrackNow = async () => {
        if (!referenceCode.trim()) {
            setError("Please enter a reference code")
            return
        }

        setLoading(true)
        setError("")
        setReportStatus(null)

        try {
            const response = await fetch(
                `${API_BASE}/reports/reference/${referenceCode.trim()}`,
            )
            const data = await response.json()

            if (response.ok) {
                setReportStatus(data)
                addToRecentSearches(referenceCode.trim())
            } else {
                setError(data.error || "Report not found")
            }
        } catch (err) {
            setError("Failed to fetch report. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Handle recent search click
    const handleRecentSearchClick = code => {
        setReferenceCode(code)
    }

    // Handle reset
    const handleReset = () => {
        setReferenceCode("")
        setReportStatus(null)
        setError("")
    }

    // Get status color
    const getStatusColor = status => {
        switch (status) {
            case "pending_review":
                return "bg-amber-500"
            case "in_progress":
                return "bg-blue-900"
            case "verified":
            case "verified_pnp":
                return "bg-green-500"
            case "dismissed":
                return "bg-red-500"
            default:
                return "bg-gray-500"
        }
    }

    // Get status label
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
                return "Unknown"
        }
    }

    return (
        <div className="w-full min-h-screen bg-slate-50 flex flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-20">
                {/* Header */}
                <div className="relative w-full h-auto p-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-2 top-4 p-2 hover:bg-gray-100 z-10">
                        <img src={rptBackImg} alt="Back" className="w-6 h-6" />
                    </button>

                    <div className="flex flex-col items-center pt-8">
                        <img
                            src={logoImg}
                            alt="SafeMap"
                            className="h-11 mb-2"
                        />
                    </div>
                </div>

                {/* Title with Reset */}
                <div className="w-full max-w-md mx-auto px-4 flex items-center justify-between">
                    <div className="text-zinc-800 text-lg font-extrabold font-['DM_Sans'] tracking-tight">
                        Track My Report
                    </div>
                    <button
                        onClick={handleReset}
                        className="text-blue-900 text-base font-semibold font-['DM_Sans'] tracking-tight">
                        Reset
                    </button>
                </div>

                {/* Divider */}
                <div className="w-full max-w-md mx-auto border-t border-gray-200" />

                {/* Content */}
                <div className="w-full max-w-md mx-auto px-4 mt-4">
                    {/* Description */}
                    <div className="flex flex-col gap-1.5 mb-4">
                        <div className="text-neutral-600 text-base font-bold font-['DM_Sans'] tracking-tight">
                            Report Status
                        </div>
                        <div className="text-gray-500 text-xs font-medium font-['DM_Sans'] tracking-tight">
                            Enter your unique reference code to track the
                            real-time progress of your submitted safety report.
                        </div>
                    </div>

                    {/* Reference Code Input */}
                    <div className="mb-4">
                        <div className="text-neutral-600 text-xs font-medium font-['DM_Sans'] tracking-tight mb-2">
                            Reference Code
                        </div>
                        <input
                            type="text"
                            value={referenceCode}
                            onChange={e => {
                                setReferenceCode(e.target.value)
                                setError("")
                            }}
                            onKeyPress={e =>
                                e.key === "Enter" && handleTrackNow()
                            }
                            placeholder="e.g. SMPH-A1B2C3"
                            className="w-full h-12 bg-white rounded-xl border border-gray-300 px-4 text-gray-800 text-sm"
                        />
                        {error && (
                            <div className="text-red-500 text-xs mt-1">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Track Now Button */}
                    <Button
                        onClick={handleTrackNow}
                        disabled={loading}
                        className="w-full h-14 bg-blue-900 rounded-2xl shadow-[0px_4px_16px_0px_rgba(59,91,219,0.35)] mb-2">
                        <span className="text-white text-base font-semibold font-['DM_Sans'] tracking-tight">
                            {loading ? "Tracking..." : "Track Now"}
                        </span>
                    </Button>

                    {/* Report Status Result */}
                    {reportStatus && (
                        <div className="w-full mb-6 bg-white rounded-xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] border border-gray-200 p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className={`w-3 h-3 rounded-full ${getStatusColor(reportStatus.status)}`}
                                />
                                <div className="text-zinc-800 text-base font-bold font-['DM_Sans']">
                                    {getStatusLabel(reportStatus.status)}
                                </div>
                            </div>
                            <div className="text-gray-500 text-xs mb-2">
                                Category:{" "}
                                {reportStatus.category
                                    ?.replace("_", " ")
                                    .toUpperCase()}
                            </div>
                            <div className="text-gray-500 text-xs">
                                Submitted:{" "}
                                {new Date(
                                    reportStatus.created_at,
                                ).toLocaleDateString()}
                            </div>
                        </div>
                    )}

                    {/* Status Legend */}
                    <div className="w-full bg-blue-50 rounded-[10px] shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] border border-blue-600 p-4 mb-6">
                        <div className="text-blue-900 text-base font-semibold font-['DM_Sans'] tracking-tight mb-4">
                            WHAT DOES MY STATUS MEAN?
                        </div>

                        {/* Pending Review */}
                        <div className="flex gap-3 mb-4">
                            <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <div>
                                <div className="text-zinc-800 text-base font-bold font-['DM_Sans']">
                                    Pending Review
                                </div>
                                <div className="text-gray-400 text-xs">
                                    Our team is verifying the details of your
                                    report.
                                </div>
                            </div>
                        </div>

                        {/* In Progress */}
                        <div className="flex gap-3 mb-4">
                            <div className="w-3 h-3 rounded-full bg-blue-900 mt-1.5 shrink-0" />
                            <div>
                                <div className="text-zinc-800 text-base font-bold font-['DM_Sans']">
                                    In Progress
                                </div>
                                <div className="text-gray-400 text-xs">
                                    Local authorities have been notified and are
                                    responding.
                                </div>
                            </div>
                        </div>

                        {/* Resolved */}
                        <div className="flex gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            <div>
                                <div className="text-zinc-800 text-base font-bold font-['DM_Sans']">
                                    Resolved
                                </div>
                                <div className="text-gray-400 text-xs">
                                    The incident has been cleared or addressed
                                    successfully.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                        <div className="mb-4">
                            <div className="text-gray-400 text-sm font-bold font-['DM_Sans'] tracking-tight mb-2">
                                Recent Searches
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {recentSearches.map((code, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            handleRecentSearchClick(code)
                                        }
                                        className="h-7 px-3 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                                        <span className="text-neutral-600 text-xs font-semibold font-['DM_Sans']">
                                            {code}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Navigation - Fixed at footer */}
            <div className="fixed bottom-0 left-0 right-0">
                <BottomNav onHelpClick={() => { /* ignore */ }} onChatClick={() => { /* ignore */ }} />
            </div>
        </div>
    )
}
