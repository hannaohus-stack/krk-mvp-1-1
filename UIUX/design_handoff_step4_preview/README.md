# Handoff: KRK Step 4 — 라벨 미리보기

## Overview
Creator Step 4 (마지막). Step 1~3에서 입력한 데이터를 **실제 식품 라벨 형식**으로 렌더링해 보여주고, 누락/오류 항목 확인 후 `/review`로 이동.

| 라우트 | `src/pages/creator/Step4_Preview.tsx` |
|---|---|
| 다음 CTA | `navigate('/review')` |

## ⚠️ Variation 결정 미정 (사용자 확인 필요)

원본 `step4-preview.jsx`에 두 가지 안이 모두 살아있음:

### A안 — Label hero (와이어 충실)
- 라벨 미리보기가 main (좌측 큰 영역, 전면+후면 나란히)
- 사이드(300px)에 "수정 필요" + "확인 완료" 카드 2개
- 항목별 issue 카드 (kind: error/warn/info 분기)

### B안 — Review hero (검토 결과 중심)
- 검토 상태 hero(큰 score) + 결과 목록이 메인 컬럼
- 라벨은 우측 사이드(300px)에 **thumbnail** (scale 0.7)
- "크게 보기" 버튼 (Future: 모달 라벨 확대)

**구현 시 둘 중 하나 결정 필요.** 결정되면 다른 안의 `Variation*` 함수 제거.

## Fidelity
**High-fidelity**

## v2 정합성 (적용 완료)
- `tier-b` mode → **`multi-violation`**으로 교체 (필수 위반 4건 + 보완 1건)
- `DATA_JAM.tier` / `DATA_VIT.tier` 필드 제거
- FrontLabel `BETA` 마크 제거
- "Tier B · 베타 검토" 카피 모두 폐기

## Props & Modes
```ts
type Step4Props = {
  variation: 'A' | 'B';   // 결정 필요
  mode: 'all-pass' | 'missing' | 'exempt' | 'multi-violation';
  device: 'desktop' | 'mobile';
};
```

### 4 modes
| mode | 시나리오 |
|---|---|
| `all-pass` | 모든 표시 항목 통과 (issues 0) |
| `missing` | 제조원 + 알레르기 누락 (가장 자주 보일 케이스) |
| `exempt` | 즉판가공업 — 영양성분 면제 적용 |
| `multi-violation` | 필수 위반 4건 + 보완 1건 (스트레스 테스트) |

## 라벨 구조

### FrontLabel (전면)
- 상단: brand strip + 식품유형 배지 (Heritage 배경)
- 제품명 (32px, 700 weight)
- 영문 부제 (Inter 10.5px, 0.14em letterspacing)
- 특징 한 줄 (선택)
- 이미지 placeholder (repeating-linear-gradient)
- 하단: 내용량 (현재는 단위만, GAP 1 미적용 — PDF에서만 열량 병기)

### BackLabel (후면)
- 헤더 strip (제품명 · 내용량 + BACK 라벨)
- 원재료명 (알레르기 원료는 Heritage bold)
- 알레르기 박스 (Heritage border + 강조)
- 소비기한 + 보관방법
- 영양성분표 (또는 면제 박스)
- 제조원 + 신고번호
- 바코드 + KRK·BETA footer (※ Step 4 라벨은 미리보기용 — PDF용 라벨과 일부 다름)

## Issue Card 구조 (사이드 패널)
```ts
type Issue = {
  id: string;
  kind: 'error' | 'warn' | 'info';
  title: string;
  desc: string;
  stepIdx: number;     // 1~3 — Step N에서 수정
  stepLabel: string;   // 예: '사업자 정보'
};
```
- kind별 색상: error=ERROR(#B30000) / warn=SYS_WARN(#B07A1A) / info=BREATH(#0CA4F9)
- "Step N 수정" 클릭 → `onGoToStep(N)` (Creator 내부 step 이동, navigate 아님)

## Footer CTA
```ts
const errorCount = issues.filter(i => i.kind === 'error').length;
const nextDisabled = errorCount > 0;
const nextLabel = nextDisabled
  ? `필수 항목 ${errorCount}개 수정 필요`
  : '확인하고 검토 결과 보기';
```
다음 버튼 클릭 → `navigate('/review')`

## Design Tokens
| 토큰 | 값 |
|---|---|
| `HERITAGE` `#002D72` | 식품유형 배지 · 알레르기 강조 |
| `BREATH` `#0CA4F9` | CTA · info 카드 |
| `INK` `#0A0A0B` | 라벨 본문 |
| `SURFACE` `#F4F4F5` | 페이지 배경 |
| `CARD` `#fff` | 카드 배경 · 라벨 배경 |
| `SYS_OK` `#1F8A5B` | 확인 완료 (pass) 카드 |
| `SYS_WARN` `#B07A1A` | warn issue |
| `ERROR` `#B30000` | error issue · 필수 위반 |
| `RULE` `rgba(10,10,11,0.85)` | 라벨 외곽 보더 |

## Files in this bundle
| 경로 | 설명 |
|---|---|
| `prototypes/KRK Step4 Preview.html` | DesignCanvas — A안 + B안 둘 다 (각 4 modes) |
| `prototypes/step4-preview.jsx` | 컴포넌트 — `VariationA` / `VariationB` |
| `briefs/design-brief-step4-preview.md` | 상세 사양 |
| `briefs/step4-wireframe.html` | 원본 와이어프레임 (A안 기반) |
| `briefs/design-service-brief-v2.md` | service-v2 지침 |

## 구현 시 정리할 것
1. **A안 / B안 결정** — 디자이너와 협의
2. 결정되지 않은 안의 `Variation*` 함수 + 종속 컴포넌트 제거
3. `variation` prop 제거
4. `presetFor(mode)`의 더미 issues/data를 실제 `analyzeRegulations(creatorData)` 결과로 교체
5. 라벨 시안 → 실제 인쇄 PDF 생성은 `generateLabelPDF.ts`로 별도 (디자인 핸드오프 `design_handoff_krk_pdfs/` 참조)
