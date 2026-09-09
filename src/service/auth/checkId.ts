import { ApiError, apiRequest } from '@/service/http'

function readAvailable(body: unknown): boolean | null {
  if (!body || typeof body !== 'object') return null
  const root = body as Record<string, unknown>
  const nested =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root

  if (typeof nested.available === 'boolean') return nested.available
  if (typeof nested.isAvailable === 'boolean') return nested.isAvailable
  if (typeof nested.exists === 'boolean') return !nested.exists
  if (typeof nested.duplicate === 'boolean') return !nested.duplicate
  if (typeof nested.isDuplicate === 'boolean') return !nested.isDuplicate
  return null
}

function looksTaken(message: string) {
  return /이미|존재|중복|taken|exist|duplicate/i.test(message)
}

export async function checkLoginId(id: string): Promise<boolean> {
  try {
    const body = await apiRequest<unknown>(
      `/auth/check-id?id=${encodeURIComponent(id)}`,
    )
    return readAvailable(body) ?? true
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404) return true
      if (err.status === 409) return false
      const parsed = readAvailable(err.body)
      if (parsed != null) return parsed
      if (looksTaken(err.message)) return false
    }
    throw err
  }
}
