import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

// Import modular components
import Header from "../components/Header"
import MapView from "../components/MapView"
import QuickActions from "../components/QuickActions"
import BottomNav from "../components/BottomNav"
import ChatWidget from "../components/ChatWidget"
import ReportButton from "../components/ReportButton"
import RiskLegend from "../components/RiskLegend"
import PrivacyConsentModal from "../components/PrivacyConsentModal"

// Shared location data for search
const SEARCHABLE_LOCATIONS = [
  {
    name: "Gensan Medical Center",
    type: "hospital",
    contact: "887-9898",
    lat: 6.082848378647546,
    lng: 125.14814878609288,
  },
  {
    name: "St. Elizabeth Hospital",
    type: "hospital",
    contact: "552-3162",
    lat: 6.1186906805198,
    lng: 125.17990092527259,
  },
  {
    name: "Mindanao Medical Center",
    type: "hospital",
    contact: "553-8207",
    lat: 6.128140973066608,
    lng: 125.16013162335923,
  },
  {
    name: "Dadiangas Medical Center",
    type: "hospital",
    contact: "0917-190-2561",
    lat: 6.125146051208208,
    lng: 125.17780208294442,
  },
  {
    name: "Sarangani Bay Specialists Medical Center",
    type: "hospital",
    contact: "887-8888",
    lat: 6.119403451074248,
    lng: 125.14686598109384,
  },
  {
    name: "Gensan Doctors Hospital",
    type: "hospital",
    contact: "250-2777",
    lat: 6.1205193798244775,
    lng: 125.17829398294444,
  },
  {
    name: "Dr. Jorge P. Royeca City Hospital",
    type: "hospital",
    contact: "552-2811",
    lat: 6.1260614210312925,
    lng: 125.18573462712328,
  },
  { name: "GSC Police Office", type: "police", contact: "552-5573", lat: 6.110370865940478, lng: 125.16682861271755 },
  {
    name: "Police Station 1 (Dad. East)",
    type: "police",
    contact: "0998-598-7208",
    lat: 6.11432864656382,
    lng: 125.17065885410874,
  },
  {
    name: "Police Station 2 (Makar Wharf)",
    type: "police",
    contact: "0918-921-3580",
    lat: 6.094686794224281,
    lng: 125.1546590847949,
  },
  {
    name: "Police Station 3 (Lagao)",
    type: "police",
    contact: "0998-598-7212",
    lat: 6.128284606756957,
    lng: 125.19698807712341,
  },
  {
    name: "Police Station 4 (San Isidro)",
    type: "police",
    contact: "0998-598-7214",
    lat: 6.138473907635937,
    lng: 125.16834834246667,
  },
  {
    name: "Police Station 5",
    type: "police",
    contact: "0907-313-4517",
    lat: 6.07269034380546,
    lng: 125.14324851953891,
  },
  {
    name: "Police Station 6 (Bula)",
    type: "police",
    contact: "0998-598-7218",
    lat: 6.10762945266241,
    lng: 125.1892411829445,
  },
  {
    name: "Police Station 7 (Fatima)",
    type: "police",
    contact: "0998-598-7220",
    lat: 6.076678872414175,
    lng: 125.12008103658187,
  },
  {
    name: "Bureau of Fire Protection (BFP)",
    type: "fire",
    contact: "552-1160",
    lat: 6.115633495787534,
    lng: 125.1731673237921,
  },
  { name: "CDRRMO Gensan", type: "rescue", contact: "552-3939", lat: 6.113659178971407, lng: 125.17178537870461 },
]

export default function MapPage() {
  const navigate = useNavigate()
  const [showQuickActions, setShowQuickActions] = useState(true)

  // Quick Actions drag state
  const [qaPosition, setQaPosition] = useState({ x: 0, y: 0 })
  const [isDraggingQA, setIsDraggingQA] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })

  // Marker filter state - null means show all
  const [activeFilter, setActiveFilter] = useState(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Handle search from Header
  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const searchLocations = (query) => {
    if (!query || query.length < 1) return []
    return SEARCHABLE_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query.toLowerCase()) || loc.type.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
  }

  // Handlers
  const handleEmergencyClick = () => {
    navigate("/emergency")
  }

  const handleHelpClick = () => {
    navigate("/help")
  }

  const handleAIChatClick = () => {
    window.dispatchEvent(new CustomEvent("safemap-open-chat"))
  }

  return (
    <div className="h-screen flex flex-col relative bg-background">
      <PrivacyConsentModal />

      {/* Header */}
      <Header
        onSearch={handleSearch}
        searchResults={searchQuery.length > 0 ? searchLocations(searchQuery) : []}
        searchQuery={searchQuery}
      />

      {/* Search Results Dropdown - Overlays on map */}
      {searchQuery.length > 0 && !selectedLocation && searchLocations(searchQuery).length > 0 && (
        <div className="absolute left-4 right-4 top-[110px] max-w-md mx-auto bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-[1001]">
          {searchLocations(searchQuery).map((loc, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedLocation(loc)
                setSearchQuery(loc.name)
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 text-left"
            >
              <span className="text-lg">
                {loc.type === "hospital" ? "🏥" : loc.type === "police" ? "👮" : loc.type === "fire" ? "🚒" : "🚑"}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{loc.name}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {loc.type} • {loc.contact}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Show selected location indicator */}
      {selectedLocation && (
        <div className="absolute left-4 right-4 top-[110px] max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-[1000]">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {selectedLocation.type === "hospital"
                ? "🏥"
                : selectedLocation.type === "police"
                  ? "👮"
                  : selectedLocation.type === "fire"
                    ? "🚒"
                    : "🚑"}
            </span>
            <span className="text-sm font-medium">{selectedLocation.name}</span>
            <button onClick={() => setSelectedLocation(null)} className="ml-auto text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Map */}
      <main className="flex-1 relative pb-[72px]">
        <MapView activeFilter={activeFilter} searchQuery={selectedLocation ? selectedLocation.name : ""} />
        <RiskLegend onFilterChange={setActiveFilter} activeFilter={activeFilter} />

        {/* Quick Actions - Draggable */}
        <QuickActions
          showQuickActions={showQuickActions}
          setShowQuickActions={setShowQuickActions}
          qaPosition={qaPosition}
          setQaPosition={setQaPosition}
          isDraggingQA={isDraggingQA}
          setIsDraggingQA={setIsDraggingQA}
          dragOffset={dragOffset}
          setDragOffset={setDragOffset}
          dragStartPos={dragStartPos}
          setDragStartPos={setDragStartPos}
          onEmergencyClick={handleEmergencyClick}
          onAIChatClick={handleAIChatClick}
        />
      </main>

      {/* Report Button - Floating on main page only */}
      <ReportButton />

      {/* Bottom Navigation */}
      <BottomNav
        onHelpClick={handleHelpClick}
        onChatClick={() => {
          /* ignore */
        }}
      />

      {/* Flowise Chat Widget - self-managed bubble */}
      <ChatWidget />
    </div>
  )
}
