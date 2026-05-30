import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/useAuth'

// 페이지 임포트
import Landing         from './pages/Landing'
import Dashboard       from './pages/Dashboard'
import ReviewResult    from './pages/ReviewResult'
import Creator         from './pages/creator/Creator'
import Payment         from './pages/Payment'
import PaymentComplete from './pages/PaymentComplete'

// Auth 페이지
import Login           from './pages/auth/Login'
import Signup          from './pages/auth/Signup'
import EmailVerify     from './pages/auth/EmailVerify'
import ForgotPassword  from './pages/auth/ForgotPassword'
import ResetPassword   from './pages/auth/ResetPassword'

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
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login"            element={<Login />} />
        <Route path="/signup"           element={<Signup />} />
        <Route path="/verify-email"     element={<EmailVerify />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/reset-password"   element={<ResetPassword />} />

        {/* 랜딩 (공개) */}
        <Route path="/" element={<Landing />} />

        {/* 보호된 라우트 */}
        <Route path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/creator"
          element={<ProtectedRoute><Creator /></ProtectedRoute>} />
        <Route path="/review"
          element={<ProtectedRoute><ReviewResult /></ProtectedRoute>} />
        <Route path="/export" element={<Navigate to="/review" replace />} />
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
  )
}
