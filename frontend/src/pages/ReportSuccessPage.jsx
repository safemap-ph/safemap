import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logoImg from '/src/assets/images/Logo.svg'
import { Button } from "@/components/ui/button"

export default function ReportSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [referenceCode, setReferenceCode] = useState('')
  const [showCopyHint, setShowCopyHint] = useState(false)

  // Get reference code from previous page
  useEffect(() => {
    if (location.state?.referenceCode) {
      setReferenceCode(location.state.referenceCode)
    }
  }, [location])

  // Copy reference code to clipboard on long press
  const handleLongPress = async () => {
    if (referenceCode) {
      try {
        await navigator.clipboard.writeText(referenceCode)
        setShowCopyHint(true)
        setTimeout(() => setShowCopyHint(false), 2000)
      } catch (err) { /* ignore */ }
    }
  }

  const handleTrackStatus = () => {
    navigate('/track')
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 overflow-y-auto flex flex-col items-center py-8 px-4">
      {/* Logo */}
      <div className="mb-8">
        <img src={logoImg} alt="SafeMap" className="h-11" />
      </div>

      {/* Success Message */}
      <div className="w-full max-w-md flex flex-col items-center gap-3">
        {/* Success Icon */}
        <div className="w-20 h-20 p-5 bg-blue-50 rounded-[20px] flex items-center justify-center">
          <div className="w-10 h-10 relative overflow-hidden">
            {/* Checkmark icon */}
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#1A3A8F"/>
              <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="text-center text-blue-900 text-3xl font-extrabold font-['DM_Sans'] tracking-tight">
            Report Submitted Successfully
          </div>
          <div className="text-center text-gray-500 text-base font-normal font-['DM_Sans'] tracking-tight px-4">
            Your report has been received and is now in the queue for preliminary assessment by our dispatch team.
          </div>
        </div>
      </div>

      {/* Reference Code Box - Constrained on desktop */}
      <div className="w-full max-w-md mt-12 bg-white rounded-xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] border-l-[5px] border-blue-900 p-6">
        <div className="w-full flex flex-col justify-center items-center gap-3">
          <div className="text-center text-gray-400 text-base font-bold font-['DM_Sans'] tracking-tight">
            REPORT REFERENCE CODE
          </div>
          <div 
            className="w-full h-14 px-6 bg-blue-50 rounded-2xl shadow-[0px_4px_16px_0px_rgba(59,91,219,0.35)] flex items-center justify-center cursor-pointer select-none"
            onClick={handleLongPress}
            onTouchStart={handleLongPress}
            title="Hold to copy"
          >
            <div className="text-center text-blue-900 text-2xl font-extrabold font-['DM_Sans'] tracking-tight">
              {referenceCode || 'Generating...'}
            </div>
          </div>
          {showCopyHint && (
            <div className="text-green-600 text-sm font-medium">Copied to clipboard!</div>
          )}
        </div>
      </div>

      {/* Buttons - Constrained on desktop */}
      <div className="w-full max-w-md mt-8 flex flex-col gap-4">
        <Button 
          onClick={handleTrackStatus}
          className="w-full h-14 bg-blue-900 rounded-2xl shadow-[0px_4px_16px_0px_rgba(59,91,219,0.35)]"
        >
          <span className="text-white text-base font-semibold font-['DM_Sans'] tracking-tight">Track Status</span>
        </Button>
        
        <Button 
          onClick={handleBackToHome}
          variant="outline"
          className="w-full h-14 bg-white rounded-2xl shadow-[0px_4px_16px_0px_rgba(59,91,219,0.35)] border-2 border-blue-600"
        >
          <span className="text-blue-900 text-base font-semibold font-['DM_Sans'] tracking-tight">Back to Home</span>
        </Button>
      </div>

      {/* Privacy Notice */}
      <div className="w-full max-w-md mt-8">
        <p className="text-center text-gray-400 text-xs font-normal font-['DM_Sans'] tracking-tight">
          SAFEMAP PH ensures your personal data is handled according to Data Privacy Act of 2012 (RA 10173). Your identity is protected.
        </p>
      </div>
    </div>
  )
}