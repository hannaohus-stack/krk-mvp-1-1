# Handoff: KRK Step 1 — 카테고리 / 사업자 유형 입력

## Overview
Creator의 첫 화면. 제품명·식품 카테고리(다중 선택)·사업자 유형을 입력받음. **v2 정합성 회복 완료** — Tier 분기·가격 노출 전부 제거됨.

| 라우트 | `src/pages/creator/Step1_Category.tsx` |
|---|---|
| 다음 | Step 2 (원재료) |

## About the Design Files
이 번들의 HTML/JSX는 디자인 레퍼런스. React + TypeScript로 재구현 대상.

## Fidelity
**High-fidelity** — 색상·타이포·간격·인터랙션 모두 정확히 재현.

## ⚠️ v2 정합성 (service-brief-v2 적용 완료)
service-v2 지침에 따라 다음 항목이 **완전 제거**됨:
- `TIER_MAP`, `getTier`, `priceFor`, `tierLabel` 함수
- 카테고리 카드 `⚠ 베타` 배지
- 푸터 `TierPreview` (검토 등급 + 예상 금액 stat block)
- 혼합 경고 배너 (`MixedWarnBanner`)
- "Tier", "베타", "정식 검토" 단어 일체

→ 입력 화면에는 **가격/등급 노출 금지**. 서비스 선택은 `/review`에서.

## Layout
```
[PageHeader] StepProgress 1/4 + URL meta
[메인 컨텐츠 max-w 920]
  StepCrumb ─ STEP 01 / 04 · 제품 정보
  H1: 제품 정보를 입력해 주세요
  
  [Product Name 인풋]  ← v2 default: 포커스 border + 가짜 caret
  
  [Food Category · 식품 카테고리]
    7개 카테고리 chip 그리드 (4-col desktop / 2-col mobile, flex-wrap, 마지막 행 centered)
    선택 = INK 배경 + 흰 텍스트 + 체크 아이콘
    선택 요약 라인 (선택된 카테고리 콤마 나열)
  
  [Business Type · 사업자 유형]
    2-segment: 식품제조가공업 / 즉판가공업(즉석판매제조·가공업)
    선택 = INK 배경 + 흰 텍스트
    
[Footer] 우측 정렬 "다음 — 원재료 정보" CTA (Breath)
```

## Props & Modes
```ts
type Step1Props = {
  mode: 'default' | 'single' | 'multi' | 'sellside' | 'error';
  device: 'desktop' | 'mobile';
  version?: 1 | 2;  // 무시 가능, 항상 v2
};
```

### 5가지 mode 시나리오
| mode | 시나리오 |
|---|---|
| `default` | 빈 폼 (제품명 포커스 신호) |
| `single` | 단일 카테고리 선택 (잼류) + 요약 라인 |
| `multi` | 다중 선택 (3개) |
| `sellside` | 즉판가공업 선택 (디저트/베이커리) |
| `error` | 필수 입력 누락 — 빨간 보더 + 에러 메시지 |

## Categories
```ts
const CATEGORIES = [
  '잼류', '소스류', '장류', '떡류',
  '디저트/베이커리', '차/음료', '건강식품(일반)',
];
```
(이전 `TIER_MAP` Tier S/A/B 분기는 폐기 — 단순 배열)

## Design Tokens
| 토큰 | 값 |
|---|---|
| `HERITAGE` | `#002D72` — Step Crumb · 활성 강조 |
| `BREATH` | `#0CA4F9` — CTA 버튼 |
| `INK` | `#0A0A0B` — 활성 카테고리 카드 배경 |
| `SURFACE` | `#F4F4F5` — 페이지 배경 |
| `CARD` | `#fff` |
| `HAIRLINE` | `rgba(10,10,11,0.15)` |
| `ERROR` | `#B30000` — 에러 보더 |
| `SYS_OK_BG` | `#EAF6FE` |

## Fonts
- 한글: **Pretendard Variable**
- 영문/수치: **Inter**

## Interactions & Behavior
- 카테고리 카드 클릭 → 다중 선택 토글 (체크박스 시맨틱: `role="checkbox"`, `aria-checked`)
- 사업자 유형 segment 클릭 → 단일 선택
- 다음 버튼: 카테고리 ≥ 1개 + 사업자 유형 선택 시 활성. 아니면 disabled
- 에러 상태: submitted=true이고 누락 시 빨간 보더 + 에러 메시지

## State Management
```ts
const [productName, setProductName] = useState('');
const [categories, setCategories]   = useState<string[]>([]);
const [businessType, setBusinessType] = useState<'식품제조가공업' | '즉판가공업' | ''>('');
const [submitted, setSubmitted]     = useState(false);
```

저장: `sessionStorage.setItem('krk_creator_draft_v1', JSON.stringify({...}))`

## Files in this bundle
| 경로 | 설명 |
|---|---|
| `prototypes/KRK Step1 Category.html` | DesignCanvas 호스트 — 5 modes × desktop/mobile |
| `prototypes/step1-category.jsx` | 메인 컴포넌트 |
| `prototypes/design-canvas.jsx` | DesignCanvas (개발 시 불필요) |
| `briefs/design-brief-category-ui.md` | 카테고리 UI 상세 |
| `briefs/design-service-brief-v2.md` | service-v2 전체 지침 |

## ⚠️ Dead code (구현 시 제외 가능)
`step1-category.jsx`에 남아있는 미사용 함수:
- `MixedWarnBanner` — 호출처 없음
- `TierPreview` — 호출처 없음, `priceFor`(이미 삭제) 참조 → 호출 시 런타임 에러
- `PreviewStat` — TierPreview 헬퍼

→ 구현 시 위 3개 함수 정의는 모두 제거하세요. `version={1}` 아카이브 카드도 무시.

## 시안 보기
```bash
cd prototypes
python3 -m http.server 8000
# http://localhost:8000/KRK%20Step1%20Category.html
```
