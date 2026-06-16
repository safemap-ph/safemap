import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logoImg from '/src/assets/images/Logo.svg'
import rptBackImg from '/src/assets/images/rpt_back.svg'
import rptSafetyImg from '/src/assets/images/rpt_safety.svg'
import rptImpReminderImg from '/src/assets/images/rpt_imp_reminder.svg'
import { Checkbox } from "@/components/ui/checkbox"
import { MapContainer, TileLayer } from 'react-leaflet'

export default function ReportPage() {
  const navigate = useNavigate()
  const [emergencyChecked, setEmergencyChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)

  // Check for existing draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('safemap_report_draft')
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        // Check if draft is less than 24 hours old
        const draftAge = Date.now() - (draftData.timestamp || 0)
        if (draftAge < 24 * 60 * 60 * 1000) {
          setHasDraft(true)
        } else {
          // Clear expired draft
          localStorage.removeItem('safemap_report_draft')
        }
      } catch (e) { /* ignore */ }
    }
  }, [])

  const handleStartReport = () => {
    if (!emergencyChecked || !privacyChecked) {
      alert('Please check both boxes to confirm you have read the guidelines.')
      return
    }
    navigate('/incident-details')
  }

  const handleResumeDraft = () => {
    if (!emergencyChecked || !privacyChecked) {
      alert('Please check both boxes to confirm you have read the guidelines.')
      return
    }
    navigate('/incident-details', { state: { resumeDraft: true } })
  }

  const handleClearDraft = () => {
    if (confirm('Are you sure you want to clear your saved draft?')) {
      localStorage.removeItem('safemap_report_draft')
      setHasDraft(false)
    }
  }

  return (
    <div className="w-full h-screen bg-slate-50 overflow-y-auto">
      {/* Header with back button and logo */}
      <div className="relative w-full h-auto p-4">
        <button 
          onClick={() => navigate('/')}
          className="absolute left-2 top-4 p-2 hover:bg-gray-100 z-10"
        >
          <img src={rptBackImg} alt="Back" className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center pt-8">
          <img src={logoImg} alt="SafeMap" className="h-11 mb-4" />
        </div>
      </div>
      
      {/* Safety First Section */}
      <div className="w-full max-w-md mx-auto px-4 flex flex-col items-center gap-3">
        <div className="w-20 h-20 p-5 bg-blue-50 rounded-[20px] flex items-center justify-center">
          <img src={rptSafetyImg} alt="Safety" className="w-10 h-10" />
        </div>
        
        <div className="text-center">
          <h1 className="text-blue-900 text-3xl font-extrabold font-['DM_Sans'] tracking-tight">Safety First</h1>
          <p className="text-gray-500 text-base font-normal mt-2">Your security is our priority. Please review these essential guidelines before submitting your report.</p>
        </div>
      </div>
      
      {/* Map Section - Static Map of General Santos City */}
      <div className="w-full max-w-md mx-auto mt-8 shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)]">
        <div className="w-full h-56 rounded-t-xl overflow-hidden">
          <MapContainer 
            center={[6.1167, 125.1667]} 
            zoom={12} 
            className="h-full w-full"
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            boxZoom={false}
            keyboard={false}
            tap={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </MapContainer>
        </div>
        <div className="w-full h-10 bg-white flex items-center px-4">
          <div className="flex items-center gap-2">
            <img src={rptImpReminderImg} alt="Important" className="w-4 h-4" />
            <span className="text-blue-900 text-sm font-medium">Important Reminders</span>
          </div>
        </div>
      </div>
      
      {/* Info Cards */}
      <div className="w-full max-w-md mx-auto mt-8 px-4 flex flex-col gap-4">
        {/* Emergency Protocol */}
        <div className="w-full h-auto bg-white rounded-2xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] outline-solid outline-1 -outline-offset-1 outline-gray-200 px-5 py-4 flex items-start gap-3.5">
          <Checkbox 
            id="emergency" 
            checked={emergencyChecked} 
            onCheckedChange={setEmergencyChecked}
            className="mt-1"
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="emergency" className="text-zinc-800 text-xs font-medium cursor-pointer">Emergency Protocol</label>
            <span className="text-gray-400 text-xs">If you are in immediate danger, call <span className="text-blue-900 font-bold">911</span> immediately.</span>
          </div>
        </div>
        
        {/* Privacy Rule */}
        <div className="w-full h-auto bg-white rounded-2xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] outline-solid outline-1 -outline-offset-1 outline-gray-200 px-5 py-4 flex items-start gap-3.5">
          <Checkbox 
            id="privacy" 
            checked={privacyChecked} 
            onCheckedChange={setPrivacyChecked}
            className="mt-1"
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="privacy" className="text-zinc-800 text-xs font-medium cursor-pointer">Privacy Rule</label>
            <span className="text-gray-400 text-xs">Your report will be treated with strict confidentiality. We never share your personal information.</span>
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="w-full max-w-md mx-auto mt-8 px-4 pb-8">
        {hasDraft && (
          <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-600">
            <div className="flex items-center gap-2 mb-2">
              <img src={rptImpReminderImg} alt="Info" className="w-4 h-4" />
              <span className="text-blue-900 text-sm font-semibold">Draft Found</span>
            </div>
            <p className="text-blue-900 text-xs mb-3">You have an unfinished report. Would you like to continue where you left off?</p>
            <div className="flex gap-2">
              <button 
                onClick={handleResumeDraft}
                disabled={!emergencyChecked || !privacyChecked}
                className="flex-1 h-10 bg-blue-900 rounded-xl text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resume Draft
              </button>
              <button 
                onClick={handleClearDraft}
                className="h-10 px-4 bg-white border border-gray-300 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleStartReport}
          disabled={!emergencyChecked || !privacyChecked}
          className="w-full h-14 bg-blue-950 rounded-xl shadow-[0px_4px_16px_0px_rgba(26,42,108,0.40)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-white text-base font-semibold font-['DM_Sans'] tracking-tight">
            {hasDraft ? 'Start New Report' : 'Start Anonymous Report'}
          </span>
        </button>
      </div>
    </div>
  )
}
