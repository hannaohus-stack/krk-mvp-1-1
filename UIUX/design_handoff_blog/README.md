# Handoff: KRK Checker Blog (List + Article)

## Overview

KRK Checker 블로그는 스몰 식품 브랜드를 대상으로 한 **판매 전 라벨 기준 가이드 허브**입니다. Phase 1 런칭 보조 자산으로, 제품 기능을 제공하지 않고 **신뢰 형성 · 검색 유입 · 구매 전 교육**을 통해 KRK Checker 본 제품으로 자연스럽게 전환시키는 것이 목표입니다.

이 핸드오프는 **블로그 리스트 페이지**와 **블로그 상세(Article) 페이지** 두 화면에 대한 디자인을 다룹니다. Desktop + Mobile 반응형.

## About the Design Files

이 번들에 포함된 HTML/JSX 파일들은 **디자인 레퍼런스**입니다 — 의도된 룩과 동작을 보여주는 프로토타입이지, 그대로 복사해 프로덕션에 사용할 코드가 아닙니다.

개발자가 해야 할 작업은:
1. 타겟 코드베이스의 기존 환경(React/Next.js/Vue/SvelteKit 등)에서 **이 디자인을 재구현**하는 것
2. 이미 사용 중인 라이브러리·패턴·디자인 토큰을 따르는 것
3. 코드베이스가 아직 없다면 **SEO를 우선시한 정적 사이트 또는 SSR**(Next.js + MDX, Astro, SvelteKit 등) 환경을 선택할 것 — 브리프 요구사항

여기 포함된 JSX는 빠른 시각화를 위해 인라인 스타일 + Babel standalone으로 작성됐습니다. **그대로 옮기지 마세요.** 토큰/컴포넌트 구조와 디자인 의도를 참고하고, 실제 구현은 코드베이스 표준대로 작성하세요.

## Fidelity

**High-fidelity (hi-fi).**

색상, 타이포그래피, 스페이싱, 보더, hover 톤이 모두 확정 값입니다. 픽셀 단위 재현 가능하며, 아래 디자인 토큰 섹션에 전부 명시되어 있습니다.

단, 아래 항목은 **placeholder**로 표시했으니 실제 자산으로 대체해야 합니다:
- 카드 썸네일(현재 추상 SVG 마크) → 실제 일러스트 또는 이미지
- 본문 더미 콘텐츠 → MDX/CMS 콘텐츠 (단, 콜아웃/표/인용구/리스트 등 본문 요소 스타일은 그대로 유지)

---

## Screens / Views

### 1. Blog List (`/blog`)

#### Purpose
카테고리별 글 목록 탐색. Featured 글 강조 + 검색 유입 사용자에게 KRK Checker 브랜드 톤 전달.

#### Layout (Desktop ≥ 1024px)

순서대로 (위 → 아래):

1. **Top Nav** — fixed
   - 좌측: 로고 `KRK CHECKER ·` (Inter 800, 14px, 0.22em tracking, uppercase) + 옆에 `블로그` 메뉴 1개
   - 우측: CTA 버튼 `라벨 검토 시작하기` → `KRK Landing.html`
   - 높이 60px, padding `18px 40px`
   - 배경: `rgba(255,255,255,0.72)` + `backdrop-filter: blur(28px) saturate(180%)`
   - 하단 1px hairline + Breath Blue gradient 라인 (`linear-gradient(90deg, transparent, rgba(12,164,249,0.42), transparent)`)

2. **Newsletter Strip**
   - 배경 `#F6F9FD` (TINT), 상하 1px hairline
   - 좌측: Breath Blue 6px 점 + "판매 전 라벨 점검 기준을 메일로 받아보세요"
   - 우측: "구독하기 →" (KRK.INK, weight 600)
   - padding `14px 40px`

3. **Page Header**
   - max-width 1240, padding `64px 40px 28px`
   - Eyebrow: `BLOG` (Inter 600, 11px, 0.18em tracking, uppercase, INK_3)
   - Title: "판매 전 확인해야 할 라벨 기준" (Pretendard 700, 40px, -0.028em, line-height 1.2)
   - Subtitle: "스몰 식품 브랜드를 위한 표시 기준 가이드. 자율 점검에 참고하세요." (15px, INK_2)

