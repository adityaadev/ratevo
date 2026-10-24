import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { lazy, Suspense } from 'react'
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyOTP from './pages/VerifyOTP'
import PublicReviewPage from './pages/PublicReviewPage'
import ReviewResultPage from './pages/ReviewResultPage'
import NotFound from './pages/NotFound'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const BusinessSetup = lazy(() => import('./pages/BusinessSetup'))
const BusinessSettings = lazy(() => import('./pages/BusinessSettings'))
const QrCodePage = lazy(() => import('./pages/QrCodePage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Refund = lazy(() => import('./pages/Refund'))
const Contact = lazy(() => import('./pages/Contact'))
const Pricing = lazy(() => import('./pages/Pricing'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const FAQ = lazy(() => import('./pages/FAQ'))
const BillingSuccess = lazy(() => import('./pages/BillingSuccess'))
const BillingFailed = lazy(() => import('./pages/BillingFailed'))

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
      </div>
    )
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/r/:businessSlug" element={<PublicReviewPage />} />
        <Route path="/r/:businessSlug/result" element={<ReviewResultPage />} />
        <Route path="/pricing" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <Pricing />
          </Suspense>
        } />
        <Route path="/how-it-works" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <HowItWorks />
          </Suspense>
        } />
        <Route path="/faq" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <FAQ />
          </Suspense>
        } />
        <Route path="/billing/success" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <BillingSuccess />
          </Suspense>
        } />
        <Route path="/billing/failed" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <BillingFailed />
          </Suspense>
        } />
        <Route path="/terms" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <Terms />
          </Suspense>
        } />
        <Route path="/privacy" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <Privacy />
          </Suspense>
        } />
        <Route path="/refund" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <Refund />
          </Suspense>
        } />
        <Route path="/contact" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <Contact />
          </Suspense>
        } />
      </Route>
      
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <Dashboard />
          </Suspense>
        } />
        <Route path="/dashboard/business" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <BusinessSetup />
          </Suspense>
        } />
        <Route path="/dashboard/qr" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <QrCodePage />
          </Suspense>
        } />
        <Route path="/dashboard/analytics" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <AnalyticsPage />
          </Suspense>
        } />
        <Route path="/dashboard/settings" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          }>
            <BusinessSettings />
          </Suspense>
        } />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App