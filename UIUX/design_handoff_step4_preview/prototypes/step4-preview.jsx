/* global React */
// step4-preview.jsx — Step 4 / 라벨 미리보기
//
// Props:
//   variation : 'A' | 'B'     (A = label hero · 와이어 그대로 / B = review hero · 검토 결과 메인)
//   mode      : 'all-pass' | 'missing' | 'exempt' | 'multi-violation'
//   device    : 'desktop' | 'mobile'

const { useMemo } = React;

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
const RULE          = 'rgba(10,10,11,0.85)';

const SYS_OK     = '#1F8A5B';
const SYS_OK_BG  = 'rgba(31,138,91,0.06)';
const SYS_WARN   = '#B07A1A';
const SYS_WARN_BG = 'rgba(176,122,26,0.06)';
const ERROR      = '#B30000';
const ERROR_BG   = 'rgba(179,0,0,0.04)';
const ERROR_LINE = 'rgba(179,0,0,0.25)';

const FONT_KR = 'Pretendard, "Pretendard Variable", system-ui, -apple-system, sans-serif';
const FONT_EN = 'Inter, system-ui, sans-serif';

// ─── Sample data ─────────────────────────────────────────────
const DATA_JAM = {
  productName: '수제 딸기잼',
  productNameEn: 'Handmade Strawberry Jam',
  category: '잼류',
  categoryOfficial: '잼류',
  feature: '경기도 농가 딸기 60% · 무첨가 펙틴',
  businessType: '식품제조가공업',
  ingredients: [
    { name: '딸기',     origin: '국산', pct: 60 },
    { name: '설탕',     origin: null,   pct: 30 },
    { name: '레몬과즙', origin: '국산', pct: 7 },
    { name: '펙틴',     origin: null,   pct: 2.5 },
    { name: '구연산',   origin: null,   pct: 0.5 },
  ],
  detectedAllergens: ['딸기'],
  totalWeight: '200',
  unit: 'g',
  storage: '직사광선을 피해 서늘한 곳 보관 · 개봉 후 냉장보관',
  expiryDate: '제조일로부터 12개월',
  manufacturerName: '쿡하우스',
  manufacturerAddr: '경기도 파주시 산업로 123, 2층',
  license: '제 2026-경기-파주-00000 호',
  nutritionExempted: false,
  nutrition: [
    { k: '열량',     v: '248 kcal' },
    { k: '나트륨',   v: '10 mg' },
    { k: '탄수화물', v: '60 g' },
    { k: '  당류',   v: '55 g' },
    { k: '지방',     v: '0.2 g' },
    { k: '단백질',   v: '0.5 g' },
  ],
};

const DATA_VIT = {
  productName: '데일리 비타민C 1000',
  productNameEn: 'Daily Vitamin C 1000',
  category: '건강식품(일반)',
  categoryOfficial: '기타식품류',
  feature: '식약처 기타식품류 매핑 · 1정 1000mg',
  businessType: '즉석판매제조·가공업',
  ingredients: [
    { name: 'L-아스코르브산',           origin: null, pct: 85 },
    { name: '결정셀룰로스',             origin: null, pct: 10 },
    { name: '히드록시프로필메틸셀룰로스', origin: null, pct: 3 },
    { name: '스테아르산마그네슘',       origin: null, pct: 2 },
  ],
  detectedAllergens: [],
  totalWeight: '60',
  unit: '정',
  storage: '습기와 직사광선을 피해 서늘한 곳에 보관',
  expiryDate: '제조일로부터 24개월',
  manufacturerName: '바이탈웍스',
  manufacturerAddr: '서울특별시 성동구 성수동 456-7',
  license: '제 2026-서울-성동-00012 호',
  nutritionExempted: true,
  nutrition: null,
};

