import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { API_BASE } from "@/lib/api-base"
import logoImg from "/src/assets/images/Logo.svg"
import rptBackImg from "/src/assets/images/rpt_back.svg"
import rptImpReminderImg from "/src/assets/images/rpt_imp_reminder.svg"
import { Button } from "@/components/ui/button"
import BottomNav from "@/components/BottomNav"
import { MapContainer, TileLayer, Marker } from "react-leaflet"
import "leaflet/dist/leaflet.css"

// ── OTP helpers ──────────────────────────────────────────────────────────────

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP via backend → dbuddyz WhatsApp OTP service.
 * Returns { ok: true } on success or { ok: false, error: string } on failure.
 */
async function sendOTP(phone) {
  const res = await fetch(`${API_BASE}/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  })
  const data = await res.json()
  if (!res.ok) return { ok: false, error: data.error || "Failed to send OTP" }
  return { ok: true }
}

/**
 * Verify OTP via backend.
 * Returns { ok: true } on success or { ok: false, error: string } on failure.
 */
async function verifyOTP(phone, code) {
  const res = await fetch(`${API_BASE}/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  })
  const data = await res.json()
  if (!res.ok) return { ok: false, error: data.error || "Verification failed" }
  return { ok: true }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ReviewSubmitPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [reportData, setReportData] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Urgent / OTP state
  const [isUrgent, setIsUrgent] = useState(false)
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpInput, setOtpInput] = useState("")
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (location.state) setReportData(location.state)
  }, [location])

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const data = reportData || {
    incidentType: "Not specified",
    date: "Not specified",
    time: "",
    locationCoords: { lat: 6.1167, lng: 125.1667 },
    landmark: "Not specified",
    gender: "Not specified",
    ageGroup: "Not specified",
    relationship: "Not specified",
    description: "No description provided",
  }

  const mapCategory = (incidentType) => {
    const mapping = {
      "Sexual Assault": "sexual_assault",
      "Physical Abuse": "physical_abuse",
      "Domestic Violence": "domestic_violence",
      Stalking: "stalking",
      "Verbal Abuse": "verbal_abuse",
      "Emotional Abuse": "emotional_abuse",
    }
    return mapping[incidentType] || "other"
  }

  // ── Phone validation ────────────────────────────────────────────────────────

  function validatePhone(value) {
    const cleaned = value.replace(/\s/g, "")
    // Accept PH mobile: 09XXXXXXXXX or +639XXXXXXXXX
    if (/^(09\d{9}|\+639\d{9})$/.test(cleaned)) return ""
    return "Enter a valid PH mobile number (e.g. 09171234567)"
  }

  // ── Send OTP ────────────────────────────────────────────────────────────────

  async function handleSendOtp() {
    const err = validatePhone(phone)
    if (err) { setPhoneError(err); return }
    setPhoneError("")
    setSendingOtp(true)
    const result = await sendOTP(phone)
    setSendingOtp(false)
    if (!result.ok) {
      setPhoneError(result.error)
      return
    }
    setOtpSent(true)
    setOtpVerified(false)
    setOtpInput("")
    setOtpError("")
    setResendCooldown(60)
  }

  // ── Verify OTP ──────────────────────────────────────────────────────────────

  async function handleVerifyOtp() {
    setVerifyingOtp(true)
    const result = await verifyOTP(phone, otpInput)
    setVerifyingOtp(false)
    if (result.ok) {
      setOtpVerified(true)
      setOtpError("")
    } else {
      setOtpError(result.error)
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (submitting) return // prevent double-click

    if (!confirmed) {
      alert("Please confirm that your report does not contain personal information.")
      return
    }
    if (!data.incidentType || !data.description) {
      alert("Please complete all required fields: incident type and description.")
      return
    }
    if (!data.locationCoords?.lat || !data.locationCoords?.lng) {
      alert("Please select a location on the map.")
      return
    }
    if (isUrgent) {
      const err = validatePhone(phone)
      if (err) { setPhoneError(err); return }
      if (!otpVerified) {
        alert("Please verify your phone number via OTP before submitting an urgent report.")
        return
      }
    }

    setSubmitting(true)
    try {
      const payload = {
        title: data.incidentType,
        description: data.description,
        latitude: data.locationCoords.lat,
        longitude: data.locationCoords.lng,
        category: mapCategory(data.incidentType),
        city: "General Santos",
        barangay: data.landmark || "",
        address: data.landmark || "",
        is_urgent: isUrgent,
        contact_phone: isUrgent ? phone : null,
      }

      const response = await fetch(`${API_BASE}/reports/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        localStorage.removeItem("safemap_report_draft")
        navigate("/report-success", {
          state: { reportData: data, referenceCode: result.reference_code },
        })
      } else {
        const errorMsg = result.message || result.error || "Failed to submit report. Please try again."
        alert(`Error: ${errorMsg}`)
        setSubmitting(false)
      }
    } catch {
      alert("Error submitting report. Please check your connection and try again.")
      setSubmitting(false)
    }
  }

  const lat = data.locationCoords?.lat || 6.1167
  const lng = data.locationCoords?.lng || 125.1667

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-screen bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="relative w-full h-auto p-4">
        <button
          onClick={() => navigate("/location-details")}
          className="absolute left-2 top-4 p-2 hover:bg-gray-100 z-10"
        >
          <img src={rptBackImg} alt="Back" className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center pt-8">
          <img src={logoImg} alt="SafeMap" className="h-11 mb-4" />
        </div>
      </div>

      {/* Progress */}
      <div className="w-full max-w-md mx-auto px-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-blue-900 text-xs font-semibold font-['DM_Sans'] tracking-tight">STEP 3 OF 3</div>
            <div className="text-indigo-950 text-xs font-bold font-['DM_Sans'] tracking-tight">Review and Submit</div>
          </div>
          <div className="text-gray-500 text-xs font-semibold font-['DM_Sans'] tracking-tight">100% Complete</div>
        </div>
        <div className="w-full h-1.5 bg-blue-900 rounded-[10px] overflow-hidden">
          <div className="w-full h-full bg-blue-900 rounded-[10px]" />
        </div>
      </div>

      <div className="w-full max-w-md mx-auto mt-6 border-t border-gray-200" />

      {/* Report Summary */}
      <div className="w-full max-w-md mx-auto px-4 mt-6">
        <h2 className="text-neutral-600 text-sm font-bold font-['DM_Sans'] tracking-tight mb-4">Report Summary</h2>

        {/* Incident Type */}
        <div className="w-full h-16 bg-white rounded-lg shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] border border-gray-200 mb-2 flex items-center px-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 p-2.5 bg-indigo-50 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <path d="M10 0L0 4V10C0 15 3.75 19.25 10 20C16.25 19.25 20 15 20 10V4L10 0Z" fill="#1A3A8F" />
              </svg>
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
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="4" width="16" height="14" rx="2" stroke="#1A3A8F" strokeWidth="1.5" />
                <path d="M2 8H18" stroke="#1A3A8F" strokeWidth="1.5" />
                <path d="M6 2V5M14 2V5" stroke="#1A3A8F" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-normal font-['DM_Sans']">Date & Time</span>
              <span className="text-zinc-800 text-xs font-bold font-['DM_Sans']">
                {data.date}{data.time ? ` • ${data.time}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Location + mini map */}
        <div className="w-full h-56 bg-white rounded-lg shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] border border-gray-200 mb-2 overflow-hidden">
          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 p-2.5 bg-indigo-50 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none">
                <path d="M8 0C3.6 0 0 3.6 0 8C0 13 8 16 8 16C8 16 16 13 16 8C16 3.6 12.4 0 8 0ZM8 11C6.9 11 6 10.1 6 9C6 7.9 6.9 7 8 7C9.1 7 10 7.9 10 9C10 10.1 9.1 11 8 11Z" fill="#1A3A8F" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-normal font-['DM_Sans']">Location</span>
              <span className="text-zinc-800 text-xs font-bold font-['DM_Sans']">{data.landmark || "Selected Location"}</span>
            </div>
          </div>
          <div className="h-32 w-full">
            <MapContainer
              center={[lat, lng]}
              zoom={14}
              className="h-full w-full"
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
            >
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[lat, lng]} />
            </MapContainer>
          </div>
        </div>

        {/* Victim / Perpetrator Info */}
        <div className="w-full h-36 bg-blue-50 rounded-[10px] shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] mb-2 overflow-hidden p-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 p-2.5 bg-indigo-50 rounded-md flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="6" r="3" stroke="#1A3A8F" strokeWidth="1.5" />
                <path d="M4 18C4 14.134 7.134 11 10 11C12.866 11 16 14.134 16 18" stroke="#1A3A8F" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-gray-400 text-xs font-normal font-['DM_Sans']">Victim / Perpetrator Info</span>
              <span className="text-zinc-800 text-xs font-bold font-['DM_Sans']">{data.gender} • {data.relationship}</span>
              <span className="text-justify text-gray-500 text-sm font-normal font-['DM_Sans']">{data.description}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Urgent checkbox ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-md mx-auto px-4 mt-4">
        <div className="w-full bg-white rounded-xl border border-gray-200 shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] p-4">
          {/* Checkbox row */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsUrgent(!isUrgent)
                setOtpSent(false)
                setOtpVerified(false)
                setOtpInput("")
                setOtpError("")
                setPhoneError("")
              }}
              className={"w-6 h-6 shrink-0 rounded border-2 flex items-center justify-center transition-colors " + (isUrgent ? "bg-red-600 border-red-600" : "border-gray-300 bg-white")}
            >
              {isUrgent && (
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                  <path d="M3 8L6.5 11.5L13 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <div>
              <span className="text-zinc-800 text-sm font-semibold font-['DM_Sans']">Mark as Urgent</span>
              <p className="text-gray-400 text-xs font-['DM_Sans'] mt-0.5">
                Requires phone verification. Flags this report for immediate attention.
              </p>
            </div>
            {isUrgent && (
              <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wide shrink-0">
                Urgent
              </span>
            )}
          </div>

          {/* Phone + OTP fields — shown only when urgent */}
          {isUrgent && (
            <div className="mt-4 space-y-3">
              {/* Phone input */}
              <div>
                <label className="block text-neutral-600 text-xs font-medium font-['DM_Sans'] mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setPhoneError("") }}
                    placeholder="09171234567"
                    disabled={otpVerified}
                    className={"flex-1 h-11 bg-white rounded-xl border px-4 text-gray-800 text-sm " + (phoneError ? "border-red-400" : "border-gray-300") + (otpVerified ? " opacity-60" : "")}
                  />
                  <button
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpVerified || resendCooldown > 0}
                    className="h-11 px-4 bg-blue-900 text-white text-xs font-semibold rounded-xl disabled:opacity-50 shrink-0"
                  >
                    {sendingOtp ? "Sending…" : otpSent ? (resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend") : "Send OTP"}
                  </button>
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
              </div>

              {/* OTP input — shown after OTP is sent */}
              {otpSent && !otpVerified && (
                <div>
                  <label className="block text-neutral-600 text-xs font-medium font-['DM_Sans'] mb-1">
                    Enter 6-digit OTP
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => { setOtpInput(e.target.value.replace(/\D/g, "")); setOtpError("") }}
                      placeholder="______"
                      className={"flex-1 h-11 bg-white rounded-xl border px-4 text-gray-800 text-sm tracking-widest " + (otpError ? "border-red-400" : "border-gray-300")}
                    />
                    <button
                      onClick={handleVerifyOtp}
                      disabled={otpInput.length !== 6 || verifyingOtp}
                      className="h-11 px-4 bg-green-600 text-white text-xs font-semibold rounded-xl disabled:opacity-50 shrink-0"
                    >
                      {verifyingOtp ? "Checking…" : "Verify"}
                    </button>
                  </div>
                  {otpError && <p className="text-red-500 text-xs mt-1">{otpError}</p>}
                  <p className="text-gray-400 text-xs mt-1">OTP sent to {phone}. Check your messages.</p>
                </div>
              )}

              {/* Verified badge */}
              {otpVerified && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 shrink-0">
                    <circle cx="8" cy="8" r="7" fill="#16a34a" />
                    <path d="M4.5 8L7 10.5L11.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-green-700 text-xs font-semibold font-['DM_Sans']">Phone verified — {phone}</span>
                </div>
              )}
            </div>
          )}
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
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6.5 11.5L13 4.5" stroke="#1A3A8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span className="text-justify text-gray-500 text-sm font-normal font-['DM_Sans']">
            I confirm that this report does not contain personal names or identifying information, ensuring full anonymity for all parties. I agree to the{" "}
            <button onClick={() => navigate("/terms", { state: { from: "review-submit", data: reportData } })} className="text-blue-700 underline hover:text-blue-900">
              Terms of Service
            </button>{" "}
            and{" "}
            <button onClick={() => navigate("/privacy", { state: { from: "review-submit", data: reportData } })} className="text-blue-700 underline hover:text-blue-900">
              Privacy Policy
            </button>.
          </span>
        </div>
      </div>

      {/* Encryption Info */}
      <div className="w-full max-w-md mx-auto px-4 mt-4">
        <div className="w-full bg-blue-50 rounded-[10px] border border-blue-600 p-4">
          <div className="flex items-start gap-3.5">
            <img src={rptImpReminderImg} alt="Lock" className="w-5 h-5 shrink-0 mt-0.5" />
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
          disabled={submitting}
          className="w-full h-14 bg-blue-900 rounded-2xl shadow-[0px_4px_16px_0px_rgba(59,91,219,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="text-white text-base font-semibold font-['DM_Sans'] tracking-tight">
            {submitting ? "Submitting…" : "Submit Report"}
          </span>
        </Button>
      </div>

      <BottomNav onChatClick={() => { /* ignore */ }} />
    </div>
  )
}
