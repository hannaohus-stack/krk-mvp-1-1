/* global React */
// step3-nutrition.jsx — Step 3 · 영양성분 입력
//
// Props:
//   variation : 'A' | 'B'      (A = 3-mode + 모달 / B = inline 진단)
//   mode      : 'choose' | 'input-empty' | 'input-filled' | 'exempted' |
//               'modal-empty' | 'modal-pass' | 'modal-fail'
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
const SYS_OK_BG    = '#F0FDF4';
const SYS_OK_LN    = 'rgba(31,138,91,0.3)';
const SYS_WARN     = '#B07A1A';
const SYS_WARN_BG  = '#FFF8E1';
const SYS_WARN_LN  = 'rgba(176,122,26,0.3)';
const ERROR        = '#B30000';
const ERROR_BG     = '#FFF5F5';

const FONT_KR = 'Pretendard, "Pretendard Variable", system-ui, -apple-system, sans-serif';
const FONT_EN = 'Inter, system-ui, sans-serif';

// ─── Exemption criteria ──────────────────────────────────────
const EXEMPTION_QUESTIONS = [
  { q: '연 매출액이 1억 원 미만인가요?',                    law: '식품등의 표시기준 제5조 1항' },
  { q: '종업원 수가 50인 미만인가요?',                      law: '식품등의 표시기준 제5조 1항' },
  { q: '제품에 영양강조표시(저칼로리·무가당 등)가 없나요?', law: '식품등의 표시기준 제5조 2항' },
  { q: '건강기능식품 또는 특수영양식품이 아닌가요?',         law: '식품등의 표시기준 제5조 3항' },
];

// ─── Nutrition fields ────────────────────────────────────────
const NUTRITION_FIELDS = [
  { key: 'calories',   label: '열량',     unit: 'kcal', main: true },
  { key: 'totalCarbs', label: '탄수화물', unit: 'g' },
  { key: 'sugar',      label: '당류',     unit: 'g', indent: true },
  { key: 'protein',    label: '단백질',   unit: 'g' },
  { key: 'totalFat',   label: '지방',     unit: 'g' },
  { key: 'sodium',     label: '나트륨',   unit: 'mg' },
];

const SAMPLE_FILLED = {
  servingSize: 30, servingUnit: 'g',
  calories: 92, totalCarbs: 22, sugar: 20, protein: 0.2, totalFat: 0.1, sodium: 4,
};
const SAMPLE_EMPTY = { servingSize: '', servingUnit: 'g' };

// ─── Atoms ──────────────────────────────────────────────────
function KrkLogo({ size = 14 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, lineHeight: 1 }}>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color: INK, letterSpacing: '0.22em', textTransform: 'uppercase' }}>KRK CHECKER</span>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color: BREATH, marginLeft: '0.18em' }}>·</span>
    </div>
  );
}

function StepProgress({ idx = 3, total = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i + 1 === idx, done = i + 1 < idx;
        return <div key={i} style={{ width: active ? 28 : 14, height: 3, background: done || active ? HERITAGE : 'rgba(10,10,11,0.12)' }}/>;
      })}
    </div>
  );
}

