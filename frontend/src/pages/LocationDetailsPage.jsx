import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import logoImg from "/src/assets/images/Logo.svg"
import rptBackImg from "/src/assets/images/rpt_back.svg"
import rptImpReminderImg from "/src/assets/images/rpt_imp_reminder.svg"
import { Button } from "@/components/ui/button"
import BottomNav from "@/components/BottomNav"
import { Map, MapMarker, MarkerContent, useMap } from "@/components/ui/map"

function MapClickHandler({ onMapClick }) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded) return

    const handleClick = (event) => {
      onMapClick(event.lngLat)
    }

    map.on("click", handleClick)

    return () => {
      map.off("click", handleClick)
    }
  }, [map, isLoaded, onMapClick])

  return null
}

export default function LocationDetailsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [prevData, setPrevData] = useState(null)
  const [locationCoords, setLocationCoords] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [landmark, setLandmark] = useState("")
  const [landmarkSuggestions, setLandmarkSuggestions] = useState([])
  const [showLandmarkDropdown, setShowLandmarkDropdown] = useState(false)
  const [description, setDescription] = useState("")
  const [gender, setGender] = useState("")
  const [ageGroup, setAgeGroup] = useState("")
  const [relationship, setRelationship] = useState("")

  // Mock landmark data for General Santos City
  const gensanLandmarks = [
    "SM City General Santos",
    "KCC Mall General Santos",
    "Robinsons Place GenSan",
    "City Hall of General Santos",
    "University of Southern Philippines",
    "General Santos City Airport",
    "Magsaysay Avenue",
    "Dadiangas South Central School",
    "Notre Dame of Dadiangas",
    "St. Louis College of General Santos",
    "General Santos Doctors Hospital",
    "Alabel Municipal Hall",
    "Polomolok Municipal Hall",
    "South Cotabato Provincial Hospital",
    "Lake Sebu Municipal Hall",
  ]

  // Fetch real landmarks and buildings from Nominatim API (OpenStreetMap)
  const fetchLandmarks = async (lat, lng) => {
    try {
      // Search for nearby places, buildings, and landmarks using Nominatim
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=building+${lat},${lng}&limit=15`
      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent": "SafeMapPH/1.0",
        },
      })
      const data = await response.json()

      if (data && data.length > 0) {
        // Get unique names and format them
        const uniqueNames = [
          ...new Set(
            data.map((item) => {
              const parts = item.display_name.split(",")
              return parts.slice(0, 4).join(", ")
            })
          ),
        ]
        setLandmarkSuggestions(uniqueNames.slice(0, 10))
        setShowLandmarkDropdown(true)
      } else {
        // Try general search if building search returns nothing
        const generalUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${lat},${lng}&limit=15`
        const generalResponse = await fetch(generalUrl, {
          headers: {
            "User-Agent": "SafeMapPH/1.0",
          },
        })
        const generalData = await generalResponse.json()

        if (generalData && generalData.length > 0) {
          const uniqueNames = [
            ...new Set(
              generalData.map((item) => {
                const parts = item.display_name.split(",")
                return parts.slice(0, 4).join(", ")
              })
            ),
          ]
          setLandmarkSuggestions(uniqueNames.slice(0, 10))
          setShowLandmarkDropdown(true)
        } else {
          setShowLandmarkDropdown(false)
        }
      }
    } catch (error) {
      /* ignore */
    }
  }

  // Handle getting user's current location
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setSelectedLocation({ lat: latitude, lng: longitude })
          fetchLandmarks(latitude, longitude)
        },
        (error) => {
          alert("Unable to get your location. Please enable location services.")
        }
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  // Handle pin placement on map
  const handleMapClick = (lngLat) => {
    const { lat, lng } = lngLat
    const coords = { lat, lng }
    setLocationCoords(coords)
    setSelectedLocation(coords)
    fetchLandmarks(lat, lng)
  }

  const handleProceed = () => {
    // Pass all data to next step
    navigate("/review-submit", {
      state: {
        ...prevData,
        locationCoords,
        landmark,
        gender,
        ageGroup,
        relationship,
        description,
      },
    })
  }

  // Get data from previous step
  useEffect(() => {
    if (location.state) {
      setPrevData(location.state)
    }
  }, [location])

  // Load draft data on mount
  useEffect(() => {
    const draft = localStorage.getItem("safemap_report_draft")
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        if (draftData.locationCoords) {
          setLocationCoords(draftData.locationCoords)
          setSelectedLocation(draftData.locationCoords)
        }
        if (draftData.landmark) setLandmark(draftData.landmark)
        if (draftData.gender) setGender(draftData.gender)
        if (draftData.ageGroup) setAgeGroup(draftData.ageGroup)
        if (draftData.relationship) setRelationship(draftData.relationship)
        if (draftData.description) setDescription(draftData.description)
      } catch (e) {
        /* ignore */
      }
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    const draft = localStorage.getItem("safemap_report_draft")
    let draftData = {
      /* ignore */
    }

    if (draft) {
      try {
        draftData = JSON.parse(draft)
      } catch (e) {
        /* ignore */
      }
    }

    // Update draft with current data
    const updatedDraft = {
      ...draftData,
      locationCoords,
      landmark,
      gender,
      ageGroup,
      relationship,
      description,
      timestamp: Date.now(),
    }

    localStorage.setItem("safemap_report_draft", JSON.stringify(updatedDraft))
  }, [locationCoords, landmark, gender, ageGroup, relationship, description])

  const genderOptions = ["Male", "Female", "LGBTQ+", "Prefer not to say"]
  const ageGroupOptions = ["Under 18", "18-25", "26-35", "36-45", "46-55", "56-65", "Over 65", "Unknown"]
  const relationshipOptions = ["Stranger", "Acquaintance", "Friend", "Family", "Neighbor", "Colleague", "Other"]

  return (
    <div className="w-full h-screen bg-slate-50 overflow-y-auto">
      {/* Header with back button and logo */}
      <div className="relative w-full h-auto p-4">
        <button
          onClick={() => navigate("/incident-details")}
          className="absolute left-2 top-4 p-2 hover:bg-gray-100 z-10"
        >
          <img src={rptBackImg} alt="Back" className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center pt-8">
          <img src={logoImg} alt="SafeMap" className="h-11 mb-4" />
        </div>
      </div>

      {/* Progress Section */}
      <div className="w-full max-w-md mx-auto px-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-blue-900 text-xs font-semibold font-['DM_Sans'] tracking-tight">STEP 2 OF 3</div>
            <div className="text-indigo-950 text-xs font-bold font-['DM_Sans'] tracking-tight">Incident Details</div>
          </div>
          <div className="text-gray-500 text-xs font-semibold font-['DM_Sans'] tracking-tight">66% Complete</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-300 rounded-[10px] overflow-hidden">
          <div className="w-2/3 h-full bg-blue-900 rounded-[10px]" />
        </div>
      </div>

      {/* Divider */}
      <div className="w-full max-w-md mx-auto mt-6 border-t border-gray-200" />

      {/* Form Section */}
      <div className="w-full max-w-md mx-auto px-4 mt-6">
        <h2 className="text-neutral-600 text-base font-bold font-['DM_Sans'] tracking-tight mb-2">
          Incident Location & Description
        </h2>
        <p className="text-gray-500 text-xs font-medium font-['DM_Sans'] tracking-tight mb-4">
          Provide specific details about where and how the incident occurred.
        </p>

        <h3 className="text-neutral-600 text-xs font-bold font-['DM_Sans'] tracking-tight mb-2">Location Details</h3>

        {/* Map */}
        <div className="w-full h-56 rounded-xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] overflow-hidden mb-4 relative">
          <Map center={[125.1667, 6.1167]} zoom={13} minZoom={11} maxZoom={18} className="h-full w-full" theme="light">
            <MapClickHandler onMapClick={handleMapClick} />
            {selectedLocation && (
              <MapMarker longitude={selectedLocation.lng} latitude={selectedLocation.lat}>
                <MarkerContent />
              </MapMarker>
            )}
          </Map>

          {/* Use My Location Button - Overlay */}
          <button
            onClick={handleUseMyLocation}
            className="absolute bottom-4 left-4 right-4 h-10 bg-white rounded-xl border border-gray-200 px-3 flex items-center gap-2 shadow-md z-1000 cursor-pointer hover:bg-gray-50"
          >
            <div className="w-4 h-4 relative overflow-hidden">
              <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 0C4.5 0 1.5 3 1.5 6.5C1.5 11 8 16 8 16C8 16 14.5 11 14.5 6.5C14.5 3 11.5 0 8 0ZM8 9C7.17 9 6.5 8.33 6.5 7.5C6.5 6.67 7.17 6 8 6C8.83 6 9.5 6.67 9.5 7.5C9.5 8.33 8.83 9 8 9Z"
                  fill="#6B7280"
                />
              </svg>
            </div>
            <span className="text-neutral-600 text-sm font-medium font-['DM_Sans']">Use My Current Location</span>
          </button>
        </div>

        {/* Nearest Landmark */}
        <div className="w-full mb-4 relative">
          <label className="block text-neutral-600 text-xs font-medium font-['DM_Sans'] tracking-tight mb-2">
            Nearest Landmark
          </label>
          <div className="relative">
            <input
              type="text"
              value={landmark}
              onChange={(e) => {
                setLandmark(e.target.value)
                setShowLandmarkDropdown(true)
              }}
              onFocus={() => setShowLandmarkDropdown(true)}
              placeholder="e.g. Near Jollibee Dadiangas North..."
              className="w-full h-12 bg-white rounded-xl border border-gray-300 px-4 text-gray-800 text-sm"
            />
            {/* Landmark Dropdown */}
            {showLandmarkDropdown && landmarkSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {landmarkSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setLandmark(suggestion)
                      setShowLandmarkDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Victim Gender */}
        <div className="w-full mb-4">
          <label className="block text-neutral-600 text-xs font-medium font-['DM_Sans'] tracking-tight mb-2">
            Victim Gender
          </label>
          <div className="relative">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-12 bg-white rounded-xl border border-gray-300 px-4 text-gray-800 text-sm appearance-none cursor-pointer"
            >
              <option value="" disabled>
                Select Gender
              </option>
              {genderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Victim Age Group */}
        <div className="w-full mb-4">
          <label className="block text-neutral-600 text-xs font-medium font-['DM_Sans'] tracking-tight mb-2">
            Victim Age Group
          </label>
          <div className="relative">
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full h-12 bg-white rounded-xl border border-gray-300 px-4 text-gray-800 text-sm appearance-none cursor-pointer"
            >
              <option value="" disabled>
                Select Age Group
              </option>
              {ageGroupOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Perpetrator Relationship */}
        <div className="w-full mb-4">
          <label className="block text-neutral-600 text-xs font-medium font-['DM_Sans'] tracking-tight mb-2">
            Perpetrator Relationship
          </label>
          <div className="relative">
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full h-12 bg-white rounded-xl border border-gray-300 px-4 text-gray-800 text-sm appearance-none cursor-pointer"
            >
              <option value="" disabled>
                What is the connection?
              </option>
              {relationshipOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="w-full mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-neutral-600 text-xs font-medium font-['DM_Sans'] tracking-tight">
              Detailed Description
            </label>
            <span className="h-5 px-2.5 py-1 bg-blue-50 rounded-md">
              <span className="text-blue-900 text-[10px] font-semibold font-['DM_Sans'] tracking-tight">ENCRYPTED</span>
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe what happened in detail..."
            className="w-full h-28 bg-white rounded-xl border border-gray-300 p-4 text-gray-800 text-sm resize-none"
          />
        </div>

        {/* Stay Anonymous Info Box */}
        <div className="w-full h-28 bg-blue-50 rounded-[10px] border border-blue-600 p-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 mt-0.5 shrink-0">
              <img src={rptImpReminderImg} alt="Info" className="w-5 h-5" />
            </div>
            <p className="text-justify">
              <span className="text-blue-900 text-xs font-semibold font-['DM_Sans'] tracking-tight">
                Stay Anonymous:
              </span>
              <span className="text-zinc-800 text-xs font-medium font-['DM_Sans'] tracking-tight">
                {" "}
                Do not include names, contact details, or specific identifying information about yourself or others
                unless necessary for the safety of the community.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="w-full max-w-md mx-auto px-4 mb-24">
        <Button
          onClick={handleProceed}
          className="w-full h-14 bg-blue-900 rounded-2xl shadow-[0px_4px_16px_0px_rgba(59,91,219,0.35)]"
        >
          <span className="text-white text-base font-semibold font-['DM_Sans'] tracking-tight">
            Proceed to Next Step
          </span>
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        onHelpClick={() => {
          /* ignore */
        }}
        onChatClick={() => {
          /* ignore */
        }}
      />
    </div>
  )
}
