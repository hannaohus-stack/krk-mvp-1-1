# Handoff: KRK Step 2 — 원재료 입력 (B안 채택)

## Overview
Creator Step 2. 원재료 입력 + 포장재 재질 선택. 알레르기·복합원재료 **자동 감지**, 분리배출 마크 자동 매핑.

| 라우트 | `src/pages/creator/Step2_Ingredients.tsx` |
|---|---|

## ⚠️ Variation 선택: B안 (Card stack) 채택

원본 `step2-ingredients.jsx`에 A안(6-col 테이블) + B안(Card stack) 두 가지 안이 있지만 **B안만 채택**. 구현 시 A안 코드는 무시 가능 (`VariationA` + `IngredientTable` + `CheckCell` 함수 제거 가능).

### B안 (채택) — Card stack
- 각 원재료가 stacked 카드 — 첫 줄: 번호+이름 인풋+삭제, 둘째 줄: 중량/비율 + 자동감지 태그
- 자동감지 태그에 **`AUTO` 라벨** 인라인 표시 (알레르기·복합원재료)
- 모바일 친화 — 좁은 폭에서도 가독성 유지

### A안 폐기 사유
6-col 테이블은 정보 밀도 높지만 모바일에서 가로 스크롤 필요. 카드형이 더 유연하고 자동감지 태그가 시각적으로 명확.

## About the Design Files
이 번들은 디자인 레퍼런스. React + TypeScript로 재구현 대상.

## Fidelity
**High-fidelity**

## Layout (B안 기준)
```
[PageHeader] StepProgress 2/4
[메인 max-w 720]
  StepCrumb ─ STEP 02 / 04 · 원재료 정보
  H1: 원재료를 입력해주세요
  
  [포장재 재질] section
    플라스틱 그룹 (PET PP PE PS PVC OTHER)
    기타 재질 그룹 (유리 종이 캔(철) 캔(알루미늄) 복합재질)
    chip 클릭 = 다중 선택
    하단 피드백: 선택됨 (Heritage) / 미선택 시 warn 안내 (과태료 최대 300만원)
  
  [자동완성 안내 배너]
    "원재료명 입력 시 [카테고리명] 원재료를 자동완성으로 제안합니다."
  
  [원재료 카드 stack]
    각 카드:
      Row 1: 번호 + 이름 인풋 + 삭제 아이콘
      Row 2: 중량(g) 인풋 + 비율% (auto) + 알레르기/복합 태그 (감지 시)
    빈 상태: dashed border placeholder
    
    [총중량 초과 경고] (있을 때) — 빨간
    [정렬 순서 경고] (있을 때) — amber + 자동 정렬 버튼
    
    [+ 원재료 추가] dashed 버튼
  
  [요약 바] 3-col: 총 중량 / 알레르기 N개 / 복합원재료 N개
  
  [알레르겐 배너] 감지 시 빨강 / 없으면 Breath
  [복합원재료 배너] 감지 시 Heritage

[Footer] "이전 / 다음 — 영양성분" CTA
```

## Props & Modes
```ts
type Step2Props = {
  variation: 'B';  // A안 폐기됨, 항상 'B'
  mode: 'empty' | 'filled' | 'detected' | 'warnings' | 'autocomplete';
  device: 'desktop' | 'mobile';
};
```

### 5 modes
| mode | 시나리오 |
|---|---|
| `empty` | 원재료 없음 (placeholder) |
| `filled` | 5개 원재료 입력 완료 (정상) |
| `autocomplete` | 마지막 row에 autocomplete 드롭다운 열림 |
| `detected` | 알레르기 3종 + 복합원재료 1종 자동감지 |
| `warnings` | 총중량 초과 + 정렬 오류 (자동 정렬 버튼) |

## Data Shapes
```ts
type Ingredient = {
  id: number;
  name: string;
  weight: number;       // g
  isAllergen: boolean;  // auto-detected, 수동 수정 가능
  isComposite: boolean; // auto-detected, 수동 수정 가능
};

type Step2Data = {
  ingredients: Ingredient[];
  packagingMaterials: string[];  // 예: ['PET', '종이']
};
```

## Auto-detect Logic
- 알레르기 유발 22종 리스트(딸기·우유·대두 등) 매핑 → `isAllergen` 자동 true
- 원재료명에 "복합", "혼합", "조미료" 등 키워드 포함 → `isComposite` 자동 true
- 사용자가 수동으로 체크/언체크 가능 (override)

## Validation Rules
| 조건 | 표시 |
|---|---|
| 합계 > Step 1의 `totalWeight` | 빨간 `TotalWeightError` 배너 |
| 2개 이상 입력 + 함량 내림차순 아님 | amber `SortOrderWarning` + "자동 정렬" 버튼 |

자동 정렬 클릭 → `setIngredients(sorted desc)` 즉시 반영.

## Design Tokens
| 토큰 | 값 |
|---|---|
| `HERITAGE` `#002D72` | 포장재 선택 강조 · CTA |
| `BREATH` `#0CA4F9` | autocomplete border · CTA |
| `INK` `#0A0A0B` |  |
| `SURFACE` `#F4F4F5` |  |
| `CARD` `#fff` |  |
| `SYS_WARN` `#B07A1A` | 복합원재료 · amber 경고 |
| `SYS_WARN_BG` `#FFF3DC` |  |
| `ERROR` `#B30000` | 알레르기 · 총중량 초과 |
| `ERROR_BG` `#FFE6E6` |  |

## Mobile-specific
- 카드 stack은 그대로 동작 (좁은 폭에서도 카드 1열)
- 포장재 chip은 flex-wrap
- 요약 바 3-col 유지 (압축)

## Files in this bundle
| 경로 | 설명 |
|---|---|
| `prototypes/KRK Step2 Ingredients.html` | DesignCanvas — A안 + B안 둘 다 보이지만 **B안 카드만 채택** (id 시작 `b-`) |
| `prototypes/step2-ingredients.jsx` | 컴포넌트. **B안 = `VariationB` + `IngredientCard` + `AutoDetectTag` 사용** |
| `briefs/design-brief-step2-ingredients.md` | 상세 사양 |
| `briefs/design-service-brief-v2.md` | service-v2 지침 |

## 구현 시 정리할 것
1. `VariationA`, `IngredientTable`, `CheckCell` 함수 제거 (A안 전용)
2. `variation` prop 제거 (항상 B 동작)
3. AUTOCOMPLETE_SUGGESTIONS를 실제 카테고리별 JSON 데이터셋으로 교체
4. 자동감지 로직을 실제 알레르기 22종 + 복합 키워드 매핑으로 구현
