import { useEffect, useState } from 'react'
import type React from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ClipboardList, Copy,
  Download, FileArchive, FileText, Home, ReceiptText, Recycle, RotateCcw, Tag,
} from 'lucide-react'
import LogoLockup from '../components/LogoLockup'
import type { Ingredient } from '../utils/parsing'
import { analyzeRegulations, type Metadata } from './ReviewResult'
import type { CreatorData } from './creator/types'
import type { ServiceTier } from '../utils/tierUtils'
import { recordLabelReview, recordPayment } from '../lib/supabase'
import { createCertPDFArtifact, generateCertPDF } from '../utils/generateCertPDF'
import { createLabelPDFArtifact, generateLabelPDF } from '../utils/generateLabelPDF'
import { createReportPDFArtifact, generateReportPDF } from '../utils/generateReportPDF'
import { createProGuidePDFArtifact, generateProGuidePDF } from '../utils/generateProGuidePDF'

type ServiceType = 'basic' | 'pro'

const SERVICES: Record<ServiceType, {
  name: string
  price: number
  badge: string
  files: { id: string; name: string; use: string; icon: React.ReactNode; proOnly?: boolean }[]
  copyItems: string[]
}> = {
  basic: {
    name: '기본 라벨 패키지',
    price: 9900,
    badge: '기본',
    files: [
      { id: 'label-pdf', name: '라벨 PDF', use: '인쇄용 · A4', icon: <Tag size={16} /> },
      { id: 'label-png', name: '라벨 PNG', use: '웹 · 스마트스토어 / 3000x3000', icon: <FileArchive size={16} /> },
    ],
    copyItems: ['원재료명 · 함량', '알레르기 유발물질', '제품명 · 영문'],
  },
  pro: {
    name: '전문 수정 가이드 PDF',
    price: 19900,
    badge: '전문',
    files: [
      { id: 'pro-guide', name: '전문 수정 가이드 PDF', use: '항목별 수정 방법 · 권장 문구', icon: <FileText size={16} /> },
      { id: 'label-pdf', name: '라벨 PDF', use: '인쇄용 · A4', icon: <Tag size={16} /> },
      { id: 'label-png', name: '라벨 PNG', use: '웹 · 스마트스토어', icon: <FileArchive size={16} /> },
      { id: 'report-guide', name: '신고 입력 가이드', use: '정부24 참고용', icon: <ClipboardList size={16} /> },
      { id: 'review-report', name: 'krk 라벨 검토 리포트', use: '자율 점검 기록', icon: <FileText size={16} /> },
      { id: 'recycling', name: '분리배출 마크 ZIP', use: '환경부 공식 도안', icon: <Recycle size={16} /> },
    ],
    copyItems: ['원재료명 · 함량', '알레르기 유발물질', '식품유형', '제품명 · 영문'],
  },
}

const RECYCLING_FILE_MAP: Record<string, string> = {
  '페트(PET)': '/recycling/plastic-pet.svg',
  '고밀도 폴리에틸렌(HDPE)': '/recycling/plastic-pe.svg',
  '폴리염화비닐(PVC)': '/recycling/plastic-pe.svg',
  '저밀도 폴리에틸렌(LDPE)': '/recycling/plastic-pe.svg',
  '폴리프로필렌(PP)': '/recycling/plastic-pp.svg',
  '폴리스티렌(PS)': '/recycling/plastic-ps.svg',
  '기타 플라스틱': '/recycling/plastic-pe.svg',
  '유리': '/recycling/glass.svg',
  '철': '/recycling/can-steel.svg',
  '알루미늄': '/recycling/can-aluminum.svg',
  '종이팩': '/recycling/paper.svg',
  '골판지': '/recycling/paper.svg',
  '일반 종이': '/recycling/paper.svg',
  '비닐류': '/recycling/vinyl.svg',
  '스티로폼': '/recycling/plastic-ps.svg',
}

