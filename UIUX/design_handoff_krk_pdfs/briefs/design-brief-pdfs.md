# Design Brief — PDF 산출물 레이아웃 (라벨 검토 리포트 + 신고 입력 가이드)

**산출물 경로** `/payment/complete` → Tier 2 전문 패키지 다운로드  
**관련 파일**
- `src/utils/generateCertPDF.ts` — PDF-03 라벨 검토 리포트
- `src/utils/generateReportPDF.ts` — PDF-02 정부24 신고 입력 가이드  
**브리프 버전** v1.0 (2026-05-22)

---

## 1. 개요 및 역할 분리

KRK Checker의 PDF 산출물은 3종이다.

| PDF | 번호 | 파일 | Tier |
|-----|------|------|------|
| 식품 라벨 | PDF-01 | `generateLabelPDF.ts` | Tier 1 + Tier 2 공통 |
| **라벨 검토 리포트** | **PDF-03** | `generateCertPDF.ts` | **Tier 1 (잠금 버전) + Tier 2 (전체)** |
| **정부24 신고 입력 가이드** | **PDF-02** | `generateReportPDF.ts` | **Tier 2 전용** |

> ⚠️ 파일명 주의: `generateCertPDF`는 "라벨 검토 리포트"이고, `generateReportPDF`는 "신고 입력 가이드"이다.  
> 함수명과 실제 문서명이 역방향 매핑되어 있으므로 코드 수정 시 혼동 주의.

---

## 2. 공통 설계 원칙

### 2-1. 색상 토큰 (3개 파일 공통)

```
HERITAGE  = #002D72   ← 헤더·강조·인라인 링크
INK       = #0A0A0B   ← 기본 텍스트
FAINT     = rgba(10,10,11,0.45)  ← 부연설명·레이블
HAIRLINE  = rgba(10,10,11,0.1)   ← 구분선·테두리
```

### 2-2. 기술 방식

- HTML 문자열 → `Blob(text/html)` → `<a download>` 트리거
- 사용자는 브라우저 Print → "PDF로 저장"을 실행
- `@media print { .toolbar { display:none; } }` — 스티키 툴바는 인쇄 제외
- `-webkit-print-color-adjust: exact; print-color-adjust: exact;` — 배경색 인쇄 강제

### 2-3. 스티키 툴바 패턴 (3개 파일 공통)

```
[ PDF-0X · 문서명 ]                            [ PDF 저장 (파란 버튼) ]
```

- 배경: `HERITAGE (#002D72)`
- "PDF 저장" 버튼: `background: #0CA4F9`, `onclick="window.print()"`

### 2-4. 폰트

- `Pretendard Variable` — CDN import  
  `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css`
- 영문 수치·코드: `Inter, system-ui`

---

## 3. PDF-03 라벨 검토 리포트 (`generateCertPDF.ts`)

### 3-1. 문서 목적

사업자 자율 점검 기록. 단속 대비 보관용 증빙.  
`analyzeRegulations()` 결과를 그대로 문서화한 출력본이다.

파일명 형식: `KRK_라벨검토리포트_{productName}_{YYYYMMDD}.pdf`

### 3-2. 레이아웃 구조

```
[스티키 툴바]
  PDF-03 · 라벨 검토 리포트              [ PDF 저장 ]

[Heritage 헤더 밴드] ← 풀 width, Heritage 배경
  eyebrow: PDF-03 · Label Review Report
  H1:      krk 라벨 검토 리포트
  subtext: 사업자 자율 점검 기록 · {Tier}

[인포 그리드 2×2]  ← 각 셀 border
  검토번호          |  발급 일시
  제품명            |  검토 등급 (Tier 뱃지)

[중요 안내 블록]  ← border-left: 3px solid #B30000
  ⚠ 중요 안내 (4개 항목, 2열 그리드)

[검토 결과 요약 바]  ← 연한 배경
  "{요약 텍스트}"     위반N  경고N  통과N

[검토 항목 테이블]
  | 코드 | 항목 | 관련 법규 | 결과 |
  ├ 각 항목 행
  ├ [위반/경고 시] 상세 설명 행  ← bg: rgba(10,10,11,0.015)
  ├ [Tier 2] 수정방법 + 과태료 행  ← bg: rgba(0,45,114,0.025)
  └ [Tier 1] 🔒 잠금 메시지 행

[푸터 면책]
  border-top + 검토번호 + 면책 문구 + krk.team
```

### 3-3. Tier별 항목 행 구성

**Tier 2 (전문 수정 가이드):**
```
행 1: 코드  항목명  관련법규  [통과/경고/위반 뱃지]
행 2: (공백)  상세 설명 텍스트  (위반/경고 항목만)
행 3: (공백)  ✦ 수정 방법 / 과태료: X만원  (위반/경고 항목만)
```

