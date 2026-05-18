import { useNavigate } from "react-router-dom"
import { List, BarChart2, LayoutGrid, User, Folders } from "lucide-react"

function AdminBottomNav({ activeTab }) {
  const navigate = useNavigate()

  const handleTabClick = (tab, path) => {
    navigate(path)
  }

  // Helper to standard render for inactive tabs
  const renderInactiveTab = (Icon, label, tabId, path) => (
    <button
      onClick={() => handleTabClick(tabId, path)}
      className="flex flex-col items-center gap-1.5 pt-2 cursor-pointer bg-transparent border-none w-15"
    >
      <Icon className="w-5.5 h-5.5 text-[#9ca3af]" strokeWidth={2.5} />
      <span className="text-[#9ca3af] text-[11px] font-medium font-['DM_Sans'] leading-none">{label}</span>
    </button>
  )

  // Helper for active, protruding tab
  const renderActiveTab = (Icon, label, tabId, path) => (
    <div
      className="relative -top-4.5 flex flex-col items-center gap-1.5 cursor-pointer w-15"
      onClick={() => handleTabClick(tabId, path)}
    >
      <div className="w-13 h-13 bg-[#1f295b] hover:bg-[#151c3d] transition-colors rounded-full shadow-[0px_6px_14px_rgba(31,41,91,0.35)] flex items-center justify-center border-[3.5px] border-slate-50">
        <Icon className="w-5.5 h-5.5 text-white" strokeWidth={2.5} />
      </div>
      <span className="text-[#1f295b] text-[11px] font-bold font-['DM_Sans'] leading-none">{label}</span>
    </div>
  )

  // Return specific rendering based on active tab
  return (
    <div className="fixed bottom-0 w-full max-w-110 h-18 bg-white rounded-t-[30px] flex justify-between items-center px-6 z-99999">
      {activeTab === "queue"
        ? renderActiveTab(List, "Queue", "queue", "/admin-queue")
        : renderInactiveTab(List, "Queue", "queue", "/admin-queue")}

      {activeTab === "analytics"
        ? renderActiveTab(BarChart2, "Analytics", "analytics", "/admin-analytics")
        : renderInactiveTab(BarChart2, "Analytics", "analytics", "/admin-analytics")}

      {activeTab === "dashboard"
        ? renderActiveTab(LayoutGrid, "Dashboard", "dashboard", "/admin-dashboard")
        : renderInactiveTab(LayoutGrid, "Dashboard", "dashboard", "/admin-dashboard")}

      {activeTab === "audit"
        ? renderActiveTab(User, "Audit", "audit", "/admin-audit")
        : renderInactiveTab(User, "Audit", "audit", "/admin-audit")}

      {activeTab === "management"
        ? renderActiveTab(Folders, "Management", "management", "/admin-management")
        : renderInactiveTab(Folders, "Management", "management", "/admin-management")}
    </div>
  )
}

export default AdminBottomNav