const fmtKRW = (value: number) => value.toLocaleString('ko-KR')
const serviceToTier = (service: ServiceType): ServiceTier => service === 'basic' ? 'tier1' : 'tier2'
const tierToService = (tier?: ServiceTier): ServiceType => tier === 'tier1' ? 'basic' : 'pro'

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5_000)
}

function safeFilenamePart(value: string): string {
  return (value || 'product').replace(/[\s/\\]/g, '_')
}

function createLabelPngBlob(data: CreatorData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const size = 3000
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas를 생성할 수 없습니다.'))
      return
    }

    const nutritionText = data.nutritionExempted
      ? '영양표시 면제 가능(영양강조표시 사용 시 의무 발생 가능)'
      : [
          data.calories && `열량 ${data.calories}kcal`,
          data.totalCarbs && `탄수화물 ${data.totalCarbs}g`,
          data.sugar && `당류 ${data.sugar}g`,
          data.totalFat && `지방 ${data.totalFat}g`,
          data.saturatedFat && `포화지방 ${data.saturatedFat}g`,
          data.transFat && `트랜스지방 ${data.transFat}g`,
          data.cholesterol && `콜레스테롤 ${data.cholesterol}mg`,
          data.protein && `단백질 ${data.protein}g`,
          data.sodium && `나트륨 ${data.sodium}mg`,
        ].filter(Boolean).join(' · ') || '—'
    const allergenList = Array.from(new Set([
      ...data.ingredients.filter(item => item.isAllergen).map(item => item.name),
      ...data.detectedAllergens.map(item => item.name),
    ]))
    const sharedAllergenNotice = data.facilityType === '공유' && data.sharedFacilityAllergens.length > 0
      ? `이 제품은 ${data.sharedFacilityAllergens.join(', ')}을 사용한 제품과 같은 제조시설에서 제조하고 있습니다.`
      : ''
    const totalIngredientWeight = data.ingredients.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0)
    const ingredientText = data.ingredients
      .slice()
      .sort((a, b) => (parseFloat(b.weight) || 0) - (parseFloat(a.weight) || 0))
      .map(item => {
        const pct = totalIngredientWeight > 0 && item.weight
          ? ` ${((parseFloat(item.weight) || 0) / totalIngredientWeight * 100).toFixed(1)}%`
          : item.weight
          ? ` ${item.weight}g`
          : ''
        const origin = item.origin ? `(${item.origin})` : '(원산지 입력 필요)'
        return `${item.name}${origin}${pct}`
      })
      .join(', ') || '원재료명 및 함량'
    const packagingText = (data.packagingMaterials ?? []).join(', ') || '포장재질 입력 필요'

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, size, size)
    ctx.strokeStyle = '#0A0A0B'
    ctx.lineWidth = 10
    ctx.strokeRect(180, 180, size - 360, size - 360)

    ctx.fillStyle = '#002D72'
    ctx.fillRect(180, 180, size - 360, 260)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '700 72px system-ui, sans-serif'
    ctx.fillText('KRK CHECKER', 260, 340)

    ctx.fillStyle = '#0A0A0B'
    ctx.font = '700 170px system-ui, sans-serif'
    wrapCanvasText(ctx, data.productName || '제품명', 260, 710, size - 520, 190, 2)

    ctx.font = '500 68px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(10,10,11,0.62)'
    ctx.fillText(`내용량 ${data.totalWeight || '-'}${data.unit || ''}`, 260, 1160)

    ctx.font = '500 52px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(10,10,11,0.52)'
    ctx.fillText((data.categories ?? []).join(' · ') || '식품 유형', 260, 1265)

    ctx.strokeStyle = 'rgba(10,10,11,0.18)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(260, 1385)
    ctx.lineTo(size - 260, 1385)
    ctx.stroke()

    const drawBlock = (label: string, value: string, x: number, y: number, width: number, maxLines = 2) => {
      ctx.fillStyle = 'rgba(10,10,11,0.48)'
      ctx.font = '700 38px system-ui, sans-serif'
      ctx.fillText(label, x, y)
      ctx.fillStyle = '#0A0A0B'
      ctx.font = '500 44px system-ui, sans-serif'
      wrapCanvasText(ctx, value || '—', x, y + 66, width, 58, maxLines)
    }

    drawBlock('원재료명 및 함량', ingredientText, 260, 1505, size - 520, 4)
    drawBlock('알레르기', allergenList.length ? `${allergenList.join(', ')} 함유` : '해당 없음', 260, 1815, size - 520, 2)
    if (sharedAllergenNotice) drawBlock('공유시설 혼입 표시', sharedAllergenNotice, 260, 2025, size - 520, 2)
    drawBlock('보관방법 / 소비기한', `${data.storage || '—'} / ${data.expiryDate || '별도 표기'}`, 260, 2235, size - 520, 1)
    drawBlock('영양성분', nutritionText, 260, 2395, size - 520, 2)

    ctx.strokeStyle = 'rgba(10,10,11,0.18)'
    ctx.strokeRect(260, 2640, size - 520, 160)
    ctx.font = '700 38px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(10,10,11,0.48)'
    ctx.fillText('제조원 / 품목보고번호 / 포장재질', 300, 2700)
    ctx.font = '500 40px system-ui, sans-serif'
    ctx.fillStyle = '#0A0A0B'
    wrapCanvasText(
      ctx,
      `${data.manufacturer || '-'} / ${data.manufacturerAddress || '소재지 입력 필요'} / ${data.itemReportNumber || '품목보고번호 입력 필요'} / ${packagingText}`,
      300,
      2760,
      size - 600,
      48,
      2,
    )

    ctx.font = '500 34px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(10,10,11,0.55)'
    ctx.fillText('KRK 라벨 PNG 산출물 · 최종 판매 전 사업자 확인 필요', 260, 2885)

    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('PNG 파일을 생성할 수 없습니다.'))
    }, 'image/png')
  })
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
): void {
  const chars = Array.from(text)
  let line = ''
  let lines = 0

  for (const char of chars) {
    const testLine = line + char
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y)
      y += lineHeight
      lines += 1
      line = char
      if (lines >= maxLines - 1) break
    } else {
      line = testLine
    }
  }

  if (line && lines < maxLines) ctx.fillText(line, x, y)
}

