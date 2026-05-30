# Design Brief — 랜딩페이지 Hero 섹션

**Route** `/` (Landing.tsx → LandingHero.tsx)  
**파일** `src/pages/LandingHero.tsx`  
**브리프 버전** v1.0 (2026-05-22)  
**소스 문서** `krk-landing-research-summary.md` (2026-05-22 기획 확정본)

---

## 1. 락(Lock)된 결정 사항

> 아래 항목은 변경 불가. 구현·디자인 단계에서 흔들지 않는다.

| 항목 | 확정값 | 현재 코드 상태 |
|------|--------|--------------|
| 메인 카피 | **"라벨도, 브랜드의 일부니까"** | ✅ 반영됨 |
| 부제 | **"1인 식품 브랜드의 라벨 검토 시스템"** | ⚠️ 미반영 ("스몰 식품 브랜드를 위한 라벨 완성 도구" → 교체 필요) |
| CTA 버튼 | **"3분 만에 시작하기"** | ⚠️ 미반영 ("라벨 검토 시작하기" → 교체 필요) |
| Hero 구성 | 영상 (배경) + 모달 3개 (우측 세로) | ✅ 구조 반영됨 |
| 배경 | 희원백(#FAFAFA) 스튜디오, 흰 톤 | ⚠️ 현재 비디오 미완 (placeholder) |
| Phase 1 범위 | 잼병 1개, 모달 페이드인만 | ✅ 방향 맞음 |
| 영상-모달 싱크 | Phase 2에서 구현 | ✅ Phase 1 제외 확정 |

---

## 2. Hero 레이아웃 구조

### 2-1. 전체 구성

```
[글래스 Nav — 고정, z-60]

[Hero 섹션 — 100svh, 다크 배경]
  ┌─────────────────────────────────────────────┐
  │  [배경 영상 — absolute, full cover]          │
  │  filter: saturate(0.88) contrast(0.95)      │
  │                                              │
  │  [좌: 카피 영역]         [우: 모달 스택]      │
  │   kicker                  모달 1              │
  │   H1 (메인 카피)           모달 2              │
  │   부제                    모달 3              │
  │   CTA 버튼 + 보조 링크                        │
  └─────────────────────────────────────────────┘
```

### 2-2. 그리드 규격

- 데스크탑: `grid-template-columns: minmax(0, 1fr) 360px` — 좌:카피 / 우:모달 360px
- 1280px 이상: 모달 영역 380px
- 최대 너비: `1240px`, 좌우 패딩 40px
- 상단 패딩: 112px (Nav 높이 확보), 하단 패딩: 64px
- 정렬: `align-items: end` — 카피·모달 모두 Hero 하단 기준 정렬

---

## 3. 배경 영상 스펙

### 3-1. 비주얼 컨셉 — 아이디어 1 + 5 결합 (최종 추천)

```
[0–2초]  앞면 정면. 라벨 텍스트가 한 글자씩 채워짐
         ← krk가 라벨을 "생성"하는 순간

[2–5초]  잼병이 천천히 360도 회전. 앞면 → 옆면 → 뒷면 노출
         ← 앞뒤 모두 아름다운 라벨

[5–8초]  뒷면 정면. 자연광 하이라이트가 영양성분표를 훑고 지나감
         ← "정보의 정직함" = 브랜드의 일부

[8–10초] 다시 앞면 정면으로 — 루프 시작점
```

**영상 제작 핵심 메시지:**  
"뒷면(영양성분표)도 자랑스럽게 보여주는 식품" — 다른 식품 영상에 없는 장면.

### 3-2. 촬영/생성 스펙

| 항목 | 값 |
|------|-----|
| 도구 | Flow (Veo 3) |
| 길이 | 10초 루프 권장 (최소 5초) |
| 해상도 | 1920×1080 |
| 포맷 | MP4 (H.264) |
| 루프 | 시작·끝 매끄럽게 연결 (seamless loop) |
| 모션 속도 | 느림–중간 (빠르면 트렌디함 사라짐) |
| 배경 | 희원백 스튜디오 (#FAFAFA), 흰 톤 |
| 조명 | 자연광 느낌 — Beautéaful Booch 매직 차용 |
| 그림자 | 부드러운 캐스트 섀도우 |
| 식품 | 사과잼 또는 유자잼 (옐로우/오렌지 톤) |
| 잼병 형태 | 미니멀 유리병, 한국적 비례 |
| 라벨 앞면 | Sanzo 미니멀 톤 |
| 라벨 뒷면 | 영양성분표 그대로 (식약처 느낌 유지 — 의도적) |

### 3-3. CSS 처리 (코드 현재값 유지)

```css
.krk-hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.88) contrast(0.95);
}
```

`<video autoPlay muted loop playsInline aria-hidden="true" />`

파일 경로: `/checker/krk-hero-video.mp4`

---

## 4. 카피 영역 (좌측)

### 4-1. 구성 요소

```
[kicker]
KRK CHECKER
— font-size: 12px, font-weight: 700, color: rgba(255,255,255,0.62)
— 영문, 대문자

[H1 — 메인 카피]  ← LOCK
라벨도,
브랜드의 일부니까
— font-size: clamp(46px, 7vw, 92px), font-weight: 760
— line-height: 0.98, word-break: keep-all
— 2줄 구성 (<br/> 명시적 분기)

[부제]  ← 현재 코드 교체 필요
"1인 식품 브랜드의 라벨 검토 시스템"  ← 확정 문구
— font-size: clamp(16px, 2vw, 21px), color: rgba(255,255,255,0.78)
— max-width: 520px

[CTA 버튼 행]
  [Primary 버튼]  ← 현재 코드 교체 필요
  "3분 만에 시작하기"  ← 확정 문구
  — 화이트 배경, 다크 텍스트, height: 52px
  — onClick: navigate('/signup')

  [보조 링크]
  "지원 카테고리 보기"
  — href: #categories
  — font-size: 13px, color: rgba(255,255,255,0.68)
  — border-bottom 1px (현재값 유지)
```

---

## 5. 모달 스택 (우측)

### 5-1. 레퍼런스 — Superhuman 패턴

```
사진/영상 위에 모달이 떠다니는 패턴
- 모달 = 글래스모피즘 (반투명 흰색 + backdrop-filter blur)
- 메시지가 직관적으로 전달됨
- "기능 설명"이 아니라 "사용 순간"을 보여줌
```

krk는 이 패턴을 차용해 영상 옆에 모달 3개로 핵심 기능을 노출한다.

### 5-2. 모달 3개 콘텐츠

영상 흐름과 매핑된 순서. Phase 1에서는 싱크 없이 순서만 맞춤.

| # | 타이틀 | 본문 | 노트 | 아이콘 | 영상 타임코드 |
|---|--------|------|------|--------|------------|
| 1 | 원재료 표기 정리됨 | 딸기 50% · 설탕 30% · 레몬즙 10% · 펙틴 5% | 표시 기준에 맞춰 정돈 | FileText | 0–2초 (생성) |
| 2 | 표시 항목 확인 | 알레르기 · 내용량 · 보관방법 · 소비기한 | 누락 가능 항목을 먼저 확인 | ListChecks | 2–5초 (회전) |
| 3 | 파일 준비 완료 | 라벨 PDF · 신고 입력 가이드 · 라벨 검토 리포트 | 결제 후 바로 다운로드 | Download | 5–10초 (완성) |

> **Phase 2:** 영상 타임코드와 모달이 실시간 싱크 — 현재는 구현하지 않는다.

### 5-3. 모달 글래스 스타일

```css
.krk-gloss {
  border: 1px solid rgba(255, 255, 255, 0.46);
  border-radius: 8px;
  background:
    linear-gradient(145deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.18) 42%, rgba(255,255,255,0.08) 100%),
    radial-gradient(120% 120% at 12% 0%, rgba(234,246,254,0.36) 0%, rgba(234,246,254,0) 52%),
    radial-gradient(100% 120% at 100% 100%, rgba(0,45,114,0.28) 0%, rgba(0,45,114,0) 56%),
    rgba(255, 255, 255, 0.1);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.62),
    inset 0 -1px 0 rgba(255,255,255,0.12),
    0 26px 70px rgba(0,11,31,0.34),
    0 0 0 1px rgba(12,164,249,0.08);
  backdrop-filter: blur(26px) saturate(175%) contrast(108%);
}
```

**상단 하이라이트 라인 (::after):**  
모달 상단 1px — 흰색→Breath 블루 그라디언트 (`rgba(12,164,249,0.48)`)

**입장 애니메이션:**
```css
@keyframes modalIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
```
- 카드 1: delay 0ms
- 카드 2: delay 140ms
- 카드 3: delay 280ms

### 5-4. 모달 내부 구조

```
[아이콘 박스 30×30, glass 처리]  [타이틀 13px bold]
[본문 12px, rgba(255,255,255,0.9)]
[노트 행: Check 아이콘(#0CA4F9, glow) + 텍스트 11px]
```

`Check` 아이콘에 `filter: drop-shadow(0 0 8px rgba(12,164,249,0.42))` — Breath 블루 글로우 효과.

---

## 6. 디자인 철학 (Hero 영상·모달 적용 원칙)

1. **적게, 정밀하게** — 색상 3개 이하 (Heritage/Breath/White), 폰트 1–2개
2. **정보 밀도 ≠ 답답함** — 영양성분표도 아름다울 수 있다 (뒷면 클로즈업 의도)
3. **감정적 보상 — Superhuman 스타일 절제** — 화려하지 않게, 작은 디테일로
4. **타겟 좁힐수록 자유** — 식약처 용어를 그대로 써도 멋질 수 있다
5. **결과물이 메인 비주얼** — 라벨이 아니라 식품 자체가 주인공

---

## 7. 모바일 반응형 (≤860px)

### 7-1. 레이아웃 전환

- `grid` → `flex flex-col`, `justify-content: flex-end` — 콘텐츠가 하단 기준으로 쌓임
- 패딩: 88px top, 20px 좌우, 22px bottom
- H1: `clamp(34px, 11vw, 50px)`, line-height: 1.04
- 부제: max-width 330px, font-size 14px
- CTA 버튼: `width: 100%`, `justify-content: center`
- 보조 링크: `display: none` (모바일 숨김)

### 7-2. 모달 모바일 처리 — 순환 애니메이션

데스크탑에서 3개 나란히 → 모바일에서 1개씩 순환 (겹쳐서 표시):

```css
@keyframes mobileModalCycle {
  0%,  8% { opacity: 0; transform: translateY(10px); }
  13%, 30% { opacity: 1; transform: translateY(0);   }
  38%, 100%{ opacity: 0; transform: translateY(-8px);}
}
```

- 카드 1: animation-delay 0s
- 카드 2: animation-delay 3s
- 카드 3: animation-delay 6s
- 총 주기: 9s infinite

---

## 8. Nav (글래스 스타일)

Hero 위에 fixed로 올라타는 투명 Nav. 영상 배경을 통과해 보이도록 글래스 처리.

```css
.krk-glass-nav {
  background:
    linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06)),
    rgba(0, 11, 31, 0.30);
  backdrop-filter: blur(24px) saturate(170%);
  border-bottom: 1px solid rgba(255,255,255,0.20);
}
```

하단 Breath 블루 라인 (::after): `linear-gradient(90deg, 투명 → rgba(12,164,249,0.42) → 투명)`

---

## 9. 현재 코드 수정 필요 항목 (2건)

| # | 위치 | 현재 문구 | 변경 문구 |
|---|------|-----------|-----------|
| 1 | `LandingHero.tsx` `.krk-hero-sub` | `스몰 식품 브랜드를 위한 라벨 완성 도구` | `1인 식품 브랜드의 라벨 검토 시스템` |
| 2 | `LandingHero.tsx` `.krk-hero-primary` | `라벨 검토 시작하기` | `3분 만에 시작하기` |

---

## 10. Phase 구분

| Phase | 영상 | 모달 | 싱크 |
|-------|------|------|------|
| **Phase 1 (현재)** | Veo 3 생성 영상 (잼병 회전) | 페이드인 애니메이션만 | ❌ 없음 |
| Phase 2 (이후) | 동일 | 영상 타임코드와 실시간 연동 | ✅ 구현 |

---

## 11. 절대 흔들리면 안 되는 것 (재확인)

```
✅ 메인 카피 "라벨도, 브랜드의 일부니까"
✅ 부제 "1인 식품 브랜드의 라벨 검토 시스템"
✅ CTA "3분 만에 시작하기"
✅ 흰 배경 + 잼병 회전 + 모달 3개
✅ Phase 1 = 페이드인만, 싱크 없음

❌ 5개 카테고리 시각화 (Phase 1엔 잼병만)
❌ 영상-모달 싱크 Phase 1 구현
❌ "행정 SaaS" 무드
❌ 새 컨셉으로 처음부터 논의
```

---

## 12. 레퍼런스

| 레퍼런스 | 가져올 것 | 가져오지 않을 것 |
|----------|---------|----------------|
| **Superhuman** | 영상 위 글래스 모달 패턴 | 이메일 UI 톤 |
| **Beautéaful Booch** | 자연광 매직, 옐로우/오렌지 톤 | 해변/자연 배경 |
| **Sanzo** | 아시안 미니멀, 깔끔한 타이포 | — |
