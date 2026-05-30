# 🎨 Claude Design Brief — Step 2 원재료 입력 (Step2_Ingredients)

> **작성일**: 2026-05-24
> **대상 파일**: `src/pages/creator/Step2_Ingredients.tsx` (재설계)
> **상태**: 기능 구현 완료 → KRK 디자인 시스템 정합성 재작업 필요
> **참고**: Step 4 브리프(`design-brief-step4-preview.md`) 톤/컴포넌트 언어 기준

---

## 1. 이 화면의 역할

Creator Step 2. 사용자가 제품에 들어가는 **원재료를 직접 입력**하고,
**포장재 재질을 선택**하는 화면.

- 입력한 원재료는 Step 4 라벨 미리보기와 /review 검토 결과에 그대로 반영
- 카테고리 기반 **자동완성** 제공 (Step 1에서 선택한 카테고리 기준)
- 알레르기 유발물질 · 복합원재료 **자동 감지** 후 인라인 피드백
- 포장재 재질 선택 → 분리배출 마크 자동 제공 (환경부 고시 2024-170호)

---

## 2. 화면 구조 (위 → 아래 순서)

```
[Creator 공통 StepBar]
[Page Header] ← Section eyebrow + H1 (Creator.tsx에서 주입)

[A. 포장재 재질 선택 섹션]
[B. 자동완성 안내 배너]
[C. 원재료 테이블]
  ├ 테이블 헤더
  ├ 원재료 행 (반복)
  ├ 빈 상태
  └ 총중량 초과 경고 / 정렬 순서 경고
[D. 원재료 추가 버튼]
[E. 요약 바] ← 1개 이상 입력 시에만 표시
[F. 알레르겐 배너] ← 자동 감지 결과
[G. 복합원재료 배너] ← 자동 감지 결과
```

---

## 3. 컴포넌트별 설계 지침

### A. 포장재 재질 선택

**목적**: 결제 후 분리배출 마크 SVG 자동 제공의 입력값. 법규 의무 항목.

**구조**:
- 섹션 타이틀: `"포장재 재질"` — 13px, semibold
- 서브텍스트: `"선택한 재질에 맞는 분리배출 마크를 자동으로 제공합니다 (환경부 공식 도안). 해당하는 것 모두 선택."` — 11px, muted
- 2개 그룹으로 구분: `플라스틱` / `기타 재질`
  - 각 그룹 레이블: uppercase, 10px, muted
- **Chip 버튼** (다중 선택):
  - 미선택: 연한 배경, 옅은 border, muted 텍스트
  - 선택됨: Heritage 배경 연하게 (`rgba(0,45,114,0.06)`), Heritage border, Heritage 텍스트, 체크 아이콘
  - 크기: `px-2.5 py-1.5`, 11px, border-radius 없음 (flat)

**하단 피드백**:
- 선택 시: `"선택됨: PET, PP"` — 11px, Heritage 텍스트
- 미선택 시: ⚠️ `"포장재를 선택하지 않으면 R15 분리배출 마크 검토(과태료 최대 300만원)를 건너뜁니다."` — 11px, warning amber

---

### B. 자동완성 안내 배너

Step 1에서 카테고리를 선택한 경우에만 표시.

- 연한 회색 배경 박스
- 텍스트: `"원재료명 입력 시 [카테고리명] 원재료를 자동완성으로 제안합니다."` — 12px
- [카테고리명]은 bold ink 처리

---

### C. 원재료 테이블

**테이블 헤더** (컬럼 6개):
| 컬럼 | 너비 | 내용 |
|------|------|------|
| 원재료명 | flex-1 | AutocompleteInput |
| 중량(g) | 88px | number input (우측 정렬) |
| 비율 | 64px | 자동 계산 표시 (읽기 전용) |
| 알레르기 | 68px | 체크박스 (빨간 accent) |
| 복합원재료 | 76px | 체크박스 (amber accent) |
| (삭제) | 32px | Trash2 아이콘 버튼 |

헤더 스타일: `uppercase`, 10px, font-en, muted, 연한 배경

**원재료 행**:
- 짝수/홀수 행 배경 미세하게 구분
- 각 셀 좌우 `px-2`, 상하 `py-1.5`
- 비율 컬럼: `tabular-nums`, 중앙 정렬, muted
- 알레르기 자동 감지 시 체크박스 자동 체크됨 (사용자 수동 수정 가능)
- 복합원재료 자동 감지 시 체크박스 자동 체크됨

**AutocompleteInput (자동완성 인풋)**:
- 일반 input 스타일 + 포커스 시 드롭다운
- 드롭다운: 흰 배경, border, shadow, max-height 스크롤
- 각 제안 항목: 12px, hover시 ink 배경/흰 텍스트
- 키보드 네비게이션 지원 (↑↓ Enter Escape)

