/**
 * Dashboard — krk check v2
 * /  경로 (ProtectedRoute 필요 — Sprint 3 Auth 구현 후 적용)
 *
 * Supabase: label_reviews 테이블 + localStorage draft 조회
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight, X, AlertTriangle,
  Building2, FileText, Copy, LogOut,
} from 'lucide-react'
import LogoLockup from '../components/LogoLockup'
import { fetchDashboardReviews, supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'

interface Draft {
  id: string
  productName: string
  categories: string[]
  step: number          // 1~4
  lastEditedAt: string
}

interface WorkRecord {
  id: string
  productName: string
  categories: string[]
  tier: 'SA' | 'B' | 'mixed'
  amount: number
  createdAt: string
  needsReview?: boolean  // 규정 업데이트로 재검토 권장
}

const CREATOR_DRAFT_KEY = 'krk_creator_draft_v1'

function readLocalDrafts(): Draft[] {
  try {
    const raw = localStorage.getItem(CREATOR_DRAFT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as {
      step?: number
      savedAt?: string
      data?: { productName?: string; categories?: string[] }
    }
    if (!parsed.data?.productName && !parsed.data?.categories?.length) return []
    return [{
      id: CREATOR_DRAFT_KEY,
      productName: parsed.data.productName || '이름 없는 제품',
      categories: parsed.data.categories ?? [],
      step: Math.min(Math.max(Math.round(parsed.step ?? 1), 1), 4),
      lastEditedAt: parsed.savedAt ?? new Date().toISOString(),
    }]
  } catch {
    return []
  }
}

function normalizeTier(tier: WorkRecord['tier'] | string | null | undefined): WorkRecord['tier'] {
  if (tier === 'tier1' || tier === 'B') return 'B'
  if (tier === 'tier2' || tier === 'SA') return 'SA'
  return 'mixed'
}

// ─── 서브 컴포넌트 ─────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: 'SA' | 'B' | 'mixed' }) {
  return tier === 'B'
    ? <span className="badge-warn text-[10px]">베타</span>
    : <span className="badge-ok  text-[10px]">정식</span>
}

function CategoryChips({ categories }: { categories: string[] }) {
  const shown = categories.slice(0, 2)
  const rest  = categories.length - 2
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {shown.map(c => (
        <span key={c} className="badge-neutral text-[10px]">{c}</span>
      ))}
      {rest > 0 && <span className="badge-neutral text-[10px]">+{rest}</span>}
    </div>
  )
}

function StatCard({ label, value, loading }: { label: string; value: number; loading?: boolean }) {
  return (
    <div className="bg-white border border-[rgba(10,10,11,0.1)] px-5 py-4">
      <div className="font-en text-[10px] font-semibold text-[rgba(10,10,11,0.4)] uppercase tracking-[0.1em] mb-2">
        {label}
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-[rgba(10,10,11,0.08)] animate-pulse" />
      ) : (
        <div className="font-en font-semibold text-[30px] text-ink leading-none tabular-nums">
          {value}
        </div>
      )}
    </div>
  )
}

function DraftCard({ draft }: { draft: Draft }) {
  const navigate = useNavigate()
  const pct = (draft.step / 4) * 100

  return (
    <div className="bg-white border border-[rgba(10,10,11,0.1)] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-kr font-semibold text-[14px] text-ink">{draft.productName}</p>
          <CategoryChips categories={draft.categories} />
        </div>
        <span className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.4)] flex-shrink-0">
          STEP {draft.step}/4
        </span>
      </div>
      {/* 진행률 바 */}
      <div className="h-1 bg-[rgba(10,10,11,0.08)]">
        <div className="h-full bg-heritage-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-en text-[11px] text-[rgba(10,10,11,0.4)]">
          {new Date(draft.lastEditedAt).toLocaleDateString('ko-KR')}
        </span>
        <button
          onClick={() => navigate('/creator')}
          className="flex items-center gap-1 font-en text-[12px] font-semibold text-heritage-500 hover:text-heritage-600 transition-colors"
        >
          이어서 작성 <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}

