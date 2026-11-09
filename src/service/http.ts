import { env } from '@/lib/env'
import { endAuthSession } from '@/lib/authSession'
import {
  authHeaders,
  loadAccessToken,
  shouldRefreshAccessProactively,
} from '@/lib/authStorage'
import { refreshAuthTokens } from '@/service/auth/refresh'

export class ApiError extends Error {
  status: number
  body: unknown
  code: string

  constructor(message: string, status: number, body: unknown, code = '') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
    this.code = code
  }
}

function readMessage(body: unknown, fallback: string) {
  if (typeof body === 'string' && body.trim()) return body
  if (body && typeof body === 'object') {
    const record = body as { message?: unknown; error?: unknown }
    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message
    }
    if (Array.isArray(record.message) && record.message.length > 0) {
      return record.message.filter((item) => typeof item === 'string').join('\n')
    }
    if (typeof record.error === 'string' && record.error.trim()) {
      return record.error
    }
  }
  return fallback
}

export function readApiErrorCode(body: unknown): string {
  if (!body || typeof body !== 'object') return ''
  const record = body as { code?: unknown; error?: unknown }
  if (typeof record.code === 'string') return record.code
  if (typeof record.error === 'string') return record.error
  return ''
}

const AUTH_SKIP_REFRESH_PATHS = new Set([
  '/auth/login',
  '/auth/signup',
  '/auth/refresh',
])

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function hasAuthorization(headers: Headers) {
  const value = headers.get('Authorization')?.trim()
  return Boolean(value)
}

let refreshInFlight: Promise<boolean> | null = null

function refreshAccessTokenOnce(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshAuthTokens().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

async function maybeProactiveRefresh(headers: Headers) {
  if (!hasAuthorization(headers)) return
  if (!shouldRefreshAccessProactively()) return
  await refreshAccessTokenOnce()
  const token = loadAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
}

async function performFetch(url: string, options: RequestInit) {
  try {
    return await fetch(url, options)
  } catch {
    throw new ApiError(
      '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      0,
      null,
    )
  }
}

async function parseResponseBody(response: Response) {
  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      body = text
    }
  }
  return body
}

function applyLatestAuthHeader(headers: Headers) {
  const token = loadAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
}

async function handleUnauthorized(
  path: string,
  headers: Headers,
  body: unknown,
  status: number,
  retry: () => Promise<Response>,
): Promise<Response | null> {
  if (status !== 401) return null

  const code = readApiErrorCode(body)
  const normalized = normalizePath(path)

  if (AUTH_SKIP_REFRESH_PATHS.has(normalized)) {
    return null
  }

  if (code === 'MISSING_TOKEN') {
    endAuthSession('missing_token')
    return null
  }

  if (code === 'INVALID_TOKEN') {
    endAuthSession('invalid_token')
    return null
  }

  if (code === 'TOKEN_EXPIRED') {
    if (!hasAuthorization(headers) && !loadAccessToken()) {
      endAuthSession('missing_token')
      return null
    }

    const ok = await refreshAccessTokenOnce()
    if (!ok) {
      return null
    }

    applyLatestAuthHeader(headers)
    return retry()
  }

  return null
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!env.apiUrl) {
    throw new ApiError('API 주소가 설정되지 않았습니다.', 0, null)
  }

  const normalizedPath = normalizePath(path)
  const url = `${env.apiUrl}${normalizedPath}`
  const headers = new Headers(options.headers)

  if (!headers.has('Authorization')) {
    const auto = authHeaders()
    if (auto && typeof auto === 'object' && !Array.isArray(auto)) {
      const bearer = (auto as Record<string, string>).Authorization
      if (bearer) headers.set('Authorization', bearer)
    }
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  await maybeProactiveRefresh(headers)

  const requestInit: RequestInit = { ...options, headers }

  let response = await performFetch(url, requestInit)
  let body = await parseResponseBody(response)

  if (!response.ok) {
    const retried = await handleUnauthorized(
      normalizedPath,
      headers,
      body,
      response.status,
      () => performFetch(url, { ...options, headers }),
    )
    if (retried) {
      response = retried
      body = await parseResponseBody(response)
    }
  }

  if (!response.ok) {
    const code = readApiErrorCode(body)
    throw new ApiError(
      readMessage(body, '요청을 처리하지 못했습니다.'),
      response.status,
      body,
      code,
    )
  }

  return body as T
}
