import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import logoImg from "/src/assets/images/Logo.svg"
import rptBackImg from "/src/assets/images/rpt_back.svg"
import rptImpReminderImg from "/src/assets/images/rpt_imp_reminder.svg"
import { Button } from "@/components/ui/button"
import BottomNav from "@/components/BottomNav"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx"

export default function IncidentDetailsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [incidentType, setIncidentType] = useState("")
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [time, setTime] = useState(() => {
    const now = new Date()
    return now.toTimeString().slice(0, 5)
  })
  const [description, setDescription] = useState("")

  // Load draft data on mount if resuming
  useEffect(() => {
    if (location.state?.resumeDraft) {
      const draft = localStorage.getItem("safemap_report_draft")
      if (draft) {
        try {
          const draftData = JSON.parse(draft)
          if (draftData.incidentType) setIncidentType(draftData.incidentType)
          if (draftData.description) setDescription(draftData.description)
        } catch (e) {
          /* ignore */
        }
      }
    }
  }, [location])

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
      incidentType,
      description,
      timestamp: Date.now(),
    }

    localStorage.setItem("safemap_report_draft", JSON.stringify(updatedDraft))
  }, [incidentType, description])

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return ""
    const dateObj = new Date(dateStr)
    return dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return ""
    const [hours, minutes] = timeStr.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const handleProceed = () => {
    // Pass data to next step
    navigate("/location-details", {
      state: {
        incidentType,
        date: formatDate(date),
        time: formatTime(time),
        description,
      },
    })
  }

  const [incidentTypes, setIncidentTypes] = useState([
    "Sexual Assault",
    "Physical Abuse",
    "Domestic Violence",
    "Stalking",
    "Verbal Abuse",
    "Emotional Abuse",
  ])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "") : "/api"}/reports/categories`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const cats = data?.categories
        if (Array.isArray(cats) && cats.length > 0) {
          setIncidentTypes(
            cats
              .filter((c) => c.is_active !== false)
              .map((c) => c.label || c.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()))
          )
        }
      })
      .catch(() => { /* keep fallback */ })
  }, [])

  return (
    <div className="w-full h-screen bg-slate-50 overflow-y-auto">
      {/* Header with back button and logo */}
      <div className="relative w-full h-auto p-4">
        <button onClick={() => navigate("/report")} className="absolute left-2 top-4 p-2 hover:bg-gray-100 z-10">
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
            <div className="text-blue-900 text-xs font-semibold font-['DM_Sans'] tracking-tight">STEP 1 OF 3</div>
            <div className="text-indigo-950 text-xs font-bold font-['DM_Sans'] tracking-tight">Incident Details</div>
          </div>
          <div className="text-gray-500 text-xs font-semibold font-['DM_Sans'] tracking-tight">33% Complete</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-300 rounded-[10px] overflow-hidden">
          <div className="w-40 h-full bg-blue-900 rounded-[10px]" />
        </div>
      </div>

      {/* Divider */}
      <div className="w-full max-w-md mx-auto mt-6 border-t border-gray-200" />

      {/* Form Section */}
      <div className="w-full max-w-md mx-auto px-4 mt-6">
        <h2 className="text-neutral-600 text-base font-bold font-['DM_Sans'] tracking-tight mb-4">
          Report an Incident
        </h2>

        {/* Anonymity Info Box */}
        <div className="w-full h-20 bg-blue-50 rounded-[10px] border border-blue-600 p-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 mt-0.5 shrink-0">
              <img src={rptImpReminderImg} alt="Info" className="w-5 h-5 mt-0.5 shrink-0" />
            </div>
            <p className="text-justify text-zinc-800 text-xs font-medium font-['DM_Sans'] tracking-tight">
              Your safety is our priority. Please provide details without including personal names or ID numbers to
              maintain anonymity.
            </p>
          </div>
        </div>

        {/* Type of Abuse Dropdown */}
        <div className="w-full mb-4">
          <label className="block text-neutral-600 text-xs font-medium font-['DM_Sans'] tracking-tight mb-1.5">
            Type of Abuse
          </label>
          <div className="relative">
            <Select value={incidentType} onValueChange={setIncidentType}>
              <SelectTrigger className="w-full h-10 bg-white rounded-xl border border-gray-300 px-3 text-gray-800 text-xs cursor-pointer">
                <SelectValue placeholder="Select incident category" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {incidentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date and Time Row */}
        <div className="flex gap-3 mb-4">
          {/* Date */}
          <div className="w-1/2">
            <label className="block text-neutral-600 text-xs font-medium font-['DM_Sans'] tracking-tight mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              readOnly
              className="w-full h-10 bg-gray-100 rounded-xl border border-gray-300 px-3 text-gray-800 text-xs cursor-not-allowed"
            />
          </div>

          {/* Time */}
          <div className="w-1/2">
            <label className="block text-neutral-600 text-xs font-medium font-['DM_Sans'] tracking-tight mb-1.5">
              Time
            </label>
            <input
              type="time"
              value={time}
              readOnly
              className="w-full h-10 bg-gray-100 rounded-xl border border-gray-300 px-3 text-gray-800 text-xs cursor-not-allowed"
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-neutral-600 text-xs font-medium font-['DM_Sans'] tracking-tight">
              Detailed Description
            </label>
            <span className="text-gray-400 text-[10px] font-semibold font-['DM_Sans'] tracking-tight">ANONYMOUS</span>
          </div>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened... (Reminder: Do not include names or ID numbers)"
              className="w-full h-44 bg-white rounded-xl border border-gray-300 p-4 text-gray-800 text-sm resize-none"
            />
          </div>
          {/* Privacy Note */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-4 h-4 shrink-0">
              <img src={rptImpReminderImg} alt="Lock" className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-gray-500 text-[10px] font-medium font-['DM_Sans'] tracking-tight">
              This data is encrypted and cannot be traced back to you.
            </span>
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

        <p className="text-center text-gray-500 text-[10px] font-medium font-['DM_Sans'] tracking-tight mt-2 mb-6">
          By submitting, you agree to SAFEMAP PH's privacy protocols for anonymous reporting.
        </p>
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
