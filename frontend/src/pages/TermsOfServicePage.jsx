import { useNavigate, useLocation } from 'react-router-dom'
import logoImg from '/src/assets/images/Logo.svg'
import rptBackImg from '/src/assets/images/rpt_back.svg'
import BottomNav from '@/components/BottomNav'

export default function TermsOfServicePage() {
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
        <h1 className="text-2xl font-bold text-indigo-950 mb-6">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using SafeMap-PH, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">2. Service Description</h2>
            <p>SafeMap-PH is a community safety reporting platform that allows users to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Submit anonymous safety incident reports</li>
              <li>View public safety heatmaps</li>
              <li>Access emergency contact information</li>
              <li>Track submitted reports using reference codes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">3. User Responsibilities</h2>
            <p className="mb-2">When using SafeMap-PH, you agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Provide Accurate Information:</strong> Submit truthful and accurate incident reports</li>
              <li><strong>No False Reports:</strong> Do not submit false, misleading, or malicious reports</li>
              <li><strong>Respect Privacy:</strong> Do not include personal identifying information of others without consent</li>
              <li><strong>No Harassment:</strong> Do not use the platform to harass, threaten, or harm others</li>
              <li><strong>Legal Compliance:</strong> Use the service in compliance with all applicable laws</li>
              <li><strong>Emergency Protocol:</strong> In case of immediate danger, call 911 or local emergency services directly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">4. Prohibited Activities</h2>
            <p>You may not:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Submit spam, advertisements, or promotional content</li>
              <li>Attempt to hack, disrupt, or compromise the platform's security</li>
              <li>Use automated tools to submit reports or scrape data</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Submit content that violates intellectual property rights</li>
              <li>Use the platform for any illegal activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">5. Content Moderation</h2>
            <p>SafeMap-PH reserves the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Review and moderate all submitted reports</li>
              <li>Remove reports that violate these terms</li>
              <li>Suspend or ban users who abuse the platform</li>
              <li>Share reports with law enforcement when necessary</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">6. Disclaimer of Warranties</h2>
            <p>SafeMap-PH is provided "as is" without warranties of any kind. We do not guarantee:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Uninterrupted or error-free service</li>
              <li>Accuracy or completeness of information</li>
              <li>That reports will result in action by authorities</li>
              <li>Prevention of safety incidents</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">7. Limitation of Liability</h2>
            <p>SafeMap-PH and its operators shall not be liable for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Any damages arising from use of the platform</li>
              <li>Actions or inactions of law enforcement</li>
              <li>User-submitted content</li>
              <li>Service interruptions or data loss</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">8. Privacy</h2>
            <p>Your use of SafeMap-PH is also governed by our Privacy Policy. Please review it to understand how we collect and use information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">9. Intellectual Property</h2>
            <p>All content, trademarks, and intellectual property on SafeMap-PH are owned by the platform or its licensors. You may not copy, modify, or distribute our content without permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">10. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">11. Termination</h2>
            <p>We may terminate or suspend your access to SafeMap-PH at any time, without notice, for conduct that violates these terms or is harmful to other users or the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">12. Governing Law</h2>
            <p>These terms are governed by the laws of the Republic of the Philippines. Any disputes shall be resolved in the courts of General Santos City.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-indigo-950 mb-3">13. Contact Information</h2>
            <p>For questions about these terms, contact:</p>
            <p className="mt-2">
              <strong>SafeMap-PH Team</strong><br />
              Email: legal@safemap.ph<br />
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
