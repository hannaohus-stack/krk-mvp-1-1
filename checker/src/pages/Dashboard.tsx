import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, ChevronRight, Clock, Inbox } from 'lucide-react'

// ─── 로컬스토리지 타입 및 유틸 ────────────────────────────────────────────────

interface WorkRecord {
  id: string
  type: 'checker' | 'creator'
  startedAt: string  // ISO datetime
}

const STORAGE_KEY = 'krk_work_history'

function loadHistory(): WorkRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function addRecord(type: WorkRecord['type']): WorkRecord[] {
  const record: WorkRecord = {
    id:        crypto.randomUUID(),
    type,
    startedAt: new Date().toISOString(),
  }
  const updated = [record, ...loadHistory()].slice(0, 30)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

function monthlyCount(history: WorkRecord[]): number {
  const ym = new Date().toISOString().slice(0, 7)  // 'YYYY-MM'
  return history.filter(r => r.startedAt.startsWith(ym)).length
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return '방금 전'
  if (diff < 3600)  return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  const days = Math.floor(diff / 86400)
  if (days === 1)   return '어제'
  if (days < 7)     return `${days}일 전`
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const KO_MONTH: Record<number, string> = {
  1:'1월',2:'2월',3:'3월',4:'4월',5:'5월',6:'6월',
  7:'7월',8:'8월',9:'9월',10:'10월',11:'11월',12:'12월',
}

// ─── 서브 컴포넌트 ─────────────────────────────────────────────────────────────

function ActionCard({
  type,
  onClick,
}: {
  type: 'checker' | 'creator'
  onClick: () => void
}) {
  const isChecker = type === 'checker'

  const cfg = isChecker
    ? {
        tag:   'Checker',
        title: '라벨 검수하기',
        desc:  '원재료 사진을 업로드해\n식약처 법규 리스크를 분석합니다.',
        icon:  <Search size={20} strokeWidth={1.5} />,
        tagBg: 'bg-breath-500',
        border:'border-breath-500',
        hover: 'hover:bg-breath-500',
      }
    : {
        tag:   'Creator',
        title: '라벨 만들기',
        desc:  '제품 정보, 원재료, 영양성분을\n입력해 라벨 초안을 생성합니다.',
        icon:  <FileText size={20} strokeWidth={1.5} />,
        tagBg: 'bg-heritage-500',
        border:'border-heritage-500',
        hover: 'hover:bg-heritage-500',
      }

  return (
    <button
      onClick={onClick}
      className={`group flex flex-col border-2 ${cfg.border} text-left
        transition-colors duration-150 ${cfg.hover} hover:text-white overflow-hidden`}
    >
      {/* 태그 */}
      <div className={`${cfg.tagBg} px-4 py-2.5 flex items-center justify-between`}>
        <span className="font-en text-[11px] font-bold tracking-[0.14em] uppercase text-white">
          {cfg.tag}
        </span>
        <span className="text-white/60 group-hover:text-white transition-colors">
          {cfg.icon}
        </span>
      </div>

      {/* 내용 */}
      <div className="px-4 py-5 flex flex-col gap-3">
        <h2 className="font-kr font-semibold text-[18px] text-ink group-hover:text-white transition-colors leading-tight">
          {cfg.title}
        </h2>
        <p className="font-kr text-[12px] text-[rgba(10,10,11,0.5)] group-hover:text-white/70 transition-colors leading-[1.7] whitespace-pre-line">
          {cfg.desc}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <span className={`font-en text-[11px] font-semibold ${isChecker ? 'text-breath-500' : 'text-heritage-500'} group-hover:text-white transition-colors tracking-[0.04em]`}>
            시작하기
          </span>
          <ChevronRight size={13} className={`${isChecker ? 'text-breath-500' : 'text-heritage-500'} group-hover:text-white transition-colors`} />
        </div>
      </div>
    </button>
  )
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<WorkRecord[]>(loadHistory)

  const now         = new Date()
  const thisMonth   = KO_MONTH[now.getMonth() + 1]
  const usedCount   = monthlyCount(history)
  const totalCount  = history.length
  const recent      = history.slice(0, 5)

  const handleGo = (type: WorkRecord['type'] = 'creator') => {
    setHistory(addRecord(type))
    navigate(type === 'checker' ? '/checker' : '/creator')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── 네비게이션 ────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-[18px] border-b border-[rgba(10,10,11,0.08)]">
        <div className="flex items-baseline gap-[5px]">
          <span style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} className="font-bold text-[15px] tracking-[0.04em] text-[#0A0A0B]">krk</span>
          <span className="font-en font-light text-[15px] tracking-[0.14em] text-[#0A0A0B]">check</span>
        </div>
        <div className="font-en text-[11px] font-semibold tracking-[0.16em] text-[rgba(10,10,11,0.4)] uppercase">
          Dashboard
        </div>
        <div className="font-en text-[11px] text-[rgba(10,10,11,0.35)] tracking-[0.08em]">
          MVP v1
        </div>
      </nav>

      {/* ── 본문 ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-[760px] mx-auto w-full px-6 md:px-0 py-12 md:py-16 flex flex-col gap-12">

        {/* ── 인사말 + 액션 카드 ─────────────────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <div>
            <div className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.3)] uppercase tracking-[0.16em] mb-2">
              무엇을 도와드릴까요?
            </div>
            <h1 className="font-en font-medium text-[clamp(24px,3.5vw,36px)] tracking-[-0.02em] leading-[1.1]">
              안전한 라벨을<br />만들어봐요.
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard type="checker" onClick={() => { setHistory(addRecord('checker')); navigate('/checker') }} />
            <ActionCard type="creator" onClick={() => handleGo('creator')} />
          </div>
        </section>

        {/* ── 이번 달 사용 통계 ──────────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <div className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.16em]">
            이용 현황
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 이번 달 */}
            <div className="border border-[rgba(10,10,11,0.1)] px-5 py-4">
              <div className="font-en text-[10px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.1em] mb-2">
                {thisMonth} 사용 횟수
              </div>
              <div className="font-en font-bold text-[36px] text-ink leading-none tabular-nums">
                {usedCount}
                <span className="font-kr text-[14px] font-normal text-[rgba(10,10,11,0.45)] ml-1">회</span>
              </div>
            </div>

            {/* 전체 */}
            <div className="border border-[rgba(10,10,11,0.1)] px-5 py-4">
              <div className="font-en text-[10px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.1em] mb-2">
                전체 작업 수
              </div>
              <div className="font-en font-bold text-[36px] text-ink leading-none tabular-nums">
                {totalCount}
                <span className="font-kr text-[14px] font-normal text-[rgba(10,10,11,0.45)] ml-1">건</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 최근 작업 목록 ─────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.16em]">
              최근 작업
            </div>
            {history.length > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY)
                  setHistory([])
                }}
                className="font-en text-[10px] text-[rgba(10,10,11,0.3)] hover:text-[#B30000] transition-colors tracking-[0.04em]"
              >
                기록 삭제
              </button>
            )}
          </div>

          <div className="border border-[rgba(10,10,11,0.1)] border-b-0">
            {recent.length === 0 ? (
              /* 빈 상태 */
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <Inbox size={28} className="text-[rgba(10,10,11,0.2)]" />
                <p className="font-kr text-[13px] text-[rgba(10,10,11,0.35)]">
                  아직 작업 기록이 없습니다.
                </p>
                <p className="font-kr text-[12px] text-[rgba(10,10,11,0.25)]">
                  위 버튼을 눌러 시작해보세요.
                </p>
              </div>
            ) : (
              recent.map((r, idx) => {
                const isChecker = r.type === 'checker'
                return (
                  <div
                    key={r.id}
                    className={`flex items-center gap-4 px-4 py-3.5 border-b border-[rgba(10,10,11,0.08)] ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[rgba(10,10,11,0.01)]'
                    }`}
                  >
                    {/* 타입 아이콘 */}
                    <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                      isChecker ? 'bg-breath-50 text-breath-500' : 'bg-heritage-500/10 text-heritage-500'
                    }`}>
                      {isChecker
                        ? <Search size={14} />
                        : <FileText size={14} />}
                    </div>

                    {/* 작업 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-kr text-[13px] font-medium text-ink">
                        {isChecker ? '라벨 검수' : '라벨 제작'}
                      </div>
                      <div className="font-en text-[11px] text-[rgba(10,10,11,0.35)] tracking-[0.04em] uppercase">
                        {r.type}
                      </div>
                    </div>

                    {/* 시간 */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Clock size={11} className="text-[rgba(10,10,11,0.3)]" />
                      <span className="font-en text-[11px] text-[rgba(10,10,11,0.4)] tabular-nums">
                        {timeAgo(r.startedAt)}
                      </span>
                    </div>

                    {/* 다시 시작 */}
                    <button
                      onClick={() => handleGo(r.type)}
                      className="flex items-center gap-0.5 font-en text-[11px] font-semibold text-[rgba(10,10,11,0.3)] hover:text-ink transition-colors flex-shrink-0"
                    >
                      다시 시작
                      <ChevronRight size={12} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </section>

      </main>

      {/* ── 푸터 ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[rgba(10,10,11,0.06)] px-6 py-5 text-center">
        <p className="font-en text-[11px] text-[rgba(10,10,11,0.3)] leading-[1.6]">
          krk.team이 제공하는 결과는 참고용이며 법적 효력이 없습니다.
          최종 판단은 관할 지자체 또는 식약처에 문의하세요.
        </p>
      </footer>

    </div>
  )
}
