/* global React */
// pdf-pages.jsx — v3.0
// 결제 완료 후 서버사이드 생성되는 인쇄용 PDF 3종 (jsPDF, A4 794×1123 @96dpi).
//
// 공통 props:
//   tier       : 'SA' | 'B'              (KRK 시스템 ok/warn 배지)
//   data       : { productName, categories[], businessType, ingredients[],
//                  detectedAllergens[], totalWeight, unit, storage, expiryDate,
//                  manufacturer, nutritionExempted, nutrition }
//   resultMode : 'all-pass' | 'mixed' | 'violation'  (Cert 전용)

// ─── Tokens ─────────────────────────────────────────────────
const HERITAGE = '#002D72';
const INK      = '#0A0A0B';
const FAINT    = 'rgba(10,10,11,0.55)';
const MUTED    = 'rgba(10,10,11,0.40)';
const HAIRLINE = 'rgba(10,10,11,0.18)';
const RULE     = 'rgba(10,10,11,0.85)';

// KRK system — Tier badge
const SYS_OK   = '#1F8A5B';
const SYS_OK_BG = 'rgba(31,138,91,0.06)';
const SYS_WARN = '#B07A1A';
const SYS_WARN_BG = 'rgba(176,122,26,0.06)';

// Brief — print/legal result colors
const PRN_PASS = '#006400';
const PRN_PASS_BG = 'rgba(0,100,0,0.05)';
const PRN_WARN = '#B8860B';
const PRN_WARN_BG = 'rgba(184,134,11,0.06)';
const PRN_VIOL = '#B30000';
const PRN_VIOL_BG = 'rgba(179,0,0,0.05)';

// ─── 식약처 카테고리 매핑 (brief v3) ────────────────────────
const CATEGORY_OFFICIAL = {
  '잼류': '잼류',
  '소스류': '소스류',
  '장류': '장류',
  '떡류': '떡류',
  '디저트/베이커리': '과자류 및 빵 또는 떡류',
  '차/음료': '음료류',
  '건강식품(일반)': '기타식품류',
};
const toOfficial = (c) => CATEGORY_OFFICIAL[c] || c;

// ─── Sample data presets ────────────────────────────────────
const DATA_SA_JAM = {
  productName: '수제 딸기잼',
  productNameEn: 'Handmade Strawberry Jam',
  categories: ['잼류'],
  businessType: '식품제조가공업',
  ingredients: [
    { name: '딸기',    origin: '국산',  pct: 60 },
    { name: '설탕',    origin: null,    pct: 30 },
    { name: '레몬과즙', origin: '국산', pct: 7 },
    { name: '펙틴',    origin: null,    pct: 2.5 },
    { name: '구연산',  origin: null,    pct: 0.5 },
  ],
  detectedAllergens: ['딸기'],
  totalWeight: 200, unit: 'g',
  storage: '직사광선을 피해 서늘한 곳 보관 · 개봉 후 냉장보관',
  storageBefore: '직사광선을 피해 서늘한 곳에 보관',
  storageAfter: '냉장보관 · 개봉 후 1개월 이내 섭취 권장',
  expiryDate: '제조일로부터 12개월',
  manufacturer: {
    name: '쿡하우스', ceo: '김라벨',
    address: '경기도 파주시 산업로 123, 2층 (10880)',
    license: '제 2026-경기-파주-00000 호',
    phone: '031-000-0000', email: 'cookhouse@example.kr',
  },
  nutritionExempted: false,
  nutrition: {
    basis: '100g 당',
    rows: [
      { k: '열량',     v: '248 kcal', pct: '' },
      { k: '나트륨',   v: '10 mg',    pct: '1%' },
      { k: '탄수화물', v: '60 g',     pct: '18%' },
      { k: '  당류',   v: '55 g',     pct: '55%' },
      { k: '지방',     v: '0.2 g',    pct: '0%' },
      { k: '단백질',   v: '0.5 g',    pct: '1%' },
    ],
  },
};

// Tier B preset — 건강식품(일반) → 기타식품류, 즉판가공업, 영양성분 면제
const DATA_B_VIT = {
  productName: '데일리 비타민C 1000',
  productNameEn: 'Daily Vitamin C 1000',
  categories: ['건강식품(일반)'],
  businessType: '즉석판매제조·가공업',
  ingredients: [
    { name: 'L-아스코르브산', origin: null, pct: 85 },
    { name: '결정셀룰로스',   origin: null, pct: 10 },
    { name: '히드록시프로필메틸셀룰로스', origin: null, pct: 3 },
    { name: '스테아르산마그네슘', origin: null, pct: 2 },
  ],
  detectedAllergens: [],
  totalWeight: 60, unit: '정 (60g)',
  storage: '습기와 직사광선을 피해 서늘한 곳에 보관 · 어린이 손이 닿지 않는 곳에 보관',
  storageBefore: '습기와 직사광선을 피해 서늘한 곳에 보관',
  storageAfter: '개봉 후에도 동일 조건 유지 · 어린이 손이 닿지 않는 곳에 보관',
  expiryDate: '제조일로부터 24개월',
  manufacturer: {
    name: '바이탈웍스', ceo: '박베타',
    address: '서울특별시 성동구 성수동 456-7 (04800)',
    license: '제 2026-서울-성동-00012 호',
    phone: '02-000-0000', email: 'hello@vitalworks.kr',
  },
  nutritionExempted: true,
  nutrition: null,
};

// ─── Logo ───────────────────────────────────────────────────
function Logo({ size = 16, color = INK }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, lineHeight: 1 }}>
      <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800, fontSize: size, color, letterSpacing: '0.22em', textTransform: 'uppercase' }}>KRK CHECKER</span>
      <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800, fontSize: size, color: '#0CA4F9', marginLeft: '0.18em', lineHeight: 1 }}>·</span>
    </div>
  );
}

