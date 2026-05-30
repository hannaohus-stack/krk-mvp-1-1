/* global React */
// payment-screens.jsx — v4 (service-v2 통합)
//
// 변경 사항 (이전 v3 → v4):
//   - Tier 분기 (S/A/B/mixed) 폐기 → service 분기 (basic / pro)
//   - 베타 모달 (PaymentBetaModal) 완전 제거
//   - "PDF 3종" 통합 카피 제거 → 개별 파일 명시
//   - "정식 검토", "베타 검토", "Tier" 단어 폐기
//   - /payment/complete 카피: 결제 직후 안도+신뢰. "전문 수정 가이드가 준비됐어요" 톤
//   - 마이페이지 1년 재다운로드 안내 (현재 준비 중) 표기
//
// Export:
//   PaymentDesktop({ service, state })   state: 'default' | 'loading' | 'error'
//   PaymentMobile({ service, state })
//   CompleteDesktop({ service, state })  state: 'success' | 'fail'
//   CompleteMobile({ service, state })

const { useState } = React;

// ─── Tokens ─────────────────────────────────────────────────
const HERITAGE       = '#002D72';
const BREATH         = '#0CA4F9';
const INK            = '#0A0A0B';
const OK             = '#00255E';
const OK_BG          = '#EAF6FE';
const ERROR          = '#E5484D';
const ERROR_BG       = 'rgba(229,72,77,0.05)';
const SURFACE        = '#F4F4F5';
const CARD           = '#fff';
const NEUTRAL_BG     = 'rgba(10,10,11,0.06)';
const FAINT          = 'rgba(10,10,11,0.55)';
const MUTED          = 'rgba(10,10,11,0.40)';
const HAIRLINE       = 'rgba(10,10,11,0.10)';
const HAIRLINE_SOFT  = 'rgba(10,10,11,0.06)';

const FONT_KR = 'Pretendard, "Pretendard Variable", system-ui, -apple-system, sans-serif';
const FONT_EN = 'Inter, system-ui, sans-serif';

// ─── Service meta (replaces tierMeta) ───────────────────────
function serviceMeta(service) {
  if (service === 'pro') {
    return {
      key: 'pro',
      name: '전문 수정 가이드',
      eyebrow: 'Professional Guide',
      price: 19900,
      // What's included
      files: [
        { code: 'PDF', name: '라벨 PDF',                use: '인쇄용 · A4',          size: '218 KB' },
        { code: 'PNG', name: '라벨 PNG',                use: '웹 · 스마트스토어 / 3000×3000', size: '450 KB' },
        { code: 'PDF', name: '품목제조보고 입력 가이드',  use: '정부24 참고용',         size: '84 KB' },
        { code: 'PDF', name: 'krk 라벨 검토 리포트',      use: '자율 점검 기록',         size: '112 KB' },
        { code: 'ZIP', name: '분리배출 마크 ZIP',         use: '환경부 공식 도안',       size: '1.2 MB' },
      ],
      copyItems: [
        '원재료명 · 함량',
        '알레르기 유발물질',
        '식품유형 (식약처 분류)',
        '제품명 · 영문',
      ],
      // Sample order context
      product: '수제 딸기잼',
      category: '잼류',
    };
  }
  // default = 'basic'
  return {
    key: 'basic',
    name: '기본 라벨 패키지',
    eyebrow: 'Basic Label Package',
    price: 9900,
    files: [
      { code: 'PDF', name: '라벨 PDF', use: '인쇄용 · A4',                         size: '218 KB' },
      { code: 'PNG', name: '라벨 PNG', use: '웹 · 스마트스토어 / 3000×3000',        size: '450 KB' },
    ],
    copyItems: [
      '원재료명 · 함량',
      '알레르기 유발물질',
      '제품명 · 영문',
    ],
    product: '수제 딸기잼',
    category: '잼류',
  };
}

const fmtKRW = (n) => n.toLocaleString('en-US');

// ─── Logo ───────────────────────────────────────────────────
function KrkLogo({ size = 15, color = INK }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, lineHeight: 1, userSelect: 'none' }}>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color, letterSpacing: '0.22em', textTransform: 'uppercase' }}>KRK CHECKER</span>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color: BREATH, marginLeft: '0.18em', lineHeight: 1 }}>·</span>
    </div>
  );
}

