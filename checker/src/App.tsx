import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard    from './pages/Dashboard'
import ReviewResult from './pages/ReviewResult'
import LabelExport  from './pages/LabelExport'
import Creator      from './pages/creator/Creator'
import OcrUpload    from './pages/OcrUpload'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Dashboard />} />
        <Route path="/checker" element={<OcrUpload />} />
        <Route path="/review"  element={<ReviewResult />} />
        <Route path="/export"  element={<LabelExport />} />
        <Route path="/creator" element={<Creator />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
