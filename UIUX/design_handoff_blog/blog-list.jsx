/* global React, CATEGORIES, ARTICLES, KRK, Thumb, catLabel */
// blog-list.jsx — KRK Checker Blog list page
// Props:
//   device  : 'desktop' | 'mobile'
//   variant : 'A' (Editorial Restrained, Toss-leaning) | 'B' (KRK Editorial)

const { useState: useStateBL } = React;

// ═════════════════════════════════════════════════════════════
// Shared chrome (Nav + Footer) — matches KRK Landing tone
// ═════════════════════════════════════════════════════════════
function BlogNav({ device, scope = 'blog' }) {
  const isD = device === 'desktop';
  return (
    <nav style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 60,
      padding: isD ? '18px 40px' : '14px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderBottom: '1px solid rgba(10,10,11,0.06)',
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: isD ? 28 : 0, lineHeight: 1 }}>
        <span style={{
          fontFamily: KRK.FONT_EN, fontWeight: 800,
          fontSize: isD ? 14 : 12, color: KRK.INK,
          letterSpacing: '0.22em', textTransform: 'uppercase',
        }}>
          KRK CHECKER<span style={{ color: KRK.BREATH, marginLeft: '0.18em' }}>·</span>
        </span>
        {isD && (
          <div style={{ display: 'flex', gap: 24, fontFamily: KRK.FONT_KR, fontSize: 13, color: KRK.INK_2 }}>
            <a href="KRK Blog.html" style={{ color: scope === 'blog' ? KRK.INK : 'inherit', textDecoration: 'none', fontWeight: scope === 'blog' ? 600 : 400 }}>블로그</a>
          </div>
        )}
      </div>
      <a href="KRK Landing.html" style={{
        padding: isD ? '10px 18px' : '8px 14px',
        background: KRK.INK, color: '#fff', border: 'none', borderRadius: 0,
        fontFamily: KRK.FONT_KR, fontSize: isD ? 13 : 12, fontWeight: 600,
        letterSpacing: '-0.005em', cursor: 'pointer', textDecoration: 'none',
        display: 'inline-block',
      }}>라벨 검토 시작하기</a>
      <div style={{
        position: 'absolute', bottom: -1, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(12,164,249,0.42), transparent)',
      }}/>
    </nav>
  );
}

function BlogFooter({ device }) {
  const isD = device === 'desktop';
  return (
    <footer style={{
      background: '#0F0F12', color: 'rgba(255,255,255,0.55)', flexShrink: 0,
      padding: isD ? '36px 40px 28px' : '28px 20px 22px',
      fontSize: 12, letterSpacing: '-0.005em',
    }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        display: 'flex', alignItems: isD ? 'center' : 'flex-start',
        justifyContent: 'space-between',
        gap: 16, flexDirection: isD ? 'row' : 'column',
      }}>
        <div>
          <div style={{
            fontFamily: KRK.FONT_EN, fontSize: 12, fontWeight: 800,
            color: '#fff', letterSpacing: '0.22em', textTransform: 'uppercase',
          }}>KRK CHECKER <span style={{ color: KRK.BREATH }}>·</span></div>
          <div style={{ marginTop: 6, fontSize: 11 }}>(c) 2026 krk.team · 서울특별시</div>
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', fontSize: 11.5 }}>
          <a href="KRK Landing.html" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>제품</a>
          <a href="KRK Landing.html#pricing" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>가격</a>
          <a href="KRK Blog.html" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>블로그</a>
          <a href="KRK Terms.html" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>이용약관</a>
          <a href="KRK Privacy.html" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>개인정보처리방침</a>
        </div>
      </div>
    </footer>
  );
}

