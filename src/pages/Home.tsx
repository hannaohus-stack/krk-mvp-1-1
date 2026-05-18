import { useNavigate } from 'react-router-dom'
import { ChevronRight, FileText } from 'lucide-react'

const FLOWS = [
  {
    path:        '/creator',
    icon:        <FileText size={22} strokeWidth={1.5} />,
    tag:         'Creator',
    title:       '라벨 만들기',
    description: '제품 정보·원재료·영양성분을 단계별로 입력해\n식품 라벨 초안을 완성하세요.',
    cta:         '라벨 초안 만들기',
    accent:      { border: 'border-heritage-500', icon: 'text-heritage-500', tag: 'bg-heritage-500', hover: 'hover:bg-heritage-500' },
  },
] as const

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── 네비게이션 ──────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-[18px] border-b border-[rgba(10,10,11,0.08)]">
        <div className="flex items-baseline gap-[5px]">
          <span style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} className="font-bold text-[15px] tracking-[0.04em] text-[#0A0A0B]">krk</span>
          <span className="font-en font-light text-[15px] tracking-[0.14em] text-[#0A0A0B]">check</span>
        </div>
        <div className="font-en text-[11px] text-[rgba(10,10,11,0.35)] tracking-[0.08em]">
          MVP v1
        </div>
      </nav>

      {/* ── 메인 ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">

        {/* 헤드라인 */}
        <div className="text-center mb-14">
          <div className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.2em] mb-4">
            Zero Risk, Pure Success.
          </div>
          <h1 className="font-en font-medium text-[clamp(28px,4vw,44px)] tracking-[-0.03em] leading-[1.1] text-ink">
            무엇을 도와드릴까요?
          </h1>
          <p className="font-kr text-[14px] text-[rgba(10,10,11,0.5)] mt-4 leading-[1.7]">
            식품 라벨을 처음 만들거나, 기존 라벨을 검수할 수 있습니다.
          </p>
        </div>

        {/* 플로우 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[680px]">
          {FLOWS.map(f => (
            <button
              key={f.path}
              onClick={() => navigate(f.path)}
              className={`group flex flex-col gap-0 border-2 ${f.accent.border} text-left
                transition-colors duration-150 ${f.accent.hover} hover:text-white overflow-hidden`}
            >
              {/* 태그 바 */}
              <div className={`${f.accent.tag} px-5 py-2.5 flex items-center justify-between`}>
                <span className="font-en text-[11px] font-bold tracking-[0.16em] uppercase text-white">
                  {f.tag}
                </span>
                <span className="text-white/70 group-hover:text-white transition-colors">
                  {f.icon}
                </span>
              </div>

              {/* 콘텐츠 */}
              <div className="px-5 py-6 flex flex-col gap-4 flex-1">
                <h2 className="font-kr font-semibold text-[22px] text-ink group-hover:text-white transition-colors leading-tight">
                  {f.title}
                </h2>
                <p className="font-kr text-[13px] text-[rgba(10,10,11,0.55)] group-hover:text-white/75 transition-colors leading-[1.7] whitespace-pre-line">
                  {f.description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-1.5 mt-auto pt-2">
                  <span className={`font-en text-[12px] font-semibold ${f.accent.icon} group-hover:text-white transition-colors tracking-[0.04em]`}>
                    {f.cta}
                  </span>
                  <ChevronRight
                    size={14}
                    className={`${f.accent.icon} group-hover:text-white transition-colors`}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 빠른 접근 링크 */}
        <div className="flex items-center gap-6 mt-10">
          {FLOWS.map(f => (
            <button
              key={f.path}
              onClick={() => navigate(f.path)}
              className="font-en text-[12px] text-[rgba(10,10,11,0.4)] hover:text-ink transition-colors tracking-[0.04em]"
            >
              → {f.tag}
            </button>
          ))}
        </div>

      </main>

      {/* ── 푸터 ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[rgba(10,10,11,0.06)] px-6 py-5 text-center">
        <p className="font-en text-[11px] text-[rgba(10,10,11,0.3)] leading-[1.6]">
          krk.team이 제공하는 결과는 참고용이며 법적 효력이 없습니다.
          최종 판단은 관할 지자체 또는 식약처에 문의하세요.
        </p>
      </footer>

    </div>
  )
}
