import { useState, useEffect, useMemo, useCallback } from "react"
import { API_BASE } from "@/lib/api-base"
import { Calendar, Download } from "lucide-react"
import AdminLayout from "../../../components/admin/AdminLayout"
import StatsCards from "./StatsCards"
import HeatmapSection from "./HeatmapSection"
import RecurringHotspots from "./RecurringHotspots"
import CaseComposition from "./CaseComposition"
import TemporalTrends from "./TemporalTrends"
import CriticalAnomalies from "./CriticalAnomalies"

const RANGE_OPTIONS = [
  { key: "7d", label: "Last 7 Days", days: 7 },
  { key: "30d", label: "Last 30 Days", days: 30 },
  { key: "90d", label: "Last 90 Days", days: 90 },
  { key: "all", label: "All Time", days: null },
]

const INTENSITY_MAP = {
  critical: 1.0,
  high: 0.8,
  medium: 0.5,
  low: 0.3,
}

const RESOLVED_STATUSES = new Set(["verified", "verified_pnp"])
const DISMISSED_STATUSES = new Set(["dismissed", "spam", "false_report"])
const SEVERITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 }
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const CATEGORY_LABEL_OVERRIDES = {
  police: "Police / PNP",
  pnp: "Police / PNP",
  wcpd: "WCPD",
  medical: "Medical",
  hospital: "Medical",
  fire: "Fire",
  rescue: "Rescue",
}

const parseDate = (value) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

const formatCategoryLabel = (value) => {
  if (!value) return "Unassigned"
  if (CATEGORY_LABEL_OVERRIDES[value]) return CATEGORY_LABEL_OVERRIDES[value]
  return value
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

const formatDateShort = (date) => {
  const month = MONTH_LABELS[date.getMonth()]
  const day = String(date.getDate()).padStart(2, "0")
  return `${month} ${day}`
}

const formatDateTime = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const toCsvValue = (value) => {
  if (value == null) return ""
  const text = String(value)
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

const buildTrendSeries = (reports, rangeDays) => {
  if (!reports.length) return []

  const days = rangeDays || 90
  const bucketCount = 7
  const bucketSize = Math.ceil(days / bucketCount)
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - days + 1)

  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = new Date(start)
    bucketStart.setDate(start.getDate() + index * bucketSize)
    return {
      label: formatDateShort(bucketStart),
      newCount: 0,
      resolvedCount: 0,
    }
  })

  const dayMs = 24 * 60 * 60 * 1000
  reports.forEach((report) => {
    const createdAt = parseDate(report.created_at)
    if (createdAt && createdAt >= start) {
      const diffDays = Math.floor((createdAt - start) / dayMs)
      const index = Math.min(bucketCount - 1, Math.floor(diffDays / bucketSize))
      if (buckets[index]) buckets[index].newCount += 1
    }

    if (RESOLVED_STATUSES.has(report.status)) {
      const resolvedAt = parseDate(report.updated_at)
      if (resolvedAt && resolvedAt >= start) {
        const diffDays = Math.floor((resolvedAt - start) / dayMs)
        const index = Math.min(bucketCount - 1, Math.floor(diffDays / bucketSize))
        if (buckets[index]) buckets[index].resolvedCount += 1
      }
    }
  })

  return buckets
}

