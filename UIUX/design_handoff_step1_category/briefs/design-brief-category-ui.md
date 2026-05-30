# Design Brief — 카테고리 선택 UI (Step 1 v3)

> **버전**: v3.0 | **작성일**: 2026-05-19

---

## 개요

식품 카테고리 다중 선택 + 사업자 유형 필드. v3에서 3개 단일 선택 → 7개 다중 선택으로 전환.
`Step1_ProductInfo.tsx` — 제품명 아래 배치.

---

## 카테고리 목록 & Tier

| 카테고리 | Tier | 배지 |
|---------|------|------|
| 잼류 | S | 없음 |
| 소스류 | S | 없음 |
| 장류 | S | 없음 |
| 떡류 | A | 없음 |
| 디저트/베이커리 | A | 없음 |
| 차/음료 | B | ⚠️ 베타 |
| 건강식품(일반) | B | ⚠️ 베타 |

---

## 레이아웃

- 섹션 레이블: `FOOD CATEGORY *` (11px, 0.08em tracking, 45% opacity)
- 7개 체크박스 카드 그리드: `grid-cols-2 gap-2` (모바일) / `grid-cols-4 gap-2` (데스크톱)
- 각 카드: `min-h-[52px]`, sharp border (`border border-[rgba(10,10,11,0.15)]`)
- 선택 시: `bg-ink text-white border-ink`
- 미선택: `bg-white text-ink hover:bg-[rgba(10,10,11,0.04)]`

---

## 카드 내부 구조

```
[ ✓ ] 잼류
      (Tier S 카드는 배지 없음)

[ ✓ ] 차/음료   ⚠️ 베타
      (Tier B 카드는 우측 상단에 배지)
```

- 카테고리명: `font-kr text-[14px] font-medium`
- 베타 배지: `badge-warn` 클래스 (기존 시스템 재사용) — `text-[10px]`
- 체크 아이콘: 선택 시 `✓` (Lucide `Check` 16px), 미선택 시 빈 박스

---

## 사업자 유형 필드

- 위치: 카테고리 그리드 **아래**
- 레이블: `BUSINESS TYPE *`
- 세그먼트 라디오 2개: `식품제조가공업` | `즉판가공업`
- 기존 `SegmentGroup` 컴포넌트 재사용
- 툴팁(선택사항): "즉석판매제조가공업의 줄임" — `AlertCircle` 아이콘 + hover tooltip

---

## 유효성 검사

- 카테고리: 최소 1개 이상 선택 → 미선택 시 `border-[#B30000]` 전체 그리드 외곽
- 사업자유형: 필수 선택 → 미선택 시 기존 에러 스타일
- Tier 혼합 선택 (S+B) → 경고 인라인 메시지: `⚠️ S/A + B 카테고리 혼합 선택 — 19,900원이 적용됩니다`

---

## Tier 혼합 경고 배너

- 조건: `getTier(categories) === 'B'`이면서 S/A 카테고리도 함께 선택된 경우
- 위치: 카테고리 그리드 아래
- 스타일: `badge-warn` 인라인 배너
- 텍스트: `⚠️ S/A + B 카테고리 혼합 선택 — 19,900원이 적용됩니다`

---

## 접근성

- 각 카드: `role="checkbox"`, `aria-checked`
- 키보드: Space로 토글
- 그룹: `role="group"` + `aria-labelledby` 연결

---

## 타입 변경 사항

`types.ts`에서 반드시 함께 수정:
- `foodCategory: string` → `categories: string[]`
- `businessType: '식품제조가공업' | '즉판가공업' | ''` 신규 추가
- `isStep1Complete()` 조건: `categories.length > 0 && businessType !== ''`
