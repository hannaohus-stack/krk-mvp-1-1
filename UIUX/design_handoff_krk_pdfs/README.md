# Handoff: KRK Checker — PDF 산출물 3종 (v4)

## Overview

KRK Checker 결제 완료 후(`/payment/complete`) 사용자에게 제공되는 **3종 PDF 산출물**의 라벨/문서 디자인입니다. 식품 표시기준(식약처 고시 2025-27호)을 기반으로 자동 생성되며, 인쇄·신고·자율 점검 용도로 사용됩니다.

| # | 문서명 | 용도 | 제공 패키지 |
|---|---|---|---|
| **PDF-01** | 식품 라벨 | 인쇄용 (제품 부착) | 기본 + 전문 공통 |
| **PDF-02** | 품목제조보고 입력 가이드 | 정부24 / 식품안전나라 신고 시 입력 참고 | 전문 전용 |
| **PDF-03** | krk 라벨 검토 리포트 | 사업자 자율 점검 기록 (단속 대비 보관) | 전문 전용 |

> ⚠️ **함수명 주의**: 코드베이스 매핑이 역방향입니다.
> - `generateLabelPDF.ts` → PDF-01 식품 라벨
> - `generateReportPDF.ts` → PDF-02 신고 입력 가이드 (`Report`가 아님 주의)
> - `generateCertPDF.ts` → PDF-03 라벨 검토 리포트 (`Cert`가 아님 주의)

---

## About the Design Files

이 번들의 HTML/JSX 파일들은 **디자인 레퍼런스**입니다 — 의도된 시각/구조를 보여주는 React 기반 프로토타입이며, 그대로 production에 복사하는 코드가 아닙니다.

작업 목표는 이 HTML 디자인을 **타깃 코드베이스(현재 KRK Checker는 React + TypeScript + jsPDF)에서 재구현**하는 것입니다. 실제 PDF 생성은 다음 방식 중 하나:
- **방식 A** (현재): jsPDF + Vercel API Routes로 서버사이드 생성
- **방식 B** (브리프 §2-2 권장): HTML 문자열 → `Blob(text/html)` → `<a download>` 트리거 → 사용자가 브라우저 Print → "PDF로 저장"

---

## Fidelity

**High-fidelity (hifi)** — 색상·타이포·간격·레이아웃 픽셀 단위 명시.
타깃 코드베이스에서 동일한 시각적 결과가 나오도록 정확히 재현해야 합니다.

다만 **인쇄 기준 단위 변환**이 필요합니다:
- 시안은 화면 가독성 우선 `px` 단위
- 실제 PDF는 `pt` 또는 `mm` 단위로 생성 (1pt = 1.333px @96dpi)
- 일반 표시 최소 **10pt** (= 13.3px), 내용량/열량 **12pt** (= 16px), 식품유형 **8pt** (= 10.6px)

---

## Output Specs

