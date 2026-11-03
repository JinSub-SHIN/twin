import { authHeaders } from '@/lib/authStorage'
import { apiRequest } from '@/service/http'
import type { RoomRegisterBody, RoomRegisterResponse } from './registerTypes'

export function registerRoom(body: RoomRegisterBody) {
  return apiRequest<RoomRegisterResponse>('/room/register', {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export function registerErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'body' in error) {
    const body = (error as { body: unknown }).body
    if (body && typeof body === 'object') {
      const record = body as { code?: string; message?: string }
      switch (record.code) {
        case 'MISSING_TOKEN':
        case 'INVALID_TOKEN':
          return '로그인이 필요해요. 다시 로그인해 주세요.'
        case 'MISSING_REQUIRED_FIELD':
          return '필수 동의(매칭 프로필 제공)를 확인해 주세요.'
        case 'INVALID_CONTENT':
          return '제목이나 소개에 사용할 수 없는 표현이 포함되어 있어요.'
        case 'ROOM_REGISTER_FAILED':
          return '공고 등록에 실패했어요. 잠시 후 다시 시도해 주세요.'
        default:
          if (typeof record.message === 'string' && record.message.trim()) {
            return record.message
          }
      }
    }
  }
  if (error instanceof Error && error.message) return error.message
  return '공고 등록에 실패했어요.'
}