4. **Featured Article** (2-column 카드)
   - max-width 1240, 1px hairline border, 백그라운드 #fff
   - 좌측(1.05fr): 4:3 비율 일러스트 영역, 우측에 1px hairline divider
   - 우측(1fr): padding `40px 44px`, 위에서 아래로:
     - `FEATURED` 배지 (Heritage Blue 배경, white text, 10.5px Inter 600, 0.04em tracking) + 카테고리 텍스트
     - 제목 (Pretendard 700, 32px, -0.025em, line-height 1.28)
     - 1줄 요약 (15px, INK_2, line-height 1.65)
     - 상단 1px hairline + 메타 행: `발행일 · N분 · 기준 출처` + 우측 `읽어보기 →`

5. **Category Bar (sticky)**
   - 상하 1px hairline, 배경 #fff, `position: sticky; top: 0; z-index: 5`
   - max-width 1240, padding `18px 40px`
   - 좌측: 텍스트 탭 7개 (`전체 / 라벨 기준 / 원재료·알레르기 / 분리배출·포장 / 품목제조보고 / 브랜드 사례 / KRK 업데이트`)
     - 활성: 15px weight 600, INK, 하단 2px solid INK
     - 비활성: 15px weight 400, INK_3, 하단 2px transparent
   - 우측: `업종 선택` 드롭다운 (1px hairline 박스, 8px 14px padding, 13px)

6. **Article Grid (3-column)**
   - max-width 1240, padding `56px 40px 96px`
   - `grid-template-columns: repeat(3, 1fr); gap: 56px 32px`
   - 각 카드: 4:3 썸네일 + 카테고리 라벨 (11.5px) + 제목 (17.5px weight 600) + 메타 (`N분 · 기준 [출처]`, 11.5px INK_3)

7. **Footer**
   - 배경 `#0F0F12`, white text alpha
   - padding `36px 40px 28px`, max-width 1240
   - 좌측: `KRK CHECKER ·` 로고 (white) + `(c) 2026 krk.team · 서울특별시` (11px)
   - 우측 링크: 제품 / 가격 / 블로그 / 이용약관 / 개인정보처리방침 (11.5px, gap 22px)

#### Layout (Mobile < 768px)

- 같은 영역 1열 스택
- Nav: 로고만 + CTA 버튼 (메뉴 텍스트 숨김), padding `14px 20px`
- Page header padding `32px 20px 20px`, title 28px
- Featured: 세로 1열 (썸네일 → 제목 → 요약), no border container, padding `8px 20px 36px`
- Category Bar: `overflow-x: auto`, `white-space: nowrap`, gap 18px
- Article Grid: `grid-template-columns: 1fr; gap: 36px`, padding `32px 20px 56px`
- 카드 제목 16px

---

### 2. Blog Article Detail (`/blog/[slug]`)

#### Purpose
글 본문 + 자율 점검 권유 CTA. 신뢰성을 위해 메타·출처를 명확히 노출.

#### Layout (Desktop ≥ 1024px)

순서대로 (위 → 아래):

1. **Top Nav** — 리스트와 동일

2. **Article Header** (중앙 정렬, max-width 720)
   - padding `72px 32px 24px`
   - 카테고리 칩: 둥근 모서리 없음, 5px 12px, 배경 `#F4F4F5`, 11.5px, 좌측에 5px Breath Blue dot
   - 제목 `<h1>`: Pretendard 700, 42px, -0.03em, line-height 1.25, text-wrap balance, margin-bottom 18px
   - 요약: 16px, INK_2, line-height 1.6, max-width 580, center
   - 메타 행: `발행일 · N분 읽기 · [출처 태그들]` (12px INK_3, 출처는 1px 박스 칩)

3. **Hero Band** (max-width 920)
   - 4:3 일러스트 영역, 1px hairline border

