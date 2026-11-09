export type AuthSessionEndReason =
  | 'invalid_token'
  | 'missing_token'
  | 'refresh_expired'
  | 'token_reused'

export type AuthSessionEndPayload = {
  reason: AuthSessionEndReason
  message: string
}

const NOTICE_KEY = 'saljjak.authNotice'

type AuthSessionHandler = (payload: AuthSessionEndPayload) => void

let handler: AuthSessionHandler | null = null

export function registerAuthSessionHandler(next: AuthSessionHandler | null) {
  handler = next
}

export function stashAuthNotice(message: string) {
  try {
    sessionStorage.setItem(NOTICE_KEY, message)
  } catch {
    /* ignore */
  }
}

export function consumeAuthNotice(): string {
  try {
    const value = sessionStorage.getItem(NOTICE_KEY)?.trim() ?? ''
    if (value) sessionStorage.removeItem(NOTICE_KEY)
    return value
  } catch {
    return ''
  }
}

const MESSAGES: Record<AuthSessionEndReason, string> = {
  invalid_token: '로그인이 필요해요. 다시 로그인해 주세요.',
  missing_token: '로그인이 필요해요. 다시 로그인해 주세요.',
  refresh_expired: '로그인 시간이 만료됐어요. 다시 로그인해 주세요.',
  token_reused:
    '보안을 위해 로그아웃됐어요. 다시 로그인해 주세요.',
}

export function endAuthSession(reason: AuthSessionEndReason) {
  const message = MESSAGES[reason]
  stashAuthNotice(message)
  handler?.({ reason, message })
}
