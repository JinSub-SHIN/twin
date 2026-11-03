import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { loadAccessToken } from '@/lib/authStorage'

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

let client: SupabaseClient | null = null

export function isSupabaseConfigured() {
  return Boolean(url && anonKey)
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase 설정(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)이 없습니다.')
  }
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
  return client
}

/** API access token을 Supabase Storage RLS에 쓸 수 있을 때 세션으로 주입 */
export async function ensureSupabaseAuthFromApiToken() {
  const token = loadAccessToken()
  if (!token) throw new Error('로그인이 필요합니다.')
  const supabase = getSupabaseClient()
  const { data } = await supabase.auth.getSession()
  if (data.session?.access_token === token) return supabase

  const { error } = await supabase.auth.setSession({
    access_token: token,
    refresh_token: token,
  })
  if (error) {
    throw new Error(
      '사진 업로드 인증에 실패했어요. Supabase 로그인 세션이 API 토큰과 연동되어야 합니다.',
    )
  }
  return supabase
}
