/* global React */
// review-result.jsx — /review 무료 검토 결과 + 서비스 선택 화면
//
// Props:
//   variation : 'A' | 'B'        (A = findings hero · 와이어 충실 / B = decision hero · 결제 동기 강화)
//   mode      : 'violations' | 'warns-only' | 'all-pass'
//   device    : 'desktop' | 'mobile'

const { useState, useMemo } = React;

// ─── Tokens (KRK system) ────────────────────────────────────
const HERITAGE      = '#002D72';
const HERITAGE_600  = '#00255E';
const BREATH        = '#0CA4F9';
const BREATH_50     = '#EAF6FE';
const INK           = '#0A0A0B';
const INK_2         = 'rgba(10,10,11,0.65)';
const INK_3         = 'rgba(10,10,11,0.4)';
const SURFACE       = '#F4F4F5';
const CARD          = '#fff';
const FAINT         = 'rgba(10,10,11,0.55)';
const MUTED         = 'rgba(10,10,11,0.40)';
const HAIRLINE      = 'rgba(10,10,11,0.15)';
const HAIRLINE_SOFT = 'rgba(10,10,11,0.08)';

const WARN_BG       = '#FFF3DC';
const WARN_TEXT     = '#8A5A00';
const RISK_BG       = '#FFE6E6';
const RISK_TEXT     = '#B30000';

const FONT_KR = 'Pretendard, "Pretendard Variable", system-ui, -apple-system, sans-serif';
const FONT_EN = 'Inter, system-ui, sans-serif';

// ─── Result items dataset ───────────────────────────────────
const PRODUCT = '딸기 레몬 잼';

// Full 16-item set — wireframe + service-brief context
const ITEMS_FULL = [
  // 필수 확인
  { id: 'r01', kind: 'need', title: '원재료명 및 함량', desc: '원재료 표시 순서와 함량 표기가 판매용 라벨 기준에 맞는지 확인이 필요합니다.', chips: ['원재료 영역', '품목제조보고 입력값 영향'], locked: true, lockMsg: '상세 수정 문구 잠김', lockSub: '상세 수정 문구와 기준 출처는 전문 수정 가이드에서 확인할 수 있어요.' },
  { id: 'r02', kind: 'need', title: '제조원 정보', desc: '제품 판매와 신청 자료에 들어갈 제조원명, 소재지, 영업 정보가 충분히 정리되어야 합니다.', chips: ['라벨 후면', '신청 자료 공통 항목'], locked: true, lockMsg: '입력 예시 잠김', lockSub: '사업자 유형별 정리 방식은 전문 수정 가이드에서 제공됩니다.' },
  // 보완 권장
  { id: 'r03', kind: 'warn', title: '영양성분 표시 또는 면제 여부', desc: '제품 유형과 판매 방식에 따라 영양성분 표시 대상인지, 면제 가능성이 있는지 확인이 필요할 수 있습니다.', chips: ['영양성분표', '조건부 판단'], locked: true, lockMsg: '판단 기준 잠김', lockSub: '면제 가능성 판단과 표시 예시는 전문 수정 가이드에서 확인하세요.' },
  { id: 'r04', kind: 'warn', title: '분리배출 표시', desc: '포장재 재질에 따라 분리배출 마크와 재질 표기가 필요할 수 있습니다.', chips: ['포장재', '환경부 고시 참고'], locked: false },
  { id: 'r05', kind: 'warn', title: '알레르기 표기 강조', desc: '알레르기 유발물질이 원재료에 포함된 경우 표기 위치와 강조 방식을 검토하는 것이 좋습니다.', chips: ['라벨 후면', '주의문구'], locked: true, lockMsg: '강조 예시 잠김', lockSub: '실제 강조 표기 예시는 전문 수정 가이드에서 제공됩니다.' },
  // 기준 충족
  { id: 'r06', kind: 'ok', title: '보관방법', desc: '입력한 보관방법은 라벨 표시 항목으로 정리되어 있습니다.', chips: ['라벨 표시 반영'], locked: false },
  { id: 'r07', kind: 'ok', title: '소비기한 표기', desc: '제조일자 기준 소비기한 형식이 표시 기준을 충족합니다.', chips: ['라벨 표시 반영'], locked: false },
  { id: 'r08', kind: 'ok', title: '식품유형 표기', desc: '식약처 분류명이 정확하게 매핑되었습니다.', chips: ['식약처 분류'], locked: false },
  { id: 'r09', kind: 'ok', title: '내용량 단위', desc: '단위 표기 형식이 기준에 맞게 입력되었습니다.', chips: ['라벨 전면'], locked: false },
  { id: 'r10', kind: 'ok', title: '제품명 표기', desc: '제품명 길이와 표기 방식이 기준을 충족합니다.', chips: ['라벨 전면'], locked: false },
  { id: 'r11', kind: 'ok', title: '원산지 표시', desc: '주요 원재료의 원산지가 정리되어 있습니다.', chips: ['원재료 영역'], locked: false },
];