**빈 상태**:
- 행 없이 중앙에 `"아래 버튼으로 원재료를 추가하세요."` — 13px, muted
- 최소 높이 유지 (py-12 정도)

---

### C-1. 총중량 초과 경고

조건: 원재료 합계 > 제품 내용량 (Step 1 입력값)

```
⚠️ 원재료 합계 Xg이 제품 내용량 Yg을 초과합니다. 중량을 다시 확인해주세요.
```
- 빨간 배경(`#FFE6E6`) + 빨간 border(`#B30000`)
- 텍스트 12px, 수치는 semibold + tabular-nums

---

### C-2. 정렬 순서 경고

조건: 2개 이상 입력, 함량 내림차순 정렬 아닐 때

```
⚠️ 원재료는 함량이 많은 순서대로 표기해야 합니다.   [자동 정렬]
```
- amber 배경(`#FFF3DC`) + amber border
- 우측에 `"자동 정렬"` 버튼 — underline, ArrowUpDown 아이콘, 11px
- 클릭 시 즉시 정렬

---

### D. 원재료 추가 버튼

- `"+ 원재료 추가"` — btn-ghost 스타일
- 좌측 정렬, min-height 44px (터치 타겟)

---

### E. 요약 바

원재료 1개 이상 입력 시 표시. 3열 그리드.

| 셀 | 레이블 | 값 스타일 |
|---|---|---|
| 총 중량 | uppercase 10px muted | 20px bold, tabular-nums |
| 알레르기 | uppercase 10px muted | 20px bold, 감지 시 `#B30000`, 없으면 muted |
| 복합원재료 | uppercase 10px muted | 20px bold, 감지 시 `#8A5A00`, 없으면 muted |

연한 배경, thin border

---

### F. 알레르겐 배너

**감지됨**:
- 연한 빨간 배경(`#FFF8F8`) + 빨간 border
- `⚠️ 알레르기 유발 물질 감지됨` — 13px, semibold, 빨간
- 물질명 목록 — 14px bold, `·` 구분
- 법규 안내 — 12px, muted

**없음**:
- 연한 Breath 배경 + Breath border
- `✓ 알레르기 유발 물질 없음` — 13px, Breath/heritage 계열

---

### G. 복합원재료 배너

감지 시에만 표시.

- Heritage 연한 배경(`rgba(0,45,114,0.03)`) + Heritage border(`rgba(0,45,114,0.25)`)
- `📋 복합원재료 표시 필요` — 13px, semibold, Heritage
- 항목별: `원재료명 → 구성 원재료를 괄호로 표시하세요` — 13px
  - 힌트: 11px, muted
  - 예시 형식: 11px, muted
- 들여쓰기 구분 (pl-[22px])

---

## 4. 상태 정리

| 상태 | 화면 변화 |
|------|----------|
| 빈 상태 (원재료 없음) | 테이블 빈 상태, E/F/G 숨김 |
| 1개 이상 입력 | E 요약 바, F/G 배너 표시 |
| 합계 > 내용량 | C-1 경고 표시 |
| 정렬 오류 | C-2 경고 + 자동정렬 버튼 표시 |
| 알레르겐 감지 | F 빨간 배너 |
| 복합원재료 감지 | G Heritage 배너 |

---

## 5. 모바일 대응

- 테이블: 6열 → 스크롤 가능 최소 너비 유지 또는 카드 형태 전환 검토
- 포장재 Chip: 줄바꿈 허용 (`flex-wrap`)
- 요약 바 3열: 좁으면 2+1 분리 검토

---

## 6. 데이터 연결 포인트

| UI 영역 | CreatorData 필드 |
|---------|-----------------|
| 원재료 테이블 | `ingredients[]` (id, name, weight, isAllergen, isComposite) |
| 비율 계산 | `ingredients[].weight` / 전체 합산 |
| 자동완성 소스 | `categories[]` → JSON 데이터셋 |
| 포장재 재질 Chip | `packagingMaterials[]` |
| 알레르겐 배너 | `detectedAllergens[]` (자동 갱신) |
| 복합원재료 배너 | `detectedComposites[]` (자동 갱신) |
| 총중량 비교 | `totalWeight` (Step 1 입력) |

---

## 7. 주의사항

- Creator 내부 Step 2 — StepBar 유지
- 자동 감지(`isAllergen`, `isComposite`)는 이름 입력 즉시 반영. 사용자가 수동 수정 가능.
- "자동 정렬" 클릭 → `pushUpdate(sorted)` 호출, 테이블 순서 즉시 반영
- 다음 버튼 (`canGoNext`) 조건: 별도 validation 없음 — Step 2는 항상 통과 가능 (빈 상태도 다음 진행 가능)
- 비율 컬럼은 읽기 전용, 자동 계산 (`weight / 전체합 * 100`)
