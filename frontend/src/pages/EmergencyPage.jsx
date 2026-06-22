import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logoImg from '/src/assets/images/Logo.svg'
import rptBackImg from '/src/assets/images/rpt_back.svg'
import BottomNav from '@/components/BottomNav'

// Emergency locations data (shared with MapView)
const EMERGENCY_LOCATIONS = {
  "features": [
    { "properties": { "name": "Gensan Medical Center", "type": "hospital", "contact": "887-9898", "lat": 6.1128, "lng": 125.1716 } },
    { "properties": { "name": "St. Elizabeth Hospital", "type": "hospital", "contact": "552-3162 / 0919-071-9004", "lat": 6.1147, "lng": 125.1702 } },
    { "properties": { "name": "Mindanao Medical Center", "type": "hospital", "contact": "553-8207 / 554-9640", "lat": 6.1085, "lng": 125.1748 } },
    { "properties": { "name": "Dadiangas Medical Center", "type": "hospital", "contact": "0917-190-2561", "lat": 6.1195, "lng": 125.1680 } },
    { "properties": { "name": "Sarangani Bay Specialists Medical Center", "type": "hospital", "contact": "887-8888 / 0919-067-8395", "lat": 6.1223, "lng": 125.1735 } },
    { "properties": { "name": "Gensan Doctors Hospital", "type": "hospital", "contact": "250-2777 / 0933-821-7257", "lat": 6.1138, "lng": 125.1692 } },
    { "properties": { "name": "Dr. Jorge P. Royeca City Hospital", "type": "hospital", "contact": "552-2811 / 0912-376-2331", "lat": 6.1103, "lng": 125.1724 } },
    { "properties": { "name": "GSC Police Office", "type": "police", "contact": "552-5573 / 0998-598-7207", "lat": 6.1142, "lng": 125.1710 } },
    { "properties": { "name": "Police Station 1 (Dad. East)", "type": "police", "contact": "0998-598-7208", "lat": 6.1165, "lng": 125.1730 } },
    { "properties": { "name": "Police Station 2 (Makar Wharf)", "type": "police", "contact": "0918-921-3580", "lat": 6.0952, "lng": 125.1423 } },
    { "properties": { "name": "Police Station 3 (Lagao)", "type": "police", "contact": "0998-598-7212", "lat": 6.1482, "lng": 125.1862 } },
    { "properties": { "name": "Police Station 4 (San Isidro)", "type": "police", "contact": "0998-598-7214", "lat": 6.1340, "lng": 125.2045 } },
    { "properties": { "name": "Police Station 5", "type": "police", "contact": "0907-313-4517", "lat": 6.1055, "lng": 125.1668 } },
    { "properties": { "name": "Police Station 6 (Bula)", "type": "police", "contact": "0998-598-7218", "lat": 6.0888, "lng": 125.1598 } },
    { "properties": { "name": "Police Station 7 (Fatima)", "type": "police", "contact": "0998-598-7220", "lat": 6.1268, "lng": 125.1955 } },
    { "properties": { "name": "Police Station 8 (Tinagacan)", "type": "police", "contact": "0998-598-7223", "lat": 6.0975, "lng": 125.1885 } },
    { "properties": { "name": "Police Station 9 (Mabuhay)", "type": "police", "contact": "0948-874-1661", "lat": 6.1588, "lng": 125.1742 } },
    { "properties": { "name": "Police Station 10 (Calumpang)", "type": "police", "contact": "0999-548-9244", "lat": 6.1128, "lng": 125.1638 } },
    { "properties": { "name": "Bureau of Fire Protection (BFP)", "type": "fire", "contact": "552-1160 / 0943-341-5561 / 160", "lat": 6.1135, "lng": 125.1718 } },
    { "properties": { "name": "CDRRMO Gensan", "type": "rescue", "contact": "552-3939 / 0943-461-4548", "lat": 6.1140, "lng": 125.1705 } },
    { "properties": { "name": "Task Force Gensan", "type": "rescue", "contact": "887-6018 / 0905-144-3676", "lat": 6.1148, "lng": 125.1712 } }
  ]
}

