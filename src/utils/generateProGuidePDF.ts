// generateProGuidePDF.ts — PDF 00 전문 수정 가이드
// 파일명: KRK_전문수정가이드_{productName}_{YYYYMMDD}.pdf

import { jsPDF } from 'jspdf'
import type { CreatorData } from '../pages/creator/types'
import { analyzeRegulations, type Metadata, type RegulationResult } from '../pages/ReviewResult'
import { generateReviewId } from './generateReviewId'
import {
  downloadPdfArtifact,
  drawCanvasText,
  PDF_COLORS,
  safePdfName,
  saveDocAsArtifact,
  type DownloadablePdfArtifact,
} from './pdfCore'

const PAGE_W = 794
const PAGE_H = 1123
const SCALE = 2

type CanvasPage = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
}

function toMetadata(data: CreatorData): Metadata {
  return {
    productName: data.productName,
    totalWeight: data.totalWeight,
    unit: data.unit,
    expiryDays: '',
    storage: data.storage,
    manufacturer: data.manufacturer,
    manufacturerAddress: data.manufacturerAddress,
    itemReportNumber: data.itemReportNumber,
    marketingClaims: data.marketingClaims,
    packagingMaterials: data.packagingMaterials,
    sharedFacilityAllergens: data.sharedFacilityAllergens,
    categories: data.categories,
    businessType: data.businessType || undefined,
    facilityType: data.facilityType || undefined,
  }
}

function toIngredients(data: CreatorData) {
  return data.ingredients.map(ing => ({
    id: ing.id,
    name: ing.name,
    rawName: ing.name,
    weight: parseFloat(ing.weight) || 0,
    origin: ing.origin,
    suggestedName: ing.name,
    isComposite: ing.isComposite,
    isAllergen: ing.isAllergen,
    matchConfidence: 1.0,
  }))
}

function createPage(): CanvasPage {
  const canvas = document.createElement('canvas')
  canvas.width = PAGE_W * SCALE
  canvas.height = PAGE_H * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('전문 수정 가이드 PDF canvas를 생성할 수 없습니다.')
  ctx.scale(SCALE, SCALE)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, PAGE_W, PAGE_H)
  return { canvas, ctx }
}

function drawHeader(ctx: CanvasRenderingContext2D, label: string, pageNo: number): void {
  ctx.fillStyle = PDF_COLORS.heritage
  ctx.fillRect(0, 0, PAGE_W, 68)
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 15px "Apple SD Gothic Neo", system-ui'
  ctx.fillText('KRK CHECKER · 전문 수정 가이드', 54, 42)
  ctx.font = '11px "Apple SD Gothic Neo", system-ui'
  ctx.fillText(label, 560, 42)
  ctx.fillStyle = PDF_COLORS.faint
  ctx.font = '10px "Apple SD Gothic Neo", system-ui'
  ctx.fillText(`page ${pageNo}`, 54, 1048)
  ctx.fillText('본 문서는 입력값 기반 자동 수정 참고자료이며, 최종 책임은 사업자에게 있습니다.', 150, 1048)
}

function drawSectionTitle(ctx: CanvasRenderingContext2D, title: string, x: number, y: number): void {
  ctx.fillStyle = PDF_COLORS.heritage
  ctx.font = '700 15px "Apple SD Gothic Neo", system-ui'
  ctx.fillText(title, x, y)
}

function drawInfoBox(
  ctx: CanvasRenderingContext2D,
  title: string,
  body: string,
  x: number,
  y: number,
  w: number,
  bg: string = PDF_COLORS.paper,
): number {
  ctx.fillStyle = bg
  ctx.strokeStyle = PDF_COLORS.hairline
  ctx.fillRect(x, y, w, 94)
  ctx.strokeRect(x, y, w, 94)
  ctx.fillStyle = PDF_COLORS.heritage
  ctx.font = '700 12px "Apple SD Gothic Neo", system-ui'
  ctx.fillText(title, x + 16, y + 28)
  ctx.fillStyle = PDF_COLORS.ink
  ctx.font = '12px "Apple SD Gothic Neo", system-ui'
  drawCanvasText(ctx, body || '—', x + 16, y + 52, w - 32, 16, 3)
  return y + 110
}

