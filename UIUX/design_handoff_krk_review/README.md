# Handoff: KRK Checker — /review (무료 검토 결과 + 서비스 선택)

## Overview

KRK Checker 사용자가 Step 1~4에서 입력한 데이터를 기반으로 **무료 법규 검토 결과**를 보여주고, 유료 패키지(**기본 9,900원** / **전문 19,900원**) 구매로 유도하는 화면입니다. 결제 흐름의 핵심 전환 지점.

- 무료 결과 — 어떤 항목에 문제 있는지 "이유"만 노출 (수정 방법·기준 출처·과태료는 잠금)
- 유료 결제 후 (`/payment/complete`) — 모든 내용 잠금 해제 + 다운로드 허브 진입

| 라우트 | `src/pages/ReviewResult.tsx` |
|---|---|
| 진입 | Step 4 → "검토 결과 보기" CTA |
| 이탈 | `/payment` (service 선택 후) 또는 Creator 복귀 (입력 수정) |

---

## About the Design Files

이 번들의 HTML/JSX 파일들은 **디자인 레퍼런스**입니다 — 의도된 시각/구조를 보여주는 React 기반 프로토타입이며, 그대로 production에 복사하는 코드가 아닙니다.

작업 목표는 이 디자인을 **타깃 코드베이스(React + TypeScript)에서 재구현**하는 것. 데이터는 `sessionStorage`의 `krk_creator_draft_v1`을 읽어 `analyzeRegulations()` 함수로 결과 생성 → 이 화면이 렌더.

---

## Fidelity

**High-fidelity (hifi)** — 색상·타이포·간격·레이아웃·인터랙션 모두 픽셀 단위 명시.

---

## ⚠️ Variation 선택: B안 (Decision hero) 채택

원본 디자인 파일(`review-result.jsx`)에는 두 가지 안(`VariationA`, `VariationB`)이 있지만 **B안만 채택**됨. 구현 시 A안 코드는 무시 가능 (`VariationA` 함수 + `ResultItem` 등 A 전용 컴포넌트 제거 가능).

### B안 (채택) — Decision hero
- 위반 발견 시 **다크 hero** + 큰 score strip (38px Inter)
- 위반 항목을 hero 직하단 **callout으로 직접 노출** (제목만, "수정 문구 잠김" 인라인)
- 결과 목록은 **컴팩트 1-line** (badge + 제목 + 잠금 표시)
- 패키지는 **통합 카드 + 기본/전문 탭 토글** → 결정 단순화

### 폐기 사유
A안 (와이어프레임 충실, 사이드 sticky 2-card 분리)은 결제 동기 형성이 약했음. B안의 다크 hero + 위반 callout 직접 노출이 결제 전환에 유리하다는 판단.

---

## Props & Modes

```ts
type ReviewResultProps = {
  mode: 'violations' | 'warns-only' | 'all-pass';
  device: 'desktop' | 'mobile';
  // variation prop은 B안만 사용 (A안은 폐기)
};
```

