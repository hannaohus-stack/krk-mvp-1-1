/* global React */
// step1-category.jsx — Step 1 / 제품 정보 입력
//
// Props:
//   mode    : 'default' | 'sa-single' | 'sa-multi' | 'b-only' | 'mixed' | 'error'
//   device  : 'desktop' | 'mobile'
//   version : 1 | 2        (default 2; v1 = 초기 디자인, v2 = 개선판)
//
// v2 변경 요약:
//   1. 카테고리 그리드 → flex-wrap + 마지막 행 가운데 정렬 (4-col / 2-col 유지)
//   2. Step 중복 제거 — 상단 progress bar만 유지, 본문 크럼은 "제품 정보"만
//   3. 혼합 Tier 라벨 → "Tier S/A + B · 정식 검토 (혼합)"
//   4. 제품명 필드 default 상태: 포커스 border + 가짜 caret으로 인풋 신호
//   5. 푸터 Tier 프리뷰 empty 상태 강화 (—/— stat block)
//   6. 카테고리 선택 요약 라인 그리드 하단 노출
//   7. Validation 톤 다듬기 — 1px border, 배경 제거
//   8. CTA 카피 → "다음 — 원재료 정보"

const { useState, useMemo } = React;

// ─── Tokens ─────────────────────────────────────────────────
const HERITAGE = '#002D72';
const INK      = '#0A0A0B';
const SURFACE  = '#F4F4F5';
const CARD     = '#fff';
const FAINT    = 'rgba(10,10,11,0.55)';
const MUTED    = 'rgba(10,10,11,0.40)';
const HAIRLINE = 'rgba(10,10,11,0.15)';
const HAIRLINE_SOFT = 'rgba(10,10,11,0.08)';

const SYS_OK   = '#00255E';
const SYS_OK_BG = '#EAF6FE';
const SYS_WARN = '#B07A1A';
const SYS_WARN_BG = 'rgba(176,122,26,0.06)';
const ERROR    = '#B30000';
const ERROR_BG = 'rgba(179,0,0,0.05)';

const FONT_KR = 'Pretendard, "Pretendard Variable", system-ui, -apple-system, sans-serif';
const FONT_EN = 'Inter, system-ui, sans-serif';

// ─── Category data ──────────────────────────────────────────
// v2 정리 — Tier/가격 분기 제거 (service-v2 지침)
const CATEGORIES = [
  '잼류', '소스류', '장류', '떡류',
  '디저트/베이커리', '차/음료', '건강식품(일반)',
];

// ─── Mode presets ───────────────────────────────────────────
function presetFor(mode) {
  switch (mode) {
    case 'default':
      return { productName: '', categories: [], businessType: '', submitted: false };
    case 'sa-single':
      return { productName: '수제 딸기잼', categories: ['잼류'], businessType: '식품제조가공업', submitted: false };
    case 'sa-multi':
      return { productName: '수제 딸기잼 & 라즈베리 소스', categories: ['잼류', '소스류', '떡류'], businessType: '식품제조가공업', submitted: false };
    case 'b-only':
      return { productName: '데일리 비타민C 1000', categories: ['건강식품(일반)'], businessType: '즉판가공업', submitted: false };
    case 'mixed':
      return { productName: '딸기잼 + 비타민C 콜라보 세트', categories: ['잼류', '차/음료'], businessType: '식품제조가공업', submitted: false };
    case 'error':
      return { productName: '', categories: [], businessType: '', submitted: true };
    default:
      return { productName: '', categories: [], businessType: '', submitted: false };
  }
}

// ─── Logo ───────────────────────────────────────────────────
function KrkLogo({ size = 14 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, lineHeight: 1, userSelect: 'none' }}>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color: INK, letterSpacing: '0.22em', textTransform: 'uppercase' }}>KRK CHECKER</span>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color: '#0CA4F9', marginLeft: '0.18em', lineHeight: 1 }}>·</span>
    </div>
  );
}

