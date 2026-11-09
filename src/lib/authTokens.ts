export type AuthTokenPair = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null
}

function readString(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function readExpiresIn(record: Record<string, unknown> | null) {
  const raw = record?.expires_in ?? record?.expiresIn
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw)
  }
  if (typeof raw === 'string' && raw.trim()) {
    const n = Number(raw)
    if (Number.isFinite(n) && n > 0) return Math.floor(n)
  }
  return 3600
}

/** 로그인·회원가입·재발급 응답에서 토큰 쌍 추출 */
export function parseAuthTokenPair(body: unknown): AuthTokenPair | null {
  const root = asRecord(body)
  const data = asRecord(root?.data) ?? root
  if (!data) return null

  const access =
    readString(data, 'access_token') ||
    readString(data, 'accessToken') ||
    readString(data, 'token') ||
    readString(root, 'access_token') ||
    readString(root, 'accessToken')

  const refresh =
    readString(data, 'refresh_token') ||
    readString(data, 'refreshToken') ||
    readString(root, 'refresh_token') ||
    readString(root, 'refreshToken')

  if (!access || !refresh) return null

  return {
    accessToken: access,
    refreshToken: refresh,
    expiresIn: readExpiresIn(data) || readExpiresIn(root),
  }
}
