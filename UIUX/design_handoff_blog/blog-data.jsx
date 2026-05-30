/* global */
// blog-data.jsx — dummy content for KRK Checker Blog
// Shared between list + article views, both variants.

const CATEGORIES = [
  { id: 'all',        ko: '전체',          en: 'All' },
  { id: 'label',      ko: '라벨 기준',      en: 'Labeling' },
  { id: 'ingredient', ko: '원재료·알레르기', en: 'Ingredients' },
  { id: 'packaging',  ko: '분리배출·포장',   en: 'Packaging' },
  { id: 'filing',     ko: '품목제조보고',    en: 'Filing' },
  { id: 'cases',      ko: '브랜드 사례',     en: 'Cases' },
  { id: 'updates',    ko: 'KRK 업데이트',    en: 'Updates' },
];

const ARTICLES = [
  {
    id: 'a01', num: '01', cat: 'label',
    title: '식품 라벨에 꼭 들어가야 하는 9가지 표시사항',
    summary: '표시광고법이 정한 의무 표시사항 9가지. 빠뜨리면 판매 전 발견하기 어렵습니다.',
    time: 5, src: ['식품표시광고법', '식약처 고시'],
    date: '2026.05.24', featured: true, thumb: 'grid',
  },
  {
    id: 'a02', num: '02', cat: 'ingredient',
    title: '원재료명은 왜 함량순으로 써야 할까?',
    summary: '함량 표시 순서를 잘못 적으면 의외로 흔하게 시정 명령 대상이 됩니다.',
    time: 4, src: ['식품표시광고법 시행규칙'],
    date: '2026.05.22', thumb: 'orbit',
  },
  {
    id: 'a03', num: '03', cat: 'ingredient',
    title: '알레르기 유발물질 22품목, 라벨에서 놓치기 쉬운 부분',
    summary: '유사 원재료, 가공보조제, 미량 사용된 경우. 22품목을 자율 점검하는 체크리스트.',
    time: 6, src: ['식약처 고시 2024-66호'],
    date: '2026.05.20', thumb: 'arc',
  },
  {
    id: 'a04', num: '04', cat: 'ingredient',
    title: '무가당이라고 쓰면 영양성분표가 필요할 수 있어요',
    summary: '강조 표시 하나로 영양표시 의무 대상이 됩니다. 작은 브랜드일수록 놓치기 쉬운 부분.',
    time: 3, src: ['식품표시광고법 시행규칙 별표4'],
    date: '2026.05.18', thumb: 'bars',
  },
  {
    id: 'a05', num: '05', cat: 'packaging',
    title: '분리배출 마크, 작은 브랜드도 표시해야 할까?',
    summary: '제조·수입 규모에 따른 표시 의무. 면제 기준과 자율 표시의 차이를 정리합니다.',
    time: 4, src: ['자원재활용법'],
    date: '2026.05.15', thumb: 'tri',
  },
  {
    id: 'a06', num: '06', cat: 'packaging',
    title: '유리병+플라스틱 뚜껑, 포장재가 2개일 때 표시 기준',
    summary: '재질이 다른 포장재가 결합된 경우. 통합 표시와 각각 표시 중 어느 쪽이 맞을까.',
    time: 5, src: ['환경부 고시'],
    date: '2026.05.12', thumb: 'split',
  },
  {
    id: 'a07', num: '07', cat: 'label',
    title: '원산지 표시는 언제 굵게 써야 할까?',
    summary: '주표시면, 일괄표시면, 글자 크기와 굵기 기준을 한 페이지로 정리합니다.',
    time: 4, src: ['농수산물의 원산지 표시법'],
    date: '2026.05.08', thumb: 'frame',
  },
  {
    id: 'a08', num: '08', cat: 'filing',
    title: '식품제조가공업과 즉판가공업, 품목제조보고 차이',
    summary: '영업 종류에 따라 보고 양식과 검사 항목이 달라집니다. 작은 브랜드의 흔한 혼동.',
    time: 7, src: ['식품위생법'],
    date: '2026.05.04', thumb: 'dual',
  },
  {
    id: 'a09', num: '09', cat: 'cases',
    title: '라벨 PDF를 디자이너에게 넘기기 전 확인할 것',
    summary: '입고 직전 자율 점검을 도와주는 짧은 체크리스트. 디자이너 협업 관점에서 정리.',
    time: 3, src: ['자율 점검'],
    date: '2026.05.01', thumb: 'doc',
  },
  {
    id: 'a10', num: '10', cat: 'updates',
    title: 'KRK Checker는 검토 결과를 어떻게 보여주나요?',
    summary: '검토 결과 페이지의 구조와 신뢰도 표기 방식. 결과는 자율 점검 참고용입니다.',
    time: 4, src: ['KRK Checker'],
    date: '2026.04.28', thumb: 'screen',
  },
];

