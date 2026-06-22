import { useNavigate, useLocation } from 'react-router-dom'
import logoImg from '/src/assets/images/Logo.svg'
import rptBackImg from '/src/assets/images/rpt_back.svg'
import BottomNav from '@/components/BottomNav'

export default function PrivacyPolicyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const handleBack = () => {
    // Check if we came from review-submit page
    if (location.state?.from === 'review-submit') {
      navigate('/review-submit', { state: location.state?.data })
    } else {
      navigate(-1) // Go back in history
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="relative w-full h-auto p-4">
        <button 
          onClick={handleBack}
          className="absolute left-2 top-4 p-2 hover:bg-gray-100 z-10"
        >
          <img src={rptBackImg} alt="Back" className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center pt-8">
          <img src={logoImg} alt="SafeMap" className="h-11 mb-4" />
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-indigo-950 mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">1. Information We Collect</h2>
            <p className="mb-2">SafeMap-PH is designed with your privacy in mind. We collect minimal information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Anonymous Reports:</strong> Location coordinates, incident category, description (encrypted), and timestamp</li>
              <li><strong>Technical Data:</strong> IP address and browser information for security purposes only</li>
              <li><strong>No Personal Information:</strong> We do not collect names, contact details, or identifying information unless you voluntarily provide them</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Display safety incidents on the public heatmap</li>
              <li>Enable authorities to respond to reports</li>
              <li>Improve community safety awareness</li>
              <li>Prevent abuse and maintain system security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">3. Data Security</h2>
            <p className="mb-2">We take security seriously:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Report descriptions are encrypted using industry-standard encryption</li>
              <li>HTTPS encryption for all data transmission</li>
              <li>Rate limiting to prevent abuse</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">4. Data Sharing</h2>
            <p>We do not sell or share your data with third parties. Report information may be shared with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Philippine National Police (PNP) for verified incidents</li>
              <li>Local authorities for emergency response</li>
              <li>Public heatmap (location and category only, no personal details)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Submit reports anonymously</li>
              <li>Track your report using the reference code</li>
              <li>Request information about data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">6. Cookies and Tracking</h2>
            <p>We use minimal cookies for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Session management for admin users</li>
              <li>Remembering your preferences</li>
              <li>No third-party tracking or advertising cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">7. Children's Privacy</h2>
            <p>SafeMap-PH is intended for users of all ages. We do not knowingly collect personal information from children under 13 without parental consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">8. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">9. Contact Us</h2>
            <p>If you have questions about this privacy policy, please contact:</p>
            <p className="mt-2">
              <strong>SafeMap-PH Team</strong><br />
              Email: privacy@safemap.ph<br />
              General Santos City, Philippines
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8">Last Updated: April 17, 2026</p>
        </div>
      </div>

      <BottomNav 
        onHelpClick={() => navigate('/help')} 
        onChatClick={() => {}} 
      />
    </div>
  )
}
