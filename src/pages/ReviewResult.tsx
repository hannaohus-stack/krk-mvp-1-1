import { useMemo, useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  AlertTriangle, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, RotateCcw, Share2, Edit3,
} from 'lucide-react'
import type { Ingredient } from '../utils/parsing'
import regulationsData from '../utils/data/regulations.json'

// ─── 타입 ─────────────────────────────────────────────────────────────────────

export interface Metadata {
  productName: string
  totalWeight: string
  unit: 'g' | 'mL' | 'kg' | 'L'
  expiryDays: string
  storage: string
  manufacturer: string
}

type RiskStatus = 'violation' | 'warn' | 'pass'
type StatusFilter = 'all' | 'violation' | 'warn' | 'pass'

export interface RegulationResult {
  id: string                   // "R01" ~ "R12"
  title: string
  severity: 'red' | 'yellow'
  condition: string
  penaltyRange: string
  regulation: string
  suggestion: string
  status: RiskStatus
  detail: string
}

// ─── 분석 로직 ─────────────────────────────────────────────────────────────────

export function analyzeRegulations(
  ingredients: Ingredient[],
  metadata: Metadata,
): RegulationResult[] {
  const allergens  = ingredients.filter(i => i.isAllergen)
  const composites = ingredients.filter(i => i.isComposite)
  const allWeights = ingredients.length > 0 && ingredients.every(i => i.weight > 0)
  const isSorted   = allWeights &&
    ingredients.every((ing, idx) => idx === 0 || ingredients[idx - 1].weight >= ing.weight)

  const map: Record<string, { status: RiskStatus; detail: string }> = {
    R01: metadata.productName.trim()
      ? { status: 'pass',      detail: `제품명 "${metadata.productName}" 확인.` }
      : { status: 'violation', detail: '제품명이 입력되지 않았습니다. 라벨 필수 기재 항목입니다.' },

    R02: metadata.totalWeight.trim()
      ? { status: 'pass',      detail: `내용량 ${metadata.totalWeight}${metadata.unit} 확인.` }
      : { status: 'violation', detail: '내용량이 입력되지 않았습니다. 숫자와 단위(g/mL)를 함께 표시해야 합니다.' },

    R03: !allWeights
      ? { status: 'warn',        detail: '중량 정보 없이 원재료 순서를 자동 검증할 수 없습니다. 함량 내림차순 정렬을 직접 확인하세요.' }
      : isSorted
        ? { status: 'pass',      detail: '원재료가 함량 내림차순으로 올바르게 정렬되어 있습니다.' }
        : { status: 'violation', detail: '원재료 순서가 함량 기준 내림차순과 일치하지 않습니다. 재정렬이 필요합니다.' },

    R04: { status: 'warn', detail: '제품명에 특정 원재료(예: 딸기잼 → 딸기)가 포함된 경우 해당 원재료 함량(%)을 표시해야 합니다. 직접 확인하세요.' },

    R05: allergens.length > 0
      ? { status: 'warn',  detail: `${allergens.map(a => a.name).join(', ')} 등 ${allergens.length}개 알레르기 유발 원료 감지. 별도 구분하여 명시 필요.` }
      : { status: 'pass',  detail: '알레르기 유발 원료가 감지되지 않았습니다.' },

    R06: composites.length > 0
      ? { status: 'warn',  detail: `${composites.map(c => c.name).join(', ')} 등 ${composites.length}개 복합원재료 감지. 괄호 안에 구성 원재료를 함량 순으로 표시해야 합니다.` }
      : { status: 'pass',  detail: '복합원재료가 감지되지 않았습니다.' },

    R07: metadata.expiryDays.trim()
      ? { status: 'pass',      detail: `소비기한 ${metadata.expiryDays}일 기준 확인. 라벨에는 'YYYY.MM.DD 까지' 형식으로 표시하세요.` }
      : { status: 'violation', detail: '소비기한이 입력되지 않았습니다. 2023년부터 유통기한 대신 소비기한 표시가 의무입니다.' },

    R08: metadata.storage.trim()
      ? { status: 'pass',  detail: `보관방법 "${metadata.storage}" 확인. 개봉 후 보관방법도 포함되어 있는지 확인하세요.` }
      : { status: 'warn',  detail: '보관방법이 입력되지 않았습니다. 개봉 전·후 보관조건을 모두 표시하세요.' },

    R09: { status: 'warn', detail: '영양성분표 의무 여부는 사업 규모에 따라 다릅니다. 연매출 1억 이상 또는 50인 이상 사업장은 의무 표시 대상입니다.' },

    R10: metadata.manufacturer.trim()
      ? { status: 'pass',      detail: `제조업소 "${metadata.manufacturer}" 확인. 소재지(도로명 주소)·신고번호 병기 여부를 확인하세요.` }
      : { status: 'violation', detail: '제조업소명이 입력되지 않았습니다. 소재지·신고번호를 함께 표시해야 합니다.' },

    R11: { status: 'warn', detail: '포장재질(PET, PP 등)은 자동 감지되지 않습니다. 용기·뚜껑 각각의 재질을 직접 확인하세요.' },

    R12: { status: 'warn', detail: '부당 표시 여부는 자동 판별이 어렵습니다. \'천연\', \'유기농\', \'다이어트\' 등 미인증 표현 사용 여부를 직접 확인하세요.' },
  }

  return (regulationsData as unknown as Omit<RegulationResult, 'status' | 'detail'>[]).map(reg => ({
    ...reg,
    severity: reg.severity as 'red' | 'yellow',
    ...(map[reg.id] ?? { status: 'warn' as RiskStatus, detail: '' }),
  }))
}

