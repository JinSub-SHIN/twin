import { env } from '@/lib/env'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
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

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!env.apiUrl) {
    throw new ApiError('API 주소가 설정되지 않았습니다.', 0, null)
  }

  const url = `${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(url, { ...options, headers })
  } catch {
    throw new ApiError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.', 0, null)
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
    throw new ApiError(
      readMessage(body, '요청을 처리하지 못했습니다.'),
      response.status,
      body,
    )
  }

  return body as T
}
