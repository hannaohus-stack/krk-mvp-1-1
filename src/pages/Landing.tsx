import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ListChecks, Download } from 'lucide-react'

// ─── Design Tokens ────────────────────────────────────────────────────────────
const HERITAGE = '#002D72'
const BREATH   = '#0CA4F9'
const INK      = '#0A0A0B'
const SOFT_INK = 'rgba(10,10,11,0.65)'
const FAINT    = 'rgba(10,10,11,0.55)'
const MUTED    = 'rgba(10,10,11,0.40)'
const HAIRLINE = 'rgba(10,10,11,0.12)'
const STUDIO   = '#FAFAFA'
const JAM_HI   = '#E8A85C'
const JAM_LO   = '#C26A2A'

const FONT_KR = "Pretendard, 'Pretendard Variable', system-ui, -apple-system, sans-serif"
const FONT_EN = 'Inter, system-ui, sans-serif'

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: '잼류',          desc: '딸기잼·블루베리잼 등' },
  { name: '소스류',         desc: '토마토·핫소스 등' },
  { name: '장류',           desc: '된장·고추장' },
  { name: '떡류',           desc: '쑥떡·찹쌀떡 등' },
  { name: '디저트/베이커리', desc: '쿠키·푸딩·케이크' },
  { name: '차/음료',        desc: '콤부차·과실차' },
  { name: '건강식품(일반)', desc: '비타민·영양제 (기타식품류)' },
]

const REVIEWS = [
  {
    quote: '딸기잼 6종 라벨을 직접 만들 때 막막했는데, 표시 항목이 자동으로 정리돼서 정말 편했어요.',
    author: '쿡하우스 김라벨',
    meta: '잼류 · 식품제조가공업',
  },
  {
    quote: '신고 입력 가이드 덕분에 정부24에서 헤매지 않고 한 번에 끝냈습니다.',
    author: '바이탈웍스 박베타',
    meta: '건강식품(일반) · 즉판가공업',
  },
  {
    quote: '뒷면 라벨까지 신경 쓸 줄 몰랐는데, 알레르기 표기 위치까지 잡아줘서 안심됐어요.',
    author: '유자공방 이로컬',
    meta: '소스류 · 식품제조가공업',
  },
]

const STUDIO_SERVICES = [
  { icon: '✨', name: '브랜딩', desc: '식품 브랜드 아이덴티티 · 네이밍 · 톤 가이드' },
  { icon: '📦', name: '패키지', desc: '제품 패키지 그래픽 · 라벨 아트워크' },
  { icon: '📷', name: '사진',   desc: '제품 사진 · 스타일링 · 온라인 용' },
]