// ─── Mode preset ─────────────────────────────────────────────
function presetFor(mode) {
  switch (mode) {
    case 'all-pass':
      return {
        data: DATA_JAM,
        issues: [],
        passes: [
          { title: '원재료명 표시 순서',         desc: '함량 내림차순 정렬 충족' },
          { title: '알레르기 유발물질',           desc: '딸기 자동 검출 · 강조 표기됨' },
          { title: '소비기한 · 보관방법',          desc: '제조일자 기준 표기 형식 충족' },
          { title: '영양성분 표시',               desc: '필수 항목 6종 모두 입력됨' },
          { title: '제조원 · 소재지 · 신고번호', desc: '필수 표시 항목 모두 확인' },
        ],
      };
    case 'missing':
      return {
        data: { ...DATA_JAM, manufacturerName: '', manufacturerAddr: '', detectedAllergens: [] },
        issues: [
          {
            id: 'mfg',
            kind: 'error',
            title: '제조원 정보',
            desc: '제조원명과 소재지가 비어 있어요. 라벨 인쇄 전 필수 표시 항목입니다.',
            stepIdx: 2, stepLabel: '사업자 정보',
          },
          {
            id: 'allergen',
            kind: 'warn',
            title: '알레르기 표시 누락',
            desc: '원재료에 딸기가 포함되어 있지만 알레르기 유발물질 표기가 누락되어 있어요.',
            stepIdx: 3, stepLabel: '원재료 정보',
          },
        ],
        passes: [
          { title: '원재료명 표시 순서',     desc: '함량 내림차순 정렬 충족' },
          { title: '소비기한 · 보관방법',      desc: '제조일자 기준 표기 형식 충족' },
          { title: '영양성분 표시',           desc: '필수 항목 6종 입력됨' },
        ],
      };
    case 'exempt':
      return {
        data: { ...DATA_JAM, nutritionExempted: true, nutrition: null, businessType: '즉석판매제조·가공업' },
        issues: [
          {
            id: 'exempt',
            kind: 'info',
            title: '영양성분 면제 적용 확인',
            desc: '즉판가공업 — 소규모 제조업 면제가 적용되어 영양성분 표시가 생략되었습니다. 해당 사항이 맞는지 확인해 주세요.',
            stepIdx: 1, stepLabel: '제품 정보',
          },
        ],
        passes: [
          { title: '원재료명 표시 순서',     desc: '함량 내림차순 정렬 충족' },
          { title: '알레르기 유발물질',       desc: '딸기 자동 검출 · 강조 표기됨' },
          { title: '소비기한 · 보관방법',      desc: '표기 형식 충족' },
          { title: '제조원 정보',             desc: '필수 표시 항목 모두 확인' },
        ],
      };
    case 'multi-violation':
      return {
        data: { ...DATA_JAM, manufacturerName: '', manufacturerAddr: '', detectedAllergens: [], nutritionExempted: false },
        issues: [
          {
            id: 'mfg',
            kind: 'error',
            title: '제조원 정보',
            desc: '제조원명과 소재지가 비어 있어요. 라벨 인쇄 전 필수 표시 항목입니다.',
            stepIdx: 2, stepLabel: '사업자 정보',
          },
          {
            id: 'allergen',
            kind: 'error',
            title: '알레르기 표시 누락',
            desc: '원재료에 딸기가 포함되어 있지만 알레르기 유발물질 표기가 누락되어 있어요.',
            stepIdx: 3, stepLabel: '원재료 정보',
          },
          {
            id: 'nutrition',
            kind: 'error',
            title: '영양성분 표시 누락',
            desc: '영양강조표시가 있어 면제 대상이 아닙니다. 9개 항목 입력이 필요합니다.',
            stepIdx: 3, stepLabel: '영양성분',
          },
          {
            id: 'expiry',
            kind: 'error',
            title: '소비기한 형식',
            desc: '제조일자 별도 표기 누락. 인쇄 전 표기 위치를 확인하세요.',
            stepIdx: 1, stepLabel: '제품 정보',
          },
          {
            id: 'storage',
            kind: 'warn',
            title: '보관방법 보완',
            desc: '개봉 전/후 보관조건을 모두 표기해 주세요.',
            stepIdx: 2, stepLabel: '사업자 정보',
          },
        ],
        passes: [
          { title: '원재료명 표시 순서', desc: '함량 내림차순 정렬 충족' },
          { title: '식품유형 표기',     desc: '식약처 분류명 매핑됨' },
        ],
      };
    default:
      return presetFor('missing');
  }
}

// ─── Logo & header atoms ────────────────────────────────────
function KrkLogo({ size = 14 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, lineHeight: 1, userSelect: 'none' }}>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color: INK, letterSpacing: '0.22em', textTransform: 'uppercase' }}>KRK CHECKER</span>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color: BREATH, marginLeft: '0.18em', lineHeight: 1 }}>·</span>
    </div>
  );
}

function StepProgress({ idx = 4, total = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i + 1 === idx;
        const done = i + 1 < idx;
        return (
          <div key={i} style={{
            width: active ? 28 : 14, height: 3,
            background: done || active ? HERITAGE : 'rgba(10,10,11,0.12)',
            transition: 'width 0.2s ease',
          }}/>
        );
      })}
    </div>
  );
}