// ─── 메인 페이지 ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [noticeDismissed, setNoticeDismissed] = useState(false)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [works, setWorks] = useState<WorkRecord[]>([])
  const [loading, setLoading] = useState(true)

  const userEmail = session?.user?.email ?? 'user@example.com'

  useEffect(() => {
    let mounted = true
    setDrafts(readLocalDrafts())
    ;(async () => {
      const rows = await fetchDashboardReviews()
      if (!mounted) return
      const mapped = rows.map(row => ({
        id: row.id,
        productName: row.product_name || '이름 없는 제품',
        categories: row.categories ?? [],
        tier: normalizeTier(row.tier),
        amount: row.amount ?? 0,
        createdAt: row.created_at ?? new Date().toISOString(),
      }))
      setWorks(mapped)
      setLoading(false)
    })()

    const onStorage = () => setDrafts(readLocalDrafts())
    window.addEventListener('storage', onStorage)
    return () => {
      mounted = false
      window.removeEventListener('storage', onStorage)
    }
  }, [session?.user?.id])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }
  const showNotice = !noticeDismissed  // 실제로는 서버 플래그로 제어
  const showSetup  = false             // businessType 등록 여부 (Sprint 3)
  const now = new Date()
  const stats = {
    thisMonth: works.filter(work => {
      const created = new Date(work.createdAt)
      return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
    }).length,
    total: works.length,
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5]">

      {/* ── Nav (frosted glass) ──────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b border-[rgba(10,10,11,0.12)]"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: 'blur(18px) saturate(160%)',
        }}
      >
        <div className="max-w-[1100px] mx-auto px-6 md:px-8 py-[18px] flex items-center justify-between">
          {/* 로고 */}
          <button
            onClick={() => navigate('/')}
            className="flex items-baseline gap-[3px] hover:opacity-70 transition-opacity"
          >
            <LogoLockup />
          </button>

          {/* 중앙 레이블 (데스크탑) */}
          <span className="hidden md:block font-en text-[11px] font-semibold tracking-[0.16em] text-[rgba(10,10,11,0.4)] uppercase">
            Dashboard
          </span>

          {/* 유저 + 로그아웃 */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block font-en text-[12px] text-[rgba(10,10,11,0.5)]">
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="btn-ghost h-8 px-3 flex items-center gap-1.5 text-[12px]"
            >
              <LogOut size={13} />
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <main className="max-w-[1100px] mx-auto px-6 md:px-8 py-10 flex flex-col gap-8">

        {/* ── Regulation Notice 배너 (조건부) ────────────────────────────────── */}
        {showNotice && (
          <div className="flex items-start gap-4 px-5 py-4 bg-[rgba(176,122,26,0.06)] border-l-[3px] border-[#B07A1A] border border-[#B07A1A]/20">
            <AlertTriangle size={16} className="text-[#B07A1A] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-en text-[10px] font-semibold text-[#B07A1A] uppercase tracking-[0.12em] mb-0.5">
                식약처 규정 업데이트 · NOTICE
              </div>
              <p className="font-kr text-[13px] text-[rgba(10,10,11,0.7)] leading-[1.55]">
                식품등의 표시기준 일부 개정이 있었습니다. 기존 작업물을 재검토하세요.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <button className="font-en text-[12px] font-semibold text-[#B07A1A] underline">자세히 보기</button>
                <button className="font-en text-[12px] text-[rgba(10,10,11,0.4)] underline" onClick={() => setNoticeDismissed(true)}>다음에 보기</button>
              </div>
            </div>
            <button onClick={() => setNoticeDismissed(true)} className="text-[rgba(10,10,11,0.35)] hover:text-ink transition-colors flex-shrink-0">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Hero 섹션 ────────────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <div>
            <p className="font-kr text-[12px] text-[rgba(10,10,11,0.45)] mb-2">무엇을 도와드릴까요?</p>
            <h1 className="gradient-text font-kr font-semibold text-[clamp(22px,3vw,28px)] tracking-[-0.018em] leading-[1.2]">
              안전한 라벨을 만들어봐요.
            </h1>
          </div>

          {/* Creator 카드 */}
          <button
            onClick={() => navigate('/creator')}
            className="group flex items-center gap-4 bg-white border border-[rgba(10,10,11,0.1)] px-5 py-4 text-left
              hover:border-heritage-500 transition-colors"
            style={{ borderLeft: '3px solid #002D72' }}
          >
            <div className="flex-1">
              <div className="font-en text-[10px] font-semibold text-[rgba(10,10,11,0.4)] uppercase tracking-[0.12em] mb-1">
                Creator
              </div>
              <p className="font-kr font-semibold text-[15px] text-ink">라벨 만들기</p>
              <p className="font-kr text-[12px] text-[rgba(10,10,11,0.5)] mt-0.5 leading-[1.5]">
                제품 정보를 입력하고 식품 라벨 초안과 검토 리포트를 받으세요.
              </p>
            </div>
            <ChevronRight size={18} className="text-[rgba(10,10,11,0.3)] group-hover:text-heritage-500 transition-colors flex-shrink-0" />
          </button>
        </section>

        {/* ── Business Setup 배너 (조건부) ────────────────────────────────────── */}
        {showSetup && (
          <div className="flex items-center justify-between gap-4 px-5 py-4 bg-white border-l-[3px] border-heritage-500 border border-[rgba(10,10,11,0.1)]">
            <div className="flex items-center gap-3">
              <Building2 size={16} className="text-heritage-500 flex-shrink-0" />
              <div>
                <div className="font-en text-[10px] font-semibold text-heritage-500 uppercase tracking-[0.12em] mb-0.5">Setup</div>
                <p className="font-kr text-[13px] text-ink">사업자 정보를 등록해 두세요</p>
              </div>
            </div>
            <button className="btn-heritage text-[12px] flex-shrink-0">등록하기</button>
          </div>
        )}

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <section>
          <h2 className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.4)] uppercase tracking-[0.12em] mb-3">
            이용 현황
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="이번 달 작업 수" value={stats.thisMonth} loading={loading} />
            <StatCard label="전체 작업 수"    value={stats.total} loading={loading} />
          </div>
        </section>

        {/* ── Drafts 섹션 (조건부) ─────────────────────────────────────────── */}
        {drafts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.4)] uppercase tracking-[0.12em]">
                임시저장 · Drafts
                <span className="ml-2 text-heritage-500">{drafts.length}</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {drafts.map(d => <DraftCard key={d.id} draft={d} />)}
            </div>
          </section>
        )}

        {/* ── Recent Works 테이블 ──────────────────────────────────────────── */}
        <section>
          <h2 className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.4)] uppercase tracking-[0.12em] mb-3">
            최근 작업 · Recent Works
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 border-2 border-dashed border-[rgba(10,10,11,0.12)] bg-white">
              <div className="h-7 w-7 rounded-full border-2 border-[rgba(10,10,11,0.15)] border-t-heritage-500 animate-spin" />
              <p className="font-kr text-[13px] text-[rgba(10,10,11,0.35)]">작업 기록을 불러오는 중입니다.</p>
            </div>
          ) : works.length === 0 ? (
            /* 빈 상태 */
            <div className="flex flex-col items-center justify-center py-14 gap-3 border-2 border-dashed border-[rgba(10,10,11,0.12)] bg-white">
              <FileText size={28} className="text-[rgba(10,10,11,0.2)]" />
              <p className="font-kr text-[13px] text-[rgba(10,10,11,0.35)]">아직 완료된 작업이 없습니다.</p>
              <button onClick={() => navigate('/creator')} className="btn-primary text-[12px]">
                첫 번째 라벨 만들기
              </button>
            </div>
          ) : (
            <>
              {/* 데스크탑 테이블 */}
              <div className="hidden md:block bg-white border border-[rgba(10,10,11,0.1)] overflow-hidden">
                {/* 헤더 */}
                <div className="grid gap-0 border-b border-[rgba(10,10,11,0.1)]"
                  style={{ gridTemplateColumns: '1fr 180px 80px 110px 170px', background: '#F5F5F5' }}>
                  {['제품명', '카테고리', '등급', '완료 날짜', ''].map(h => (
                    <div key={h} className="px-4 py-2.5 font-en text-[10px] font-semibold text-[rgba(10,10,11,0.5)] uppercase tracking-[0.1em]">
                      {h}
                    </div>
                  ))}
                </div>
                {/* 행 */}
                {works.map((w) => (
                  <div key={w.id}
                    className="grid items-center border-b border-[rgba(10,10,11,0.07)] transition-colors hover:bg-[rgba(10,10,11,0.025)]"
                    style={{ gridTemplateColumns: '1fr 180px 80px 110px 170px' }}>
                    <div className="px-4 py-3 flex items-center gap-2">
                      {w.needsReview && (
                        <span className="badge-warn text-[10px]">재검토 권장</span>
                      )}
                      <span className="font-kr text-[13px] font-medium text-ink">{w.productName}</span>
                    </div>
                    <div className="px-4 py-3"><CategoryChips categories={w.categories} /></div>
                    <div className="px-4 py-3"><TierBadge tier={w.tier} /></div>
                    <div className="px-4 py-3 font-en text-[12px] text-[rgba(10,10,11,0.5)]">
                      {new Date(w.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="px-4 py-3 flex items-center gap-2">
                      <button className="btn-ghost text-[11px] h-8 px-3 flex items-center gap-1">
                        <Copy size={11} /> 복제
                      </button>
                      <button className="btn-ghost text-[11px] h-8 px-3 flex items-center gap-1">
                        <FileText size={11} /> PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 모바일 카드 */}
              <div className="md:hidden flex flex-col gap-2">
                {works.map(w => (
                  <div key={w.id} className="bg-white border border-[rgba(10,10,11,0.1)] px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-kr font-semibold text-[14px] text-ink">{w.productName}</span>
                      <span className="font-en text-[11px] text-[rgba(10,10,11,0.4)] flex-shrink-0">
                        {new Date(w.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CategoryChips categories={w.categories} />
                        <TierBadge tier={w.tier} />
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center text-[rgba(10,10,11,0.4)] hover:text-ink">
                          <Copy size={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-[rgba(10,10,11,0.4)] hover:text-ink">
                          <FileText size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

      </main>

      {/* ── 푸터 ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[rgba(10,10,11,0.08)] px-6 py-5 text-center">
        <p className="font-en text-[11px] text-[rgba(10,10,11,0.3)] leading-[1.6]">
          krk.team이 제공하는 결과는 참고용이며 법적 효력이 없습니다.
        </p>
      </footer>

    </div>
  )
}
