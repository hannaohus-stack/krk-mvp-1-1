import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

/**
 * 현재 Supabase 세션 반환.
 * - loading: true → 세션 확인 중
 * - session: null  → 미인증
 * - session: Session → 인증됨
 */
export function useAuth() {
  const [session, setSession]   = useState<Session | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    // 최초 세션 로드
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // 세션 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}