const catLabel = (id) => CATEGORIES.find((c) => c.id === id)?.ko || id;

// Tokens shared across blog
const KRK = {
  HERITAGE: '#002D72',
  BREATH:   '#0CA4F9',
  INK:      '#0A0A0B',
  INK_2:    'rgba(10,10,11,0.65)',
  INK_3:    'rgba(10,10,11,0.45)',
  INK_4:    'rgba(10,10,11,0.30)',
  RULE:     'rgba(10,10,11,0.10)',
  RULE_S:   'rgba(10,10,11,0.18)',
  PAPER:    '#FFFFFF',
  SURFACE:  '#F4F4F5',
  TINT:     '#F6F9FD',  // soft Breath tint
  TINT_2:   '#EFF5FB',
  FONT_KR:  'Pretendard, "Pretendard Variable", system-ui, -apple-system, sans-serif',
  FONT_EN:  'Inter, system-ui, sans-serif',
};

// ─────────────────────────────────────────────────────────
// Thumbnail — abstract gradient + simple geometric mark.
// Inspired by Toss Ads cards (soft sky/lavender washes), but
// confined to KRK's Breath / Heritage palette so it doesn't
// feel like a different brand.
// ─────────────────────────────────────────────────────────
function Thumb({ kind = 'grid', size = 'md', tone = 'light' }) {
  const palettes = {
    light: { a: '#DCE9F4', b: '#BBD3E8', c: '#9DD6FB', d: '#3AB2FA', e: '#002D72' },
    dark:  { a: '#001D4A', b: '#002D72', c: '#0CA4F9', d: '#9DD6FB', e: '#FFFFFF' },
  };
  const p = palettes[tone];
  const bg = tone === 'dark'
    ? `radial-gradient(120% 90% at 30% 30%, ${p.b} 0%, ${p.a} 60%, #000B1F 100%)`
    : `radial-gradient(120% 90% at 30% 30%, #FFF 0%, ${p.a} 45%, ${p.b} 100%)`;

  const stroke = tone === 'dark' ? p.d : p.e;
  const accent = tone === 'dark' ? p.c : p.d;

  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '4/3',
      background: bg, overflow: 'hidden',
      borderBottom: `1px solid ${tone === 'dark' ? 'rgba(255,255,255,0.06)' : KRK.RULE}`,
    }}>
      <ThumbMark kind={kind} stroke={stroke} accent={accent} tone={tone} />
      {/* subtle inner light */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,0.18), transparent 70%)',
        pointerEvents: 'none',
      }}/>
    </div>
  );
}

