# Handoff: KRK Step 3 — 영양성분 입력 (B안 채택)

## Overview
Creator Step 3. 영양성분 직접 입력 + 소규모 제조업 면제 진단.

## ⚠️ Variation 선택: B안 (Inline 진단) 채택

원본 `step3-nutrition.jsx`에 A안(3-mode + 모달) + B안(Inline 진단) 두 가지 안. **B안만 채택**.

### B안 (채택) — Inline 진단
- 면제 자가진단을 **페이지 내 collapsible 카드**로 (모달 없음)
- 진단 + 입력이 같은 화면에 공존
- 스크롤로 모든 상태 접근 — 모바일에서 자연스러움

### A안 폐기 사유
모달 전환은 인터랙션 비용 큼. 모바일에서 풀스크린 처리 필요. Inline 카드가 더 직관적.

## Fidelity
**High-fidelity**

## Layout
```
[PageHeader] StepProgress 3/4
[메인 max-w 820]
  StepCrumb ─ STEP 03 / 04 · 영양성분
  H1: 영양성분을 입력하거나 면제 여부를 확인해주세요
  
  [InlineDiagnosis card] — collapsible
    collapsed: 한 줄 안내 + "진단 시작" 버튼
    expanded:
      좌상단 "면제 자가진단 · N/4" 카운터
      4 질문 row (각: 질문 텍스트 + 법규 + 예/아니오 버튼)
      답변 완료 시 결과 박스 (면제가능 초록 / 면제불가 빨강)
  
  [exempted 모드일 때] ExemptedBanner (초록 border-left 4px)
  
  [입력 폼] (exempted/choose 외 mode)
    상단: "영양성분 직접 입력" label + Coming Soon 버튼
    [1회 제공량] 인풋 + 단위 select (g/mL)
    [영양성분표]
      검정 헤더: "영양성분표" + "1회 Xg 기준"
      6개 row: 열량(main, 강조) / 탄수화물 / └ 당류(indent) / 단백질 / 지방 / 나트륨
    [도움말 + 면제 확인 링크]
  
[Footer] "이전 / 다음 — 라벨 미리보기" CTA
```

## Props & Modes
```ts
type Step3Props = {
  variation: 'B';  // A안 폐기, 항상 'B'
  mode: 'choose' | 'input-empty' | 'input-filled' | 'exempted' | 'modal-empty' | 'modal-pass' | 'modal-fail';
  device: 'desktop' | 'mobile';
};
```

B안 mode 매핑 (mode 이름은 A안과 호환):
| mode | B안에서 의미 |
|---|---|
| `choose` | 진단 접힘 + 입력 폼 열림 (default landing) |
| `modal-empty` | 진단 펼침 · 미답변 |
| `modal-pass` | 진단 펼침 · 4 yes (면제 가능 결과 인라인) |
| `modal-fail` | 진단 펼침 · no 1개 (면제 불가 → 직접 입력 유도) |
| `input-empty` | 입력 폼 빈 상태 |
| `input-filled` | 입력 폼 값 입력됨 (canGoNext) |
| `exempted` | 면제 적용 결과 + ExemptedBanner |

## Exemption Criteria
```ts
const EXEMPTION_QUESTIONS = [
  { q: '연 매출액이 1억 원 미만인가요?',                law: '식품등의 표시기준 제5조 1항' },
  { q: '종업원 수가 50인 미만인가요?',                  law: '식품등의 표시기준 제5조 1항' },
  { q: '제품에 영양강조표시(저칼로리·무가당 등)가 없나요?', law: '식품등의 표시기준 제5조 2항' },
  { q: '건강기능식품 또는 특수영양식품이 아닌가요?',      law: '식품등의 표시기준 제5조 3항' },
];
```
4개 모두 "예" → 면제 가능 (sysOK 초록). 하나라도 "아니오" → 면제 불가 (ERROR 빨강).

## Nutrition Fields (6항목)
| key | label | unit | 특수 |
|---|---|---|---|
| calories | 열량 | kcal | **main** — bold, 강조, h-10 |
| totalCarbs | 탄수화물 | g | |
| sugar | 당류 | g | **indent** — `└` 아이콘, pl-26 |
| protein | 단백질 | g | |
| totalFat | 지방 | g | |
| sodium | 나트륨 | mg | |

## canGoNext 로직
```ts
const canGoNext = mode === 'exempted' 
                || (mode === 'input-filled' && hasAtLeastOneNutritionValue);
```

## Toast — Coming Soon
"🚀 자동 계산 — Coming Soon" 버튼 클릭 시 토스트 표시:
- 위치: `position: fixed; top: 80px; left: 50%; transform: translateX(-50%)`
- 배경: INK, 흰 텍스트, 13px
- 2.5초 후 자동 사라짐
- 메시지: "자동 계산 기능은 v1.5에 추가될 예정입니다."

## Design Tokens
| 토큰 | 값 |
|---|---|
| `HERITAGE` `#002D72` | 활성 yes 버튼 · 자가진단 헤더 |
| `BREATH` `#0CA4F9` | CTA |
| `INK` `#0A0A0B` | 영양성분표 헤더 배경 |
| `SYS_OK` `#1F8A5B` | 면제 가능 결과 |
| `SYS_OK_BG` `#F0FDF4` | exempted 배너 배경 |
| `SYS_WARN` `#B07A1A` | choose 모드 진단 권유 |
| `SYS_WARN_BG` `#FFF8E1` |  |
| `ERROR` `#B30000` | 활성 no 버튼 · 면제 불가 결과 |
| `ERROR_BG` `#FFF5F5` |  |

## Files in this bundle
| 경로 | 설명 |
|---|---|
| `prototypes/KRK Step3 Nutrition.html` | DesignCanvas — A/B 둘 다 표시. **B안 카드만 채택** (id 시작 `b-`) |
| `prototypes/step3-nutrition.jsx` | 컴포넌트. **B안 = `VariationB` + `InlineDiagnosis` 사용** |
| `briefs/design-brief-step3-nutrition.md` | 상세 사양 |
| `briefs/design-service-brief-v2.md` | service-v2 지침 |

## 구현 시 정리할 것
1. `VariationA`, `ExemptionModal` 함수 제거 (A안 전용 — 모달 폐기)
2. `variation` prop 제거 (항상 B 동작)
3. mode 명을 의미에 맞게 리네이밍 (예: `modal-pass` → `diag-pass`)
4. `EXEMPTION_QUESTIONS` 배열을 별도 const 파일로 분리 가능
5. 인풋은 숫자만 허용 (`type="number"`, e/E/+/- 차단)
