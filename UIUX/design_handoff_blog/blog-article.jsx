/* global React, ARTICLES, KRK, Thumb, catLabel, BlogNav, BlogFooter */
// blog-article.jsx — KRK Checker Blog detail page
// Props:
//   device  : 'desktop' | 'mobile'
//   variant : 'A' | 'B'

// ═════════════════════════════════════════════════════════════
// Body content — rendered as React nodes; matches sample 1
// in krk-checker-blog-content-samples.md (다양한 요소 검증용)
// ═════════════════════════════════════════════════════════════
function ArticleBody({ device, variant }) {
  const isD = device === 'desktop';
  const isB = variant === 'B';

  const para = {
    fontFamily: KRK.FONT_KR,
    fontSize: isD ? 16 : 15,
    lineHeight: 1.85,
    color: KRK.INK,
    letterSpacing: '-0.01em',
    margin: '0 0 22px',
    textWrap: 'pretty',
  };
  const h2 = {
    fontFamily: KRK.FONT_KR,
    fontSize: isD ? 24 : 21,
    fontWeight: 700,
    lineHeight: 1.35,
    letterSpacing: '-0.025em',
    color: KRK.INK,
    margin: isD ? '56px 0 18px' : '40px 0 14px',
    paddingTop: isB ? 24 : 0,
    borderTop: isB ? `1px solid ${KRK.RULE}` : 'none',
    display: 'flex', alignItems: 'baseline', gap: 14,
  };
  const h2num = {
    fontFamily: KRK.FONT_EN, fontWeight: 600,
    fontSize: isD ? 14 : 12,
    color: KRK.HERITAGE,
    letterSpacing: '0.04em',
    flexShrink: 0,
  };
  const h3 = {
    fontFamily: KRK.FONT_KR,
    fontSize: isD ? 18 : 16,
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.02em',
    color: KRK.INK,
    margin: '32px 0 12px',
  };
  const list = {
    margin: '0 0 22px',
    paddingLeft: 0,
    listStyle: 'none',
    fontFamily: KRK.FONT_KR,
    fontSize: isD ? 15.5 : 14.5,
    lineHeight: 1.8,
    color: KRK.INK,
    letterSpacing: '-0.01em',
  };
  const li = {
    paddingLeft: 22,
    position: 'relative',
  };
  const dash = {
    position: 'absolute', left: 0, top: 0,
    color: KRK.HERITAGE, fontWeight: 600,
  };

  // Callout — 💡 light blue tint, hairline border, no rounded
  const callout = (kind, body) => {
    const isWarn = kind === 'warn';
    return (
      <div style={{
        background: isWarn ? '#FFF7E8' : KRK.TINT,
        border: `1px solid ${isWarn ? 'rgba(217,141,38,0.2)' : 'rgba(12,164,249,0.2)'}`,
        borderLeft: `3px solid ${isWarn ? '#D98D26' : KRK.BREATH}`,
        padding: isD ? '20px 24px' : '16px 18px',
        margin: '24px 0 28px',
        fontFamily: KRK.FONT_KR,
        fontSize: isD ? 14.5 : 13.5,
        lineHeight: 1.7,
        color: KRK.INK,
        letterSpacing: '-0.005em',
      }}>
        <div style={{
          fontFamily: KRK.FONT_EN, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: isWarn ? '#9F6612' : KRK.HERITAGE,
          marginBottom: 6,
        }}>{isWarn ? '주의 — 면책' : '놓치기 쉬운 부분'}</div>
        {body}
      </div>
    );
  };

  const quote = (body) => (
    <blockquote style={{
      margin: '28px 0',
      paddingLeft: isD ? 22 : 18,
      borderLeft: `2px solid ${KRK.INK}`,
      fontFamily: KRK.FONT_KR,
      fontSize: isD ? 17 : 15.5,
      lineHeight: 1.7,
      color: KRK.INK,
      letterSpacing: '-0.015em',
      fontWeight: 500,
    }}>{body}</blockquote>
  );

  // Compact table for case comparisons
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '8px 0 28px',
    fontFamily: KRK.FONT_KR,
    fontSize: isD ? 14 : 13,
    color: KRK.INK,
  };
  const th = {
    textAlign: 'left',
    fontWeight: 600,
    padding: isD ? '14px 16px' : '10px 12px',
    borderBottom: `1px solid ${KRK.RULE_S}`,
    background: KRK.SURFACE,
    letterSpacing: '-0.005em',
  };
  const td = {
    padding: isD ? '14px 16px' : '10px 12px',
    borderBottom: `1px solid ${KRK.RULE}`,
    color: KRK.INK_2,
    letterSpacing: '-0.005em',
    verticalAlign: 'top',
  };

  return (
    <div>
      <p style={para}>
        판매를 앞두고 라벨을 점검하다 보면, 의외로 의무 표시사항 한두 개가 빠져 있는 경우가 많습니다.
        표시광고법이 정한 9가지 항목은 누락하면 회수·시정 명령의 대상이 될 수 있어, 판매 전 한 번 더 확인이 필요한 부분입니다.
      </p>
      <p style={para}>
        이 글에서는 9가지 항목을 순서대로 정리하고, 작은 브랜드에서 놓치기 쉬운 부분을 함께 짚어봅니다.
      </p>

      {quote('의무 표시사항은 \u201c빼면 안 되는 것\u201d이고, 표기 형식은 \u201c맞게 써야 하는 것\u201d입니다. 두 단계가 분리되어 있다는 점이 중요합니다.')}

      <h2 id="h-1" style={h2}>
        <span style={h2num}>01</span>
        <span>제품명</span>
      </h2>
      <p style={para}>
        법적으로 “그 식품의 명칭”을 의미합니다. <strong style={{ fontWeight: 700 }}>브랜드명이 제품명을 대체할 수 없습니다.</strong>
      </p>
      <p style={para}>
        예) <code style={{ fontFamily: KRK.FONT_EN, fontSize: '0.92em', background: KRK.SURFACE, padding: '2px 6px' }}>차차 그래놀라</code> (브랜드명)
        과 <code style={{ fontFamily: KRK.FONT_EN, fontSize: '0.92em', background: KRK.SURFACE, padding: '2px 6px' }}>오트 그래놀라</code> (제품명)을 함께 표시해야 합니다.
      </p>

      <h2 id="h-2" style={h2}>
        <span style={h2num}>02</span>
        <span>식품유형</span>
      </h2>
      <p style={para}>
        식약처가 정한 식품 분류 체계상의 유형을 기재합니다. 품목제조보고서에 적힌 유형과 정확히 일치해야 합니다.
      </p>
      {callout('tip',
        '비슷한 제품이라도 가공 방식에 따라 식품유형이 달라질 수 있습니다. 같은 그래놀라라도 시리얼류 / 과자류 / 기타가공식품으로 나뉠 수 있어요.'
      )}

      <h2 id="h-3" style={h2}>
        <span style={h2num}>03</span>
        <span>영업소(제조원) 명칭 및 소재지</span>
      </h2>
      <p style={para}>
        제조원과 판매원이 다를 경우 둘 다 표기합니다.
      </p>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...th, width: '32%' }}>구분</th>
            <th style={th}>표기 예시</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...td, color: KRK.INK, fontWeight: 500 }}>제조원만 있는 경우</td>
            <td style={td}>제조원: 맛차차(주) / 서울시 …</td>
          </tr>
          <tr>
            <td style={{ ...td, color: KRK.INK, fontWeight: 500 }}>제조원·판매원 분리</td>
            <td style={td}>제조원: A공장 / 판매원: 맛차차(주)</td>
          </tr>
          <tr>
            <td style={{ ...td, color: KRK.INK, fontWeight: 500 }}>위탁 제조</td>
            <td style={td}>제조원: B / 위탁자: 맛차차(주)</td>
          </tr>
        </tbody>
      </table>

      <h2 id="h-4" style={h2}>
        <span style={h2num}>04</span>
        <span>제조연월일 / 유통기한 / 품질유지기한</span>
      </h2>
      <p style={para}>
        세 가지 중 해당하는 것을 표기합니다. 식품 유형에 따라 의무 표기 항목이 다릅니다.
      </p>
      <ul style={list}>
        <li style={li}><span style={dash}>—</span>일반 가공식품: 유통기한</li>
        <li style={li}><span style={dash}>—</span>장기 보존식품 (장류·식초 등): 품질유지기한</li>
        <li style={li}><span style={dash}>—</span>즉석조리식품: 제조연월일 + 유통기한</li>
      </ul>

      <h2 id="h-5" style={h2}>
        <span style={h2num}>05</span>
        <span>내용량</span>
      </h2>
      <p style={para}>
        중량·용량·개수 중 식품 유형에 맞게 표기. 단위 표기 누락이 흔합니다.
      </p>
      <div style={{
        display: 'flex', gap: 12, margin: '8px 0 24px', flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', background: '#EAF8EF',
          border: '1px solid rgba(0,128,64,0.18)',
          fontFamily: KRK.FONT_KR, fontSize: 13.5, color: KRK.INK,
        }}>
          <span style={{ color: '#0A7A3A', fontWeight: 700 }}>✓</span>
          <code style={{ fontFamily: KRK.FONT_EN }}>200g</code>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', background: '#FBECEC',
          border: '1px solid rgba(180,40,40,0.18)',
          fontFamily: KRK.FONT_KR, fontSize: 13.5, color: KRK.INK,
        }}>
          <span style={{ color: '#A82828', fontWeight: 700 }}>✗</span>
          <code style={{ fontFamily: KRK.FONT_EN }}>200</code>
        </div>
      </div>

      <h2 id="h-6" style={h2}>
        <span style={h2num}>06</span>
        <span>원재료명</span>
      </h2>
      <p style={para}>
        함량이 많은 순서대로 표기합니다. 알레르기 유발물질은 별도 표시.
      </p>
      <a href="#" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', background: KRK.SURFACE,
        border: `1px solid ${KRK.RULE}`,
        fontFamily: KRK.FONT_KR, fontSize: 13, color: KRK.INK,
        textDecoration: 'none', marginBottom: 24,
        letterSpacing: '-0.005em',
      }}>
        <span style={{
          fontFamily: KRK.FONT_EN, fontSize: 10, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: KRK.HERITAGE,
        }}>RELATED</span>
        <span style={{ color: KRK.INK_3 }}>·</span>
        <span>원재료명은 왜 함량순으로 써야 할까?</span>
        <span style={{ color: KRK.INK_3, marginLeft: 4 }}>→</span>
      </a>

      <h2 id="h-7" style={h2}>
        <span style={h2num}>07</span>
        <span>영양성분 (해당 시)</span>
      </h2>
      <p style={para}>
        영양표시 의무 대상 식품인 경우에만 해당. <strong>무가당, 저지방 같은 강조 표시</strong>를 쓰면 의무 대상이 될 수 있습니다.
      </p>

      <h2 id="h-8" style={h2}>
        <span style={h2num}>08</span>
        <span>보관 방법</span>
      </h2>
      <p style={para}>
        <code style={{ fontFamily: KRK.FONT_EN, fontSize: '0.92em', background: KRK.SURFACE, padding: '2px 6px' }}>냉장보관</code>,
        <code style={{ fontFamily: KRK.FONT_EN, fontSize: '0.92em', background: KRK.SURFACE, padding: '2px 6px', marginLeft: 6 }}>직사광선을 피해 서늘한 곳에 보관</code> 등 구체적으로 명시.
      </p>

      <h2 id="h-9" style={h2}>
        <span style={h2num}>09</span>
        <span>반품 및 교환 장소</span>
      </h2>
      <p style={para}>
        소비자 분쟁 발생 시 연락 가능한 장소·연락처. 판매원 정보로 갈음 가능합니다.
      </p>

      <h2 id="h-summary" style={{ ...h2, marginTop: isD ? 64 : 48 }}>
        <span style={h2num}>—</span>
        <span>정리</span>
      </h2>
      <p style={para}>
        9가지 모두 빠짐없이 들어갔다면, 다음 단계는 <strong>표기 형식</strong>이 기준에 맞는지 확인입니다.
        글자 크기, 위치, 함량 단위 등 디테일이 시정 명령의 흔한 사유입니다.
      </p>
      {callout('warn',
        '이 글은 표시광고법 기준 정리이며, 개별 제품에 대한 법률 자문이 아닙니다. 판매 전 자율 점검을 돕기 위한 참고용입니다.'
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// CTA — bottom block, two visual treatments per variant
// ═════════════════════════════════════════════════════════════
function ArticleCTA({ device, variant }) {
  const isD = device === 'desktop';
  if (variant === 'B') {
    // Variant B — dark Heritage Blue full-bleed band
    return (
      <div style={{
        background: KRK.HERITAGE, color: '#fff', position: 'relative', overflow: 'hidden',
        padding: isD ? '64px 64px' : '40px 24px',
        margin: isD ? '88px -64px 0' : '56px -24px 0',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(60% 80% at 100% 0%, rgba(12,164,249,0.25), transparent 60%)',
        }}/>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{
            fontFamily: KRK.FONT_EN, fontSize: 11, fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
            display: 'inline-flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ width: 24, height: 1, background: KRK.BREATH }}/>
            START
          </div>
          <div style={{
            fontFamily: KRK.FONT_KR, fontSize: isD ? 30 : 22, fontWeight: 600,
            lineHeight: 1.3, letterSpacing: '-0.025em',
            textWrap: 'balance',
          }}>이 글의 기준대로 라벨을 검토하고 싶다면,<br/>3분이면 충분합니다.</div>
          <div style={{
            fontFamily: KRK.FONT_KR, fontSize: isD ? 14 : 13,
            color: 'rgba(255,255,255,0.7)', maxWidth: 520,
            letterSpacing: '-0.005em',
          }}>KRK Checker가 9가지 표시사항을 자동으로 점검합니다. 검토 결과는 자율 점검 참고용입니다.</div>
          <a href="KRK Landing.html" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: isD ? '15px 28px' : '13px 22px',
            background: '#fff', color: KRK.INK,
            fontFamily: KRK.FONT_KR, fontSize: isD ? 14 : 13, fontWeight: 600,
            textDecoration: 'none', alignSelf: 'flex-start',
            letterSpacing: '-0.005em',
          }}>KRK Checker 시작하기 →</a>
        </div>
      </div>
    );
  }
  // Variant A — soft tinted box, contained
  return (
    <div style={{
      background: KRK.TINT,
      border: `1px solid ${KRK.RULE}`,
      borderLeft: `3px solid ${KRK.BREATH}`,
      padding: isD ? '36px 40px' : '28px 22px',
      margin: isD ? '72px 0 0' : '48px 0 0',
      display: 'flex',
      flexDirection: isD ? 'row' : 'column',
      gap: 24,
      alignItems: isD ? 'center' : 'flex-start',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 460 }}>
        <div style={{
          fontFamily: KRK.FONT_EN, fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: KRK.HERITAGE,
        }}>NEXT STEP</div>
        <div style={{
          fontFamily: KRK.FONT_KR, fontSize: isD ? 18 : 16, fontWeight: 700,
          letterSpacing: '-0.018em', color: KRK.INK, lineHeight: 1.4,
        }}>이 글의 기준대로 라벨을 검토하고 싶다면</div>
        <div style={{
          fontFamily: KRK.FONT_KR, fontSize: isD ? 13.5 : 12.5,
          color: KRK.INK_2, letterSpacing: '-0.005em', lineHeight: 1.6,
        }}>KRK Checker가 9가지 표시사항을 자동으로 점검합니다. 결과는 참고용입니다.</div>
      </div>
      <a href="KRK Landing.html" style={{
        padding: isD ? '14px 24px' : '12px 20px',
        background: KRK.INK, color: '#fff',
        fontFamily: KRK.FONT_KR, fontSize: isD ? 14 : 13, fontWeight: 600,
        textDecoration: 'none', whiteSpace: 'nowrap',
        letterSpacing: '-0.005em', flexShrink: 0,
      }}>KRK Checker 시작하기 →</a>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Related articles — 3 cards
// ═════════════════════════════════════════════════════════════
function RelatedArticles({ device, variant }) {
  const isD = device === 'desktop';
  const items = ARTICLES.slice(1, 4);
  return (
    <div style={{
      padding: isD ? '88px 0 0' : '64px 0 0',
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: isD ? 32 : 22, paddingBottom: 14,
        borderBottom: `1px solid ${KRK.RULE}`,
      }}>
        <div style={{
          fontFamily: KRK.FONT_KR, fontSize: isD ? 20 : 17, fontWeight: 700,
          letterSpacing: '-0.022em', color: KRK.INK,
        }}>관련 글</div>
        <a href="#" style={{
          fontFamily: KRK.FONT_KR, fontSize: 12, color: KRK.INK_3,
          textDecoration: 'none',
        }}>전체 보기 →</a>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isD ? 'repeat(3, 1fr)' : '1fr',
        gap: isD ? 24 : 28,
      }}>
        {items.map((art) => (
          <a key={art.id} href="#" style={{
            textDecoration: 'none', color: 'inherit',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <Thumb kind={art.thumb} tone="light" />
            <div style={{
              fontFamily: KRK.FONT_KR, fontSize: 11.5, color: variant === 'B' ? KRK.HERITAGE : KRK.INK_3,
              letterSpacing: '0.01em', marginTop: 2,
            }}>{catLabel(art.cat)}</div>
            <div style={{
              fontFamily: KRK.FONT_KR, fontSize: isD ? 15.5 : 14.5, fontWeight: 600,
              lineHeight: 1.4, letterSpacing: '-0.015em', color: KRK.INK,
            }}>{art.title}</div>
            <div style={{
              fontFamily: KRK.FONT_KR, fontSize: 11.5, color: KRK.INK_3, marginTop: 'auto',
              paddingTop: 4,
            }}>{art.time}분 · 기준 {art.src[0]}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

// Actions row (Toss-style) — used in variant A
function ActionsRow({ device }) {
  const isD = device === 'desktop';
  const btn = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: isD ? '10px 16px' : '9px 14px',
    border: `1px solid ${KRK.RULE_S}`,
    background: '#fff',
    fontFamily: KRK.FONT_KR, fontSize: isD ? 13 : 12.5,
    color: KRK.INK, textDecoration: 'none',
    cursor: 'pointer',
    letterSpacing: '-0.005em',
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, marginTop: isD ? 48 : 32, paddingTop: isD ? 32 : 24,
      borderTop: `1px solid ${KRK.RULE}`, flexWrap: 'wrap',
    }}>
      <a href="#blog" style={btn}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4 H12 M2 7 H12 M2 10 H8" stroke={KRK.INK_2} strokeWidth="1.2"/></svg>
        목록 보기
      </a>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" style={btn}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 9 L9 5 M5 5 H9 V9" stroke={KRK.INK_2} strokeWidth="1.2"/></svg>
          공유하기
        </button>
        <button type="button" style={btn}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2 L12 5 L5 12 L2 12 L2 9 Z" stroke={KRK.INK_2} strokeWidth="1.2" fill="none"/></svg>
          의견 남기기
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// TOC — sticky on desktop, variant B only
// ═════════════════════════════════════════════════════════════
function TOC() {
  const items = [
    { id: 'h-1', num: '01', label: '제품명' },
    { id: 'h-2', num: '02', label: '식품유형' },
    { id: 'h-3', num: '03', label: '영업소 명칭·소재지' },
    { id: 'h-4', num: '04', label: '제조연월일·유통기한' },
    { id: 'h-5', num: '05', label: '내용량' },
    { id: 'h-6', num: '06', label: '원재료명' },
    { id: 'h-7', num: '07', label: '영양성분' },
    { id: 'h-8', num: '08', label: '보관 방법' },
    { id: 'h-9', num: '09', label: '반품·교환' },
    { id: 'h-summary', num: '—', label: '정리' },
  ];
  return (
    <div style={{
      position: 'sticky', top: 92, alignSelf: 'start',
      borderTop: `1px solid ${KRK.RULE_S}`, paddingTop: 18,
    }}>
      <div style={{
        fontFamily: KRK.FONT_EN, fontSize: 10.5, fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: KRK.INK_3, marginBottom: 14,
      }}>CONTENTS — 09</div>
      <ul style={{
        listStyle: 'none', padding: 0, margin: 0,
        display: 'flex', flexDirection: 'column', gap: 9,
        fontFamily: KRK.FONT_KR, fontSize: 13,
      }}>
        {items.map((it) => (
          <li key={it.id} style={{
            display: 'grid', gridTemplateColumns: '24px 1fr', gap: 10,
            color: KRK.INK_2, letterSpacing: '-0.01em', lineHeight: 1.4,
          }}>
            <span style={{ fontFamily: KRK.FONT_EN, color: KRK.INK_3, fontSize: 11 }}>{it.num}</span>
            <a href={`#${it.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{it.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// PAGE — variant A : narrow centered editorial column
// ═════════════════════════════════════════════════════════════
function BlogArticleA({ device }) {
  const isD = device === 'desktop';
  const art = ARTICLES[0]; // featured article

  return (
    <div style={{
      background: '#fff', minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      paddingTop: isD ? 70 : 56,
      fontFamily: KRK.FONT_KR,
    }}>
      <BlogNav device={device} />

      {/* Article header — Toss-leaning centered */}
      <div style={{
        maxWidth: 720, margin: '0 auto', width: '100%',
        padding: isD ? '72px 32px 24px' : '36px 22px 16px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 12px', background: KRK.SURFACE,
          fontFamily: KRK.FONT_KR, fontSize: 11.5, color: KRK.INK_2,
          marginBottom: 24,
        }}>
          <span style={{ width: 5, height: 5, background: KRK.BREATH, borderRadius: '50%' }}/>
          {catLabel(art.cat)}
        </div>
        <h1 style={{
          fontFamily: KRK.FONT_KR, fontSize: isD ? 42 : 26, fontWeight: 700,
          letterSpacing: '-0.03em', color: KRK.INK,
          lineHeight: 1.25, margin: '0 0 18px',
          textWrap: 'balance',
        }}>{art.title}</h1>
        <div style={{
          fontFamily: KRK.FONT_KR, fontSize: isD ? 16 : 14,
          color: KRK.INK_2, lineHeight: 1.6, letterSpacing: '-0.005em',
          maxWidth: 580, margin: '0 auto 28px',
        }}>{art.summary}</div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          fontFamily: KRK.FONT_KR, fontSize: 12, color: KRK.INK_3,
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          <span>{art.date}</span>
          <span style={{ color: KRK.INK_4 }}>·</span>
          <span>{art.time}분 읽기</span>
          <span style={{ color: KRK.INK_4 }}>·</span>
          <span style={{ display: 'inline-flex', gap: 6 }}>
            {art.src.map((s) => (
              <span key={s} style={{
                padding: '3px 8px', border: `1px solid ${KRK.RULE_S}`,
                fontSize: 11, color: KRK.INK_2,
              }}>{s}</span>
            ))}
          </span>
        </div>
      </div>

      {/* Hero band — soft tint with abstract mark */}
      <div style={{
        maxWidth: 920, margin: '24px auto 0', width: '100%',
        padding: isD ? '0 32px' : '0 22px',
      }}>
        <div style={{ border: `1px solid ${KRK.RULE}` }}>
          <Thumb kind={art.thumb} tone="light" />
        </div>
      </div>

      {/* Body */}
      <article style={{
        maxWidth: 720, margin: '0 auto', width: '100%',
        padding: isD ? '64px 32px 0' : '36px 22px 0',
      }}>
        <ArticleBody device={device} variant="A" />
        <ArticleCTA device={device} variant="A" />
        <ActionsRow device={device} />
        <RelatedArticles device={device} variant="A" />
      </article>

      <div style={{ height: isD ? 96 : 56 }}/>
      <BlogFooter device={device} />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// PAGE — variant B : left-aligned + sticky TOC
// ═════════════════════════════════════════════════════════════
function BlogArticleB({ device }) {
  const isD = device === 'desktop';
  const art = ARTICLES[0];

  return (
    <div style={{
      background: '#fff', minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      paddingTop: isD ? 70 : 56,
      fontFamily: KRK.FONT_KR,
    }}>
      <BlogNav device={device} />

      {/* Article header — left-aligned editorial */}
      <div style={{
        maxWidth: 1320, margin: '0 auto', width: '100%',
        padding: isD ? '72px 48px 32px' : '40px 20px 20px',
      }}>
        <a href="#blog" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: KRK.FONT_EN, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: KRK.INK_3, textDecoration: 'none', marginBottom: 24,
        }}>← BACK TO BLOG</a>

        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 18,
          marginBottom: 22,
          fontFamily: KRK.FONT_EN, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: KRK.INK_3,
        }}>
          <span style={{ width: 32, height: 1, background: KRK.BREATH }}/>
          <span>ARTICLE · {art.num}</span>
          <span style={{ color: KRK.INK_4 }}>·</span>
          <span style={{ color: KRK.HERITAGE }}>{catLabel(art.cat).toUpperCase()}</span>
        </div>

        <h1 style={{
          fontFamily: KRK.FONT_KR,
          fontSize: isD ? 56 : 30, fontWeight: 600,
          letterSpacing: '-0.033em', color: KRK.INK,
          lineHeight: 1.1, margin: '0 0 28px',
          maxWidth: 940, textWrap: 'balance',
        }}>{art.title}</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isD ? '1.4fr 1fr' : '1fr',
          gap: isD ? 48 : 18, alignItems: 'end',
        }}>
          <div style={{
            fontFamily: KRK.FONT_KR, fontSize: isD ? 18 : 15,
            color: KRK.INK_2, lineHeight: 1.65, letterSpacing: '-0.005em',
            maxWidth: 580,
          }}>{art.summary}</div>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            paddingBottom: 4,
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px',
              fontFamily: KRK.FONT_KR, fontSize: 12,
            }}>
              <div style={{ color: KRK.INK_3, fontFamily: KRK.FONT_EN, letterSpacing: '0.08em' }}>발행일</div>
              <div style={{ color: KRK.INK }}>{art.date}</div>
              <div style={{ color: KRK.INK_3, fontFamily: KRK.FONT_EN, letterSpacing: '0.08em' }}>읽는 시간</div>
              <div style={{ color: KRK.INK }}>{art.time}분</div>
              <div style={{ color: KRK.INK_3, fontFamily: KRK.FONT_EN, letterSpacing: '0.08em' }}>기준 출처</div>
              <div style={{ color: KRK.INK }}>
                {art.src.map((s, i) => (
                  <span key={s}>
                    {s}{i < art.src.length - 1 && <span style={{ color: KRK.INK_4 }}> · </span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero band — full-bleed dark mark */}
      <div style={{
        margin: isD ? '24px 0 0' : '20px 0 0',
        background: KRK.HERITAGE,
        padding: isD ? '0' : '0',
      }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto',
          padding: isD ? '0 48px' : '0',
        }}>
          <div style={{ aspectRatio: '32/10', position: 'relative' }}>
            <Thumb kind={art.thumb} tone="dark" />
          </div>
        </div>
      </div>

      {/* Body + TOC */}
      <div style={{
        maxWidth: 1320, margin: '0 auto', width: '100%',
        padding: isD ? '72px 48px 0' : '40px 20px 0',
        display: 'grid',
        gridTemplateColumns: isD ? '1fr 220px' : '1fr',
        gap: isD ? 64 : 0,
        alignItems: 'start',
      }}>
        <article style={{ maxWidth: 720, width: '100%' }}>
          <ArticleBody device={device} variant="B" />
          <ArticleCTA device={device} variant="B" />
        </article>
        {isD && <TOC />}
      </div>

      <div style={{
        maxWidth: 1320, margin: '0 auto', width: '100%',
        padding: isD ? '0 48px 96px' : '0 20px 56px',
      }}>
        <RelatedArticles device={device} variant="B" />
      </div>

      <BlogFooter device={device} />
    </div>
  );
}

function BlogArticle({ device = 'desktop', variant = 'A' }) {
  return variant === 'B'
    ? <BlogArticleB device={device} />
    : <BlogArticleA device={device} />;
}

Object.assign(window, { BlogArticle });