function toCreatorData(ingredients: Ingredient[], metadata: Metadata): CreatorData {
  const expiryDate = metadata.expiryDays
    ? new Date(Date.now() + parseInt(metadata.expiryDays) * 86_400_000).toISOString().slice(0, 10)
    : ''

  return {
    productName: metadata.productName,
    categories: metadata.categories ?? [],
    businessType: (metadata.businessType as CreatorData['businessType']) || '',
    facilityType: (metadata.facilityType as CreatorData['facilityType']) || '',
    totalWeight: metadata.totalWeight,
    unit: metadata.unit === 'kg' ? 'g' : metadata.unit === 'L' ? 'mL' : metadata.unit,
    manufacturer: metadata.manufacturer,
    manufacturerAddress: metadata.manufacturerAddress ?? '',
    itemReportNumber: metadata.itemReportNumber ?? '',
    storage: metadata.storage,
    expiryDate,
    marketingClaims: metadata.marketingClaims ?? '',
    packagingMaterials: metadata.packagingMaterials ?? [],
    sharedFacilityAllergens: metadata.sharedFacilityAllergens ?? [],
    ingredients: ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      weight: ing.weight > 0 ? String(ing.weight) : '',
      origin: ing.origin ?? '',
      isAllergen: ing.isAllergen,
      isComposite: ing.isComposite,
    })),
    detectedAllergens: ingredients.filter(ing => ing.isAllergen).map(ing => ({ id: ing.id, name: ing.name })),
    detectedComposites: [],
    nutritionExempted: true,
    servingSize: '',
    servingUnit: 'g',
    calories: '',
    totalCarbs: '',
    sugar: '',
    totalFat: '',
    saturatedFat: '',
    transFat: '0',
    cholesterol: '',
    protein: '',
    sodium: '',
  }
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const el = document.createElement('textarea')
      el.value = value
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-3 border-b border-[rgba(10,10,11,0.06)] py-3 last:border-0">
      <div className="w-[112px] flex-shrink-0 font-kr text-[12px] text-[rgba(10,10,11,0.5)]">{label}</div>
      <div className="min-w-0 flex-1 truncate font-kr text-[12px] text-ink" title={value || '-'}>
        {value || <span className="text-[rgba(10,10,11,0.3)]">-</span>}
      </div>
      <button
        onClick={handleCopy}
        disabled={!value}
        className="flex h-8 flex-shrink-0 items-center gap-1.5 border border-[rgba(10,10,11,0.14)] px-2.5 font-kr text-[11px] text-[rgba(10,10,11,0.55)] transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
      >
        {copied ? <Check size={11} className="text-heritage-500" /> : <Copy size={11} />}
        {copied ? '복사됨 ✓' : '복사'}
      </button>
    </div>
  )
}

