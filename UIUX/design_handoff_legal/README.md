# Handoff: KRK 법적 고지 — 이용약관 + 개인정보처리방침

## Overview
법률 정형문 두 페이지. 동일한 `LegalDoc` 컴포넌트 + `doc='terms'|'privacy'` prop으로 분기.

| 라우트 | 컴포넌트 |
|---|---|
| `/terms` | `src/pages/Terms.tsx` → `<LegalDoc doc="terms" />` |
| `/privacy` | `src/pages/Privacy.tsx` → `<LegalDoc doc="privacy" />` |

## Fidelity
**High-fidelity** (단, 실제 약관 문구는 **시행 전 법률 자문 검토 권장**)

## ⚠️ Disclaimer (이용약관 본문에 명시)
"본 약관은 참고용 초안입니다. 시행 전 법률 자문을 통한 검토가 권장됩니다."
→ 실제 배포 전 반드시 변호사 검토

## 시행일 / 책임자
- **시행일**: 2026-06-01
- **버전**: v1.0
- **개인정보 보호책임자**: `chaeumkorea@gmail.com`

## Layout
```
[Sticky Nav (frost 글래스)]
[DocHeader] STUDIO bg
  eyebrow: Terms of Service | Privacy Policy
  H1: 이용약관 | 개인정보처리방침
  meta: v1.0 · 시행일 · 최종 개정 (Inter caps)

[Main 2-col (desktop) / 1-col (mobile)]
  좌: TocSidebar (sticky top: 80px, width: 220px) — 조항 anchor 점프
  우: 본문 — Article 컴포넌트 반복 + 부칙

[Footer (Landing과 공유)]
```

## Articles 데이터 구조
```ts
type Article = {
  no: string;       // 예: '제1조'
  title: string;    // 예: '목적'
  body: string[];   // 다중 문단 (들여쓰기는 '  ' prefix로 표현)
};

const TERMS_ARTICLES: Article[]   = [...];  // 13개
const PRIVACY_ARTICLES: Article[] = [...];  // 11개
```

`body` 배열의 각 원소는 한 문단. **두 공백(`'  '`)으로 시작하면 들여쓰기 적용** (e.g. "  1. 항목명").

## 이용약관 조항 (13개)
1. 목적
2. 용어의 정의 (서비스/회원/검토 결과/산출물/패키지)
3. 약관의 효력 및 변경
4. 이용계약의 성립 (만 14세 이상)
5. 서비스의 내용 (Creator / /review / 산출물 / 마이페이지)
6. 결제 및 환불 — **다운로드 전 환불 가능, 후 제한** (전자상거래법 17조)
7. 산출물의 효력 — **공식 인증서 아님, 법적 효력 없음** (PDF v4 일관성)
8. 회원의 의무
9. 회사의 의무
10. 책임의 한계
11. 재다운로드 — **결제일로부터 1년**
12. 서비스의 중단
13. 분쟁 해결 및 관할 (서울중앙지방법원)
부칙. 시행일 (2026-06-01)

## 개인정보처리방침 조항 (11개)
1. 수집 항목 — 필수 / 선택(라벨 데이터) / 자동 3분류
2. 수집 및 이용 목적
3. 보유 및 이용기간
4. 제3자 제공 — 토스페이먼츠 한정
5. 처리 위탁 — Vercel / 토스 / Kakao
6. 정보주체 권리
7. 파기 절차 및 방법
8. 쿠키 운영 및 거부
9. 안전성 확보 조치
10. 개인정보 보호책임자 — **chaeumkorea@gmail.com**
11. 정책 변경

## Design Tokens
| 토큰 | 값 |
|---|---|
| `HERITAGE` `#002D72` | 조항 번호 강조 |
| `BREATH` `#0CA4F9` | 안내 박스 left border |
| `INK` `#0A0A0B` | 본문 |
| `STUDIO` `#FAFAFA` | DocHeader 배경 |
| `SOFT_INK` `rgba(10,10,11,0.75)` | 본문 텍스트 |
| `FAINT` `rgba(10,10,11,0.55)` | meta 텍스트 |

## Interactions
- TocSidebar 링크: `href="#1"`, `href="#2"` 등 → 본문 Article에 `id="1"` 매칭. `scroll-margin-top: 80px`로 sticky Nav 가려짐 방지.
- Nav CTA "3분 만에 시작하기" → `navigate('/signup')`
- Footer 이메일 링크 `mailto:chaeumkorea@gmail.com`

## Mobile
- TocSidebar 숨김 (`device === 'mobile'` 시 null return)
- 본문만 1-col stack
- Nav CTA 작은 사이즈

## Files
| 경로 | 설명 |
|---|---|
| `prototypes/KRK Terms.html` | DesignCanvas — Desktop + Mobile |
| `prototypes/KRK Privacy.html` | DesignCanvas — Desktop + Mobile |
| `prototypes/legal-docs.jsx` | 단일 `LegalDoc` 컴포넌트 (doc prop 분기) + TERMS_ARTICLES + PRIVACY_ARTICLES |
| `prototypes/design-canvas.jsx` | DC 의존성 |

## 구현 시 정리할 것
1. **변호사 검토** 필수 — 본 문서는 초안
2. 약관 조항 변경 시 `body` 배열의 문단/들여쓰기 형식 유지
3. 정책 변경 이력 페이지 별도 추가 검토 (예: `/terms/v1.0`, `/terms/v1.1`)
4. footer 링크 `/` `/terms` `/privacy` 라우팅 확인
5. 시행일 임박 시 메인 화면에 변경 공지 배너 (별도 컴포넌트 권장)
