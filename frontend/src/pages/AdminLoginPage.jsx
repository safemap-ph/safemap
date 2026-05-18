import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE } from "@/lib/api-base"
import logoImg from "/src/assets/images/Logo.svg"
import backImg from "/src/assets/images/rpt_back.svg"

function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.access_token)
        localStorage.setItem("user", JSON.stringify(data.user))
        navigate("/admin-dashboard")
      } else {
        setError(data.error || "Login failed")
      }
    } catch (err) {
      setError("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col font-['DM_Sans'] bg-[#ebf2fb]">
      {/* Top Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[30vh]">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 p-2 flex items-center gap-2 text-gray-600 hover:text-blue-900 z-50"
        >
          <img src={backImg} alt="Back" className="w-5 h-5 opacity-80" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Logo */}
        <img src={logoImg} alt="SafeMap" className="w-56 md:w-64 object-contain z-10 mb-8" />
      </div>

      {/* SVG Waves Container */}
      <div className="w-full shrink-0 pointer-events-none">
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="w-full h-35 md:h-45 block">
          {/* 
            Four perfectly parallel quadratic bezier arch curves.
            Control points shifted uniformly by 30 units vertically to create stacked ribbons.
          */}
          <path fill="#b4c7e6" d="M0,100 Q720,-60 1440,100 L1440,220 L0,220 Z"></path>
          <path fill="#89a8d9" d="M0,130 Q720,-30 1440,130 L1440,220 L0,220 Z"></path>
          <path fill="#5377c3" d="M0,160 Q720,0 1440,160 L1440,220 L0,220 Z"></path>
          <path fill="#233f8e" d="M0,190 Q720,30 1440,190 L1440,220 L0,220 Z"></path>
        </svg>
      </div>

      {/* White Form Card Container */}
      <div className="w-full bg-[#233f8e] shrink-0">
        <div className="w-full bg-white rounded-t-[40px] pt-10 pb-12 px-6 min-h-[50vh]">
          <div className="w-full max-w-sm mx-auto">
            {/* Welcome Text */}
            <div className="mb-8">
              <h1 className="text-[26px] font-bold text-zinc-800 leading-tight">Welcome Back!</h1>
              <p className="text-[14px] text-gray-500 mt-1">Authorized LGU Officers only</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              {/* Employee ID or Email */}
              <div>
                <label className="block text-[13px] font-bold text-zinc-700 mb-2">Employee ID or Email</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your credentials"
                  className="w-full h-12 px-4 bg-white rounded-xl border border-gray-200 outline-none text-[14px] text-zinc-800 placeholder-gray-300 focus:border-[#233f8e] transition-colors shadow-sm"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[13px] font-bold text-zinc-700">Password</label>
                  <a href="#" className="text-[#102d7e] text-[12px] font-bold hover:underline" tabIndex={-1}>
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-12 px-4 pr-12 bg-white rounded-xl border border-gray-200 outline-none text-[14px] text-zinc-800 placeholder-gray-300 focus:border-[#233f8e] transition-colors shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-4.5 h-4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-lg">{error}</div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-13 mt-2 bg-[#233f8e] hover:bg-[#1a2f6e] active:bg-[#11204d] disabled:opacity-50 rounded-[14px] text-white text-[15px] font-bold transition-colors shadow-md"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
