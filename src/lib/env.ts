const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.warn('VITE_SUPABASE_URL 이 설정되지 않았습니다.')
}

export const env = {
  supabaseUrl: (supabaseUrl ?? '') as string,
  supabaseAnonKey: (supabaseAnonKey ?? '') as string,
}
