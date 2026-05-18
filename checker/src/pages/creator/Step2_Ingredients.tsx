import { useMemo } from 'react'
import { Plus, Trash2, AlertTriangle, ArrowUpDown, CheckCircle2, ClipboardList } from 'lucide-react'
import { detectAllergens, detectAllergensFromList } from '../../utils/allergenChecker'
import { detectComposite, detectCompositesFromList } from '../../utils/compositeChecker'
import type { StepProps, CreatorIngredient } from './types'

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function newRow(): CreatorIngredient {
  return { id: crypto.randomUUID(), name: '', weight: '', isAllergen: false, isComposite: false }
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function Step2_Ingredients({ data, onChange }: StepProps) {
  const { ingredients } = data

  const totalW = ingredients.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0)

  const ratio = (w: string) => {
    const n = parseFloat(w)
    if (!n || !totalW) return '—'
    return ((n / totalW) * 100).toFixed(1) + '%'
  }

  const sorted     = [...ingredients].sort((a, b) => (parseFloat(b.weight) || 0) - (parseFloat(a.weight) || 0))
  const isOrdered  = ingredients.every((ing, i) => ing.id === sorted[i]?.id)

  // ── 알레르겐 감지 (표시용 + 상위 state 동기화 헬퍼) ─────────────────────────

  /** 원재료 목록에서 감지된 알레르겐 (표시용) */
  const detectedAllergens = useMemo(() => {
    const names = ingredients.map(i => i.name).filter(n => n.trim() !== '')
    return detectAllergensFromList(names)
  }, [ingredients])

  /** 원재료 목록에서 감지된 복합원재료 (표시용) */
  const detectedComposites = useMemo(() => {
    const names = ingredients.map(i => i.name).filter(n => n.trim() !== '')
    return detectCompositesFromList(names)
  }, [ingredients])

  /** 원재료 배열 + allergens/composites를 함께 상위로 올리는 래퍼 */
  const pushUpdate = (next: CreatorIngredient[]) => {
    const names = next.map(i => i.name).filter(n => n.trim() !== '')
    onChange({
      ingredients:        next,
      detectedAllergens:  detectAllergensFromList(names).map(a => ({ id: a.id, name: a.name })),
      detectedComposites: detectCompositesFromList(names),
    })
  }

  // ── 원재료 CRUD ──────────────────────────────────────────────────────────────

  const update = (id: string, field: keyof CreatorIngredient, value: string | boolean) => {
    const next = ingredients.map(i => {
      if (i.id !== id) return i
      const updated = { ...i, [field]: value }
      // 이름 변경 시 알레르기·복합원재료 자동 감지
      if (field === 'name' && typeof value === 'string') {
        updated.isAllergen  = detectAllergens(value).length > 0
        updated.isComposite = detectComposite(value) !== null
      }
      return updated
    })
    pushUpdate(next)
  }

  const addRow   = () => pushUpdate([...ingredients, newRow()])
  const remove   = (id: string) => pushUpdate(ingredients.filter(i => i.id !== id))
  const autoSort = () => pushUpdate(sorted)

  const allergenCount  = ingredients.filter(i => i.isAllergen).length
  const compositeCount = ingredients.filter(i => i.isComposite).length
  const hasIngredients = ingredients.length > 0

  return (
    <div className="flex flex-col gap-4">

      {/* ── 원재료 테이블 ───────────────────────────────────────────────────── */}
      <div className="border border-[rgba(10,10,11,0.1)] border-b-0">
        {/* 헤더 */}
        <div
          className="grid bg-[rgba(10,10,11,0.02)] border-b border-[rgba(10,10,11,0.1)]"
          style={{ gridTemplateColumns: '1fr 88px 64px 68px 76px 32px' }}
        >
          {['원재료명', '중량(g)', '비율', '알레르기', '복합원재료', ''].map(h => (
            <div key={h} className="px-3 py-2.5 font-en text-[10px] font-semibold text-[rgba(10,10,11,0.45)] uppercase tracking-[0.08em]">
              {h}
            </div>
          ))}
        </div>

        {/* 빈 상태 */}
        {ingredients.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="font-kr text-[13px] text-[rgba(10,10,11,0.35)]">
              아래 버튼으로 원재료를 추가하세요.
            </p>
          </div>
        ) : (
          ingredients.map((ing, idx) => (
            <div
              key={ing.id}
              className={`grid items-center border-b border-[rgba(10,10,11,0.07)] ${
                idx % 2 === 0 ? 'bg-white' : 'bg-[rgba(10,10,11,0.01)]'
              }`}
              style={{ gridTemplateColumns: '1fr 88px 64px 68px 76px 32px' }}
            >
              {/* 이름 */}
              <div className="px-2 py-1.5">
                <input
                  className="input-field h-8 text-[12px]"
                  placeholder="원재료명"
                  value={ing.name}
                  onChange={e => update(ing.id, 'name', e.target.value)}
                />
              </div>

              {/* 중량 */}
              <div className="px-2 py-1.5">
                <input
                  className="input-field h-8 text-[12px] text-right"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={ing.weight}
                  onChange={e => update(ing.id, 'weight', e.target.value)}
                />
              </div>

              {/* 비율 */}
              <div className="px-2 py-1.5 font-en text-[12px] text-center text-[rgba(10,10,11,0.5)] tabular-nums">
                {ratio(ing.weight)}
              </div>

              {/* 알레르기 (자동 감지 + 수동 오버라이드 가능) */}
              <div className="px-2 py-1.5 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={ing.isAllergen}
                  onChange={e => update(ing.id, 'isAllergen', e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: '#B30000' }}
                />
              </div>

              {/* 복합원재료 */}
              <div className="px-2 py-1.5 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={ing.isComposite}
                  onChange={e => update(ing.id, 'isComposite', e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: '#8A5A00' }}
                />
              </div>

              {/* 삭제 */}
              <div className="px-1 py-1.5 flex items-center justify-center">
                <button
                  onClick={() => remove(ing.id)}
                  className="w-6 h-6 flex items-center justify-center text-[rgba(10,10,11,0.25)] hover:text-[#B30000] transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── 총중량 초과 경고 ────────────────────────────────────────────────────── */}
      {(() => {
        const productW = parseFloat(data.totalWeight)
        return hasIngredients && productW > 0 && totalW > productW + 0.5 && (
          <div className="flex items-center gap-3 px-3 py-2.5 bg-[#FFE6E6] border border-[#B30000]">
            <AlertTriangle size={13} className="text-[#B30000] flex-shrink-0" />
            <p className="font-kr text-[12px] text-[#B30000]">
              원재료 합계 <span className="font-semibold tabular-nums">{totalW}g</span>이
              제품 내용량 <span className="font-semibold tabular-nums">{productW}g</span>을 초과합니다.
              중량을 다시 확인해주세요.
            </p>
          </div>
        )
      })()}

      {/* ── 정렬 경고 ─────────────────────────────────────────────────────────── */}
      {ingredients.length > 1 && !isOrdered && (
        <div className="flex items-center gap-3 px-3 py-2.5 bg-[#FFF3DC] border border-[#F0A500]">
          <AlertTriangle size={13} className="text-[#8A5A00] flex-shrink-0" />
          <p className="font-kr text-[12px] text-[#8A5A00] flex-1">
            원재료는 함량이 많은 순서대로 표기해야 합니다.
          </p>
          <button
            onClick={autoSort}
            className="flex items-center gap-1 font-en text-[11px] font-semibold text-[#8A5A00] underline flex-shrink-0"
          >
            <ArrowUpDown size={11} />
            자동 정렬
          </button>
        </div>
      )}

      {/* ── 원재료 추가 버튼 ──────────────────────────────────────────────────── */}
      <button onClick={addRow} className="btn-ghost flex items-center gap-2 self-start min-h-[44px]">
        <Plus size={14} />
        원재료 추가
      </button>

      {/* ── 요약 바 ──────────────────────────────────────────────────────────── */}
      {hasIngredients && (
        <div className="grid grid-cols-3 gap-3 border border-[rgba(10,10,11,0.08)] px-5 py-4 bg-[rgba(10,10,11,0.01)]">
          <div>
            <div className="font-en text-[10px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.08em] mb-1">
              총 중량
            </div>
            <div className="font-en font-bold text-[20px] text-ink tabular-nums leading-none">
              {totalW > 0 ? `${totalW}g` : '—'}
            </div>
          </div>
          <div>
            <div className="font-en text-[10px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.08em] mb-1">
              알레르기
            </div>
            <div className={`font-en font-bold text-[20px] leading-none tabular-nums ${allergenCount > 0 ? 'text-[#B30000]' : 'text-[rgba(10,10,11,0.3)]'}`}>
              {allergenCount}개
            </div>
          </div>
          <div>
            <div className="font-en text-[10px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.08em] mb-1">
              복합원재료
            </div>
            <div className={`font-en font-bold text-[20px] leading-none tabular-nums ${compositeCount > 0 ? 'text-[#8A5A00]' : 'text-[rgba(10,10,11,0.3)]'}`}>
              {compositeCount}개
            </div>
          </div>
        </div>
      )}

      {/* ── 알레르겐 배너 ─────────────────────────────────────────────────────── */}
      {/* ── 알레르겐 배너 ─────────────────────────────────────────────────────── */}
      {hasIngredients && (
        detectedAllergens.length > 0 ? (
          <div
            className="border px-4 py-3.5 flex flex-col gap-1.5"
            style={{ background: '#fff8f0', borderColor: '#f5d0a0' }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-[#b45309] flex-shrink-0" />
              <span className="font-kr font-semibold text-[13px] text-[#92400e]">
                알레르기 유발 물질 감지됨
              </span>
            </div>
            <p className="font-kr text-[14px] font-bold text-[#b45309] pl-[22px]">
              {detectedAllergens.map(a => a.name).join(' · ')}
            </p>
            <p className="font-kr text-[12px] text-[#92400e]/70 pl-[22px]">
              라벨에 별도 표시가 필요합니다 (식품등의 표시기준 제4조 제1항 제5호)
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 border border-[#15803d]/20 bg-[#f0fdf4]">
            <CheckCircle2 size={14} className="text-[#15803d] flex-shrink-0" />
            <span className="font-kr text-[13px] text-[#15803d]">
              알레르기 유발 물질 없음
            </span>
          </div>
        )
      )}

      {/* ── 복합원재료 배너 (감지된 경우에만) ─────────────────────────────────── */}
      {hasIngredients && detectedComposites.length > 0 && (
        <div
          className="border px-4 py-3.5 flex flex-col gap-3"
          style={{ background: '#f0f4ff', borderColor: '#b0c4f5' }}
        >
          {/* 헤더 */}
          <div className="flex items-center gap-2">
            <ClipboardList size={14} className="text-[#3b5fc0] flex-shrink-0" />
            <span className="font-kr font-semibold text-[13px] text-[#2c4aa8]">
              복합원재료 표시 필요
            </span>
          </div>

          {/* 항목 목록 */}
          <div className="flex flex-col gap-3 pl-[22px]">
            {detectedComposites.map((c, i) => {
              // hint에서 구성 재료 추출해 예시 생성
              const parts = c.hint.split('등')[0].split('·').map(s => s.trim()).filter(Boolean)
              const example = parts.length > 0
                ? `${c.ingredientName}(${parts.join(', ')}, ...)`
                : `${c.ingredientName}(구성 원재료, ...)`

              return (
                <div key={i} className="flex flex-col gap-0.5">
                  <p className="font-kr text-[13px] text-[#2c4aa8]">
                    <span className="text-[#3b5fc0] mr-1">·</span>
                    <span className="font-semibold">{c.ingredientName}</span>
                    <span className="text-[rgba(10,10,11,0.55)] mx-1">→</span>
                    구성 원재료를 괄호로 표시하세요
                  </p>
                  <p className="font-kr text-[11px] text-[#3b5fc0]/70 pl-3">
                    힌트: {c.hint}
                  </p>
                  <p className="font-en text-[11px] text-[rgba(10,10,11,0.45)] pl-3">
                    예: {example}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