| 항목 | 기준 |
|---|---|
| 페이지 | **A4 1장** (210 × 297mm, 794 × 1123px @96dpi) |
| 라벨 물리 크기 | **90 × 60mm (전면)** · **90 × 90mm (후면)** (사용자 선택 가능) |
| 인쇄 컬러 모드 | CMYK 권장 |
| 폰트 | **Pretendard Variable** (CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css`) |
| 영문/수치 | **Inter, system-ui** |
| 색 인쇄 | `-webkit-print-color-adjust: exact; print-color-adjust: exact;` 필수 |

---

## Design Tokens

### Colors (3종 PDF 공통)

| 토큰 | 값 | 용도 |
|---|---|---|
| `HERITAGE` | `#002D72` | 헤더 밴드 · 강조 · 인라인 링크 · BusinessBadge 보더 |
| `INK` | `#0A0A0B` | 기본 텍스트 · 바코드 |
| `FAINT` | `rgba(10,10,11,0.55)` | 부연설명 · 레이블 |
| `MUTED` | `rgba(10,10,11,0.40)` | 더 흐릿한 보조 텍스트 |
| `HAIRLINE` | `rgba(10,10,11,0.18)` | 구분선 |
| `RULE` | `rgba(10,10,11,0.85)` | 라벨 외곽 / 강한 보더 |

### 3-way Result Colors (PDF-03 검토 결과)

| 상태 | 텍스트 색 | 배경 색 |
|---|---|---|
| 통과 (PASS) | `#006400` | `rgba(0,100,0,0.05)` |
| 주의 (WARN) | `#B8860B` | `rgba(184,134,11,0.06)` |
| 위반 (VIOL) | `#B30000` | `rgba(179,0,0,0.05)` |

### Business Type Badge (PDF-02 / PDF-03 공통)

- `식품제조가공업` / `즉석판매제조·가공업` 둘 중 하나
- 1px solid INK border, 투명 배경, 좌측 5x5 색 dot
- v3에서 `TierBadge`를 폐기 (service-brief-v2 지침)

---

## PDF-01 식품 라벨 (`generateLabelPDF.ts`)

### Layout — A4 1장, 전면+후면 나란히 (중앙 정렬)

```
┌─────────────────────────────────────────┐
│  [Header strip]  KRK CHECKER · PDF-01    │
│  ────────────────────────────────────    │
│  식품 라벨 인쇄용 · {제품명}              │
│                              [BusinessBadge]
│  ┌──────────────┐ ┌──────────────┐      │
│  │  전면 라벨    │ │  후면 라벨    │      │
│  │  (90×60mm)    │ │  (90×90mm)    │      │
│  │              │ │              │      │
│  │ [상세]        │ │ [상세]        │      │
│  │              │ │              │      │
│  └──────────────┘ └──────────────┘      │
│  전면 / FRONT     후면 / BACK             │
│  ────────────────────────────────────    │
│  [3-col 푸터: 인쇄안내 / 부착안내 / 법적고지] │
└─────────────────────────────────────────┘
```

### 전면 라벨 (Front) 구성

| 영역 | 내용 | 글자 크기 (인쇄 pt) |
|---|---|---|
| 상단 brand strip | `{manufacturer.name.toUpperCase()}` (좌) · `krk · pdf-01` (우) | 7-8pt |
| 식품유형 배지 | `식품유형 · {CATEGORY_OFFICIAL[categories[0]]}` (Heritage 배경, 흰 텍스트) | 7-8pt |
| 제품명 | `{productName}` — 가장 크게 | **최소 12pt** |
| 영문 부제 | `{productNameEn}` (uppercase letterSpacing 0.14em) | 8pt |
| 이미지 영역 | placeholder — `repeating-linear-gradient` Heritage 5%/8% | — |
| **내용량 · 열량** (GAP 1) | `{totalWeight}{unit} ({calories}/{basis})` — 영양성분 면제 시 단위만 | **최소 12pt** |

**GAP 1 (열량 병기, v5)**: 내용량 옆에 열량 자동 병기. 100g 기준 또는 1회 제공량 기준. 영양성분 면제(`nutritionExempted: true`) 시 열량 생략.

### 후면 라벨 (Back) 구성

```
[제품명 · 내용량]                  [BACK]
────────────────────────────────────────
원재료명 및 함량  딸기(국산) 60%, 설탕 30%,
                  **딸기** ← 알레르기 원료 볼드+Heritage
────────────────────────────────────────
[알레르기 박스]   ⚠ 알레르기 유발물질
                  딸기 · 우유 함유
                  (같은 제조시설 교차오염 안내)
────────────────────────────────────────
소비기한          제조일로부터 12개월 / 별도 표기
보관방법          [개봉 전] 직사광선을 피해...
                  [개봉 후] 냉장보관 · 1개월 이내 섭취 권장
────────────────────────────────────────
영양성분 / 100g 당
열량 248 kcal | 나트륨 10mg | 탄수화물 60g ...
                  ※ %영양성분기준치 안내
────────────────────────────────────────
(또는 영양성분 면제 박스: 점선 dashed border)
────────────────────────────────────────
제조원            쿡하우스 · 경기도 파주시 산업로... (031-...)
제조 유형         식품제조가공업
신고번호          제 2026-경기-파주-00000 호
반품 / 교환       구입처 또는 제조원
────────────────────────────────────────
[1399 신고 라인 — 검정 강조 박스]
부정·불량식품 신고는 국번 없이 [1399]
────────────────────────────────────────
[바코드] 8 809123 456789    [♺ placeholder 도안 ×2]
```

### 6가지 GAP 반영 (v5)

| # | GAP | 적용 |
|---|---|---|
| **1** | 열량 병기 | 전면 내용량 옆 `({kcal}/{basis})` |
| **2** | 알레르기 원료 볼드 | `<strong>` + Heritage 컬러 + fontWeight 800 |
| **3** | 보관방법 분리 | 개봉 전 / 개봉 후 별도 배지 라벨 + 텍스트 |
| **4** | 1399 독립 라인 | 후면 바코드 위 별도 박스 (검정 강조, `1399` Inter 800) |
| **5** | pt/mm 단위 | 시안은 px, 코드 상단 주석으로 pt 환산 명시 |
| **6** | 분리배출 마크 | **placeholder** dashed border + 코드 주석 (환경부 고시 2024-170호 공식 SVG 교체 필요) |

### CutMarks (크롭 마크)

각 라벨 모서리 4곳 표시:
- 14×14px 영역에 `M7 0 V14 M0 7 H14` SVG path
- stroke: `rgba(10,10,11,0.55)`, width 0.6
- 위치: `-7px` (모서리 밖으로 7px 돌출)

---

## PDF-02 품목제조보고 입력 가이드 (`generateReportPDF.ts`)

### 파일명
`KRK_신고입력가이드_{productName}_{YYYYMMDD}.pdf`

### Layout

```
[Header strip]  KRK CHECKER · PDF-02 입력 가이드 · 검토일
────────────────────────────────────────
              SELF-INPUT GUIDE · 정부24 / 식품안전나라 ...
              품목제조보고 입력 가이드
              ────── (60×2 Heritage strip)
────────────────────────────────────────
┌──────────────────────────────────────┐
│ 📌 입력 가이드 안내                    │ ← Heritage 좌측 보더, #FFF8E1 배경
│ 본 문서는 식품위생법 시행규칙 별지       │
│ 제43호서식을 기준으로 krk.team이...     │
│                                       │
│ ⚠ 실제 품목제조보고는 직접 신고하셔야:  │
│   • 정부24 · gov.kr                   │
│   • 식품안전나라 · foodsafetykorea... │
│   • 오프라인 · 관할 시·군·구청       │
└──────────────────────────────────────┘

가이드 번호: KRK-MFR-...  작성일: ...    [BusinessBadge]

[입력 항목 14행 테이블]
| 품목명           | 데일리 비타민C 1000        |
| 선택 카테고리    | 건강식품(일반)             |
| 식약처 분류명    | 기타식품류                 |
| 사업자 유형      | 즉석판매제조·가공업          |
| ... (총 14행)

[법조문 박스 — 회색 배경]
위 표의 내용은 식품위생법 제37조 및 동법 시행규칙...

[푸터]
본 가이드는 krk.team 자동 작성 가이드입니다.
실제 신고는 정부24 (gov.kr)에서 진행해주세요.
본 문서는 식품의약품안전처 공식 문서가 아닙니다.
```

### 입력 항목 14행 — 데이터 소스 매핑

| # | 항목명 | Creator 입력 필드 |
|---|---|---|
| 1 | 품목명 (제품명) | `data.productName` |
| 2 | 선택 카테고리 | `data.categories.join(', ')` |
| 3 | 식약처 공식 분류명 | `CATEGORY_OFFICIAL[data.categories[0]]` |
| 4 | 사업자 유형 | `data.businessType` |
| 5 | 내용량 | `${data.totalWeight} ${data.unit}` |
| 6 | 원재료명 및 배합비 | `ingredients[]` 함량 내림차순 |
| 7 | 소비기한 | `data.expiryDate` |
| 8 | 보관방법 | `data.storage` |
| 9 | 영양성분 | `data.nutrition` 또는 면제 문구 |
| 10 | 포장재질 | `data.packagingMaterials[]` |
| 11 | 제조업소명 | `data.manufacturer.name` (대표: `data.manufacturer.ceo`) |
| 12 | 제조업소 소재지 | `data.manufacturer.address` |
| 13 | 신고번호 | `data.manufacturer.license` |
| 14 | 연락처 | `${data.manufacturer.phone} · ${data.manufacturer.email}` |

---

## PDF-03 krk 라벨 검토 리포트 (`generateCertPDF.ts`)

### 파일명
`KRK_라벨검토리포트_{productName}_{YYYYMMDD}.pdf`

### v4 핵심 변경

- ❌ "검토 완료 인증서" / "Certificate" → ✅ **"krk 라벨 검토 리포트" / "Label Review Report"**
- ❌ QR 코드 (진위 확인 오해) → ✅ **기록 번호 박스** (KRK-YYYYMMDD-NNNN)
- ❌ Tier 배지 → ✅ **BusinessBadge** (사업장 유형)
- 면책 문구를 푸터 8pt → **본문 상단 빨간 2px 박스 + 4항목** (법적 리스크 차단)

### Layout

```
┌─────────────────────────────────────────────┐
│ [Heritage 헤더 밴드]                          │
│   KRK CHECKER             PDF-03 · 자율 점검 기록│
│                                              │
│   LABEL REVIEW REPORT — SELF-AUDIT RECORD    │
│   krk 라벨 검토 리포트                        │
│   사업자 자율 점검 기록                       │
│                                              │
│   [Record ID 박스 우하단: KRK-20260519-3148] │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐  │
│ │ ⚠ 중요 안내 — 반드시 읽어주세요          │  │ ← 2px solid #B30000
│ │                                          │  │   #FFF5F5 배경
│ │ 본 리포트는 krk.team 시스템이...          │  │
│ │ [2-col grid 4항목 ol]                    │  │
│ │ 1. 공식 인증서가 아닙니다.    2. 법적 효력... │  │
│ │ 3. 사업자 책임...           4. 재검토 필요  │  │
│ │ ──────                                    │  │
│ │ 자율 점검 노력 기록 용도로만 활용...        │  │
│ └─────────────────────────────────────────┘  │
│                                              │
│ [Info strip 2-col grid]                      │
│ 기록 번호    | 작성 일시                       │
│ 제품명       | 사업장 유형 [BusinessBadge]    │
│                                              │
│ [Summary strip — kind에 따라 색 분기]         │
│ 자율 점검 결과 / Summary                      │
│ 통과 11 · 주의 2건      [11 PASS · 2 WARN]   │
│                                              │
│ 점검 항목 결과 · 총 12건                      │
│ ┌──────────────────────────────────────┐    │
│ │ 코드 | 항목명 | 관련 조항 | 결과     │    │
│ │ R01  | 제품명 표시 | ... | ✓ 통과    │    │
│ │ ...                                   │    │
│ │ R06  | 영양성분   | ... | ✗ 위반    │    │
│ │      ↳ 영양성분 일부 항목 누락... (note)  │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ [Bottom block]                               │
│ 자율 점검 기록 / Self-Audit Record           │
│ krk 라벨 검토 리포트 — ...                    │
│                              [Record ID box] │
│ ────                                         │
│ [Logo]                  krk.team · 자율 점검... │
└─────────────────────────────────────────────┘
```

### 12개 검토 항목 (R01~R12)

`REVIEW_ITEMS_BASE` 배열로 정의 (pdf-pages.jsx 참조). `buildReviewResults(resultMode)` 함수가 `'all-pass' | 'mixed' | 'violation'` 모드에 따라 결과 분기.

---

## Sample Data Schema

```ts
type CreatorData = {
  productName: string;            // 예: '수제 딸기잼'
  productNameEn: string;          // 예: 'Handmade Strawberry Jam'
  categories: string[];           // 예: ['잼류']
  businessType: '식품제조가공업' | '즉석판매제조·가공업';
  ingredients: Array<{
    name: string;
    origin: string | null;
    pct: number;
  }>;
  detectedAllergens: string[];    // 알레르기 자동 검출 결과
  totalWeight: number | string;
  unit: string;                   // 예: 'g', '정'
  storage: string;                // legacy, deprecated
  storageBefore: string;          // GAP 3: 개봉 전 보관조건
  storageAfter: string;           // GAP 3: 개봉 후 보관조건
  expiryDate: string;             // 예: '제조일로부터 12개월'
  manufacturer: {
    name: string;
    ceo: string;
    address: string;
    license: string;              // 신고번호
    phone: string;
    email: string;
  };
  nutritionExempted: boolean;     // 소규모 제조업 면제 여부
  nutrition: null | {
    basis: string;                // 예: '100g 당'
    rows: Array<{ k: string; v: string; pct: string; }>;
  };
};
```

### CATEGORY_OFFICIAL 매핑

```ts
const CATEGORY_OFFICIAL: Record<string, string> = {
  '잼류': '잼류',
  '소스류': '소스류',
  '장류': '장류',
  '떡류': '떡류',
  '디저트/베이커리': '과자류 및 빵 또는 떡류',
  '차/음료': '음료류',
  '건강식품(일반)': '기타식품류',
};
```

---

## State Management

- 정적 PDF 생성이므로 클라이언트 state 없음
- 데이터 소스: `sessionStorage` 의 `krk_creator_draft_v1` → Creator Step 1~4 입력값
- 결제 검증 후 (`paidTier === 'pro'` 조건) PDF-02, PDF-03 다운로드 버튼 활성화
- 기본 패키지(`paidTier === 'basic'`): PDF-01만 활성

---

## Interactions & Behavior

### 다운로드 트리거
- `PaymentComplete.tsx` 의 DownloadRow 버튼 클릭
- 각 generate 함수 호출 → Blob 생성 → `<a download>` 트리거 → 사용자 브라우저 Print

### 스티키 툴바 (HTML print 방식 채택 시)
```
[ PDF-0X · 문서명 ]                  [ PDF 저장 (BREATH 버튼) ]
```
- 배경: `#002D72`
- 우측 버튼: `#0CA4F9`, `onclick="window.print()"`
- `@media print { .toolbar { display:none; } }` — 인쇄 시 숨김

### 검토번호 생성
`generateReviewId()` — 형식 `KRK-YYYYMMDD-NNNN` (예: `KRK-20260519-3148`).
헤더 우상단 + 푸터 양쪽 표시, monospace, Heritage 색.

---

## 폐기된 v3 요소 (재구현 시 사용 금지)

- ❌ `Tier` 단어 일체 (UI/PDF/문구 어디서든)
- ❌ "베타 검토" / "정식 검토" 표현
- ❌ Tier B 베타 카테고리 분기
- ❌ PaymentBetaModal 컴포넌트
- ❌ "PDF 3종" 통합 카피 (개별 파일명으로 분리)
- ❌ QR 코드 (진위 확인 오해)
- ❌ "검토 완료 인증서" / "Certificate of Label Compliance Review"

---

## Assets

- **Pretendard Variable**: CDN 로드 (위 Output Specs 참조)
- **Inter**: Google Fonts (weights 300, 400, 500, 600, 700)
- **분리배출 마크**: 환경부 고시 2024-170호 공식 SVG (현재 placeholder)
- **로고**: 텍스트 기반 (`KRK CHECKER ·` Inter 800)

---

## Files in this bundle

| 경로 | 설명 |
|---|---|
| `prototypes/KRK PDFs.html` | DesignCanvas 호스트 — 9개 PDF 카드 (라벨 3 + 입력가이드 2 + 리포트 4) 표시 |
| `prototypes/pdf-pages.jsx` | 메인 컴포넌트 — `PdfFoodLabel`, `PdfReport`, `PdfCertificate`, sample data |
| `prototypes/design-canvas.jsx` | DesignCanvas 의존성 (개발 시 불필요, 시안 보기 용도) |
| `briefs/design-brief-label-pdf.md` | PDF-01 라벨 상세 사양 (법규 GAP 6가지 포함) |
| `briefs/design-brief-pdfs.md` | PDF-02 / PDF-03 상세 사양 |
| `briefs/design-brief-pdf-v4.md` | v3 → v4 변경 사유 (법적 리스크 차단) |
| `briefs/design-service-brief-v2.md` | service-v2 전체 지침 (Tier 제거 등 상위 규칙) |

---

## 시안 보기

```bash
cd prototypes
# 정적 HTTP 서버로 띄우기 (CORS 회피)
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000/KRK%20PDFs.html
```

DesignCanvas는 pan(드래그) / zoom(휠) 인터랙션 지원. 9개 카드(라벨 3 / 신고 가이드 2 / 검토 리포트 4)가 섹션별로 그리드 배치됩니다.