// ─── CSS (animations + responsive) ───────────────────────────────────────────
const CSS = `
  @keyframes krkJarFloat {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes krkModalIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes krkMobileModalCycle {
    0%,  8%  { opacity: 0; transform: translateY(10px); }
    13%, 30% { opacity: 1; transform: translateY(0); }
    38%,100% { opacity: 0; transform: translateY(-8px); }
  }

  .krk-lp-jar       { animation: krkJarFloat 6s ease-in-out infinite; }
  .krk-lp-modal-0   { animation: krkModalIn 0.6s 0ms   both; }
  .krk-lp-modal-1   { animation: krkModalIn 0.6s 140ms both; }
  .krk-lp-modal-2   { animation: krkModalIn 0.6s 280ms both; }

  /* Mobile: cycle instead of fade-in */
  @media (max-width: 860px) {
    .krk-lp-modal-0 { animation: krkMobileModalCycle 9s 0s  infinite; }
    .krk-lp-modal-1 { animation: krkMobileModalCycle 9s 3s  infinite; }
    .krk-lp-modal-2 { animation: krkMobileModalCycle 9s 6s  infinite; }
  }

  /* Hero layout responsive */
  .krk-lp-hero-inner {
    position: relative; z-index: 10;
    max-width: 1240px; margin: 0 auto;
    padding: 112px 40px 64px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(0,1fr) 360px;
    gap: 40px;
    align-items: end;
    min-height: 100svh;
  }
  .krk-lp-modal-stack {
    display: flex; flex-direction: column; gap: 12px;
    width: 100%;
  }
  .krk-lp-modal-mobile-wrap {
    display: none;
  }
  .krk-lp-jar-pos {
    position: absolute;
    bottom: 14%; left: 18%;
    animation: krkJarFloat 6s ease-in-out infinite;
  }
  @media (max-width: 860px) {
    .krk-lp-hero-inner {
      display: flex; flex-direction: column;
      justify-content: flex-end; align-items: stretch;
      padding: 88px 20px 22px;
      gap: 0;
      min-height: 100svh;
    }
    .krk-lp-modal-stack { display: none; }
    .krk-lp-modal-mobile-wrap {
      display: block;
      position: relative; height: 130px;
      margin-top: 16px;
    }
    .krk-lp-modal-mobile-item {
      position: absolute; inset: 0;
    }
    .krk-lp-jar-pos {
      bottom: 46%; left: 50%;
      transform: translateX(-50%);
      animation: krkJarFloat 6s ease-in-out infinite;
    }
    .krk-lp-secondary-link { display: none; }
    .krk-lp-cta-btn { width: 100% !important; }
  }

  /* Categories grid */
  .krk-lp-cat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  @media (max-width: 860px) {
    .krk-lp-cat-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  }

  /* Pricing grid */
  .krk-lp-price-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 760px) {
    .krk-lp-price-grid { grid-template-columns: 1fr; gap: 12px; }
  }

  /* Reviews grid */
  .krk-lp-review-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  @media (max-width: 860px) {
    .krk-lp-review-grid { grid-template-columns: 1fr; gap: 12px; }
  }

  /* Studio grid */
  .krk-lp-studio-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  @media (max-width: 760px) {
    .krk-lp-studio-grid { grid-template-columns: 1fr; gap: 10px; }
  }

  /* CTA strip responsive */
  .krk-lp-cta-strip {
    display: flex; align-items: center;
    justify-content: space-between; gap: 16px;
    flex-wrap: wrap;
  }

  /* Studio bottom row */
  .krk-lp-studio-bottom {
    display: flex; align-items: center;
    justify-content: space-between; gap: 16px;
    flex-wrap: wrap;
  }

  /* Footer */
  .krk-lp-footer-inner {
    max-width: 1240px; margin: 0 auto;
    display: flex; align-items: center;
    justify-content: space-between; gap: 16px;
    flex-direction: row;
    flex-wrap: wrap;
  }
  @media (max-width: 760px) {
    .krk-lp-footer-inner { flex-direction: column; align-items: flex-start; }
  }

  /* Section padding responsive */
  .krk-lp-sec { padding: 96px 40px; }
  @media (max-width: 760px) {
    .krk-lp-sec { padding: 56px 20px; }
  }
  .krk-lp-sec-sm { padding: 36px 40px 28px; }
  @media (max-width: 760px) {
    .krk-lp-sec-sm { padding: 28px 20px 22px; }
  }
`

