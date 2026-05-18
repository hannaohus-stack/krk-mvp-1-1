import { useState, useEffect } from 'react'
import { Lightbulb, CheckCircle2, AlertTriangle, X, Rocket } from 'lucide-react'
import type { StepProps, CreatorData } from './types'
import { NUTRITION_EXEMPTION_CRITERIA } from '../../utils/data/nutritionExemption'

// ─── 상수 ─────────────────────────────────────────────────────────────────────

type NutrientKey = 'calories' | 'totalCarbs' | 'sugar' | 'protein' | 'totalFat' | 'sodium'

const NUTRIENTS: { key: NutrientKey; label: string; unit: string; indent?: boolean }[] = [
  { key: 'calories',   label: '열량',    unit: 'kcal' },
  { key: 'totalCarbs', label: '탄수화물', unit: 'g' },
  { key: 'sugar',      label: '당류',    unit: 'g',   indent: true },
  { key: 'protein',    label: '단백질',   unit: 'g' },
  { key: 'totalFat',   label: '지방',    unit: 'g' },
  { key: 'sodium',     label: '나트륨',   unit: 'mg' },
]

type Mode = 'choose' | 'input' | 'exempted'
type Answer = 'yes' | 'no' | null
type Answers = Record<string, Answer>

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

const blockNonNumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault()
}

const toDisplay = (val: string) => (val === '' ? '' : val)

function initMode(data: CreatorData): Mode {
  if (data.nutritionExempted) return 'exempted'
  const hasData = (['calories','totalCarbs','sugar','protein','totalFat','sodium'] as NutrientKey[])
    .some(k => data[k] && data[k] !== '0')
  return hasData ? 'input' : 'choose'
}