const COUNTS_FULL = { need: 2, warn: 3, ok: 11 };
const COUNTS_WARNS = { need: 0, warn: 3, ok: 13 };
const COUNTS_PASS  = { need: 0, warn: 0, ok: 16 };

function presetFor(mode) {
  if (mode === 'all-pass') {
    return {
      counts: COUNTS_PASS,
      items: ITEMS_FULL.filter((i) => i.kind === 'ok').map((i) => ({ ...i, locked: false })),
    };
  }
  if (mode === 'warns-only') {
    return {
      counts: COUNTS_WARNS,
      items: ITEMS_FULL.filter((i) => i.kind !== 'need'),
    };
  }
  return { counts: COUNTS_FULL, items: ITEMS_FULL };
}

// ─── Logo ───────────────────────────────────────────────────
function KrkLogo({ size = 13 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, lineHeight: 1, userSelect: 'none' }}>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color: INK, letterSpacing: '0.22em', textTransform: 'uppercase' }}>KRK CHECKER</span>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color: BREATH, marginLeft: '0.18em', lineHeight: 1 }}>·</span>
    </div>
  );
}

// ─── Sticky Nav ─────────────────────────────────────────────
function StickyNav({ device }) {
  const isDesktop = device === 'desktop';
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isDesktop ? '16px 56px' : '14px 20px',
      borderBottom: `1px solid ${HAIRLINE_SOFT}`,
      background: 'rgba(255,255,255,.78)',
      backdropFilter: 'blur(18px) saturate(160%)',
      WebkitBackdropFilter: 'blur(18px) saturate(160%)',
      flexShrink: 0,
    }}>
      <KrkLogo size={isDesktop ? 13 : 12} />
      {isDesktop ? (
        <div style={{
          fontFamily: FONT_EN, color: INK_3, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>Free Review Result</div>
      ) : null}
      <div style={{
        fontFamily: FONT_EN, color: INK_3, fontSize: 10.5, fontWeight: 600,
        letterSpacing: '0.16em', textTransform: 'uppercase',
      }}>{isDesktop ? 'krk.team/review' : 'Review'}</div>
    </nav>
  );
}

// ─── Flow Breadcrumb ────────────────────────────────────────
const FLOW_STEPS = [
  { n: 1, label: '정보 입력', state: 'done' },
  { n: 2, label: '라벨 미리보기', state: 'done' },
  { n: 3, label: '무료 검토 결과', state: 'active' },
  { n: 4, label: '상세 수정 가이드', state: 'inactive' },
  { n: 5, label: '다운로드', state: 'inactive' },
];

