/* global React */
// step2-ingredients.jsx — Step 2 · 원재료 입력
//
// Props:
//   variation : 'A' | 'B'      (A = 6-col 테이블 / B = card stack)
//   mode      : 'empty' | 'filled' | 'detected' | 'warnings' | 'autocomplete'
//   device    : 'desktop' | 'mobile'

const { useState, useMemo } = React;

// ─── Tokens (KRK system) ────────────────────────────────────
const HERITAGE      = '#002D72';
const BREATH        = '#0CA4F9';
const INK           = '#0A0A0B';
const SURFACE       = '#F4F4F5';
const CARD          = '#fff';
const FAINT         = 'rgba(10,10,11,0.55)';
const MUTED         = 'rgba(10,10,11,0.40)';
const HAIRLINE      = 'rgba(10,10,11,0.15)';
const HAIRLINE_SOFT = 'rgba(10,10,11,0.08)';

const SYS_OK       = '#1F8A5B';
const SYS_OK_BG    = 'rgba(31,138,91,0.06)';
const SYS_WARN     = '#B07A1A';
const SYS_WARN_BG  = '#FFF3DC';
const SYS_WARN_LN  = 'rgba(176,122,26,0.35)';
const ERROR        = '#B30000';
const ERROR_BG     = '#FFE6E6';
const ERROR_LN     = 'rgba(179,0,0,0.3)';

const FONT_KR = 'Pretendard, "Pretendard Variable", system-ui, -apple-system, sans-serif';
const FONT_EN = 'Inter, system-ui, sans-serif';

// ─── Sample data ─────────────────────────────────────────────
const TOTAL_WEIGHT = 200; // g (Step 1 입력)

const SAMPLE_FILLED = [
  { id: 1, name: '딸기',     weight: 120, isAllergen: false, isComposite: false },
  { id: 2, name: '설탕',     weight: 60,  isAllergen: false, isComposite: false },
  { id: 3, name: '레몬과즙', weight: 14,  isAllergen: false, isComposite: false },
  { id: 4, name: '펙틴',     weight: 5,   isAllergen: false, isComposite: false },
  { id: 5, name: '구연산',   weight: 1,   isAllergen: false, isComposite: false },
];

const SAMPLE_DETECTED = [
  { id: 1, name: '딸기',           weight: 100, isAllergen: true,  isComposite: false },
  { id: 2, name: '설탕',           weight: 55,  isAllergen: false, isComposite: false },
  { id: 3, name: '우유',           weight: 25,  isAllergen: true,  isComposite: false },
  { id: 4, name: '복합조미료(혼합)', weight: 14,  isAllergen: false, isComposite: true },
  { id: 5, name: '대두레시틴',      weight: 6,   isAllergen: true,  isComposite: false },
];

const SAMPLE_WARNINGS = [
  // total exceeded + sort wrong (small first)
  { id: 1, name: '구연산',   weight: 5,   isAllergen: false, isComposite: false },
  { id: 2, name: '설탕',     weight: 80,  isAllergen: false, isComposite: false },
  { id: 3, name: '딸기',     weight: 140, isAllergen: false, isComposite: false },
  { id: 4, name: '레몬과즙', weight: 18,  isAllergen: false, isComposite: false },
];

const AUTOCOMPLETE_SUGGESTIONS = [
  '딸기', '딸기과즙', '딸기퓨레', '딸기시럽 (혼합)', '동결건조 딸기',
];

const PACKAGING_PLASTIC = ['PET', 'PP', 'PE', 'PS', 'PVC', 'OTHER'];
const PACKAGING_OTHER   = ['유리', '종이', '캔(철)', '캔(알루미늄)', '복합재질'];

function presetFor(mode) {
  switch (mode) {
    case 'empty':        return { items: [], packaging: [] };
    case 'filled':       return { items: SAMPLE_FILLED, packaging: ['유리', '종이'] };
    case 'detected':     return { items: SAMPLE_DETECTED, packaging: ['PET', '종이'] };
    case 'warnings':     return { items: SAMPLE_WARNINGS, packaging: ['PET'] };
    case 'autocomplete': return { items: SAMPLE_FILLED.slice(0, 2), packaging: ['유리'] };
    default:             return { items: [], packaging: [] };
  }
}