function StepCrumb({ idx = 3, total = 4, label = '영양성분' }) {
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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 5L7.5 10L12.5 15" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
      <StepProgress idx={3} total={4} />
      {isDesktop ? (
        <div style={{ fontSize: 11, fontFamily: FONT_EN, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>krk.team/new — Step 3 / 4</div>
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
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0,
      flexWrap: !isDesktop ? 'wrap-reverse' : 'nowrap',
    }}>
      <button type="button" style={{
        padding: isDesktop ? '13px 22px' : '12px 18px', background: 'transparent', color: INK,
        border: `1px solid ${HAIRLINE}`, fontFamily: FONT_KR, fontSize: 13, fontWeight: 500,
        letterSpacing: '-0.005em', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 6H3M5 3L2 6l3 3" stroke={INK} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        이전 단계
      </button>
      <button type="button" disabled={!canGoNext} style={{
        padding: isDesktop ? '13px 24px' : '13px 22px',
        background: canGoNext ? BREATH : 'rgba(10,10,11,0.18)',
        color: '#fff', border: 'none', fontFamily: FONT_KR, fontSize: 13, fontWeight: 600,
        letterSpacing: '-0.005em', cursor: canGoNext ? 'pointer' : 'not-allowed',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        width: !isDesktop ? '100%' : 'auto', justifyContent: 'center',
      }}>
        다음 — 라벨 미리보기
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </footer>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'rgba(10,10,11,0.55)', textTransform: 'uppercase', fontFamily: FONT_EN }}>{children}</div>;
}

// ─── Initial choice banner (choose mode) ─────────────────────
function ChooseBanner({ device }) {
  const isDesktop = device === 'desktop';
  return (
    <div style={{
      background: SYS_WARN_BG, border: `1px solid ${SYS_WARN_LN}`, borderLeft: `3px solid ${SYS_WARN}`,
      padding: isDesktop ? '20px 22px' : '18px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M6 6L4.5 4.5M19.5 19.5L18 18M6 18l-1.5 1.5M19.5 4.5L18 6M16 12a4 4 0 0 0-8 0c0 2 1 3 2 4v2h4v-2c1-1 2-2 2-4Z" stroke={SYS_WARN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: INK, letterSpacing: '-0.005em' }}>
              소규모 사업자는 영양성분 표시가 면제될 수 있습니다.
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55 }}>
            식품등의 표시기준 제5조 — 4개 질문으로 면제 대상 여부를 빠르게 확인할 수 있어요.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <button type="button" style={{
            padding: '11px 16px', background: '#fff', color: INK, border: `1px solid ${HAIRLINE}`,
            fontFamily: FONT_KR, fontSize: 12.5, fontWeight: 500, letterSpacing: '-0.005em', cursor: 'pointer',
          }}>면제 대상 확인하기</button>
          <button type="button" style={{
            padding: '11px 16px', background: HERITAGE, color: '#fff', border: 'none',
            fontFamily: FONT_KR, fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.005em', cursor: 'pointer',
          }}>직접 입력하기</button>
        </div>
      </div>
    </div>
  );
}

// ─── Exempted banner ─────────────────────────────────────────
function ExemptedBanner() {
  return (
    <div style={{
      background: SYS_OK_BG, border: `1px solid ${SYS_OK_LN}`, borderLeft: `4px solid ${SYS_OK}`,
      padding: '20px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={SYS_OK} strokeWidth="1.6"/>
          <path d="M7 12.5L10.5 16L17 9" stroke={SYS_OK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 600, color: SYS_OK, letterSpacing: '-0.005em' }}>
          소규모 제조업 면제 적용
        </span>
      </div>
      <p style={{ margin: '0 0 10px', fontSize: 12.5, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55 }}>
        식품등의 표시기준 제5조에 따라 영양성분 표시가 면제됩니다. 최종 판단은 관할 지자체 또는 식약처에 문의하세요.
      </p>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <button type="button" style={{
          background: 'transparent', border: 'none', padding: 0,
          color: FAINT, fontFamily: FONT_KR, fontSize: 11.5, fontWeight: 500,
          letterSpacing: '-0.005em', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2,
        }}>다시 진단하기</button>
        <button type="button" style={{
          background: 'transparent', border: 'none', padding: 0,
          color: FAINT, fontFamily: FONT_KR, fontSize: 11.5, fontWeight: 500,
          letterSpacing: '-0.005em', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2,
        }}>직접 입력하기</button>
      </div>
    </div>
  );
}

// ─── Nutrition input form ────────────────────────────────────
function NutritionTable({ data, device }) {
  const sz = data.servingSize || '';
  return (
    <div style={{ background: CARD, border: `1px solid ${HAIRLINE_SOFT}` }}>
      <div style={{ background: INK, color: '#fff', padding: '12px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em' }}>영양성분표</div>
        {sz ? (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3, fontFamily: FONT_EN }}>
            1회 <span style={{ color: '#fff', fontWeight: 500 }}>{sz}{data.servingUnit}</span> 기준
          </div>
        ) : null}
      </div>
      {NUTRITION_FIELDS.map((f, i) => {
        const isMain = f.main;
        const isIndent = f.indent;
        const val = data[f.key] ?? '';
        return (
          <div key={f.key} style={{
            display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto',
            alignItems: 'center', gap: 10,
            padding: isMain ? '14px 16px' : '10px 16px',
            borderBottom: isMain ? `2px solid ${INK}` : (i === NUTRITION_FIELDS.length - 1 ? 'none' : `1px solid ${HAIRLINE_SOFT}`),
            background: i % 2 === 0 ? 'rgba(10,10,11,0.015)' : 'transparent',
          }}>
            <span style={{
              paddingLeft: isIndent ? 26 : 0, fontSize: isMain ? 14 : 13,
              fontWeight: isMain ? 700 : (isIndent ? 400 : 500),
              color: isIndent ? FAINT : INK, letterSpacing: '-0.005em',
              display: 'flex', alignItems: 'center', gap: isIndent ? 6 : 0,
            }}>
              {isIndent ? <span style={{ color: FAINT, fontSize: 10 }}>└</span> : null}
              {f.label}
            </span>
            <input type="text" defaultValue={val} placeholder="0" style={{
              width: isMain ? 100 : 88, padding: '6px 10px',
              border: `1px solid ${HAIRLINE}`, background: '#fff',
              fontFamily: FONT_EN, fontSize: isMain ? 14 : 12.5, fontWeight: isMain ? 600 : 500,
              textAlign: 'right', color: INK, fontVariantNumeric: 'tabular-nums', boxSizing: 'border-box',
            }}/>
            <span style={{ fontFamily: FONT_EN, fontSize: 11, color: FAINT, minWidth: 24, textAlign: 'left' }}>
              {f.unit}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function InputForm({ data, device, onExemptLink }) {
  const isDesktop = device === 'desktop';
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <SectionLabel>영양성분 직접 입력</SectionLabel>
        <button type="button" style={{
          padding: '7px 12px', background: '#fff', border: `1px solid ${HAIRLINE}`,
          color: FAINT, fontFamily: FONT_KR, fontSize: 11.5, fontWeight: 500, letterSpacing: '-0.005em',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          🚀 자동 계산 — Coming Soon
        </button>
      </div>

      {/* 1회 제공량 */}
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, fontFamily: FONT_EN, marginBottom: 6 }}>
          1회 제공량
        </div>
        <div style={{ display: 'flex', gap: 8, maxWidth: 220 }}>
          <input type="text" defaultValue={data.servingSize || ''} placeholder="0" style={{
            flex: 1, padding: '9px 12px', border: `1px solid ${HAIRLINE}`,
            background: '#fff', fontFamily: FONT_EN, fontSize: 13, textAlign: 'right',
            color: INK, fontVariantNumeric: 'tabular-nums', boxSizing: 'border-box',
          }}/>
          <div style={{ width: 72, position: 'relative' }}>
            <select defaultValue={data.servingUnit || 'g'} style={{
              width: '100%', padding: '9px 24px 9px 12px', border: `1px solid ${HAIRLINE}`,
              background: '#fff', fontFamily: FONT_KR, fontSize: 13, color: INK,
              appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', boxSizing: 'border-box',
            }}>
              <option value="g">g</option>
              <option value="mL">mL</option>
            </select>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <path d="M1 1l4 4 4-4" stroke={MUTED} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <NutritionTable data={data} device={device} />

      {/* Help box + exempt link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 220, padding: '10px 14px',
          background: 'rgba(10,10,11,0.03)', border: `1px solid ${HAIRLINE_SOFT}`,
          fontSize: 11.5, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55,
        }}>
          숫자만 입력 가능합니다. 수치는 <b style={{ color: INK, fontWeight: 600 }}>공인시험기관 분석 결과</b> 기준으로 입력하세요.
        </div>
        <button type="button" onClick={onExemptLink} style={{
          background: 'transparent', border: 'none', padding: 0, flexShrink: 0,
          color: HERITAGE, fontFamily: FONT_KR, fontSize: 11.5, fontWeight: 500,
          letterSpacing: '-0.005em', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          면제 확인하기
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 6h6M7 3l3 3-3 3" stroke={HERITAGE} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </section>
  );
}

// ─── A안 면제 진단 모달 ─────────────────────────────────────
function ExemptionModal({ stateLevel, device }) {
  // stateLevel: 0 (empty) | 1..N (answered count, last is result)
  // For simplicity: 'empty' shows no answers, 'pass' all yes, 'fail' first answered no
  const answers = stateLevel === 'empty' ? [] :
                  stateLevel === 'pass' ? ['yes', 'yes', 'yes', 'yes'] :
                  stateLevel === 'fail' ? ['yes', 'no', 'yes', 'yes'] : [];
  const allAnswered = answers.length === EXEMPTION_QUESTIONS.length;
  const allYes = allAnswered && answers.every((a) => a === 'yes');
  const isDesktop = device === 'desktop';
  const modalW = isDesktop ? 480 : 340;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30,
      background: 'rgba(10,10,11,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div role="dialog" style={{
        width: '100%', maxWidth: modalW, maxHeight: '90%', overflow: 'auto',
        background: CARD, border: `1px solid ${HAIRLINE}`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          padding: '14px 18px', borderBottom: `1px solid ${HAIRLINE_SOFT}`,
        }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>영양성분 표시 면제 자가진단</h2>
          <button type="button" aria-label="닫기" style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke={MUTED} strokeWidth="1.4" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {EXEMPTION_QUESTIONS.map((q, i) => {
            const ans = answers[i];
            return (
              <div key={i} style={{ paddingBottom: 14, borderBottom: i === EXEMPTION_QUESTIONS.length - 1 ? 'none' : `1px solid ${HAIRLINE_SOFT}` }}>
                <div style={{ fontSize: 13, color: INK, letterSpacing: '-0.005em', lineHeight: 1.6, marginBottom: 4 }}>{q.q}</div>
                <div style={{ fontSize: 11, color: FAINT, letterSpacing: '-0.005em', marginBottom: 10 }}>{q.law}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <YesNoBtn label="예" selected={ans === 'yes'} kind="yes" />
                  <YesNoBtn label="아니오" selected={ans === 'no'} kind="no" />
                </div>
              </div>
            );
          })}

          {/* Result */}
          {allAnswered && allYes ? (
            <div style={{ background: SYS_OK_BG, border: `1px solid ${SYS_OK_LN}`, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8.5L7 11.5L12.5 5.5" stroke={SYS_OK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: SYS_OK, letterSpacing: '-0.005em' }}>면제 대상일 가능성이 높습니다.</span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: 11.5, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55 }}>
                최종 판단은 관할 지자체 또는 식약처에 확인하세요.
              </p>
              <button type="button" style={{
                width: '100%', padding: '11px 14px', background: SYS_OK, color: '#fff',
                border: 'none', fontFamily: FONT_KR, fontSize: 13, fontWeight: 600,
                letterSpacing: '-0.005em', cursor: 'pointer',
              }}>면제 적용하고 다음으로</button>
            </div>
          ) : allAnswered && !allYes ? (
            <div style={{ background: ERROR_BG, border: `1px solid rgba(179,0,0,0.25)`, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13 }}>⚠️</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: ERROR, letterSpacing: '-0.005em' }}>면제 대상이 아닐 수 있습니다.</span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: 11.5, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55 }}>
                영양성분을 직접 입력해주세요.
              </p>
              <button type="button" style={{
                width: '100%', padding: '11px 14px', background: HERITAGE, color: '#fff',
                border: 'none', fontFamily: FONT_KR, fontSize: 13, fontWeight: 600,
                letterSpacing: '-0.005em', cursor: 'pointer',
              }}>직접 입력하기</button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function YesNoBtn({ label, selected, kind }) {
  const isYes = kind === 'yes';
  return (
    <button type="button" style={{
      minHeight: 44, padding: '10px 14px',
      background: selected ? (isYes ? HERITAGE : ERROR) : '#fff',
      color: selected ? '#fff' : FAINT,
      border: `1px solid ${selected ? (isYes ? HERITAGE : ERROR) : HAIRLINE}`,
      fontFamily: FONT_KR, fontSize: 13, fontWeight: selected ? 600 : 500,
      letterSpacing: '-0.005em', cursor: 'pointer',
    }}>{label}</button>
  );
}

// ═════════════════════════════════════════════════════════════
// VARIATION A — 3-mode + 모달 (브리프 충실)
// ═════════════════════════════════════════════════════════════
function VariationA({ mode, device }) {
  const isDesktop = device === 'desktop';
  const xPad = isDesktop ? 56 : 20;
  const modalLevel = mode === 'modal-empty' ? 'empty' : mode === 'modal-pass' ? 'pass' : mode === 'modal-fail' ? 'fail' : null;
  const showInput = mode === 'input-empty' || mode === 'input-filled';
  const showExempt = mode === 'exempted';
  const showChoose = mode === 'choose' || modalLevel;
  const data = mode === 'input-filled' ? SAMPLE_FILLED : SAMPLE_EMPTY;

  return (
    <div style={{ flex: 1, overflow: 'auto', background: SURFACE, position: 'relative' }}>
      <div style={{
        padding: `${isDesktop ? 28 : 22}px ${xPad}px ${isDesktop ? 28 : 20}px`,
        maxWidth: isDesktop ? 820 : '100%', margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: isDesktop ? 22 : 18,
      }}>
        <div>
          <StepCrumb idx={3} total={4} label="영양성분" />
          <h1 style={{ margin: '10px 0 6px', fontSize: isDesktop ? 26 : 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
            영양성분을 입력하거나 면제 여부를 확인해주세요
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55 }}>
            소규모 사업자는 식품등의 표시기준 제5조에 의해 영양성분 표시 면제가 가능합니다.
          </p>
        </div>

        {showChoose ? <ChooseBanner device={device} /> : null}
        {showExempt ? <ExemptedBanner /> : null}
        {showInput ? <InputForm data={data} device={device} /> : null}
      </div>

      {modalLevel ? <ExemptionModal stateLevel={modalLevel} device={device} /> : null}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// VARIATION B — Inline 진단 (모달 없이 collapsible)
// ═════════════════════════════════════════════════════════════
function InlineDiagnosis({ stateLevel, device }) {
  // 'empty' | 'pass' | 'fail' | 'collapsed' | null (not shown)
  const answers = stateLevel === 'empty' ? [] :
                  stateLevel === 'pass' ? ['yes', 'yes', 'yes', 'yes'] :
                  stateLevel === 'fail' ? ['yes', 'no', 'yes', 'yes'] : [];
  const allAnswered = answers.length === EXEMPTION_QUESTIONS.length;
  const allYes = allAnswered && answers.every((a) => a === 'yes');

  if (stateLevel === 'collapsed') {
    return (
      <div style={{
        background: SYS_WARN_BG, border: `1px solid ${SYS_WARN_LN}`, borderLeft: `3px solid ${SYS_WARN}`,
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={SYS_WARN} strokeWidth="1.4"/><path d="M8 5v3.5M8 10.5v0.5" stroke={SYS_WARN} strokeWidth="1.4" strokeLinecap="round"/></svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: INK, letterSpacing: '-0.005em' }}>면제 대상인지 확인하세요</div>
            <div style={{ fontSize: 11.5, color: FAINT, marginTop: 2, letterSpacing: '-0.005em' }}>4개 질문으로 빠르게 진단 — 식품등의 표시기준 제5조</div>
          </div>
        </div>
        <button type="button" style={{
          padding: '8px 14px', background: '#fff', color: SYS_WARN,
          border: `1px solid ${SYS_WARN}`, fontFamily: FONT_KR, fontSize: 12.5, fontWeight: 600,
          letterSpacing: '-0.005em', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          진단 시작
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M4.5 3l3 3-3 3" stroke={SYS_WARN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: CARD, border: `1px solid ${HAIRLINE_SOFT}`, borderLeft: `3px solid ${HERITAGE}` }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', borderBottom: `1px solid ${HAIRLINE_SOFT}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: HERITAGE, fontFamily: FONT_EN }}>
            면제 자가진단
          </span>
          <span style={{ fontFamily: FONT_EN, fontSize: 10.5, color: MUTED }}>
            {answers.length}/{EXEMPTION_QUESTIONS.length}
          </span>
        </div>
        <button type="button" style={{ background: 'transparent', border: 'none', padding: 0, color: FAINT, fontSize: 11.5, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2, fontFamily: FONT_KR }}>
          접기
        </button>
      </div>

      <div style={{ padding: '8px 18px 18px' }}>
        {EXEMPTION_QUESTIONS.map((q, i) => {
          const ans = answers[i];
          return (
            <div key={i} style={{
              padding: '14px 0',
              borderBottom: i === EXEMPTION_QUESTIONS.length - 1 ? 'none' : `1px solid ${HAIRLINE_SOFT}`,
              display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 14, alignItems: 'center',
            }}>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13,
                  color: INK, letterSpacing: '-0.005em', lineHeight: 1.55,
                }}>
                  <span style={{
                    fontFamily: FONT_EN, fontSize: 10, fontWeight: 700, color: MUTED, minWidth: 18,
                  }}>{String(i + 1).padStart(2, '0')}</span>
                  {q.q}
                </div>
                <div style={{ fontSize: 11, color: FAINT, marginTop: 4, letterSpacing: '-0.005em', paddingLeft: 26 }}>{q.law}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <YesNoBtn label="예" selected={ans === 'yes'} kind="yes" />
                <YesNoBtn label="아니오" selected={ans === 'no'} kind="no" />
              </div>
            </div>
          );
        })}

        {allAnswered && allYes ? (
          <div style={{
            marginTop: 16, padding: '14px 16px',
            background: SYS_OK_BG, border: `1px solid ${SYS_OK_LN}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8.5L7 11.5L12.5 5.5" stroke={SYS_OK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: SYS_OK, letterSpacing: '-0.005em' }}>면제 대상일 가능성이 높습니다.</span>
            </div>
            <button type="button" style={{
              padding: '9px 16px', background: SYS_OK, color: '#fff', border: 'none',
              fontFamily: FONT_KR, fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.005em', cursor: 'pointer',
            }}>면제 적용하고 다음으로</button>
          </div>
        ) : allAnswered && !allYes ? (
          <div style={{
            marginTop: 16, padding: '14px 16px',
            background: ERROR_BG, border: `1px solid rgba(179,0,0,0.25)`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13 }}>⚠️</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: ERROR, letterSpacing: '-0.005em' }}>면제 대상이 아닐 수 있어요. 직접 입력이 필요합니다.</span>
            </div>
            <button type="button" style={{
              padding: '9px 16px', background: HERITAGE, color: '#fff', border: 'none',
              fontFamily: FONT_KR, fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.005em', cursor: 'pointer',
            }}>직접 입력하기 ↓</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function VariationB({ mode, device }) {
  const isDesktop = device === 'desktop';
  const xPad = isDesktop ? 56 : 20;
  // mode mapping for B:
  // 'choose' → collapsed inline diagnosis + collapsed input
  // 'input-empty' / 'input-filled' → inline diagnosis (collapsed) + open input
  // 'exempted' → inline diagnosis (pass result) + exempted banner
  // 'modal-empty' / 'modal-pass' / 'modal-fail' → expanded inline diagnosis (no modal needed in B)
  const showInput = mode !== 'choose' && mode !== 'exempted' && !mode.startsWith('modal');
  const data = mode === 'input-filled' ? SAMPLE_FILLED : SAMPLE_EMPTY;

  let diagState = 'collapsed';
  if (mode === 'modal-empty') diagState = 'empty';
  else if (mode === 'modal-pass') diagState = 'pass';
  else if (mode === 'modal-fail') diagState = 'fail';
  else if (mode === 'exempted') diagState = 'pass';

  return (
    <div style={{ flex: 1, overflow: 'auto', background: SURFACE }}>
      <div style={{
        padding: `${isDesktop ? 28 : 22}px ${xPad}px ${isDesktop ? 28 : 20}px`,
        maxWidth: isDesktop ? 820 : '100%', margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: isDesktop ? 22 : 18,
      }}>
        <div>
          <StepCrumb idx={3} total={4} label="영양성분" />
          <h1 style={{ margin: '10px 0 6px', fontSize: isDesktop ? 26 : 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
            영양성분을 입력하거나 면제 여부를 확인해주세요
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55 }}>
            면제 자가진단을 펼쳐 답하거나, 아래에서 영양성분을 바로 입력할 수 있습니다.
          </p>
        </div>

        <InlineDiagnosis stateLevel={diagState} device={device} />

        {mode === 'exempted' ? <ExemptedBanner /> : null}
        {showInput ? <InputForm data={data} device={device} /> : null}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Step3Nutrition — main composition
// ═════════════════════════════════════════════════════════════
function Step3Nutrition({ variation = 'A', mode = 'choose', device = 'desktop' }) {
  const canGoNext = mode === 'input-filled' || mode === 'exempted';
  return (
    <div style={{
      width: '100%', height: '100%', background: SURFACE,
      fontFamily: FONT_KR, color: INK, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      wordBreak: 'keep-all', overflowWrap: 'break-word',
    }}>
      <PageHeader device={device} />
      {variation === 'A'
        ? <VariationA mode={mode} device={device} />
        : <VariationB mode={mode} device={device} />}
      <FooterActions device={device} canGoNext={canGoNext} />
    </div>
  );
}

Object.assign(window, { Step3Nutrition });