// ─── Business type badge (사업장 유형) ──────────────────────
// v4: replaces TierBadge. businessType 그대로 표기 — service-v2 지침: Tier 단어 금지.
function BusinessBadge({ businessType, size = 'md' }) {
  const label = (businessType || '').includes('즉') ? '즉석판매제조·가공업' : '식품제조가공업';
  const c = INK;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: size === 'sm' ? '3px 8px' : '4px 10px',
      background: 'transparent',
      border: `1px solid ${c}`,
      color: c,
      fontSize: size === 'sm' ? 9.5 : 10.5,
      fontWeight: 600, letterSpacing: '0.04em',
      lineHeight: 1.2,
    }}>
      <span style={{ width: 5, height: 5, background: c }}/>
      {label}
    </span>
  );
}

// ─── PDF header (shared, top of every A4) ───────────────────
function PdfHeader({ docCode, docLabel }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      paddingBottom: 14, borderBottom: `1px solid ${HAIRLINE}`, marginBottom: 22,
    }}>
      <Logo size={18} />
      <div style={{
        display: 'flex', gap: 22, fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(10,10,11,0.45)',
      }}>
        <span><b style={{ color: INK, fontWeight: 500, marginRight: 6 }}>{docCode}</b>{docLabel}</span>
        <span><b style={{ color: INK, fontWeight: 500, marginRight: 6 }}>검토일</b>2026.05.19</span>
      </div>
    </div>
  );
}

function A4({ children, bg = '#fff' }) {
  return (
    <div style={{
      width: 794, height: 1123, background: bg,
      fontFamily: 'Pretendard, "Pretendard Variable", system-ui, sans-serif',
      color: INK, boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
    }}>{children}</div>
  );
}

// =============================================================
// PDF ① 식품 라벨 (v4)
//
// ⚠ GAP 5 — 인쇄 pt/mm 기준
// Container 320×460px ≈ 84.7×121.7mm @96dpi. 실 인쇄 규격: 90×60mm (전면) / 90×90mm (후면).
// 시안은 화면 가독성 우선 px 표기 — 실제 PDF 생성 시 pt 환산 필수 (1pt = 1.333px):
//   일반 표시 10pt = 13.3px (최소)
//   내용량+열량 12pt = 16px (주표시면 의무)
//   제품명 12pt 이상 · 식품유형 8pt = 10.6px
//   영양표 9.6pt 허용 = 12.8px
// =============================================================