// ─── Glass modal style ─────────────────────────────────────────────────────────
const glassStyle: CSSProperties = {
  position: 'relative',
  border: '1px solid rgba(255,255,255,0.46)',
  borderRadius: 8,
  padding: '14px 16px',
  background: `
    linear-gradient(145deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.18) 42%, rgba(255,255,255,0.08) 100%),
    radial-gradient(120% 120% at 12% 0%, rgba(234,246,254,0.36) 0%, rgba(234,246,254,0) 52%),
    radial-gradient(100% 120% at 100% 100%, rgba(0,45,114,0.28) 0%, rgba(0,45,114,0) 56%),
    rgba(255,255,255,0.1)
  `,
  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,0.62),
    inset 0 -1px 0 rgba(255,255,255,0.12),
    0 26px 70px rgba(0,11,31,0.34),
    0 0 0 1px rgba(12,164,249,0.08)
  `,
  backdropFilter: 'blur(26px) saturate(175%) contrast(108%)',
  WebkitBackdropFilter: 'blur(26px) saturate(175%) contrast(108%)',
  color: '#fff',
}

// Scatter transforms per modal index (desktop only — overridden on mobile by animation)
const SCATTER = [
  { transform: 'translate(-10px, 0) rotate(-1.2deg)' },
  { transform: 'translate(14px, -6px) rotate(0.9deg)' },
  { transform: 'translate(-6px, 4px) rotate(-0.6deg)' },
]

// ─── Subcomponents ────────────────────────────────────────────────────────────

function HeroModal({
  idx,
  title,
  body,
  note,
  icon,
  mobile = false,
}: {
  idx: number
  title: string
  body: string
  note: string
  icon: React.ReactNode
  mobile?: boolean
}) {
  return (
    <div
      className={`krk-lp-modal-${idx}`}
      style={{
        ...glassStyle,
        ...(mobile ? {} : SCATTER[idx]),
      }}
    >
      {/* Top highlight line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.62), rgba(12,164,249,0.48), rgba(255,255,255,0.18))',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'rgba(255,255,255,0.18)',
          border: '1px solid rgba(255,255,255,0.32)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <strong style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em' }}>{title}</strong>
      </div>

      <div style={{
        fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 1.55,
        letterSpacing: '-0.005em', marginBottom: 8,
      }}>
        {body}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none"
          style={{ filter: 'drop-shadow(0 0 8px rgba(12,164,249,0.42))', flexShrink: 0 }}>
          <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke={BREATH} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', letterSpacing: '-0.005em' }}>
          {note}
        </span>
      </div>
    </div>
  )
}

function JarPlaceholder({ scale = 1 }: { scale?: number }) {
  const W = 220 * scale, H = 320 * scale
  return (
    <div style={{ position: 'relative', width: W, height: H, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      {/* Shadow */}
      <div style={{
        position: 'absolute', bottom: -8 * scale, left: '15%', right: '15%', height: 16 * scale,
        background: 'radial-gradient(ellipse at center, rgba(10,10,11,0.18) 0%, transparent 70%)',
        filter: 'blur(4px)',
      }} />
      {/* Jar body */}
      <div style={{
        position: 'relative', width: W * 0.78, height: H * 0.82,
        background: `linear-gradient(180deg, ${JAM_HI} 0%, ${JAM_LO} 100%)`,
        borderRadius: `${10 * scale}px ${10 * scale}px ${18 * scale}px ${18 * scale}px`,
        boxShadow: `inset -${12 * scale}px 0 ${30 * scale}px rgba(0,0,0,0.18), inset ${8 * scale}px 0 ${20 * scale}px rgba(255,255,255,0.32), 0 ${12 * scale}px ${40 * scale}px rgba(0,11,31,0.18)`,
      }}>
        {/* Lid */}
        <div style={{
          position: 'absolute', top: -14 * scale, left: '8%', right: '8%', height: 22 * scale,
          background: 'linear-gradient(180deg, #2a2a2e, #18181b)',
          borderRadius: `${4 * scale}px ${4 * scale}px ${2 * scale}px ${2 * scale}px`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 ${4 * scale}px ${10 * scale}px rgba(0,11,31,0.22)`,
        }} />
        {/* Label */}
        <div style={{
          position: 'absolute', top: '32%', left: '12%', right: '12%', height: '38%',
          background: '#fff',
          boxShadow: `0 ${2 * scale}px ${6 * scale}px rgba(0,11,31,0.12)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 4 * scale, padding: `${6 * scale}px ${8 * scale}px`,
          fontFamily: FONT_KR, color: INK,
        }}>
          <div style={{
            fontFamily: FONT_EN, fontSize: 7 * scale, fontWeight: 700,
            letterSpacing: '0.22em', color: HERITAGE, textTransform: 'uppercase',
          }}>식품유형 · 잼류</div>
          <div style={{ fontSize: 14 * scale, fontWeight: 700, letterSpacing: '-0.02em', textAlign: 'center' }}>
            유자잼
          </div>
          <div style={{ width: 24 * scale, height: 1, background: INK, opacity: 0.3 }} />
          <div style={{ fontFamily: FONT_EN, fontSize: 7 * scale, color: FAINT, letterSpacing: '0.06em' }}>
            200g · 248kcal/100g
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroSection({ onCTA }: { onCTA: () => void }) {
  return (
    <section style={{ position: 'relative', background: STUDIO, overflow: 'hidden', minHeight: '100svh' }}>
      {/* Studio BG */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 50% 40%, #fff 0%, ${STUDIO} 60%, #ECEAE6 100%)`,
        filter: 'saturate(0.88) contrast(0.95)',
      }} />

      {/* Jar — positioned via CSS for responsive */}
      <div className="krk-lp-jar-pos">
        {/* Desktop scale */}
        <div style={{ display: 'none' }} className="krk-lp-jar-desktop">
          <JarPlaceholder scale={1.1} />
        </div>
        {/* Always show — override via CSS */}
        <JarPlaceholder scale={1.1} />
      </div>

      {/* Nav */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 60,
        padding: '18px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderBottom: '1px solid rgba(10,10,11,0.06)',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, lineHeight: 1 }}>
          <span style={{
            fontFamily: FONT_EN, fontWeight: 800, fontSize: 14,
            color: INK, letterSpacing: '0.22em', textTransform: 'uppercase',
          }}>KRK CHECKER</span>
          <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: 14, color: BREATH, marginLeft: '0.18em' }}>·</span>
        </div>
        <button
          type="button"
          onClick={onCTA}
          style={{
            padding: '10px 18px',
            background: INK, color: '#fff', border: 'none', borderRadius: 0,
            fontFamily: FONT_KR, fontSize: 13, fontWeight: 600,
            letterSpacing: '-0.005em', cursor: 'pointer',
          }}
        >
          3분 만에 시작하기
        </button>
        {/* Breath glow line */}
        <div style={{
          position: 'absolute', bottom: -1, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(12,164,249,0.42), transparent)',
        }} />
      </nav>

      {/* Inner grid */}
      <div className="krk-lp-hero-inner">
        {/* Left: copy */}
        <div>
          <div style={{
            fontFamily: FONT_EN, fontSize: 12, fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(10,10,11,0.55)', marginBottom: 18,
          }}>
            KRK CHECKER
          </div>

          <h1 style={{
            margin: 0,
            fontSize: 'clamp(46px, 7vw, 92px)',
            fontWeight: 760, lineHeight: 0.98,
            color: INK, letterSpacing: '-0.025em', wordBreak: 'keep-all',
          }}>
            라벨도,<br />브랜드의 일부니까
          </h1>

          <p style={{
            margin: '22px 0 0', maxWidth: 520,
            fontSize: 'clamp(16px, 2vw, 21px)',
            color: SOFT_INK, lineHeight: 1.55, letterSpacing: '-0.005em',
          }}>
            1인 식품 브랜드의 라벨 검토 시스템
          </p>

          <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onCTA}
              className="krk-lp-cta-btn"
              style={{
                height: 52, padding: '0 24px',
                background: INK, color: '#fff',
                border: 'none', borderRadius: 0,
                fontFamily: FONT_KR, fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em',
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              3분 만에 시작하기
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <a
              href="#categories"
              className="krk-lp-secondary-link"
              style={{
                fontFamily: FONT_KR, fontSize: 13, color: SOFT_INK,
                textDecoration: 'none', borderBottom: `1px solid ${HAIRLINE}`,
                paddingBottom: 2, letterSpacing: '-0.005em',
              }}
            >
              지원 카테고리 보기 →
            </a>
          </div>
        </div>

        {/* Right: modal stack (desktop) */}
        <div className="krk-lp-modal-stack">
          <HeroModal idx={0} title="원재료 표기 정리됨" body="딸기 50% · 설탕 30% · 레몬즙 10% · 펙틴 5%" note="표시 기준에 맞춰 정돈"
            icon={<FileText size={14} strokeWidth={2} color="#fff" />} />
          <HeroModal idx={1} title="표시 항목 확인" body="알레르기 · 내용량 · 보관방법 · 소비기한" note="누락 가능 항목을 먼저 확인"
            icon={<ListChecks size={14} strokeWidth={2} color="#fff" />} />
          <HeroModal idx={2} title="파일 준비 완료" body="라벨 PDF · 신고 입력 가이드 · 라벨 검토 리포트" note="결제 후 바로 다운로드"
            icon={<Download size={14} strokeWidth={2} color="#fff" />} />
        </div>

        {/* Mobile: cycle stack */}
        <div className="krk-lp-modal-mobile-wrap">
          <div className="krk-lp-modal-mobile-item">
            <HeroModal idx={0} mobile title="원재료 표기 정리됨" body="딸기 50% · 설탕 30% · 레몬즙 10% · 펙틴 5%" note="표시 기준에 맞춰 정돈"
              icon={<FileText size={14} strokeWidth={2} color="#fff" />} />
          </div>
          <div className="krk-lp-modal-mobile-item">
            <HeroModal idx={1} mobile title="표시 항목 확인" body="알레르기 · 내용량 · 보관방법 · 소비기한" note="누락 가능 항목을 먼저 확인"
              icon={<ListChecks size={14} strokeWidth={2} color="#fff" />} />
          </div>
          <div className="krk-lp-modal-mobile-item">
            <HeroModal idx={2} mobile title="파일 준비 완료" body="라벨 PDF · 신고 입력 가이드 · 라벨 검토 리포트" note="결제 후 바로 다운로드"
              icon={<Download size={14} strokeWidth={2} color="#fff" />} />
          </div>
        </div>
      </div>
    </section>
  )
}

