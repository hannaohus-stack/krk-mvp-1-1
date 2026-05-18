# krk.team MVP v1

> 식품 법규 라벨 자동 검토 SaaS — Zero Risk, Pure Success.

## 시작하기

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에 VITE_ANTHROPIC_API_KEY 입력

# 3. 개발 서버 실행
npm run dev
```

> **API 키 없어도 됩니다**: `VITE_ANTHROPIC_API_KEY`를 설정하지 않으면  
> 목(mock) 데이터로 OCR 기능을 테스트할 수 있습니다.

## 구현 현황

| 페이지 | 파일 | 상태 |
|--------|------|------|
| OCR 업로드 | `src/pages/OcrUpload.tsx` | ✅ 완료 |
| 법규 검토 결과 | `src/pages/ReviewResult.tsx` | 🔜 예정 |
| 라벨 내보내기 | `src/pages/LabelExport.tsx` | 🔜 예정 |

## 프로젝트 구조

```
src/
├── pages/
│   └── OcrUpload.tsx       ← Step 1·2·3 통합 (사진→원재료→제품정보)
├── hooks/
│   └── useVisionOcr.ts     ← Claude Vision API 호출
├── utils/
│   ├── parsing.ts          ← OCR 텍스트 파싱 + 배합비율 계산
│   └── data/
│       ├── allergens.json  ← 알레르기 27품목
│       ├── ingredients.json ← 식약처 공식 원료명 ~60개
│       └── regulations.json ← 18개 법규 체크리스트
└── styles/
    └── globals.css         ← KRK 디자인 토큰 + Tailwind
```
