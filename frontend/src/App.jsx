import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MapPage from './pages/MapPage'
import AboutUsPage from './pages/AboutUsPage'
import ReportPage from './pages/ReportPage'
import IncidentDetailsPage from './pages/IncidentDetailsPage'
import LocationDetailsPage from './pages/LocationDetailsPage'
import ReviewSubmitPage from './pages/ReviewSubmitPage'
import ReportSuccessPage from './pages/ReportSuccessPage'
import TrackReportPage from './pages/TrackReportPage'
import HelpPage from './pages/HelpPage'
import EmergencyPage from './pages/EmergencyPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/admin/dashboard'
import AdminAnalyticsPage from './pages/admin/analytics'
import AdminQueuePage from './pages/admin/queue'
import AdminAuditPage from './pages/admin/audit'
import AdminSettingsPage from './pages/admin/settings'
import AdminManagementPage from './pages/admin/management'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/incident-details" element={<IncidentDetailsPage />} />
      <Route path="/location-details" element={<LocationDetailsPage />} />
      <Route path="/review-submit" element={<ReviewSubmitPage />} />
      <Route path="/report-success" element={<ReportSuccessPage />} />
      <Route path="/track" element={<TrackReportPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/emergency" element={<EmergencyPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin-analytics" element={<AdminAnalyticsPage />} />
      <Route path="/admin-queue" element={<AdminQueuePage />} />
      <Route path="/admin-audit" element={<AdminAuditPage />} />
      <Route path="/admin-management" element={<AdminManagementPage />} />
      <Route path="/admin-settings" element={<AdminSettingsPage />} />
    </Routes>
  )
}

export default App
