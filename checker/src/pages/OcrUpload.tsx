// src/pages/OcrUpload.tsx
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Camera, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useVisionOcr } from '../hooks/useVisionOcr'

export default function OcrUpload() {
  const navigate = useNavigate()
  const { status, progress, result, error, recognize, reset } = useVisionOcr()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    setPreview(url)
    recognize(file)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  const handleGoCreator = () => {
    if (!result) return
    navigate('/creator', {
      state: {
        prefill: {
          productName: result.productName || '',
          ingredients: result.ingredients,
        },
      },
    })
  }

  const handleRetry = () => {
    reset()
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 네비게이션 */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-[18px] border-b border-[rgba(10,10,11,0.08)]">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-en text-[12px] text-[rgba(10,10,11,0.4)] hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} /> Dashboard
        </button>
        <div className="flex items-baseline gap-[5px]">
          <span style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} className="font-bold text-[15px] tracking-[0.04em] text-[#0A0A0B]">krk</span>
          <span className="font-en font-light text-[15px] tracking-[0.14em] text-[#0A0A0B]">check</span>
        </div>
        <div className="font-en text-[11px] font-semibold tracking-[0.16em] text-[rgba(10,10,11,0.4)] uppercase">Checker</div>
      </nav>

      <main className="flex-1 max-w-[640px] mx-auto w-full px-6 md:px-0 py-12 flex flex-col gap-8">
        {/* 헤더 */}
        <div>
          <div className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.3)] uppercase tracking-[0.16em] mb-2">
            01 — 라벨 업로드
          </div>
          <h1 className="font-en font-medium text-[clamp(22px,3vw,32px)] tracking-[-0.02em] leading-[1.15]">
            원재료 라벨을<br />촬영하거나 업로드하세요.
          </h1>
        </div>

        {/* 업로드 영역 */}
        {status === 'idle' && (
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-[rgba(10,10,11,0.15)] hover:border-breath-500 transition-colors rounded-none p-10 flex flex-col items-center gap-4 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <div className="w-14 h-14 bg-breath-50 flex items-center justify-center">
              <Upload size={24} className="text-breath-500" />
            </div>
            <div className="text-center">
              <p className="font-kr font-medium text-[15px] text-ink mb-1">이미지를 드래그하거나 클릭해서 업로드</p>
              <p className="font-kr text-[12px] text-[rgba(10,10,11,0.4)]">JPG, PNG, HEIC 지원 · 최대 10MB</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 bg-ink text-white font-en text-[12px] font-semibold tracking-[0.08em] px-5 py-2.5 hover:bg-[#222] transition-colors"
              onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
            >
              <Camera size={14} /> 카메라 / 파일 선택
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        )}

        {/* OCR 진행 중 */}
        {(status === 'loading' || preview) && status !== 'done' && status !== 'error' && (
          <div className="flex flex-col gap-6">
            {preview && (
              <div className="border border-[rgba(10,10,11,0.1)] overflow-hidden max-h-64">
                <img src={preview} alt="업로드된 라벨" className="w-full h-full object-contain" />
              </div>
            )}
            {status === 'loading' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-kr text-[13px] text-ink">텍스트 인식 중...</span>
                  <span className="font-en text-[13px] font-semibold text-breath-500 tabular-nums">{progress}%</span>
                </div>
                <div className="h-1 bg-[rgba(10,10,11,0.08)] w-full">
                  <div
                    className="h-1 bg-breath-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="font-kr text-[12px] text-[rgba(10,10,11,0.4)]">
                  한글+영문 모델 로딩 중입니다. 처음 실행 시 30~60초 소요될 수 있어요.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 완료 */}
        {status === 'done' && result && (
          <div className="flex flex-col gap-6">
            {preview && (
              <div className="border border-[rgba(10,10,11,0.1)] overflow-hidden max-h-48">
                <img src={preview} alt="업로드된 라벨" className="w-full h-full object-contain" />
              </div>
            )}

            <div className="border border-[rgba(10,10,11,0.1)] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                <span className="font-kr font-semibold text-[14px] text-ink">인식 완료</span>
              </div>

              {result.ingredients.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.35)] uppercase tracking-[0.12em]">
                    감지된 원재료 ({result.ingredients.length}개)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.ingredients.map(ing => (
                      <span
                        key={ing.id}
                        className="font-kr text-[12px] bg-breath-50 text-breath-500 px-2.5 py-1"
                      >
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="font-kr text-[13px] text-[rgba(10,10,11,0.5)]">
                  원재료를 인식하지 못했습니다. 더 선명한 이미지로 다시 시도해보세요.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 border border-[rgba(10,10,11,0.2)] font-kr font-medium text-[13px] py-3 hover:bg-[rgba(10,10,11,0.04)] transition-colors"
              >
                다시 촬영
              </button>
              <button
                onClick={handleGoCreator}
                disabled={result.ingredients.length === 0}
                className="flex-1 bg-ink text-white font-kr font-semibold text-[13px] py-3 hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                라벨 만들기 →
              </button>
            </div>
          </div>
        )}

        {/* 에러 */}
        {status === 'error' && (
          <div className="flex flex-col gap-4">
            <div className="border border-red-200 bg-red-50 p-5 flex items-start gap-3">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-kr font-semibold text-[13px] text-red-700 mb-1">인식 실패</p>
                <p className="font-kr text-[12px] text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="border border-[rgba(10,10,11,0.2)] font-kr font-medium text-[13px] py-3 hover:bg-[rgba(10,10,11,0.04)] transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 안내 */}
        {status === 'idle' && (
          <div className="border-t border-[rgba(10,10,11,0.06)] pt-6">
            <p className="font-en text-[11px] font-semibold text-[rgba(10,10,11,0.3)] uppercase tracking-[0.12em] mb-3">촬영 팁</p>
            <ul className="flex flex-col gap-2">
              {['라벨 전체가 프레임에 들어오도록 촬영', '충분한 조명 아래에서 촬영', '흔들림 없이 수평으로 촬영', '원재료명 섹션이 선명하게 보여야 정확도가 높아요'].map(tip => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="font-en text-[10px] text-breath-500 mt-[3px]">—</span>
                  <span className="font-kr text-[12px] text-[rgba(10,10,11,0.5)]">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
