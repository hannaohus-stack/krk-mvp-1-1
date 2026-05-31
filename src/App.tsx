import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { useAuth } from './lib/useAuth'

// 페이지 임포트
import Landing         from './pages/Landing'
import Dashboard       from './pages/Dashboard'
import ReviewResult    from './pages/ReviewResult'
import LabelExport     from './pages/LabelExport'
import Creator         from './pages/creator/Creator'
import Payment         from './pages/Payment'
import PaymentComplete from './pages/PaymentComplete'

// Auth 페이지
import Login           from './pages/auth/Login'
import Signup          from './pages/auth/Signup'
import EmailVerify     from './pages/auth/EmailVerify'
import ForgotPassword  from './pages/auth/ForgotPassword'
import ResetPassword   from './pages/auth/ResetPassword'
import AuthCallback    from './pages/auth/AuthCallback'

// 법적 페이지
import Privacy         from './pages/Privacy'
import Terms           from './pages/Terms'

// SEO 공개 페이지
import Pricing         from './pages/seo/Pricing'
import GuideLabelPage  from './pages/seo/GuideLabel'
import GuideRejection  from './pages/seo/GuideRejection'
import FAQ             from './pages/seo/FAQ'

// 베타 이벤트 (feature/beta-event)
import BetaApply from './pages/beta/BetaApply'
import BetaNps   from './pages/beta/BetaNps'

// ─── ProtectedRoute ────────────────────────────────────────────────────────────
const DEV_BYPASS = false

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (DEV_BYPASS) return <>{children}</>

  // 세션 확인 중 — 빈 화면 (flash 방지)
  if (loading) return null

  // 미인증 → 로그인
  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login"            element={<Login />} />
        <Route path="/signup"           element={<Signup />} />
        <Route path="/verify-email"     element={<EmailVerify />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/reset-password"   element={<ResetPassword />} />
        <Route path="/auth/callback"    element={<AuthCallback />} />

        {/* 랜딩 (공개) */}
        <Route path="/" element={<Landing />} />

        {/* 법적 페이지 (공개) */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms"   element={<Terms />} />

        {/* SEO 공개 페이지 */}
        <Route path="/pricing"          element={<Pricing />} />
        <Route path="/guide/label"      element={<GuideLabelPage />} />
        <Route path="/guide/rejection"  element={<GuideRejection />} />
        <Route path="/faq"              element={<FAQ />} />

        {/* 베타 이벤트 (공개, 비로그인 제출 가능) */}
        <Route path="/beta"     element={<BetaApply />} />
        <Route path="/beta/nps" element={<BetaNps />} />

        {/* 보호된 라우트 */}
        <Route path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/creator"
          element={<ProtectedRoute><Creator /></ProtectedRoute>} />
        <Route path="/review"
          element={<ProtectedRoute><ReviewResult /></ProtectedRoute>} />
        <Route path="/export"
          element={<ProtectedRoute><LabelExport /></ProtectedRoute>} />
        <Route path="/payment"
          element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/payment/complete"
          element={<ProtectedRoute><PaymentComplete /></ProtectedRoute>} />
        {/* Toss 결제 실패 redirect URL */}
        <Route path="/payment/fail"
          element={<ProtectedRoute><PaymentComplete /></ProtectedRoute>} />

        {/* 404 → 홈 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </HelmetProvider>
  )
}
