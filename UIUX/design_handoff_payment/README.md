# Handoff: KRK Payment — 결제 + 다운로드 허브 (v4)

## Overview
`/payment` (결제) + `/payment/complete` (결제 완료 · 다운로드 허브). `/review`에서 선택된 service(기본/전문)로 진입.

| 라우트 | `src/pages/Payment.tsx` + `PaymentComplete.tsx` |
|---|---|
| 진입 | `/review` → service 선택 → `navigate('/payment', { state: { service } })` |
| 결제 완료 | `navigate('/payment/complete')` |

## About the Design Files
디자인 레퍼런스. React + TypeScript + 토스페이먼츠 SDK로 재구현.

## Fidelity
**High-fidelity**

## ⚠️ v4 변경 사항 (v3 → v4)

v3 디자인에서 다음 항목이 **완전 제거**됨:
- ❌ Tier 분기 (`tier: 'SA' | 'B' | 'mixed'`) → ✅ **`service: 'basic' | 'pro'`**
- ❌ PaymentBetaModal 컴포넌트 (Tier B 결제 전 베타 안내)
- ❌ "정식 검토" / "베타 검토" / "Tier" 단어
- ❌ "PDF 3종" 통합 카피 → 개별 파일 명시
- ❌ "베타 피드백 남기기" 링크
- ✅ 신규: **마이페이지 안내 패널** ("1년간 재다운로드 가능" + "준비 중" 배지)

## Props
```ts
type PaymentProps = {
  service: 'basic' | 'pro';
  state: 'default' | 'loading' | 'error';
};

type CompleteProps = {
  service: 'basic' | 'pro';
  state: 'success' | 'fail';
};
```

## Service Meta
```ts
const SERVICES = {
  basic: {
    name: '기본 라벨 패키지',
    price: 9900,
    files: [
      { name: '라벨 PDF', use: '인쇄용 · A4' },
      { name: '라벨 PNG', use: '웹 · 스마트스토어 / 3000×3000' },
    ],
    copyItems: ['원재료명 · 함량', '알레르기 유발물질', '제품명 · 영문'],
  },
  pro: {
    name: '전문 수정 가이드',
    price: 19900,
    files: [
      { name: '라벨 PDF',                use: '인쇄용 · A4' },
      { name: '라벨 PNG',                use: '웹 · 스마트스토어' },
      { name: '품목제조보고 입력 가이드',  use: '정부24 참고용' },
      { name: 'krk 라벨 검토 리포트',      use: '자율 점검 기록' },
      { name: '분리배출 마크 ZIP',         use: '환경부 공식 도안' },
    ],
    copyItems: ['원재료명 · 함량', '알레르기 유발물질', '식품유형', '제품명 · 영문'],
  },
};
```

## Layout — /payment (Desktop 2-col)
```
[DesktopPageHeader]
  Crumb: 결제 · CHECKOUT
  H1: 결제하고 파일 받기
  subtitle: 결제 완료 즉시 파일이 자동으로 다운로드됩니다.
  우측: SSL · Toss Payments + KrkLogo

[메인 2-col grid 1fr / 1.05fr]
  좌: OrderSummaryCard
    - eyebrow: Basic Label Package / Professional Guide
    - 제품명 · 카테고리
    - 포함 내역 (체크리스트)
    - 결제 금액 (Heritage 30px Inter 700)
  
  우: 
    [ErrorBanner] (state=error)
    [TossWidget] — 결제 수단 (Toss Payments mock)
    [BtnHeritage] 결제 CTA
    [SecurityCaption] SSL · 결제 완료 즉시 다운로드 시작
```

## Layout — /payment/complete (Desktop 2-col)
```
[DesktopPageHeader]
  Crumb: 결제 완료 · COMPLETE
  H1: {service.name}가 준비됐어요.

[메인 2-col grid 0.85fr / 1.15fr]
  좌:
    BigCheckIcon
    ServiceBadge (기본/전문)
    [Receipt 카드] 주문번호 / 결제금액 / 제품명 / 결제일시 / 영수증
    [MyPageNotice] "1년간 재다운로드 가능 (준비 중)"
    [BtnGhost] 대시보드로 이동
  
  우:
    [DownloadList] — service.files 개수만큼 row + "전체 다운로드 (ZIP)" CTA
    [CopyList] — service.copyItems 개수만큼 row + "복사" 버튼
```

## Layout — /payment/complete fail
- ErrorBanner 스타일 풀폭 hero
- Receipt에 error 코드 + 주문번호 + 처리시각
- BtnHeritage "다시 시도하기" + BtnSoft "다른 결제 수단"

## Mobile (1-col stack)
- DesktopPageHeader → 간단한 뒤로가기 + 로고
- 모든 섹션 세로 stack
- CTA 풀폭

## Design Tokens
| 토큰 | 값 |
|---|---|
| `HERITAGE` `#002D72` | 결제 CTA · 가격 표시 |
| `BREATH` `#0CA4F9` | 로고 dot · CTA accent |
| `OK` `#00255E` | OrderSummaryCard badge · Complete crumb |
| `OK_BG` `#EAF6FE` | OK 배지 배경 |
| `ERROR` `#E5484D` | 결제 실패 |
| `INK` `#0A0A0B` |  |
| `SURFACE` `#F4F4F5` |  |
| `CARD` `#fff` |  |

## Toss Payments 연동 포인트
TossWidget은 mock. 실제 구현 시:
```ts
import { loadTossPayments } from '@tosspayments/payment-sdk';
const tossPayments = await loadTossPayments(CLIENT_KEY);
tossPayments.requestPayment('카드', {
  amount: service.price,
  orderId: generateOrderId(),
  orderName: service.name,
  customerName: '...',
  successUrl: `${baseUrl}/payment/complete`,
  failUrl: `${baseUrl}/payment/complete?fail=1`,
});
```

## State Management
```ts
const location = useLocation();
const service = location.state?.service ?? 'basic';
const [state, setState] = useState<'default'|'loading'|'error'>('default');
```

## Interactions
- 결제 CTA 클릭 → `setState('loading')` → `tossPayments.requestPayment(...)`
- 실패 → `setState('error')` + ErrorBanner 표시
- 성공 → `navigate('/payment/complete')` (Toss successUrl)
- /complete 진입 → 파일 자동 다운로드 트리거 + 다운로드 허브 표시
- "전체 다운로드 (ZIP)" 클릭 → 모든 파일 ZIP 묶어서 다운로드
- "복사" 버튼 클릭 → `navigator.clipboard.writeText(...)` + 토스트

## Files in this bundle
| 경로 | 설명 |
|---|---|
| `prototypes/KRK Payment.html` | DesignCanvas — 14 카드 (Desktop 7 + Mobile 7) |
| `prototypes/payment-screens.jsx` | 컴포넌트 — `PaymentDesktop` / `PaymentMobile` / `CompleteDesktop` / `CompleteMobile` |
| `briefs/design-service-brief-v2.md` | service-v2 지침 |

## 폐기된 v3 요소 (사용 금지)
- ❌ `tier` prop / `tierMeta()` 함수
- ❌ `PaymentBetaModal` 컴포넌트
- ❌ "베타 검토" / "정식 검토" / "Tier" 단어 일체
- ❌ "PDF 3종" 통합 카피
- ❌ "베타 피드백 남기기" 링크
- ❌ 가격 취소선 + 베타 할인 % 배지 (Tier B 특수 가격 → 단일 가격)
