import { authHeaders } from '@/lib/authStorage'
import { apiRequest } from '@/service/http'
import type { RoomAddPhotosResponse, RoomPhotoInput } from './photoTypes'

export function addRoomPhotos(roomId: string, photos: RoomPhotoInput[]) {
  return apiRequest<RoomAddPhotosResponse>(
    `/room/${encodeURIComponent(roomId)}/photos`,
    {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photos }),
    },
  )
}

export function addRoomPhotosErrorMessage(error: unknown): string {
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
        case 'FORBIDDEN':
          return '본인 공고에만 사진을 추가할 수 있어요.'
        case 'MISSING_REQUIRED_FIELD':
          return '추가할 사진을 선택해 주세요.'
        case 'INVALID_PHOTO_URL':
          return '업로드된 room-photos URL과 카테고리를 확인해 주세요.'
        case 'PHOTO_ADD_FAILED':
          return '사진 추가에 실패했어요. 잠시 후 다시 시도해 주세요.'
        default:
          if (typeof record.message === 'string' && record.message.trim()) {
            return record.message
          }
      }
    }
  }
  if (error instanceof Error && error.message) return error.message
  return '사진 추가에 실패했어요.'
}