function getStatusLabel(result: RegulationResult): string {
  if (result.status === 'violation') return '필수 확인'
  if (result.status === 'warn') return '보완 권장'
  return '기준 충족'
}

function drawResultCard(
  ctx: CanvasRenderingContext2D,
  result: RegulationResult,
  index: number,
  x: number,
  y: number,
): number {
  const isViolation = result.status === 'violation'
  const statusColor = isViolation ? PDF_COLORS.viol : result.status === 'warn' ? PDF_COLORS.warn : PDF_COLORS.pass
  const bg = isViolation ? PDF_COLORS.violBg : result.status === 'warn' ? PDF_COLORS.warnBg : PDF_COLORS.passBg

  ctx.fillStyle = bg
  ctx.strokeStyle = statusColor
  ctx.fillRect(x, y, 686, 550)
  ctx.strokeRect(x, y, 686, 550)
  ctx.fillStyle = statusColor
  ctx.fillRect(x, y, 6, 550)

  ctx.fillStyle = statusColor
  ctx.font = '700 11px "Apple SD Gothic Neo", system-ui'
  ctx.fillText(`${String(index + 1).padStart(2, '0')} · ${getStatusLabel(result)}`, x + 22, y + 32)
  ctx.fillStyle = PDF_COLORS.ink
  ctx.font = '800 20px "Apple SD Gothic Neo", system-ui'
  drawCanvasText(ctx, `${result.id} ${result.title}`, x + 22, y + 62, 620, 24, 2)

  let rowY = y + 118
  rowY = drawInfoBox(ctx, '현재 상태', result.currentValue || result.detail || '—', x + 22, rowY, 310, '#ffffff')
  rowY = drawInfoBox(ctx, '왜 문제인가', result.issueReason || result.detail || '—', x + 22, rowY, 310, '#ffffff')
  rowY = drawInfoBox(ctx, '수정 방법', result.fixInstruction || result.suggestion || '—', x + 22, rowY, 310, '#ffffff')

  let rightY = y + 118
  rightY = drawInfoBox(ctx, '라벨 권장 문구', result.recommendedLabelText || result.suggestion || '—', x + 354, rightY, 310, '#ffffff')
  rightY = drawInfoBox(ctx, '관련 법규', result.legalBasis || result.regulation || '—', x + 354, rightY, 310, '#ffffff')
  rightY = drawInfoBox(ctx, '과태료/행정처분 참고', result.penaltyRange || '사안별 상이', x + 354, rightY, 310, '#ffffff')

  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = PDF_COLORS.hairline
  ctx.fillRect(x + 22, y + 466, 642, 62)
  ctx.strokeRect(x + 22, y + 466, 642, 62)
  ctx.fillStyle = PDF_COLORS.heritage
  ctx.font = '700 12px "Apple SD Gothic Neo", system-ui'
  ctx.fillText('다음 액션', x + 38, y + 492)
  ctx.fillStyle = PDF_COLORS.ink
  ctx.font = '12px "Apple SD Gothic Neo", system-ui'
  const actions = result.actionItems?.length ? result.actionItems : ['라벨 PDF/PNG에 권장 문구 반영', '인쇄 전 최종 확인', '필요 시 관할기관 또는 전문가 확인']
  drawCanvasText(ctx, actions.map(item => `- ${item}`).join('  '), x + 120, y + 492, 520, 16, 2)

  return y + 580
}

