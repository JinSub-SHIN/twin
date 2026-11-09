import { authHeaders } from '@/lib/authStorage'
import { apiRequest } from '@/service/http'

export type RoomInquireResponse = {
  success: boolean
  chat_room_id: string
}

export function inquireRoom(roomId: string) {
  return apiRequest<RoomInquireResponse>(
    `/room/${encodeURIComponent(roomId)}/inquire`,
    {
      method: 'POST',
      headers: authHeaders(),
    },
  )
}

export function inquireErrorMessage(error: unknown): string {
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
        case 'INQUIRE_FAILED':
          return '문의하기에 실패했어요. 잠시 후 다시 시도해 주세요.'
        default:
          if (typeof record.message === 'string' && record.message.trim()) {
            return record.message
          }
      }
    }
  }
  if (error instanceof Error && error.message) return error.message
  return '문의하기에 실패했어요. 잠시 후 다시 시도해 주세요.'
}