// Newsletter strip — used in variant A (Toss-like)
function NewsletterStrip({ device }) {
  const isD = device === 'desktop';
  return (
    <div style={{
      background: KRK.TINT, borderTop: `1px solid ${KRK.RULE}`,
      borderBottom: `1px solid ${KRK.RULE}`,
      padding: isD ? '14px 40px' : '12px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12,
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        fontFamily: KRK.FONT_KR, fontSize: isD ? 13.5 : 12.5, color: KRK.INK,
      }}>
        <span style={{
          display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
          background: KRK.BREATH,
        }}/>
        판매 전 라벨 점검 기준을 메일로 받아보세요
      </div>
      <a href="#" style={{
        fontFamily: KRK.FONT_KR, fontSize: isD ? 13 : 12, color: KRK.INK,
        textDecoration: 'none', fontWeight: 600,
      }}>구독하기 →</a>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Category tabs — text underline style, used in both variants
// ═════════════════════════════════════════════════════════════
function CategoryTabs({ device, active, onSelect, variant = 'A' }) {
  const isD = device === 'desktop';
  const isB = variant === 'B';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: isD ? 28 : 18,
      overflowX: isD ? 'visible' : 'auto',
      whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch',
      paddingBottom: isD ? 0 : 4,
      scrollbarWidth: 'none',
    }}>
      {CATEGORIES.map((c) => {
        const on = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect?.(c.id)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: KRK.FONT_KR,
              fontSize: isD ? 15 : 13.5,
              fontWeight: on ? 600 : 400,
              color: on ? KRK.INK : KRK.INK_3,
              paddingBottom: 6,
              borderBottom: on
                ? `2px solid ${isB ? KRK.HERITAGE : KRK.INK}`
                : '2px solid transparent',
              letterSpacing: '-0.01em',
            }}
          >
            {c.ko}
          </button>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Card primitive
// ═════════════════════════════════════════════════════════════
function ArticleCard({ art, device, variant = 'A', compact = false }) {
  const isD = device === 'desktop';
  const isB = variant === 'B';
  return (
    <a href="#article" style={{
      display: 'flex', flexDirection: 'column', gap: isD ? 14 : 12,
      textDecoration: 'none', color: 'inherit',
      background: '#fff',
      border: isB ? `1px solid ${KRK.RULE}` : 'none',
      padding: isB ? (isD ? 0 : 0) : 0,
    }}>
      <div style={{ overflow: 'hidden' }}>
        <Thumb kind={art.thumb} tone="light" />
      </div>
      <div style={{
        padding: isB ? (isD ? '4px 18px 22px' : '4px 14px 18px') : '4px 0 8px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {/* Eyebrow: category */}
        <div style={{
          fontFamily: KRK.FONT_KR, fontSize: 11.5, fontWeight: 500,
          color: isB ? KRK.HERITAGE : KRK.INK_3,
          letterSpacing: isB ? '0.04em' : '0.01em',
          textTransform: isB ? 'none' : 'none',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {isB && <span style={{ fontFamily: KRK.FONT_EN, color: KRK.INK_3, fontWeight: 600 }}>{art.num}</span>}
          <span>{catLabel(art.cat)}</span>
        </div>
        {/* Title */}
        <div style={{
          fontFamily: KRK.FONT_KR,
          fontSize: compact ? (isD ? 16 : 15) : (isD ? 17.5 : 16),
          fontWeight: 600,
          lineHeight: 1.4,
          color: KRK.INK,
          letterSpacing: '-0.015em',
        }}>{art.title}</div>
        {/* Summary — only variant B / desktop */}
        {!compact && (
          <div style={{
            fontFamily: KRK.FONT_KR, fontSize: isD ? 13.5 : 12.5,
            color: KRK.INK_2, lineHeight: 1.55, letterSpacing: '-0.01em',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{art.summary}</div>
        )}
        {/* Meta */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 2,
          fontFamily: KRK.FONT_KR, fontSize: 11.5, color: KRK.INK_3, letterSpacing: '-0.005em',
        }}>
          <span>{art.time}분</span>
          <span style={{ color: KRK.INK_4 }}>·</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            기준 {art.src[0]}
          </span>
        </div>
      </div>
    </a>
  );
}

// ═════════════════════════════════════════════════════════════
// Featured Article — variant A : light wide card
// ═════════════════════════════════════════════════════════════
function FeaturedA({ art, device }) {
  const isD = device === 'desktop';
  if (!isD) {
    return (
      <a href="#article" style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        textDecoration: 'none', color: 'inherit',
      }}>
        <Thumb kind={art.thumb} tone="light" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 0 4px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11.5,
            fontFamily: KRK.FONT_KR, color: KRK.INK_3,
          }}>
            <span style={{ padding: '3px 8px', background: KRK.TINT, color: KRK.HERITAGE, fontWeight: 600 }}>Featured</span>
            <span>{catLabel(art.cat)}</span>
          </div>
          <div style={{ fontFamily: KRK.FONT_KR, fontSize: 19, fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.02em', color: KRK.INK }}>
            {art.title}
          </div>
          <div style={{ fontFamily: KRK.FONT_KR, fontSize: 13, color: KRK.INK_2, lineHeight: 1.55 }}>{art.summary}</div>
        </div>
      </a>
    );
  }
  return (
    <a href="#article" style={{
      display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 0,
      textDecoration: 'none', color: 'inherit',
      border: `1px solid ${KRK.RULE}`, background: '#fff',
    }}>
      <div style={{ borderRight: `1px solid ${KRK.RULE}` }}>
        <Thumb kind={art.thumb} tone="light" />
      </div>
      <div style={{ padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: KRK.FONT_KR, fontSize: 11.5, color: KRK.INK_3 }}>
            <span style={{
              padding: '4px 10px', background: KRK.HERITAGE, color: '#fff', fontWeight: 600,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              fontFamily: KRK.FONT_EN, fontSize: 10.5,
            }}>FEATURED</span>
            <span style={{ color: KRK.INK_2 }}>{catLabel(art.cat)}</span>
          </div>
          <div style={{
            fontFamily: KRK.FONT_KR, fontSize: 32, fontWeight: 700,
            lineHeight: 1.28, letterSpacing: '-0.025em', color: KRK.INK,
          }}>{art.title}</div>
          <div style={{
            fontFamily: KRK.FONT_KR, fontSize: 15, color: KRK.INK_2,
            lineHeight: 1.65, letterSpacing: '-0.01em',
          }}>{art.summary}</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, paddingTop: 18,
          borderTop: `1px solid ${KRK.RULE}`,
          fontFamily: KRK.FONT_KR, fontSize: 12, color: KRK.INK_3,
        }}>
          <span>{art.date}</span>
          <span style={{ color: KRK.INK_4 }}>·</span>
          <span>{art.time}분</span>
          <span style={{ color: KRK.INK_4 }}>·</span>
          <span>기준 {art.src.join(', ')}</span>
          <span style={{ marginLeft: 'auto', color: KRK.INK, fontWeight: 600 }}>읽어보기 →</span>
        </div>
      </div>
    </a>
  );
}

// Featured — variant B : full-bleed dark Heritage Blue
function FeaturedB({ art, device }) {
  const isD = device === 'desktop';
  return (
    <div style={{
      background: KRK.HERITAGE,
      color: '#fff',
      padding: isD ? '64px 64px 56px' : '40px 24px 32px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Heritage gradient veil */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(80% 80% at 90% 10%, rgba(12,164,249,0.22), transparent 60%), radial-gradient(60% 60% at 0% 100%, rgba(255,255,255,0.05), transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <a href="#article" style={{
        position: 'relative', zIndex: 1,
        display: isD ? 'grid' : 'flex', flexDirection: 'column',
        gridTemplateColumns: '1.2fr 1fr', gap: isD ? 64 : 28,
        textDecoration: 'none', color: 'inherit', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: isD ? 28 : 18 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            fontFamily: KRK.FONT_EN, fontSize: 11, fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
          }}>
            <span style={{
              width: 24, height: 1, background: KRK.BREATH,
            }}/>
            FEATURED · {art.num}
          </div>
          <div style={{
            fontFamily: KRK.FONT_KR,
            fontSize: isD ? 44 : 28, fontWeight: 600,
            lineHeight: 1.22, letterSpacing: '-0.028em', color: '#fff',
            textWrap: 'pretty',
          }}>{art.title}</div>
          <div style={{
            fontFamily: KRK.FONT_KR, fontSize: isD ? 16 : 14,
            color: 'rgba(255,255,255,0.75)', lineHeight: 1.65,
            letterSpacing: '-0.005em', maxWidth: 560,
          }}>{art.summary}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, marginTop: 8,
            fontFamily: KRK.FONT_KR, fontSize: 12,
            color: 'rgba(255,255,255,0.55)',
          }}>
            <span>{catLabel(art.cat)}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
            <span>{art.time}분</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
            <span>기준 {art.src[0]}</span>
          </div>
        </div>
        {isD && (
          <div style={{
            aspectRatio: '4/3',
            background: 'radial-gradient(120% 90% at 30% 30%, #001D4A 0%, #00255E 50%, #000B1F 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative', overflow: 'hidden',
          }}>
            <Thumb kind={art.thumb} tone="dark" />
          </div>
        )}
      </a>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// PAGE — variant A (Toss-leaning editorial)
// ═════════════════════════════════════════════════════════════
function BlogListA({ device }) {
  const isD = device === 'desktop';
  const [active, setActive] = useStateBL('all');
  const featured = ARTICLES[0];
  const rest = ARTICLES.slice(1).filter((a) => active === 'all' || a.cat === active);

  return (
    <div style={{
      background: '#fff', minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      paddingTop: isD ? 70 : 56,
      fontFamily: KRK.FONT_KR,
    }}>
      <BlogNav device={device} />
      <NewsletterStrip device={device} />

      {/* Page header */}
      <div style={{
        maxWidth: 1240, margin: '0 auto', width: '100%',
        padding: isD ? '64px 40px 28px' : '32px 20px 20px',
      }}>
        <div style={{
          fontFamily: KRK.FONT_EN, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: KRK.INK_3,
          marginBottom: 14,
        }}>BLOG</div>
        <div style={{
          fontFamily: KRK.FONT_KR, fontSize: isD ? 40 : 28, fontWeight: 700,
          letterSpacing: '-0.028em', color: KRK.INK, lineHeight: 1.2,
          marginBottom: isD ? 10 : 6,
        }}>판매 전 확인해야 할 라벨 기준</div>
        <div style={{
          fontFamily: KRK.FONT_KR, fontSize: isD ? 15 : 13.5,
          color: KRK.INK_2, letterSpacing: '-0.01em', maxWidth: 560,
          lineHeight: 1.55,
        }}>스몰 식품 브랜드를 위한 표시 기준 가이드. 자율 점검에 참고하세요.</div>
      </div>

      {/* Featured */}
      <div style={{
        maxWidth: 1240, margin: '0 auto', width: '100%',
        padding: isD ? '20px 40px 56px' : '8px 20px 36px',
      }}>
        <FeaturedA art={featured} device={device} />
      </div>

      {/* Category bar */}
      <div style={{
        borderTop: `1px solid ${KRK.RULE}`,
        borderBottom: `1px solid ${KRK.RULE}`,
        background: '#fff',
        position: 'sticky', top: 0, zIndex: 5,
      }}>
        <div style={{
          maxWidth: 1240, margin: '0 auto', width: '100%',
          padding: isD ? '18px 40px' : '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <CategoryTabs device={device} active={active} onSelect={setActive} variant="A" />
          {isD && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', border: `1px solid ${KRK.RULE_S}`,
              fontFamily: KRK.FONT_KR, fontSize: 13, color: KRK.INK_2,
              cursor: 'pointer', flexShrink: 0,
            }}>
              업종 선택
              <svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 1 L5 5 L9 1" stroke={KRK.INK_2} strokeWidth="1.2" fill="none"/></svg>
            </div>
          )}
        </div>
      </div>

      {/* Article grid */}
      <div style={{
        maxWidth: 1240, margin: '0 auto', width: '100%',
        padding: isD ? '56px 40px 96px' : '32px 20px 56px',
        display: 'grid',
        gridTemplateColumns: isD ? 'repeat(3, 1fr)' : '1fr',
        gap: isD ? '56px 32px' : '36px',
      }}>
        {rest.map((art) => (
          <ArticleCard key={art.id} art={art} device={device} variant="A" compact />
        ))}
      </div>

      <BlogFooter device={device} />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// PAGE — variant B (KRK Editorial — heritage / hairline grid)
// ═════════════════════════════════════════════════════════════
function BlogListB({ device }) {
  const isD = device === 'desktop';
  const [active, setActive] = useStateBL('all');
  const featured = ARTICLES[0];
  const rest = ARTICLES.slice(1).filter((a) => active === 'all' || a.cat === active);

  return (
    <div style={{
      background: '#fff', minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      paddingTop: isD ? 70 : 56,
      fontFamily: KRK.FONT_KR,
    }}>
      <BlogNav device={device} />

      {/* Page header — editorial, with eyebrow + huge title + meta strip */}
      <div style={{
        maxWidth: 1320, margin: '0 auto', width: '100%',
        padding: isD ? '88px 48px 24px' : '40px 20px 20px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 24,
          fontFamily: KRK.FONT_EN, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: KRK.INK_3,
        }}>
          <span style={{ width: 32, height: 1, background: KRK.BREATH }}/>
          INSIGHTS · KRK CHECKER
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isD ? '1.4fr 1fr' : '1fr',
          gap: isD ? 64 : 18, alignItems: 'end',
        }}>
          <div style={{
            fontFamily: KRK.FONT_KR,
            fontSize: isD ? 64 : 34, fontWeight: 600,
            letterSpacing: '-0.035em', color: KRK.INK,
            lineHeight: 1.05, textWrap: 'balance',
          }}>
            라벨도,<br/>
            <span style={{ color: KRK.HERITAGE }}>브랜드의 일부니까.</span>
          </div>
          <div style={{
            fontFamily: KRK.FONT_KR, fontSize: isD ? 15 : 13.5,
            color: KRK.INK_2, lineHeight: 1.65, letterSpacing: '-0.005em',
            maxWidth: 420, paddingBottom: 8,
          }}>
            스몰 식품 브랜드가 판매 전 알아야 할 표시 기준을 정돈된 가이드로 정리합니다.
            모든 글은 출처를 함께 표기합니다.
          </div>
        </div>
      </div>

      {/* Featured — dark heritage band */}
      <div style={{ marginTop: isD ? 32 : 20 }}>
        <FeaturedB art={featured} device={device} />
      </div>

      {/* Category bar */}
      <div style={{
        borderBottom: `1px solid ${KRK.RULE}`,
        background: '#fff',
      }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto', width: '100%',
          padding: isD ? '24px 48px' : '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, minWidth: 0, flex: 1 }}>
            {isD && (
              <div style={{
                fontFamily: KRK.FONT_EN, fontSize: 11, fontWeight: 600,
                letterSpacing: '0.18em', textTransform: 'uppercase', color: KRK.INK_3,
                flexShrink: 0,
              }}>FILTER —</div>
            )}
            <CategoryTabs device={device} active={active} onSelect={setActive} variant="B" />
          </div>
          {isD && (
            <div style={{
              fontFamily: KRK.FONT_EN, fontSize: 11, fontWeight: 500,
              color: KRK.INK_3, letterSpacing: '0.04em',
              flexShrink: 0,
            }}>{String(rest.length).padStart(2, '0')} ARTICLES</div>
          )}
        </div>
      </div>

      {/* Article grid — hairline-bordered cells, zero-gap */}
      <div style={{
        background: KRK.RULE,
        display: 'grid',
        gridTemplateColumns: isD ? 'repeat(3, 1fr)' : '1fr',
        gap: 1,
        borderBottom: `1px solid ${KRK.RULE}`,
      }}>
        {rest.map((art) => (
          <div key={art.id} style={{ background: '#fff' }}>
            <ArticleCard art={art} device={device} variant="B" />
          </div>
        ))}
      </div>

      {/* CTA band — soft tint */}
      <div style={{
        background: KRK.TINT,
        padding: isD ? '64px 48px' : '40px 20px',
      }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto',
          display: 'flex', alignItems: isD ? 'center' : 'flex-start', justifyContent: 'space-between',
          gap: 24, flexDirection: isD ? 'row' : 'column',
        }}>
          <div>
            <div style={{
              fontFamily: KRK.FONT_EN, fontSize: 11, fontWeight: 600,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: KRK.INK_3,
              marginBottom: 12,
            }}>READY?</div>
            <div style={{
              fontFamily: KRK.FONT_KR, fontSize: isD ? 28 : 22, fontWeight: 600,
              letterSpacing: '-0.022em', color: KRK.INK, lineHeight: 1.3,
            }}>지금 라벨을 점검해보세요.</div>
            <div style={{
              fontFamily: KRK.FONT_KR, fontSize: isD ? 14 : 13,
              color: KRK.INK_2, marginTop: 6,
            }}>3분이면 자율 점검이 끝납니다. 결과는 참고용입니다.</div>
          </div>
          <a href="#" style={{
            padding: isD ? '16px 28px' : '14px 22px',
            background: KRK.INK, color: '#fff',
            fontFamily: KRK.FONT_KR, fontSize: isD ? 14 : 13, fontWeight: 600,
            textDecoration: 'none', letterSpacing: '-0.005em',
            display: 'inline-flex', alignItems: 'center', gap: 10,
          }}>KRK Checker 시작하기 →</a>
        </div>
      </div>

      <BlogFooter device={device} />
    </div>
  );
}

function BlogList({ device = 'desktop', variant = 'A' }) {
  return variant === 'B'
    ? <BlogListB device={device} />
    : <BlogListA device={device} />;
}

Object.assign(window, { BlogList, BlogNav, BlogFooter });