function initAnswers(): Answers {
  return Object.fromEntries(NUTRITION_EXEMPTION_CRITERIA.map(c => [c.id, null]))
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function Step3_Nutrition({ data, onChange }: StepProps) {
  const [mode, setMode]           = useState<Mode>(() => initMode(data))
  const [modalOpen, setModalOpen] = useState(false)
  const [answers, setAnswers]     = useState<Answers>(initAnswers)
  const [showToast, setShowToast] = useState(false)

  const set = (key: keyof CreatorData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ [key]: e.target.value })

  const handleBlur = (key: NutrientKey) => () => {
    if (data[key].trim() === '') onChange({ [key]: '0' })
  }

  const handleServingBlur = () => {
    if (data.servingSize.trim() === '') onChange({ servingSize: '0' })
  }

  // 모달 결과 계산
  const answered = Object.values(answers).every(a => a !== null)
  const allYes   = answered && Object.values(answers).every(a => a === 'yes')

  const handleExempt = () => {
    onChange({ nutritionExempted: true })
    setModalOpen(false)
    setMode('exempted')
  }

  const handleManualInput = () => {
    onChange({ nutritionExempted: false })
    setModalOpen(false)
    setMode('input')
  }

  const openModal = () => {
    setAnswers(initAnswers())
    setModalOpen(true)
  }

  // 자동 계산 Coming Soon 토스트 (2.5초 후 자동 소멸)
  const triggerToast = () => {
    setShowToast(true)
  }
  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 2500)
    return () => clearTimeout(t)
  }, [showToast])

  return (
    <>
      {/* ── 토스트 ─────────────────────────────────────────────────────────── */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2.5 px-5 py-3 bg-ink text-white font-kr text-[13px] shadow-xl whitespace-nowrap">
          <Rocket size={14} className="flex-shrink-0" />
          자동 계산 기능은 v1.5에 추가될 예정입니다.
        </div>
      )}

      {/* ── 면제 진단 모달 ──────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[480px] mx-4 border border-[rgba(10,10,11,0.12)]">

            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(10,10,11,0.08)]">
              <span className="font-kr font-semibold text-[15px] text-ink">
                영양성분 표시 면제 자가진단
              </span>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[rgba(10,10,11,0.4)] hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* 질문 목록 */}
            <div className="px-6 py-5 flex flex-col gap-5">
              {NUTRITION_EXEMPTION_CRITERIA.map(c => (
                <div key={c.id} className="flex flex-col gap-2.5">
                  <p className="font-kr text-[13px] text-ink leading-[1.6]">
                    {c.question}
                  </p>
                  <p className="font-kr text-[11px] text-[rgba(10,10,11,0.4)]">
                    {c.regulation}
                  </p>
                  <div className="flex gap-2">
                    {(['yes', 'no'] as const).map(v => (
                      <button
                        key={v}
                        onClick={() => setAnswers(prev => ({ ...prev, [c.id]: v }))}
                        className={`flex-1 min-h-[44px] font-kr text-[13px] font-medium border transition-colors ${
                          answers[c.id] === v
                            ? v === 'yes'
                              ? 'bg-heritage-500 border-heritage-500 text-white'
                              : 'bg-[#B30000] border-[#B30000] text-white'
                            : 'bg-white border-[rgba(10,10,11,0.2)] text-[rgba(10,10,11,0.6)] hover:border-ink'
                        }`}
                      >
                        {v === 'yes' ? '예' : '아니오'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* 결과 영역 */}
              {answered && (
                <div className={`px-4 py-3.5 border flex flex-col gap-2 ${
                  allYes
                    ? 'bg-[#f0fdf4] border-[#15803d]/30'
                    : 'bg-[#FFF8F8] border-[#B30000]/25'
                }`}>
                  <div className="flex items-center gap-2">
                    {allYes
                      ? <CheckCircle2 size={14} className="text-[#15803d] flex-shrink-0" />
                      : <AlertTriangle size={14} className="text-[#B30000] flex-shrink-0" />}
                    <span className={`font-kr font-semibold text-[13px] ${allYes ? 'text-[#15803d]' : 'text-[#B30000]'}`}>
                      {allYes
                        ? '면제 대상일 가능성이 높습니다.'
                        : '면제 대상이 아닐 수 있습니다.'}
                    </span>
                  </div>
                  <p className="font-kr text-[12px] text-[rgba(10,10,11,0.55)] leading-[1.6] pl-[22px]">
                    {allYes
                      ? '최종 판단은 관할 지자체 또는 식약처에 확인하세요.'
                      : '영양성분을 직접 입력해주세요.'}
                  </p>
                  <div className="pl-[22px] pt-1">
                    {allYes ? (
                      <button onClick={handleExempt} className="btn-heritage flex items-center gap-2">
                        <CheckCircle2 size={13} />
                        면제 적용하고 다음으로
                      </button>
                    ) : (
                      <button onClick={handleManualInput} className="btn-primary flex items-center gap-2">
                        직접 입력하기
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── 본문 ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">

        {/* ── 진입 배너 (choose 또는 exempted 모드) ──────────────────────────── */}
        {(mode === 'choose' || mode === 'exempted') && (
          <div className="border border-[rgba(10,10,11,0.1)] px-5 py-4 flex flex-col gap-4">
            {mode === 'exempted' ? (
              /* 면제 적용됨 */
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#15803d] flex-shrink-0" />
                  <span className="font-kr font-semibold text-[14px] text-[#15803d]">
                    영양성분 표시 면제 적용됨
                  </span>
                </div>
                <p className="font-kr text-[12px] text-[rgba(10,10,11,0.5)] leading-[1.6] pl-[23px]">
                  자가진단 결과 면제 대상으로 확인되었습니다.
                  최종 판단은 관할 지자체 또는 식약처에 문의하세요.
                </p>
                <div className="flex gap-2 pl-[23px] pt-1">
                  <button
                    onClick={() => { onChange({ nutritionExempted: false }); setMode('choose'); setAnswers(initAnswers()) }}
                    className="font-en text-[12px] text-[rgba(10,10,11,0.4)] hover:text-ink underline transition-colors"
                  >
                    다시 진단하기
                  </button>
                  <span className="text-[rgba(10,10,11,0.2)]">·</span>
                  <button
                    onClick={handleManualInput}
                    className="font-en text-[12px] text-[rgba(10,10,11,0.4)] hover:text-ink underline transition-colors"
                  >
                    직접 입력하기
                  </button>
                </div>
              </div>
            ) : (
              /* 초기 선택 배너 */
              <>
                <div className="flex items-start gap-3">
                  <Lightbulb size={16} className="text-[#b45309] flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-kr font-semibold text-[13px] text-ink">
                      소규모 사업자는 영양성분 표시가 면제될 수 있습니다.
                    </span>
                    <span className="font-kr text-[12px] text-[rgba(10,10,11,0.5)]">
                      식품등의 표시기준 제5조 기준 적용
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 pl-[28px]">
                  <button
                    onClick={openModal}
                    className="btn-ghost flex items-center gap-1.5 text-[12px]"
                  >
                    면제 대상 확인하기
                  </button>
                  <button
                    onClick={handleManualInput}
                    className="btn-primary flex items-center gap-1.5 text-[12px]"
                  >
                    직접 입력하기
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── 영양성분 직접 입력 폼 ──────────────────────────────────────────── */}
        {mode === 'input' && (
          <>
            {/* 자동 계산 Coming Soon 버튼 */}
            <div className="flex items-center justify-between">
              <span className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.1em]">
                영양성분 직접 입력
              </span>
              <button
                onClick={triggerToast}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[rgba(10,10,11,0.15)] font-en text-[11px] text-[rgba(10,10,11,0.45)] hover:border-ink hover:text-ink transition-colors"
              >
                <Rocket size={11} />
                🚀 자동 계산 — Coming Soon
              </button>
            </div>

            {/* 1회 제공량 */}
            <div className="flex flex-col gap-1.5">
              <label className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.45)] uppercase tracking-[0.08em]">
                1회 제공량
              </label>
              <div className="flex gap-2 max-w-[220px]">
                <input
                  className="input-field flex-1 text-right tabular-nums"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={toDisplay(data.servingSize)}
                  onChange={set('servingSize')}
                  onBlur={handleServingBlur}
                  onKeyDown={blockNonNumeric}
                />
                <select
                  className="input-field w-[72px] flex-shrink-0"
                  value={data.servingUnit}
                  onChange={set('servingUnit')}
                >
                  <option value="g">g</option>
                  <option value="mL">mL</option>
                </select>
              </div>
            </div>

            {/* 영양성분 테이블 */}
            <div className="border border-[rgba(10,10,11,0.12)] border-b-0 overflow-hidden">
              <div className="bg-ink text-white px-4 py-2.5 text-center">
                <span className="font-kr font-bold text-[13px] tracking-[0.06em]">영양성분표</span>
                {data.servingSize && data.servingSize !== '0' && (
                  <span className="font-en text-[11px] text-white/55 ml-3 tabular-nums">
                    1회 {data.servingSize}{data.servingUnit} 기준
                  </span>
                )}
              </div>

              {NUTRIENTS.map((n, idx) => {
                const isCalories = n.key === 'calories'
                return (
                  <div
                    key={n.key}
                    className={`flex items-center border-b border-[rgba(10,10,11,0.08)]
                      ${idx % 2 === 0 ? 'bg-white' : 'bg-[rgba(10,10,11,0.015)]'}
                      ${isCalories ? 'border-b-[2px] border-b-[rgba(10,10,11,0.15)]' : ''}`}
                  >
                    <div className={`flex-1 py-2.5 ${n.indent ? 'pl-8' : 'pl-4'}`}>
                      <span className={`font-kr text-[13px] ${
                        isCalories ? 'font-bold text-ink' :
                        n.indent   ? 'text-[rgba(10,10,11,0.55)]' :
                                     'font-medium text-ink'
                      }`}>
                        {n.indent && <span className="text-[rgba(10,10,11,0.3)] mr-1.5 text-[11px]">└</span>}
                        {n.label}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 pr-4 py-1.5 ${isCalories ? 'py-2' : ''}`}>
                      <input
                        className={`border border-[rgba(10,10,11,0.15)] bg-white text-right px-3 tabular-nums
                          font-en text-[13px] outline-none transition-colors
                          focus:border-breath-500 focus:ring-[3px] focus:ring-breath-500/15
                          ${isCalories ? 'h-10 w-[100px] font-bold text-[15px]' : 'h-9 w-[88px]'}`}
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={toDisplay(data[n.key])}
                        onChange={set(n.key)}
                        onBlur={handleBlur(n.key)}
                        onKeyDown={blockNonNumeric}
                      />
                      <span className={`font-en text-right flex-shrink-0 tabular-nums
                        ${isCalories ? 'text-[13px] font-semibold text-ink w-[32px]' : 'text-[12px] text-[rgba(10,10,11,0.45)] w-[28px]'}`}>
                        {n.unit}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 안내 + 면제 재진단 링크 */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5 px-4 py-3 bg-[rgba(10,10,11,0.02)] border border-[rgba(10,10,11,0.07)] flex-1">
                <div className="w-1 h-1 rounded-full bg-[rgba(10,10,11,0.3)] flex-shrink-0 mt-[5px]" />
                <p className="font-kr text-[12px] text-[rgba(10,10,11,0.5)] leading-[1.6]">
                  숫자만 입력 가능합니다. 수치는 공인시험기관 분석 결과 기준으로 입력하세요.
                </p>
              </div>
              <button
                onClick={() => setMode('choose')}
                className="font-en text-[11px] text-[rgba(10,10,11,0.35)] hover:text-ink underline transition-colors whitespace-nowrap self-center flex-shrink-0"
              >
                면제 확인하기
              </button>
            </div>
          </>
        )}

      </div>
    </>
  )
}
