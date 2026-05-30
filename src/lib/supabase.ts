import { createClient } from '@supabase/supabase-js'
import type { Ingredient } from '../utils/parsing'
import type { Metadata, RegulationResult } from '../pages/ReviewResult'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// 환경변수 없을 때 더미값 — DEV_BYPASS 모드에서 크래시 방지용
// TODO: 실제 Supabase 연동 전 .env.local에 키 추가 후 더미값 제거
const DEV_URL = 'https://placeholder.supabase.co'
const DEV_KEY = 'placeholder-anon-key'

const IS_DEV = !supabaseUrl || supabaseUrl === DEV_URL

if (IS_DEV) {
  console.warn('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 환경변수가 없습니다. DEV 더미값으로 실행 중.')
}

export const supabase = createClient(
  supabaseUrl || DEV_URL,
  supabaseKey || DEV_KEY
)

// ─── payments 테이블 기록 ────────────────────────────────────────────────────
/**
 * 결제 완료 시 payments 테이블에 기록 (기본/전문 공통)
 *
 * Supabase SQL (최초 1회 실행):
 * CREATE TABLE payments (
 *   id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id     uuid REFERENCES auth.users(id),
 *   order_id    text NOT NULL,
 *   payment_key text,
 *   amount      integer NOT NULL,
 *   tier        text NOT NULL,
 *   product_name text,
 *   created_at  timestamptz DEFAULT now()
 * );
 */
export interface PaymentRecord {
  orderId:     string
  paymentKey?: string
  amount:      number
  tier:        'tier1' | 'tier2'
  productName?: string
}

export async function recordPayment(record: PaymentRecord): Promise<boolean> {
  // DEV 모드에서는 기록 스킵 (더미 Supabase로 실제 insert 불가)
  if (IS_DEV) {
    console.info('[supabase] DEV 모드 — payments 기록 스킵:', record)
    return false
  }

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('payments')
    .insert({
      user_id:      user?.id ?? null,
      order_id:     record.orderId,
      payment_key:  record.paymentKey ?? null,
      amount:       record.amount,
      tier:         record.tier,
      product_name: record.productName ?? null,
    })

  if (error) {
    console.error('[supabase] payments 기록 실패:', error.message)
    // 기록 실패는 사용자 경험을 막지 않음 — silent fail
    return false
  }

  return true
}

// ─── label_reviews 테이블 기록/조회 ───────────────────────────────────────────
/**
 * 검토 완료 및 결제 완료 시점의 작업 기록.
 *
 * 권장 Supabase SQL:
 * CREATE TABLE label_reviews (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id uuid REFERENCES auth.users(id),
 *   product_name text NOT NULL,
 *   categories text[] DEFAULT '{}',
 *   tier text NOT NULL DEFAULT 'free',
 *   status text NOT NULL DEFAULT 'reviewed',
 *   amount integer DEFAULT 0,
 *   metadata jsonb NOT NULL DEFAULT '{}',
 *   ingredients jsonb NOT NULL DEFAULT '[]',
 *   results jsonb NOT NULL DEFAULT '[]',
 *   created_at timestamptz DEFAULT now(),
 *   updated_at timestamptz DEFAULT now()
 * );
 *
 * RLS 예시:
 * user_id IS NULL OR auth.uid() = user_id 로 insert/select 허용
 */
export type ReviewTier = 'free' | 'tier1' | 'tier2'
export type ReviewStatus = 'reviewed' | 'paid'

export interface LabelReviewRecord {
  ingredients: Ingredient[]
  metadata: Metadata
  results: RegulationResult[]
  tier?: ReviewTier
  status?: ReviewStatus
  amount?: number
}

export interface DashboardReview {
  id: string
  product_name: string | null
  categories: string[] | null
  tier: ReviewTier | 'unknown' | null
  amount: number | null
  created_at: string | null
}

export async function recordLabelReview(record: LabelReviewRecord): Promise<boolean> {
  if (IS_DEV) {
    console.info('[supabase] DEV 모드 — label_reviews 기록 스킵:', record)
    return false
  }

  const { data: { user } } = await supabase.auth.getUser()
  const payload = {
    user_id: user?.id ?? null,
    product_name: record.metadata.productName || '이름 없는 제품',
    categories: record.metadata.categories ?? [],
    tier: record.tier ?? 'free',
    status: record.status ?? 'reviewed',
    amount: record.amount ?? 0,
    metadata: record.metadata,
    ingredients: record.ingredients,
    results: record.results,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('label_reviews')
    .insert(payload)

  if (error) {
    console.error('[supabase] label_reviews 기록 실패:', error.message)
    return false
  }

  return true
}

export async function fetchDashboardReviews(): Promise<DashboardReview[]> {
  if (IS_DEV) return []

  const { data: { user } } = await supabase.auth.getUser()
  let query = supabase
    .from('label_reviews')
    .select('id, product_name, categories, tier, amount, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (user?.id) query = query.eq('user_id', user.id)

  const { data, error } = await query
  if (error) {
    console.error('[supabase] label_reviews 조회 실패:', error.message)
    return []
  }

  return data ?? []
}
