# Handoff: KRK Landing — `/` (라벨도, 브랜드의 일부니까)

## Overview
서비스 진입점. Hero(영상 + 글래스 모달 3개) → 지원 카테고리 → 가격 → 후기 → krk Studio CTA → Footer로 스크롤.

| 라우트 | `src/pages/Landing.tsx` |
|---|---|

## Fidelity
**High-fidelity** — 색·타이포·간격·인터랙션 모두 정확히.

## ⚠️ Phase 1 / Phase 2

| Phase | 영상 | 모달 |
|---|---|---|
| **Phase 1 (현재)** | Veo 3 mp4 로딩 (`/checker/krk-hero-video.mp4`) · 미완 상태에선 **CSS 잼병 placeholder** | 페이드인 (delay 0/140/280ms), 자연스러운 흩어짐(scatter) |
| Phase 2 (이후) | 동일 영상 | 영상 타임코드와 실시간 싱크 |

현재 구현은 Phase 1. 영상 mp4가 준비되면 `<video autoPlay muted loop playsInline>`으로 placeholder를 교체.

## 🔒 락된 카피 (절대 변경 금지)
- 메인: **"라벨도, 브랜드의 일부니까"** (2줄, clamp 46–92px)
- 부제: **"1인 식품 브랜드의 라벨 검토 시스템"**
- CTA: **"3분 만에 시작하기"** → `navigate('/signup')`

## Sections

| # | id | 내용 |
|---|---|---|
| 1 | (top) | **Hero** — 흰 스튜디오 배경 + 잼병 placeholder + 카피 영역 + 모달 3개 |
| 2 | `#categories` | **지원 카테고리** — 7개 (잼류/소스류/장류/떡류/디저트·베이커리/차·음료/건강식품) |
| 3 | `#pricing` | **가격** — 기본 9,900 / 전문 19,900 (Heritage 보더 강조 + Recommended) |
| 4 | `#reviews` | **후기** — 3 quote 카드 + 검정 CTA strip |
| 5 | `#studio` | **krk Studio CTA** — 다크 INK 톤 · 3 서비스(브랜딩/패키지/사진) · 포트폴리오 외부 링크 |
| 6 | footer | (c) krk.team + 약관/개인정보/이메일 |

## Nav (Frost 글래스)
```css
background: rgba(255,255,255,0.45);
backdrop-filter: blur(28px) saturate(180%);
border-bottom: 1px solid rgba(10,10,11,0.06);
```
좌: 로고 (INK) / 우: "3분 만에 시작하기" INK 버튼

## Hero Modal 글래스 (3개)
브리프 §5-3 스타일 그대로:
- 다중 레이어 그라디언트 (white 52%→18%→8% + Heritage radial + Breath radial)
- `backdrop-filter: blur(26px) saturate(175%) contrast(108%)`
- 상단 1px Breath glow line
- Check 아이콘 `drop-shadow(0 0 8px rgba(12,164,249,0.42))`

### Scattered transforms (자연스러움)
- Modal 1: `translate(-10px, 0) rotate(-1.2deg)`
- Modal 2: `translate(14px, -6px) rotate(0.9deg)`
- Modal 3: `translate(-6px, 4px) rotate(-0.6deg)`

## Modal 콘텐츠 (Phase 1: 페이드인만)
| # | 타이틀 | 본문 | 노트 | 아이콘 |
|---|---|---|---|---|
| 1 | 원재료 표기 정리됨 | 딸기 50% · 설탕 30% · 레몬즙 10% · 펙틴 5% | 표시 기준에 맞춰 정돈 | FileText |
| 2 | 표시 항목 확인 | 알레르기 · 내용량 · 보관방법 · 소비기한 | 누락 가능 항목을 먼저 확인 | ListChecks |
| 3 | 파일 준비 완료 | 라벨 PDF · 신고 입력 가이드 · 라벨 검토 리포트 | 결제 후 바로 다운로드 | Download |

## Mobile (≤860px)
- Hero: 1-col stack, justify-content: flex-end
- Modal: 3 카드 같은 위치 stack + **9s cycle 애니메이션** (`mobileModalCycle` keyframes)
- 보조 링크 "지원 카테고리 보기" 숨김
- CTA width 100%

## Design Tokens
| 토큰 | 값 |
|---|---|
| `HERITAGE` `#002D72` | 강조, 식품유형 배지, 가격, 전문 패키지 보더 |
| `BREATH` `#0CA4F9` | 로고 dot, glass glow, Check 아이콘 |
| `INK` `#0A0A0B` | 헤로 텍스트, CTA 버튼, Studio bg |
| `STUDIO` `#FAFAFA` | 흰 스튜디오 배경 |
| `JAM_HI` `#E8A85C` / `JAM_LO` `#C26A2A` | 잼병 placeholder 색 |

## krk Studio CTA 섹션
- 다크 INK bg + 상단 Heritage→Breath 그라디언트 strip
- H2: "라벨이 정해졌다면, 이제 브랜드 차례"
- 3 서비스 카드: **브랜딩 / 패키지 / 사진** (top border Breath glow)
- CTA: "krk Studio 포트폴리오 보러가기" → `https://krk.team/studio` (새 탭)
- 하단 카피: "라벨도 브랜드의 일부니까 — 패키지도, 사진도" (Hero 카피와 재귀 연결)

## Footer
- bg `#0F0F12`
- 좌: 로고 + (c) 2026 krk.team · 서울특별시
- 우: krk Studio · 가격 · 이용약관 · 개인정보처리방침 · hello@krk.team

## Files
| 경로 | 설명 |
|---|---|
| `prototypes/KRK Landing.html` | DesignCanvas — Desktop + Mobile |
| `prototypes/landing-hero.jsx` | 메인 컴포넌트 |
| `prototypes/design-canvas.jsx` | DC 의존성 |
| `briefs/design-brief-landing-hero.md` | 원본 브리프 |

## 구현 시 정리할 것
1. CSS `JarPlaceholder` 컴포넌트 → 실제 Veo 3 mp4로 교체 (`<video autoPlay muted loop playsInline>`)
2. `STUDIO_SERVICES` 이모지 → 실제 SVG 아이콘 또는 사진으로 교체 가능
3. CTA 버튼 → `navigate('/signup')` 연결
4. 후기 3건 → 실제 사용자 후기로 교체
5. Studio 외부 링크 `https://krk.team/studio` → 실제 도메인 확인