4. **Body** (max-width 720, padding `64px 32px 0`)
   - 본문 문단: Pretendard 400, 16px, line-height 1.85, INK, -0.01em, margin-bottom 22px, text-wrap pretty
   - **H2**: 24px weight 700, -0.025em, margin `56px 0 18px`, 좌측에 Heritage Blue 번호 (`01`, Inter 600, 14px)
   - **H3**: 18px weight 600, margin `32px 0 12px`
   - **Quote (`<blockquote>`)**: 좌측 2px INK 보더, 22px padding, 17px Pretendard 500, line-height 1.7
   - **Table**: `border-collapse: collapse`, th 배경 `#F4F4F5`, 1px row separator, 14px
   - **List**: bullets are em dash `—` in Heritage Blue (`::before` 또는 inline)
   - **Inline code**: Inter, 0.92em, 배경 `#F4F4F5`, padding `2px 6px`
   - **Strong**: weight 700, color INK
   - **Callout (tip / warn)**:
     - Tip: 배경 TINT `#F6F9FD`, 좌측 3px Breath Blue stroke, 1px hairline `rgba(12,164,249,0.2)`, padding `20px 24px`, 작은 라벨 `놓치기 쉬운 부분` (Heritage Blue, 11px Inter 700, 0.14em tracking)
     - Warn: 배경 `#FFF7E8`, 좌측 3px `#D98D26` stroke, 라벨 `주의 — 면책` (color `#9F6612`)
   - **Visual cues** (✓ / ✗): 박스 형태, 좌측에 색 강조 글리프 + `<code>` 인라인
   - **Related inline link**: 1px hairline 박스 + `RELATED` 배지 + 글 제목 + `→`

5. **Bottom CTA Block** (soft tint box)
   - 배경 TINT, 1px hairline, **좌측 3px Breath Blue 보더**
   - padding `36px 40px`, margin-top `72px`
   - 좌측: `NEXT STEP` 배지(Heritage Blue, 10.5px Inter 700, 0.18em) → "이 글의 기준대로 라벨을 검토하고 싶다면" (18px weight 700) → 1줄 설명 (13.5px INK_2)
   - 우측: 검은 버튼 `KRK Checker 시작하기 →` (INK 배경, white, 14px Pretendard 600) → `KRK Landing.html`

6. **Actions Row** (Toss 스타일)
   - 상단 1px hairline, padding-top 32px
   - 좌측: `목록 보기` (아이콘 + 텍스트, 1px hairline 버튼)
   - 우측: `공유하기`, `의견 남기기` (같은 스타일, gap 8px)

7. **Related Articles** (max-width 720, padding-top 88px)
   - 헤더: "관련 글" (20px weight 700) + 우측 `전체 보기 →` (12px INK_3)
   - 하단 1px hairline
   - 3열 카드 (gap 24px): 썸네일 + 카테고리 + 제목 (15.5px weight 600) + 메타

8. **Footer** — 리스트와 동일

#### Layout (Mobile)

- max-width 단일 컬럼, padding `36px 22px 16px` 헤더
- H1 26px, 본문 15px
- CTA 박스: padding `28px 22px`, 1열 스택 (텍스트 → 버튼)
- Actions Row: padding-top 24px
- Related Articles: `grid-template-columns: 1fr; gap: 28px`

---

## Interactions & Behavior

### Navigation
- 상단 nav `블로그`는 현재 페이지 표시 (weight 600, INK color)
- `라벨 검토 시작하기` CTA (header) → `/`(KRK Landing)
- `KRK Checker 시작하기 →` (article 하단 CTA) → `/`(KRK Landing)
- 카드 클릭 → `/blog/[slug]`
- `목록 보기` → `/blog`

### Category Filter
- 탭 클릭 시 article grid를 클라이언트에서 필터링 (`active === 'all' || article.cat === active`)
- 활성 탭 시각적 변화: weight 400→600, color INK_3→INK, 하단 2px transparent→INK

### Hover States
- 모든 링크/카드: 기본 transition `color 0.3s ease, opacity 0.3s ease`
- 카드 hover: 미세한 opacity 1→0.85 (또는 썸네일 transform: scale(1.02), 0.6s ease 권장 — KRK Brand Guideline)

### Animations
- 헤더 nav: 항상 표시, backdrop-filter blur
- Smooth scroll: `html { scroll-behavior: smooth }`
- 카테고리 탭은 sticky, 스크롤 시 nav 아래에 고정