function parseMaxPenaltyMw(penaltyRange: string): number {
  const nums = penaltyRange.match(/\d+/g)?.map(Number) ?? []
  return nums.length > 0 ? Math.max(...nums) : 0
}

// Checker 분석 데이터 → Creator 사전 입력 형식 변환
function toCreatorPrefill(ingredients: Ingredient[], metadata: Metadata) {
  // expiryDays(일수) → expiryDate(YYYY-MM-DD) 변환
  let expiryDate = ''
  if (metadata.expiryDays) {
    const days = parseInt(metadata.expiryDays)
    if (!isNaN(days) && days > 0) {
      const d = new Date()
      d.setDate(d.getDate() + days)
      expiryDate = d.toISOString().slice(0, 10)
    }
  }

  // 'kg'|'L' → CreatorData의 'g'|'mL'|'개' 근사 매핑
  const unitMap: Record<string, 'g' | 'mL' | '개'> = {
    g: 'g', mL: 'mL', kg: 'g', L: 'mL',
  }

  return {
    productName:  metadata.productName,
    totalWeight:  metadata.totalWeight,
    unit:         unitMap[metadata.unit] ?? 'g',
    manufacturer: metadata.manufacturer,
    storage:      metadata.storage,
    expiryDate,
    ingredients:  ingredients.map(ing => ({
      id:          ing.id,
      name:        ing.name,
      weight:      String(ing.weight),
      isAllergen:  ing.isAllergen,
      isComposite: ing.isComposite,
    })),
  }
}

function riskLevel(violations: number, warnings: number): { label: string; color: string } {
  if (violations >= 3)                      return { label: '고위험',  color: '#B30000' }
  if (violations >= 1 || warnings >= 8)     return { label: '주의',    color: '#F0A500' }
  return                                           { label: '양호',    color: '#15803D' }
}

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  red:    { full: 'HIGH', bg: '#FFE6E6', color: '#B30000' },
  yellow: { full: 'MID',  bg: '#FFF3DC', color: '#8A5A00' },
}

const STATUS_CONFIG: Record<RiskStatus, {
  label: string
  badgeClass: string
  borderColor: string
  rowBg: string
  icon: React.ReactNode
}> = {
  violation: {
    label: '위반',
    badgeClass: 'badge-risk',
    borderColor: '#B30000',
    rowBg: '#FFFAFA',
    icon: <AlertTriangle size={10} />,
  },
  warn: {
    label: '경고',
    badgeClass: 'badge-warn',
    borderColor: '#F0A500',
    rowBg: '#FFFDF5',
    icon: <AlertCircle size={10} />,
  },
  pass: {
    label: '통과',
    badgeClass: 'badge-pass',
    borderColor: '#15803D',
    rowBg: '#FAFFFC',
    icon: <CheckCircle2 size={10} />,
  },
}

// ─── 법규 행 ──────────────────────────────────────────────────────────────────

