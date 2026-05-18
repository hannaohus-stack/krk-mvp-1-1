import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import type { StepProps, CreatorData } from './types'

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const FOOD_CATEGORIES = ['잼류', '소스류', '장류'] as const

const UNITS = ['g', 'mL'] as const

const STORAGE_OPTIONS = ['냉장보관', '상온보관', '냉동보관'] as const

const TODAY = new Date().toISOString().slice(0, 10)

// ─── 서브 컴포넌트 ─────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 font-en text-[11px] font-semibold text-[rgba(10,10,11,0.45)] uppercase tracking-[0.08em]">
        {label}
        <span className="text-[#B30000]">*</span>
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 font-kr text-[11px] text-[#B30000]">
          <AlertCircle size={11} className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

/** 세그먼트 라디오 그룹 — KRK 토글 스타일 */
function SegmentGroup<T extends string>({
  name,
  options,
  value,
  onChange,
  hasError,
  labelFn,
}: {
  name: string
  options: readonly T[]
  value: T | ''
  onChange: (v: T) => void
  hasError?: boolean
  labelFn?: (v: T) => string
}) {
  const border = hasError ? 'border-[#B30000]' : 'border-[rgba(10,10,11,0.2)]'
  return (
    <div className={`flex border ${border} overflow-hidden`}>
      {options.map((opt, i) => {
        const active = value === opt
        return (
          <label
            key={opt}
            className={`flex-1 flex items-center justify-center min-h-[44px] cursor-pointer
              font-kr text-[13px] transition-colors select-none
              ${i > 0 ? 'border-l border-[rgba(10,10,11,0.12)]' : ''}
              ${active
                ? 'bg-ink text-white font-semibold'
                : 'bg-white text-ink hover:bg-[rgba(10,10,11,0.04)]'}`}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={active}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            {labelFn ? labelFn(opt) : opt}
          </label>
        )
      })}
    </div>
  )
}

const inputCls = (hasError: boolean) =>
  `input-field ${hasError ? 'border-[#B30000] focus:ring-[#B30000]/15' : ''}`

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function Step1_ProductInfo({ data, onChange }: StepProps) {
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const touch = (field: string) =>
    setTouched(prev => new Set([...prev, field]))

  const set =
    (key: keyof CreatorData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ [key]: e.target.value })

  const err = (field: string, msg: string) =>
    touched.has(field) ? msg : undefined

  const errors = {
    productName:  !data.productName.trim()
                    ? err('productName',  '제품명을 입력해주세요.')      : undefined,
    foodCategory: !data.foodCategory
                    ? err('foodCategory', '식품 유형을 선택해주세요.')   : undefined,
    totalWeight:  !data.totalWeight.trim() || parseFloat(data.totalWeight) <= 0
                    ? err('totalWeight',  '내용량을 입력해주세요.')       : undefined,
    manufacturer: !data.manufacturer.trim()
                    ? err('manufacturer', '제조원을 입력해주세요.')       : undefined,
    storage:      !data.storage
                    ? err('storage',      '보관방법을 선택해주세요.')     : undefined,
    expiryDate:   !data.expiryDate
                    ? err('expiryDate',   '소비기한을 선택해주세요.')     : undefined,
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

      {/* 제품명 — full width */}
      <div className="md:col-span-2">
        <Field label="제품명" error={errors.productName}>
          <input
            className={inputCls(!!errors.productName)}
            placeholder="예: 딸기잼, 고추장 등"
            value={data.productName}
            onChange={set('productName')}
            onBlur={() => touch('productName')}
          />
        </Field>
      </div>

      {/* 식품 유형 — 세그먼트 라디오 */}
      <div className="md:col-span-2">
        <Field label="식품 유형" error={errors.foodCategory}>
          <SegmentGroup
            name="foodCategory"
            options={FOOD_CATEGORIES}
            value={data.foodCategory as typeof FOOD_CATEGORIES[number] | ''}
            onChange={v => { onChange({ foodCategory: v }); touch('foodCategory') }}
            hasError={!!errors.foodCategory}
          />
        </Field>
      </div>

      {/* 내용량 + 단위 라디오 */}
      <Field label="내용량" error={errors.totalWeight}>
        <div className="flex gap-2">
          <input
            className={`${inputCls(!!errors.totalWeight)} flex-1`}
            type="number"
            min="0"
            step="any"
            placeholder="예: 200"
            value={data.totalWeight}
            onChange={set('totalWeight')}
            onBlur={() => touch('totalWeight')}
          />
          {/* 단위 라디오 */}
          <div className="flex border border-[rgba(10,10,11,0.2)] overflow-hidden flex-shrink-0">
            {UNITS.map((u, i) => (
              <label
                key={u}
                className={`w-12 min-h-[44px] flex items-center justify-center cursor-pointer
                  font-en text-[13px] transition-colors select-none
                  ${i > 0 ? 'border-l border-[rgba(10,10,11,0.12)]' : ''}
                  ${data.unit === u
                    ? 'bg-ink text-white font-semibold'
                    : 'bg-white text-ink hover:bg-[rgba(10,10,11,0.04)]'}`}
              >
                <input
                  type="radio"
                  name="unit"
                  value={u}
                  checked={data.unit === u}
                  onChange={() => onChange({ unit: u })}
                  className="sr-only"
                />
                {u}
              </label>
            ))}
          </div>
        </div>
      </Field>

      {/* 소비기한 */}
      <Field label="소비기한" error={errors.expiryDate}>
        <input
          className={inputCls(!!errors.expiryDate)}
          type="date"
          min={TODAY}
          value={data.expiryDate}
          onChange={set('expiryDate')}
          onBlur={() => touch('expiryDate')}
        />
      </Field>

      {/* 제조원 — full width */}
      <div className="md:col-span-2">
        <Field label="제조원" error={errors.manufacturer}>
          <input
            className={inputCls(!!errors.manufacturer)}
            placeholder="예: 주식회사 ○○식품"
            value={data.manufacturer}
            onChange={set('manufacturer')}
            onBlur={() => touch('manufacturer')}
          />
        </Field>
      </div>

      {/* 보관방법 — 세그먼트 라디오 */}
      <div className="md:col-span-2">
        <Field label="보관방법" error={errors.storage}>
          <SegmentGroup
            name="storage"
            options={STORAGE_OPTIONS}
            value={data.storage as typeof STORAGE_OPTIONS[number] | ''}
            onChange={v => { onChange({ storage: v }); touch('storage') }}
            hasError={!!errors.storage}
          />
        </Field>
      </div>

      {/* 안내 */}
      <div className="md:col-span-2 flex items-start gap-2 px-4 py-3 bg-[rgba(10,10,11,0.02)] border border-[rgba(10,10,11,0.07)]">
        <div className="w-1 h-1 rounded-full bg-[rgba(10,10,11,0.3)] flex-shrink-0 mt-[5px]" />
        <p className="font-kr text-[12px] text-[rgba(10,10,11,0.5)] leading-[1.6]">
          모든 항목은 필수입니다. 입력된 정보는 라벨 초안 및 품목제조보고서에 사용됩니다.
        </p>
      </div>

    </div>
  )
}
