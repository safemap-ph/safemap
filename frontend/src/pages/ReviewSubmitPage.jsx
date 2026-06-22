import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logoImg from '/src/assets/images/Logo.svg'
import rptBackImg from '/src/assets/images/rpt_back.svg'
import rptImpReminderImg from '/src/assets/images/rpt_imp_reminder.svg'
import { Button } from "@/components/ui/button"
import BottomNav from "@/components/BottomNav"
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function ReviewSubmitPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [reportData, setReportData] = useState(null)
  const [confirmed, setConfirmed] = useState(false)

  // Get data from previous steps
  useEffect(() => {
    if (location.state) {
      setReportData(location.state)
    }
  }, [location])

  // Default data if no data passed
  const data = reportData || {
    incidentType: 'Not specified',
    date: 'Not specified',
    time: '',
    locationCoords: { lat: 6.1167, lng: 125.1667 },
    landmark: 'Not specified',
    gender: 'Not specified',
    ageGroup: 'Not specified',
    relationship: 'Not specified',
    description: 'No description provided'
  }

  // Map frontend incident types to backend categories (GBV only)
  const mapCategory = (incidentType) => {
    const mapping = {
      'Sexual Assault':    'sexual_assault',
      'Physical Abuse':    'physical_abuse',
      'Domestic Violence': 'domestic_violence',
      'Stalking':          'stalking',
      'Verbal Abuse':      'verbal_abuse',
      'Emotional Abuse':   'emotional_abuse',
    }
    return mapping[incidentType] || 'other'
  }

  const handleSubmit = async () => {
    if (!confirmed) {
      alert('Please confirm that your report does not contain personal information.')
      return
    }

    // Validate required data before submitting
    if (!data.incidentType || !data.description) {
      alert('Please complete all required fields: incident type and description.')
      return
    }

    if (!data.locationCoords || !data.locationCoords.lat || !data.locationCoords.lng) {
      alert('Please select a location on the map.')
      return
    }

    try {
      const payload = {
        title: data.incidentType,
        description: data.description,
        latitude: data.locationCoords.lat,
        longitude: data.locationCoords.lng,
        category: mapCategory(data.incidentType),
        city: 'General Santos',
        barangay: data.landmark || '',
        address: data.landmark || ''
      }

      console.log('Submitting report:', payload)

      // Submit report to backend
      const response = await fetch('http://localhost:5000/api/reports/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      console.log('Backend response:', result)

      if (response.ok) {
        // Clear localStorage draft on successful submission
        localStorage.removeItem('safemap_report_draft')
        
        // Navigate to success page with reference code from backend
        navigate('/report-success', { 
          state: { 
            reportData: data,
            referenceCode: result.reference_code 
          } 
        })
      } else {
        // Show specific error message from backend
        const errorMsg = result.message || result.error || 'Failed to submit report. Please try again.'
        alert(`Error: ${errorMsg}`)
        console.error('Backend error:', result)
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Error submitting report. Please check your connection and try again.')
    }
  }

  return (
    <div className="w-full h-screen bg-slate-50 overflow-y-auto">
      {/* Header with back button and logo */}
      <div className="relative w-full h-auto p-4">
        <button 
          onClick={() => navigate('/location-details')}
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
            <div className="text-blue-900 text-xs font-semibold font-['DM_Sans'] tracking-tight">STEP 3 OF 3</div>
            <div className="text-indigo-950 text-xs font-bold font-['DM_Sans'] tracking-tight">Review and Submit</div>
          </div>
          <div className="text-gray-500 text-xs font-semibold font-['DM_Sans'] tracking-tight">100% Complete</div>
        </div>
        
        {/* Progress Bar - Full */}
        <div className="w-full h-1.5 bg-blue-900 rounded-[10px] overflow-hidden">
          <div className="w-full h-full bg-blue-900 rounded-[10px]" />
        </div>
      </div>

      {/* Divider */}
      <div className="w-full max-w-md mx-auto mt-6 border-t border-gray-200" />

      {/* Report Summary Section */}
      <div className="w-full max-w-md mx-auto px-4 mt-6">
        <h2 className="text-neutral-600 text-sm font-bold font-['DM_Sans'] tracking-tight mb-4">Report Summary</h2>

        {/* Incident Type */}
        <div className="w-full h-16 bg-white rounded-lg shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] border border-gray-200 mb-2 flex items-center px-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 p-2.5 bg-indigo-50 rounded-md flex items-center justify-center">
              <div className="w-5 h-5">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0L0 4V10C0 15 3.75 19.25 10 20C16.25 19.25 20 15 20 10V4L10 0Z" fill="#1A3A8F"/>
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-normal font-['DM_Sans']">Incident Type</span>
              <span className="text-zinc-800 text-xs font-bold font-['DM_Sans']">{data.incidentType}</span>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="w-full h-16 bg-white rounded-lg shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] border border-gray-200 mb-2 flex items-center px-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 p-2.5 bg-indigo-50 rounded-md flex items-center justify-center">
              <div className="w-5 h-5">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="16" height="14" rx="2" stroke="#1A3A8F" strokeWidth="1.5"/>
                  <path d="M2 8H18" stroke="#1A3A8F" strokeWidth="1.5"/>
                  <path d="M6 2V5M14 2V5" stroke="#1A3A8F" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-normal font-['DM_Sans']">Date & Time</span>
              <span className="text-zinc-800 text-xs font-bold font-['DM_Sans']">{data.date}{data.time ? ` • ${data.time}` : ''}</span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="w-full h-56 bg-white rounded-lg shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] border border-gray-200 mb-2 overflow-hidden">
          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 p-2.5 bg-indigo-50 rounded-md flex items-center justify-center">
              <div className="w-5 h-5">
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0C3.6 0 0 3.6 0 8C0 13 8 16 8 16C8 16 16 13 16 8C16 3.6 12.4 0 8 0ZM8 11C6.9 11 6 10.1 6 9C6 7.9 6.9 7 8 7C9.1 7 10 7.9 10 9C10 10.1 9.1 11 8 11Z" fill="#1A3A8F"/>
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-normal font-['DM_Sans']">Location</span>
              <span className="text-zinc-800 text-xs font-bold font-['DM_Sans']">{data.landmark || 'Selected Location'}</span>
            </div>
          </div>
          {/* Mini Map */}
          <div className="h-32 w-full">
            <MapContainer 
              center={[data.locationCoords?.lat || 6.1167, data.locationCoords?.lng || 125.1667]} 
              zoom={14} 
              className="h-full w-full"
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[data.locationCoords?.lat || 6.1167, data.locationCoords?.lng || 125.1667]} />
            </MapContainer>
          </div>
        </div>

        {/* Victim / Perpetrator Info */}
        <div className="w-full h-36 bg-blue-50 rounded-[10px] shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] mb-2 overflow-hidden p-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 p-2.5 bg-indigo-50 rounded-md flex items-center justify-center shrink-0">
              <div className="w-5 h-5">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="6" r="3" stroke="#1A3A8F" strokeWidth="1.5"/>
                  <path d="M4 18C4 14.134 7.134 11 10 11C12.866 11 16 14.134 16 18" stroke="#1A3A8F" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-gray-400 text-xs font-normal font-['DM_Sans']">Victim / Perpetrator Info</span>
              <span className="text-zinc-800 text-xs font-bold font-['DM_Sans']">{data.gender} • {data.relationship}</span>
              <span className="text-justify text-gray-500 text-sm font-normal font-['DM_Sans']">{data.description}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="w-full max-w-md mx-auto px-4 mt-4">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => setConfirmed(!confirmed)}
            className="w-6 h-6 shrink-0 border-2 border-gray-300 rounded flex items-center justify-center"
          >
            {confirmed && (
              <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8L6.5 11.5L13 4.5" stroke="#1A3A8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <span className="text-justify text-gray-500 text-sm font-normal font-['DM_Sans']">
            I confirm that this report does not contain personal names or identifying information, ensuring full anonymity for all parties. I agree to the{' '}
            <button 
              onClick={() => navigate('/terms', { state: { from: 'review-submit', data: reportData } })}
              className="text-blue-700 underline hover:text-blue-900"
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button 
              onClick={() => navigate('/privacy', { state: { from: 'review-submit', data: reportData } })}
              className="text-blue-700 underline hover:text-blue-900"
            >
              Privacy Policy
            </button>.
          </span>
        </div>
      </div>

      {/* Encryption Info */}
      <div className="w-full max-w-md mx-auto px-4 mt-4">
        <div className="w-full bg-blue-50 rounded-[10px] border border-blue-600 overflow-hidden p-4">
          <div className="flex items-start gap-3.5">
            <div className="w-5 h-5 shrink-0 mt-0.5">
              <img src={rptImpReminderImg} alt="Lock" className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-blue-900 text-xs font-semibold font-['DM_Sans']">Your Privacy is Protected</span>
              <span className="text-justify text-blue-900 text-xs font-normal font-['DM_Sans']">
                Your report description is encrypted. We collect minimal data (location, category, timestamp) for safety purposes. Your IP address is logged for security only. This report is anonymous by design.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="w-full max-w-md mx-auto px-4 mt-6 mb-24">
        <Button 
          onClick={handleSubmit}
          className="w-full h-14 bg-blue-900 rounded-2xl shadow-[0px_4px_16px_0px_rgba(59,91,219,0.35)]"
        >
          <span className="text-white text-base font-semibold font-['DM_Sans'] tracking-tight">Submit Report</span>
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        onHelpClick={() => {}} 
        onChatClick={() => {}} 
      />
    </div>
  )
}