function DownloadRow({
  icon,
  title,
  subtitle,
  onDownload,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  onDownload: () => void
}) {
  return (
    <div className="flex items-start gap-4 border-b border-[rgba(10,10,11,0.07)] py-4 last:border-0">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[rgba(10,10,11,0.08)] bg-[rgba(10,10,11,0.03)] text-heritage-500">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-kr text-[14px] font-semibold text-ink">{title}</div>
        <div className="mt-0.5 font-kr text-[12px] leading-[1.5] text-[rgba(10,10,11,0.5)]">{subtitle}</div>
      </div>
      <button
        onClick={onDownload}
        className="flex h-9 flex-shrink-0 items-center gap-1.5 border border-[rgba(10,10,11,0.18)] px-3 font-en text-[12px] font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
      >
        <Download size={12} />
        받기
      </button>
    </div>
  )
}

export default function PaymentComplete() {
  const navigate = useNavigate()
  const location = useLocation()
  const [ready, setReady] = useState(false)

  const stateData = location.state as {
    ingredients?: Ingredient[]
    metadata?: Metadata
    success?: boolean
    service?: ServiceType
    tier?: ServiceTier
    errorMessage?: string
    creatorData?: CreatorData
  } | null

  const searchParams = new URLSearchParams(location.search)
  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')
  const failCode = searchParams.get('code')
  const failMessage = searchParams.get('message')
  const isTossRedirect = !!paymentKey && !!orderId
  const isFailRedirect = !!failCode || location.pathname.endsWith('/payment/fail')

  const [restoredState, setRestoredState] = useState<{
    ingredients?: Ingredient[]
    metadata?: Metadata
    service?: ServiceType
    tier?: ServiceTier
    creatorData?: CreatorData
  } | null>(null)

  useEffect(() => {
    if (isTossRedirect || isFailRedirect) {
      try {
        const saved = sessionStorage.getItem('krk_payment_state')
        if (saved) {
          const parsed = JSON.parse(saved) as {
            ingredients?: Ingredient[]
            metadata?: Metadata
            service?: ServiceType
            tier?: ServiceTier
            creatorData?: CreatorData
          }
          setRestoredState(parsed)
          if (isTossRedirect) sessionStorage.removeItem('krk_payment_state')
        }
      } catch {
        console.warn('[PaymentComplete] sessionStorage 복원 실패')
      }
    }
    setReady(true)
  }, [isTossRedirect, isFailRedirect, orderId, paymentKey])

  const ingredients = stateData?.ingredients ?? restoredState?.ingredients
  const metadata = stateData?.metadata ?? restoredState?.metadata
  const service: ServiceType = stateData?.service ?? restoredState?.service ?? tierToService(stateData?.tier ?? restoredState?.tier)
  const cfg = SERVICES[service]
  const success = stateData?.success ?? (isTossRedirect && !isFailRedirect)
  const errorMsg = stateData?.errorMessage ?? failMessage

  useEffect(() => {
    if (!success || !ingredients || !metadata) return
    const guardKey = `krk_paid_saved_${orderId ?? paymentKey ?? metadata.productName}_${service}`
    if (sessionStorage.getItem(guardKey)) return
    sessionStorage.setItem(guardKey, '1')

    const paidOrderId = orderId ?? `KRK-MOCK-${Date.now()}`
    recordPayment({
      orderId: paidOrderId,
      paymentKey: paymentKey ?? undefined,
      amount: cfg.price,
      tier: serviceToTier(service),
      productName: metadata.productName,
    })

    recordLabelReview({
      ingredients,
      metadata,
      results: analyzeRegulations(ingredients, metadata),
      tier: serviceToTier(service),
      status: 'paid',
      amount: cfg.price,
    })
  }, [cfg.price, ingredients, metadata, orderId, paymentKey, service, success])

  if (!ready) return null
  if (!ingredients || !metadata) return <Navigate to="/" replace />

  if (!success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F4F5] px-5">
        <section className="w-full max-w-[560px] border border-[rgba(10,10,11,0.1)] bg-white p-7">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE6E6]">
              <AlertTriangle size={28} className="text-[#B30000]" />
            </div>
            <div>
              <div className="font-en text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B30000]">Payment failed</div>
              <h1 className="mt-1 font-kr text-[24px] font-semibold text-ink">결제를 완료하지 못했어요.</h1>
              <p className="mt-2 font-kr text-[13px] leading-[1.65] text-[rgba(10,10,11,0.55)]">
                {errorMsg || '결제 중 문제가 발생했습니다. 다른 결제 수단으로 다시 시도해주세요.'}
              </p>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <button onClick={() => navigate('/payment', { state: { ingredients, metadata, service, creatorData: stateData?.creatorData ?? restoredState?.creatorData } })} className="btn-heritage">
                <RotateCcw size={14} />
                다시 시도하기
              </button>
              <button onClick={() => navigate('/review', { state: { ingredients, metadata, creatorData: stateData?.creatorData ?? restoredState?.creatorData } })} className="btn-soft">
                다른 서비스 보기
              </button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const creatorData = stateData?.creatorData ?? restoredState?.creatorData ?? toCreatorData(ingredients, metadata)
  const paidTier = serviceToTier(service)

  const handleDownloadLabelPDF = () => generateLabelPDF(creatorData)
  const handleDownloadProGuide = () => generateProGuidePDF(creatorData)
  const handleDownloadReviewReport = () => generateCertPDF(creatorData, paidTier)
  const handleDownloadReportGuide = () => generateReportPDF(creatorData, paidTier)
  const handleDownloadLabelPng = async () => {
    const blob = await createLabelPngBlob(creatorData)
    downloadBlob(blob, `KRK_라벨_${safeFilenamePart(metadata.productName)}.png`)
  }

  const handleDownloadRecyclingZip = async () => {
    const materials = metadata.packagingMaterials ?? []
    const matched = materials
      .map(material => ({ material, path: RECYCLING_FILE_MAP[material] }))
      .filter(item => item.path)

    if (matched.length === 0) {
      alert('포장재 재질 정보가 없습니다. 원재료 단계에서 포장재를 선택해주세요.')
      return
    }

    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      await Promise.all(matched.map(async ({ material, path }) => {
        const res = await fetch(path)
        const text = await res.text()
        const safeMat = material.replace(/[\s/\\()]/g, '_')
        zip.file(`krk_recycling_${safeMat}.svg`, text)
      }))

      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, `KRK_recycling_marks_${safeFilenamePart(metadata.productName)}.zip`)
    } catch (e) {
      console.error('[RecyclingZip] 생성 실패:', e)
      alert('ZIP 생성 중 오류가 발생했습니다.')
    }
  }

  const allergenList = ingredients.filter(i => i.isAllergen).map(i => i.name).join(', ')
  const ingredientList = creatorData.ingredients.map(i => {
    const origin = i.origin ? `(${i.origin})` : ''
    return i.weight ? `${i.name}${origin} ${i.weight}g` : `${i.name}${origin}`
  }).join(', ')
  const sharedAllergenNotice = creatorData.facilityType === '공유' && creatorData.sharedFacilityAllergens.length > 0
    ? `이 제품은 ${creatorData.sharedFacilityAllergens.join(', ')}을 사용한 제품과 같은 제조시설에서 제조하고 있습니다.`
    : ''
  const copyRows = [
    { label: '원재료명', value: ingredientList },
    { label: '알레르기', value: allergenList || '해당 없음' },
    { label: '혼입표시', value: sharedAllergenNotice },
    { label: '식품유형', value: (metadata.categories ?? []).join(', ') },
    { label: '제조원', value: `${creatorData.manufacturer}${creatorData.manufacturerAddress ? ` / ${creatorData.manufacturerAddress}` : ''}` },
    { label: '품목번호', value: creatorData.itemReportNumber },
    { label: '제품명', value: metadata.productName },
  ].filter(row => row.value && (service === 'pro' || SERVICES.basic.copyItems.some(item => item.includes(row.label) || row.label === '제품명')))

  const downloadHandler = (fileId: string) => {
    if (fileId === 'pro-guide') return handleDownloadProGuide
    if (fileId === 'label-pdf') return handleDownloadLabelPDF
    if (fileId === 'label-png') return handleDownloadLabelPng
    if (fileId === 'report-guide') return handleDownloadReportGuide
    if (fileId === 'review-report') return handleDownloadReviewReport
    if (fileId === 'recycling') return handleDownloadRecyclingZip
    return handleDownloadLabelPDF
  }

  const handleDownloadAll = async () => {
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const safeName = safeFilenamePart(metadata.productName)
      const label = await createLabelPDFArtifact(creatorData)
      const labelPng = await createLabelPngBlob(creatorData)

      zip.file(label.filename, label.blob)
      zip.file(`KRK_라벨_${safeName}_${dateStr}.png`, labelPng)

      if (service === 'pro') {
        const proGuide = await createProGuidePDFArtifact(creatorData)
        const reportGuide = await createReportPDFArtifact(creatorData, paidTier)
        const reviewReport = await createCertPDFArtifact(creatorData, paidTier)
        zip.file(proGuide.filename, proGuide.blob)
        zip.file(reportGuide.filename, reportGuide.blob)
        zip.file(reviewReport.filename, reviewReport.blob)

        const materials = metadata.packagingMaterials ?? []
        await Promise.all(materials.map(async material => {
          const path = RECYCLING_FILE_MAP[material]
          if (!path) return
          const res = await fetch(path)
          const text = await res.text()
          zip.file(`recycling/krk_recycling_${safeFilenamePart(material)}.svg`, text)
        }))
      }

      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, `KRK_${service === 'pro' ? '전문수정가이드' : '기본라벨패키지'}_${safeName}_${dateStr}.zip`)
    } catch (e) {
      console.error('[DownloadAllZip] 생성 실패:', e)
      alert('전체 다운로드 ZIP 생성 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5]">
      <nav className="sticky top-0 z-40 border-b border-[rgba(10,10,11,0.1)] bg-white/75 px-5 py-4 backdrop-blur-[18px] md:px-12">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between">
          <LogoLockup />
          <div className="font-en text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(10,10,11,0.42)]">Complete</div>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 font-kr text-[12px] text-[rgba(10,10,11,0.5)] hover:text-ink">
            <Home size={13} />
            대시보드
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-[1180px] px-5 py-8 md:px-8 md:py-12">
        <header className="mb-7">
          <div className="font-en text-[11px] font-semibold uppercase tracking-[0.16em] text-heritage-500">결제 완료 · COMPLETE</div>
          <h1 className="mt-2 font-kr text-[26px] font-semibold tracking-[-0.018em] text-ink md:text-[34px]">
            {cfg.name}가 준비됐어요.
          </h1>
          <p className="mt-2 font-kr text-[13px] leading-[1.7] text-[rgba(10,10,11,0.55)]">
            {metadata.productName || '제품'}의 파일을 다운로드하고, 필요한 표시 문구를 바로 복사할 수 있습니다.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-[0.85fr_1.15fr]">
          <aside className="flex flex-col gap-4">
            <section className="border border-[rgba(10,10,11,0.1)] bg-white p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF6FE]">
                  <CheckCircle2 size={26} className="text-heritage-500" />
                </div>
                <span className="rounded-full bg-[#EAF6FE] px-3 py-1 font-kr text-[12px] font-semibold text-heritage-500">{cfg.badge}</span>
              </div>

              <div className="flex flex-col gap-3 border-t border-[rgba(10,10,11,0.07)] pt-4">
                <div className="flex justify-between gap-4 font-kr text-[12px]">
                  <span className="text-[rgba(10,10,11,0.45)]">주문번호</span>
                  <span className="font-mono text-[11px] text-ink">{orderId || 'MOCK-ORDER'}</span>
                </div>
                <div className="flex justify-between gap-4 font-kr text-[12px]">
                  <span className="text-[rgba(10,10,11,0.45)]">제품명</span>
                  <span className="text-ink">{metadata.productName || '-'}</span>
                </div>
                <div className="flex justify-between gap-4 font-kr text-[12px]">
                  <span className="text-[rgba(10,10,11,0.45)]">결제일시</span>
                  <span className="text-ink">{new Date().toLocaleString('ko-KR')}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-[rgba(10,10,11,0.07)] pt-3 font-kr text-[13px]">
                  <span className="font-semibold text-ink">결제금액</span>
                  <span className="font-en text-[18px] font-bold text-heritage-500">{fmtKRW(cfg.price)}원</span>
                </div>
              </div>
            </section>

            <section className="border border-[rgba(10,10,11,0.08)] bg-white p-5">
              <div className="flex items-start gap-3">
                <ReceiptText size={17} className="mt-0.5 flex-shrink-0 text-heritage-500" />
                <div>
                  <div className="font-kr text-[13px] font-semibold text-ink">마이페이지 재다운로드</div>
                  <p className="mt-1 font-kr text-[12px] leading-[1.6] text-[rgba(10,10,11,0.5)]">
                    결제 파일 재다운로드 기능은 곧 제공 예정입니다. 현재는 이 화면에서 필요한 파일을 바로 저장해주세요.
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-[#EAF6FE] px-2.5 py-1 font-kr text-[11px] text-heritage-500">곧 제공 예정</span>
                </div>
              </div>
            </section>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="border border-[rgba(10,10,11,0.1)] bg-white">
              <div className="border-b border-[rgba(10,10,11,0.07)] px-5 py-4">
                <div className="font-en text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgba(10,10,11,0.38)]">Download Files</div>
                <h2 className="mt-1 font-kr text-[16px] font-semibold text-ink">파일 다운로드</h2>
              </div>
              <div className="px-5">
                {cfg.files.map(file => (
                  <DownloadRow
                    key={file.id}
                    icon={file.icon}
                    title={file.name}
                    subtitle={file.use}
                    onDownload={downloadHandler(file.id)}
                  />
                ))}
              </div>
              <div className="border-t border-[rgba(10,10,11,0.07)] px-5 py-4">
                <button
                  onClick={handleDownloadAll}
                  className="btn-heritage flex h-12 w-full items-center justify-center"
                >
                  전체 다운로드 ZIP
                  <Download size={14} />
                </button>
              </div>
            </div>

            <div className="border border-[rgba(10,10,11,0.1)] bg-white">
              <div className="border-b border-[rgba(10,10,11,0.07)] px-5 py-4">
                <div className="font-en text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgba(10,10,11,0.38)]">Copy Text</div>
                <h2 className="mt-1 font-kr text-[16px] font-semibold text-ink">항목별 텍스트 복사</h2>
              </div>
              <div className="px-5 py-1">
                {copyRows.map(row => <CopyRow key={row.label} label={row.label} value={row.value} />)}
              </div>
            </div>

            <button
              onClick={() => navigate('/review', { state: { ingredients, metadata, service, creatorData } })}
              className="btn-soft flex h-12 w-full items-center justify-center"
            >
              무료 검토 결과 다시 보기
              <ArrowRight size={14} />
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}