// ─── Atoms ──────────────────────────────────────────────────
function StepCrumb({ idx = 1, total = 4, label = '제품 정보', showCounter = true }) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      fontSize: 10.5, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: HERITAGE,
    }}>
      <span style={{ display: 'inline-block', width: 18, height: 1, background: HERITAGE }}/>
      {showCounter ? (
        <>
          <span style={{ whiteSpace: 'nowrap', fontFamily: FONT_EN, fontWeight: 600 }}>STEP {pad(idx)} / {pad(total)}</span>
          <span style={{ color: MUTED, fontSize: 9, fontFamily: FONT_KR, fontWeight: 500, letterSpacing: '0.12em' }}>·</span>
        </>
      ) : null}
      <span style={{ color: INK, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: FONT_KR, letterSpacing: '0.04em' }}>{label}</span>
    </div>
  );
}

function StepProgress({ idx = 1, total = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i + 1 === idx;
        const done = i + 1 < idx;
        return (
          <div key={i} style={{
            width: active ? 28 : 14,
            height: 3,
            background: done || active ? HERITAGE : 'rgba(10,10,11,0.12)',
            transition: 'width 0.2s ease',
          }}/>
        );
      })}
    </div>
  );
}

function SectionLabel({ children, required, error }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
      color: error ? ERROR : 'rgba(10,10,11,0.45)',
      textTransform: 'uppercase',
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      <span>{children}</span>
      {required ? <span style={{ color: error ? ERROR : HERITAGE }}>*</span> : null}
    </div>
  );
}

