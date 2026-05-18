import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileDown, CheckCircle2, RotateCcw, ArrowRight, Shield,
} from 'lucide-react'
import type { CreatorData } from './types'
import type { Ingredient } from '../../utils/parsing'
import type { Metadata } from '../ReviewResult'

// ─── Phase 1 LabelExport.tsx 로직 재사용 ─────────────────────────────────────

function generateLabelHtml(d: CreatorData): string {
  const sorted    = [...d.ingredients].sort((a, b) => (parseFloat(b.weight) || 0) - (parseFloat(a.weight) || 0))
  const totalIngW = sorted.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0)
  const allergens = sorted.filter(i => i.isAllergen)

  const ingText = sorted
    .map(ing => {
      const pct   = totalIngW > 0 ? `(${((parseFloat(ing.weight) || 0) / totalIngW * 100).toFixed(1)}%)` : ''
      const label = `${ing.name}${pct}`
      return ing.isAllergen ? `<strong style="color:#B30000">${label}</strong>` : label
    })
    .join(', ')

  const NUTR = [
    { key: 'calories',   label: '열량',    unit: 'kcal' },
    { key: 'totalCarbs', label: '탄수화물', unit: 'g' },
    { key: 'sugar',      label: '└ 당류',  unit: 'g',  indent: true },
    { key: 'protein',    label: '단백질',   unit: 'g' },
    { key: 'totalFat',   label: '지방',    unit: 'g' },
    { key: 'sodium',     label: '나트륨',   unit: 'mg' },
  ] as const

  const nutritionRows = NUTR
    .filter(n => {
      const v = d[n.key as keyof CreatorData] as string
      return v && v !== '0'
    })
    .map((n, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'}">
        <td style="padding:5px 10px;${(n as {indent?: boolean}).indent ? 'padding-left:20px;color:#555;' : 'font-weight:600;'}">${n.label}</td>
        <td style="padding:5px 10px;text-align:right;font-family:Inter,sans-serif;">${d[n.key as keyof CreatorData]}${n.unit}</td>
      </tr>`)
    .join('')

  const metaRows = [
    d.totalWeight  && `<tr><td style="padding:3px 0;color:#555;font-size:11px;">내용량</td><td style="padding:3px 0 3px 12px;font-size:11px;">${d.totalWeight}${d.unit}</td></tr>`,
    d.expiryDate   && `<tr><td style="padding:3px 0;color:#555;font-size:11px;">소비기한</td><td style="padding:3px 0 3px 12px;font-size:11px;">${d.expiryDate.replace(/-/g, '.')} 까지</td></tr>`,
    d.storage      && `<tr><td style="padding:3px 0;color:#555;font-size:11px;">보관방법</td><td style="padding:3px 0 3px 12px;font-size:11px;">${d.storage}</td></tr>`,
    d.manufacturer && `<tr><td style="padding:3px 0;color:#555;font-size:11px;">제조원</td><td style="padding:3px 0 3px 12px;font-size:11px;">${d.manufacturer}</td></tr>`,
  ].filter(Boolean).join('')

  const date = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <title>KRK 라벨 — ${d.productName || '제품'}</title>
  <style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Pretendard Variable', Pretendard, sans-serif; background:#fff; color:#0A0A0B;
           -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .toolbar { position:sticky; top:0; z-index:99; background:#002D72;
               padding:10px 24px; display:flex; align-items:center; justify-content:space-between; }
    .label-wrap { width:210mm; min-height:297mm; padding:20mm 18mm; margin:0 auto; }
    table { border-collapse:collapse; }
    @media print { .toolbar { display:none; } .label-wrap { padding:12mm 10mm; } }
  </style>
</head>
<body>
<div class="toolbar">
  <span style="color:#fff;font-size:13px;font-weight:700;letter-spacing:0.14em;">krk.team — 라벨 초안</span>
  <button onclick="window.print()" style="background:#0CA4F9;color:#fff;border:none;padding:8px 20px;font-size:12px;font-weight:600;cursor:pointer;">PDF 저장</button>
</div>
<div class="label-wrap">
  <div style="border:2px solid #0A0A0B;overflow:hidden;">

    <div style="background:#0A0A0B;color:#fff;padding:18px 24px;text-align:center;">
      <div style="font-size:20px;font-weight:700;letter-spacing:-0.01em;">${d.productName || '제품명'}</div>
      ${d.foodCategory ? `<div style="font-size:12px;opacity:0.55;margin-top:4px;">${d.foodCategory}</div>` : ''}
    </div>

    <div style="padding:18px 24px;display:flex;flex-direction:column;gap:0;">

      ${sorted.length > 0 ? `
      <div style="padding-bottom:14px;border-bottom:1px solid rgba(10,10,11,0.15);margin-bottom:14px;">
        <div style="font-weight:700;font-size:12px;margin-bottom:6px;">원재료명 및 함량</div>
        <div style="font-size:11px;color:rgba(10,10,11,0.75);line-height:1.65;">${ingText}</div>
        ${allergens.length > 0 ? `<div style="font-size:11px;color:#B30000;margin-top:6px;">※ 알레르기 유발 원료: ${allergens.map(a => a.name).join(', ')} 함유</div>` : ''}
      </div>` : ''}

      ${nutritionRows ? `
      <div style="padding-bottom:14px;border-bottom:1px solid rgba(10,10,11,0.15);margin-bottom:14px;">
        <div style="font-weight:700;font-size:12px;margin-bottom:8px;">영양성분표</div>
        <table style="width:100%;border:1px solid #0A0A0B;font-size:11px;">
          <tr style="background:#0A0A0B;color:#fff;">
            <td colspan="2" style="padding:5px 10px;font-weight:700;text-align:center;letter-spacing:0.06em;">영양성분표</td>
          </tr>
          ${d.servingSize && d.servingSize !== '0' ? `<tr><td colspan="2" style="padding:5px 10px;font-size:10px;font-weight:600;border-bottom:1px solid rgba(10,10,11,0.2);">1회 제공량 ${d.servingSize}${d.servingUnit}</td></tr>` : ''}
          ${nutritionRows}
        </table>
      </div>` : ''}

      ${metaRows ? `<div><table style="width:100%;">${metaRows}</table></div>` : ''}

    </div>
  </div>
  <div style="margin-top:14px;font-size:9px;color:rgba(10,10,11,0.3);line-height:1.6;">
    이 라벨 초안은 참고용으로 법적 효력이 없습니다. — krk.team · 생성일: ${date}
  </div>
</div>
</body>
</html>`
}

// ─── CreatorData → Checker(ReviewResult) 형식 변환 ───────────────────────────

function convertToCheckerState(data: CreatorData): { ingredients: Ingredient[]; metadata: Metadata } {
  const ingredients: Ingredient[] = data.ingredients.map(ing => ({
    id:              ing.id,
    name:            ing.name,
    rawName:         ing.name,
    weight:          parseFloat(ing.weight) || 0,
    suggestedName:   ing.name,
    isComposite:     ing.isComposite,
    isAllergen:      ing.isAllergen,
    matchConfidence: 1.0,   // 직접 입력 원재료 = 신뢰도 100%
  }))

  // expiryDate(날짜) → expiryDays(남은 일수) 변환
  let expiryDays = ''
  if (data.expiryDate) {
    const diffMs = new Date(data.expiryDate).getTime() - Date.now()
    expiryDays   = String(Math.max(1, Math.ceil(diffMs / 86_400_000)))
  }

  // '개' 단위는 Metadata에 없으므로 'g'로 폴백
  const validUnits = ['g', 'mL', 'kg', 'L'] as const
  const unit = (validUnits as ReadonlyArray<string>).includes(data.unit)
    ? (data.unit as 'g' | 'mL' | 'kg' | 'L')
    : 'g'

  return {
    ingredients,
    metadata: {
      productName:  data.productName,
      totalWeight:  data.totalWeight,
      unit,
      expiryDays,
      storage:      data.storage,
      manufacturer: data.manufacturer,
    },
  }
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

type DownloadStatus = 'idle' | 'done'

export default function Step5_Export({
  data,
  onRestart,
}: {
  data: CreatorData
  onRestart: () => void
}) {
  const navigate = useNavigate()
  const [dlStatus, setDlStatus] = useState<DownloadStatus>('idle')

  const filename = `KRK_라벨_${(data.productName || '제품').replace(/[\s/\\]/g, '_')}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.html`

  const handleDownload = () => {
    const html = generateLabelHtml(data)
    const blob = new Blob([html], { type: 'text/html; charset=utf-8' })
    const url  = URL.createObjectURL(blob)

    // iframe 내에서 download 처리 — a.click()이 부모 document의
    // React 이벤트 위임 루트(#root)까지 버블링하는 것을 원천 차단
    const iframe = document.createElement('iframe')
    Object.assign(iframe.style, { position:'fixed', top:'-200px', width:'1px', height:'1px', opacity:'0' })
    document.body.appendChild(iframe)

    const iDoc = (iframe.contentDocument ?? iframe.contentWindow?.document)!
    iDoc.open(); iDoc.close()
    const a = iDoc.createElement('a')
    a.href = url; a.download = filename
    iDoc.body.appendChild(a)
    a.click()

    setTimeout(() => {
      document.body.removeChild(iframe)
      URL.revokeObjectURL(url)
    }, 3_000)

    setDlStatus('done')
  }

  const handleGoToChecker = () =>
    navigate('/review', { state: convertToCheckerState(data) })

  // 요약 수치
  const allergenCount  = data.ingredients.filter(i => i.isAllergen).length
  const nutrFilled     = ['calories','totalCarbs','sugar','protein','totalFat','sodium']
    .filter(k => (data[k as keyof CreatorData] as string) && (data[k as keyof CreatorData] as string) !== '0').length

  return (
    <div className="flex flex-col gap-6">

      {/* ── 라벨 요약 카드 ─────────────────────────────────────────────────────── */}
      <div className="border border-[rgba(10,10,11,0.1)] overflow-hidden">
        <div className="bg-ink text-white px-5 py-3 flex items-center justify-between">
          <span className="font-en font-bold text-[14px] tracking-[-0.01em]">
            {data.productName || '—'}
          </span>
          {data.foodCategory && (
            <span className="font-kr text-[11px] text-white/50">{data.foodCategory}</span>
          )}
        </div>
        <div className="grid grid-cols-3 divide-x divide-[rgba(10,10,11,0.08)]">
          {[
            { label: '원재료',    value: `${data.ingredients.length}개` },
            { label: '알레르기',  value: allergenCount > 0 ? `${allergenCount}개` : '없음', red: allergenCount > 0 },
            { label: '영양성분',  value: `${nutrFilled}항목` },
          ].map(({ label, value, red }) => (
            <div key={label} className="px-4 py-3 text-center">
              <div className={`font-en font-bold text-[18px] leading-none tabular-nums ${red ? 'text-[#B30000]' : 'text-ink'}`}>
                {value}
              </div>
              <div className="font-kr text-[11px] text-[rgba(10,10,11,0.45)] mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 다운로드 완료 배너 ────────────────────────────────────────────────── */}
      {dlStatus === 'done' && (
        <div className="flex items-start gap-3 px-4 py-3 bg-[#F0FDF4] border border-[#15803D]" style={{ borderLeftWidth: 4 }}>
          <CheckCircle2 size={14} className="text-[#15803D] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-en font-semibold text-[13px] text-[#15803D]">
              다운로드 완료
            </span>
            <p className="font-kr text-[12px] text-[rgba(10,10,11,0.5)] mt-0.5 leading-[1.55]">
              <span className="font-en">{filename}</span> — Chrome에서 열고 상단 "PDF 저장"을 클릭하세요.
            </p>
          </div>
        </div>
      )}

      {/* ── Checker CTA (다운로드 후 표시) ───────────────────────────────────── */}
      {dlStatus === 'done' && (
        <button
          onClick={handleGoToChecker}
          className="w-full flex items-center gap-4 px-6 py-5 border-2 border-heritage-500 text-left
            hover:bg-heritage-500 group transition-colors duration-150"
        >
          <Shield
            size={20}
            className="text-heritage-500 group-hover:text-white flex-shrink-0 transition-colors"
          />
          <div className="flex-1">
            <div className="font-en font-semibold text-[15px] text-heritage-500 group-hover:text-white tracking-[-0.01em] transition-colors">
              Checker로 검증하기
            </div>
            <p className="font-kr text-[12px] text-[rgba(10,10,11,0.5)] group-hover:text-white/70 mt-0.5 transition-colors leading-[1.55]">
              방금 만든 라벨의 원재료로 식약처 법규 18개 항목 리스크를 바로 분석합니다.
            </p>
          </div>
          <ArrowRight
            size={18}
            className="text-heritage-500 group-hover:text-white flex-shrink-0 transition-colors"
          />
        </button>
      )}

      {/* ── 다운로드 버튼 ─────────────────────────────────────────────────────── */}
      <button
        onClick={handleDownload}
        className="btn-heritage w-full flex items-center justify-center gap-3 h-14 text-[14px]"
      >
        <FileDown size={16} />
        {dlStatus === 'done' ? '다시 다운로드' : 'HTML 라벨 다운로드'}
      </button>

      {/* ── 안내 (첫 번째 다운로드 전만 표시) ──────────────────────────────────── */}
      {dlStatus === 'idle' && (
        <div className="flex flex-col gap-2 px-4 py-3.5 bg-[rgba(10,10,11,0.02)] border border-[rgba(10,10,11,0.07)]">
          <div className="font-en text-[10px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.1em]">
            다운로드 안내
          </div>
          <ol className="flex flex-col gap-1.5">
            {[
              'HTML 라벨 파일이 자동으로 다운로드됩니다.',
              '다운로드된 파일을 Chrome에서 열어주세요.',
              '상단 "PDF 저장" 버튼 → 인쇄 다이얼로그 → PDF로 저장.',
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2 font-kr text-[12px] text-[rgba(10,10,11,0.55)]">
                <span className="font-en text-[10px] font-semibold text-[rgba(10,10,11,0.28)] mt-0.5 flex-shrink-0">
                  {i + 1}.
                </span>
                {t}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── 하단 버튼 ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onRestart} className="btn-ghost flex items-center gap-2">
          <RotateCcw size={14} />
          처음부터 다시
        </button>
        {dlStatus === 'done' && (
          <div className="flex items-center gap-1.5 font-kr text-[12px] text-[rgba(10,10,11,0.4)]">
            <CheckCircle2 size={13} className="text-[#15803D]" />
            라벨 초안 완성
          </div>
        )}
      </div>

    </div>
  )
}