### 3가지 mode
| mode | 시나리오 | Hero 톤 | H1 카피 |
|---|---|---|---|
| `violations` | 필수 확인 N + 보완 권장 M (기본 시나리오) | **다크** (#1a1d24) | "판매 전 확인이 필요한 항목이 발견됐어요." |
| `warns-only` | 필수 0, 보완 권장만 | 라이트 (CARD) | "몇 가지만 보완하면 판매 준비가 끝나요." |
| `all-pass` | 16/16 통과 | 라이트 (CARD) | "입력하신 라벨이 기준에 맞는지 정리했어요." |

---

## Layout Structure

```
[StickyNav]                                  ← KRK CHECKER · 검토 결과 라벨
[Flow Breadcrumb 5단계]                       ← 정보입력(done) / 라벨미리보기(done) / 무료검토결과(active) / 상세수정가이드 / 다운로드

[Hero — 다크/라이트 분기]
  eyebrow + H1 + score strip 3-col (필수확인 N · 보완권장 N · 기준충족 N)
  + 큰 숫자 (Inter 38px) + 입력 수정하기 백링크

[Violations Callout]                         ← violations mode일 때만
  필수 확인 N건 — 위반 항목 제목 ticker (수정 문구 잠김 인라인)

[Main 2-col grid] minmax(0,1fr) / 340px
  좌 — 결과 목록 (kind별 섹션):
    [필수 확인 N] ← need 항목 (compact rows)
    [보완 권장 N] ← warn 항목
    [기준 충족 N — collapsed bar]
  우 — sticky IntegratedPackageCard:
    탭 토글 [기본 9,900] / [전문 19,900] (active = 흰 텍스트 + Heritage/INK bg)
    선택된 패키지 상세 + 4-bullet 포함 내역 + 결제 CTA

[NoticePanel]                                ← 면책 고지
```

### 모바일 (1-col stack)
- Hero · Callout · 결과 목록 · 통합 패키지 · Notice 순으로 stack
- Sticky 사이드 → static
- score strip은 3-col 유지 (좁아도 큰 숫자 효과 살림)

---

## Design Tokens

### Colors (이미 KRK 시스템과 정합)

| 토큰 | 값 | 용도 |
|---|---|---|
| `HERITAGE` | `#002D72` | 브랜드 메인 · 전문 패키지 강조 · 활성 step crumb |
| `HERITAGE_600` | `#00255E` | OK 배지 텍스트 |
| `BREATH` | `#0CA4F9` | 기본 패키지 CTA · underline accent |
| `BREATH_50` | `#EAF6FE` | OK badge 배경 |
| `INK` | `#0A0A0B` | 기본 텍스트 · 활성 탭(기본) |
| `INK_2` | `rgba(10,10,11,0.65)` | 본문 보조 |
| `INK_3` | `rgba(10,10,11,0.4)` | inactive crumb · meta |
| `SURFACE` | `#F4F4F5` | 페이지 배경 |
| `CARD` | `#fff` | 카드 배경 |
| `HAIRLINE_SOFT` | `rgba(10,10,11,0.08)` | 카드 보더 |
| `WARN_BG` / `WARN_TEXT` | `#FFF3DC` / `#8A5A00` | 보완 권장 배지 |
| `RISK_BG` / `RISK_TEXT` | `#FFE6E6` / `#B30000` | 필수 확인 배지 · 다크 hero score 빨강 |

### Hero (다크 모드 — violations)
- 배경: `#1a1d24`
- 텍스트: `#fff`
- score 색: 필수 `#FF8A8A` · 보완 `#FFD78B` · 통과 BREATH

### Fonts
- 한글: **Pretendard Variable** (CDN)
- 영문/수치: **Inter** (Google Fonts, 300~800)

---

## Result Item Data Shape

```ts
type ResultItem = {
  id: string;              // 예: 'r01' ~ 'r11'
  kind: 'need' | 'warn' | 'ok';
  title: string;
  desc: string;
  chips: string[];         // 예: ['원재료 영역', '품목제조보고 입력값 영향']
  locked: boolean;         // 잠금 콘텐츠 표시 여부 (need/warn만 true)
  lockMsg?: string;        // 예: '상세 수정 문구 잠김'
  lockSub?: string;        // 예: '... 전문 수정 가이드에서 확인...'
};
```

`presetFor(mode)` 함수가 mode별로 적절한 items 배열과 counts(`need`, `warn`, `ok`) 반환. 실제 구현에서는 `analyzeRegulations(creatorData)` 결과를 매핑.

---

## IntegratedPackageCard (B안 핵심)

```jsx
<aside sticky>
  {/* Tab toggle — 좌(기본) / 우(전문 추천) */}
  <div grid 1fr 1fr borderBottom>
    <PackageTab active={tier==='basic'} label="기본" price="9,900" />
    <PackageTab active={tier==='pro'}   label="전문" price="19,900" recommended />
  </div>

  {/* 선택된 패키지 상세 */}
  <div padding 22>
    <eyebrow>Professional Guide · Recommended | Basic Label Package</eyebrow>
    <h3>{meta.title}</h3>
    <price>{meta.price}원</price> ← Heritage 36px Inter 700

    <ul gap 9>
      {meta.bullets.map(b => <li with checkmark icon>{b}</li>)}
    </ul>

    <button height 48 fullWidth Heritage/Breath bg>
      {meta.cta}
    </button>

    <footer color={INK_3} fontSize={11}>
      KRK 검토 결과는 자율 점검 참고 자료이며, 식약처 공식 인증이 아닙니다.
    </footer>
  </div>
</aside>
```

### 패키지별 내용

**기본 (9,900원)** — 4 bullets
- 라벨 PDF · 인쇄용
- 라벨 PNG · 고해상도
- 항목별 텍스트 복사

**전문 (19,900원)** — 4 bullets, Heritage 강조
- 항목별 수정 방법 + 표시 기준 출처
- 과태료 · 행정처분 참고 정보
- 신고 입력 가이드 + 라벨 검토 리포트
- 분리배출 마크 ZIP + 라벨 PDF/PNG

---

## Interactions & Behavior

### Tab toggle (통합 패키지 카드)
- 클릭 시 `setTier('basic' | 'pro')` 상태 전환
- 활성 탭: 추천(전문) = Heritage bg + 흰 텍스트, 기본 = INK bg + 흰 텍스트
- 비활성 탭: 투명 bg + INK 텍스트 + 우측 1px border (기본 탭만)
- 가격 표기: 활성 시 opacity 1, 비활성 0.7

### 결제 CTA
- 클릭 → `navigate('/payment', { state: { service: tier } })`
- service 값으로 `/payment` 분기 (basic 9,900 / pro 19,900)

### 입력 수정하기 (← 백링크)
- 클릭 → `navigate('/creator')` (Creator 복귀, sessionStorage 데이터 유지)
- 디자인: BREATH underline + ←arrow icon

### Sticky 동작
- Desktop: 사이드 패키지 카드 `position: sticky; top: 88px`
- Mobile: static (1-col stack)

### Flow Breadcrumb
- 5단계 모두 가로 한 줄 (mobile에서도 overflow-x: auto 처리)
- done 단계: 체크 아이콘 (HERITAGE)
- active 단계: HERITAGE 채워진 원 + 흰 숫자
- inactive: INK_3 텍스트 + 빈 원

---

## State Management

```ts
const [tier, setTier] = useState<'basic' | 'pro'>('pro');  // 초기값 = 전문 추천

const { counts, items } = useMemo(() => presetFor(mode), [mode]);
//   mode = analyzeRegulations(creatorData).mode
//   counts = { need: N, warn: M, ok: K }
//   items = ResultItem[]
```

데이터 소스:
- `sessionStorage.getItem('krk_creator_draft_v1')` → CreatorData
- `analyzeRegulations(data)` → 16개 R01~R20 결과 + counts + items
- `/review` 페이지가 결제 전 — 결과 저장은 결제 후 (`/payment/complete`) 시점에 서버 기록

---

## Mobile-specific

- StickyNav: 라벨 텍스트 숨김, 로고만
- Flow Breadcrumb: overflow-x: auto, gap 압축
- Hero score strip: 3-col 유지 (좁아도 큰 숫자 효과)
- Violations callout: 풀폭, 패딩 축소
- 결과 목록: ResultItemCompact (badge + 제목 + 잠금표시 1줄)
- IntegratedPackageCard: static (sticky 해제), 마진 위/아래로

---

## 폐기된 v3 요소 (사용 금지)

- ❌ `Tier 1` / `Tier 2` / `Tier S/A/B` 단어
- ❌ "베타 검토" / "정식 검토" 표현
- ❌ "PDF 3종" 통합 카피 (개별 파일명으로)
- ❌ 사이드바 분리형 2-card (기본/전문 분리) — A안 디자인. **통합 카드 + 탭 토글로 대체**
- ❌ 항목마다 LockedBlock blur overlay (A안 디자인). **callout + "수정 문구 잠김" 인라인 텍스트로 대체**

---

## Files in this bundle

| 경로 | 설명 |
|---|---|
| `prototypes/KRK Review Result.html` | DesignCanvas 호스트 — B안 5개 카드 (Desktop 3 + Mobile 2) |
| `prototypes/review-result.jsx` | 메인 컴포넌트. **B안 = `VariationB` 함수만 사용** (`VariationA`는 폐기) |
| `prototypes/design-canvas.jsx` | DesignCanvas 의존성 (개발 시 불필요) |
| `briefs/design-brief-review-result.md` | /review 상세 사양 (와이어프레임 기준) |
| `briefs/review-result-wireframe.html` | 원본 와이어프레임 (참고용, A안의 기반) |
| `briefs/design-service-brief-v2.md` | service-v2 전체 지침 (Tier 제거 등 상위 규칙) |

---

## 시안 보기

```bash
cd prototypes
python3 -m http.server 8000
# http://localhost:8000/KRK%20Review%20Result.html
```

DesignCanvas는 pan(드래그) / zoom(휠) 인터랙션 지원. 5개 카드:
- 01 Desktop · violations (다크 hero, 가장 자주 보일 시나리오)
- 02 Desktop · warns-only (라이트 hero)
- 03 Desktop · all-pass (안도형 카피)
- 04 Mobile · violations
- 05 Mobile · all-pass

---

## 구현 시 정리할 것

1. `review-result.jsx`의 `VariationA` 함수 및 그 종속 컴포넌트 (`ResultItem`, `LockedBlock`, `OfferCard`, `IncludedFilesPanel`, `SummaryCard`, `ScoreCell`, `EditInputLink`) 제거 가능
2. `variation` prop 제거 (B안만 사용 — 항상 B 동작)
3. `presetFor(mode)`의 더미 items를 실제 `analyzeRegulations` 결과로 교체
4. `KRK-3148` 같은 더미 ID 부분 실제 sessionId/orderId로 교체
5. 결제 CTA navigate state로 service 값 전달 (`/payment`에서 받아서 사용)