// ─── Atoms ──────────────────────────────────────────────────
function Crumb({ children, color = HERITAGE }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontSize: 10.5, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase',
      color, fontFamily: FONT_EN,
    }}>
      <span style={{ display: 'inline-block', width: 18, height: 1, background: color }}/>
      <span style={{ whiteSpace: 'nowrap' }}>{children}</span>
    </div>
  );
}

function ServiceBadge({ service, size = 'md' }) {
  const isPro = service === 'pro';
  const c = isPro ? HERITAGE : INK;
  const bg = isPro ? OK_BG : NEUTRAL_BG;
  const padding = size === 'sm' ? '3px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? 10 : 11;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding, fontSize, fontWeight: 600, letterSpacing: '0.02em',
      lineHeight: 1.2, color: c, background: bg, border: `1px solid ${c}`,
      borderRadius: 999,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      <span style={{ width: 5, height: 5, background: c }}/>
      {isPro ? '전문 수정 가이드' : '기본 라벨 패키지'}
    </span>
  );
}

function NeutralChip({ children }) {
  return (
    <span style={{
      display: 'inline-flex', padding: '3px 8px',
      background: NEUTRAL_BG, color: 'rgba(10,10,11,0.7)',
      fontSize: 11, fontWeight: 500, letterSpacing: '-0.005em',
      borderRadius: 999, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function BtnHeritage({ children, fullWidth = true, disabled, loading, onClick, type = 'button' }) {
  const isDisabled = disabled || loading;
  return (
    <button type={type} disabled={isDisabled} onClick={onClick} style={{
      width: fullWidth ? '100%' : 'auto',
      padding: '15px 18px',
      background: isDisabled && !loading ? 'rgba(10,10,11,0.18)' : HERITAGE,
      color: '#fff', border: 'none', borderRadius: 0,
      fontFamily: FONT_KR, fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em',
      cursor: isDisabled ? (loading ? 'wait' : 'not-allowed') : 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'background 0.15s ease',
    }}>
      {loading ? <Spinner /> : null}
      <span>{children}</span>
    </button>
  );
}

function BtnSoft({ children, fullWidth = true, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      width: fullWidth ? '100%' : 'auto',
      padding: '13px 16px',
      background: OK_BG, color: HERITAGE,
      border: 'none', borderRadius: 0,
      fontFamily: FONT_KR, fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em',
      cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>{children}</button>
  );
}

function BtnGhost({ children, fullWidth = true, onClick, icon, small }) {
  return (
    <button type="button" onClick={onClick} style={{
      width: fullWidth ? '100%' : 'auto',
      padding: small ? '8px 12px' : '13px 16px',
      background: 'transparent', color: INK,
      border: `1px solid rgba(10,10,11,0.22)`, borderRadius: 0,
      fontFamily: FONT_KR, fontSize: small ? 12 : 13, fontWeight: 500, letterSpacing: '-0.005em',
      cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

function Spinner({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ animation: 'krkspin 0.8s linear infinite' }}>
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <path d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function DownloadIcon({ color = INK, size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v9M4.5 7.5L8 11l3.5-3.5M2.5 13.5h11" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CopyIcon({ color = INK, size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="9" height="9.5" stroke={color} strokeWidth="1.2" fill="none"/>
      <path d="M3 11V2.5h8" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function CheckTinyIcon({ color = HERITAGE, size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function BigCheckIcon({ size = 44, color = OK }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18.5" stroke={color} strokeWidth="1.2" fill={color === OK ? OK_BG : 'transparent'}/>
      <path d="M12 20.5L17.5 26 28 14.5" stroke={color} strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" fill="none"/>
    </svg>
  );
}

function BigAlertIcon({ size = 44, color = ERROR }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18.5" stroke={color} strokeWidth="1.2" fill={ERROR_BG}/>
      <path d="M20 11v12" stroke={color} strokeWidth="1.8" strokeLinecap="square"/>
      <path d="M20 27.5v1" stroke={color} strokeWidth="2.4" strokeLinecap="square"/>
    </svg>
  );
}

// ─── Order Summary Card (left column) ───────────────────────
function OrderSummaryCard({ service, density = 'desktop' }) {
  const s = serviceMeta(service);
  const inset = density === 'desktop' ? '32px 32px 28px' : '22px 20px 20px';
  return (
    <div style={{
      background: CARD, border: `1px solid ${HAIRLINE}`,
      padding: inset, color: INK,
      display: 'flex', flexDirection: 'column', gap: 22,
    }}>
      {/* Section label + order# */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{
          fontSize: 10.5, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT, fontFamily: FONT_EN,
        }}>Order Summary · 주문 요약</span>
        <span style={{ fontFamily: FONT_EN, fontSize: 11, color: MUTED, letterSpacing: '0.04em' }}>#KRK-3148</span>
      </div>

      {/* Service name + badge */}
      <div>
        <div style={{
          fontFamily: FONT_EN, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: s.key === 'pro' ? HERITAGE : MUTED,
          marginBottom: 6,
        }}>{s.eyebrow}</div>
        <div style={{
          fontSize: density === 'desktop' ? 22 : 18, fontWeight: 600, letterSpacing: '-0.015em',
          lineHeight: 1.25, marginBottom: 12,
        }}>{s.name}</div>
        <div style={{
          fontSize: 12.5, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55,
        }}>
          <b style={{ color: INK, fontWeight: 500 }}>{s.product}</b> · {s.category}
        </div>
      </div>

      {/* Inclusions */}
      <div>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: FAINT, marginBottom: 8, fontFamily: FONT_EN,
        }}>포함 내역 / Included</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {s.files.map((f) => (
            <div key={f.name} style={{
              display: 'flex', alignItems: 'baseline', gap: 10,
              fontSize: 13, letterSpacing: '-0.005em', lineHeight: 1.45,
            }}>
              <CheckTinyIcon color={HERITAGE} />
              <span style={{ flex: 1, wordBreak: 'keep-all' }}>
                <span style={{ color: INK }}>{f.name}</span>
                <span style={{ color: FAINT }}> · {f.use}</span>
              </span>
            </div>
          ))}
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 10,
            fontSize: 13, letterSpacing: '-0.005em', lineHeight: 1.45,
          }}>
            <CheckTinyIcon color={HERITAGE} />
            <span style={{ color: INK }}>항목별 텍스트 복사 <span style={{ color: FAINT }}>· 스마트스토어 입력용</span></span>
          </div>
        </div>
      </div>

      {/* Divider + Price */}
      <div style={{ paddingTop: 18, borderTop: `1px solid ${HAIRLINE_SOFT}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{
            fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT, fontFamily: FONT_EN,
          }}>결제 금액 / Total</span>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2, color: HERITAGE }}>
            <span style={{ fontFamily: FONT_EN, fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1 }}>
              {fmtKRW(s.price)}
            </span>
            <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em', marginLeft: 2 }}>원</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Toss Payment Widget (mock) ─────────────────────────────
function TossWidget({ state = 'mounted' }) {
  return (
    <div style={{
      background: CARD, border: `1px solid ${HAIRLINE}`, padding: 26,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18,
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT, fontFamily: FONT_EN,
        }}>결제 수단 · Method</span>
        <span style={{
          fontFamily: FONT_EN, fontSize: 10, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>Toss Payments</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginBottom: 18 }}>
        <MethodTab label="카드" active={state !== 'disabled'} />
        <MethodTab label="간편결제" />
        <MethodTab label="계좌이체" />
      </div>

      {state !== 'disabled' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FauxField label="카드 번호" value="•••• •••• •••• 4521" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FauxField label="유효기간" value="12 / 28" />
            <FauxField label="비밀번호 앞 2자리" value="••" />
          </div>
          <FauxField label="생년월일 / 사업자번호" value="900101" />
        </div>
      ) : (
        <div style={{
          padding: 22, border: `1px dashed rgba(10,10,11,0.18)`, fontSize: 12, color: MUTED,
          textAlign: 'center', letterSpacing: '-0.005em',
        }}>
          위젯 마운트 영역 · <span style={{ fontFamily: FONT_EN }}>id=&quot;payment-widget&quot;</span>
        </div>
      )}

      <div style={{
        marginTop: 22, paddingTop: 16, borderTop: `1px solid ${HAIRLINE_SOFT}`,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <AgreeRow label="결제 정보 제공 동의 (필수)" checked={state !== 'disabled'} />
        <AgreeRow label="만 14세 이상이며 약관에 동의 (필수)" checked={state !== 'disabled'} />
      </div>
    </div>
  );
}

function MethodTab({ label, active }) {
  return (
    <div style={{
      padding: '11px 8px', textAlign: 'center',
      borderBottom: `2px solid ${active ? HERITAGE : 'transparent'}`,
      fontSize: 13, fontWeight: active ? 600 : 400,
      color: active ? INK : FAINT,
      letterSpacing: '-0.005em',
    }}>{label}</div>
  );
}

function FauxField({ label, value }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT, fontFamily: FONT_EN,
        marginBottom: 5,
      }}>{label}</div>
      <div style={{
        padding: '11px 12px', border: `1px solid ${HAIRLINE}`, background: SURFACE,
        fontFamily: FONT_EN, fontSize: 13, color: INK, letterSpacing: '0.02em',
      }}>{value}</div>
    </div>
  );
}

function AgreeRow({ label, checked }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'rgba(10,10,11,0.75)' }}>
      <span style={{
        width: 14, height: 14, border: `1px solid ${checked ? HERITAGE : 'rgba(10,10,11,0.3)'}`,
        background: checked ? HERITAGE : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {checked ? (
          <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
            <path d="M3 7.5L5.5 10L11 4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="square"/>
          </svg>
        ) : null}
      </span>
      <span style={{ letterSpacing: '-0.005em' }}>{label}</span>
    </div>
  );
}

// ─── Page Header (desktop) ──────────────────────────────────
function DesktopPageHeader({ crumb = '결제 · CHECKOUT', crumbColor, title, subtitle }) {
  return (
    <header style={{
      padding: '32px 64px 28px', borderBottom: `1px solid ${HAIRLINE}`,
      background: 'rgba(255,255,255,.72)',
      backdropFilter: 'blur(18px) saturate(160%)',
      WebkitBackdropFilter: 'blur(18px) saturate(160%)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 24, flexShrink: 0,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Crumb color={crumbColor}>{crumb}</Crumb>
        <h1 style={{
          margin: '12px 0 4px', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: INK,
          wordBreak: 'keep-all',
        }}>{title}</h1>
        {subtitle ? (
          <p style={{ margin: 0, fontSize: 13, color: FAINT, letterSpacing: '-0.005em', wordBreak: 'keep-all' }}>{subtitle}</p>
        ) : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: FONT_EN }}>
          SSL · Toss Payments
        </span>
        <KrkLogo size={16} />
      </div>
    </header>
  );
}

// ============================================================
// PaymentDesktop — /payment (2-col)
// ============================================================
function PaymentDesktop({ service = 'basic', state = 'default' }) {
  const s = serviceMeta(service);
  const ctaLabel = `${fmtKRW(s.price)}원 결제하기`;
  return (
    <div style={{
      width: '100%', height: '100%', background: SURFACE,
      fontFamily: FONT_KR, color: INK, display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <DesktopPageHeader
        title="결제하고 파일 받기"
        subtitle="결제 완료 즉시 파일이 자동으로 다운로드됩니다."
      />
      <div style={{ flex: 1, padding: '40px 64px 56px', overflow: 'auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)',
          gap: 32, alignItems: 'flex-start', maxWidth: 1120, margin: '0 auto',
        }}>
          <OrderSummaryCard service={service} density="desktop" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {state === 'error' ? <ErrorBanner /> : null}
            <TossWidget state="method-selected" />
            <div>
              <BtnHeritage loading={state === 'loading'} disabled={state === 'loading'}>
                {state === 'loading' ? '결제 처리 중...' : ctaLabel}
              </BtnHeritage>
              <SecurityCaption />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorBanner() {
  return (
    <div style={{
      border: `1.2px solid ${ERROR}`, background: ERROR_BG,
      padding: '13px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <svg width="16" height="16" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
        <circle cx="6" cy="6" r="5.25" stroke={ERROR} strokeWidth="1"/>
        <path d="M6 3.2v3.4M6 8.2v0.6" stroke={ERROR} strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
      <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.55 }}>
        <div style={{ fontWeight: 600, color: ERROR, marginBottom: 2 }}>결제에 실패했습니다</div>
        <span style={{ color: INK }}>카드사 응답: 잔액 부족 또는 한도 초과 (코드 <span style={{ fontFamily: FONT_EN }}>F-201</span>) · 다른 결제 수단을 선택하거나 잠시 후 다시 시도해 주세요.</span>
      </div>
    </div>
  );
}

function SecurityCaption() {
  return (
    <div style={{
      marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      fontSize: 11, color: MUTED, letterSpacing: '-0.005em',
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <svg width="11" height="12" viewBox="0 0 12 13" fill="none">
          <rect x="2" y="6" width="8" height="6" stroke="currentColor" strokeWidth="1" fill="none"/>
          <path d="M4 6V4a2 2 0 0 1 4 0v2" stroke="currentColor" strokeWidth="1" fill="none"/>
        </svg>
        토스페이먼츠 보안 결제 · SSL 암호화
      </span>
      <span>결제 완료 즉시 다운로드 시작</span>
    </div>
  );
}

// ============================================================
// CompleteDesktop — /payment/complete
// ============================================================
function CompleteDesktop({ service = 'basic', state = 'success' }) {
  const s = serviceMeta(service);

  if (state === 'fail') {
    return (
      <div style={{
        width: '100%', height: '100%', background: SURFACE, fontFamily: FONT_KR, color: INK,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <DesktopPageHeader crumb="결제 실패 · FAILED" crumbColor={ERROR} title="결제를 완료하지 못했어요" subtitle="결제 처리 중 오류가 발생했습니다. 카드 정보를 확인하거나 다른 결제 수단으로 다시 시도해 주세요." />
        <div style={{ flex: 1, padding: '48px 64px 56px', overflow: 'auto' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ marginBottom: 4 }}><BigAlertIcon size={48} /></div>
            <div style={{
              marginTop: 24, padding: '16px 18px', border: `1px solid ${HAIRLINE}`, background: CARD,
              fontSize: 12.5, lineHeight: 1.7, letterSpacing: '-0.005em',
            }}>
              <ReceiptRow label="오류 코드" value="F-201 · INSUFFICIENT_FUNDS" mono />
              <ReceiptRow label="주문 번호" value="#KRK-3148" mono />
              <ReceiptRow label="처리 시각" value="2026.05.19  14:32:07 KST" mono last />
            </div>
            <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
              <BtnHeritage fullWidth>다시 시도하기</BtnHeritage>
              <BtnSoft fullWidth>다른 결제 수단</BtnSoft>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // success — download hub
  return (
    <div style={{
      width: '100%', height: '100%', background: SURFACE, fontFamily: FONT_KR, color: INK,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <DesktopPageHeader
        crumb="결제 완료 · COMPLETE"
        crumbColor={OK}
        title={`${s.name}가 준비됐어요.`}
        subtitle="결제 완료. 아래에서 파일을 다운로드하고, 항목별 텍스트는 한 번에 복사할 수 있어요."
      />
      <div style={{ flex: 1, padding: '36px 64px 56px', overflow: 'auto' }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)', gap: 36, alignItems: 'flex-start',
        }}>
          {/* Left — context + receipt */}
          <div>
            <div style={{ marginBottom: 4 }}><BigCheckIcon size={48} /></div>
            <div style={{ marginTop: 16, marginBottom: 14 }}>
              <ServiceBadge service={service} />
            </div>

            <div style={{
              padding: '16px 18px', background: CARD, border: `1px solid ${HAIRLINE}`,
              fontSize: 12.5, lineHeight: 1.7, letterSpacing: '-0.005em',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: FAINT, marginBottom: 10, fontFamily: FONT_EN,
              }}>영수증 / Receipt</div>
              <ReceiptRow label="주문 번호" value="#KRK-3148" mono />
              <ReceiptRow label="결제 금액" value={`${fmtKRW(s.price)}원`} mono heritage />
              <ReceiptRow label="제품명" value={`${s.product} · ${s.category}`} />
              <ReceiptRow label="결제 일시" value="2026.05.19  14:32 KST" mono />
              <ReceiptRow label="영수증" value="이메일로 발송됨" last />
            </div>

            <MyPageNotice />

            <div style={{ marginTop: 18 }}><BtnGhost>대시보드로 이동</BtnGhost></div>
          </div>

          {/* Right — downloads + copy items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <DownloadList files={s.files} />
            <CopyList items={s.copyItems} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value, mono, heritage, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: 12,
      paddingBottom: last ? 0 : 7,
      marginBottom: last ? 0 : 7,
      borderBottom: last ? 'none' : `1px solid ${HAIRLINE_SOFT}`,
    }}>
      <span style={{ color: FAINT }}>{label}</span>
      <span style={{
        fontFamily: mono ? FONT_EN : undefined,
        fontWeight: heritage ? 600 : 500,
        color: heritage ? HERITAGE : INK,
        textAlign: 'right',
      }}>{value}</span>
    </div>
  );
}

function DownloadList({ files }) {
  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12,
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: FAINT, fontFamily: FONT_EN,
        }}>다운로드 / Downloads ({String(files.length).padStart(2,'0')})</span>
        <button type="button" style={{
          background: 'transparent', border: 'none', padding: 0,
          color: HERITAGE, fontFamily: FONT_KR, fontSize: 12, fontWeight: 600,
          letterSpacing: '-0.005em', cursor: 'pointer',
          borderBottom: `1px solid ${BREATH}`, paddingBottom: 1,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          전체 다운로드 (ZIP)
          <DownloadIcon color={HERITAGE} size={11} />
        </button>
      </div>
      <div style={{ background: CARD, border: `1px solid ${HAIRLINE}` }}>
        {files.map((f, i) => (
          <DownloadRow
            key={f.name}
            n={String(i + 1).padStart(2, '0')}
            code={f.code}
            title={f.name}
            sub={f.use}
            size={f.size}
            last={i === files.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function DownloadRow({ n, code, title, sub, size, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px',
      borderBottom: last ? 'none' : `1px solid ${HAIRLINE_SOFT}`,
    }}>
      <div style={{
        fontFamily: FONT_EN, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em', color: MUTED, width: 26,
      }}>{n}</div>
      <div style={{
        fontFamily: FONT_EN, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em',
        padding: '3px 6px', color: INK, border: `1px solid ${HAIRLINE}`,
        flexShrink: 0, minWidth: 30, textAlign: 'center',
      }}>{code}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.005em', wordBreak: 'keep-all' }}>{title}</div>
        <div style={{ fontSize: 11.5, color: FAINT, marginTop: 2, letterSpacing: '-0.005em', wordBreak: 'keep-all' }}>
          {sub} · <span style={{ fontFamily: FONT_EN }}>{size}</span>
        </div>
      </div>
      <BtnGhost fullWidth={false} small icon={<DownloadIcon size={11} />}>다운로드</BtnGhost>
    </div>
  );
}

function CopyList({ items }) {
  return (
    <div>
      <div style={{
        fontSize: 10.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
        color: FAINT, marginBottom: 12, fontFamily: FONT_EN,
      }}>항목별 텍스트 복사 / Copy ({String(items.length).padStart(2,'0')})</div>
      <div style={{ background: CARD, border: `1px solid ${HAIRLINE}` }}>
        {items.map((it, i) => (
          <div key={it} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px',
            borderBottom: i === items.length - 1 ? 'none' : `1px solid ${HAIRLINE_SOFT}`,
          }}>
            <div style={{
              fontFamily: FONT_EN, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em', color: MUTED, width: 26,
            }}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.005em', wordBreak: 'keep-all' }}>{it}</div>
            <BtnGhost fullWidth={false} small icon={<CopyIcon size={11} />}>복사</BtnGhost>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyPageNotice() {
  return (
    <div style={{
      marginTop: 14, padding: '12px 14px',
      background: 'rgba(12,164,249,0.06)', border: `1px solid rgba(12,164,249,0.22)`,
      borderLeft: `3px solid ${BREATH}`,
      fontSize: 12, lineHeight: 1.6, letterSpacing: '-0.005em',
    }}>
      <div style={{ color: HERITAGE, fontWeight: 600, marginBottom: 3 }}>
        마이페이지에서 1년간 재다운로드 가능합니다.
      </div>
      <div style={{ color: FAINT, fontSize: 11 }}>
        <span style={{
          display: 'inline-block', padding: '1px 6px', background: NEUTRAL_BG, color: MUTED,
          fontSize: 9.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
          marginRight: 6,
        }}>준비 중</span>
        곧 출시될 마이페이지에서 결제하신 파일을 언제든 다시 받을 수 있어요.
      </div>
    </div>
  );
}

// ============================================================
// MOBILE
// ============================================================
function MobileShell({ children, hideTop }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: SURFACE,
      fontFamily: FONT_KR, color: INK, display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {!hideTop ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderBottom: `1px solid ${HAIRLINE_SOFT}`,
          flexShrink: 0,
        }}>
          <button aria-label="뒤로" style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', display: 'inline-flex' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 5L7.5 10L12.5 15" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <KrkLogo size={13} />
          <div style={{ width: 28 }}/>
        </div>
      ) : null}
      <div style={{ flex: 1, overflow: 'auto', padding: '22px 20px 32px' }}>{children}</div>
    </div>
  );
}

function PaymentMobile({ service = 'basic', state = 'default' }) {
  const s = serviceMeta(service);
  return (
    <MobileShell>
      <Crumb>결제 · CHECKOUT</Crumb>
      <h1 style={{ margin: '14px 0 6px', fontSize: 22, fontWeight: 600, letterSpacing: '-0.018em', wordBreak: 'keep-all' }}>
        결제하고 파일 받기
      </h1>
      <p style={{ margin: 0, fontSize: 12.5, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55, wordBreak: 'keep-all' }}>
        결제 완료 즉시 파일이 자동으로 다운로드됩니다.
      </p>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {state === 'error' ? <ErrorBanner /> : null}
        <OrderSummaryCard service={service} density="mobile" />
        <TossWidget state="method-selected" />
      </div>

      <div style={{ marginTop: 20 }}>
        <BtnHeritage loading={state === 'loading'} disabled={state === 'loading'}>
          {state === 'loading' ? '결제 처리 중...' : `${fmtKRW(s.price)}원 결제하기`}
        </BtnHeritage>
        <div style={{
          marginTop: 12, textAlign: 'center', fontSize: 11, lineHeight: 1.7,
          color: MUTED, letterSpacing: '-0.005em',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <svg width="10" height="11" viewBox="0 0 12 13" fill="none">
              <rect x="2" y="6" width="8" height="6" stroke="currentColor" strokeWidth="1" fill="none"/>
              <path d="M4 6V4a2 2 0 0 1 4 0v2" stroke="currentColor" strokeWidth="1" fill="none"/>
            </svg>
            토스페이먼츠 보안 결제 · SSL 암호화
          </div>
          <div>결제 완료 즉시 다운로드 시작</div>
        </div>
      </div>
    </MobileShell>
  );
}

function CompleteMobile({ service = 'basic', state = 'success' }) {
  const s = serviceMeta(service);
  if (state === 'fail') {
    return (
      <MobileShell>
        <Crumb color={ERROR}>결제 실패 · FAILED</Crumb>
        <div style={{ marginTop: 20, marginBottom: 4 }}><BigAlertIcon size={44} /></div>
        <h1 style={{ margin: '8px 0 6px', fontSize: 22, fontWeight: 600, letterSpacing: '-0.018em', wordBreak: 'keep-all' }}>
          결제를 완료하지 못했어요
        </h1>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: FAINT, letterSpacing: '-0.005em', wordBreak: 'keep-all' }}>
          결제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.
        </p>
        <div style={{
          marginTop: 22, padding: '14px 16px', background: CARD, border: `1px solid ${HAIRLINE}`,
          fontSize: 12, lineHeight: 1.7, letterSpacing: '-0.005em',
        }}>
          <ReceiptRow label="오류 코드" value="F-201" mono />
          <ReceiptRow label="주문 번호" value="#KRK-3148" mono last />
        </div>
        <div style={{ marginTop: 22 }}><BtnHeritage>다시 시도하기</BtnHeritage></div>
        <div style={{ marginTop: 10 }}><BtnSoft>다른 결제 수단</BtnSoft></div>
      </MobileShell>
    );
  }
  // success
  return (
    <MobileShell>
      <Crumb color={OK}>결제 완료 · COMPLETE</Crumb>
      <div style={{ marginTop: 18, marginBottom: 4 }}><BigCheckIcon size={44} /></div>
      <h1 style={{ margin: '8px 0 6px', fontSize: 21, fontWeight: 600, letterSpacing: '-0.018em', wordBreak: 'keep-all' }}>
        {s.name}가 준비됐어요.
      </h1>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: FAINT, letterSpacing: '-0.005em', wordBreak: 'keep-all' }}>
        {s.product} · <span style={{ fontFamily: FONT_EN }}>{fmtKRW(s.price)}</span>원 결제 완료.
      </p>

      <div style={{ marginTop: 14 }}><ServiceBadge service={service} size="sm" /></div>

      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <DownloadList files={s.files} />
        <CopyList items={s.copyItems} />
      </div>

      <MyPageNotice />
      <div style={{ marginTop: 16 }}><BtnGhost>대시보드로 이동</BtnGhost></div>
    </MobileShell>
  );
}

Object.assign(window, {
  PaymentDesktop, PaymentMobile,
  CompleteDesktop, CompleteMobile,
});