### Responsive
| Breakpoint | 카드 그리드 | Nav |
|---|---|---|
| ≥1024px | 3열 | 가로 풀 |
| 768–1023px | 2열 | 가로 풀 (조정 필요) |
| <768px | 1열 | 로고 + CTA only, 카테고리 가로 스크롤 |

### Accessibility
- WCAG AA 텍스트 콘트라스트 확보됨 (INK on Paper = 검정 on 흰색)
- 모든 인터랙티브 요소: 키보드 포커스 가시화 (지금은 미정의, 구현 시 추가 필요 — INK 2px outline 권장)
- 코드의 `<a>`, `<button>` 의미 구분 유지

---

## State Management

### Blog List
- `active: string` — 현재 카테고리 ID (`'all' | 'label' | 'ingredient' | ...`)
- 서버 사이드: 글 목록 fetch (paginated 권장, 현재 디자인은 페이지네이션 없음 — 별도 협의 필요)

### Blog Article
- 정적 라우트: slug 기반 MDX/CMS 콘텐츠 fetch
- 관련 글: 같은 카테고리에서 3개 추출 (또는 수동 큐레이션 필드)

---

## Design Tokens

전부 인라인이 아닌 **CSS 변수 또는 디자인 토큰 파일**로 추출해서 사용 권장.

### Colors

```ts
// Brand
HERITAGE_BLUE = '#002D72'   // 헤리티지 컬러, Featured 배지·번호·강조
BREATH_BLUE   = '#0CA4F9'   // 라인 액센트, 콜아웃 강조
INK           = '#0A0A0B'   // 본문, 버튼 배경
INK_2         = 'rgba(10,10,11,0.65)'  // 보조 텍스트
INK_3         = 'rgba(10,10,11,0.45)'  // 메타, eyebrow, 비활성
INK_4         = 'rgba(10,10,11,0.30)'  // 구분점(·)
PAPER         = '#FFFFFF'
SURFACE       = '#F4F4F5'   // 칩 배경, 코드 배경, 테이블 헤더
TINT          = '#F6F9FD'   // 콜아웃 tip / 뉴스레터 / CTA 박스 배경
TINT_2        = '#EFF5FB'   // (예비)

// Lines
RULE          = 'rgba(10,10,11,0.10)'  // 일반 hairline
RULE_STRONG   = 'rgba(10,10,11,0.18)'  // 강조 hairline

// Footer
FOOTER_BG     = '#0F0F12'

// Callout warn (주의)
WARN_BG       = '#FFF7E8'
WARN_LINE     = 'rgba(217,141,38,0.2)'
WARN_STROKE   = '#D98D26'
WARN_LABEL    = '#9F6612'

// Success / error inline cues (✓/✗ 박스)
OK_BG         = '#EAF8EF'
OK_LINE       = 'rgba(0,128,64,0.18)'
OK_TEXT       = '#0A7A3A'
ERR_BG        = '#FBECEC'
ERR_LINE      = 'rgba(180,40,40,0.18)'
ERR_TEXT      = '#A82828'
```

### Typography

```ts
// Font families
FONT_KR = 'Pretendard, "Pretendard Variable", system-ui, -apple-system, sans-serif'
FONT_EN = 'Inter, system-ui, sans-serif'

// 적용 패턴
- 한글 본문/타이틀: Pretendard
- 영문 라벨/eyebrow/배지/숫자(`01`): Inter, uppercase, wide tracking (0.04–0.22em)
- 코드/내용량 수치: Inter, monospace 느낌으로 SURFACE 배경 칩
```

