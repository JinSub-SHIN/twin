import type { AuthTokenPair } from '@/lib/authTokens'
import type { UserProfile } from '@/types/user'

const STORAGE_KEY = 'saljjak.user'
const TOKEN_KEY = 'saljjak.accessToken'
const REFRESH_KEY = 'saljjak.refreshToken'
const EXPIRES_AT_KEY = 'saljjak.accessExpiresAt'
const USER_ID_KEY = 'saljjak.userId'

export function loadAccessToken() {
  return localStorage.getItem(TOKEN_KEY)?.trim() || ''
}

export function loadRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)?.trim() || ''
}

export function loadAccessExpiresAt(): number | null {
  const raw = localStorage.getItem(EXPIRES_AT_KEY)
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function saveAccessToken(token: string) {
  const value = token.trim()
  if (!value) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  localStorage.setItem(TOKEN_KEY, value)
}

export function saveAuthTokens(tokens: AuthTokenPair) {
  saveAccessToken(tokens.accessToken)
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken.trim())
  const expiresAt = Date.now() + tokens.expiresIn * 1000
  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt))
}

export function clearAuthTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
}

export function clearAccessToken() {
  clearAuthTokens()
}

export function saveUserId(userId: string) {
  const value = userId.trim()
  if (!value) {
    localStorage.removeItem(USER_ID_KEY)
    return
  }
  localStorage.setItem(USER_ID_KEY, value)
}

export function loadUserId() {
  return localStorage.getItem(USER_ID_KEY)?.trim() || ''
}

export function clearUserId() {
  localStorage.removeItem(USER_ID_KEY)
}

export function authHeaders(): HeadersInit | undefined {
  const token = loadAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : undefined
}

export function loadUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function saveUser(user: UserProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY)
  clearAuthTokens()
  clearUserId()
}

/** access 만료 5분 전이면 true */
export function shouldRefreshAccessProactively(): boolean {
  const expiresAt = loadAccessExpiresAt()
  if (!expiresAt || !loadRefreshToken()) return false
  return expiresAt - Date.now() < 5 * 60 * 1000
}