// Calculate distance between two coordinates in km
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export default function EmergencyPage() {
  const navigate = useNavigate()
  const [userLocation, setUserLocation] = useState({ lat: 6.1167, lng: 125.1667 })
  const [supportCenters, setSupportCenters] = useState([])

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          // Default to center of Gensan if permission denied
          console.log('Using default location')
        }
      )
    }
  }, [])

  useEffect(() => {
    // Calculate distances for all locations
    const centersWithDistance = EMERGENCY_LOCATIONS.features.map(feature => {
      const distance = calculateDistance(
        userLocation.lat, userLocation.lng,
        feature.properties.lat, feature.properties.lng
      )
      return {
        ...feature.properties,
        distance: distance.toFixed(1)
      }
    })
    
    // Sort by distance and take nearest 5
    const nearest = centersWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
    
    setSupportCenters(nearest)
  }, [userLocation])

  const currentLocationText = userLocation.lat !== 6.1167 ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Jollibee, General Santos City'

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

      {/* Divider */}
      <div className="w-full max-w-md mx-auto border-t border-gray-200" />

      {/* Title and Badge */}
      <div className="w-full max-w-md mx-auto px-4 mt-4 flex justify-between items-center">
        <h1 className="text-zinc-800 text-lg font-extrabold font-['DM_Sans'] tracking-tight">Emergency Help</h1>
        <div className="w-28 p-2 bg-red-100 rounded-lg inline-flex justify-center items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="text-red-500 text-xs font-bold font-['DM_Sans'] tracking-tight">24/7 ACTIVE</div>
        </div>
      </div>

      {/* Immediate Assistance Title */}
      <div className="w-full max-w-md mx-auto px-4 mt-6">
        <div className="text-neutral-600 text-base font-bold font-['DM_Sans'] tracking-tight">Immediate Assistance</div>
      </div>

      {/* Emergency Contacts Grid */}
      <div className="w-full max-w-md mx-auto px-4 mt-4">
        <div className="flex justify-start items-start gap-3 w-full">
          {/* Left Column */}
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-3">
            {/* Task Force Gensan */}
            <div className="w-full h-44 bg-white/90 rounded-2xl shadow-[0px_1px_6px_0px_rgba(0,0,0,0.05)] border-l-[5px] border-red-500 overflow-hidden p-4">
              <div className="w-full h-full inline-flex flex-col justify-center items-center gap-4">
                <div className="w-10 h-10 p-2 bg-red-100 rounded-[20px] inline-flex justify-center items-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#DC2626"/>
                    <path d="M12 8L8 10V14L12 16L16 14V10L12 8Z" fill="white"/>
                  </svg>
                </div>
                <div className="flex flex-col justify-center items-center gap-2">
                  <div className="text-center text-blue-900 text-base font-bold font-['DM_Sans'] tracking-tight">TASK FORCE GENSAN</div>
                  <div className="text-center text-gray-600 text-xs font-normal font-['DM_Sans'] tracking-tight">887-6018<br/>+63 05-114-3676</div>
                </div>
              </div>
            </div>

            {/* VAWC Hotline */}
            <div className="w-full h-44 bg-white/90 rounded-2xl shadow-[0px_1px_6px_0px_rgba(0,0,0,0.05)] border-l-[5px] border-blue-900 overflow-hidden p-4">
              <div className="w-full h-full inline-flex flex-col justify-center items-center gap-4">
                <div className="w-10 h-10 p-2 bg-blue-50 rounded-[20px] inline-flex justify-center items-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M12 2C8.686 2 6 4.686 6 8C6 12 12 22 12 22C12 22 18 12 18 8C18 4.686 15.314 2 12 2Z" fill="#1E3A8A"/>
                    <circle cx="12" cy="8" r="2" fill="white"/>
                  </svg>
                </div>
                <div className="flex flex-col justify-center items-center gap-2">
                  <div className="text-center text-blue-900 text-base font-bold font-['DM_Sans'] tracking-tight">VAWC HOTLINE</div>
                  <div className="text-center text-gray-600 text-xs font-normal font-['DM_Sans'] tracking-tight">1800-1888-1553</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-3">
            {/* GSCPO Headquarters */}
            <div className="w-full h-44 bg-white/90 rounded-2xl shadow-[0px_1px_6px_0px_rgba(0,0,0,0.05)] border-l-[5px] border-blue-900 overflow-hidden p-4">
              <div className="w-full h-full inline-flex flex-col justify-center items-center gap-4">
                <div className="w-10 h-10 p-2 bg-blue-50 rounded-[20px] inline-flex justify-center items-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <rect x="4" y="4" width="16" height="16" rx="2" fill="#1E3A8A"/>
                    <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="flex flex-col justify-center items-center gap-2">
                  <div className="text-center text-blue-900 text-base font-bold font-['DM_Sans'] tracking-tight">GSCPO Headquarters</div>
                  <div className="text-center text-gray-600 text-xs font-normal font-['DM_Sans'] tracking-tight">552-3939<br/>552-8861</div>
                </div>
              </div>
            </div>

            {/* DSWD */}
            <div className="w-full h-44 bg-white/90 rounded-2xl shadow-[0px_1px_6px_0px_rgba(0,0,0,0.05)] border-l-[5px] border-blue-900 overflow-hidden p-4">
              <div className="w-full h-full inline-flex flex-col justify-center items-center gap-4">
                <div className="w-10 h-10 p-2 bg-blue-50 rounded-[20px] inline-flex justify-center items-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M12 2L4 6V12C4 16.4 7.6 20.5 12 22C16.4 20.5 20 16.4 20 12V6L12 2Z" fill="#1E3A8A"/>
                    <path d="M12 6L14 10H10L12 6Z" fill="white"/>
                  </svg>
                </div>
                <div className="flex flex-col justify-center items-center gap-2">
                  <div className="text-center text-blue-900 text-base font-bold font-['DM_Sans'] tracking-tight">DSWD</div>
                  <div className="text-center text-gray-600 text-xs font-normal font-['DM_Sans'] tracking-tight">887-6018<br/>+63 17-110-5686</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What to do now */}
      <div className="w-full max-w-md mx-auto px-4 mt-8">
        <div className="text-zinc-800 text-base font-bold font-['DM_Sans'] tracking-tight">What to do now</div>
      </div>

      {/* Cards side by side */}
      <div className="w-full max-w-md mx-auto px-4 mt-4 flex gap-3">
        {/* Stay in well-lit area card */}
        <div className="flex-1 h-40 p-4 bg-blue-900 rounded-lg flex flex-col justify-center gap-2">
          <div className="w-10 h-10">
            <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10">
              <circle cx="16" cy="16" r="12" fill="white"/>
              <path d="M16 8V16L22 22" stroke="#1E3A8A" strokeWidth="2"/>
            </svg>
          </div>
          <div className="flex flex-col justify-start gap-1">
            <div className="text-white text-lg font-extrabold font-['DM_Sans'] tracking-tight">Stay in a well-lit area</div>
            <div className="text-white text-xs font-normal font-['DM_Sans'] tracking-tight">Move towards crowds or open establishments.</div>
          </div>
        </div>

        {/* Keep phone charged card */}
        <div className="w-36 h-40 bg-white/90 rounded-2xl shadow-[0px_1px_6px_0px_rgba(0,0,0,0.05)] border-l-[5px] border-amber-500 overflow-hidden p-4 flex flex-col justify-center items-center gap-2">
          <div className="w-10 h-10">
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
              <rect x="8" y="2" width="8" height="18" rx="1" fill="#F59E0B"/>
              <rect x="10" y="20" width="4" height="2" fill="#F59E0B"/>
            </svg>
          </div>
          <div className="text-center text-blue-900 text-sm font-extrabold font-['DM_Sans'] tracking-tight">Keep phone charged</div>
        </div>
      </div>

      {/* Note your surroundings */}
      <div className="w-full max-w-md mx-auto px-4 mt-4">
        <div className="w-full h-16 bg-white rounded-lg shadow-[0px_0px_0px_0px_rgba(0,0,0,0.00)] border-l-4 border-blue-950 overflow-hidden">
          <div className="w-full h-full px-5 py-3 inline-flex justify-start items-center gap-3.5">
            <div className="w-10 h-10 p-2.5 bg-blue-100 rounded-md flex justify-start items-start gap-2.5">
              <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                <path d="M10 2C6.686 2 4 4.686 4 8C4 12 10 18 10 18C10 18 16 12 16 8C16 4.686 13.314 2 10 2Z" fill="#1E3A8A"/>
                <circle cx="10" cy="8" r="2" fill="white"/>
              </svg>
            </div>
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
              <div className="self-stretch justify-start text-zinc-800 text-xs font-bold font-['DM_Sans'] tracking-tight">Note your surroundings</div>
              <div className="justify-start text-gray-400 text-xs font-normal font-['DM_Sans'] tracking-tight">Remember street names or landmarks nearby.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Nearest Support Centers */}
      <div className="w-full max-w-md mx-auto px-4 mt-8">
        <div className="text-zinc-800 text-base font-bold font-['DM_Sans'] tracking-tight">Support Centers</div>
      </div>

      {/* Support Center Cards - Dynamic */}
      <div className="w-full max-w-md mx-auto px-4 mt-3">
        {supportCenters.map((center, index) => (
          <div key={index} className="w-full h-36 bg-white rounded-tl-xl rounded-bl-xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] border-l-[5px] border-blue-950 overflow-hidden mb-3 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex justify-start items-start gap-3.5">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  center.type === 'hospital' ? 'bg-green-100' :
                  center.type === 'police' ? 'bg-blue-100' :
                  center.type === 'fire' ? 'bg-amber-100' : 'bg-purple-100'
                }`}>
                  {center.type === 'hospital' && (
                    <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
                  )}
                  {center.type === 'police' && (
                    <svg className="w-6 h-6 text-blue-900" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                  )}
                  {center.type === 'fire' && (
                    <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-3.5 2-6 4.5-6 7.5 0 2.5 2.5 4 4 5.5 1.5-1.5 3-2.5 4.5-2.5.5 0 1 0 1.5.5-2.5-3-3.5-4.5-4-5.5-.5 1-.5 2.5-.5 4 2.5-.5 5-2 5-4 0-3-2.5-5.5-5-7.5z"/></svg>
                  )}
                  {center.type === 'rescue' && (
                    <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.25 6 2.25v4.78z"/></svg>
                  )}
                </div>
                <div className="inline-flex flex-col justify-start items-start gap-1">
                  <div className="self-stretch justify-start text-zinc-800 text-base font-bold font-['DM_Sans'] tracking-tight">{center.name}</div>
                  <div className="self-stretch justify-start text-gray-400 text-xs font-semibold font-['DM_Sans'] tracking-tight capitalize">{center.type}</div>
                </div>
              </div>
              <div className="h-5 p-2 bg-blue-50 rounded-md inline-flex justify-center items-center gap-2.5">
                <div className="justify-start text-blue-900 text-[10px] font-bold font-['DM_Sans'] tracking-tight">{center.distance} km</div>
              </div>
            </div>
            <div className="flex justify-start items-center gap-2">
              <a 
                href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${center.lat},${center.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-56 h-11 p-2.5 bg-blue-950 rounded-[10px] inline-flex justify-center items-center gap-2.5 cursor-pointer"
              >
                <div className="flex justify-start items-end gap-2">
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                    <path d="M8 1L10.5 5.5L15 6L11.5 9.5L12.5 14L8 11.5L3.5 14L4.5 9.5L1 6L5.5 5.5L8 1Z" fill="white"/>
                  </svg>
                  <div className="text-center justify-start text-white text-xs font-semibold font-['DM_Sans'] tracking-tight">Get Directions</div>
                </div>
              </a>
              <a 
                href={`tel:${center.contact}`}
                className="w-11 h-11 p-[5px] bg-white rounded-md outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-center items-center gap-2.5 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="#1E3A8A" strokeWidth="2"/>
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Current Location */}
      <div className="w-full max-w-md mx-auto px-4 mt-6">
        <div className="w-full px-2.5 py-5 bg-indigo-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-2.5">
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="flex justify-start items-center gap-3.5">
              <div className="w-10 h-10 p-2 bg-white rounded-[20px] flex justify-center items-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <path d="M12 2C8.686 2 6 4.686 6 8C6 12 12 18 12 18C12 18 18 12 18 8C18 4.686 15.314 2 12 2Z" fill="#1E3A8A"/>
                  <circle cx="12" cy="8" r="2" fill="white"/>
                </svg>
              </div>
              <div className="w-64 inline-flex flex-col justify-start items-start gap-1">
                <div className="self-stretch justify-start text-zinc-800 text-xs font-medium font-['DM_Sans'] tracking-tight">Your current location</div>
                <div className="self-stretch justify-start text-blue-900 text-base font-bold font-['DM_Sans'] tracking-tight">{currentLocationText}</div>
              </div>
            </div>
            <div className="w-5 h-5 p-[3px] bg-white rounded-md flex justify-start items-start gap-2.5">
              <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                <circle cx="7" cy="7" r="5" stroke="#4B5563" strokeWidth="1.5"/>
                <path d="M7 4V7L9 9" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        onHelpClick={() => navigate('/help')} 
        onChatClick={() => {}} 
      />
    </div>
  )
}
