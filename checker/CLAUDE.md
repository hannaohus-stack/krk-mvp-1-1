# Checker App — 개발 검증 지침

> **대상 레포**: `hannaohus-stack/krk-studio` (checker/ 서브폴더)  
> **배포 URL**: https://krk-checker.vercel.app (또는 https://checker.krk.team)  
> **작성 기준**: 2026-05-19 OCR 복구 커밋 `1191803`

---

## 1. 로컬 빌드 검증

```bash
cd checker/
npm install
npm run build
```

**통과 기준**
- TypeScript 컴파일 에러 0건
- `dist/index.html` 생성 확인
- `dist/assets/` 에 `.js`, `.css` 파일 존재

---

## 2. 라우트 존재 확인

`checker/src/App.tsx` 에 아래 5개 라우트가 모두 있어야 한다.

| path | component |
|------|-----------|
| `/` | `Dashboard` |
| `/checker` | `OcrUpload` |
| `/review` | `ReviewResult` |
| `/export` | `LabelExport` |
| `/creator` | `Creator` |

```bash
grep -E "path=" checker/src/App.tsx
```

---

## 3. OCR 핵심 파일 존재 확인

```bash
test -f checker/src/hooks/useVisionOcr.ts && echo "OK: useVisionOcr.ts"
test -f checker/src/pages/OcrUpload.tsx   && echo "OK: OcrUpload.tsx"
```

---

## 4. Tesseract.js 의존성 확인

```bash
node -e "require('./checker/node_modules/tesseract.js')" && echo "OK"
# 또는
grep '"tesseract.js"' checker/package.json
```

**기대값**: `"tesseract.js": "^7.0.0"` 이상

---

## 5. 브라우저 E2E 흐름 검증 (수동)

배포 URL에서 아래 순서로 확인한다.

### 5-1. Dashboard → Checker 카드 표시
- [ ] 대시보드 접속 시 **Checker 카드** (`라벨 검수하기`) 와 **Creator 카드** (`라벨 만들기`) 2개 노출
- [ ] Checker 카드 클릭 → `/checker` 페이지 이동

### 5-2. OcrUpload 페이지 동작
- [ ] 좌측 상단 `← Dashboard` 버튼 → 대시보드로 복귀
- [ ] 드래그 앤 드롭 영역 표시
- [ ] 파일 선택 버튼 작동

### 5-3. OCR 실행 흐름
- [ ] 식품 라벨 이미지 업로드 (jpg/png, 해상도 높을수록 정확)
- [ ] 이미지 미리보기 표시
- [ ] 진행률 바 (0 → 100%) 표시
- [ ] 완료 후 파싱된 원재료 태그 표시
- [ ] `라벨 만들기 →` 버튼 활성화

### 5-4. Creator 연동
- [ ] `라벨 만들기 →` 클릭 → `/creator` 이동
- [ ] Creator 페이지에 OCR로 파싱된 원재료명이 **자동 입력**되어 있는지 확인

### 5-5. 에러 케이스
- [ ] OCR 실패 시 에러 메시지 + 다시 시도 버튼 표시
- [ ] 이미지 아닌 파일 드롭 시 → 무시 (에러 없이)

---

## 6. 모바일 확인 (투자자 데모 필수)

크롬 개발자도구 → 모바일 에뮬레이터 (iPhone 14 기준, 390px)

- [ ] 업로드 버튼에 `capture="environment"` 적용 → 카메라 직접 촬영 가능
- [ ] 진행률 바 레이아웃 깨지지 않음
- [ ] 원재료 태그 wrap 정상

---

## 7. 빠른 문제 진단

| 증상 | 원인 | 해결 |
|------|------|------|
| 페이지 흰 화면 | `outputDirectory` 오설정 | `checker/vercel.json` 확인 (`"dist"`) |
| `/checker` 404 | Vercel SPA 라우팅 미설정 | `checker/vercel.json`에 rewrites 추가 |
| OCR 텍스트 없음 | 이미지 해상도 낮음 | 300dpi 이상 권장 |
| 원재료 파싱 0개 | 라벨에 `원재료명:` 텍스트 없음 | 수동 입력으로 fallback |
| Creator prefill 없음 | Router state 누락 | `OcrUpload.tsx` handleGoCreator 확인 |

---

## 8. Vercel 설정 체크

```bash
cat checker/vercel.json
```

**기대값**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

SPA 라우팅 404 발생 시 아래 추가:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 9. 코드 위치 요약

```
checker/
├── src/
│   ├── App.tsx                    ← 라우트 정의
│   ├── hooks/
│   │   └── useVisionOcr.ts        ← Tesseract.js OCR 로직
│   └── pages/
│       ├── Dashboard.tsx          ← Checker + Creator 카드
│       ├── OcrUpload.tsx          ← OCR 업로드 UI
│       └── creator/
│           ├── Creator.tsx        ← prefill 수신 지점
│           └── types.ts           ← CreatorIngredient 타입
├── vercel.json                    ← outputDirectory: dist
└── package.json                   ← tesseract.js ^7.0.0
```