function CutMarks() {
  const arms = ['tl', 'tr', 'bl', 'br'];
  return arms.map((p) => (
    <div key={p} style={{
      position: 'absolute', width: 14, height: 14,
      [p.includes('t') ? 'top' : 'bottom']: -7,
      [p.includes('l') ? 'left' : 'right']: -7,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path d="M7 0 V14 M0 7 H14" stroke="rgba(10,10,11,0.55)" strokeWidth="0.6"/>
      </svg>
    </div>
  ));
}

function FrontLabel({ data, tier }) {
  return (
    <div style={{
      position: 'relative', width: 320, height: 460,
      border: `1px solid ${RULE}`, padding: '26px 22px',
      boxSizing: 'border-box', background: '#fff',
      display: 'flex', flexDirection: 'column',
    }}>
      <CutMarks />

      {/* Brand strip — v4: BETA 마크 제거 (service-v2 지침) */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
      }}>
        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: FAINT,
        }}>{data.manufacturer.name.toUpperCase()}</div>
        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: FAINT,
        }}>krk · pdf-01</div>
      </div>

      {/* 식품 유형 - 식약처 공식 표기 */}
      <div style={{
        display: 'inline-flex', alignSelf: 'flex-start',
        padding: '3px 9px', background: HERITAGE, color: '#fff',
        fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
        marginBottom: 22,
      }}>식품유형 · {toOfficial(data.categories[0])}</div>

      {/* 제품명 */}
      <h1 style={{
        margin: 0, fontSize: 36, fontWeight: 700,
        lineHeight: 1.05, letterSpacing: '-0.02em', color: INK,
        wordBreak: 'keep-all',
      }}>{data.productName}</h1>
      <div style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 11, fontWeight: 400, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: FAINT,
        marginTop: 6, marginBottom: 22,
      }}>{data.productNameEn}</div>

      {/* Hero strip placeholder */}
      <div style={{
        flex: 1,
        background: 'repeating-linear-gradient(135deg, rgba(0,45,114,0.05) 0 6px, rgba(0,45,114,0.08) 6px 12px)',
        border: `1px solid ${HAIRLINE}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'JetBrains Mono, ui-monospace, Menlo, monospace',
        fontSize: 10, color: 'rgba(0,45,114,0.5)', letterSpacing: '0.04em',
        marginBottom: 16,
      }}>product shot</div>

      {/* 내용량 + 열량 (GAP 1 — 주표시면 의무) */}
      {(() => {
        const cal = !data.nutritionExempted && data.nutrition && data.nutrition.rows && data.nutrition.rows[0]
          ? `${data.nutrition.rows[0].v}/${data.nutrition.basis.replace(/\s+당$/, '')}`
          : null;
        return (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            paddingTop: 10, borderTop: `1px solid ${HAIRLINE}`,
          }}>
            <span style={{
              fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT,
            }}>내용량 · 열량 / NET WT · KCAL</span>
            <span style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em',
            }}>{data.totalWeight} {data.unit}{cal ? <span style={{ color: FAINT, fontWeight: 500, fontSize: 14, marginLeft: 4 }}>({cal})</span> : null}</span>
          </div>
        );
      })()}
    </div>
  );
}

function BackLabel({ data, tier }) {
  return (
    <div style={{
      position: 'relative', width: 320, height: 460,
      border: `1px solid ${RULE}`, padding: '18px 16px',
      boxSizing: 'border-box', background: '#fff',
      display: 'flex', flexDirection: 'column',
      fontSize: 9.5, lineHeight: 1.45,
    }}>
      <CutMarks />

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        paddingBottom: 6, marginBottom: 9, borderBottom: `1px solid ${RULE}`,
      }}>
        <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: '-0.01em' }}>
          {data.productName} · {data.totalWeight}{typeof data.unit === 'string' && data.unit.length < 4 ? data.unit : ''}
        </div>
        <div style={{
          fontSize: 8, color: FAINT,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>표시사항 / BACK</div>
      </div>

      <BackRow label="원재료명 및 함량">
        {data.ingredients.map((ing, i) => {
          const isAllergen = data.detectedAllergens.includes(ing.name);
          const text = `${ing.name}${ing.origin ? `(${ing.origin})` : ''} ${ing.pct}%`;
          return (
            <span key={i}>
              {/* GAP 2 — 알레르기 원료 <strong> + Heritage 컬러 강조 */}
              {isAllergen
                ? <strong style={{ fontWeight: 800, color: HERITAGE }}>{text}</strong>
                : <span>{text}</span>}
              {i < data.ingredients.length - 1 ? <span style={{ color: FAINT }}>, </span> : null}
            </span>
          );
        })}
      </BackRow>

      {/* 알레르기 — detectedAllergens 자동 */}
      {data.detectedAllergens.length > 0 ? (
        <div style={{
          margin: '7px 0', padding: '7px 9px',
          border: `1.5px solid ${HERITAGE}`, background: 'rgba(0,45,114,0.04)',
          display: 'flex', gap: 8, alignItems: 'flex-start',
        }}>
          <span style={{ fontWeight: 700, color: HERITAGE, fontSize: 11, lineHeight: 1 }}>⚠</span>
          <div>
            <div style={{
              fontWeight: 700, color: HERITAGE, fontSize: 9,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2,
            }}>알레르기 유발물질</div>
            <div style={{ fontWeight: 700, color: INK, fontSize: 10 }}>
              {data.detectedAllergens.join(' · ')} 함유
            </div>
            <div style={{ color: FAINT, fontSize: 8.5, marginTop: 2 }}>
              같은 제조시설에서 우유·대두를 사용한 제품 생산
            </div>
          </div>
        </div>
      ) : null}

      <BackRow label="소비기한">{data.expiryDate} / 별도 표기</BackRow>
      {/* GAP 3 — 보관방법: 개봉 전 + 개봉 후 모두 표시 의무 */}
      <BackRow label="보관방법">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'baseline' }}>
          <span style={{
            fontFamily: 'Inter, system-ui, sans-serif', fontSize: 7.5, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: FAINT,
            padding: '1px 4px', border: `1px solid ${HAIRLINE}`, flexShrink: 0,
          }}>개봉 전</span>
          <span>{data.storageBefore || data.storage}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'baseline', marginTop: 3 }}>
          <span style={{
            fontFamily: 'Inter, system-ui, sans-serif', fontSize: 7.5, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: HERITAGE,
            padding: '1px 4px', border: `1px solid ${HERITAGE}`, flexShrink: 0,
          }}>개봉 후</span>
          <span>{data.storageAfter || '개봉 후 빠른 시일 내 섭취 권장'}</span>
        </div>
      </BackRow>

      {/* 영양성분 — nutritionExempted 분기 */}
      {!data.nutritionExempted ? (
        <div style={{ margin: '7px 0' }}>
          <div style={{
            fontSize: 8.5, fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: FAINT, marginBottom: 4,
          }}>영양성분 / {data.nutrition.basis}</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
            <tbody>
              {data.nutrition.rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                  <td style={{ padding: '3px 0', whiteSpace: 'pre' }}>{r.k}</td>
                  <td style={{ padding: '3px 0', textAlign: 'right', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>{r.v}</td>
                  <td style={{ padding: '3px 0 3px 8px', textAlign: 'right', color: FAINT, fontFamily: 'Inter, system-ui, sans-serif', width: 38 }}>{r.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 7.5, color: FAINT, marginTop: 4, lineHeight: 1.35 }}>
            ※ %영양성분기준치: 1일 영양성분 기준치에 대한 비율
          </div>
        </div>
      ) : (
        <div style={{
          margin: '9px 0', padding: '9px 11px',
          border: `1px dashed ${HAIRLINE}`, background: 'rgba(10,10,11,0.02)',
          fontSize: 9, color: FAINT, lineHeight: 1.5,
        }}>
          <b style={{ color: INK, fontWeight: 600 }}>소규모 제조업 면제</b><br/>
          식품등의 표시기준에 따라 영양성분 표시가 면제되는 사업장입니다.
        </div>
      )}

      <BackRow label="제조원">{data.manufacturer.name} · {data.manufacturer.address.split(',')[0]} ({data.manufacturer.phone})</BackRow>
      <BackRow label="제조 유형">{data.businessType}</BackRow>
      <BackRow label="신고번호">{data.manufacturer.license}</BackRow>
      <BackRow label="반품 / 교환">구입처 또는 제조원</BackRow>

      {/* GAP 4 — 부정·불량식품 신고 1399 독립 표시 (식품 등의 표시·광고에 관한 법률 시행규칙 별표 2) */}
      <div style={{
        marginTop: 7,
        padding: '6px 9px',
        background: 'rgba(10,10,11,0.04)',
        borderTop: `1px solid ${INK}`,
        borderBottom: `1px solid ${HAIRLINE}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontSize: 9, letterSpacing: '-0.005em', color: INK,
        fontWeight: 600,
      }}>
        <span>부정·불량식품 신고는 국번 없이</span>
        <span style={{
          fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800, fontSize: 12, letterSpacing: '0.04em',
          padding: '1px 6px', background: INK, color: '#fff',
        }}>1399</span>
      </div>

      {/* Bottom — barcode + 분리배출 마크 (GAP 6 placeholder) */}
      <div style={{
        marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${HAIRLINE}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10,
      }}>
        <div>
          <div style={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 26 }}>
            {[2,1,3,1,2,2,1,3,1,1,2,1,3,2,1,2,1,3,1,2,1,2,3,1,2,1,1,2,3,1,2,1].map((w, i) => (
              <div key={i} style={{ width: w, height: '100%', background: i % 2 === 0 ? INK : 'transparent' }}/>
            ))}
          </div>
          <div style={{
            fontFamily: 'Inter, system-ui, sans-serif', fontSize: 8, letterSpacing: '0.18em', marginTop: 2,
          }}>8 809123 456789</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <RecycleMarkPlaceholder label="유리" />
          <RecycleMarkPlaceholder label="종이" />
        </div>
      </div>
    </div>
  );
}

