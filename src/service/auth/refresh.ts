import { env } from '@/lib/env'
import { parseAuthTokenPair } from '@/lib/authTokens'
import {
  endAuthSession,
  type AuthSessionEndReason,
} from '@/lib/authSession'
import { loadRefreshToken, saveAuthTokens } from '@/lib/authStorage'
import { ApiError } from '@/service/http'

function readErrorCode(body: unknown): string {
  if (!body || typeof body !== 'object') return ''
  const record = body as { code?: unknown; error?: unknown }
  if (typeof record.code === 'string') return record.code
  if (typeof record.error === 'string') return record.error
  return ''
}

function mapRefreshFailure(code: string): AuthSessionEndReason {
  if (code === 'TOKEN_REUSED') return 'token_reused'
  return 'refresh_expired'
}

/** `/auth/refresh` — apiRequest 인터셉터 밖에서만 호출 (단일 재발급용) */
export async function refreshAuthTokens(): Promise<boolean> {
  const refreshToken = loadRefreshToken()
  if (!refreshToken) {
    endAuthSession('refresh_expired')
    return false
  }

  if (!env.apiUrl) {
    throw new ApiError('API 주소가 설정되지 않았습니다.', 0, null)
  }

  const url = `${env.apiUrl}/auth/refresh`
  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  } catch {
    throw new ApiError(
      '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      0,
      null,
    )
  }

  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      body = text
    }
  }

  if (!response.ok) {
    const code = readErrorCode(body)
    if (
      response.status === 401 &&
      (code === 'INVALID_REFRESH_TOKEN' ||
        code === 'TOKEN_REUSED' ||
        code === 'INVALID_TOKEN')
    ) {
      endAuthSession(mapRefreshFailure(code))
      return false
    }
    throw new ApiError(
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: unknown }).message)
        : '토큰을 갱신하지 못했습니다.',
      response.status,
      body,
    )
  }

  const pair = parseAuthTokenPair(body)
  if (!pair) {
    throw new ApiError('토큰 응답 형식이 올바르지 않습니다.', response.status, body)
  }

  saveAuthTokens(pair)
  return true
}