export async function createProGuidePDFArtifact(data: CreatorData): Promise<DownloadablePdfArtifact> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const safeName = safePdfName(data.productName)
  const filename = `KRK_전문수정가이드_${safeName}_${dateStr}.pdf`
  const reviewId = generateReviewId()
  const results = analyzeRegulations(toIngredients(data), toMetadata(data))
  const targets = results.filter(result => result.status !== 'pass')
  const counts = {
    violation: results.filter(result => result.status === 'violation').length,
    warn: results.filter(result => result.status === 'warn').length,
    pass: results.filter(result => result.status === 'pass').length,
  }

  const pages: HTMLCanvasElement[] = []
  const cover = createPage()
  drawHeader(cover.ctx, new Date().toLocaleDateString('ko-KR'), 1)
  cover.ctx.fillStyle = PDF_COLORS.faint
  cover.ctx.font = '12px system-ui'
  cover.ctx.fillText('PROFESSIONAL FIX GUIDE · 판매 전 표시사항 수정 실행 문서', 54, 132)
  cover.ctx.fillStyle = PDF_COLORS.ink
  cover.ctx.font = '800 34px "Apple SD Gothic Neo", system-ui'
  drawCanvasText(cover.ctx, '전문 수정 가이드 PDF', 54, 186, 686, 40, 2)
  cover.ctx.fillStyle = PDF_COLORS.faint
  cover.ctx.font = '14px "Apple SD Gothic Neo", system-ui'
  drawCanvasText(cover.ctx, '무엇이 문제인지가 아니라, 라벨과 신고 준비 과정에서 무엇을 어떻게 고쳐야 하는지 정리한 실행 문서입니다.', 54, 258, 640, 22, 2)

  const summaryY = 340
  drawInfoBox(cover.ctx, '제품 정보', `제품명: ${data.productName || '—'} / 카테고리: ${data.categories.join(', ') || '—'} / 사업자 유형: ${data.businessType || '—'}`, 54, summaryY, 686, '#ffffff')
  drawInfoBox(cover.ctx, '검토 요약', `필수 확인 ${counts.violation}건 · 보완 권장 ${counts.warn}건 · 기준 충족 ${counts.pass}건 · 검토번호 ${reviewId}`, 54, summaryY + 130, 686, counts.violation > 0 ? PDF_COLORS.violBg : PDF_COLORS.warnBg)
  drawSectionTitle(cover.ctx, '출시 전 우선 조치 TOP 3', 54, summaryY + 300)
  cover.ctx.fillStyle = PDF_COLORS.ink
  cover.ctx.font = '13px "Apple SD Gothic Neo", system-ui'
  const topActions = targets.slice(0, 3).map((result, index) => `${index + 1}. ${result.title}: ${result.fixInstruction || result.suggestion}`)
  drawCanvasText(cover.ctx, topActions.join('\n'), 54, summaryY + 332, 650, 22, 6)
  pages.push(cover.canvas)

  let pageNo = 2
  targets.forEach((result, index) => {
    const page = createPage()
    drawHeader(page.ctx, `${result.id} ${result.title}`, pageNo)
    drawResultCard(page.ctx, result, index, 54, 128)
    pages.push(page.canvas)
    pageNo += 1
  })

  const checklist = createPage()
  drawHeader(checklist.ctx, '최종 체크리스트', pageNo)
  drawSectionTitle(checklist.ctx, '판매 전 최종 확인', 54, 140)
  const checklistItems = [
    '전문 수정 가이드의 필수 확인/보완 권장 항목을 라벨 PDF와 PNG에 반영했습니다.',
    '원재료명, 원산지, 알레르기, 영양성분, 제조원 정보가 서로 다르지 않습니다.',
    '정부24 또는 식품안전나라 품목제조보고 화면에 입력할 항목을 별도로 확인했습니다.',
    '포장재질과 분리배출 마크가 실제 포장 구성과 일치합니다.',
    '판매 전 관할기관 또는 식품 표시 전문가의 최종 확인이 필요한 항목을 확인했습니다.',
  ]
  checklist.ctx.fillStyle = PDF_COLORS.ink
  checklist.ctx.font = '14px "Apple SD Gothic Neo", system-ui'
  drawCanvasText(checklist.ctx, checklistItems.map(item => `□ ${item}`).join('\n'), 54, 190, 680, 34, 10)
  drawInfoBox(checklist.ctx, '중요 안내', '이 문서는 KRK Checker 입력값을 바탕으로 생성된 자동 수정 참고자료입니다. 공식 인증서나 법률 의견서가 아니며, 최종 표시 책임은 사업자에게 있습니다.', 54, 560, 686, PDF_COLORS.alertBg)
  pages.push(checklist.canvas)

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  pages.forEach((canvas, index) => {
    if (index > 0) doc.addPage()
    doc.addImage(canvas.toDataURL('image/jpeg', 0.86), 'JPEG', 0, 0, 210, 297)
  })

  return saveDocAsArtifact(doc, filename)
}

export async function generateProGuidePDF(data: CreatorData): Promise<void> {
  downloadPdfArtifact(await createProGuidePDFArtifact(data))
}