**Tier 1 (기본 라벨 패키지):**
```
행 1: 코드  항목명  관련법규  [통과/경고/위반 뱃지]
행 2: (공백)  상세 설명 텍스트  (위반/경고 항목만)
행 3: (공백)  🔒 수정 방법 및 과태료 — 전문 수정 가이드에서 확인 가능
```

### 3-4. Tier 뱃지 텍스트

| Tier | 현재 코드 문구 | 목표 (PaymentComplete 언어 통일) |
|------|--------------|--------------------------------|
| Tier 2 | `Tier 2 · 전문 검토` | `전문 수정 가이드` |
| Tier 1 | `Tier 1 · 기본 검토` | `기본 라벨 패키지` |

> ⚠️ **현재 미반영**: 코드 내부에 "Tier 1/2"라는 기술명이 사용자 노출 문구로 노출됨.  
> PaymentComplete 브리프 §10 텍스트 원칙과 맞춰 수정 필요.

### 3-5. 상태 뱃지 스타일

| 상태 | 배경 | 텍스트 색 | 보더 |
|------|------|-----------|------|
| 통과 | `rgba(26,107,58,0.1)` | `#1A6B3A` | `rgba(26,107,58,0.25)` |
| 경고 | `rgba(138,90,0,0.08)` | `#8A5A00` | `rgba(138,90,0,0.25)` |
| 위반 | `rgba(179,0,0,0.08)` | `#B30000` | `rgba(179,0,0,0.25)` |

### 3-6. 검토번호

`generateReviewId()` 함수로 생성. 헤더 오른쪽 상단 + 푸터 양쪽 표시.  
폰트: `monospace`, 색상: `HERITAGE (#002D72)`.

### 3-7. GAP 및 수정 필요 항목

| # | 항목 | 현재 | 목표 |
|---|------|------|------|
| 1 | Tier 뱃지 문구 | "Tier 2 · 전문 검토" | "전문 수정 가이드" |
| 2 | Tier 1 잠금 메시지 | "Tier 2 전문 검토에서 확인" | "전문 수정 가이드에서 확인" |
| 3 | 법규 참조 | 암묵적 기준 | 식품등의 표시기준 고시 2025-27호 명시 추가 |
| 4 | A4 페이지 패딩 | `0 0 16mm` (상단 없음) | 상단 여백 확인 (헤더 밴드 flush 의도적이면 유지) |

---

## 4. PDF-02 정부24 신고 입력 가이드 (`generateReportPDF.ts`)

### 4-1. 문서 목적

품목제조보고 신청 시 정부24(gov.kr) 또는 식품안전나라에 입력할 내용을 정리한 참고 가이드.  
공식 서식이 아닌 참고용 입력 지원 문서.

파일명 형식: `KRK_신고입력가이드_{productName}_{YYYYMMDD}.pdf`

### 4-2. 레이아웃 구조

```
[스티키 툴바]
  PDF-02 · 신고 입력 가이드              [ PDF 저장 ]

[헤더 영역]  ← border-bottom: 2px solid HERITAGE
  좌: eyebrow "PDF-02 · 정부24 신고 입력 가이드"
      H1: 품목제조보고 입력 가이드
      sub: 정부24(gov.kr) / 식품안전나라 온라인 신고 참고용
  우: 검토번호 (monospace, HERITAGE 색)
      작성일

[사용방법 안내 박스]  ← border-left: 3px solid HERITAGE, 연한 Heritage 배경
  📌 사용 방법 — 정부24 / 식품안전나라에서 아래 표 항목 직접 입력 안내

[입력 항목 테이블]
  | 항목(좌, 160px, 회색 배경) | 입력 내용(우) |
  (14개 행)

[사업자 유형별 신고 절차 안내]
  ↳ data.businessType 값에 따라 분기
  ├ 식품제조가공업 → 품목제조보고 절차 (5단계)
  ├ 즉판가공업 → 영업신고 절차 (5단계)
  └ 그 외 → 사업자 유형 입력 시 맞춤 안내 표시 안내 박스

[법조문 참고 박스]  ← border: 1px solid HAIRLINE
  식품위생법 제37조, 동법 시행규칙 제45조 명시

[서명란]
  우정렬: 작성일 / 대표자 서명: _______________ (인)

[푸터 면책]
  border-top + 검토번호 + "공식 문서 아님" + "gov.kr에서 진행" + krk.team
```

### 4-3. 입력 항목 테이블 14행

