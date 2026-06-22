import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { User, Bell, Shield, Edit2, LogOut, Moon, Download, ChevronRight } from "lucide-react"
import AdminLayout from "../../../components/admin/AdminLayout"

function AdminSettingsPage() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [emailNotifs, setEmailNotifs] = useState(true)
    const [slaWarnings, setSlaWarnings] = useState(true)
    const [weeklySummary, setWeeklySummary] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [twoFactor, setTwoFactor] = useState(false)

    useEffect(() => {
        try {
            const stored = localStorage.getItem("user")
            if (stored) setUser(JSON.parse(stored))
        } catch {
            // ignore
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/admin")
    }

    const avatarUrl = user?.avatar_url || user?.image_url || null
    const initials = user ? (user.name || user.username || "AD").slice(0, 2).toUpperCase() : "AD"

    // Helper for a toggle switch
    const ToggleSwitch = ({ enabled, onChange }) => (
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none transition-colors duration-200 ease-in-out ${enabled ? 'bg-[#1f295b]' : 'bg-slate-200'}`}
        >
            <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-2 bg-white' : '-translate-x-2 bg-white'}`}
            />
        </button>
    )

    return (
        <AdminLayout activeTab="settings">
            {/* Header Area */}
            <div className="w-full max-w-sm px-4 mb-6">
                <h1 className="text-zinc-800 text-xl font-extrabold font-['DM_Sans']">Settings</h1>
                <p className="text-slate-500 text-xs font-['DM_Sans'] mt-1">Manage your account and system preferences</p>
            </div>

            <div className="w-full max-w-sm px-4 pb-20 space-y-5">
                
                {/* Profile Section */}
                <div className="bg-white rounded-2xl p-4 shadow-[0px_8px_24px_rgba(149,157,165,0.1)] border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <User size={18} />
                            </div>
                            <h2 className="text-slate-800 text-sm font-bold font-['DM_Sans']">Profile</h2>
                        </div>
                        <button className="text-[#1f295b] text-[11px] font-bold flex items-center gap-1 hover:underline">
                            <Edit2 size={12} /> Edit
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="User" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold shadow-sm border-2 border-white">
                                {initials}
                            </div>
                        )}
                        <div>
                            <p className="text-slate-800 text-sm font-bold font-['DM_Sans']">{user?.name || user?.username || "Admin User"}</p>
                            <p className="text-slate-500 text-xs font-['DM_Sans']">{user?.email || "admin@safemap.com"}</p>
                            <p className="text-green-600 text-[10px] font-bold mt-1 bg-green-100 inline-block px-1.5 py-0.5 rounded leading-tight">Active Administrator</p>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-white rounded-2xl p-4 shadow-[0px_8px_24px_rgba(149,157,165,0.1)] border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                            <Bell size={18} />
                        </div>
                        <h2 className="text-slate-800 text-sm font-bold font-['DM_Sans']">Notifications</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-700 text-xs font-bold font-['DM_Sans']">Email Notifications</p>
                                <p className="text-slate-400 text-[10px] font-['DM_Sans']">Receive alerts via email</p>
                            </div>
                            <ToggleSwitch enabled={emailNotifs} onChange={setEmailNotifs} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-700 text-xs font-bold font-['DM_Sans']">SLA Warnings</p>
                                <p className="text-slate-400 text-[10px] font-['DM_Sans']">Notify when a report nears its SLA</p>
                            </div>
                            <ToggleSwitch enabled={slaWarnings} onChange={setSlaWarnings} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-700 text-xs font-bold font-['DM_Sans']">Weekly Summary</p>
                                <p className="text-slate-400 text-[10px] font-['DM_Sans']">Get a weekly digest of incidents</p>
                            </div>
                            <ToggleSwitch enabled={weeklySummary} onChange={setWeeklySummary} />
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white rounded-2xl p-4 shadow-[0px_8px_24px_rgba(149,157,165,0.1)] border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-50 rounded-lg text-red-500">
                            <Shield size={18} />
                        </div>
                        <h2 className="text-slate-800 text-sm font-bold font-['DM_Sans']">Security</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-700 text-xs font-bold font-['DM_Sans']">Two-Factor Auth</p>
                                <p className="text-slate-400 text-[10px] font-['DM_Sans']">Require a code upon login</p>
                            </div>
                            <ToggleSwitch enabled={twoFactor} onChange={setTwoFactor} />
                        </div>

                        <button className="w-full flex items-center justify-between p-3 bg-slate-50/80 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                            <span className="text-slate-700 text-xs font-bold font-['DM_Sans']">Change Password</span>
                            <ChevronRight size={14} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* System Preferences Section */}
                <div className="bg-white rounded-2xl p-4 shadow-[0px_8px_24px_rgba(149,157,165,0.1)] border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-slate-800 text-sm font-bold font-['DM_Sans']">System Preferences</h2>
                    </div>

                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-3 bg-slate-50/80 rounded-xl hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <Moon size={16} className="text-slate-500" />
                                <span className="text-slate-700 text-xs font-bold font-['DM_Sans']">Dark Mode</span>
                            </div>
                            <ToggleSwitch enabled={darkMode} onChange={setDarkMode} />
                        </button>

                        <button className="w-full flex items-center justify-between p-3 bg-slate-50/80 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                            <div className="flex items-center gap-3">
                                <Download size={16} className="text-slate-500" />
                                <span className="text-slate-700 text-xs font-bold font-['DM_Sans']">Export Audit Data</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Logout */}
                <button 
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded-xl p-3.5 flex items-center justify-center gap-2 font-bold text-sm font-['DM_Sans'] border border-red-100 shadow-sm"
                >
                    <LogOut size={16} /> Log Out
                </button>

            </div>
        </AdminLayout>
    )
}

export default AdminSettingsPage
