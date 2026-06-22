import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { Home, Map, AlertTriangle, HelpCircle, Shield } from "lucide-react"

function BottomNav({ onHelpClick, onChatClick }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTab, setActiveTab] = useState("home")

    useEffect(() => {
        // Sync active tab with current path if needed
        const path = location.pathname
        // Since Map and Home both use '/', we let the internal state handle it if it's '/'.
        // Otherwise, we match specific routes.
        if (path === "/map") {
            setActiveTab("map")
        } else if (path === "/help") {
            setActiveTab("help")
        } else if (path === "/admin") {
            setActiveTab("admin")
        }
        // We intentionally ignore '/report' because it acts as a floating CTA.
    }, [location.pathname])

    const handleTabClick = (tab, action) => {
        setActiveTab(tab)
        if (action) action()
    }

    // Regular Tab - Only changes color and font-weight when active
    const renderTab = (Icon, label, tabId, isActive, action) => (
        <button
            onClick={() => handleTabClick(tabId, action)}
            className={`flex flex-col items-center justify-center w-15 bg-transparent border-none cursor-pointer transition-colors duration-200 mt-2 ${
                isActive
                    ? "text-blue-700"
                    : "text-slate-400 hover:text-slate-500"
            }`}>
            <div
                className={`p-1.5 rounded-xl mb-1 transition-all duration-200 ${isActive ? "bg-blue-50" : "bg-transparent"}`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span
                className={`text-[11px] font-['DM_Sans'] leading-none ${
                    isActive ? "font-semibold" : "font-medium"
                }`}>
                {label}
            </span>
        </button>
    )

    // Floating Action CTA (Reports) - Always protruding
    const renderCTA = (Icon, label, action) => (
        <div
            className="relative -top-5 flex flex-col items-center gap-1.5 cursor-pointer min-w-16"
            onClick={action}>
            <div className="w-14 h-14 bg-[#1f295b] hover:bg-[#151c3d] transition-colors rounded-full shadow-[0px_6px_16px_rgba(31,41,91,0.4)] flex items-center justify-center border-4 border-white">
                <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[#1f295b] text-[11px] font-bold font-['DM_Sans'] leading-none">
                {label}
            </span>
        </div>
    )

    return (
        <div className="fixed bottom-0 left-0 w-full h-18 bg-white rounded-t-[24px] flex justify-between items-center px-2 sm:px-6 z-2000 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] pb-2">
            {renderTab(Home, "Home", "home", activeTab === "home", () =>
                navigate("/"),
            )}
            {renderTab(Map, "Map", "map", activeTab === "map", () =>
                navigate("/map"),
            )}

            {/* CTA Button: Always highlighted & prominent */}
            {renderCTA(AlertTriangle, "Report", () => navigate("/report"))}

            {renderTab(HelpCircle, "Help", "help", activeTab === "help", () => {
                navigate("/help")
                if (onHelpClick) onHelpClick()
            })}
            {renderTab(Shield, "Admin", "admin", activeTab === "admin", () =>
                navigate("/admin"),
            )}
        </div>
    )
}

export default BottomNav