// ─── Shared atoms (step4와 정합) ─────────────────────────────
function KrkLogo({ size = 14 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, lineHeight: 1 }}>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color: INK, letterSpacing: '0.22em', textTransform: 'uppercase' }}>KRK CHECKER</span>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color: BREATH, marginLeft: '0.18em' }}>·</span>
    </div>
  );
}

function StepProgress({ idx = 2, total = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i + 1 === idx;
        const done = i + 1 < idx;
        return <div key={i} style={{ width: active ? 28 : 14, height: 3, background: done || active ? HERITAGE : 'rgba(10,10,11,0.12)' }}/>;
      })}
    </div>
  );
}

function StepCrumb({ idx = 2, total = 4, label = '원재료 정보' }) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 10.5, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: HERITAGE }}>
      <span style={{ display: 'inline-block', width: 18, height: 1, background: HERITAGE }}/>
      <span style={{ whiteSpace: 'nowrap', fontFamily: FONT_EN, fontWeight: 600 }}>STEP {pad(idx)} / {pad(total)}</span>
      <span style={{ color: MUTED, fontSize: 9 }}>·</span>
      <span style={{ color: INK, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: FONT_KR, letterSpacing: '0.04em' }}>{label}</span>
    </div>
  );
}

function PageHeader({ device }) {
  const isDesktop = device === 'desktop';
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isDesktop ? '20px 56px 18px' : '14px 20px 12px',
      borderBottom: `1px solid ${HAIRLINE_SOFT}`,
      background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(18px) saturate(160%)',
      WebkitBackdropFilter: 'blur(18px) saturate(160%)', flexShrink: 0,
    }}>
      {isDesktop ? <KrkLogo size={15} /> : (
        <button aria-label="뒤로" style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 5L7.5 10L12.5 15" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      <StepProgress idx={2} total={4} />
      {isDesktop ? (
        <div style={{ fontSize: 11, fontFamily: FONT_EN, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>krk.team/new — Step 2 / 4</div>
      ) : <KrkLogo size={12} />}
    </header>
  );
}

function FooterActions({ device, canGoNext = true }) {
  const isDesktop = device === 'desktop';
  return (
    <footer style={{
      borderTop: `1px solid ${HAIRLINE_SOFT}`, background: CARD,
      padding: isDesktop ? '16px 56px' : '14px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, flexShrink: 0, flexWrap: !isDesktop ? 'wrap-reverse' : 'nowrap',
    }}>
      <button type="button" style={{
        padding: isDesktop ? '13px 22px' : '12px 18px', background: 'transparent', color: INK,
        border: `1px solid ${HAIRLINE}`, fontFamily: FONT_KR, fontSize: 13, fontWeight: 500,
        letterSpacing: '-0.005em', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M9 6H3M5 3L2 6l3 3" stroke={INK} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        이전 단계
      </button>
      <button type="button" style={{
        padding: isDesktop ? '13px 24px' : '13px 22px', background: BREATH,
        color: '#fff', border: 'none', fontFamily: FONT_KR, fontSize: 13, fontWeight: 600,
        letterSpacing: '-0.005em', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
        width: !isDesktop ? '100%' : 'auto', justifyContent: 'center',
      }}>
        다음 — 영양성분
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </footer>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
      color: 'rgba(10,10,11,0.55)', textTransform: 'uppercase',
      fontFamily: FONT_EN,
    }}>{children}</div>
  );
}

// ─── Packaging Chip ──────────────────────────────────────────
function PackagingChip({ name, selected }) {
  return (
    <button type="button" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '6px 11px',
      background: selected ? 'rgba(0,45,114,0.06)' : '#fff',
      border: `1px solid ${selected ? HERITAGE : HAIRLINE}`,
      color: selected ? HERITAGE : 'rgba(10,10,11,0.55)',
      fontFamily: FONT_KR, fontSize: 11.5, fontWeight: selected ? 600 : 500,
      letterSpacing: '-0.005em', cursor: 'pointer', whiteSpace: 'nowrap',
    }}>
      {selected ? (
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
          <path d="M3 7.5L5.5 10L11 4.5" stroke={HERITAGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : null}
      {name}
    </button>
  );
}

function PackagingSection({ packaging, device }) {
  const isDesktop = device === 'desktop';
  return (
    <section style={{ background: CARD, border: `1px solid ${HAIRLINE_SOFT}`, padding: isDesktop ? 22 : 18 }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em' }}>포장재 재질</h2>
        <p style={{ margin: '4px 0 0', fontSize: 11.5, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.5 }}>
          선택한 재질에 맞는 분리배출 마크를 자동으로 제공합니다 (환경부 공식 도안). 해당하는 것 모두 선택.
        </p>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, fontFamily: FONT_EN, marginBottom: 7 }}>플라스틱</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {PACKAGING_PLASTIC.map((m) => <PackagingChip key={m} name={m} selected={packaging.includes(m)} />)}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, fontFamily: FONT_EN, marginBottom: 7 }}>기타 재질</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {PACKAGING_OTHER.map((m) => <PackagingChip key={m} name={m} selected={packaging.includes(m)} />)}
        </div>
      </div>
      <div style={{
        marginTop: 14, paddingTop: 12, borderTop: `1px solid ${HAIRLINE_SOFT}`,
        fontSize: 11.5, letterSpacing: '-0.005em', lineHeight: 1.5,
      }}>
        {packaging.length > 0 ? (
          <span style={{ color: HERITAGE }}>선택됨: <b style={{ fontWeight: 600 }}>{packaging.join(', ')}</b></span>
        ) : (
          <span style={{ color: SYS_WARN, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1.5L11 10.5H1L6 1.5Z" stroke={SYS_WARN} strokeWidth="1.3" fill="none"/><path d="M6 5v2.5" stroke={SYS_WARN} strokeWidth="1.3" strokeLinecap="round"/></svg>
            포장재를 선택하지 않으면 R15 분리배출 마크 검토 <b style={{ fontWeight: 600 }}>(과태료 최대 300만원)</b>를 건너뜁니다.
          </span>
        )}
      </div>
    </section>
  );
}

// ─── Autocomplete banner ─────────────────────────────────────
function AutocompleteBanner({ category = '잼류' }) {
  return (
    <div style={{
      background: 'rgba(10,10,11,0.03)', border: `1px solid ${HAIRLINE_SOFT}`,
      padding: '11px 14px', fontSize: 12, letterSpacing: '-0.005em',
      display: 'flex', alignItems: 'center', gap: 8, color: FAINT,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={HERITAGE} strokeWidth="1.2"/><path d="M7 4v3.5M7 9.5v0.5" stroke={HERITAGE} strokeWidth="1.2" strokeLinecap="round"/></svg>
      원재료명 입력 시 <b style={{ color: INK, fontWeight: 600 }}>{category}</b> 원재료를 자동완성으로 제안합니다.
    </div>
  );
}

// ─── Allergen / Composite banners ────────────────────────────
function AllergenBanner({ detected }) {
  if (!detected || detected.length === 0) {
    return (
      <div style={{
        background: 'rgba(12,164,249,0.05)', border: `1px solid rgba(12,164,249,0.25)`,
        borderLeft: `3px solid ${BREATH}`, padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 5" stroke={HERITAGE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: HERITAGE, letterSpacing: '-0.005em' }}>알레르기 유발물질 없음</span>
      </div>
    );
  }
  return (
    <div style={{
      background: '#FFF8F8', border: `1px solid ${ERROR_LN}`, borderLeft: `3px solid ${ERROR}`,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 13, lineHeight: 1 }}>⚠️</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: ERROR, letterSpacing: '-0.005em' }}>알레르기 유발 물질 감지됨</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: INK, letterSpacing: '-0.01em', marginBottom: 4 }}>
        {detected.join(' · ')}
      </div>
      <div style={{ fontSize: 11.5, color: FAINT, lineHeight: 1.5, letterSpacing: '-0.005em' }}>
        식품등의 표시기준 제3조 4항-사. 후면 라벨에 강조 표기됩니다.
      </div>
    </div>
  );
}

function CompositeBanner({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{
      background: 'rgba(0,45,114,0.03)', border: `1px solid rgba(0,45,114,0.25)`,
      borderLeft: `3px solid ${HERITAGE}`, padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, lineHeight: 1 }}>📋</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: HERITAGE, letterSpacing: '-0.005em' }}>복합원재료 표시 필요</span>
      </div>
      {items.map((it, i) => (
        <div key={i} style={{ paddingLeft: 22, marginTop: i === 0 ? 0 : 8 }}>
          <div style={{ fontSize: 13, color: INK, letterSpacing: '-0.005em' }}>
            <b style={{ fontWeight: 600 }}>{it}</b> → 구성 원재료를 괄호로 표시하세요
          </div>
          <div style={{ fontSize: 11, color: FAINT, marginTop: 3, letterSpacing: '-0.005em' }}>
            예: {it}(설탕, 향신료, 효모 등) 8%
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Warnings (total exceeded / sort error) ──────────────────
function TotalWeightError({ totalIngredients, productWeight }) {
  return (
    <div style={{
      background: ERROR_BG, border: `1px solid ${ERROR_LN}`, borderLeft: `3px solid ${ERROR}`,
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 12.5, lineHeight: 1.55, letterSpacing: '-0.005em',
    }}>
      <span style={{ fontSize: 13 }}>⚠️</span>
      <span>
        원재료 합계 <b style={{ fontFamily: FONT_EN, fontWeight: 600 }}>{totalIngredients}g</b>이 제품 내용량 <b style={{ fontFamily: FONT_EN, fontWeight: 600 }}>{productWeight}g</b>을 초과합니다. 중량을 다시 확인해주세요.
      </span>
    </div>
  );
}

function SortOrderWarning() {
  return (
    <div style={{
      background: SYS_WARN_BG, border: `1px solid ${SYS_WARN_LN}`, borderLeft: `3px solid ${SYS_WARN}`,
      padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      fontSize: 12.5, lineHeight: 1.55, letterSpacing: '-0.005em', flexWrap: 'wrap',
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13 }}>⚠️</span>
        원재료는 함량이 많은 순서대로 표기해야 합니다.
      </span>
      <button type="button" style={{
        background: 'transparent', border: 'none', padding: 0,
        color: SYS_WARN, fontFamily: FONT_KR, fontSize: 12, fontWeight: 600,
        letterSpacing: '-0.005em', cursor: 'pointer', textDecoration: 'underline',
        textUnderlineOffset: 2, display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L5 2.5L7 4.5M5 2.5V9M9 7.5L7 9.5L5 7.5M7 9.5V3" stroke={SYS_WARN} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        자동 정렬
      </button>
    </div>
  );
}

// ─── Summary bar ─────────────────────────────────────────────
function SummaryBar({ items }) {
  const totalW = items.reduce((s, i) => s + (i.weight || 0), 0);
  const allergens = items.filter((i) => i.isAllergen).length;
  const composites = items.filter((i) => i.isComposite).length;
  return (
    <div style={{
      background: 'rgba(10,10,11,0.02)', border: `1px solid ${HAIRLINE_SOFT}`,
      padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
    }}>
      <SummaryCell label="총 중량" value={`${totalW} g`} mono />
      <SummaryCell label="알레르기" value={allergens > 0 ? `${allergens}개` : '없음'} color={allergens > 0 ? ERROR : MUTED} />
      <SummaryCell label="복합원재료" value={composites > 0 ? `${composites}개` : '없음'} color={composites > 0 ? SYS_WARN : MUTED} />
    </div>
  );
}

function SummaryCell({ label, value, mono, color }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, fontFamily: FONT_EN, marginBottom: 5 }}>{label}</div>
      <div style={{
        fontSize: 20, fontWeight: 700, color: color || INK, letterSpacing: '-0.01em',
        fontFamily: mono ? FONT_EN : FONT_KR, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
      }}>{value}</div>
    </div>
  );
}

// ─── AddButton ───────────────────────────────────────────────
function AddIngredientButton({ device, fullWidth }) {
  return (
    <button type="button" style={{
      width: fullWidth ? '100%' : 'auto',
      minHeight: 44, padding: '11px 16px',
      background: 'transparent', border: `1px dashed ${HAIRLINE}`,
      color: HERITAGE, fontFamily: FONT_KR, fontSize: 13, fontWeight: 500,
      letterSpacing: '-0.005em', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke={HERITAGE} strokeWidth="1.5" strokeLinecap="round"/></svg>
      원재료 추가
    </button>
  );
}

// ─── Autocomplete dropdown (only in 'autocomplete' mode) ─────
function AutocompleteDropdown() {
  return (
    <div style={{
      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
      background: CARD, border: `1px solid ${HAIRLINE}`, marginTop: 2,
      boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
      maxHeight: 200, overflow: 'auto',
    }}>
      {AUTOCOMPLETE_SUGGESTIONS.map((s, i) => (
        <div key={s} style={{
          padding: '9px 12px', fontSize: 12, letterSpacing: '-0.005em',
          background: i === 0 ? INK : '#fff', color: i === 0 ? '#fff' : INK, cursor: 'pointer',
        }}>{s}</div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// VARIATION A — 6-col Table (브리프 충실)
// ═════════════════════════════════════════════════════════════
function IngredientTable({ items, totalForRatio, showAutocomplete }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${HAIRLINE_SOFT}`, overflow: 'visible' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 88px 64px 68px 76px 32px',
        background: 'rgba(10,10,11,0.03)', borderBottom: `1px solid ${HAIRLINE_SOFT}`,
      }}>
        {['원재료명', '중량(g)', '비율', '알레르기', '복합원재료', ''].map((h, i) => (
          <div key={i} style={{
            padding: '10px 10px', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em',
            color: MUTED, fontFamily: FONT_EN, textTransform: 'uppercase',
            textAlign: i === 0 ? 'left' : 'center',
          }}>{h}</div>
        ))}
      </div>
      {items.length === 0 ? (
        <div style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: FAINT, letterSpacing: '-0.005em' }}>
          아래 버튼으로 원재료를 추가하세요.
        </div>
      ) : items.map((it, idx) => {
        const ratio = totalForRatio > 0 ? Math.round((it.weight / totalForRatio) * 1000) / 10 : 0;
        const showDropdown = showAutocomplete && idx === items.length - 1;
        return (
          <div key={it.id} style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) 88px 64px 68px 76px 32px',
            borderBottom: idx === items.length - 1 ? 'none' : `1px solid ${HAIRLINE_SOFT}`,
            background: idx % 2 === 1 ? 'rgba(10,10,11,0.015)' : 'transparent',
            alignItems: 'center',
          }}>
            <div style={{ position: 'relative', padding: '8px 10px' }}>
              <input type="text" defaultValue={it.name} style={{
                width: '100%', padding: '7px 10px', border: `1px solid ${showDropdown ? BREATH : HAIRLINE}`,
                background: '#fff', fontFamily: FONT_KR, fontSize: 12.5, color: INK,
                letterSpacing: '-0.005em', boxSizing: 'border-box',
                outline: showDropdown ? `2px solid rgba(12,164,249,0.18)` : 'none',
              }}/>
              {showDropdown ? <AutocompleteDropdown /> : null}
            </div>
            <div style={{ padding: '8px 10px' }}>
              <input type="text" defaultValue={it.weight} style={{
                width: '100%', padding: '7px 8px', border: `1px solid ${HAIRLINE}`, background: '#fff',
                fontFamily: FONT_EN, fontSize: 12.5, textAlign: 'right', color: INK, fontVariantNumeric: 'tabular-nums', boxSizing: 'border-box',
              }}/>
            </div>
            <div style={{ padding: '8px 6px', fontFamily: FONT_EN, fontSize: 12.5, color: MUTED, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
              {ratio.toFixed(1)}%
            </div>
            <div style={{ padding: '8px 6px', textAlign: 'center' }}>
              <CheckCell checked={it.isAllergen} color={ERROR} />
            </div>
            <div style={{ padding: '8px 6px', textAlign: 'center' }}>
              <CheckCell checked={it.isComposite} color={SYS_WARN} />
            </div>
            <div style={{ padding: '8px 6px', textAlign: 'center' }}>
              <button type="button" style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer' }}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M3 4H11M5 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M4.5 4l0.5 7h4l0.5-7" stroke={MUTED} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CheckCell({ checked, color }) {
  return (
    <span style={{
      display: 'inline-flex', width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
      background: checked ? color : 'transparent', border: `1px solid ${checked ? color : 'rgba(10,10,11,0.25)'}`,
    }}>
      {checked ? (
        <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
          <path d="M3 7.5L5.5 10L11 4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="square"/>
        </svg>
      ) : null}
    </span>
  );
}

function VariationA({ items, packaging, mode, device }) {
  const isDesktop = device === 'desktop';
  const xPad = isDesktop ? 56 : 20;
  const totalW = items.reduce((s, i) => s + (i.weight || 0), 0);
  const exceeded = totalW > TOTAL_WEIGHT;
  const sortedDesc = [...items].sort((a, b) => b.weight - a.weight);
  const sortError = items.length >= 2 && items.some((it, i) => it.weight !== sortedDesc[i].weight);
  const detected = items.filter((i) => i.isAllergen).map((i) => i.name);
  const composites = items.filter((i) => i.isComposite).map((i) => i.name);

  return (
    <div style={{ flex: 1, overflow: 'auto', background: SURFACE }}>
      <div style={{
        padding: `${isDesktop ? 28 : 22}px ${xPad}px ${isDesktop ? 28 : 20}px`,
        maxWidth: isDesktop ? 980 : '100%', margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: isDesktop ? 20 : 18,
      }}>
        <div>
          <StepCrumb idx={2} total={4} label="원재료 정보" />
          <h1 style={{ margin: '10px 0 6px', fontSize: isDesktop ? 26 : 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
            원재료를 입력해주세요
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55 }}>
            라벨 후면에 표시될 원재료와 포장재 재질을 입력합니다.
          </p>
        </div>

        <PackagingSection packaging={packaging} device={device} />
        <AutocompleteBanner category="잼류" />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <SectionLabel>원재료 · Ingredients</SectionLabel>
            <span style={{ fontSize: 11, color: MUTED, letterSpacing: '-0.005em' }}>
              내용량 <b style={{ color: INK, fontWeight: 600, fontFamily: FONT_EN }}>{TOTAL_WEIGHT}g</b> 기준
            </span>
          </div>
          <IngredientTable items={items} totalForRatio={totalW} showAutocomplete={mode === 'autocomplete'} />
          {exceeded ? <div style={{ marginTop: 10 }}><TotalWeightError totalIngredients={totalW} productWeight={TOTAL_WEIGHT} /></div> : null}
          {sortError ? <div style={{ marginTop: 10 }}><SortOrderWarning /></div> : null}
          <div style={{ marginTop: 12 }}><AddIngredientButton device={device} fullWidth={!isDesktop} /></div>
        </div>

        {items.length > 0 ? <SummaryBar items={items} /> : null}
        {items.length > 0 ? <AllergenBanner detected={detected} /> : null}
        {composites.length > 0 ? <CompositeBanner items={composites} /> : null}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// VARIATION B — Card Stack (모바일 친화, 인라인 자동 감지 태그)
// ═════════════════════════════════════════════════════════════
function IngredientCard({ item, ratio, idx, showDropdown }) {
  return (
    <div style={{
      background: CARD, border: `1px solid ${HAIRLINE_SOFT}`,
      padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10, position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontFamily: FONT_EN, fontSize: 10, fontWeight: 600, color: MUTED,
          letterSpacing: '0.1em', minWidth: 22,
        }}>0{idx + 1}</span>
        <div style={{ flex: 1, position: 'relative' }}>
          <input type="text" defaultValue={item.name} style={{
            width: '100%', padding: '8px 12px',
            border: `1px solid ${showDropdown ? BREATH : HAIRLINE}`,
            background: '#fff', fontFamily: FONT_KR, fontSize: 13.5, fontWeight: 500,
            color: INK, letterSpacing: '-0.005em', boxSizing: 'border-box',
            outline: showDropdown ? `2px solid rgba(12,164,249,0.18)` : 'none',
          }}/>
          {showDropdown ? <AutocompleteDropdown /> : null}
        </div>
        <button type="button" style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 4H11M5 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M4.5 4l0.5 7h4l0.5-7" stroke={MUTED} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: FONT_EN }}>중량</span>
          <input type="text" defaultValue={item.weight} style={{
            width: 72, padding: '5px 8px', border: `1px solid ${HAIRLINE}`,
            background: '#fff', fontFamily: FONT_EN, fontSize: 12.5, textAlign: 'right',
            color: INK, fontVariantNumeric: 'tabular-nums', boxSizing: 'border-box',
          }}/>
          <span style={{ fontSize: 12, color: FAINT, fontFamily: FONT_EN }}>g</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: FONT_EN }}>비율</span>
          <span style={{ fontFamily: FONT_EN, fontSize: 13, color: INK, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {ratio.toFixed(1)}%
          </span>
        </div>
        <div style={{ flex: 1 }}/>
        {item.isAllergen ? <AutoDetectTag color={ERROR} bg="#FFF8F8">알레르기</AutoDetectTag> : null}
        {item.isComposite ? <AutoDetectTag color={SYS_WARN} bg={SYS_WARN_BG}>복합원재료</AutoDetectTag> : null}
      </div>
    </div>
  );
}

function AutoDetectTag({ color, bg, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', background: bg, border: `1px solid ${color}`, color,
      fontFamily: FONT_KR, fontSize: 11, fontWeight: 600, letterSpacing: '-0.005em',
    }}>
      <span style={{ width: 5, height: 5, background: color }}/>
      {children}
      <span style={{ fontSize: 9, color, opacity: 0.7, marginLeft: 2, fontFamily: FONT_EN, fontWeight: 500 }}>AUTO</span>
    </span>
  );
}

function VariationB({ items, packaging, mode, device }) {
  const isDesktop = device === 'desktop';
  const xPad = isDesktop ? 56 : 20;
  const totalW = items.reduce((s, i) => s + (i.weight || 0), 0);
  const exceeded = totalW > TOTAL_WEIGHT;
  const sortedDesc = [...items].sort((a, b) => b.weight - a.weight);
  const sortError = items.length >= 2 && items.some((it, i) => it.weight !== sortedDesc[i].weight);
  const detected = items.filter((i) => i.isAllergen).map((i) => i.name);
  const composites = items.filter((i) => i.isComposite).map((i) => i.name);

  return (
    <div style={{ flex: 1, overflow: 'auto', background: SURFACE }}>
      <div style={{
        padding: `${isDesktop ? 28 : 22}px ${xPad}px ${isDesktop ? 28 : 20}px`,
        maxWidth: isDesktop ? 720 : '100%', margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: isDesktop ? 18 : 16,
      }}>
        <div>
          <StepCrumb idx={2} total={4} label="원재료 정보" />
          <h1 style={{ margin: '10px 0 6px', fontSize: isDesktop ? 26 : 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
            원재료를 입력해주세요
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55 }}>
            라벨 후면에 표시될 원재료와 포장재 재질을 입력합니다.
          </p>
        </div>

        <PackagingSection packaging={packaging} device={device} />
        <AutocompleteBanner category="잼류" />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <SectionLabel>원재료 · Ingredients ({String(items.length).padStart(2, '0')})</SectionLabel>
            <span style={{ fontSize: 11, color: MUTED, letterSpacing: '-0.005em' }}>
              내용량 <b style={{ color: INK, fontWeight: 600, fontFamily: FONT_EN }}>{TOTAL_WEIGHT}g</b> 기준
            </span>
          </div>

          {items.length === 0 ? (
            <div style={{
              padding: '48px 16px', textAlign: 'center', fontSize: 13, color: FAINT,
              border: `1px dashed ${HAIRLINE}`, background: CARD,
            }}>
              아래 버튼으로 원재료를 추가하세요.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((it, idx) => (
                <IngredientCard
                  key={it.id} item={it} idx={idx}
                  ratio={totalW > 0 ? Math.round((it.weight / totalW) * 1000) / 10 : 0}
                  showDropdown={mode === 'autocomplete' && idx === items.length - 1}
                />
              ))}
            </div>
          )}

          {exceeded ? <div style={{ marginTop: 10 }}><TotalWeightError totalIngredients={totalW} productWeight={TOTAL_WEIGHT} /></div> : null}
          {sortError ? <div style={{ marginTop: 10 }}><SortOrderWarning /></div> : null}

          <div style={{ marginTop: 10 }}><AddIngredientButton device={device} fullWidth={true} /></div>
        </div>

        {items.length > 0 ? <SummaryBar items={items} /> : null}
        {items.length > 0 ? <AllergenBanner detected={detected} /> : null}
        {composites.length > 0 ? <CompositeBanner items={composites} /> : null}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Step2Ingredients — main composition
// ═════════════════════════════════════════════════════════════
function Step2Ingredients({ variation = 'A', mode = 'filled', device = 'desktop' }) {
  const { items, packaging } = useMemo(() => presetFor(mode), [mode]);
  return (
    <div style={{
      width: '100%', height: '100%', background: SURFACE,
      fontFamily: FONT_KR, color: INK,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      wordBreak: 'keep-all', overflowWrap: 'break-word',
    }}>
      <PageHeader device={device} />
      {variation === 'A'
        ? <VariationA items={items} packaging={packaging} mode={mode} device={device} />
        : <VariationB items={items} packaging={packaging} mode={mode} device={device} />}
      <FooterActions device={device} canGoNext={true} />
    </div>
  );
}

Object.assign(window, { Step2Ingredients });
