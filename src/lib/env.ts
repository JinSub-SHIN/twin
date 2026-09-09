const apiUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

if (!apiUrl) {
  console.warn('VITE_API_URL 이 설정되지 않았습니다.')
}

export const env = {
  apiUrl,
}
