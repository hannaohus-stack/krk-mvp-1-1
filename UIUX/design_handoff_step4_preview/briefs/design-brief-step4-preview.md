# 🎨 Claude Design Brief — Step 4 라벨 미리보기 (Step4_Preview)

> **작성일**: 2026-05-22
> **대상 파일**: `src/pages/creator/Step4_Preview.tsx` (재설계)
> **참고 와이어프레임**: `Codex/2026-05-21/step4-wireframe.html`
> **상태**: 와이어프레임 UX 구조 확정 → KRK 디자인 시스템 적용 재작업 필요

---

## 1. 이 화면의 역할

Creator Step 4. 사용자가 입력한 데이터를 **실제 식품 라벨 형식**으로 렌더링해 보여주고,
누락/오류 항목을 확인한 뒤 다음 단계(검토 결과 `/review`)로 이동하는 화면.

- 전면 라벨 + 후면 라벨을 나란히 미리보기
- 우측 사이드에서 수정 필요 항목 즉시 확인 + 해당 Step으로 바로 이동 가능

---

## 2. 레이아웃 구조

### 전체 구조
```
[Creator 공통 StepBar]
[Page Header] ← eyebrow + H1 + 설명 + 우측 Status Card
[Workspace] ← 2-col (미리보기 영역 + 사이드 패널)
[하단 Actions] ← 이전 / 다음 버튼
```

### Col 비율
- Workspace: `1fr 300px`
- 모바일: 단일 컬럼, 사이드 패널 → 미리보기 아래

---

## 3. 컴포넌트별 설계 지침

### 3-1. Page Header

**좌측**
- Eyebrow: `"Step 04 · Label Preview"` — Heritage, uppercase, Inter 11~12px
- H1: `"라벨 미리보기"` — 30px
- 설명: `"입력한 정보를 실제 라벨 구조로 확인하고, 누락 가능 항목을 수정합니다."` — muted, 15px

**우측 — Status Card**
- 반투명 흰 배경 + blur (frosted glass)
- Heritage 계열 얇은 border
- 굵은 텍스트: `"검토 상태 · N개 항목 확인 필요"` 또는 `"모든 항목 확인 완료"`
- 서브텍스트: 상태 설명 (muted, 13px)

---

### 3-2. 미리보기 영역 (좌측 메인)

**영역 헤더**
- H2: `"제품 라벨 시안"` + 서브텍스트 `"전면과 후면을 나란히 확인합니다."`
- 우측: 사이즈 표기 (예: `"90 × 60 mm 기준"`) — muted, small

**라벨 그리드 — 2열**

각 열 위에 레이블:
- `FRONT LABEL` — Heritage, uppercase, 12px bold
- `BACK LABEL` — Heritage, uppercase, 12px bold

**전면 라벨 (FRONT)**
흰 배경, 1px 검정 border, 재단선 (crop mark) 4코너 표시

| 영역 | 내용 |
|------|------|
| 상단 | 식품유형 배지 (Heritage border/text, 10px bold) |
| 제품명 | 32px, 900 weight, line-height 1.12 |
| 특징 문구 | muted, 13px (선택 입력) |
| 이미지 영역 | dashed border placeholder, `"제품 이미지 / 컬러 영역"` |
| 하단 | 내용량 (좌우 분리, border-top 구분선) |

**후면 라벨 (BACK)**
흰 배경, 1px 검정 border, 재단선 4코너

각 섹션은 `border-top` 구분선 + 섹션 레이블 (INGREDIENTS / ALLERGEN 등) uppercase, 9px

| 섹션 | 내용 |
|------|------|
| 원재료명 (INGREDIENTS) | 실 데이터 텍스트, 12px |
| 알레르기 (ALLERGEN) | 주황 border + 배경 박스, bold 경고 텍스트 |
| 소비기한/보관방법 (DATE & STORAGE) | 12px |
| 영양성분 (NUTRITION) | 테이블 형식, 1px 검정 border, 11px |
| 하단 2-col | 제조원/소재지 텍스트 + 바코드 placeholder |

**바코드 placeholder**: 수직 스트라이프 패턴, dashed border, 44px 높이

---

### 3-3. 사이드 패널 (우측)

**① 수정이 필요한 항목 패널**

제목: `"수정이 필요한 항목"` — H2 16px

항목이 있을 때 — Issue Card (항목당 1개):
- 연한 붉은 배경 + border (`#ead4d4` / `#fffafa`)
- 제목: 항목명 (13px bold)
- 설명: 무엇이 비어있는지 (muted, 12px)
- 하단 링크 버튼: `"Step N에서 수정하기"` — Heritage 텍스트, Breath underline, 작은 텍스트

항목이 없을 때 — 빈 상태 처리 (긍정 메시지)

**② 확인 완료 패널**

제목: `"확인 완료"` — H2 16px

Pass 아이템:
- 연한 Breath 배경 (`breath-50` 계열) + Heritage 계열 border
- Heritage 텍스트, 13px bold
- 예: `"원재료명 표시 순서 정리됨"`, `"알레르기 표기 위치 확인됨"`

---

### 3-4. 하단 Actions

- 좌: `"이전 단계"` — btn-ghost 또는 outline
- 우: `"확인하고 검토 결과 보기"` — btn-primary (Heritage)
- 버튼 간격: justify-between

---

## 4. 모바일 대응

- Page Header: 2-col → 단일 컬럼 (Status Card가 헤드 아래)
- 라벨 그리드: 2-col → 단일 컬럼 (FRONT → BACK 순서)
- Workspace: 2-col → 단일 컬럼 (사이드 패널이 미리보기 아래)
- 라벨 최소 너비: `min(100%, 320px)` 유지

---

## 5. 데이터 연결 포인트

| UI 영역 | CreatorData 필드 |
|---------|-----------------|
| 식품유형 배지 | `categories[]` |
| 제품명 | `productName` |
| 내용량 | `totalWeight` + `unit` |
| 원재료 | `ingredients[]` (name, weight) |
| 알레르기 | `ingredients[].isAllergen` |
| 소비기한 | `expiryDate` → 날짜 포맷 |
| 보관방법 | `storage` |
| 영양성분 | `nutrition` (면제 시 텍스트 대체) |
| 제조원 | `manufacturer` |
| 포장재 | `packagingMaterials[]` |

**영양성분 면제 시**: 테이블 대신 `"소규모 제조업 면제 적용"` 텍스트 박스 표시

---

## 6. 주의사항

- Creator 내부 step 4 (StepBar 표시 유지)
- "수정하기" 클릭 시 → `onGoToStep(N)` prop 호출 (navigate 아님)
- 다음 버튼 → `navigate('/review')` (sessionStorage에 데이터 유지된 상태)
- 재단선(crop mark)은 인쇄 가이드용 시각 요소 — 실 인쇄 규격 아님
- 라벨 미리보기는 **참고용**임을 화면 어딘가에 작은 텍스트로 명시
