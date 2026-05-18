import { AlertTriangle, ChevronRight, CheckCircle2, Info } from 'lucide-react'
import type { CreatorData } from './types'

// ─── 영양성분 행 정의 ──────────────────────────────────────────────────────────

type NutrKey = 'calories' | 'totalCarbs' | 'sugar' | 'protein' | 'totalFat' | 'sodium'

const NUTR_ROWS: { key: NutrKey; label: string; unit: string; indent?: boolean }[] = [
  { key: 'calories',   label: '열량',    unit: 'kcal' },
  { key: 'totalCarbs', label: '탄수화물', unit: 'g' },
  { key: 'sugar',      label: '당류',    unit: 'g',  indent: true },
  { key: 'protein',    label: '단백질',   unit: 'g' },
  { key: 'totalFat',   label: '지방',    unit: 'g' },
  { key: 'sodium',     label: '나트륨',   unit: 'mg' },
]

// ─── 라벨 섹션 행 컴포넌트 ─────────────────────────────────────────────────────

interface RowProps {
  title: string
  step: number
  required?: boolean
  missing?: boolean
  missingMsg?: string
  onGoToStep: (step: number) => void
  children?: React.ReactNode
}

function LabelRow({ title, step, required, missing, missingMsg, onGoToStep, children }: RowProps) {
  return (
    <div
      className={`border-b border-[rgba(10,10,11,0.1)] last:border-b-0 transition-colors ${
        missing ? 'bg-[#FFFAFA]' : 'bg-white'
      }`}
      style={{ borderLeft: `3px solid ${missing ? '#B30000' : 'transparent'}` }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* 내용 영역 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-en text-[10px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.1em]">
              {title}
            </span>
            {required && (
              <span className="font-en text-[9px] text-[rgba(10,10,11,0.25)] tracking-[0.04em]">
                필수
              </span>
            )}
          </div>

          {missing ? (
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-[#B30000] flex-shrink-0" />
              <span className="font-kr text-[12px] text-[#B30000]">
                {missingMsg ?? '입력이 필요합니다.'}
              </span>
            </div>
          ) : (
            <div className="font-kr text-[13px] text-ink leading-[1.6]">
              {children}
            </div>
          )}
        </div>

        {/* 수정하기 버튼 */}
        <button
          onClick={() => onGoToStep(step)}
          className={`flex items-center gap-0.5 flex-shrink-0 mt-0.5 font-en text-[11px] font-semibold transition-colors ${
            missing
              ? 'text-[#B30000] hover:text-[#8B0000]'
              : 'text-[rgba(10,10,11,0.28)] hover:text-ink'
          }`}
        >
          수정하기
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function Step4_Preview({
  data,
  onGoToStep,
}: {
  data: CreatorData
  onGoToStep: (step: number) => void
}) {
  // 원재료 정렬 및 집계
  const sorted    = [...data.ingredients].sort((a, b) => (parseFloat(b.weight) || 0) - (parseFloat(a.weight) || 0))
  const totalIngW = sorted.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0)
  const allergens = sorted.filter(i => i.isAllergen)
  const nutrFilled = NUTR_ROWS.filter(n => data[n.key] && data[n.key] !== '0')

  // 필수 항목 누락 체크
  const missing = {
    productName:  !data.productName.trim(),
    foodCategory: !data.foodCategory,
    totalWeight:  !data.totalWeight || parseFloat(data.totalWeight) <= 0,
    ingredients:  sorted.length === 0,
    storage:      !data.storage,
    expiryDate:   !data.expiryDate,
    manufacturer: !data.manufacturer.trim(),
  }
  const missingCount = Object.values(missing).filter(Boolean).length
  const allClear     = missingCount === 0

  return (
    <div className="flex flex-col gap-6">

      {/* ── 상태 배너 ─────────────────────────────────────────────────────────── */}
      {allClear ? (
        <div
          className="flex items-start gap-3 px-4 py-3 bg-[#F0FDF4] border border-[#15803D]"
          style={{ borderLeftWidth: 4 }}
        >
          <CheckCircle2 size={14} className="text-[#15803D] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-en font-semibold text-[13px] text-[#15803D]">
              필수 항목 입력 완료
            </span>
            <p className="font-kr text-[12px] text-[rgba(10,10,11,0.55)] mt-0.5 leading-[1.55]">
              모든 필수 항목이 입력됐습니다. 라벨을 확인하고 다음 단계로 이동하세요.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="flex items-start gap-3 px-4 py-3 bg-[#FFF8F8] border border-[#B30000]"
          style={{ borderLeftWidth: 4 }}
        >
          <AlertTriangle size={14} className="text-[#B30000] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-en font-semibold text-[13px] text-[#B30000]">
              필수 항목 {missingCount}개 누락
            </span>
            <p className="font-kr text-[12px] text-[rgba(10,10,11,0.55)] mt-0.5 leading-[1.55]">
              빨간색 항목의 수정하기 버튼을 눌러 내용을 채워주세요.
            </p>
          </div>
        </div>
      )}

      {/* ── 라벨 미리보기 ─────────────────────────────────────────────────────── */}
      <div className="border-2 border-ink overflow-hidden">

        {/* 제품명 + 식품 유형 헤더 */}
        <div
          className={`px-6 py-5 text-center relative ${
            missing.productName || missing.foodCategory ? 'bg-[#8B0000]' : 'bg-ink'
          }`}
        >
          <button
            onClick={() => onGoToStep(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-0.5 font-en text-[11px] font-semibold text-white/45 hover:text-white transition-colors"
          >
            수정하기 <ChevronRight size={12} />
          </button>

          {missing.productName ? (
            <div className="flex items-center justify-center gap-2 py-1">
              <AlertTriangle size={14} className="text-white/70" />
              <span className="font-kr text-[14px] font-semibold text-white/80">
                제품명을 입력해주세요
              </span>
            </div>
          ) : (
            <>
              <h2 className="font-en font-bold text-[20px] tracking-[-0.01em] text-white leading-tight pr-16">
                {data.productName}
              </h2>
              {missing.foodCategory ? (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <AlertTriangle size={11} className="text-white/60" />
                  <span className="font-kr text-[11px] text-white/60">식품 유형을 선택해주세요</span>
                </div>
              ) : (
                <p className="font-kr text-[12px] text-white/55 mt-1">{data.foodCategory}</p>
              )}
            </>
          )}
        </div>

        {/* 내용량 */}
        <LabelRow
          title="내용량"
          step={1}
          required
          missing={missing.totalWeight}
          missingMsg="내용량을 입력해주세요."
          onGoToStep={onGoToStep}
        >
          <span className="font-en font-semibold tabular-nums">
            {data.totalWeight}{data.unit}
          </span>
        </LabelRow>

        {/* 원재료명 및 함량 */}
        <LabelRow
          title="원재료명 및 함량"
          step={2}
          required
          missing={missing.ingredients}
          missingMsg="원재료를 1개 이상 등록해주세요."
          onGoToStep={onGoToStep}
        >
          <p className="text-[12px] leading-[1.75]">
            {sorted.map((ing, i) => {
              const pct = totalIngW > 0
                ? `(${((parseFloat(ing.weight) || 0) / totalIngW * 100).toFixed(1)}%)`
                : ''
              return (
                <span key={ing.id}>
                  {i > 0 && <span className="text-[rgba(10,10,11,0.35)]">, </span>}
                  <span
                    style={
                      ing.isAllergen
                        ? { color: '#B30000', fontWeight: 600 }
                        : undefined
                    }
                  >
                    {ing.name}{pct}
                  </span>
                </span>
              )
            })}
          </p>
          {allergens.length > 0 && (
            <p className="font-kr text-[11px] mt-1.5 text-[#B30000] leading-[1.55]">
              ※ 알레르기 유발 원료: {allergens.map(a => a.name).join(', ')} 함유
            </p>
          )}
        </LabelRow>

        {/* 영양성분표 */}
        <LabelRow
          title="영양성분"
          step={3}
          missing={false}
          onGoToStep={onGoToStep}
        >
          {nutrFilled.length === 0 ? (
            <div className="flex items-center gap-1.5">
              <Info size={12} className="text-[rgba(10,10,11,0.3)] flex-shrink-0" />
              <span className="font-kr text-[12px] text-[rgba(10,10,11,0.35)]">
                입력된 영양성분이 없습니다.
              </span>
            </div>
          ) : (
            <div className="mt-0.5 border border-[rgba(10,10,11,0.18)] w-full max-w-[240px]">
              <div className="bg-ink text-white px-3 py-1 text-center font-kr font-bold text-[10px] tracking-[0.06em]">
                영양성분표
              </div>
              {data.servingSize && data.servingSize !== '0' && (
                <div className="px-3 py-1 font-kr text-[10px] font-semibold border-b border-[rgba(10,10,11,0.15)]">
                  1회 제공량 {data.servingSize}{data.servingUnit}
                </div>
              )}
              {nutrFilled.map((n, i) => (
                <div
                  key={n.key}
                  className={`flex justify-between px-3 py-[3px] text-[11px] border-b border-[rgba(10,10,11,0.07)] last:border-b-0 ${
                    i % 2 === 0 ? 'bg-white' : 'bg-[rgba(10,10,11,0.02)]'
                  } ${n.indent ? 'pl-5' : ''}`}
                >
                  <span className={n.indent ? 'font-kr text-[rgba(10,10,11,0.6)]' : 'font-kr font-semibold'}>
                    {n.indent && (
                      <span className="text-[rgba(10,10,11,0.3)] mr-0.5 text-[10px]">└</span>
                    )}
                    {n.label}
                  </span>
                  <span className="font-en tabular-nums">
                    {data[n.key] as string}{n.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </LabelRow>

        {/* 보관방법 */}
        <LabelRow
          title="보관방법"
          step={1}
          required
          missing={missing.storage}
          missingMsg="보관방법을 선택해주세요."
          onGoToStep={onGoToStep}
        >
          {data.storage}
        </LabelRow>

        {/* 소비기한 */}
        <LabelRow
          title="소비기한"
          step={1}
          required
          missing={missing.expiryDate}
          missingMsg="소비기한을 선택해주세요."
          onGoToStep={onGoToStep}
        >
          <span className="font-en tabular-nums">
            {data.expiryDate.replace(/-/g, '.')} 까지
          </span>
        </LabelRow>

        {/* 제조원 */}
        <LabelRow
          title="제조원"
          step={1}
          required
          missing={missing.manufacturer}
          missingMsg="제조원을 입력해주세요."
          onGoToStep={onGoToStep}
        >
          {data.manufacturer}
        </LabelRow>

      </div>

      {/* 면책 문구 */}
      <p className="font-en text-[11px] text-[rgba(10,10,11,0.28)] leading-[1.6]">
        이 미리보기는 참고용이며 실제 인쇄 라벨과 차이가 있을 수 있습니다.
        최종 라벨은 관할 지자체 또는 식약처 기준에 따라 전문가와 확인하세요.
      </p>

    </div>
  )
}