function BackRow({ label, children }) {
  return (
    <div style={{
      display: 'flex', gap: 8, padding: '3px 0',
      borderBottom: `1px solid ${HAIRLINE}`, fontSize: 9.5,
    }}>
      <div style={{
        flex: '0 0 70px', fontSize: 8.5, fontWeight: 600,
        letterSpacing: '0.06em', color: FAINT, textTransform: 'uppercase', lineHeight: 1.55,
      }}>{label}</div>
      <div style={{ flex: 1, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function RecycleMark({ label }) {
  return (
    <div style={{
      width: 34, height: 34, border: `1px solid ${INK}`, borderRadius: '50%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M7 9l-3 4 3 4M17 15l3-4-3-4M5 13h14M19 11H5" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontSize: 7, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

// GAP 6 — 분리배출 마크 placeholder.
// 실제 인쇄 시 환경부 고시 2024-170호 공식 도안 (삼각화살표 ♺︎ + 재질명) SVG 교체 필요.
// 도안 크기 8mm 이상 (≈ 30px @96dpi). 현재는 placeholder 자리/크기/재질명만 시각화.
function RecycleMarkPlaceholder({ label }) {
  return (
    <div style={{
      width: 32, height: 32, border: `1px dashed ${INK}`,
      background: 'rgba(10,10,11,0.025)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
      position: 'relative',
    }}>
      {/* 임시 도안 아이콘 */}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M12 3 L18 13 L6 13 Z" stroke="rgba(10,10,11,0.6)" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      </svg>
      <span style={{ fontSize: 7, fontWeight: 600, color: 'rgba(10,10,11,0.7)' }}>{label}</span>
      {/* 표시: 공식 도안 자리 */}
      <span style={{
        position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'Inter, system-ui, sans-serif', fontSize: 6.5, fontWeight: 700, color: FAINT,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        background: '#fff', padding: '0 3px', whiteSpace: 'nowrap',
      }}>placeholder</span>
    </div>
  );
}

function PdfFoodLabel({ data = DATA_SA_JAM, tier = 'SA' }) {
  return (
    <A4>
      <div style={{ padding: '36px 50px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <PdfHeader docCode="PDF-01" docLabel={`식품 라벨 · ${toOfficial(data.categories[0])}`} />

        {/* Page title + business badge row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: 18, gap: 16,
        }}>
          <div>
            <h2 style={{
              margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.018em',
            }}>식품 라벨 인쇄용 · {data.productName}</h2>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: FAINT, letterSpacing: '-0.005em' }}>
              아래 두 라벨을 잘라 제품 전면과 후면에 부착하세요. 모서리 표시(﹂﹁)를 따라 절단.
            </p>
          </div>
          <BusinessBadge businessType={data.businessType} />
        </div>

        {/* Side-by-side */}
        <div style={{
          display: 'flex', gap: 36, justifyContent: 'center', alignItems: 'flex-start',
          marginTop: 10, marginBottom: 22,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <FrontLabel data={data} tier={tier} />
            <div style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT }}>전면 / FRONT</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <BackLabel data={data} tier={tier} />
            <div style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT }}>후면 / BACK</div>
          </div>
        </div>

        {/* Footer notes */}
        <div style={{
          marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${HAIRLINE}`,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20,
          fontSize: 9, color: FAINT, lineHeight: 1.6,
        }}>
          <FooterNote title="인쇄 안내">아트지 80g 이상 · 컬러 또는 흑백 모두 인쇄 가능 · 실제 크기 80×115mm</FooterNote>
          <FooterNote title="부착 안내">제품 표면 청결 후 부착 · 부착 후 24시간 내 냉장 보관 시 접착력 확인</FooterNote>
          <FooterNote title="법적 고지">
            라벨은 식품등의 표시기준(식약처)에 따라 자동 생성됨 · 인쇄 전 사업자 정보 재확인 권장
          </FooterNote>
        </div>
      </div>
    </A4>
  );
}

function FooterNote({ title, children }) {
  return (
    <div>
      <div style={{
        fontWeight: 600, color: INK, fontSize: 9,
        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4,
      }}>{title}</div>
      {children}
    </div>
  );
}

// =============================================================
// PDF ② 품목제조보고서 (v3)
// =============================================================

function PdfReport({ data = DATA_SA_JAM, tier = 'SA' }) {
  const ingredientsText = data.ingredients
    .map((i) => `${i.name}${i.origin ? `(${i.origin})` : ''} ${i.pct}%`)
    .join(', ');

  const nutritionText = data.nutritionExempted
    ? '소규모 제조업 면제 (식품등의 표시기준)'
    : `${data.nutrition.basis} 기준 — 열량 ${data.nutrition.rows[0].v}, 나트륨 ${data.nutrition.rows[1].v}, 탄수화물 ${data.nutrition.rows[2].v}, 지방 ${data.nutrition.rows[4].v}, 단백질 ${data.nutrition.rows[5].v}`;

  const rows = [
    ['품목명',           data.productName],
    ['선택 카테고리',     data.categories.join(' / ')],
    ['식약처 분류명',     data.categories.map(toOfficial).join(' / ')],
    ['제조 유형',         data.businessType],
    ['내용량',           `${data.totalWeight} ${data.unit}`],
    ['원재료명 및 배합비', ingredientsText],
    ['소비기한',         data.expiryDate],
    ['보관방법',         data.storage],
    ['영양성분',         nutritionText],
    ['포장재질',         '유리병(본체), 금속(뚜껑), 종이(라벨)'],
    ['제조업소명',       `${data.manufacturer.name} (대표: ${data.manufacturer.ceo})`],
    ['제조업소 소재지',   data.manufacturer.address],
    ['신고번호',         data.manufacturer.license],
    ['연락처',           `${data.manufacturer.phone} · ${data.manufacturer.email}`],
  ];

  return (
    <A4>
      <div style={{ padding: '40px 64px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <PdfHeader docCode="PDF-02" docLabel="입력 가이드" />

        {/* Centered title block */}
        <div style={{ textAlign: 'center', marginTop: 14, marginBottom: 18 }}>
          <div style={{
            fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10,
            letterSpacing: '0.22em', color: FAINT, textTransform: 'uppercase', marginBottom: 8,
          }}>Self-input Guide · 정부24 / 식품안전나라 온라인 신고 참고용</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: INK, lineHeight: 1.15 }}>
            품목제조보고 입력 가이드
          </h1>
          <div style={{ margin: '12px auto 0', width: 60, height: 2, background: HERITAGE }}/>
        </div>

        {/* Self-input guide notice block — 정부24 / 식품안전나라 (v4) */}
        <div style={{
          margin: '0 0 16px',
          padding: '12px 14px',
          background: '#FFF8E1',
          border: `1px solid #E0D7B0`,
          borderLeft: `3px solid ${SYS_WARN}`,
          fontSize: 10, lineHeight: 1.6, color: 'rgba(10,10,11,0.78)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 9.5, fontWeight: 700, color: SYS_WARN,
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 5,
          }}>
            <span>📌 입력 가이드 안내</span>
          </div>
          <div style={{ marginBottom: 6 }}>
            본 문서는 <b style={{ color: INK, fontWeight: 600 }}>식품위생법 시행규칙 별지 제43호서식</b>을 기준으로 krk.team이 입력 편의를 위해 자동 작성한 가이드입니다.
          </div>
          <div style={{ marginTop: 6, color: INK }}>
            <b style={{ fontWeight: 600 }}>⚠ 실제 품목제조보고는 직접 신고하셔야 합니다:</b>
          </div>
          <ul style={{
            margin: '4px 0 0', padding: '0 0 0 16px', fontSize: 10, color: 'rgba(10,10,11,0.78)',
            lineHeight: 1.6, listStyle: 'disc',
          }}>
            <li>정부24 · <span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>gov.kr</span> &gt; 식품·식품첨가물의 품목제조보고</li>
            <li>식품안전나라 · <span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>foodsafetykorea.go.kr</span></li>
            <li>오프라인 · 관할 시·군·구청 위생과 방문</li>
          </ul>
        </div>

        {/* Meta strip — adds tier badge row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 10, color: FAINT, marginBottom: 14, paddingBottom: 10,
          borderBottom: `1px solid ${HAIRLINE}`,
        }}>
          <span>가이드 번호: <b style={{ color: INK, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>KRK-MFR-20260519-3148</b></span>
          <span>작성일: <b style={{ color: INK, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>2026. 05. 19</b></span>
          <BusinessBadge businessType={data.businessType} size="sm" />
        </div>

        {/* Table */}
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          fontSize: 11, border: `1px solid ${RULE}`,
        }}>
          <tbody>
            {rows.map(([label, value], i) => (
              <tr key={i}>
                <td style={{
                  width: 170, padding: '10px 14px', background: '#F5F5F5',
                  borderBottom: `1px solid ${HAIRLINE}`, borderRight: `1px solid ${HAIRLINE}`,
                  fontWeight: 600, letterSpacing: '-0.005em', verticalAlign: 'top',
                }}>{label}</td>
                <td style={{
                  padding: '10px 14px', borderBottom: `1px solid ${HAIRLINE}`,
                  letterSpacing: '-0.005em', lineHeight: 1.55,
                }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Statutory clause */}
        <div style={{
          marginTop: 18, padding: '12px 16px', background: '#F5F5F5',
          fontSize: 10, lineHeight: 1.65, color: 'rgba(10,10,11,0.7)',
        }}>
          위 표의 내용은 식품위생법 제37조 및 동법 시행규칙 제45조 별지 제43호서식 항목 입력 시 참고하시기 위한 자동 작성 결과입니다.
        </div>

        {/* Bottom block */}
        <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            paddingTop: 16, borderTop: `1px solid ${HAIRLINE}`,
          }}>
            <div style={{ fontSize: 10, color: FAINT, lineHeight: 1.65, maxWidth: 380 }}>
              본 가이드는 <b style={{ color: INK, fontWeight: 600 }}>krk.team</b> 자동 작성 가이드입니다.
              실제 신고는 <b style={{ color: INK, fontWeight: 600 }}>정부24 (gov.kr)</b> 에서 진행해주세요.<br/>
              <span style={{ color: 'rgba(10,10,11,0.55)' }}>본 문서는 식품의약품안전처 공식 문서가 아닙니다.</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: FAINT, marginBottom: 6 }}>
                작성일: <b style={{ color: INK, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>2026.    05.    19</b>
              </div>
              <div style={{
                width: 200, height: 48, border: `1px solid ${HAIRLINE}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: FAINT,
                letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>사업자 메모란</div>
            </div>
          </div>
        </div>
      </div>
    </A4>
  );
}

// =============================================================
// PDF ③ 검토 완료 인증서 (v3)
// =============================================================

// 3-way result icons (브리프 컬러)
function ResultPill({ status }) {
  const map = {
    pass:      { c: PRN_PASS, label: '통과', icon: <PassIcon /> },
    warn:      { c: PRN_WARN, label: '주의', icon: <WarnIcon /> },
    violation: { c: PRN_VIOL, label: '위반', icon: <ViolIcon /> },
  };
  const m = map[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      color: m.c, fontWeight: 600,
    }}>
      {m.icon} {m.label}
    </span>
  );
}

function PassIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M2 6.3L4.7 9L10 3.3" stroke={PRN_PASS} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M6 1.5L11 10.5H1L6 1.5Z" stroke={PRN_WARN} strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M6 5v2.5" stroke={PRN_WARN} strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="6" cy="9.1" r="0.55" fill={PRN_WARN}/>
    </svg>
  );
}

function ViolIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke={PRN_VIOL} strokeWidth="1.4" fill="none"/>
      <path d="M3.5 3.5L8.5 8.5M8.5 3.5L3.5 8.5" stroke={PRN_VIOL} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

// Review item presets
const REVIEW_ITEMS_BASE = [
  ['R01', '제품명 표시',           '식품등의 표시기준 제3조 1항'],
  ['R02', '식품유형 표시',         '식품등의 표시기준 제3조 2항'],
  ['R03', '내용량 표시',           '식품등의 표시기준 제3조 6항'],
  ['R04', '원재료명 표시 (함량순)', '식품등의 표시기준 제3조 4항'],
  ['R05', '알레르기 유발물질 표시', '식품등의 표시기준 제3조 4항-사'],
  ['R06', '영양성분 표시',         '식품등의 표시기준 제6조'],
  ['R07', '소비기한 표시',         '식품등의 표시기준 제3조 5항'],
  ['R08', '보관방법 표시',         '식품등의 표시기준 제3조 5항-나'],
  ['R09', '제조원 표시',           '식품등의 표시기준 제3조 3항'],
  ['R10', '주의사항 / 경고문구',   '식품등의 표시기준 제3조 7항'],
  ['R11', '반품 / 교환 안내',      '소비자기본법 제19조'],
  ['R12', '표시면 가독성 (글자크기)', '식품등의 표시기준 제4조'],
];

function buildReviewResults(resultMode) {
  // 'all-pass' | 'mixed' | 'violation'
  if (resultMode === 'all-pass') {
    return REVIEW_ITEMS_BASE.map(([c, n, l]) => [c, n, l, 'pass', null]);
  }
  if (resultMode === 'mixed') {
    return REVIEW_ITEMS_BASE.map(([c, n, l], i) => {
      if (i === 4) return [c, n, l, 'warn', '같은 제조시설 교차오염 표시 권장'];
      if (i === 9) return [c, n, l, 'warn', '권장 주의문구 1건 누락'];
      return [c, n, l, 'pass', null];
    });
  }
  if (resultMode === 'violation') {
    return REVIEW_ITEMS_BASE.map(([c, n, l], i) => {
      if (i === 5) return [c, n, l, 'violation', '영양성분 일부 항목 누락 — 표시 추가 필요'];
      if (i === 4) return [c, n, l, 'warn', '같은 제조시설 교차오염 표시 권장'];
      if (i === 11) return [c, n, l, 'warn', '한글 글자 크기 권장 기준 미달'];
      return [c, n, l, 'pass', null];
    });
  }
  return REVIEW_ITEMS_BASE.map(([c, n, l]) => [c, n, l, 'pass', null]);
}

function summarizeResults(items) {
  const counts = { pass: 0, warn: 0, violation: 0 };
  items.forEach((r) => { counts[r[3]] += 1; });
  return counts;
}

// v4: "검토 완료 인증서" → "krk 라벨 검토 리포트 (자율 점검 기록)"
//  - "인증서/Certificate" 단어 전면 제거
//  - 상단 4항목 면책 블록 명시
//  - QR 제거 → 일련번호 박스
//  - Tier/베타 ribbon 제거 (service-v2)
function PdfCertificate({ data = DATA_SA_JAM, tier, resultMode = 'all-pass' }) {
  // tier prop은 backwards-compat용으로만 받음 (렌더링에 사용 안 함)
  const reviews = buildReviewResults(resultMode);
  const counts = summarizeResults(reviews);
  const total = reviews.length;

  const heroStatus =
    counts.violation > 0 ? 'violation' :
    counts.warn > 0      ? 'warn'      :
                            'pass';
  const heroColor =
    heroStatus === 'violation' ? PRN_VIOL :
    heroStatus === 'warn'      ? PRN_WARN :
                                 PRN_PASS;

  return (
    <A4 bg="#fff">
      {/* Heritage header */}
      <div style={{ background: HERITAGE, color: '#fff', padding: '28px 50px 24px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Logo size={20} color="#fff" />
          <div style={{
            fontFamily: 'Inter, system-ui, sans-serif', fontSize: 9,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.62)',
          }}>PDF-03 · 자율 점검 기록</div>
        </div>

        <div style={{ marginTop: 18, maxWidth: 540 }}>
          <div style={{
            fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10,
            letterSpacing: '0.28em', color: 'rgba(255,255,255,0.65)',
            textTransform: 'uppercase', marginBottom: 8,
          }}>Label Review Report — Self-Audit Record</div>
          <h1 style={{
            margin: 0, fontSize: 28, fontWeight: 700,
            letterSpacing: '-0.02em', lineHeight: 1.1,
          }}>krk 라벨 검토 리포트</h1>
          <div style={{
            marginTop: 6, fontSize: 13, fontWeight: 500,
            color: 'rgba(255,255,255,0.82)', letterSpacing: '-0.005em',
          }}>사업자 자율 점검 기록</div>
        </div>

        {/* Record number box — bottom-right of header */}
        <div style={{
          position: 'absolute', right: 50, bottom: 20,
          border: '1px solid rgba(255,255,255,0.25)',
          padding: '8px 12px',
          display: 'flex', flexDirection: 'column', gap: 2,
          minWidth: 168,
        }}>
          <div style={{
            fontFamily: 'Inter, system-ui, sans-serif', fontSize: 8.5,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
          }}>Record ID · 기록 번호</div>
          <div style={{
            fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13,
            fontWeight: 600, letterSpacing: '0.02em',
          }}>KRK-20260519-3148</div>
        </div>
      </div>

      <div style={{ padding: '22px 50px 28px', display: 'flex', flexDirection: 'column' }}>
        {/* 🚨 IMPORTANT DISCLAIMER BLOCK — v4: 본문 상단 명시 (푸터 작은 글씨에서 이동) */}
        <div style={{
          padding: '12px 16px 10px', marginBottom: 16,
          background: '#FFF5F5', border: `2px solid ${PRN_VIOL}`,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11.5, fontWeight: 700, color: PRN_VIOL,
            letterSpacing: '-0.005em', marginBottom: 7,
          }}>
            <span style={{ fontSize: 13, lineHeight: 1 }}>⚠️</span>
            중요 안내 — 반드시 읽어주세요
          </div>
          <p style={{
            margin: '0 0 7px', fontSize: 10, lineHeight: 1.55,
            color: INK, letterSpacing: '-0.005em',
          }}>
            본 리포트는 <b style={{ fontWeight: 600 }}>krk.team 시스템이 입력된 정보를 기준으로 자동 검토한 결과</b>이며, 아래 사항을 명확히 안내합니다:
          </p>
          <ol style={{
            margin: 0, padding: 0, listStyle: 'none',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 18px',
            fontSize: 10, lineHeight: 1.55, color: INK, letterSpacing: '-0.005em',
            counterReset: 'disc',
          }}>
            {[
              <span><b style={{ fontWeight: 600 }}>식품의약품안전처 / 관할 시·군·구청이 발급한 공식 인증서가 아닙니다.</b></span>,
              <span><b style={{ fontWeight: 600 }}>법적 효력이 없습니다.</b></span>,
              <span>식품 표시기준 준수의 최종 책임은 <b style={{ fontWeight: 600 }}>사업자에게</b> 있습니다.</span>,
              <span>법규 개정 시 <b style={{ fontWeight: 600 }}>재검토가 필요</b>합니다.</span>,
            ].map((node, i) => (
              <li key={i} style={{ display: 'flex', gap: 7, alignItems: 'baseline' }}>
                <span style={{
                  fontFamily: 'Inter, system-ui, sans-serif', fontSize: 9, fontWeight: 700,
                  color: PRN_VIOL, minWidth: 14, flexShrink: 0,
                }}>{i + 1}.</span>
                <span style={{ flex: 1 }}>{node}</span>
              </li>
            ))}
          </ol>
          <div style={{
            marginTop: 7, paddingTop: 6, borderTop: `1px solid rgba(179,0,0,0.18)`,
            fontSize: 9.5, color: 'rgba(10,10,11,0.65)', letterSpacing: '-0.005em', lineHeight: 1.5,
          }}>
            본 리포트는 사업자의 <b style={{ color: INK, fontWeight: 600 }}>자율 점검 노력 기록</b> 용도로만 활용하시기 바랍니다.
          </div>
        </div>

        {/* Info strip — 4 fields */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
          paddingBottom: 14, borderBottom: `1px solid ${HAIRLINE}`,
        }}>
          <CertField label="기록 번호" value="KRK-20260519-3148" mono />
          <CertField label="작성 일시" value="2026-05-19 14:32 KST" />
          <CertField label="제품명" value={`${data.productName} (${toOfficial(data.categories[0])}, ${data.totalWeight}${typeof data.unit === 'string' && data.unit.length < 4 ? data.unit : ''})`} />
          <CertField label="사업장 유형">
            <BusinessBadge businessType={data.businessType} size="sm" />
          </CertField>
        </div>

        {/* Summary strip */}
        <div style={{
          margin: '14px 0 10px', padding: '12px 14px',
          background: heroStatus === 'pass' ? PRN_PASS_BG : heroStatus === 'warn' ? PRN_WARN_BG : PRN_VIOL_BG,
          border: `1px solid ${heroColor}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: heroColor, marginBottom: 3 }}>
              자율 점검 결과 / Self-Audit Summary
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: INK, letterSpacing: '-0.015em' }}>
              {heroStatus === 'pass' ? `${total}건 전체 통과` :
               heroStatus === 'warn' ? `통과 ${counts.pass}건 · 주의 ${counts.warn}건` :
                                       `통과 ${counts.pass}건 · 주의 ${counts.warn}건 · 위반 ${counts.violation}건`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, fontFamily: 'Inter, system-ui, sans-serif' }}>
            <CountStat n={counts.pass} label="PASS" color={PRN_PASS} />
            <CountStat n={counts.warn} label="WARN" color={PRN_WARN} />
            <CountStat n={counts.violation} label="VIOL" color={PRN_VIOL} />
          </div>
        </div>

        {/* Review items table */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: FAINT,
            }}>점검 항목 결과 · 총 {total}건</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
            <thead>
              <tr style={{ background: '#F5F5F5' }}>
                <th style={cellHead(50)}>코드</th>
                <th style={cellHead(null, 'left')}>점검 항목명</th>
                <th style={cellHead(null, 'left')}>관련 조항</th>
                <th style={cellHead(60)}>결과</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(([code, name, clause, status, note], i) => (
                <React.Fragment key={i}>
                  <tr>
                    <td style={cellBody(50, 'center', true)}>{code}</td>
                    <td style={cellBody(null, 'left')}>{name}</td>
                    <td style={cellBody(null, 'left', false, true)}>{clause}</td>
                    <td style={cellBody(60, 'center')}>
                      <ResultPill status={status} />
                    </td>
                  </tr>
                  {note ? (
                    <tr>
                      <td style={{ borderBottom: `1px solid ${HAIRLINE}`, padding: 0 }}/>
                      <td colSpan={3} style={{
                        padding: '1px 12px 5px', borderBottom: `1px solid ${HAIRLINE}`,
                        fontSize: 9.5, color: status === 'violation' ? PRN_VIOL : PRN_WARN,
                        letterSpacing: '-0.005em', lineHeight: 1.45,
                      }}>↳ {note}</td>
                    </tr>
                  ) : null}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom block — v4: QR 제거, 일련번호 박스로 대체 */}
        <div style={{ paddingTop: 16 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-end', gap: 20,
          }}>
            <div style={{ flex: 1, fontSize: 9.5, color: FAINT, lineHeight: 1.55 }}>
              <div style={{
                fontWeight: 600, color: INK, fontSize: 9,
                letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4,
              }}>자율 점검 기록 / Self-Audit Record</div>
              <span style={{ color: INK, fontWeight: 500 }}>krk 라벨 검토 리포트</span> — 사업자 자율 점검 기록 <span style={{ color: PRN_VIOL, fontWeight: 600 }}>(법적 효력 없음)</span>.
              본 기록은 사업자의 자율 점검 노력을 보여주는 참고 자료이며, 식약처 공식 인증이 아닙니다.
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0,
              padding: '10px 14px', border: `1px solid ${RULE}`, minWidth: 188,
            }}>
              <div style={{
                fontFamily: 'Inter, system-ui, sans-serif', fontSize: 8.5,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: FAINT, fontWeight: 600,
              }}>Record ID · 기록 번호</div>
              <div style={{
                fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13,
                fontWeight: 600, letterSpacing: '0.02em', color: INK,
              }}>KRK-20260519-3148</div>
              <div style={{
                fontSize: 9, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.4, marginTop: 2,
              }}>작성일 · 2026-05-19 14:32 KST</div>
            </div>
          </div>

          <div style={{
            marginTop: 14, paddingTop: 10, borderTop: `1px solid ${HAIRLINE}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10,
          }}>
            <Logo size={13} />
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 9.5, color: FAINT, letterSpacing: '0.06em' }}>
              krk.team · 자율 점검 기록 보관용
            </div>
          </div>
        </div>
      </div>
    </A4>
  );
}

function CountStat({ n, label, color }) {
  return (
    <div style={{ textAlign: 'right', minWidth: 42 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{n}</div>
      <div style={{ fontSize: 8.5, color: FAINT, letterSpacing: '0.14em', marginTop: 3 }}>{label}</div>
    </div>
  );
}

function CertField({ label, value, mono = false, children }) {
  return (
    <div>
      <div style={{
        fontSize: 9, fontWeight: 600,
        letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT, marginBottom: 5,
      }}>{label}</div>
      {children ? children : (
        <div style={{
          fontSize: 12.5, fontWeight: 500,
          letterSpacing: mono ? '0.02em' : '-0.005em', color: INK,
          fontFamily: mono ? 'Inter, system-ui, sans-serif' : undefined,
        }}>{value}</div>
      )}
    </div>
  );
}

function FauxQR() {
  return (
    <div style={{
      width: 64, height: 64,
      background: `repeating-conic-gradient(${INK} 0% 25%, transparent 25% 50%) 0 0 / 10px 10px, repeating-conic-gradient(${INK} 0% 25%, transparent 25% 50%) 5px 5px / 10px 10px`,
      position: 'relative', border: `2px solid ${INK}`,
    }}>
      <div style={{ position: 'absolute', inset: 6, background: '#fff' }}/>
      <div style={{ position: 'absolute', inset: 12, background: INK }}/>
      <div style={{ position: 'absolute', inset: 18, background: '#fff' }}/>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16, border: `3px solid ${INK}`, background: '#fff' }}/>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, border: `3px solid ${INK}`, background: '#fff' }}/>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 16, height: 16, border: `3px solid ${INK}`, background: '#fff' }}/>
    </div>
  );
}

function cellHead(width, align) {
  return {
    width: width || 'auto', padding: '6px 10px', textAlign: align || 'center',
    fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: FAINT, borderBottom: `1px solid ${RULE}`, borderTop: `1px solid ${RULE}`,
  };
}

function cellBody(width, align, mono, faint) {
  return {
    width: width || 'auto', padding: '5px 10px', textAlign: align || 'left',
    borderBottom: `1px solid ${HAIRLINE}`,
    fontFamily: mono ? 'Inter, system-ui, sans-serif' : undefined,
    fontWeight: mono ? 500 : 400, color: faint ? FAINT : INK,
    fontSize: faint ? 10 : 10.5, letterSpacing: '-0.005em',
  };
}

Object.assign(window, {
  PdfFoodLabel, PdfReport, PdfCertificate,
  DATA_SA_JAM, DATA_B_VIT,
});
