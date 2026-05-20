import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import logoImg from "/src/assets/images/Logo.svg"
import { BellIcon, Settings, LogOut, User } from "lucide-react"
import AdminBottomNav from "./AdminBottomNav"
import { API_BASE } from "@/lib/api-base"

/**
 * Derive up to 2-letter initials from a name string.
 * "Juan Dela Cruz" → "JD", "admin" → "AD"
 */
function getInitials(name) {
  if (!name) return "AD"
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const NOTIF_POLL_MS = 5000

const formatTimeAgo = (value) => {
  if (!value) return "Just now"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Just now"

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (diffSeconds < 60) return `${diffSeconds}s ago`
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

const getLastSeenKey = (user) => {
  const userId = user?.id || user?.username || "default"
  return `safemap:admin-notif-last-seen:${userId}`
}

const isUnread = (createdAt, lastSeenAt) => {
  if (!createdAt) return false
  if (!lastSeenAt) return true
  return new Date(createdAt) > new Date(lastSeenAt)
}

/**
 * Shared admin page layout.
 *
 * Props:
 *  - activeTab   : string key for AdminBottomNav highlight
 *  - children    : page-specific body content
 */
function AdminLayout({ activeTab, children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [lastSeenAt, setLastSeenAt] = useState(null)
  const [isNotifLoading, setIsNotifLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/admin")
      return
    }
    try {
      const stored = localStorage.getItem("user")
      if (stored) setUser(JSON.parse(stored))
    } catch {
      /* ignore parse errors */
    }
  }, [navigate])

  useEffect(() => {
    if (!user) return
    const stored = localStorage.getItem(getLastSeenKey(user))
    if (stored) setLastSeenAt(stored)
  }, [user])

  const persistLastSeen = useCallback(
    (value) => {
      if (!user) return
      localStorage.setItem(getLastSeenKey(user), value)
      setLastSeenAt(value)
    },
    [user]
  )

  const fetchNotifications = useCallback(
    async (signal) => {
      const token = localStorage.getItem("token")
      if (!token) return
      setIsNotifLoading(true)

      try {
        const res = await fetch(`${API_BASE}/notifications?limit=20&audit_limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        })
        if (res.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          navigate("/admin")
          return
        }
        if (!res.ok) return

        const data = await res.json()
        const list = (data.notifications || []).map((item) => {
          const createdAt = item.created_at
          return {
            ...item,
            created_at: createdAt,
            timeLabel: formatTimeAgo(createdAt),
            unread: isUnread(createdAt, lastSeenAt),
          }
        })
        setNotifications(list)
      } catch {
        /* ignore */
      } finally {
        setIsNotifLoading(false)
      }
    },
    [lastSeenAt, navigate]
  )

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const controller = new AbortController()
    fetchNotifications(controller.signal)
    const interval = setInterval(() => {
      fetchNotifications(controller.signal)
    }, NOTIF_POLL_MS)

    return () => {
      clearInterval(interval)
      controller.abort()
    }
  }, [fetchNotifications])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/admin")
  }

  const handleMarkAllRead = () => {
    const now = new Date().toISOString()
    persistLastSeen(now)
    setNotifications((prev) => prev.map((notif) => ({ ...notif, unread: false })))
  }

  const handleNotificationClick = () => {
    const now = new Date().toISOString()
    persistLastSeen(now)
    setNotifications((prev) => prev.map((notif) => ({ ...notif, unread: false })))
  }

  const avatarUrl = user?.avatar_url || user?.image_url || null
  const initials = getInitials(user?.name || user?.username)
  const hasUnread = useMemo(() => notifications.some((notif) => notif.unread), [notifications])

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center pt-0">
      {/* Header */}
      <div className="w-full max-w-sm px-4 pt-4 pb-2">
        <div className="relative flex items-center justify-center mb-5">
          <img className="h-12 w-auto" src={logoImg} alt="SafeMap" />
          <div className="absolute right-0 flex items-center gap-2">
            {/* Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen)
                  if (isProfileOpen) setIsProfileOpen(false)
                }}
                className="w-8 h-8 hover:bg-[#1f295b]/10 transition-colors rounded-lg flex items-center justify-center relative cursor-pointer border-none outline-none"
              >
                <BellIcon className="w-4 h-4 text-[#1f295b]" />
                {hasUnread && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#1f295b]" />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-[0px_8px_24px_rgba(149,157,165,0.2)] border border-slate-100 overflow-hidden z-[9999]">
                  <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-slate-800 text-sm font-bold font-['DM_Sans']">Notifications</h3>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[#1e3a8a] text-[10px] font-bold font-['DM_Sans'] hover:underline"
                      disabled={!notifications.length}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-75 overflow-y-auto">
                    {isNotifLoading && notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-slate-400 text-xs font-['DM_Sans']">
                        Loading notifications...
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={handleNotificationClick}
                          className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${
                            notif.unread ? "bg-blue-50/30" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-slate-800 text-xs font-bold font-['DM_Sans']">{notif.title}</span>
                            <span className="text-slate-400 text-[9px] font-medium">{notif.timeLabel}</span>
                          </div>
                          <p className="text-slate-500 text-[10px] leading-snug">{notif.desc}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-slate-400 text-xs font-['DM_Sans']">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen)
                  if (isNotifOpen) setIsNotifOpen(false)
                }}
                className="focus:outline-none flex items-center justify-center border-none"
              >
                {avatarUrl ? (
                  <img
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm transition-transform hover:scale-105"
                    src={avatarUrl}
                    alt="User"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#1e3a8a] border-2 border-white shadow-sm flex items-center justify-center transition-transform hover:scale-105">
                    <span className="text-white text-[10px] font-bold font-['DM_Sans'] leading-none">{initials}</span>
                  </div>
                )}
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-[0px_8px_24px_rgba(149,157,165,0.2)] border border-slate-100 overflow-hidden z-[9999]">
                  <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-3">
                    <div className="shrink-0">
                      {avatarUrl ? (
                        <img
                          className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm"
                          src={avatarUrl}
                          alt="User"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#1e3a8a] flex items-center justify-center shadow-sm">
                          <span className="text-white text-xs font-bold font-['DM_Sans'] leading-none">{initials}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-slate-800 text-sm font-bold font-['DM_Sans'] truncate">
                        {user?.name || user?.username || "Admin User"}
                      </p>
                      <p className="text-slate-500 text-[10px] truncate leading-snug font-['DM_Sans']">
                        {user?.email || "admin@safemap.com"}
                      </p>
                    </div>
                  </div>
                  <div className="py-2 flex flex-col items-start w-full">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false)
                        navigate("/admin-settings")
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-700 font-medium font-['DM_Sans'] hover:bg-slate-50 transition-colors flex items-center gap-3 border-none outline-none"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false)
                        navigate("/admin-settings")
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-700 font-medium font-['DM_Sans'] hover:bg-slate-50 transition-colors flex items-center gap-3 border-none outline-none"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Settings
                    </button>
                  </div>
                  <div className="py-2 border-t border-slate-50">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false)
                        handleLogout()
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-red-600 font-medium font-['DM_Sans'] hover:bg-red-50 transition-colors flex items-center gap-3 border-none outline-none"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* First child (page title row) rendered inside header container */}
      </div>

      {/* Page body */}
      <div className="w-full pb-28">{children}</div>

      {/* Bottom Navigation */}
      <AdminBottomNav activeTab={activeTab} />
    </div>
  )
}

export default AdminLayout
