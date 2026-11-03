import { loadAccessToken } from '@/lib/authStorage'
import { loadUserId } from '@/lib/authStorage'

function decodeJwtSub(token: string): string | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const json = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as {
      sub?: string
      user_id?: string
    }
    const id = json.sub ?? json.user_id
    return typeof id === 'string' && id.trim() ? id.trim() : null
  } catch {
    return null
  }
}

/** Storage 업로드 경로 `{user_id}/…` 용 */
export function resolveStorageUserId(): string | null {
  const stored = loadUserId()
  if (stored) return stored
  const token = loadAccessToken()
  if (!token) return null
  return decodeJwtSub(token)
}
