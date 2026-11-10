import { authHeaders } from '@/lib/authStorage'
import { apiRequest } from '@/service/http'
import type { RoomPhotoCategory } from './photoTypes'

export type RoomTmpPhoto = {
  id: string
  url: string
  category: string | null
  created_at: string
}

export type RoomTmpPhotoListResponse = {
  photos: RoomTmpPhoto[]
}

export type RoomTmpPhotoAddResponse = {
  success: boolean
  photo: RoomTmpPhoto
}

export type RoomTmpPhotoDeleteResponse = {
  success: boolean
}

export function listTmpRoomPhotos() {
  return apiRequest<RoomTmpPhotoListResponse>('/room/photos/tmp', {
    method: 'GET',
    headers: authHeaders(),
  })
}

export function registerTmpRoomPhoto(body: {
  url: string
  category?: RoomPhotoCategory | null
}) {
  const payload: { url: string; category?: string } = { url: body.url }
  if (body.category) payload.category = body.category

  return apiRequest<RoomTmpPhotoAddResponse>('/room/photos/tmp', {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function deleteTmpRoomPhoto(photoId: string) {
  return apiRequest<RoomTmpPhotoDeleteResponse>(
    `/room/photos/tmp/${encodeURIComponent(photoId)}`,
    {
      method: 'DELETE',
      headers: authHeaders(),
    },
  )
}

export function tmpRoomPhotosErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'body' in error) {
    const body = (error as { body: unknown }).body
    if (body && typeof body === 'object') {
      const record = body as { code?: string; message?: string }
      switch (record.code) {
        case 'MISSING_TOKEN':
        case 'INVALID_TOKEN':
        case 'TOKEN_EXPIRED':
          return '로그인이 필요해요. 다시 로그인해 주세요.'
        case 'INVALID_PHOTO_URL':
          return '업로드된 임시 사진 URL을 확인해 주세요.'
        case 'PHOTO_LIMIT_EXCEEDED':
          return `등록 대기 중인 사진이 이미 최대 ${10}장이에요.`
        case 'INAPPROPRIATE_PHOTO':
          return '부적절한 사진은 등록할 수 없습니다. 다른 사진을 선택해 주세요.'
        case 'PHOTO_ADD_FAILED':
        case 'PHOTO_DELETE_FAILED':
        case 'PHOTO_LIST_FAILED':
          return '사진 처리에 실패했어요. 잠시 후 다시 시도해 주세요.'
        case 'PHOTO_NOT_FOUND':
          return '임시 사진을 찾을 수 없어요.'
        case 'FORBIDDEN':
          return '본인이 올린 사진만 삭제할 수 있어요.'
        default:
          if (typeof record.message === 'string' && record.message.trim()) {
            return record.message
          }
      }
    }
  }
  if (error instanceof Error && error.message) return error.message
  return '사진 처리에 실패했어요.'
}
