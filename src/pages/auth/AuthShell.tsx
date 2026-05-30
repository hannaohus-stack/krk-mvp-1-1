/**
 * AuthShell — 인증 페이지 공통 레이아웃
 * 배경 #F4F4F5, 중앙 카드, KRK 로고
 */
import { useNavigate } from 'react-router-dom'

interface Props {
  crumb: string          // 예: "회원가입 · SIGN UP"
  crumbColor?: string    // 기본 #002D72
  children: React.ReactNode
}

export default function AuthShell({ crumb, crumbColor = '#002D72', children }: Props) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col items-center justify-start pt-10 px-5 pb-16">

      {/* 로고 */}
      <button
        onClick={() => navigate('/')}
        className="flex items-baseline gap-[3px] mb-8 hover:opacity-70 transition-opacity"
      >
        <span
          style={{ fontFamily: "Georgia,'Times New Roman',serif" }}
          className="font-bold text-[17px] tracking-[0.04em] text-ink"
        >krk</span>
        <span className="font-en font-light text-[17px] tracking-[0.22em] text-ink"> CHECKER·</span>
      </button>

      {/* 카드 */}
      <div className="w-full max-w-[400px] bg-white border border-[rgba(10,10,11,0.1)] px-7 py-8 flex flex-col gap-6">

        {/* 크럼 */}
        <div
          className="font-en text-[11px] font-semibold tracking-[0.16em] uppercase"
          style={{ color: crumbColor }}
        >
          {crumb}
        </div>

        {children}
      </div>
    </div>
  )
}