function RegulationRow({
  result,
  expanded,
  onToggle,
}: {
  result: RegulationResult
  expanded: boolean
  onToggle: () => void
}) {
  const sev  = SEVERITY_CONFIG[result.severity]
  const stat = STATUS_CONFIG[result.status]
  const showPenalty = result.status === 'violation' || result.status === 'warn'

  return (
    <div
      className="border-b border-[rgba(10,10,11,0.07)]"
      style={{ borderLeft: `3px solid ${stat.borderColor}` }}
    >
      {/* 헤더 행 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
        style={{ background: expanded ? stat.rowBg : undefined }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = stat.rowBg }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = expanded ? stat.rowBg : '' }}
      >
        {/* 번호 */}
        <span className="font-en text-[11px] text-[rgba(10,10,11,0.28)] w-8 flex-shrink-0 text-right tabular-nums">
          {result.id}
        </span>

        {/* 심각도 칩 */}
        <span
          className="font-en text-[9px] font-bold tracking-[0.12em] px-1.5 py-[3px] flex-shrink-0 w-[44px] text-center"
          style={{ background: sev.bg, color: sev.color }}
        >
          {sev.full}
        </span>

        {/* 항목명 */}
        <span className="font-kr text-[13px] font-medium text-ink flex-1 text-left leading-none">
          {result.title}
        </span>

        {/* 과태료 */}
        {showPenalty && (
          <span className="font-en text-[11px] text-[rgba(10,10,11,0.38)] flex-shrink-0 hidden sm:block tabular-nums">
            {result.penaltyRange}
          </span>
        )}

        {/* 상태 배지 */}
        <span className={`${stat.badgeClass} flex-shrink-0`}>
          {stat.icon}
          {stat.label}
        </span>

        {/* 토글 */}
        <span className="text-[rgba(10,10,11,0.28)] flex-shrink-0 ml-1">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* 확장 패널 */}
      {expanded && (
        <div
          className="pl-12 pr-4 pb-4 flex flex-col gap-3 border-t border-[rgba(10,10,11,0.06)]"
          style={{ background: stat.rowBg }}
        >
          {/* 감지 내역 */}
          <div className="pt-3">
            <p className="font-en text-[10px] font-semibold text-[rgba(10,10,11,0.32)] uppercase tracking-[0.1em] mb-1">
              감지 내역
            </p>
            <p className="font-kr text-[12px] text-[rgba(10,10,11,0.7)] leading-[1.65]">
              {result.detail}
            </p>
          </div>

          {/* 관련 법규 */}
          <div>
            <p className="font-en text-[10px] font-semibold text-[rgba(10,10,11,0.32)] uppercase tracking-[0.1em] mb-1">
              관련 법규
            </p>
            <p className="font-kr text-[12px] text-[rgba(10,10,11,0.5)]">{result.regulation}</p>
          </div>

          {/* 권고사항 */}
          {result.status !== 'pass' && (
            <div className="bg-white border border-[rgba(10,10,11,0.08)] px-3 py-2.5">
              <p className="font-en text-[10px] font-semibold text-[rgba(10,10,11,0.32)] uppercase tracking-[0.1em] mb-1">
                조치 권고
              </p>
              <p className="font-kr text-[12px] text-[rgba(10,10,11,0.7)] leading-[1.65]">
                {result.suggestion}
              </p>
            </div>
          )}

          {/* 과태료 범위 */}
          {showPenalty && (
            <div className="flex items-center gap-2">
              <span
                className="font-en text-[11px] px-2 py-[3px]"
                style={{
                  background: result.status === 'violation' ? '#FFE6E6' : '#FFF3DC',
                  color:      result.status === 'violation' ? '#B30000' : '#8A5A00',
                }}
              >
                {result.penaltyRange}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── 페이지 컴포넌트 ────────────────────────────────────────────────────────────

export default function ReviewResult() {
  const navigate  = useNavigate()
  const location  = useLocation()

  // 라우터 state 가드 — 직접 접근 시 홈으로
  const state = location.state as { ingredients: Ingredient[]; metadata: Metadata } | null
  if (!state?.ingredients || !state?.metadata) return <Navigate to="/" replace />

  const { ingredients, metadata } = state

  const results   = useMemo(() => analyzeRegulations(ingredients, metadata), [ingredients, metadata])
  const [filter,  setFilter]    = useState<StatusFilter>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const counts = {
    violation: results.filter(r => r.status === 'violation').length,
    warn:      results.filter(r => r.status === 'warn').length,
    pass:      results.filter(r => r.status === 'pass').length,
  }

  const level = riskLevel(counts.violation, counts.warn)

  const maxPenaltyMw = results
    .filter(r => r.status === 'violation' || r.status === 'warn')
    .reduce((sum, r) => sum + parseMaxPenaltyMw(r.penaltyRange), 0)

  const filterCounts: Record<StatusFilter, number> = {
    all: results.length, violation: counts.violation, warn: counts.warn, pass: counts.pass,
  }

  const filtered = filter === 'all' ? results : results.filter(r => r.status === filter)
  const toggle   = (id: string) => setExpanded(prev => (prev === id ? null : id))

  return (
    <div className="min-h-screen bg-white">

      {/* ── 네비게이션 ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-16 py-[18px] bg-white/80 backdrop-blur-[18px] border-b border-[rgba(10,10,11,0.08)]">
        <button
          onClick={() => navigate('/')}
          className="flex items-baseline gap-[5px] hover:opacity-70 transition-opacity"
        >
          <span style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} className="font-bold text-[15px] tracking-[0.04em] text-[#0A0A0B]">krk</span>
          <span className="font-en font-light text-[15px] tracking-[0.14em] text-[#0A0A0B]">check</span>
        </button>
        {/* 라우트 스텝 표시 */}
        <div className="hidden md:flex items-center gap-0 font-en text-[11px] tracking-[0.1em] uppercase">
          {[
            { label: '원재료 입력', done: true },
            { label: '법규 검토',   done: false, active: true },
            { label: '내보내기',    done: false },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-center">
              <div className={`flex items-center gap-2 ${s.active ? 'text-ink' : s.done ? 'text-breath-500' : 'text-[rgba(10,10,11,0.3)]'}`}>
                <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-semibold border ${
                  s.done   ? 'bg-breath-500 border-breath-500 text-white' :
                  s.active ? 'bg-ink border-ink text-white' :
                  'border-[rgba(10,10,11,0.2)]'}`}>
                  {s.done ? '✓' : i + 1}
                </span>
                <span>{s.label}</span>
              </div>
              {i < arr.length - 1 && <span className="mx-4 text-[rgba(10,10,11,0.2)]">—</span>}
            </div>
          ))}
        </div>
        <div className="font-en text-[11px] text-[rgba(10,10,11,0.35)] tracking-[0.08em]">MVP v1</div>
      </nav>

      {/* ── 본문 ─────────────────────────────────────────────────────────────── */}
      <main className="pt-[72px] min-h-screen flex flex-col">
        <div className="flex-1 max-w-[760px] mx-auto w-full px-6 md:px-0 py-12 md:py-16">

          {/* 섹션 헤더 */}
          <div className="mb-10 pb-5 border-b border-[rgba(10,10,11,0.1)]">
            <div className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.16em] mb-2">
              02 — 법규 검토
            </div>
            <h1 className="font-en font-medium text-[clamp(24px,3.5vw,36px)] tracking-[-0.02em] leading-[1.1]">
              {metadata.productName || '제품'}<br />법규 검토 결과
            </h1>
          </div>

          <div className="flex flex-col gap-8">

            {/* 리스크 요약 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-5 py-4 border"
                style={{ borderColor: level.color, borderLeftWidth: 4, background: level.color + '08' }}>
                <div>
                  <span className="font-en text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: level.color }}>
                    RISK LEVEL
                  </span>
                  <p className="font-kr font-semibold text-[20px] mt-0.5" style={{ color: level.color }}>{level.label}</p>
                </div>
                <div className="text-right">
                  <p className="font-en text-[11px] text-[rgba(10,10,11,0.4)] mb-0.5">검토 항목</p>
                  <p className="font-en font-bold text-[24px] text-ink tabular-nums">{results.length}개</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="border border-[#B30000] px-4 py-3.5 bg-[#FFE6E6]">
                  <div className="font-en font-bold text-[36px] text-[#B30000] leading-none tabular-nums">{counts.violation}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertTriangle size={11} className="text-[#B30000]" />
                    <span className="font-kr text-[12px] text-[rgba(10,10,11,0.65)]">위반</span>
                  </div>
                </div>
                <div className="border border-[#F0A500] px-4 py-3.5 bg-[#FFF3DC]">
                  <div className="font-en font-bold text-[36px] text-[#8A5A00] leading-none tabular-nums">{counts.warn}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertCircle size={11} className="text-[#8A5A00]" />
                    <span className="font-kr text-[12px] text-[rgba(10,10,11,0.65)]">경고</span>
                  </div>
                </div>
                <div className="border border-[#15803D] px-4 py-3.5 bg-[#F0FDF4]">
                  <div className="font-en font-bold text-[36px] text-[#15803D] leading-none tabular-nums">{counts.pass}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle2 size={11} className="text-[#15803D]" />
                    <span className="font-kr text-[12px] text-[rgba(10,10,11,0.65)]">통과</span>
                  </div>
                </div>
              </div>

              {maxPenaltyMw > 0 && (
                <div className="flex items-start gap-3 px-4 py-3 border border-[#B30000] bg-[#FFF8F8]" style={{ borderLeftWidth: 4 }}>
                  <AlertTriangle size={14} className="text-[#B30000] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-en font-semibold text-[13px] text-[#B30000]">
                      예상 최대 과태료 {maxPenaltyMw.toLocaleString()}만원
                    </span>
                    <p className="font-kr text-[12px] text-[rgba(10,10,11,0.5)] mt-0.5 leading-[1.6]">
                      위반·경고 항목 과태료 최대값 합산 기준 · 실제 처분은 위반 횟수·규모에 따라 다름
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 필터 탭 */}
            <div className="flex gap-0 border-b border-[rgba(10,10,11,0.1)]">
              {([
                { key: 'all'       as StatusFilter, label: '전체' },
                { key: 'violation' as StatusFilter, label: '위반' },
                { key: 'warn'      as StatusFilter, label: '경고' },
                { key: 'pass'      as StatusFilter, label: '통과' },
              ]).map(({ key, label }) => {
                const active = filter === key
                const dot = key === 'violation' ? '#B30000' : key === 'warn' ? '#F0A500' : key === 'pass' ? '#15803D' : undefined
                return (
                  <button key={key} onClick={() => setFilter(key)}
                    className={`flex items-center gap-2 font-en text-[11px] font-semibold tracking-[0.08em] px-4 py-2.5 uppercase transition-colors border-b-[2px] -mb-px ${
                      active ? 'text-ink border-ink' : 'text-[rgba(10,10,11,0.35)] border-transparent hover:text-[rgba(10,10,11,0.65)]'
                    }`}>
                    {dot && <span className="w-1.5 h-1.5 flex-shrink-0" style={{ background: active ? dot : 'rgba(10,10,11,0.2)', borderRadius: '50%' }} />}
                    {label}
                    <span className="font-normal opacity-55 ml-0.5">({filterCounts[key]})</span>
                  </button>
                )
              })}
            </div>

            {/* 법규 목록 */}
            <div className="border border-[rgba(10,10,11,0.1)] border-b-0">
              {filtered.length === 0
                ? <div className="flex items-center justify-center py-12">
                    <p className="font-kr text-[13px] text-[rgba(10,10,11,0.4)]">해당 항목이 없습니다.</p>
                  </div>
                : filtered.map(r => (
                    <RegulationRow key={r.id} result={r} expanded={expanded === r.id} onToggle={() => toggle(r.id)} />
                  ))
              }
            </div>

            {/* 하단 버튼 */}
            <div className="flex flex-col gap-3 pt-2">

              {/* Creator 연결 CTA */}
              <button
                onClick={() =>
                  navigate('/creator', {
                    state: { prefill: toCreatorPrefill(ingredients, metadata) },
                  })
                }
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Edit3 size={14} />
                Creator에서 라벨 수정하기
              </button>

              {/* Secondary 버튼 */}
              <div className="flex items-center justify-between">
                <button onClick={() => navigate('/', { replace: true })} className="btn-ghost flex items-center gap-2">
                  <RotateCcw size={14} />
                  홈으로
                </button>
                <button
                  onClick={() => navigate('/export', { state })}
                  className="btn-heritage flex items-center gap-2"
                >
                  <Share2 size={14} />
                  내보내기
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* 하단 면책 문구 */}
        <footer className="border-t border-[rgba(10,10,11,0.06)] px-6 py-5 text-center">
          <p className="font-en text-[11px] text-[rgba(10,10,11,0.3)] leading-[1.6]">
            krk.team이 제공하는 검토 결과 및 과태료 금액은 참고용 정보이며, 법적 효력이 없습니다.
            정확한 법규 해석은 관할 지자체 또는 식약처에 문의하세요.
          </p>
        </footer>
      </main>
    </div>
  )
}
