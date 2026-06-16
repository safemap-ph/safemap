import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { Home, Map, AlertTriangle, ClipboardList, Shield } from "lucide-react"

function BottomNav({ onChatClick }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTab, setActiveTab] = useState("home")

    useEffect(function syncTab() {
        const path = location.pathname
        if (path === "/map") {
            setActiveTab("map")
        } else if (path === "/track") {
            setActiveTab("track")
        } else if (path === "/admin") {
            setActiveTab("admin")
        }
    }, [location.pathname])

    const handleTabClick = function(tab, action) {
        setActiveTab(tab)
        if (action) action()
    }

    const renderTab = function(Icon, label, tabId, isActive, action) {
        return (
            <button
                onClick={function() { handleTabClick(tabId, action) }}
                className={"flex flex-col items-center justify-center w-15 bg-transparent border-none cursor-pointer transition-colors duration-200 mt-2 " + (isActive ? "text-blue-700" : "text-slate-400 hover:text-slate-500")}
            >
                <div className={"p-1.5 rounded-xl mb-1 transition-all duration-200 " + (isActive ? "bg-blue-50" : "bg-transparent")}>
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={"text-[11px] font-['DM_Sans'] leading-none " + (isActive ? "font-semibold" : "font-medium")}>
                    {label}
                </span>
            </button>
        )
    }

    const renderCTA = function(Icon, label, action) {
        return (
            <div className="relative -top-5 flex flex-col items-center gap-1.5 cursor-pointer min-w-16" onClick={action}>
                <div className="w-14 h-14 bg-[#1f295b] hover:bg-[#151c3d] transition-colors rounded-full shadow-[0px_6px_16px_rgba(31,41,91,0.4)] flex items-center justify-center border-4 border-white">
                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[#1f295b] text-[11px] font-bold font-['DM_Sans'] leading-none">
                    {label}
                </span>
            </div>
        )
    }

    return (
        <div className="fixed bottom-0 left-0 w-full h-18 bg-white rounded-t-[24px] flex justify-between items-center px-2 sm:px-6 z-2000 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] pb-2">
            {renderTab(Home, "Home", "home", activeTab === "home", function() { navigate("/") })}
            {renderTab(Map, "Map", "map", activeTab === "map", function() { navigate("/map") })}
            {renderCTA(AlertTriangle, "Report", function() { navigate("/report") })}
            {renderTab(ClipboardList, "Track", "track", activeTab === "track", function() { navigate("/track") })}
            {renderTab(Shield, "Admin", "admin", activeTab === "admin", function() { navigate("/admin") })}
        </div>
    )
}

export default BottomNav