function Badge({ kind, children, size = 'sm' }) {
  const map = {
    ok:   { c: SYS_OK,   bg: SYS_OK_BG,   border: SYS_OK },
    warn: { c: SYS_WARN, bg: SYS_WARN_BG, border: SYS_WARN },
  };
  const s = map[kind];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: size === 'sm' ? '2px 8px' : '3px 10px',
      background: s.bg, border: `1px solid ${s.border}`, color: s.c,
      borderRadius: 999,
      fontSize: size === 'sm' ? 10 : 11, fontWeight: 600, letterSpacing: '0.02em',
      lineHeight: 1.2, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// ─── Product name field ─────────────────────────────────────
function ProductNameField({ value, focused }) {
  const borderColor = focused ? '#0CA4F9' : 'rgba(10,10,11,0.14)';
  const borderWidth = focused ? 1.5 : 1;
  return (
    <div>
      <SectionLabel required>Product Name · 제품명</SectionLabel>
      <div style={{
        marginTop: 8,
        border: `${borderWidth}px solid ${borderColor}`,
        background: CARD,
        padding: focused ? '12.5px 14px' : '13px 14px',
        fontSize: 14,
        color: value ? INK : 'rgba(10,10,11,0.35)',
        letterSpacing: '-0.005em',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}>
        <span>{value || '제품명을 입력해주세요 (예: 수제 딸기잼)'}</span>
        {focused && !value ? (
          <span style={{
            display: 'inline-block',
            width: 1,
            height: 16,
            background: '#0CA4F9',
            marginLeft: 2,
            animation: 'krkspin 0s', // no animation in static
          }}/>
        ) : null}
      </div>
    </div>
  );
}

// ─── Category card ──────────────────────────────────────────
function CategoryCard({ name, selected, width }) {
  return (
    <div
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      style={{
        position: 'relative',
        minHeight: 52,
        padding: '14px 14px 12px 38px',
        background: selected ? INK : CARD,
        color: selected ? '#fff' : INK,
        border: `1px solid ${selected ? INK : HAIRLINE}`,
        cursor: 'pointer',
        fontFamily: FONT_KR,
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: '-0.005em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        userSelect: 'none',
        flex: width ? `0 0 ${width}` : undefined,
        boxSizing: 'border-box',
      }}
    >
      <span style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        width: 16, height: 16,
        background: selected ? '#fff' : 'transparent',
        border: `1px solid ${selected ? '#fff' : 'rgba(10,10,11,0.3)'}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected ? (
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M3 7.5L5.5 10L11 4.5" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : null}
      </span>
      <span style={{ flex: 1 }}>{name}</span>
    </div>
  );
}

// ─── Segmented control ──────────────────────────────────────
function SegmentGroup({ options, value, error, errorWeight = 1 }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      border: `${error ? errorWeight : 1}px solid ${error ? ERROR : HAIRLINE}`,
      background: CARD,
    }}>
      {options.map((opt, i) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            style={{
              padding: '12px 14px',
              background: active ? INK : 'transparent',
              color: active ? '#fff' : INK,
              border: 'none',
              borderLeft: i > 0 ? `1px solid ${HAIRLINE_SOFT}` : 'none',
              fontFamily: FONT_KR, fontSize: 13, fontWeight: active ? 600 : 500,
              letterSpacing: '-0.005em',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <span>{opt.label}</span>
            {opt.tooltip ? (
              <span title={opt.tooltip} aria-label={opt.tooltip} style={{ display: 'inline-flex', opacity: 0.7 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/>
                  <path d="M6 5.5v3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  <circle cx="6" cy="3.6" r="0.6" fill="currentColor"/>
                </svg>
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

// ─── 혼합 경고 배너 ─────────────────────────────────────────
function MixedWarnBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '11px 14px',
      background: SYS_WARN_BG, border: `1px solid ${SYS_WARN}`, borderLeft: `3px solid ${SYS_WARN}`,
      fontSize: 12.5, color: INK, letterSpacing: '-0.005em', lineHeight: 1.5,
    }}>
      <span style={{ fontSize: 13, lineHeight: 1 }}>⚠️</span>
      <span><b style={{ color: SYS_WARN, fontWeight: 600 }}>S/A + B 카테고리 혼합 선택</b> — 정식 검토로 진행되며 <span style={{ fontFamily: FONT_EN, fontWeight: 600 }}>19,900</span>원이 적용됩니다.</span>
    </div>
  );
}

function ErrorInline({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginTop: 8, fontSize: 12, color: ERROR, letterSpacing: '-0.005em',
    }}>
      <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5.25" stroke={ERROR} strokeWidth="1"/>
        <path d="M6 3.2v3.4M6 8.2v0.6" stroke={ERROR} strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
      <span>{children}</span>
    </div>
  );
}

// ─── Tier + price footer preview ────────────────────────────
function TierPreview({ tier, compact, v2 }) {
  const price = priceFor(tier);
  // empty state — v2 uses stat-block placeholder for stronger visual presence
  if (!tier) {
    if (v2) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: 0.6 }}>
          <PreviewStat label="검토 등급" valuePlaceholder />
          <div style={{ width: 1, height: 28, background: HAIRLINE_SOFT }}/>
          <PreviewStat label="예상 금액" valuePlaceholder />
        </div>
      );
    }
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        fontSize: 12, color: MUTED, letterSpacing: '-0.005em',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(10,10,11,0.18)' }}/>
        <span>카테고리를 선택하면 검토 등급과 금액이 표시됩니다</span>
      </div>
    );
  }
  const tierLine = v2
    ? (tier === 'mixed' ? 'Tier S/A + B' : `Tier ${tier}`)
    : (tier === 'mixed' ? 'Tier S/A' : `Tier ${tier}`);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: compact ? 14 : 22, flexWrap: 'wrap',
    }}>
      <div>
        <div style={{
          fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT,
          marginBottom: 3,
        }}>검토 등급</div>
        <Badge kind={tier === 'B' ? 'warn' : 'ok'}>
          <span style={{ width: 5, height: 5, background: tier === 'B' ? SYS_WARN : SYS_OK }}/>
          {tierLine} · {tierLabel(tier)}
        </Badge>
      </div>
      <div style={{ width: 1, height: 28, background: HAIRLINE_SOFT, marginRight: -4 }}/>
      <div>
        <div style={{
          fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT,
          marginBottom: 3,
        }}>예상 금액</div>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
          {price.original ? (
            <span style={{
              fontFamily: FONT_EN, fontSize: 12, color: 'rgba(10,10,11,0.35)',
              textDecoration: 'line-through',
            }}>{fmtKRW(price.original)}</span>
          ) : null}
          <span style={{
            fontFamily: FONT_EN, fontSize: 20, fontWeight: 600, color: HERITAGE, letterSpacing: '-0.01em',
          }}>{fmtKRW(price.current)}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: HERITAGE, letterSpacing: '-0.005em' }}>원</span>
        </div>
      </div>
    </div>
  );
}

function PreviewStat({ label, valuePlaceholder }) {
  return (
    <div>
      <div style={{
        fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT,
        marginBottom: 3,
      }}>{label}</div>
      <div style={{
        fontFamily: FONT_EN, fontSize: 18, fontWeight: 500, color: MUTED, letterSpacing: '0.02em',
      }}>{valuePlaceholder ? '—' : ''}</div>
    </div>
  );
}

// ─── Page header (shared) ───────────────────────────────────
function PageHeader({ device }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: device === 'desktop' ? '24px 56px 22px' : '14px 20px 12px',
      borderBottom: `1px solid ${HAIRLINE_SOFT}`,
      background: 'rgba(255,255,255,.72)',
      backdropFilter: 'blur(18px) saturate(160%)',
      WebkitBackdropFilter: 'blur(18px) saturate(160%)',
    }}>
      {device === 'desktop' ? <KrkLogo size={15} /> : (
        <button aria-label="뒤로" style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', display: 'inline-flex' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 5L7.5 10L12.5 15" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      <StepProgress idx={1} total={4} />
      {device === 'desktop' ? (
        <div style={{
          fontSize: 11, fontFamily: FONT_EN, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>krk.team/new</div>
      ) : <KrkLogo size={12} />}
    </header>
  );
}

// ============================================================
// Step1Category — main composition
// ============================================================
function Step1Category({ mode = 'default', device = 'desktop', version = 2 }) {
  const v2 = version === 2;
  const preset = useMemo(() => presetFor(mode), [mode]);
  // tier/isMixed 제거 (v2: Tier 개념 폐기)
  const tier = null;

  const categoryError = preset.submitted && preset.categories.length === 0;
  const businessError = preset.submitted && !preset.businessType;
  const formValid = preset.categories.length > 0 && preset.businessType;
  const nextDisabled = !formValid;

  const isDesktop = device === 'desktop';
  const xPad = isDesktop ? 56 : 20;

  // Grid item width — v2 uses flex-wrap to center last row.
  // For 8px gap (gap-2): width = (100% - (n-1)*8) / n.
  // 4-col desktop: 25% - 6px; 2-col mobile: 50% - 4px.
  const itemWidth = isDesktop ? 'calc(25% - 6px)' : 'calc(50% - 4px)';

  // CTA copy
  const ctaCopy = v2 ? '다음 — 원재료 정보' : '다음 단계로';

  return (
    <div style={{
      width: '100%', height: '100%', background: SURFACE,
      fontFamily: FONT_KR, color: INK,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <PageHeader device={device} />

      <div style={{ flex: 1, overflow: 'auto', padding: `${isDesktop ? 28 : 22}px ${xPad}px ${isDesktop ? 24 : 20}px` }}>
        <div style={{
          maxWidth: isDesktop ? 920 : '100%',
          margin: '0 auto',
          display: 'flex', flexDirection: 'column',
          gap: isDesktop ? 28 : 22,
        }}>
          {/* Crumb + title */}
          <div>
            <StepCrumb idx={1} total={4} label="제품 정보" showCounter={!v2} />
            <h1 style={{
              margin: '12px 0 4px',
              fontSize: isDesktop ? 26 : 22,
              fontWeight: 600, letterSpacing: '-0.02em',
            }}>제품 정보를 입력해 주세요</h1>
            <p style={{ margin: 0, fontSize: 13, color: FAINT, letterSpacing: '-0.005em' }}>
              검토할 제품의 기본 정보와 식품 카테고리를 선택해 주세요. 카테고리는 복수 선택 가능합니다.
            </p>
          </div>

          {/* Product Name */}
          <ProductNameField
            value={preset.productName}
            focused={v2 && !preset.productName && mode === 'default'}
          />

          {/* Categories */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <SectionLabel required error={categoryError}>Food Category · 식품 카테고리</SectionLabel>
              <span style={{ fontSize: 11, color: MUTED, letterSpacing: '-0.005em' }}>
                {preset.categories.length > 0 ? <><span style={{ color: INK, fontFamily: FONT_EN, fontWeight: 600 }}>{preset.categories.length}</span><span>개 선택됨</span></> : '복수 선택 가능'}
              </span>
            </div>

            {/* Grid wrapper — v2 wraps in flex w/ centered last row; v1 uses CSS grid */}
            {v2 ? (
              <div style={{
                position: 'relative',
                padding: categoryError ? 1 : 0,
                border: categoryError ? `1px solid ${ERROR}` : 'none',
              }}>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
                }}>
                  {CATEGORIES.map((cat) => (
                    <CategoryCard
                      key={cat}
                      name={cat}
                      selected={preset.categories.includes(cat)}
                      width={itemWidth}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${isDesktop ? 4 : 2}, minmax(0, 1fr))`,
                gap: 8,
                padding: categoryError ? 2 : 0,
                border: categoryError ? `1.5px solid ${ERROR}` : 'none',
                background: categoryError ? ERROR_BG : 'transparent',
              }}>
                {CATEGORIES.map((cat) => (
                  <CategoryCard
                    key={cat}
                    name={cat}
                    selected={preset.categories.includes(cat)}
                  />
                ))}
              </div>
            )}

            {/* v2 — selected summary line */}
            {v2 && preset.categories.length > 0 ? (
              <div style={{
                marginTop: 10, fontSize: 11.5, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55,
              }}>
                <span style={{
                  fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, marginRight: 8,
                  fontWeight: 600,
                }}>선택</span>
                <span style={{ color: INK, fontWeight: 500 }}>{preset.categories.join(', ')}</span>
              </div>
            ) : null}

            {categoryError ? <ErrorInline>최소 1개 카테고리를 선택해 주세요</ErrorInline> : null}
          </div>

          {/* Business Type */}
          <div>
            <SectionLabel required error={businessError}>Business Type · 사업자 유형</SectionLabel>
            <div style={{ marginTop: 8 }}>
              <SegmentGroup
                options={[
                  { value: '식품제조가공업', label: '식품제조가공업' },
                  { value: '즉판가공업',     label: '즉판가공업', tooltip: '즉석판매제조·가공업의 줄임 — 직접 판매 매장에서 제조하는 영업 형태' },
                ]}
                value={preset.businessType}
                error={businessError}
                errorWeight={v2 ? 1 : 1.5}
              />
            </div>
            {businessError ? <ErrorInline>사업자 유형을 선택해 주세요</ErrorInline> : null}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${HAIRLINE_SOFT}`,
        background: CARD,
        padding: isDesktop ? `18px ${xPad}px` : '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        flexWrap: !isDesktop ? 'wrap' : 'nowrap',
      }}>
        <button
          type="button"
          disabled={nextDisabled}
          style={{
            padding: isDesktop ? '14px 24px' : '13px 22px',
            background: nextDisabled ? 'rgba(10,10,11,0.18)' : '#0CA4F9',
            color: '#fff', border: 'none', borderRadius: 0,
            fontFamily: FONT_KR, fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em',
            cursor: nextDisabled ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            flexShrink: 0,
            width: !isDesktop ? '100%' : 'auto',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <span>{ctaCopy}</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </footer>
    </div>
  );
}

Object.assign(window, { Step1Category });