function CategoriesSection() {
  return (
    <section id="categories" className="krk-lp-sec" style={{ background: '#fff', borderTop: `1px solid ${HAIRLINE}` }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{
          fontFamily: FONT_EN, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.22em', textTransform: 'uppercase', color: HERITAGE, marginBottom: 14,
        }}>
          Supported Categories
        </div>
        <h2 style={{ margin: 0, fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, wordBreak: 'keep-all' }}>
          7개 카테고리의 라벨을<br />식약처 기준으로 검토합니다
        </h2>
        <p style={{ margin: '14px 0 0', maxWidth: 520, fontSize: 14, color: SOFT_INK, lineHeight: 1.6, letterSpacing: '-0.005em' }}>
          식품등의 표시기준 고시 2025-27호 기준. 카테고리별 식약처 공식 분류명으로 자동 매핑돼요.
        </p>
        <div className="krk-lp-cat-grid" style={{ marginTop: 40 }}>
          {CATEGORIES.map((c) => (
            <div key={c.name} style={{
              padding: '20px 18px',
              border: `1px solid ${HAIRLINE}`, background: '#fff',
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 4 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection({ onCTA }: { onCTA: () => void }) {
  const cards = [
    {
      tier: 'basic',
      eyebrow: 'Basic Label Package',
      title: '기본 라벨 패키지',
      price: '9,900',
      desc: '라벨 PDF·PNG와 기본 검토 결과만 필요할 때',
      items: ['라벨 PDF · 인쇄용', '라벨 PNG · 고해상도', '항목별 텍스트 복사', '기본 신호등 결과'],
      cta: '기본 패키지 받기',
      ctaBg: BREATH,
      border: HAIRLINE,
      featured: false,
    },
    {
      tier: 'pro',
      eyebrow: 'Professional Guide',
      title: '전문 수정 가이드',
      price: '19,900',
      desc: '판매 전 보완 기준까지 확인해야 할 때',
      items: ['항목별 수정 방법 + 기준 출처', '과태료 · 행정처분 참고', '신고 입력 가이드 + 라벨 검토 리포트', '분리배출 마크 ZIP + 라벨 PDF/PNG'],
      cta: '전문 가이드 받기',
      ctaBg: HERITAGE,
      border: HERITAGE,
      featured: true,
    },
  ]
  return (
    <section id="pricing" className="krk-lp-sec" style={{ background: STUDIO, borderTop: `1px solid ${HAIRLINE}` }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_EN, fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: HERITAGE, marginBottom: 14 }}>
            Pricing
          </div>
          <h2 style={{ margin: 0, fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, wordBreak: 'keep-all' }}>
            판매 단계에 맞게<br />필요한 만큼만
          </h2>
        </div>
        <div className="krk-lp-price-grid" style={{ marginTop: 48 }}>
          {cards.map((c) => (
            <div key={c.tier} style={{
              padding: 28, background: '#fff',
              border: `${c.featured ? '2px' : '1px'} solid ${c.border}`,
              position: 'relative',
            }}>
              {c.featured && (
                <span style={{
                  position: 'absolute', top: -10, right: 20,
                  background: HERITAGE, color: '#fff',
                  padding: '4px 10px', fontFamily: FONT_EN, fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                }}>
                  Recommended
                </span>
              )}
              <div style={{
                fontFamily: FONT_EN, fontSize: 10, fontWeight: 700,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: c.featured ? HERITAGE : MUTED, marginBottom: 10,
              }}>
                {c.eyebrow}
              </div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em' }}>{c.title}</h3>
              <div style={{ marginTop: 12, color: HERITAGE, lineHeight: 1 }}>
                <span style={{ fontFamily: FONT_EN, fontSize: 38, fontWeight: 700, letterSpacing: '-0.025em' }}>{c.price}</span>
                <span style={{ marginLeft: 4, fontFamily: FONT_KR, fontSize: 15, fontWeight: 500, color: FAINT }}>원</span>
              </div>
              <p style={{ margin: '14px 0 18px', fontSize: 13, color: SOFT_INK, lineHeight: 1.55, letterSpacing: '-0.005em' }}>{c.desc}</p>
              <ul style={{ display: 'grid', gap: 9, margin: '0 0 20px', padding: 0, listStyle: 'none' }}>
                {c.items.map((item) => (
                  <li key={item} style={{ display: 'flex', gap: 10, fontSize: 13, color: SOFT_INK, lineHeight: 1.5, letterSpacing: '-0.005em' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
                      <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke={c.featured ? HERITAGE : BREATH} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ wordBreak: 'keep-all' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onCTA}
                style={{
                  width: '100%', height: 46,
                  background: c.ctaBg, color: '#fff', border: 'none',
                  fontFamily: FONT_KR, fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.005em',
                  cursor: 'pointer',
                }}
              >
                {c.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ReviewsSection({ onCTA }: { onCTA: () => void }) {
  return (
    <section id="reviews" className="krk-lp-sec" style={{ background: '#fff', borderTop: `1px solid ${HAIRLINE}` }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontFamily: FONT_EN, fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: HERITAGE, marginBottom: 14 }}>
          From Founders
        </div>
        <h2 style={{ margin: 0, fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, wordBreak: 'keep-all' }}>
          1인 식품 브랜드들이<br />이렇게 쓰고 있어요
        </h2>
        <div className="krk-lp-review-grid" style={{ marginTop: 40 }}>
          {REVIEWS.map((r, i) => (
            <div key={i} style={{
              padding: '24px 22px',
              border: `1px solid ${HAIRLINE}`, background: '#fff',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div style={{ fontFamily: FONT_EN, fontSize: 28, fontWeight: 700, color: BREATH, lineHeight: 1, opacity: 0.6 }}>"</div>
              <div style={{ fontSize: 14.5, color: INK, lineHeight: 1.65, letterSpacing: '-0.005em', wordBreak: 'keep-all', flex: 1 }}>
                {r.quote}
              </div>
              <div style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: INK, letterSpacing: '-0.005em' }}>{r.author}</div>
                <div style={{ fontSize: 11.5, color: FAINT, marginTop: 2, letterSpacing: '-0.005em' }}>{r.meta}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="krk-lp-cta-strip" style={{ marginTop: 56, padding: '24px 28px', background: INK, color: '#fff' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 4 }}>
              라벨 정리를 지금 시작하세요
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.005em' }}>
              제품 정보 입력 → 라벨 미리보기 → 무료 검토 결과까지 3분
            </div>
          </div>
          <button
            type="button"
            onClick={onCTA}
            style={{
              padding: '12px 22px', background: '#fff', color: INK,
              border: 'none', fontFamily: FONT_KR, fontSize: 13.5, fontWeight: 600,
              letterSpacing: '-0.005em', cursor: 'pointer',
            }}
          >
            3분 만에 시작하기 →
          </button>
        </div>
      </div>
    </section>
  )
}

function StudioSection() {
  return (
    <section id="studio" className="krk-lp-sec" style={{ background: INK, color: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* Top gradient strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${HERITAGE} 30%, ${BREATH} 70%, transparent)`,
      }} />
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontFamily: FONT_EN, fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: BREATH, marginBottom: 14 }}>
          krk Studio
        </div>
        <h2 style={{ margin: 0, fontSize: 'clamp(26px, 3.8vw, 38px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, wordBreak: 'keep-all', maxWidth: 680 }}>
          라벨이 정해졌다면,<br />이제 브랜드 차례
        </h2>
        <p style={{ margin: '18px 0 0', maxWidth: 540, fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, letterSpacing: '-0.005em' }}>
          식품 브랜딩 · 패키지 디자인 · 제품 사진까지 사람이 직접 만들어드려요.
        </p>
        <div className="krk-lp-studio-grid" style={{ marginTop: 48 }}>
          {STUDIO_SERVICES.map((s) => (
            <div key={s.name} style={{
              padding: '28px 24px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderTop: '1px solid rgba(12,164,249,0.32)',
            }}>
              <div style={{ fontSize: 30, marginBottom: 14, lineHeight: 1 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', marginBottom: 6 }}>{s.name}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.55, letterSpacing: '-0.005em', wordBreak: 'keep-all' }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="krk-lp-studio-bottom" style={{ marginTop: 40 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.005em' }}>
            라벨도 브랜드의 일부니까 — 패키지도, 사진도.
          </div>
          <a
            href="https://krk.team/studio"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 22px', background: '#fff', color: INK,
              fontFamily: FONT_KR, fontSize: 13.5, fontWeight: 600,
              letterSpacing: '-0.005em', textDecoration: 'none', cursor: 'pointer',
            }}
          >
            krk Studio 포트폴리오 보러가기
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M5 3l5 5-5 5M3 8h10" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="krk-lp-sec-sm" style={{ background: '#0F0F12', color: 'rgba(255,255,255,0.55)', fontSize: 12, letterSpacing: '-0.005em' }}>
      <div className="krk-lp-footer-inner">
        <div>
          <div style={{ fontFamily: FONT_EN, fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            KRK CHECKER <span style={{ color: BREATH }}>·</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 11 }}>(c) 2026 krk.team · 서울특별시</div>
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', fontSize: 11.5 }}>
          <a href="https://krk.team/studio" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>krk Studio</a>
          <a href="#pricing"                style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>가격</a>
          <a href="/checker/terms"          style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>이용약관</a>
          <a href="/checker/privacy"        style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>개인정보처리방침</a>
          <a href="mailto:hello@krk.team"   style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>hello@krk.team</a>
        </div>
      </div>
    </footer>
  )
}

// ─── Landing (default export) ─────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()
  const handleCTA = () => navigate('/signup')

  return (
    <div style={{ fontFamily: FONT_KR, color: INK, background: '#fff' }}>
      <style>{CSS}</style>
      <HeroSection onCTA={handleCTA} />
      <CategoriesSection />
      <PricingSection onCTA={handleCTA} />
      <ReviewsSection onCTA={handleCTA} />
      <StudioSection />
      <LandingFooter />
    </div>
  )
}