function FlowBreadcrumb({ device }) {
  const isDesktop = device === 'desktop';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      marginBottom: isDesktop ? 28 : 22,
      overflow: 'auto', fontFamily: FONT_EN,
      fontSize: isDesktop ? 11 : 10, letterSpacing: '0.08em', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {FLOW_STEPS.map((s, i) => {
        const isActive = s.state === 'active';
        const isDone = s.state === 'done';
        const color = isActive || isDone ? HERITAGE : INK_3;
        return (
          <React.Fragment key={s.n}>
            {i > 0 ? (
              <span style={{
                width: isDesktop ? 32 : 16, height: 1,
                background: HAIRLINE, margin: `0 ${isDesktop ? 14 : 8}px`,
                flexShrink: 0,
              }}/>
            ) : null}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color, flexShrink: 0,
            }}>
              <span style={{
                display: 'inline-grid', placeItems: 'center',
                width: 22, height: 22, borderRadius: 999,
                border: `1px solid ${color}`,
                background: isActive ? HERITAGE : 'transparent',
                color: isActive ? '#fff' : color,
                fontSize: 10, fontWeight: 600, fontStyle: 'normal',
                flexShrink: 0,
              }}>
                {isDone ? (
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : s.n}
              </span>
              <span style={{ fontWeight: isActive ? 600 : 500 }}>{s.label}</span>
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Badges ─────────────────────────────────────────────────
function Badge({ kind, children, large }) {
  const map = {
    need: { bg: RISK_BG,    text: RISK_TEXT },
    warn: { bg: WARN_BG,    text: WARN_TEXT },
    ok:   { bg: BREATH_50,  text: HERITAGE_600 },
  };
  const s = map[kind];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: large ? '6px 12px' : '4px 10px',
      background: s.bg, color: s.text,
      borderRadius: 999,
      fontFamily: FONT_KR, fontSize: large ? 12 : 11, fontWeight: 500,
      letterSpacing: '-0.005em', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.text }}/>
      {children}
    </span>
  );
}

// ─── Chip ────────────────────────────────────────────────────
function Chip({ children }) {
  return (
    <span style={{
      border: `1px solid ${HAIRLINE}`, padding: '4px 8px',
      color: INK_2, background: SURFACE,
      fontSize: 11.5, letterSpacing: '-0.005em',
    }}>{children}</span>
  );
}

// ─── Locked Block ────────────────────────────────────────────
function LockedBlock({ msg = '상세 수정 문구 잠김', sub }) {
  return (
    <div style={{
      position: 'relative', marginTop: 14, overflow: 'hidden',
      border: `1px solid ${HAIRLINE_SOFT}`, background: CARD,
    }}>
      <div style={{ padding: 14, filter: 'blur(4px)', userSelect: 'none', opacity: 0.62 }}>
        <div style={{ height: 11, margin: '8px 0', background: 'linear-gradient(90deg, #DFE3E8, #F2F4F7)' }}/>
        <div style={{ height: 11, margin: '8px 0', width: '62%', background: 'linear-gradient(90deg, #DFE3E8, #F2F4F7)' }}/>
        <div style={{ height: 11, margin: '8px 0', background: 'linear-gradient(90deg, #DFE3E8, #F2F4F7)' }}/>
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(255,255,255,0.78)',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="3.5" y="7.5" width="9" height="6" rx="0.5" stroke={HERITAGE} strokeWidth="1.2"/>
            <path d="M5.5 7.5V5.5a2.5 2.5 0 0 1 5 0V7.5" stroke={HERITAGE} strokeWidth="1.2"/>
          </svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: HERITAGE, fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em' }}>{msg}</div>
            {sub ? <div style={{ color: INK_2, fontSize: 12, marginTop: 3, letterSpacing: '-0.005em', lineHeight: 1.45 }}>{sub}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Summary Card (Hero right) ──────────────────────────────
function SummaryCard({ counts, productName = PRODUCT, compact }) {
  return (
    <aside style={{
      border: `1px solid ${HAIRLINE_SOFT}`, background: CARD,
      width: '100%',
    }}>
      <div style={{ padding: 16, borderBottom: `1px solid ${HAIRLINE_SOFT}` }}>
        <div style={{
          fontFamily: FONT_EN, color: INK_3, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 5,
        }}>Label Readiness</div>
        <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{productName}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <ScoreCell n={counts.need} label="필수 확인" color={RISK_TEXT} />
        <ScoreCell n={counts.warn} label="보완 권장" color={WARN_TEXT} bordered />
        <ScoreCell n={counts.ok}   label="기준 충족" color={HERITAGE} />
      </div>
    </aside>
  );
}

function ScoreCell({ n, label, color, bordered }) {
  return (
    <div style={{
      minHeight: 112, padding: 16,
      borderLeft: bordered ? `1px solid ${HAIRLINE_SOFT}` : 'none',
      borderRight: bordered ? `1px solid ${HAIRLINE_SOFT}` : 'none',
    }}>
      <div style={{
        fontFamily: FONT_EN, fontSize: 34, fontWeight: 700,
        color, lineHeight: 1, letterSpacing: '-0.02em',
      }}>{n}</div>
      <div style={{ color: INK_2, fontSize: 12, marginTop: 10, letterSpacing: '-0.005em' }}>{label}</div>
    </div>
  );
}

// ─── Result Item ────────────────────────────────────────────
function ResultItem({ item, device, hideLocked }) {
  const isDesktop = device === 'desktop';
  const badgeLabel = item.kind === 'need' ? '필수 확인' : item.kind === 'warn' ? '보완 권장' : '기준 충족';
  return (
    <article style={{
      display: 'grid',
      gridTemplateColumns: isDesktop ? '120px minmax(0, 1fr)' : '1fr',
      gap: isDesktop ? 20 : 12,
      padding: isDesktop ? '22px 24px' : '18px 20px',
      borderBottom: `1px solid ${HAIRLINE_SOFT}`,
    }}>
      <div><Badge kind={item.kind}>{badgeLabel}</Badge></div>
      <div>
        <h3 style={{ margin: '0 0 7px', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {item.title}
        </h3>
        <p style={{ margin: 0, color: INK_2, fontSize: 14, lineHeight: 1.6, letterSpacing: '-0.005em', wordBreak: 'keep-all' }}>
          {item.desc}
        </p>
        {item.chips && item.chips.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {item.chips.map((c) => <Chip key={c}>{c}</Chip>)}
          </div>
        ) : null}
        {!hideLocked && item.locked ? <LockedBlock msg={item.lockMsg} sub={item.lockSub} /> : null}
      </div>
    </article>
  );
}

// ─── Result Item COMPACT (B안) ──────────────────────────────
function ResultItemCompact({ item, device }) {
  const isDesktop = device === 'desktop';
  const badgeLabel = item.kind === 'need' ? '필수 확인' : item.kind === 'warn' ? '보완 권장' : '기준 충족';
  return (
    <article style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: isDesktop ? '14px 20px' : '14px 18px',
      borderBottom: `1px solid ${HAIRLINE_SOFT}`,
      flexWrap: 'wrap',
    }}>
      <div style={{ flexShrink: 0 }}><Badge kind={item.kind}>{badgeLabel}</Badge></div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <h3 style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {item.title}
        </h3>
        <p style={{ margin: 0, color: INK_2, fontSize: 13, lineHeight: 1.5, letterSpacing: '-0.005em', wordBreak: 'keep-all' }}>
          {item.desc}
        </p>
      </div>
      {item.locked ? (
        <div style={{
          flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontFamily: FONT_KR, fontSize: 11.5, color: HERITAGE,
          fontWeight: 500, letterSpacing: '-0.005em', whiteSpace: 'nowrap',
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <rect x="3.5" y="7.5" width="9" height="6" rx="0.5" stroke={HERITAGE} strokeWidth="1.2"/>
            <path d="M5.5 7.5V5.5a2.5 2.5 0 0 1 5 0V7.5" stroke={HERITAGE} strokeWidth="1.2"/>
          </svg>
          수정 문구 잠김
        </div>
      ) : null}
    </article>
  );
}

// ─── Offer Card ──────────────────────────────────────────────
function OfferCard({ tier, device }) {
  const isPro = tier === 'pro';
  const isDesktop = device === 'desktop';
  const meta = isPro ? {
    eyebrow: 'Professional Guide',
    title: '전문 수정 가이드',
    price: '19,900',
    desc: '판매 전 보완 기준까지 확인해야 한다면 선택하세요.',
    bullets: [
      '항목별 수정 방법 + 표시 기준 출처',
      '과태료 · 행정처분 참고 정보',
      '신고 입력 가이드 (정부24 참고용)',
      '라벨 검토 리포트 (자율 점검 기록)',
      '분리배출 마크 ZIP',
      '라벨 PDF + PNG',
    ],
    cta: '상세 수정 가이드 받기',
    ctaColor: HERITAGE,
  } : {
    eyebrow: 'Basic Label Package',
    title: '기본 라벨 패키지',
    price: '9,900',
    desc: '라벨 PDF와 기본 검토 결과만 필요하다면 선택하세요.',
    bullets: [
      '라벨 PDF · 인쇄용',
      '라벨 PNG · 고해상도 / 웹용',
      '항목별 텍스트 복사',
      '기본 신호등 결과',
    ],
    cta: '기본 라벨 패키지 받기',
    ctaColor: BREATH,
  };

  return (
    <div style={{
      border: `1px solid ${isPro ? HERITAGE : HAIRLINE_SOFT}`,
      background: CARD,
    }}>
      <div style={{ padding: isDesktop ? 22 : 20 }}>
        <div style={{
          fontFamily: FONT_EN, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: isPro ? HERITAGE : INK_3, marginBottom: 10,
        }}>{meta.eyebrow}</div>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.25 }}>
          {meta.title}
        </h3>
        <div style={{ marginTop: 10, color: HERITAGE, lineHeight: 1 }}>
          <span style={{ fontFamily: FONT_EN, fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>{meta.price}</span>
          <span style={{ marginLeft: 4, color: INK_3, fontFamily: FONT_KR, fontSize: 13, fontWeight: 500 }}>원</span>
        </div>
        <p style={{ margin: '14px 0 0', color: INK_2, fontSize: 13, lineHeight: 1.7, letterSpacing: '-0.005em', wordBreak: 'keep-all' }}>
          {meta.desc}
        </p>
        <ul style={{ display: 'grid', gap: 8, margin: '16px 0', padding: 0, listStyle: 'none' }}>
          {meta.bullets.map((b) => (
            <li key={b} style={{
              display: 'flex', gap: 10, color: INK_2,
              fontSize: 12.5, lineHeight: 1.5, letterSpacing: '-0.005em',
            }}>
              <span style={{
                flex: '0 0 auto', width: 5, height: 5, marginTop: 8,
                borderRadius: 999, background: isPro ? HERITAGE : INK_3,
              }}/>
              <span style={{ wordBreak: 'keep-all' }}>{b}</span>
            </li>
          ))}
        </ul>
        <button type="button" style={{
          display: 'inline-flex', width: '100%', height: 46,
          alignItems: 'center', justifyContent: 'center', gap: 8,
          border: 'none', borderRadius: 0,
          background: meta.ctaColor, color: '#fff',
          fontFamily: FONT_KR, fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.005em',
          cursor: 'pointer',
        }}>
          {meta.cta}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Included Files panel ───────────────────────────────────
function IncludedFilesPanel() {
  const rows = [
    { name: '라벨 PDF',          use: '인쇄 참고용' },
    { name: '라벨 PNG',          use: '웹 / 스마트스토어' },
    { name: '품목제조보고 입력 가이드', use: '정부24 신청 참고용' },
    { name: '라벨 검토 리포트',     use: '자율 점검 기록' },
    { name: '분리배출 마크 ZIP',    use: '환경부 공식 도안' },
  ];
  return (
    <div style={{
      display: 'grid', gap: 10, padding: 18,
      border: `1px solid ${HAIRLINE_SOFT}`, background: CARD,
    }}>
      <div>
        <div style={{
          fontFamily: FONT_EN, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: INK_3, marginBottom: 4,
        }}>Included Files</div>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }}>
          전문 수정 가이드 포함 파일
        </h3>
      </div>
      {rows.map((r) => (
        <div key={r.name} style={{
          display: 'flex', justifyContent: 'space-between', gap: 12,
          borderTop: `1px solid ${HAIRLINE_SOFT}`, paddingTop: 10,
          fontSize: 12.5, letterSpacing: '-0.005em',
        }}>
          <span style={{ color: INK_2 }}>{r.name}</span>
          <span style={{ color: INK, fontWeight: 500 }}>{r.use}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Notice panel ────────────────────────────────────────────
function NoticePanel({ compact }) {
  return (
    <div style={{
      padding: compact ? 14 : 18,
      border: `1px solid ${HAIRLINE_SOFT}`, background: CARD,
    }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.005em' }}>
        중요 안내
      </h3>
      <p style={{ margin: 0, color: INK_2, fontSize: 12, lineHeight: 1.6, letterSpacing: '-0.005em', wordBreak: 'keep-all' }}>
        KRK의 검토 결과는 입력한 정보를 기준으로 한 자율 점검 참고 자료이며, 식약처 또는 관할 기관의 공식 인증이 아닙니다.
      </p>
    </div>
  );
}

// ─── Edit input back-link ───────────────────────────────────
function EditInputLink({ device }) {
  return (
    <button type="button" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'transparent', border: 'none', padding: 0,
      color: HERITAGE, fontFamily: FONT_KR, fontSize: 13, fontWeight: 500,
      letterSpacing: '-0.005em', cursor: 'pointer',
      borderBottom: `1px solid ${BREATH}`, paddingBottom: 1,
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M9 6H3M5 3L2 6l3 3" stroke={HERITAGE} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      입력 수정하기
    </button>
  );
}

// =============================================================
// VARIATION A — Findings hero (와이어 충실)
// =============================================================
function VariationA({ counts, items, device, mode }) {
  const isDesktop = device === 'desktop';
  const xPad = isDesktop ? 56 : 20;
  const hasIssues = counts.need + counts.warn > 0;
  const h1 = '판매 전 확인해야 할 표시 기준을 정리했어요.';
  const lead = '입력한 제품 정보와 라벨 미리보기를 기준으로, 품목제조보고 신청과 판매 준비 전에 확인이 필요한 항목을 먼저 정리했습니다.';

  return (
    <div style={{ flex: 1, overflow: 'auto', background: SURFACE }}>
      <main style={{
        maxWidth: 1140, margin: '0 auto',
        padding: `${isDesktop ? 40 : 26}px ${xPad}px ${isDesktop ? 56 : 36}px`,
        boxSizing: 'border-box',
      }}>
        <FlowBreadcrumb device={device} />

        {/* Hero */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'minmax(0, 1fr) 320px' : '1fr',
          gap: isDesktop ? 32 : 24,
          alignItems: 'end',
          paddingBottom: isDesktop ? 32 : 24,
          borderBottom: `1px solid ${HAIRLINE_SOFT}`,
        }}>
          <div>
            <div style={{
              fontFamily: FONT_EN, color: HERITAGE,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
              marginBottom: 12,
            }}>{hasIssues ? '무료 검토 결과' : '검토 완료'}</div>
            <h1 style={{
              margin: 0, maxWidth: 720,
              fontSize: isDesktop ? 48 : 28,
              fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em',
              wordBreak: 'keep-all',
            }}>{h1}</h1>
            <p style={{
              margin: '18px 0 0', maxWidth: 620,
              color: INK_2, fontSize: isDesktop ? 15 : 13.5,
              lineHeight: 1.7, letterSpacing: '-0.005em',
              wordBreak: 'keep-all',
            }}>{lead}</p>
            <div style={{ marginTop: 18 }}>
              <EditInputLink device={device} />
            </div>
          </div>
          <SummaryCard counts={counts} />
        </section>

        {/* Main section */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'minmax(0, 1fr) 320px' : '1fr',
          gap: isDesktop ? 28 : 22,
          alignItems: 'start',
          marginTop: isDesktop ? 32 : 24,
        }}>
          {/* Results panel */}
          <div style={{ background: CARD, border: `1px solid ${HAIRLINE_SOFT}` }}>
            <header style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 16, padding: '18px 24px', borderBottom: `1px solid ${HAIRLINE_SOFT}`,
              flexWrap: 'wrap',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>
                  주요 확인 항목
                </h2>
                <p style={{ margin: '4px 0 0', color: INK_3, fontSize: 12.5, letterSpacing: '-0.005em' }}>
                  무료 결과에서는 확인이 필요한 영역과 이유만 먼저 보여줍니다.
                </p>
              </div>
              {counts.need > 0 ? <Badge kind="need">필수 확인 {counts.need}</Badge>
                : counts.warn > 0 ? <Badge kind="warn">보완 권장 {counts.warn}</Badge>
                : <Badge kind="ok">기준 충족 {counts.ok}</Badge>}
            </header>
            <div>
              {items.slice(0, isDesktop ? 6 : 5).map((it) => (
                <ResultItem key={it.id} item={it} device={device} />
              ))}
              {items.length > (isDesktop ? 6 : 5) ? (
                <div style={{
                  padding: '16px 24px', textAlign: 'center',
                  color: INK_3, fontSize: 12.5, letterSpacing: '-0.005em',
                }}>+ 기준 충족 {items.length - (isDesktop ? 6 : 5)}건 더 보기</div>
              ) : null}
            </div>
          </div>

          {/* Side panel */}
          <aside style={{
            position: isDesktop ? 'sticky' : 'static', top: 88,
            display: 'grid', gap: 16,
          }}>
            <OfferCard tier="basic" device={device} />
            <OfferCard tier="pro" device={device} />
            <IncludedFilesPanel />
            <NoticePanel />
          </aside>
        </section>

        <p style={{
          marginTop: isDesktop ? 32 : 24,
          borderTop: `1px solid ${HAIRLINE_SOFT}`, paddingTop: 18,
          color: INK_3, fontSize: 12, lineHeight: 1.7, letterSpacing: '-0.005em',
          wordBreak: 'keep-all',
        }}>
          화면 목적: 사용자가 입력한 라벨이 판매와 품목제조보고 신청을 위해 어떤 표시 기준을 확인해야 하는지 알려주고,
          상세 수정 방법과 산출물은 결제 후 제공합니다.
        </p>
      </main>
    </div>
  );
}

// =============================================================
// VARIATION B — Decision hero (위반 임팩트 + 통합 패키지)
// =============================================================
function VariationB({ counts, items, device, mode }) {
  const isDesktop = device === 'desktop';
  const xPad = isDesktop ? 56 : 20;
  const hasViolations = counts.need > 0;
  const hasIssues = counts.need + counts.warn > 0;
  const h1 = hasViolations
    ? '판매 전 확인이 필요한 항목이 발견됐어요.'
    : hasIssues
      ? '몇 가지만 보완하면 판매 준비가 끝나요.'
      : '입력하신 라벨이 기준에 맞는지 정리했어요.';

  const violations = items.filter((i) => i.kind === 'need');
  const warns      = items.filter((i) => i.kind === 'warn');
  const oks        = items.filter((i) => i.kind === 'ok');

  return (
    <div style={{ flex: 1, overflow: 'auto', background: SURFACE }}>
      <main style={{
        maxWidth: 1140, margin: '0 auto',
        padding: `${isDesktop ? 36 : 24}px ${xPad}px ${isDesktop ? 52 : 32}px`,
        boxSizing: 'border-box',
      }}>
        <FlowBreadcrumb device={device} />

        {/* Hero — score-led */}
        <section style={{
          padding: isDesktop ? '36px 36px 32px' : '24px 22px 22px',
          background: hasViolations ? '#1a1d24' : CARD,
          color: hasViolations ? '#fff' : INK,
          border: `1px solid ${hasViolations ? '#1a1d24' : HAIRLINE_SOFT}`,
          marginBottom: isDesktop ? 24 : 20,
        }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            gap: 16, marginBottom: 18, flexWrap: 'wrap',
          }}>
            <div style={{
              fontFamily: FONT_EN, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: hasViolations ? 'rgba(255,255,255,0.7)' : HERITAGE,
            }}>{hasViolations ? 'Action Required · 무료 검토 결과' : '무료 검토 결과'}</div>
            <div style={{
              fontFamily: FONT_EN, fontSize: 11, color: hasViolations ? 'rgba(255,255,255,0.5)' : INK_3,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>{PRODUCT}</div>
          </div>

          <h1 style={{
            margin: 0, maxWidth: 720,
            fontSize: isDesktop ? 44 : 26,
            fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em',
            wordBreak: 'keep-all',
          }}>{h1}</h1>

          {/* Score strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(3, 1fr) auto' : 'repeat(3, 1fr)',
            gap: isDesktop ? 0 : 14,
            marginTop: isDesktop ? 32 : 24,
            paddingTop: isDesktop ? 22 : 18,
            borderTop: `1px solid ${hasViolations ? 'rgba(255,255,255,0.16)' : HAIRLINE_SOFT}`,
            alignItems: 'end',
          }}>
            <ScoreInline n={counts.need} label="필수 확인" color={hasViolations ? '#FF8A8A' : RISK_TEXT} dark={hasViolations} />
            <ScoreInline n={counts.warn} label="보완 권장" color={hasViolations ? '#FFD78B' : WARN_TEXT} dark={hasViolations} divider />
            <ScoreInline n={counts.ok}   label="기준 충족" color={hasViolations ? BREATH : HERITAGE}  dark={hasViolations} divider />
            {isDesktop ? <EditInlineBack dark={hasViolations} /> : null}
          </div>
          {!isDesktop ? <div style={{ marginTop: 16 }}><EditInlineBack dark={hasViolations} /></div> : null}
        </section>

        {/* Violations callout (only if exist) */}
        {violations.length > 0 ? (
          <div style={{
            background: CARD, border: `1px solid ${HAIRLINE_SOFT}`,
            borderLeft: `3px solid ${RISK_TEXT}`,
            padding: isDesktop ? '18px 24px' : '16px 18px',
            marginBottom: isDesktop ? 16 : 14,
          }}>
            <div style={{
              fontFamily: FONT_EN, fontSize: 10.5, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: RISK_TEXT, marginBottom: 10,
            }}>판매 전 필수 확인 — {violations.length}건</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {violations.map((v) => (
                <div key={v.id} style={{
                  display: 'flex', alignItems: 'baseline', gap: 10,
                  padding: '6px 0',
                  borderTop: `1px dashed ${HAIRLINE_SOFT}`,
                }}>
                  <span style={{ fontFamily: FONT_EN, fontSize: 11, color: RISK_TEXT, fontWeight: 600, minWidth: 28 }}>0{v.id.slice(-1)}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: INK, letterSpacing: '-0.01em', flex: 1, wordBreak: 'keep-all' }}>
                    {v.title}
                  </span>
                  <span style={{ fontSize: 11.5, color: INK_3, letterSpacing: '-0.005em', whiteSpace: 'nowrap' }}>
                    수정 문구 잠김
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Main 2-col: compact results + integrated package card */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'minmax(0, 1fr) 340px' : '1fr',
          gap: isDesktop ? 20 : 18,
          alignItems: 'start',
        }}>
          {/* Compact results */}
          <div>
            {/* Need */}
            {violations.length > 0 ? (
              <div style={{ background: CARD, border: `1px solid ${HAIRLINE_SOFT}`, marginBottom: 14 }}>
                <SectionHeader title="필수 확인" count={violations.length} kind="need" />
                {violations.map((it) => <ResultItemCompact key={it.id} item={it} device={device} />)}
              </div>
            ) : null}
            {/* Warn */}
            {warns.length > 0 ? (
              <div style={{ background: CARD, border: `1px solid ${HAIRLINE_SOFT}`, marginBottom: 14 }}>
                <SectionHeader title="보완 권장" count={warns.length} kind="warn" />
                {warns.map((it) => <ResultItemCompact key={it.id} item={it} device={device} />)}
              </div>
            ) : null}
            {/* OK — collapsed summary */}
            <div style={{
              background: CARD, border: `1px solid ${HAIRLINE_SOFT}`,
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Badge kind="ok">기준 충족 {counts.ok}</Badge>
                <span style={{ color: INK_2, fontSize: 13, letterSpacing: '-0.005em' }}>
                  표시 기준을 충족한 항목입니다.
                </span>
              </div>
              <button type="button" style={{
                background: 'transparent', border: 'none', padding: 0,
                color: HERITAGE, fontSize: 12.5, fontWeight: 500,
                letterSpacing: '-0.005em', cursor: 'pointer',
                borderBottom: `1px solid ${BREATH}`, paddingBottom: 1,
              }}>전체 보기 →</button>
            </div>
          </div>

          {/* Integrated package card */}
          <IntegratedPackageCard device={device} hasViolations={hasViolations} />
        </section>

        {/* Bottom notice */}
        <div style={{ marginTop: isDesktop ? 24 : 18 }}>
          <NoticePanel />
        </div>
      </main>
    </div>
  );
}

function ScoreInline({ n, label, color, dark, divider }) {
  return (
    <div style={{
      paddingLeft: divider ? 20 : 0,
      borderLeft: divider ? `1px solid ${dark ? 'rgba(255,255,255,0.16)' : HAIRLINE_SOFT}` : 'none',
    }}>
      <div style={{
        fontFamily: FONT_EN, fontSize: 38, fontWeight: 700,
        color, lineHeight: 1, letterSpacing: '-0.025em',
      }}>{n}</div>
      <div style={{
        marginTop: 8,
        color: dark ? 'rgba(255,255,255,0.7)' : INK_2,
        fontSize: 12, letterSpacing: '-0.005em',
      }}>{label}</div>
    </div>
  );
}

function EditInlineBack({ dark }) {
  return (
    <button type="button" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'transparent', border: 'none', padding: 0,
      color: dark ? 'rgba(255,255,255,0.9)' : HERITAGE,
      fontFamily: FONT_KR, fontSize: 12.5, fontWeight: 500,
      letterSpacing: '-0.005em', cursor: 'pointer',
      borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.4)' : BREATH}`,
      paddingBottom: 1, alignSelf: 'flex-end',
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M9 6H3M5 3L2 6l3 3" stroke={dark ? 'rgba(255,255,255,0.9)' : HERITAGE} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      입력 수정하기
    </button>
  );
}

function SectionHeader({ title, count, kind }) {
  const color = kind === 'need' ? RISK_TEXT : kind === 'warn' ? WARN_TEXT : HERITAGE;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', borderBottom: `1px solid ${HAIRLINE_SOFT}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: color }}/>
        <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.005em' }}>{title}</h3>
        <span style={{ fontFamily: FONT_EN, fontSize: 11, color: INK_3, fontWeight: 600 }}>
          {String(count).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

// ─── Integrated package (B안) ───────────────────────────────
function IntegratedPackageCard({ device, hasViolations }) {
  const [tier, setTier] = useState('pro');
  const isDesktop = device === 'desktop';
  const proMeta = {
    title: '전문 수정 가이드',
    price: '19,900',
    bullets: [
      '항목별 수정 방법 + 표시 기준 출처',
      '과태료 · 행정처분 참고 정보',
      '신고 입력 가이드 + 라벨 검토 리포트',
      '분리배출 마크 ZIP + 라벨 PDF/PNG',
    ],
    cta: '상세 수정 가이드 받기',
    ctaColor: HERITAGE,
  };
  const basicMeta = {
    title: '기본 라벨 패키지',
    price: '9,900',
    bullets: [
      '라벨 PDF · 인쇄용',
      '라벨 PNG · 고해상도',
      '항목별 텍스트 복사',
    ],
    cta: '기본 라벨 패키지 받기',
    ctaColor: BREATH,
  };
  const meta = tier === 'pro' ? proMeta : basicMeta;

  return (
    <aside style={{
      position: isDesktop ? 'sticky' : 'static', top: 88,
      border: `1px solid ${HERITAGE}`, background: CARD,
    }}>
      {/* Tier toggle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${HAIRLINE_SOFT}` }}>
        <PackageTab active={tier === 'basic'} onClick={() => setTier('basic')}
          label="기본" price="9,900" />
        <PackageTab active={tier === 'pro'}   onClick={() => setTier('pro')}
          label="전문" price="19,900" recommended />
      </div>

      <div style={{ padding: 22 }}>
        <div style={{
          fontFamily: FONT_EN, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: tier === 'pro' ? HERITAGE : INK_3, marginBottom: 8,
        }}>
          {tier === 'pro' ? 'Professional Guide · Recommended' : 'Basic Label Package'}
        </div>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {meta.title}
        </h3>
        <div style={{ marginTop: 10, color: HERITAGE, lineHeight: 1 }}>
          <span style={{ fontFamily: FONT_EN, fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em' }}>{meta.price}</span>
          <span style={{ marginLeft: 4, color: INK_3, fontFamily: FONT_KR, fontSize: 14, fontWeight: 500 }}>원</span>
        </div>

        <ul style={{ display: 'grid', gap: 9, margin: '18px 0 20px', padding: 0, listStyle: 'none' }}>
          {meta.bullets.map((b) => (
            <li key={b} style={{
              display: 'flex', gap: 10, color: INK_2,
              fontSize: 12.5, lineHeight: 1.55, letterSpacing: '-0.005em',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke={tier === 'pro' ? HERITAGE : BREATH} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ wordBreak: 'keep-all' }}>{b}</span>
            </li>
          ))}
        </ul>

        <button type="button" style={{
          display: 'inline-flex', width: '100%', height: 48,
          alignItems: 'center', justifyContent: 'center', gap: 8,
          border: 'none', borderRadius: 0,
          background: meta.ctaColor, color: '#fff',
          fontFamily: FONT_KR, fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.005em',
          cursor: 'pointer',
        }}>
          {meta.cta}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div style={{
          marginTop: 14, paddingTop: 12,
          borderTop: `1px solid ${HAIRLINE_SOFT}`,
          color: INK_3, fontSize: 11, lineHeight: 1.5, letterSpacing: '-0.005em',
        }}>
          KRK 검토 결과는 자율 점검 참고 자료이며, 식약처 공식 인증이 아닙니다.
        </div>
      </div>
    </aside>
  );
}

function PackageTab({ active, onClick, label, price, recommended }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '14px 16px',
      background: active ? (recommended ? HERITAGE : INK) : 'transparent',
      color: active ? '#fff' : INK,
      border: 'none', cursor: 'pointer',
      borderRight: !recommended ? `1px solid ${HAIRLINE_SOFT}` : 'none',
      textAlign: 'left',
      fontFamily: FONT_KR,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
        fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.005em',
      }}>
        <span>{label}</span>
        {recommended ? (
          <span style={{
            fontSize: 9.5, fontWeight: 600, letterSpacing: '0.06em',
            padding: '2px 5px',
            background: active ? 'rgba(255,255,255,0.16)' : BREATH_50,
            color: active ? '#fff' : HERITAGE,
            textTransform: 'uppercase',
          }}>추천</span>
        ) : null}
      </div>
      <div style={{
        marginTop: 4,
        fontFamily: FONT_EN, fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
        opacity: active ? 1 : 0.7,
      }}>{price}<span style={{ fontFamily: FONT_KR, fontSize: 11, marginLeft: 2, fontWeight: 500 }}>원</span></div>
    </button>
  );
}

// =============================================================
// ReviewResult — main composition
// =============================================================
function ReviewResult({ variation = 'A', mode = 'violations', device = 'desktop' }) {
  const { counts, items } = useMemo(() => presetFor(mode), [mode]);
  return (
    <div style={{
      width: '100%', height: '100%', background: SURFACE,
      fontFamily: FONT_KR, color: INK,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      wordBreak: 'keep-all', overflowWrap: 'break-word',
    }}>
      <StickyNav device={device} />
      {variation === 'A'
        ? <VariationA counts={counts} items={items} device={device} mode={mode} />
        : <VariationB counts={counts} items={items} device={device} mode={mode} />}
    </div>
  );
}

Object.assign(window, { ReviewResult });
