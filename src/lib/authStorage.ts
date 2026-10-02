import type { UserProfile } from '@/types/user'

const STORAGE_KEY = 'saljjak.user'
const TOKEN_KEY = 'saljjak.accessToken'

export function loadAccessToken() {
  return localStorage.getItem(TOKEN_KEY)?.trim() || ''
}

export function saveAccessToken(token: string) {
  const value = token.trim()
  if (!value) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  localStorage.setItem(TOKEN_KEY, value)
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY)
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
  localStorage.removeItem(TOKEN_KEY)
}
