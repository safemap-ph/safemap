import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { API_BASE } from "@/lib/api-base"
import logoImg from "/src/assets/images/Logo.svg"
import rptBackImg from "/src/assets/images/rpt_back.svg"
import wacCenterImg from "/src/assets/images/WAC_center.svg"
import BottomNav from "@/components/BottomNav"

export default function HelpPage() {
  const navigate = useNavigate()
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEmergencyContacts = async () => {
    try {
      const response = await fetch(`${API_BASE}/help/emergency`)
      const data = await response.json()
      if (data.emergency_contacts) {
        setEmergencyContacts(data.emergency_contacts)
      }
    } catch (error) {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmergencyContacts()
  }, [])

  // Filter contacts for display - prioritize VAWC, PNP, and Emergency
  const getDisplayContacts = () => {
    const priorityCategories = ["vawc", "pnp", "wcpd", "emergency"]
    const prioritized = emergencyContacts.filter((cat) => priorityCategories.includes(cat.category))
    return prioritized.slice(0, 3)
  }

  return (
    <div className="w-full h-screen bg-slate-50 pb-20 overflow-y-auto">
      {/* Header with back button and logo */}
      <div className="relative w-full h-auto p-4">
        <button onClick={() => navigate("/")} className="absolute left-2 top-4 p-2 hover:bg-gray-100 z-10">
          <img src={rptBackImg} alt="Back" className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center pt-8">
          <img src={logoImg} alt="SafeMap" className="h-11 mb-4" />
        </div>
      </div>

      {/* Divider */}
      <div className="w-full max-w-md mx-auto border-t border-gray-200" />

      {/* Title */}
      <div className="w-full max-w-md mx-auto px-4 mt-4">
        <h1 className="text-zinc-800 text-lg font-extrabold font-['DM_Sans'] tracking-tight text-center">
          VAWC Support
        </h1>
      </div>

      {/* Women and Children Protection Center Card */}
      <div className="w-full max-w-md mx-auto mt-6 px-4">
        <div className="w-full h-48 bg-blue-50 rounded-2xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] outline-solid outline-[0.50px] outline-offset-[-0.50px] outline-blue-600 overflow-hidden p-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 p-5 bg-white rounded-[20px] flex items-center justify-center shrink-0">
              <img src={wacCenterImg} alt="WCPD" className="w-10 h-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-blue-900 text-xl font-extrabold font-['DM_Sans'] tracking-tight">
                Women and Children Protection Center
              </h2>
              <p className="text-gray-500 text-sm font-normal font-['DM_Sans']">
                Dedicated support for victims of violence against women and their children.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Hotlines Section */}
      <div className="w-full max-w-md mx-auto px-4 mt-8">
        <h3 className="text-neutral-600 text-sm font-bold font-['DM_Sans'] tracking-tight mb-5">Emergency Hotlines</h3>

        {loading ? (
          <div className="text-gray-400 text-sm">Loading contacts...</div>
        ) : emergencyContacts.length > 0 ? (
          emergencyContacts.slice(0, 3).map((contact, index) => (
            <div
              key={index}
              className="w-full h-16 bg-white rounded-lg shadow-[0px_0px_0px_0px_rgba(0,0,0,0.00)] outline-solid outline-1 -outline-offset-1 outline-gray-200 overflow-hidden mb-3"
            >
              <div className="flex items-center gap-3.5 px-5 py-3">
                <div className="w-10 h-10 p-2.5 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M10 0C8.68629 0 7.38642 0.368613 6.19626 1.08912C5.00611 1.80963 4.04438 2.84525 3.37152 4.10883C2.69866 5.37241 2.33014 6.85024 2.33014 8.35C2.33014 9.84976 2.69866 11.3276 3.37152 12.5912C4.04438 13.8547 5.00611 14.8904 6.19626 15.6109C7.38642 16.3314 8.68629 16.7 10 16.7C11.3137 16.7 12.6136 16.3314 13.8037 15.6109C14.9939 14.8904 15.9556 13.8547 16.6285 12.5912C17.3013 11.3276 17.6699 9.84976 17.6699 8.35C17.6699 6.85024 17.3013 5.37241 16.6285 4.10883C15.9556 2.84525 14.9939 1.80963 13.8037 1.08912C12.6136 0.368613 11.3137 0 10 0Z"
                      fill="#1A3A8F"
                    />
                    <path
                      d="M10 5C8.5 5 7.25 6.25 7.25 7.75C7.25 8.5 7.5 9.25 7.75 9.75L8 10.25L8.25 10C9 11 10 12 11 12.75L10.5 13L10 13.25C9.5 13.5 8.75 13.75 8 13.75C6.5 13.75 5.25 12.5 5.25 11C5.25 8.5 7.25 5.5 10 5Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-zinc-800 text-xs font-bold font-['DM_Sans']">{contact.name}</div>
                  <div className="text-gray-400 text-xs font-normal font-['DM_Sans']">{contact.phone}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-sm">No emergency contacts available</div>
        )}
      </div>

      {/* What to expect when you call */}
      <div className="w-full max-w-md mx-auto px-4 mt-8">
        <div className="w-full h-64 bg-blue-50 rounded-[10px] shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] outline-solid outline-[0.50px] outline-offset-[-0.50px] outline-blue-600 overflow-hidden p-5">
          <div className="flex items-end gap-3 mb-4">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
              <path d="M10 2L2 6V10C2 15 6.5 18.5 10 19.5C13.5 18.5 18 15 18 10V6L10 2Z" fill="#1A3A8F" />
            </svg>
            <div className="text-blue-900 text-base font-semibold font-['DM_Sans'] tracking-tight">
              What to expect when you call
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Point 1 */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 px-2 pt-0.75 pb-1 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <div className="text-white text-xs font-bold font-['DM_Sans']">1</div>
              </div>
              <p className="text-justify text-gray-400 text-xs font-normal font-['DM_Sans']">
                You will be connected to a trained female officer or social worker who specializes in VAWC cases.
              </p>
            </div>

            {/* Point 2 */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 px-2 pt-0.75 pb-1 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <div className="text-white text-xs font-bold font-['DM_Sans']">2</div>
              </div>
              <p className="text-justify text-gray-400 text-xs font-normal font-['DM_Sans']">
                Your conversation is strictly confidential and your identity will be protected.
              </p>
            </div>

            {/* Point 3 */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 px-2 pt-0.75 pb-1 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <div className="text-white text-xs font-bold font-['DM_Sans']">3</div>
              </div>
              <p className="text-justify text-gray-400 text-xs font-normal font-['DM_Sans']">
                They will provide immediate safety guidance, legal advice, or dispatch help if needed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Find Nearest WCPD Desk Button */}
      <div className="w-full max-w-md mx-auto px-4 mt-8">
        <button className="w-full h-14 bg-blue-900 rounded-2xl inline-flex justify-center items-center gap-2.5">
          <div className="text-white text-base font-bold font-['DM_Sans'] tracking-tight">Find Nearest WCPD Desk</div>
        </button>
        <p className="text-center text-gray-400 text-xs font-normal font-['DM_Sans'] mt-2 mb-6">
          Navigate to the closest Women & Children Protection Desk
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