| 역할 | family | size (D / M) | weight | line-height | letter-spacing |
|---|---|---|---|---|---|
| H1 (article) | KR | 42 / 26 | 700 | 1.25 | -0.03em |
| Page title | KR | 40 / 28 | 700 | 1.2 | -0.028em |
| Featured title | KR | 32 / 19 | 700 | 1.28 / 1.35 | -0.025em / -0.02em |
| H2 | KR | 24 / 21 | 700 | 1.35 | -0.025em |
| H3 | KR | 18 / 16 | 600 | 1.4 | -0.02em |
| Card title | KR | 17.5 / 16 | 600 | 1.4 | -0.015em |
| Body | KR | 16 / 15 | 400 | 1.85 | -0.01em |
| Summary | KR | 15 / 13.5 | 400 | 1.55–1.65 | -0.01em |
| Quote | KR | 17 / 15.5 | 500 | 1.7 | -0.015em |
| Table | KR | 14 / 13 | 400/600 | 1.5 | -0.005em |
| Meta | KR | 12 / 11.5 | 400 | 1.4 | -0.005em |
| Eyebrow (`BLOG`, `FEATURED`) | EN | 11 / 10.5 | 600–700 | 1 | 0.18em |
| Logo | EN | 14 / 12 | 800 | 1 | 0.22em |
| Nav links | KR | 13 | 400 (active 600) | 1 | -0.005em |
| CTA button | KR | 14 / 13 | 600 | 1 | -0.005em |
| Footer | KR/EN | 11–12 | 400 | 1.4 | -0.005em |

### Spacing

```ts
// Section / page rhythm
SECTION_PAD_Y_D = 88     // section vertical padding desktop
SECTION_PAD_Y_M = 40
PAGE_PAD_X_D    = 40
PAGE_PAD_X_M    = 20
MAX_WIDTH_LIST  = 1240
MAX_WIDTH_ARTICLE = 720   // narrow column for readability

// Component spacing
GAP_CARD_GRID_D = '56px 32px'  // row × column
GAP_CARD_GRID_M = '36px'
CARD_TITLE_TO_META = 8
H2_MARGIN_TOP_D = 56
H2_MARGIN_TOP_M = 40
PARA_MARGIN_BOTTOM = 22
```

### Radii

```ts
RADIUS = 0       // 거의 모든 곳
RADIUS_DOT = '50%'   // Breath Blue dot, status dots
// 둥근 모서리 없음 — KRK Brand Guideline 준수
```

### Shadows

**없음.** 모든 깊이는 1px hairline border로만 표현. 예외 없음.

### Borders

```ts
BORDER_HAIRLINE = '1px solid rgba(10,10,11,0.10)'
BORDER_STRONG   = '1px solid rgba(10,10,11,0.18)'
BORDER_ACCENT_LEFT = '3px solid #0CA4F9'  // CTA 박스, 콜아웃 tip 좌측
BORDER_DARK     = '1px solid rgba(255,255,255,0.10)'  // dark band 내부
```

### Backdrop / Motion

```ts
NAV_BLUR = 'blur(28px) saturate(180%)'
NAV_BG   = 'rgba(255,255,255,0.72)'

TRANSITION_DEFAULT = 'color 0.3s ease, opacity 0.3s ease, background 0.3s ease'
TRANSITION_IMG     = 'transform 0.6s ease'
```

---

## Assets

이 핸드오프는 **이미지·일러스트 자산을 포함하지 않습니다.** 디자인 시안에서 카드 썸네일은 추상 SVG 마크(`Thumb` 컴포넌트)로 placeholder 처리되어 있습니다.

### 실제 구현 시 필요한 자산
- **카드 썸네일**: 각 글당 1개 일러스트 또는 사진 (4:3 비율 권장). 톤은 Breath Blue / Heritage Blue 팔레트와 조화되어야 함 (Toss Ads의 부드러운 푸른 그라데이션 일러스트 톤 참고)
- **Open Graph 이미지**: 글당 1개, 1200×630
- **사이트 파비콘**: 기존 KRK Checker 자산 재사용

### placeholder Thumb 컴포넌트
디자인 시안 중 임시 표현용. 10가지 마크 kind (`grid`, `orbit`, `arc`, `bars`, `tri`, `split`, `frame`, `dual`, `doc`, `screen`) — 실제 자산 도착 전까지 사용 가능. 카테고리별 의미를 약하게 담음.