| # | 항목명 | 데이터 소스 | 비고 |
|---|--------|------------|------|
| 1 | 품목명 (제품명) | `data.productName` | |
| 2 | 선택 카테고리 | `data.categories.join(', ')` | |
| 3 | 식약처 공식 분류명 | `CATEGORY_OFFICIAL[data.categories[0]]` | |
| 4 | 사업자 유형 | `data.businessType` | 절차 안내 분기 기준 |
| 5 | 내용량 | `data.totalWeight + data.unit` | |
| 6 | 원재료명 및 배합비 | `ingredients[]` 함량 내림차순 | 퍼센트 자동 계산 |
| 7 | 소비기한 | `data.expiryDate` | `.YYYY.MM.DD 까지` 형식 |
| 8 | 보관방법 | `data.storage` | |
| 9 | 영양성분 | `data.calories` 등 / 면제 문구 | |
| 10 | 포장재질 | `data.packagingMaterials[]` | 없으면 직접 입력 안내 |
| 11 | 제조업소명 | `data.manufacturer` | |
| 12 | 제조업소 소재지 | — (직접 입력) | Creator에 미수집 |
| 13 | 신고번호 | — (신고 후 기재) | 신고 완료 후 기입 |
| 14 | 연락처 | — (직접 입력) | Creator에 미수집 |

> **미수집 필드 3개** (소재지, 신고번호, 연락처)는 빈칸으로 출력.  
> 사용자가 수기 기입하도록 점선 언더라인 스타일 적용 권장 (현재 "— (직접 입력)" 텍스트 처리).

### 4-4. 사업자 유형별 신고 절차 블록

| 유형 | 제목 | 포털 | 절차 |
|------|------|------|------|
| 식품제조가공업 | 식품제조·가공업 품목제조보고 | 정부24 / 식품안전나라 | 5단계 |
| 즉판가공업 | 즉석판매제조·가공업 영업신고 | 정부24 | 5단계 |
| 그 외 / 미입력 | — | — | 안내 메시지 (dashed box) |

블록 스타일: `border-left: 3px solid HERITAGE`, Heritage 연한 배경  
주의사항 박스: `background: rgba(176,122,26,0.06)`, `border: 1px solid rgba(176,122,26,0.25)`

### 4-5. GAP 및 수정 필요 항목

| # | 항목 | 현재 | 목표 |
|---|------|------|------|
| 1 | 미입력 필드 UI | "— (직접 입력)" 텍스트 | 점선 언더라인 + 색 대비로 "직접 기입 칸" 시각화 |
| 2 | 사업자 유형 미입력 시 | dashed box 메시지 | Creator Step 1로 돌아가 유형 입력 권장 문구 추가 |
| 3 | 법조문 박스 | "식품위생법 제37조" | 고시 제2025-27호 병기 추가 |
| 4 | Tier 제한 안내 | 없음 | 문서 하단 "본 가이드는 전문 수정 가이드(Tier 2) 포함 산출물입니다" 문구 |

---

## 5. 공통 GAP 요약 (양 PDF)

| # | 항목 | PDF-03 | PDF-02 |
|---|------|--------|--------|
| 1 | Tier 노출 문구 | "Tier 1/2" → 서비스 패키지명으로 교체 | "전문 수정 가이드" 출처 표기 추가 |
| 2 | 법규 고시 번호 | 미명시 | 미명시 → `식품등의 표시기준 고시 2025-27호` 추가 |
| 3 | 🔒 lock 문구 | "Tier 2 전문 검토" | N/A |

---

## 6. 파일명 & 검토번호

```
PDF-03  KRK_라벨검토리포트_{productName}_{YYYYMMDD}.pdf
PDF-02  KRK_신고입력가이드_{productName}_{YYYYMMDD}.pdf
```

검토번호: `generateReviewId()` — 두 PDF 모두 동일 함수 사용.  
같은 결제건에서 두 PDF를 다운로드하면 서로 다른 검토번호가 붙는다.

> **개선 제안** (Sprint 6 이후): 결제 단위로 동일 검토번호를 공유하도록 `orderId`를 검토번호 앞에 붙이는 방식 검토.

---

## 7. A4 출력 규격

| 파일 | 페이지 너비 | 패딩 |
|------|------------|------|
| generateCertPDF | `210mm` | `0 0 16mm` (헤더밴드 flush) |
| generateReportPDF | `210mm` | `18mm 16mm 16mm` |

---

## 8. 연결 화면

| 방향 | 설명 |
|------|------|
| 데이터 소스 | `Creator.tsx` (Step 1~4) → `CreatorData` 타입 |
| 실행 지점 | `PaymentComplete.tsx` DownloadRow 버튼 클릭 → 각 generate 함수 호출 |
| Tier 분기 | `paidTier === 'tier2'` 조건으로 PDF-02, PDF-03 전체 버전 표시 |
| analyzeRegulations | `ReviewResult.tsx`에서 동일 함수 import → 화면/PDF 결과 일치 보장 |

---

## 9. 미구현 항목 (Sprint 6 연동 전)

| 항목 | 현재 | Sprint 6 목표 |
|------|------|--------------|
| 실데이터 연결 | 함수 연결 완료, 실 입력값 연동 대기 | `CreatorData` 실데이터 전달 |
| 분리배출 마크 ZIP | SVG placeholder | 환경부 공식 도안 교체 |
| 라벨 PNG | 미구현 (버튼 노출, "준비 중" 상태) | Canvas/html2canvas 방식 구현 |
