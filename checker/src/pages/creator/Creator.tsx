import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { INITIAL_DATA, isStep1Complete, type CreatorData } from './types'
import Step1_ProductInfo from './Step1_ProductInfo'
import Step2_Ingredients from './Step2_Ingredients'
import Step3_Nutrition   from './Step3_Nutrition'
import Step4_Preview     from './Step4_Preview'
import Step5_Export      from './Step5_Export'

// ─── 스텝 정의 ─────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: '제품 정보' },
  { id: 2, label: '원재료'   },
  { id: 3, label: '영양성분' },
  { id: 4, label: '미리보기' },
  { id: 5, label: '내보내기' },
]

const SECTION_LABEL = [
  '01 — 제품 정보',
  '02 — 원재료',
  '03 — 영양성분',
  '04 — 미리보기',
  '05 — 내보내기',
]

const SECTION_HEAD: React.ReactNode[] = [
  <>제품의 기본 정보를<br />입력해주세요.</>,
  <>원재료를<br />등록해주세요.</>,
  <>영양성분 수치를<br />입력해주세요.</>,
  <>라벨을<br />미리 확인하세요.</>,
  <>완성된 라벨을<br />내보내세요.</>,
]

// ─── 진행 바 ───────────────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  const pct = (current - 1) / (STEPS.length - 1)  // 0 → 1

  return (
    <div className="relative pt-1 pb-7">
      {/* 배경 트랙 */}
      <div className="absolute top-[15px] left-[26px] right-[26px] h-px bg-[rgba(10,10,11,0.1)]" />
      {/* 진행 채움 */}
      <div
        className="absolute top-[15px] left-[26px] h-px bg-breath-500 transition-all duration-500 ease-in-out"
        style={{ width: `calc(${pct} * (100% - 52px))` }}
      />

      {/* 스텝 서클 */}
      <div className="relative flex justify-between">
        {STEPS.map(s => {
          const done   = s.id < current
          const active = s.id === current
          return (
            <div key={s.id} className="flex flex-col items-center gap-2" style={{ width: 52 }}>
              <div
                className={`w-[30px] h-[30px] flex items-center justify-center
                  text-[11px] font-semibold font-en border transition-all duration-300
                  ${done   ? 'bg-breath-500 border-breath-500 text-white'
                  : active ? 'bg-ink border-ink text-white'
                  :          'bg-white border-[rgba(10,10,11,0.15)] text-[rgba(10,10,11,0.28)]'}`}
              >
                {done ? <CheckCircle2 size={13} /> : s.id}
              </div>
              <span
                className={`font-kr text-[10px] text-center leading-tight transition-colors duration-200
                  ${active ? 'text-ink font-semibold'
                  : done   ? 'text-breath-500'
                  :          'text-[rgba(10,10,11,0.3)]'}`}
              >
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 메인 페이지 ───────────────────────────────────────────────────────────────

export default function Creator() {
  const navigate = useNavigate()
  const location = useLocation()

  // Checker → Creator 연결 시 사전 입력 데이터 적용
  const prefill = (location.state as { prefill?: Partial<CreatorData> } | null)?.prefill

  const [step, setStep] = useState(1)
  const [data, setData] = useState<CreatorData>(() => ({
    ...INITIAL_DATA,
    ...(prefill ?? {}),
  }))

  const update = (partial: Partial<CreatorData>) =>
    setData(prev => ({ ...prev, ...partial }))

  // ── 시나리오 테스트용 state 감시 로그 ────────────────────────────────────
  useEffect(() => {
    if (step < 2) return
    console.group(`%c[KRK Creator] Step ${step} — state`, 'color:#0CA4F9;font-weight:bold')
    if (step >= 2) {
      console.log('detectedAllergens :', data.detectedAllergens.length > 0
        ? data.detectedAllergens.map(a => `${a.name}(${a.id})`).join(', ')
        : '없음 ✅')
      console.log('detectedComposites:', data.detectedComposites.length > 0
        ? data.detectedComposites.map(c => `${c.ingredientName} → ${c.matchedKeyword}`).join(', ')
        : '없음')
      console.log('ingredients       :', data.ingredients.map(i =>
        `${i.name} ${i.weight}g${i.isAllergen ? ' [알레르기]' : ''}${i.isComposite ? ' [복합]' : ''}`
      ).join(' / ') || '(없음)')
    }
    if (step >= 3) {
      console.log('nutritionExempted :', data.nutritionExempted ? '✅ 면제 적용' : '❌ 미적용')
    }
    console.groupEnd()
  }, [step, data.detectedAllergens, data.detectedComposites, data.nutritionExempted, data.ingredients])

  const goNext = () => setStep(s => Math.min(s + 1, 5))
  const goPrev = () => {
    if (step === 1) navigate('/')
    else setStep(s => s - 1)
  }
  const restart = () => {
    setData(INITIAL_DATA)
    setStep(1)
  }

  const isLastStep = step === 5

  // Step별 validation
  const canGoNext = (() => {
    if (step === 1) return isStep1Complete(data)
    if (step === 3) {
      // 면제 적용 시 통과
      if (data.nutritionExempted) return true
      // 직접 입력 선택 시 최소 1개 이상 입력 필요
      const nutrKeys = ['calories','totalCarbs','sugar','protein','totalFat','sodium'] as const
      return nutrKeys.some(k => data[k].trim() !== '' && data[k] !== '0')
    }
    return true
  })()

  return (
    <div className="min-h-screen bg-white">

      {/* ── 네비게이션 ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-16 py-[18px] bg-white/80 backdrop-blur-[18px] border-b border-[rgba(10,10,11,0.08)]">
        <button
          onClick={() => navigate('/')}
          className="flex items-baseline gap-[5px] hover:opacity-70 transition-opacity"
        >
          <span
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            className="font-bold text-[15px] tracking-[0.04em] text-[#0A0A0B]"
          >
            krk
          </span>
          <span className="font-en font-light text-[15px] tracking-[0.14em] text-[#0A0A0B]">
            check
          </span>
        </button>
        <div className="font-en text-[12px] font-semibold tracking-[0.16em] text-[rgba(10,10,11,0.45)] uppercase">
          Creator
        </div>
        <div className="font-en text-[11px] text-[rgba(10,10,11,0.35)] tracking-[0.08em]">
          MVP v1
        </div>
      </nav>

      {/* ── 본문 ─────────────────────────────────────────────────────────────── */}
      <main className="pt-[72px] min-h-screen flex flex-col">
        <div className="flex-1 max-w-[760px] mx-auto w-full px-6 md:px-0 py-10 md:py-12">

          {/* 진행 바 */}
          <StepBar current={step} />

          {/* 섹션 헤더 */}
          <div className="mb-10 pb-5 border-b border-[rgba(10,10,11,0.1)]">
            <div className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.16em] mb-2">
              {SECTION_LABEL[step - 1]}
            </div>
            <h1 className="font-en font-medium text-[clamp(24px,3.5vw,36px)] tracking-[-0.02em] leading-[1.1]">
              {SECTION_HEAD[step - 1]}
            </h1>
          </div>

          {/* 스텝 콘텐츠 */}
          <div className="min-h-[360px]">
            {step === 1 && <Step1_ProductInfo data={data} onChange={update} />}
            {step === 2 && <Step2_Ingredients data={data} onChange={update} />}
            {step === 3 && <Step3_Nutrition   data={data} onChange={update} />}
            {step === 4 && <Step4_Preview     data={data} onGoToStep={setStep} />}
            {step === 5 && <Step5_Export      data={data} onRestart={restart} />}
          </div>

          {/* 이전 / 다음 버튼 */}
          {!isLastStep && (
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-[rgba(10,10,11,0.08)]">
              <button onClick={goPrev} className="btn-ghost flex items-center gap-2">
                <ChevronLeft size={14} />
                {step === 1 ? '홈으로' : '이전'}
              </button>
              <button
                onClick={goNext}
                disabled={!canGoNext}
                className="btn-heritage flex items-center gap-2"
              >
                {step === 4 ? '내보내기' : '다음'}
                <ChevronRight size={14} />
              </button>
            </div>
          )}

        </div>

        {/* 하단 면책 문구 */}
        <footer className="border-t border-[rgba(10,10,11,0.06)] px-6 py-5 text-center">
          <p className="font-en text-[11px] text-[rgba(10,10,11,0.3)] leading-[1.6]">
            krk.team이 제공하는 라벨 초안은 참고용이며 법적 효력이 없습니다.
            최종 라벨은 관할 지자체 또는 식약처 기준에 따라 확인하세요.
          </p>
        </footer>
      </main>
    </div>
  )
}
