# 🎨 Claude Design Brief — 검토 결과 화면 (/review)

> **작성일**: 2026-05-22
> **대상 파일**: `src/pages/ReviewResult.tsx` (신규 재설계)
> **참고 와이어프레임**: `Codex/2026-05-21/review-result-wireframe.html`
> **상태**: 와이어프레임 UX 구조 확정 → KRK 디자인 시스템 적용 재작업 필요

---

## 1. 이 화면의 역할

사용자가 Step 1~3에서 입력한 데이터를 기반으로 **무료 법규 검토 결과**를 보여주고, 유료 패키지(기본 9,900 / 전문 19,900) 구매로 유도하는 화면.

- 무료: 어떤 항목에 문제가 있는지 "이유"만 노출
- 유료: 수정 방법, 기준 출처, 과태료 정보까지 잠금 해제

---

## 2. 레이아웃 구조 (와이어프레임 기준 확정)

### 전체 구조
```
[Sticky Nav]
[Flow Breadcrumb] ← 5단계 진행 표시
[Hero Section] ← 2-col (헤드카피 + Summary Card)
[Main Section] ← 2-col (결과 목록 + 사이드바)
[Bottom Notice]
```

### Col 비율
- Hero: `1fr 340px`
- Main Section: `1fr 340px`
- 모바일: 단일 컬럼, 사이드바는 결과 아래로

---

## 3. 컴포넌트별 설계 지침

### 3-1. Sticky Nav
- 기존 앱 공통 Nav와 동일하게 적용
- 우측 레이블: `"검토 결과"` (영문 소문자 Inter 계열)

---

### 3-2. Flow Breadcrumb
5단계 수평 진행 표시. 현재는 Step 3 활성.

| 순서 | 레이블 | 상태 |
|------|--------|------|
| 1 | 정보 입력 | done |
| 2 | 라벨 미리보기 | done |
| 3 | 무료 검토 결과 | **active** |
| 4 | 상세 수정 가이드 | inactive |
| 5 | 다운로드 | inactive |

- 원형 번호 아이콘, done은 체크 or filled
- 연결선: 가는 수평 rule 선
- active: Heritage 색, done: Breath 또는 Heritage, inactive: ink-3

---

### 3-3. Hero Section (2-col)

**좌측 — 텍스트 영역**
- Eyebrow: `"무료 검토 결과"` — Heritage, uppercase, Inter 11px
- H1: `"판매 전 확인해야 할 표시 기준을 정리했어요."` — 58px / line-height 1.05
- Lead: 16px / ink-2 / 실제 제품명 기반 문구

**우측 — Summary Card**
- 흰 배경, 1px border (rule)
- 상단 헤드: `Label Readiness` 레이블 + 제품명
- 하단: **3열 스코어 그리드**

| 열 | 내용 | 숫자 색 |
|----|------|---------|
| 필수 확인 | 위반 수 | risk-text (#b30000) |
| 보완 권장 | 경고 수 | warn-text (#8a5a00) |
| 기준 충족 | 통과 수 | Heritage |

- 숫자: Inter 34px / bold
- 레이블: 12px / ink-2

---

### 3-4. 결과 목록 패널 (좌측 메인)

**패널 헤더**
- H2 + 서브텍스트 + 우측 badge (필수 확인 N개)

**결과 아이템 (result)** — 2-col 내부 레이아웃
- 좌: `badge` (필수확인 / 보완권장 / 기준충족)
- 우: H3 제목 + 설명 텍스트 + chip 태그 목록

**Badge 스타일**
| 타입 | 배경 | 텍스트 |
|------|------|--------|
| 필수 확인 | risk-bg | risk-text |
| 보완 권장 | warn-bg | warn-text |
| 기준 충족 | breath-50 | heritage-600 |

**Chip 태그** — 작은 outline 태그. 영역/법규 정보 표시 (예: `원재료 영역`, `환경부 고시 참고`)

**Locked Content 블록** — 위반/경고 항목 아래 붙는 유료 잠금 영역
- 블러 처리된 더미 라인 3줄 (실제 내용처럼 보이도록)
- 위에 반투명 흰 오버레이
- 오버레이 중앙: `"상세 수정 문구 잠김"` (Heritage, 13px bold) + 설명 텍스트
- **기준 충족 항목에는 locked 블록 없음**

---

### 3-5. 사이드바 (우측, sticky top: nav 높이 + 16px)

**① 기본 라벨 패키지 카드**
- 일반 border (rule)
- Small 레이블: `Basic Label Package`
- H2: `기본 라벨 패키지`
- 가격: `9,900원` — Heritage, Inter 28px bold
- 설명 텍스트 + 포함 항목 리스트 (dot bullet)
- CTA 버튼: `기본 라벨 패키지 받기` → btn-primary (Breath)

**② 전문 수정 가이드 카드 (추천)**
- **Heritage border** 강조
- Small 레이블: `Professional Guide` — Heritage 색
- H2: `전문 수정 가이드`
- 가격: `19,900원` — Heritage
- 설명 텍스트 + 포함 항목 리스트
- CTA 버튼: `상세 수정 가이드 받기` → btn-heritage

**③ 포함 파일 목록**
- 작은 패널, 파일명 + 용도 row 형태
- 예: `라벨 PDF` / `인쇄 참고용`

**④ 면책 고지 패널**
- 배경 흰색, 작은 텍스트
- "KRK의 검토 결과는 자율 점검 참고 자료이며…" 형식

---

## 4. 모바일 대응

- Nav 레이블 숨김
- Hero: 단일 컬럼 (Summary Card가 헤드카피 아래로)
- Main Section: 단일 컬럼 (사이드바가 결과 목록 아래로)
- Sticky 사이드바 → static으로 전환
- result 아이템 내부: 2-col → 단일 컬럼

---

## 5. 주의사항

- 이 화면은 `/review` 경로로 독립 페이지 (Creator 내부 step 아님)
- Creator `sessionStorage` 데이터 (`krk_creator_draft_v1`)를 읽어 결과 렌더링
- "상세 수정 가이드 받기" CTA → `/payment`으로 navigate (tier: 'tier2')
- "기본 라벨 패키지 받기" CTA → `/payment`으로 navigate (tier: 'tier1')
- locked 블록은 실제 데이터가 아닌 시각적 placeholder