function StepCrumb({ idx = 4, total = 4, label = '라벨 미리보기' }) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      fontSize: 10.5, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: HERITAGE,
    }}>
      <span style={{ display: 'inline-block', width: 18, height: 1, background: HERITAGE }}/>
      <span style={{ whiteSpace: 'nowrap', fontFamily: FONT_EN, fontWeight: 600 }}>STEP {pad(idx)} / {pad(total)}</span>
      <span style={{ color: MUTED, fontSize: 9, letterSpacing: '0.12em' }}>·</span>
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
      background: 'rgba(255,255,255,.72)',
      backdropFilter: 'blur(18px) saturate(160%)',
      WebkitBackdropFilter: 'blur(18px) saturate(160%)',
      flexShrink: 0,
    }}>
      {isDesktop ? <KrkLogo size={15} /> : (
        <button aria-label="뒤로" style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', display: 'inline-flex' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 5L7.5 10L12.5 15" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      <StepProgress idx={4} total={4} />
      {isDesktop ? (
        <div style={{ fontSize: 11, fontFamily: FONT_EN, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>krk.team/new/preview</div>
      ) : <KrkLogo size={12} />}
    </header>
  );
}

// ─── Status atoms ────────────────────────────────────────────
function StatusDot({ kind = 'ok', size = 6 }) {
  const c = kind === 'error' ? ERROR : kind === 'warn' ? SYS_WARN : kind === 'info' ? BREATH : SYS_OK;
  return <span style={{ width: size, height: size, background: c, display: 'inline-block', flexShrink: 0 }}/>;
}

function MetaLabel({ children }) {
  return (
    <div style={{
      fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT,
    }}>{children}</div>
  );
}

// ─── Cut marks for labels ────────────────────────────────────
function CutMarks({ scale = 1 }) {
  const corners = ['tl','tr','bl','br'];
  const sz = 10 * scale;
  return corners.map((p) => (
    <svg key={p} width={sz} height={sz} viewBox="0 0 10 10"
      style={{
        position: 'absolute',
        [p.includes('t') ? 'top' : 'bottom']: -sz/2,
        [p.includes('l') ? 'left' : 'right']: -sz/2,
        opacity: 0.55, pointerEvents: 'none',
      }}>
      <path d="M5 0 V10 M0 5 H10" stroke={RULE} strokeWidth="0.7"/>
    </svg>
  ));
}

// ─── FRONT LABEL ─────────────────────────────────────────────
function FrontLabel({ data, scale = 1 }) {
  const W = 320 * scale, H = 460 * scale;
  return (
    <div style={{
      position: 'relative', width: W, height: H,
      border: `1px solid ${RULE}`, background: '#fff',
      padding: `${26*scale}px ${22*scale}px`,
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
      fontFamily: FONT_KR,
    }}>
      <CutMarks scale={scale} />

      {/* brand strip (v2: BETA 마크 제거) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8*scale }}>
        <div style={{
          fontFamily: FONT_EN, fontSize: 9*scale, letterSpacing: '0.22em', textTransform: 'uppercase', color: FAINT,
        }}>{(data.manufacturerName || 'KRK CHECKER').toUpperCase()}</div>
        <div style={{
          fontFamily: FONT_EN, fontSize: 8*scale, letterSpacing: '0.18em', textTransform: 'uppercase', color: FAINT,
        }}>krk</div>
      </div>

      {/* 식품유형 배지 */}
      <div style={{
        display: 'inline-flex', alignSelf: 'flex-start',
        padding: `${3*scale}px ${9*scale}px`, background: HERITAGE, color: '#fff',
        fontSize: 10*scale, fontWeight: 600, letterSpacing: '0.06em',
        marginBottom: 22*scale,
      }}>식품유형 · {data.categoryOfficial}</div>

      {/* 제품명 */}
      <h1 style={{
        margin: 0, fontSize: 32*scale, fontWeight: 700,
        lineHeight: 1.08, letterSpacing: '-0.02em', color: INK, wordBreak: 'keep-all',
      }}>{data.productName}</h1>
      <div style={{
        fontFamily: FONT_EN, fontSize: 10.5*scale, fontWeight: 400, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: FAINT,
        marginTop: 6*scale, marginBottom: 14*scale,
      }}>{data.productNameEn}</div>

      {data.feature ? (
        <div style={{
          fontSize: 11*scale, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.5,
          marginBottom: 14*scale,
        }}>{data.feature}</div>
      ) : null}

      {/* Hero strip placeholder */}
      <div style={{
        flex: 1,
        background: 'repeating-linear-gradient(135deg, rgba(0,45,114,0.05) 0 6px, rgba(0,45,114,0.08) 6px 12px)',
        border: `1px solid ${HAIRLINE}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'JetBrains Mono, ui-monospace, Menlo, monospace',
        fontSize: 9.5*scale, color: 'rgba(0,45,114,0.5)', letterSpacing: '0.04em',
        marginBottom: 14*scale, minHeight: 80*scale,
      }}>product shot</div>

      {/* 내용량 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        paddingTop: 10*scale, borderTop: `1px solid ${HAIRLINE}`,
      }}>
        <span style={{
          fontSize: 9.5*scale, letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT,
        }}>내용량 / NET WT</span>
        <span style={{
          fontFamily: FONT_EN, fontWeight: 600, fontSize: 18*scale, letterSpacing: '-0.01em',
        }}>{data.totalWeight} {data.unit}</span>
      </div>
    </div>
  );
}

// ─── BACK LABEL ──────────────────────────────────────────────
function BackRow({ label, children, scale = 1, last }) {
  return (
    <div style={{
      display: 'flex', gap: 8*scale, padding: `${3*scale}px 0`,
      borderBottom: last ? 'none' : `1px solid ${HAIRLINE}`,
      fontSize: 9.5*scale,
    }}>
      <div style={{
        flex: `0 0 ${64*scale}px`, fontSize: 8.5*scale, fontWeight: 600,
        letterSpacing: '0.06em', color: FAINT, textTransform: 'uppercase', lineHeight: 1.55,
      }}>{label}</div>
      <div style={{ flex: 1, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function BackLabel({ data, scale = 1 }) {
  const W = 320 * scale, H = 460 * scale;
  return (
    <div style={{
      position: 'relative', width: W, height: H,
      border: `1px solid ${RULE}`, background: '#fff',
      padding: `${18*scale}px ${16*scale}px`,
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
      fontSize: 9.5*scale, lineHeight: 1.45, fontFamily: FONT_KR,
      overflow: 'hidden',
    }}>
      <CutMarks scale={scale} />

      {/* header strip */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        paddingBottom: 6*scale, marginBottom: 9*scale, borderBottom: `1px solid ${RULE}`,
      }}>
        <div style={{ fontWeight: 700, fontSize: 11*scale, letterSpacing: '-0.01em' }}>
          {data.productName} · {data.totalWeight}{data.unit && data.unit.length < 3 ? data.unit : ''}
        </div>
        <div style={{
          fontSize: 8*scale, color: FAINT, fontFamily: FONT_EN,
          letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>BACK</div>
      </div>

      <BackRow label="원재료명" scale={scale}>
        {data.ingredients.map((ing, i) => {
          const isAllergen = data.detectedAllergens.includes(ing.name);
          return (
            <span key={i}>
              <span style={isAllergen ? { fontWeight: 700, color: HERITAGE } : null}>
                {ing.name}{ing.origin ? `(${ing.origin})` : ''} {ing.pct}%
              </span>
              {i < data.ingredients.length - 1 ? <span style={{ color: FAINT }}>, </span> : null}
            </span>
          );
        })}
      </BackRow>

      {/* 알레르기 */}
      {data.detectedAllergens.length > 0 ? (
        <div style={{
          margin: `${7*scale}px 0`, padding: `${7*scale}px ${9*scale}px`,
          border: `1.5px solid ${HERITAGE}`, background: 'rgba(0,45,114,0.04)',
          display: 'flex', gap: 8*scale, alignItems: 'flex-start',
        }}>
          <span style={{ fontWeight: 700, color: HERITAGE, fontSize: 11*scale, lineHeight: 1 }}>!</span>
          <div>
            <div style={{
              fontWeight: 700, color: HERITAGE, fontSize: 8.5*scale,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2*scale,
            }}>알레르기 유발물질</div>
            <div style={{ fontWeight: 700, color: INK, fontSize: 10*scale }}>
              {data.detectedAllergens.join(' · ')} 함유
            </div>
          </div>
        </div>
      ) : null}

      <BackRow label="소비기한" scale={scale}>{data.expiryDate}</BackRow>
      <BackRow label="보관방법" scale={scale}>{data.storage}</BackRow>

      {/* 영양성분 */}
      {!data.nutritionExempted && data.nutrition ? (
        <div style={{ margin: `${7*scale}px 0` }}>
          <div style={{
            fontSize: 8.5*scale, fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: FAINT, marginBottom: 4*scale,
          }}>영양성분 · 100g 당</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9*scale }}>
            <tbody>
              {data.nutrition.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                  <td style={{ padding: `${3*scale}px 0`, whiteSpace: 'pre' }}>{r.k}</td>
                  <td style={{ padding: `${3*scale}px 0`, textAlign: 'right', fontFamily: FONT_EN, fontWeight: 500 }}>{r.v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          margin: `${9*scale}px 0`, padding: `${9*scale}px ${11*scale}px`,
          border: `1px dashed ${HAIRLINE}`, background: 'rgba(10,10,11,0.02)',
          fontSize: 9*scale, color: FAINT, lineHeight: 1.5,
        }}>
          <b style={{ color: INK, fontWeight: 600 }}>소규모 제조업 면제</b><br/>
          식품등의 표시기준에 따라 영양성분 표시가 면제되는 사업장입니다.
        </div>
      )}

      <BackRow label="제조원" scale={scale}>
        {data.manufacturerName || <span style={{ color: ERROR, fontWeight: 600 }}>—</span>}
        {' · '}
        {data.manufacturerAddr || <span style={{ color: ERROR, fontWeight: 600 }}>주소 미입력</span>}
      </BackRow>
      <BackRow label="신고번호" scale={scale} last>{data.license}</BackRow>

      {/* Barcode footer */}
      <div style={{
        marginTop: 'auto', paddingTop: 8*scale, borderTop: `1px solid ${HAIRLINE}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 22*scale }}>
            {[2,1,3,1,2,2,1,3,1,1,2,1,3,2,1,2,1,3,1,2,1,2,3,1,2,1,1,2,3,1,2,1].map((w, i) => (
              <div key={i} style={{ width: w*scale, height: '100%', background: i % 2 === 0 ? INK : 'transparent' }}/>
            ))}
          </div>
          <div style={{ fontFamily: FONT_EN, fontSize: 7.5*scale, letterSpacing: '0.18em', marginTop: 2*scale }}>
            8 809123 456789
          </div>
        </div>
        <div style={{ fontSize: 8*scale, color: FAINT, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          KRK · BETA
        </div>
      </div>
    </div>
  );
}

// ─── Status header card (top-right of header row) ────────────
function StatusCard({ issues, device, variant = 'header' }) {
  const n = issues.length;
  const errors = issues.filter((i) => i.kind === 'error').length;
  const warns  = issues.filter((i) => i.kind === 'warn').length;
  const infos  = issues.filter((i) => i.kind === 'info').length;
  const kind = errors ? 'error' : warns ? 'warn' : infos ? 'info' : 'ok';
  const color = kind === 'error' ? ERROR : kind === 'warn' ? SYS_WARN : kind === 'info' ? BREATH : SYS_OK;
  const bg = kind === 'error' ? ERROR_BG : kind === 'warn' ? SYS_WARN_BG : kind === 'info' ? 'rgba(12,164,249,0.06)' : SYS_OK_BG;

  const title = n === 0
    ? '검토 상태 · 모든 항목 확인 완료'
    : `검토 상태 · ${n}개 항목 확인 필요`;
  const subtitle = n === 0
    ? '라벨 PDF 생성 준비 완료. 다음 단계로 진행해 주세요.'
    : '라벨 PDF 생성 전 표시 항목을 한 번 더 정리합니다.';

  return (
    <aside style={{
      minWidth: variant === 'hero' ? 0 : 280,
      flex: variant === 'hero' ? '1 1 auto' : 'none',
      padding: variant === 'hero' ? '20px 22px' : '14px 16px',
      border: `1px solid ${color === ERROR ? ERROR_LINE : color === SYS_WARN ? 'rgba(176,122,26,0.3)' : color === BREATH ? 'rgba(12,164,249,0.25)' : 'rgba(31,138,91,0.25)'}`,
      borderLeft: `3px solid ${color}`,
      background: bg,
      display: 'flex', alignItems: 'flex-start', gap: 12,
      fontFamily: FONT_KR,
    }}>
      <div style={{
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minWidth: variant === 'hero' ? 60 : 50,
        padding: variant === 'hero' ? '4px 0' : '2px 0',
        whiteSpace: 'nowrap',
      }}>
        <div style={{
          fontFamily: FONT_EN, fontWeight: 700,
          fontSize: variant === 'hero' ? 32 : 24,
          color, lineHeight: 1, letterSpacing: '-0.02em',
        }}>{n === 0 ? '✓' : n}</div>
        {n > 0 ? (
          <div style={{
            fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase',
            color, marginTop: 4, fontWeight: 600, whiteSpace: 'nowrap',
          }}>{kind === 'error' ? 'ERR' : kind === 'warn' ? 'WARN' : 'INFO'}</div>
        ) : null}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: variant === 'hero' ? 15 : 13.5, fontWeight: 600, color: INK,
          letterSpacing: '-0.01em', lineHeight: 1.35, marginBottom: 4, wordBreak: 'keep-all',
        }}>{title}</div>
        <div style={{
          fontSize: variant === 'hero' ? 12.5 : 11.5, color: FAINT,
          letterSpacing: '-0.005em', lineHeight: 1.5, wordBreak: 'keep-all',
        }}>{subtitle}</div>
      </div>
    </aside>
  );
}

// ─── Issue card (right rail / hero list) ─────────────────────
function IssueCard({ issue, large }) {
  const c = issue.kind === 'error' ? ERROR : issue.kind === 'warn' ? SYS_WARN : BREATH;
  const lineC = issue.kind === 'error' ? ERROR_LINE : issue.kind === 'warn' ? 'rgba(176,122,26,0.3)' : 'rgba(12,164,249,0.25)';
  const bg = issue.kind === 'error' ? ERROR_BG : issue.kind === 'warn' ? SYS_WARN_BG : 'rgba(12,164,249,0.04)';
  const kindLabel = issue.kind === 'error' ? '필수' : issue.kind === 'warn' ? '주의' : '확인';
  return (
    <div style={{
      padding: large ? '18px 20px' : '12px 14px',
      background: bg, border: `1px solid ${lineC}`, borderLeft: `3px solid ${c}`,
      display: 'flex', flexDirection: 'column', gap: large ? 10 : 6,
      fontFamily: FONT_KR, minWidth: 0,
    }}>
      {/* badge on its own row to free up title width in narrow sidebars */}
      <span style={{
        alignSelf: 'flex-start',
        fontFamily: FONT_EN, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: c, padding: '2px 6px', border: `1px solid ${c}`, lineHeight: 1.2,
      }}>{kindLabel}</span>
      <strong style={{
        fontSize: large ? 15 : 13, fontWeight: 600, color: INK, letterSpacing: '-0.01em',
        lineHeight: 1.35, wordBreak: 'keep-all',
      }}>{issue.title}</strong>
      <div style={{
        fontSize: large ? 13 : 12, color: FAINT, lineHeight: 1.55, letterSpacing: '-0.005em',
        wordBreak: 'keep-all',
      }}>{issue.desc}</div>
      <button type="button" style={{
        alignSelf: 'flex-start', marginTop: 2,
        background: 'transparent', border: 'none', padding: '0 0 1px',
        color: HERITAGE, fontFamily: FONT_KR, fontSize: 12, fontWeight: 600,
        letterSpacing: '-0.005em', cursor: 'pointer',
        borderBottom: `1px solid ${BREATH}`,
        display: 'inline-flex', alignItems: 'center', gap: 4,
        whiteSpace: 'nowrap', maxWidth: '100%',
      }}>
        <span>Step {String(issue.stepIdx).padStart(2,'0')} 수정</span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M3 6h6M7 3l3 3-3 3" stroke={HERITAGE} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Pass card ───────────────────────────────────────────────
function PassCard({ pass, large }) {
  return (
    <div style={{
      padding: large ? '12px 14px' : '10px 12px',
      background: SYS_OK_BG, border: `1px solid rgba(31,138,91,0.22)`,
      display: 'flex', alignItems: 'flex-start', gap: 8,
      fontFamily: FONT_KR,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
        <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke={SYS_OK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: SYS_OK, letterSpacing: '-0.005em', lineHeight: 1.4, wordBreak: 'keep-all' }}>
          {pass.title}
        </div>
        {large && pass.desc ? (
          <div style={{ fontSize: 11.5, color: FAINT, marginTop: 3, lineHeight: 1.5, letterSpacing: '-0.005em', wordBreak: 'keep-all' }}>
            {pass.desc}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Footer actions ──────────────────────────────────────────
function FooterActions({ device, nextDisabled, nextLabel = '확인하고 검토 결과 보기' }) {
  const isDesktop = device === 'desktop';
  return (
    <footer style={{
      borderTop: `1px solid ${HAIRLINE_SOFT}`, background: CARD,
      padding: isDesktop ? '16px 56px' : '14px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, flexShrink: 0,
      flexWrap: !isDesktop ? 'wrap-reverse' : 'nowrap',
    }}>
      <button type="button" style={{
        padding: isDesktop ? '13px 22px' : '12px 18px',
        background: 'transparent', color: INK,
        border: `1px solid ${HAIRLINE}`,
        fontFamily: FONT_KR, fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em',
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M9 6H3M5 3L2 6l3 3" stroke={INK} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        이전 단계
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: isDesktop ? 1 : 'unset', justifyContent: 'flex-end' }}>
        {isDesktop ? (
          <div style={{
            fontSize: 11, color: MUTED, letterSpacing: '-0.005em',
          }}>라벨 미리보기는 참고용입니다. 인쇄 규격은 PDF에서 확정됩니다.</div>
        ) : null}
        <button type="button" disabled={nextDisabled} style={{
          padding: isDesktop ? '13px 24px' : '13px 22px',
          background: nextDisabled ? 'rgba(10,10,11,0.18)' : BREATH,
          color: '#fff', border: 'none',
          fontFamily: FONT_KR, fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em',
          cursor: nextDisabled ? 'not-allowed' : 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          width: !isDesktop ? '100%' : 'auto', justifyContent: 'center',
        }}>
          {nextLabel}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </footer>
  );
}

// =============================================================
// VARIATION A — Label hero (와이어프레임 그대로, KRK 톤 입힘)
// =============================================================
function VariationA({ data, issues, passes, device }) {
  const isDesktop = device === 'desktop';
  const xPad = isDesktop ? 56 : 20;

  return (
    <div style={{ flex: 1, overflow: 'auto', background: SURFACE }}>
      <div style={{
        padding: `${isDesktop ? 28 : 22}px ${xPad}px ${isDesktop ? 28 : 20}px`,
        maxWidth: isDesktop ? 1240 : '100%', margin: '0 auto', boxSizing: 'border-box',
      }}>
        {/* Page header row */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: 24, marginBottom: isDesktop ? 24 : 18,
          flexWrap: !isDesktop ? 'wrap' : 'nowrap',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <StepCrumb idx={4} total={4} label="라벨 미리보기" />
            <h1 style={{
              margin: '10px 0 6px', fontSize: isDesktop ? 28 : 22,
              fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>입력하신 정보를 라벨에 옮겨봤어요</h1>
            <p style={{ margin: 0, fontSize: 13.5, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55 }}>
              전면 · 후면 라벨을 나란히 확인하고, 누락 가능 항목이 있는지 점검합니다.
            </p>
          </div>
          {isDesktop ? <StatusCard issues={issues} device={device} /> : null}
        </div>

        {!isDesktop ? <div style={{ marginBottom: 18 }}><StatusCard issues={issues} device={device} /></div> : null}

        {/* Workspace */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'minmax(0,1fr) 300px' : '1fr',
          gap: isDesktop ? 20 : 18, alignItems: 'flex-start',
        }}>
          {/* Preview area */}
          <div style={{
            background: CARD, border: `1px solid ${HAIRLINE_SOFT}`,
            padding: isDesktop ? 24 : 18,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${HAIRLINE_SOFT}`,
              flexWrap: 'wrap',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>제품 라벨 시안</h2>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: FAINT, letterSpacing: '-0.005em' }}>
                  전면과 후면을 나란히 확인합니다.
                </p>
              </div>
              <div style={{
                fontSize: 10.5, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: FONT_EN, fontWeight: 500,
              }}>90 × 60 mm 기준</div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? 'repeat(2, minmax(0,1fr))' : '1fr',
              gap: isDesktop ? 20 : 24,
              justifyItems: 'center', padding: isDesktop ? '14px 0 4px' : '8px 0',
            }}>
              <div>
                <div style={{
                  fontFamily: FONT_EN, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: HERITAGE, marginBottom: 10,
                }}>① FRONT LABEL</div>
                <FrontLabel data={data} scale={isDesktop ? 1 : 0.92} />
              </div>
              <div>
                <div style={{
                  fontFamily: FONT_EN, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: HERITAGE, marginBottom: 10,
                }}>② BACK LABEL</div>
                <BackLabel data={data} scale={isDesktop ? 1 : 0.92} />
              </div>
            </div>
          </div>

          {/* Side panel */}
          <aside style={{
            display: 'flex', flexDirection: 'column', gap: 12,
            position: isDesktop ? 'sticky' : 'static', top: 24,
          }}>
            <div style={{
              background: CARD, border: `1px solid ${HAIRLINE_SOFT}`,
              padding: '16px 16px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.005em', whiteSpace: 'nowrap' }}>
                  수정 필요 항목
                </h3>
                <span style={{
                  fontFamily: FONT_EN, fontSize: 11, fontWeight: 600, color: issues.length ? INK : MUTED,
                  flexShrink: 0,
                }}>{String(issues.length).padStart(2,'0')}</span>
              </div>

              {issues.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {issues.map((iss) => <IssueCard key={iss.id} issue={iss} />)}
                </div>
              ) : (
                <div style={{
                  padding: '14px 12px', background: SYS_OK_BG, border: `1px solid rgba(31,138,91,0.22)`,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke={SYS_OK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 12, fontWeight: 600, color: SYS_OK, letterSpacing: '-0.005em' }}>
                    누락된 표시 항목이 없습니다
                  </span>
                </div>
              )}
            </div>

            <div style={{
              background: CARD, border: `1px solid ${HAIRLINE_SOFT}`,
              padding: '16px 16px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.005em', whiteSpace: 'nowrap' }}>
                  확인 완료
                </h3>
                <span style={{ fontFamily: FONT_EN, fontSize: 11, fontWeight: 600, color: SYS_OK, flexShrink: 0 }}>
                  {String(passes.length).padStart(2,'0')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {passes.map((p, i) => <PassCard key={i} pass={p} />)}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

// =============================================================
// VARIATION B — Review hero (검토 결과 메인, 라벨은 thumbnail)
// =============================================================
function VariationB({ data, issues, passes, device }) {
  const isDesktop = device === 'desktop';
  const xPad = isDesktop ? 56 : 20;

  return (
    <div style={{ flex: 1, overflow: 'auto', background: SURFACE }}>
      <div style={{
        padding: `${isDesktop ? 24 : 20}px ${xPad}px ${isDesktop ? 28 : 20}px`,
        maxWidth: isDesktop ? 1240 : '100%', margin: '0 auto', boxSizing: 'border-box',
      }}>
        {/* Page header */}
        <div style={{ marginBottom: isDesktop ? 18 : 14 }}>
          <StepCrumb idx={4} total={4} label="라벨 미리보기" />
          <h1 style={{
            margin: '10px 0 6px', fontSize: isDesktop ? 28 : 22,
            fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>라벨 정보를 한 번 더 점검해 주세요</h1>
          <p style={{ margin: 0, fontSize: 13.5, color: FAINT, letterSpacing: '-0.005em', lineHeight: 1.55 }}>
            라벨 PDF 생성 전, 필수 표시 항목이 누락되지 않았는지 확인합니다.
            우측 미리보기에서 실제 인쇄 형태를 함께 볼 수 있어요.
          </p>
        </div>

        {/* Workspace — 검토 결과 1fr + 라벨 thumbnail 300px */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'minmax(0,1fr) 300px' : '1fr',
          gap: isDesktop ? 22 : 18, alignItems: 'flex-start',
        }}>
          {/* Review hero column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 16 : 14, minWidth: 0 }}>
            {/* Status hero */}
            <StatusCard issues={issues} device={device} variant="hero" />

            {/* Issues block */}
            <div style={{
              background: CARD, border: `1px solid ${HAIRLINE_SOFT}`,
              padding: isDesktop ? '20px 24px 22px' : '16px 18px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>
                    수정이 필요한 항목
                  </h2>
                  <span style={{
                    fontFamily: FONT_EN, fontSize: 12, fontWeight: 600, color: issues.length ? INK : MUTED,
                  }}>{String(issues.length).padStart(2,'0')}</span>
                </div>
                <MetaLabel>Action required</MetaLabel>
              </div>

              {issues.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {issues.map((iss) => <IssueCard key={iss.id} issue={iss} large />)}
                </div>
              ) : (
                <div style={{
                  padding: '20px 20px', background: SYS_OK_BG, border: `1px solid rgba(31,138,91,0.22)`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="10" stroke={SYS_OK} strokeWidth="1.4"/>
                    <path d="M6.5 11.5L9.5 14.5L15.5 8" stroke={SYS_OK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: SYS_OK, letterSpacing: '-0.005em' }}>
                      누락된 표시 항목이 없습니다
                    </div>
                    <div style={{ fontSize: 12, color: FAINT, marginTop: 3, letterSpacing: '-0.005em' }}>
                      검토 결과 페이지에서 세부 결과를 한 번 더 확인할 수 있어요.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Passes block */}
            <div style={{
              background: CARD, border: `1px solid ${HAIRLINE_SOFT}`,
              padding: isDesktop ? '20px 24px 22px' : '16px 18px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>
                    확인 완료
                  </h2>
                  <span style={{ fontFamily: FONT_EN, fontSize: 12, fontWeight: 600, color: SYS_OK }}>
                    {String(passes.length).padStart(2,'0')}
                  </span>
                </div>
                <MetaLabel>표시 기준 충족</MetaLabel>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isDesktop ? 'repeat(2, minmax(0,1fr))' : '1fr',
                gap: 8,
              }}>
                {passes.map((p, i) => <PassCard key={i} pass={p} large />)}
              </div>
            </div>
          </div>

          {/* Right rail — label thumbnails (sticky) */}
          <aside style={{
            position: isDesktop ? 'sticky' : 'static', top: 20,
            display: 'flex', flexDirection: 'column', gap: 14,
            background: CARD, border: `1px solid ${HAIRLINE_SOFT}`,
            padding: '16px 16px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.005em' }}>
                라벨 미리보기
              </h3>
              <span style={{
                fontFamily: FONT_EN, fontSize: 10, fontWeight: 600, color: MUTED,
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>90 × 60 mm</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <div>
                <div style={{
                  fontFamily: FONT_EN, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: HERITAGE, marginBottom: 8, textAlign: 'center',
                }}>① FRONT</div>
                <FrontLabel data={data} scale={0.7} />
              </div>
              <div>
                <div style={{
                  fontFamily: FONT_EN, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: HERITAGE, marginBottom: 8, textAlign: 'center',
                }}>② BACK</div>
                <BackLabel data={data} scale={0.7} />
              </div>
            </div>

            <button type="button" style={{
              background: 'transparent', border: `1px solid ${HAIRLINE}`,
              padding: '10px 12px', color: INK,
              fontFamily: FONT_KR, fontSize: 12, fontWeight: 500, letterSpacing: '-0.005em',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 7c1.5-3 8-3 10 0M2 7c1.5 3 8 3 10 0" stroke={INK} strokeWidth="1.1" strokeLinecap="round"/>
                <circle cx="7" cy="7" r="2" stroke={INK} strokeWidth="1.1"/>
              </svg>
              크게 보기
            </button>
          </aside>
        </section>
      </div>
    </div>
  );
}

// =============================================================
// Step4Preview — main composition
// =============================================================
function Step4Preview({ variation = 'A', mode = 'missing', device = 'desktop' }) {
  const { data, issues, passes } = useMemo(() => presetFor(mode), [mode]);
  const errorCount = issues.filter((i) => i.kind === 'error').length;
  const nextDisabled = errorCount > 0;
  const nextLabel = nextDisabled
    ? `필수 항목 ${errorCount}개 수정 필요`
    : '확인하고 검토 결과 보기';

  return (
    <div style={{
      width: '100%', height: '100%', background: SURFACE,
      fontFamily: FONT_KR, color: INK,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      wordBreak: 'keep-all', overflowWrap: 'break-word',
    }}>
      <PageHeader device={device} />
      {variation === 'A'
        ? <VariationA data={data} issues={issues} passes={passes} device={device} />
        : <VariationB data={data} issues={issues} passes={passes} device={device} />}
      <FooterActions device={device} nextDisabled={nextDisabled} nextLabel={nextLabel} />
    </div>
  );
}

Object.assign(window, { Step4Preview });