function ThumbMark({ kind, stroke, accent, tone }) {
  // All marks live in a 200×150 viewBox, centered.
  const common = { stroke, strokeWidth: 1.2, fill: 'none', strokeLinecap: 'square' };
  const fill   = { fill: accent, opacity: tone === 'dark' ? 0.9 : 0.85 };
  const fillSoft = { fill: tone === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,45,114,0.08)' };

  return (
    <svg viewBox="0 0 200 150" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {kind === 'grid' && (
        <g>
          {/* 9 cells grid — for 9가지 표시사항 */}
          {[0,1,2].map(r => [0,1,2].map(c => (
            <rect key={`${r}-${c}`} x={62 + c*26} y={37 + r*26} width="22" height="22" {...common} />
          )))}
          <rect x={62} y={37} width="22" height="22" {...fill} />
          <rect x={114} y={89} width="22" height="22" {...fill} opacity="0.45" />
        </g>
      )}
      {kind === 'orbit' && (
        <g>
          {/* nested ellipses — ingredient order */}
          <ellipse cx="100" cy="75" rx="60" ry="22" {...common} />
          <ellipse cx="100" cy="75" rx="44" ry="16" {...common} />
          <ellipse cx="100" cy="75" rx="26" ry="9" {...common} />
          <circle cx="100" cy="75" r="3" {...fill} />
          <circle cx="160" cy="75" r="2.5" {...fill} />
          <circle cx="40" cy="75" r="2.5" {...fill} opacity="0.5" />
        </g>
      )}
      {kind === 'arc' && (
        <g>
          {/* radial markers — 22 allergens */}
          {Array.from({length: 11}).map((_, i) => {
            const a = (Math.PI / 10) * i;
            const x1 = 100 + Math.cos(Math.PI + a) * 40;
            const y1 = 115 + Math.sin(Math.PI + a) * 40;
            const x2 = 100 + Math.cos(Math.PI + a) * 56;
            const y2 = 115 + Math.sin(Math.PI + a) * 56;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} {...common}
              opacity={i === 3 ? 1 : 0.45}
              stroke={i === 3 ? accent : stroke} strokeWidth={i === 3 ? 2 : 1} />;
          })}
          <path d="M 44 115 A 56 56 0 0 1 156 115" {...common} />
        </g>
      )}
      {kind === 'bars' && (
        <g>
          {/* nutrition bars */}
          {[44, 28, 56, 36, 68].map((h, i) => (
            <rect key={i} x={50 + i*22} y={110 - h} width="14" height={h} {...common} />
          ))}
          <rect x="94" y={110 - 56} width="14" height="56" {...fill} />
          <line x1="40" y1="110" x2="160" y2="110" {...common} />
        </g>
      )}
      {kind === 'tri' && (
        <g>
          {/* recycle triangle */}
          <polygon points="100,40 140,110 60,110" {...common} />
          <polygon points="100,48 130,102 70,102" {...fillSoft} />
          <circle cx="100" cy="75" r="2.5" {...fill} />
        </g>
      )}
      {kind === 'split' && (
        <g>
          {/* two stacked rectangles, different materials */}
          <rect x="68" y="32" width="64" height="38" {...common} />
          <rect x="60" y="74" width="80" height="42" {...common} />
          <line x1="60" y1="74" x2="140" y2="74" {...common} strokeDasharray="3 3" />
          <rect x="60" y="74" width="80" height="42" {...fillSoft} />
        </g>
      )}
      {kind === 'frame' && (
        <g>
          {/* label frame with emphasized strip */}
          <rect x="44" y="36" width="112" height="78" {...common} />
          <rect x="44" y="36" width="112" height="14" {...fill} />
          <line x1="56" y1="62" x2="144" y2="62" {...common} />
          <line x1="56" y1="72" x2="124" y2="72" {...common} />
          <line x1="56" y1="82" x2="138" y2="82" {...common} />
        </g>
      )}
      {kind === 'dual' && (
        <g>
          {/* two documents side by side */}
          <rect x="44" y="34" width="50" height="82" {...common} />
          <rect x="106" y="34" width="50" height="82" {...common} />
          <line x1="52" y1="50" x2="86" y2="50" {...common} />
          <line x1="52" y1="62" x2="86" y2="62" {...common} />
          <line x1="114" y1="50" x2="148" y2="50" {...common} />
          <line x1="114" y1="62" x2="148" y2="62" {...common} />
          <rect x="44" y="34" width="50" height="10" {...fill} />
          <rect x="106" y="34" width="50" height="10" {...fillSoft} />
        </g>
      )}
      {kind === 'doc' && (
        <g>
          {/* document with checks */}
          <rect x="62" y="28" width="76" height="98" {...common} />
          {[44, 56, 68, 80, 92, 104].map((y, i) => (
            <g key={y}>
              <rect x="70" y={y} width="6" height="6" {...common} />
              <line x1="80" y1={y+3} x2="130" y2={y+3} {...common} opacity="0.5" />
              {i < 3 && <path d={`M 71 ${y+3} L 73 ${y+5} L 75 ${y+1}`} stroke={accent} strokeWidth="1.4" fill="none" />}
            </g>
          ))}
        </g>
      )}
      {kind === 'screen' && (
        <g>
          {/* device showing result */}
          <rect x="68" y="22" width="64" height="106" rx="4" {...common} />
          <rect x="74" y="32" width="52" height="6" {...fill} />
          <line x1="74" y1="46" x2="116" y2="46" {...common} />
          <line x1="74" y1="54" x2="126" y2="54" {...common} />
          <line x1="74" y1="62" x2="110" y2="62" {...common} />
          <rect x="74" y="78" width="52" height="18" {...fillSoft} />
          <rect x="78" y="84" width="32" height="6" {...fill} />
        </g>
      )}
    </svg>
  );
}

Object.assign(window, { CATEGORIES, ARTICLES, KRK, Thumb, catLabel });