### 폰트
- **Pretendard**: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css` (또는 self-host)
- **Inter**: Google Fonts (weights 300–800)

---

## Content

### 카테고리 (7개, 순서대로)
```ts
[
  { id: 'all',        label: '전체' },
  { id: 'label',      label: '라벨 기준' },
  { id: 'ingredient', label: '원재료·알레르기' },
  { id: 'packaging',  label: '분리배출·포장' },
  { id: 'filing',     label: '품목제조보고' },
  { id: 'cases',      label: '브랜드 사례' },
  { id: 'updates',    label: 'KRK 업데이트' },
]
```

### Article 데이터 구조
```ts
type Article = {
  id: string
  num: string          // '01' ... '10' — 디스플레이용 (선택)
  cat: CategoryId
  title: string
  summary: string      // 1줄 (~50자)
  time: number         // 분
  src: string[]        // 기준 출처 태그 (1~2개)
  date: string         // 'YYYY.MM.DD'
  featured?: boolean
  thumb: string        // 임시 SVG kind 또는 이미지 URL
}
```

### 카피 가이드
✅ 권장: 판매 전 확인 / 표시 기준 / 자율 점검 / 놓치기 쉬운 항목 / 기준 출처 / 검토 결과는 참고용
❌ 금지: 법적 문제 해결 / 통과 보장 / 인증 완료 / 공식 검토 / 법률 자문

본문 어딘가에 **면책 콜아웃** 1개 필수 (`⚠️ 이 글은 ~ 자율 점검을 돕기 위한 참고용입니다`).

### 초기 더미 콘텐츠 10개
`blog-data.jsx`의 `ARTICLES` 배열 참조. 실제 콘텐츠 마이그레이션 시 동일 구조 유지.

### 본문 더미 (상세 페이지 시안용)
`blog-article.jsx`의 `ArticleBody` 컴포넌트가 샘플 글 1번 (식품 라벨 9가지 표시사항)을 풀 렌더링 — 본문 요소(H2/H3/표/콜아웃/인용구/리스트/강조/링크/✓✗/코드)가 모두 어떻게 보여야 하는지 검증.

---

## Files in this bundle

| 파일 | 역할 |
|---|---|
| `KRK Blog.html` | 진입점 — Design Canvas로 4개 아트보드 (Desktop/Mobile × List/Article) 표시 |
| `blog-data.jsx` | 디자인 토큰(`KRK`), 카테고리, 더미 글 10개, `Thumb` 컴포넌트 (placeholder SVG 마크) |
| `blog-list.jsx` | 리스트 페이지 컴포넌트 (`BlogList`, `BlogNav`, `BlogFooter`, `FeaturedA`, `ArticleCard`, `CategoryTabs`, `NewsletterStrip`) |
| `blog-article.jsx` | 상세 페이지 (`BlogArticle`, `ArticleBody`, `ArticleCTA`, `ActionsRow`, `RelatedArticles`) |
| `design-canvas.jsx` | 시안 표시 캔버스 (구현에 불필요, 참고용) |
| `README.md` | 이 문서 |

### 구현 시 권장 모듈 구조

```
src/
  app/blog/
    page.tsx              # /blog 리스트
    [slug]/page.tsx       # /blog/[slug] 상세
  components/blog/
    BlogNav.tsx
    BlogFooter.tsx
    NewsletterStrip.tsx
    CategoryTabs.tsx
    ArticleCard.tsx
    FeaturedArticle.tsx
    ArticleHeader.tsx
    ArticleBodyMDX.tsx    # MDX renderer with custom components
    Callout.tsx           # tip / warn 변형
    Quote.tsx
    Table.tsx
    ArticleCTA.tsx
    ActionsRow.tsx
    RelatedArticles.tsx
  content/blog/
    *.mdx                 # 글 콘텐츠
  styles/
    tokens.css            # 위 디자인 토큰
```

### MDX 매핑
본문은 MDX 권장. 커스텀 컴포넌트:
- `<Callout type="tip|warn">` — 콜아웃 박스
- `<RelatedLink href="..." title="..." />` — 본문 인라인 관련글 박스

---

## 우선순위

1. **(필수)** 리스트 메인 + 상세 본문 + CTA 블록
2. **(권장)** Featured Article + 관련 글 + 카테고리 필터
3. **(선택)** 검색 / 페이지네이션 / 뉴스레터 구독 폼 / RSS

---

## 참고 링크

- Toss Ads Insights (시각 레퍼런스): https://tossads.toss.im/insights
- KRK Checker Blog 전략 문서: https://www.notion.so/368d03ec68bd815798bde87ee3d31abc
- KRK Checker Blog Sprint: https://www.notion.so/368d03ec68bd8148a974f3bd700f6244
