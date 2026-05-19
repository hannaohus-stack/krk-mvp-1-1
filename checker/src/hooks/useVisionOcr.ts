// src/hooks/useVisionOcr.ts
import { useState, useCallback } from 'react'
import { createWorker } from 'tesseract.js'
import type { CreatorIngredient } from '../pages/creator/types'

export type OcrStatus = 'idle' | 'loading' | 'done' | 'error'

export interface OcrResult {
  rawText: string
  ingredients: CreatorIngredient[]
  productName: string
}

function parseIngredientSection(text: string): string {
  const patterns = [
    /원재료명\s*[:\s：]\s*([^\n]+(?:\n(?!.*[:：])[^\n]+)*)/i,
    /원재료\s*[:\s：]\s*([^\n]+(?:\n(?!.*[:：])[^\n]+)*)/i,
    /재료\s*[:\s：]\s*([^\n]+(?:\n(?!.*[:：])[^\n]+)*)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return m[1]
  }
  return text
}

function parseIngredients(raw: string): CreatorIngredient[] {
  const items = raw
    .replace(/\(.*?\)/g, '')
    .split(/[,，\/\n]+/)
    .map(s => s.replace(/[^가-힣a-zA-Z0-9.\s%]/g, '').trim())
    .filter(s => s.length >= 2 && s.length <= 30)
    .slice(0, 20)

  return items.map((name, i) => ({
    id: `ocr-${i}-${Date.now()}`,
    name,
    weight: '',
    isAllergen: false,
    isComposite: false,
  }))
}

function parseProductName(text: string): string {
  const m = text.match(/제품명\s*[:\s：]\s*([^\n]+)/)
  return m ? m[1].trim() : ''
}

export function useVisionOcr() {
  const [status, setStatus]     = useState<OcrStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult]     = useState<OcrResult | null>(null)
  const [error, setError]       = useState<string | null>(null)

  const recognize = useCallback(async (file: File) => {
    setStatus('loading')
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      const worker = await createWorker('kor+eng', 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })

      const { data } = await worker.recognize(file)
      await worker.terminate()

      const rawText = data.text
      const section = parseIngredientSection(rawText)
      const ingredients = parseIngredients(section)
      const productName = parseProductName(rawText)

      setResult({ rawText, ingredients, productName })
      setStatus('done')
      setProgress(100)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OCR 처리 중 오류가 발생했습니다.')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setResult(null)
    setError(null)
  }, [])

  return { status, progress, result, error, recognize, reset }
}