function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [reports, setReports] = useState([])
  const [heatPoints, setHeatPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [rangeKey, setRangeKey] = useState("30d")
  const [rangeOpen, setRangeOpen] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/admin"
      return
    }

    setLoading(true)
    setError("")

    try {
      const headers = { Authorization: `Bearer ${token}` }

      const statsRes = await fetch(`${API_BASE}/reports/stats`, { headers })
      if (statsRes.status === 401) {
        localStorage.removeItem("token")
        window.location.href = "/admin"
        return
      }
      if (statsRes.ok) setStats(await statsRes.json())

      const reportsData = await fetchReports(headers)
      const normalizedReports = reportsData.map((report) => normalizeReport(report))
      setReports(normalizedReports)

      const builtHeatPoints = buildHeatPoints(normalizedReports)
      if (builtHeatPoints.length > 0) {
        setHeatPoints(builtHeatPoints)
      } else {
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
      }
    } catch (err) {
      setError("Unable to load analytics data.")
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = useCallback(async (headers) => {
    const perPage = 100
    const maxReports = 1000
    let page = 1
    let pages = 1
    const collected = []

    while (page <= pages && collected.length < maxReports) {
      const res = await fetch(`${API_BASE}/reports?page=${page}&per_page=${perPage}`, { headers })
      if (res.status === 401) {
        localStorage.removeItem("token")
        window.location.href = "/admin"
        return []
      }
      if (!res.ok) break
      const data = await res.json()
      const batch = data.reports || []
      collected.push(...batch)
      pages = data.pages || pages
      if (batch.length < perPage) break
      page += 1
    }

    return collected
  }, [])

  const normalizeReport = (report) => {
    const location = report.location || {}
    return {
      id: report.id,
      category: report.category,
      severity: report.severity || "medium",
      status: report.status,
      is_urgent: Boolean(report.is_urgent),
      created_at: report.created_at,
      updated_at: report.updated_at,
      city: location.city || report.city || "",
      barangay: location.barangay || report.barangay || "",
      latitude: location.latitude ?? report.latitude,
      longitude: location.longitude ?? report.longitude,
    }
  }

  const buildHeatPoints = (items) => {
    return items
      .map((report) => {
        const lat = typeof report.latitude === "number" ? report.latitude : Number(report.latitude)
        const lng = typeof report.longitude === "number" ? report.longitude : Number(report.longitude)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
        const intensity = INTENSITY_MAP[report.severity] ?? 0.5
        return {
          lat,
          lng,
          intensity,
          severity: report.severity,
          category: report.category,
          status: report.status,
          barangay: report.barangay,
          city: report.city,
          created_at: report.created_at,
        }
      })
      .filter(Boolean)
  }

  const rangeOption = RANGE_OPTIONS.find((option) => option.key === rangeKey) || RANGE_OPTIONS[1]
  const rangeLabel = rangeOption.label

  const rangeStart = useMemo(() => {
    if (!rangeOption.days) return null
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - rangeOption.days + 1)
    return start
  }, [rangeOption.days])

  const filteredReports = useMemo(() => {
    if (!reports.length) return []
    if (!rangeStart) return reports
    return reports.filter((report) => {
      const createdAt = parseDate(report.created_at)
      return createdAt ? createdAt >= rangeStart : false
    })
  }, [reports, rangeStart])

  const filteredHeatPoints = useMemo(() => {
    if (!rangeStart) return heatPoints
    return heatPoints.filter((point) => {
      const createdAt = parseDate(point.created_at)
      return createdAt ? createdAt >= rangeStart : true
    })
  }, [heatPoints, rangeStart])

  const summaryStats = useMemo(() => {
    if (reports.length) {
      const total = filteredReports.length
      const pending = filteredReports.filter((report) => report.status === "pending_review").length
      const resolved = filteredReports.filter((report) => RESOLVED_STATUSES.has(report.status)).length
      const dismissed = filteredReports.filter((report) => DISMISSED_STATUSES.has(report.status)).length
      return { total, pending_review: pending, resolved, dismissed }
    }

    if (!reports.length && stats) {
      return {
        total: stats.total || 0,
        pending_review: stats.pending_review || 0,
        resolved: stats.pnp_verified || stats.public_visible || 0,
        dismissed: stats.by_status?.dismissed || 0,
      }
    }

    return { total: 0, pending_review: 0, resolved: 0, dismissed: 0 }
  }, [filteredReports, reports.length, stats])

  const compositionItems = useMemo(() => {
    if (reports.length) {
      const source = filteredReports
      const counts = source.reduce((acc, report) => {
        const key = report.category || "unassigned"
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
      const total = source.length || 1
      return Object.entries(counts)
        .map(([key, count]) => ({
          key,
          label: formatCategoryLabel(key),
          count,
          percent: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count)
    }

    if (!reports.length && stats?.by_category) {
      const total = stats.total || 1
      return Object.entries(stats.by_category)
        .map(([key, count]) => ({
          key,
          label: formatCategoryLabel(key),
          count,
          percent: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count)
    }

    return []
  }, [filteredReports, reports.length, stats])

  const hotspotItems = useMemo(() => {
    if (reports.length) {
      if (!filteredReports.length) return []
    }

    const source = reports.length ? filteredReports : heatPoints
    if (!source.length) return []

    const locations = source.reduce((acc, item) => {
      const key = item.barangay || item.city || "Unknown"
      if (!acc[key]) {
        acc[key] = {
          name: key,
          count: 0,
          severity: item.severity || "low",
        }
      }
      acc[key].count += 1
      const currentRank = SEVERITY_RANK[acc[key].severity] || 0
      const nextRank = SEVERITY_RANK[item.severity] || 0
      if (nextRank > currentRank) acc[key].severity = item.severity
      return acc
    }, {})

    return Object.values(locations)
      .filter((spot) => spot.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filteredReports, heatPoints, reports.length])

  const trendSeries = useMemo(() => {
    if (!reports.length) return []
    if (!filteredReports.length) return []
    return buildTrendSeries(filteredReports, rangeOption.days)
  }, [reports.length, filteredReports, rangeOption.days])

  const anomalyItems = useMemo(() => {
    if (!filteredReports.length) return []

    const now = new Date()
    const items = []

    const urgentCount = filteredReports.filter((report) => report.is_urgent).length
    if (urgentCount > 0) {
      items.push({
        time: formatDateTime(now),
        metric: `Urgent reports flagged (${urgentCount})`,
        region: "Multiple",
        severity: "Critical",
      })
    }

    const pendingOverdue = filteredReports.filter((report) => {
      if (report.status !== "pending_review") return false
      const createdAt = parseDate(report.created_at)
      if (!createdAt) return false
      const diffDays = (now - createdAt) / (24 * 60 * 60 * 1000)
      return diffDays >= 7
    }).length

    if (pendingOverdue > 0) {
      items.push({
        time: formatDateTime(now),
        metric: `Pending review backlog (${pendingOverdue})`,
        region: "Multiple",
        severity: "Warning",
      })
    }

    if (hotspotItems[0]) {
      items.push({
        time: formatDateTime(now),
        metric: "Hotspot cluster detected",
        region: hotspotItems[0].name,
        severity: hotspotItems[0].severity === "critical" ? "Critical" : "Warning",
      })
    }

    const lastWeek = new Date(now)
    lastWeek.setDate(now.getDate() - 7)
    const prevWeek = new Date(now)
    prevWeek.setDate(now.getDate() - 14)

    const lastWeekCount = filteredReports.filter((report) => {
      const createdAt = parseDate(report.created_at)
      return createdAt && createdAt >= lastWeek
    }).length
    const prevWeekCount = filteredReports.filter((report) => {
      const createdAt = parseDate(report.created_at)
      return createdAt && createdAt >= prevWeek && createdAt < lastWeek
    }).length

    if (lastWeekCount >= 5 && lastWeekCount > prevWeekCount * 1.5) {
      items.push({
        time: formatDateTime(now),
        metric: "Week-over-week surge detected",
        region: "City-wide",
        severity: "Warning",
      })
    }

    return items
  }, [filteredReports, hotspotItems])

  const handleExport = useCallback(() => {
    const timestamp = formatDateTime(new Date()).replace(/[: ]/g, "-")
    const filename = `analytics-${rangeKey}-${timestamp}.csv`

    const rows = [
      ["Generated At", formatDateTime(new Date())],
      ["Range", rangeLabel],
      ["Total Reports", summaryStats.total],
      ["Pending Review", summaryStats.pending_review],
      ["Resolved", summaryStats.resolved],
      ["Dismissed", summaryStats.dismissed],
      [],
      ["Report ID", "Category", "Severity", "Status", "City", "Barangay", "Created At", "Updated At", "Urgent"],
    ]

    filteredReports.forEach((report) => {
      rows.push([
        report.id,
        formatCategoryLabel(report.category),
        report.severity || "",
        report.status || "",
        report.city || "",
        report.barangay || "",
        report.created_at || "",
        report.updated_at || "",
        report.is_urgent ? "yes" : "no",
      ])
    })

    const csv = rows.map((row) => row.map(toCsvValue).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [filteredReports, rangeKey, rangeLabel, summaryStats])

  return (
    <AdminLayout activeTab="analytics">
      {/* Title & Actions */}
      <div className="w-full max-w-sm px-4">
        <div className="flex flex-col gap-4 mt-2">
          <h1 className="text-zinc-800 text-xl font-extrabold font-['DM_Sans']">System Analytics & Trends</h1>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <button
                onClick={() => setRangeOpen((prev) => !prev)}
                className="w-full h-10 bg-white border border-[#1e3a8a] rounded-lg flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#1e3a8a]" />
                <span className="text-[#1e3a8a] text-xs font-bold font-['DM_Sans']">{rangeLabel}</span>
              </button>
              {rangeOpen && (
                <div className="absolute top-12 left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-20">
                  {RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setRangeKey(option.key)
                        setRangeOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold font-['DM_Sans'] transition-colors ${
                        rangeKey === option.key ? "bg-slate-100 text-[#1e3a8a]" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleExport}
              className="flex-1 h-10 bg-[#1f295b] rounded-lg flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-bold font-['DM_Sans']">Export Report</span>
            </button>
          </div>
          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
        </div>
      </div>

      <StatsCards stats={summaryStats} loading={loading} />

      <div className="w-full max-w-sm px-4 mt-6 mb-8 space-y-4">
        <HeatmapSection heatPoints={filteredHeatPoints} />
        <RecurringHotspots items={hotspotItems} loading={loading} />
        <CaseComposition items={compositionItems} loading={loading} />
        <TemporalTrends series={trendSeries} loading={loading} />
        <CriticalAnomalies items={anomalyItems} loading={loading} />
      </div>
    </AdminLayout>
  )
}

export default AdminAnalyticsPage
