/**
 * LogoLockup — KRK CHECKER· 공식 로고 컴포넌트
 * 가이드라인: Inter 800, uppercase, tracking 0.22em, dot(·) = Breath-500 #0CA4F9
 * 다크 배경: variant="light" → 텍스트 #fff, dot은 항상 #0CA4F9 유지
 */

interface LogoLockupProps {
  size?: number         // font-size (px), default 15
  variant?: 'dark' | 'light'  // dark = 검정 텍스트 (기본), light = 흰색 텍스트 (다크 배경)
}

export default function LogoLockup({ size = 15, variant = 'dark' }: LogoLockupProps) {
  const textColor = variant === 'light' ? '#ffffff' : '#0A0A0B'

  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 0, lineHeight: 1 }}>
      <span
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 800,
          fontSize: size,
          color: textColor,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        KRK CHECKER
      </span>
      <span
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 800,
          fontSize: size,
          color: '#0CA4F9',   // Breath-500 — 배경 무관 항상 고정
          marginLeft: '0.18em',
          lineHeight: 1,
        }}
      >
        ·
      </span>
    </div>
  )
}
