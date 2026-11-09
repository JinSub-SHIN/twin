import { authHeaders } from '@/lib/authStorage'
import { apiRequest, ApiError } from '@/service/http'

export type RoomApplyBody = {
  message?: string
}

export type RoomApplyResponse = {
  success: boolean
  apply_id: string
  status: 'pending' | 'accepted' | 'rejected'
  chat_room_id: string
}

export function applyRoom(roomId: string, body: RoomApplyBody = {}) {
  const payload: RoomApplyBody = {}
  const message = body.message?.trim()
  if (message) payload.message = message

  return apiRequest<RoomApplyResponse>(
    `/room/${encodeURIComponent(roomId)}/apply`,
    {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )
}

export function applyErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'body' in error) {
    const body = (error as { body: unknown }).body
    if (body && typeof body === 'object') {
      const record = body as { code?: string; message?: string }
      switch (record.code) {
        case 'MISSING_TOKEN':
        case 'INVALID_TOKEN':
          return '로그인이 필요해요. 다시 로그인해 주세요.'
        case 'ROOM_NOT_FOUND':
          return '공고를 찾을 수 없어요.'
        case 'ROOM_NOT_ACTIVE':
          return '이미 마감된 공고예요.'
        case 'SELF_APPLY_FORBIDDEN':
          return '내 공고에는 신청할 수 없어요.'
        case 'ALREADY_APPLIED':
          return '이미 이 공고에 신청했어요.'
        case 'BLOCKED':
          return '차단된 상대의 공고에는 신청할 수 없어요.'
        default:
          if (typeof record.message === 'string' && record.message.trim()) {
            return record.message
          }
      }
    }
  }
  if (error instanceof ApiError && error.message) return error.message
  if (error instanceof Error && error.message) return error.message
  return '함께 살기 요청에 실패했어요. 잠시 후 다시 시도해 주세요.'
}
