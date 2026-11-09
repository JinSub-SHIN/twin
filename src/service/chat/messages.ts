import { authHeaders } from '@/lib/authStorage'
import { apiRequest, ApiError } from '@/service/http'
import type {
  ChatMessagesResponse,
  SendChatMessageBody,
  SendChatMessageResponse,
} from './types'

export function getChatMessages(chatRoomId: string, after?: string) {
  const params = new URLSearchParams()
  if (after?.trim()) params.set('after', after.trim())
  const query = params.toString()
  const path = `/chat/rooms/${encodeURIComponent(chatRoomId)}/messages${
    query ? `?${query}` : ''
  }`
  return apiRequest<ChatMessagesResponse>(path, {
    headers: authHeaders(),
  })
}

export function sendChatMessage(chatRoomId: string, body: SendChatMessageBody) {
  return apiRequest<SendChatMessageResponse>(
    `/chat/rooms/${encodeURIComponent(chatRoomId)}/messages`,
    {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )
}

export function chatErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'body' in error) {
    const body = (error as { body: unknown }).body
    if (body && typeof body === 'object') {
      const record = body as { code?: string; message?: string }
      switch (record.code) {
        case 'MISSING_TOKEN':
        case 'INVALID_TOKEN':
          return '로그인이 필요해요. 다시 로그인해 주세요.'
        case 'CHAT_ROOM_NOT_FOUND':
          return '채팅방을 찾을 수 없어요.'
        case 'FORBIDDEN':
          return '이 채팅방에 참여할 수 없어요.'
        case 'BLOCKED':
          return '차단된 상대와는 새 메시지를 보낼 수 없어요.'
        case 'MISSING_REQUIRED_FIELD':
          return '메시지를 입력해 주세요.'
        case 'INVALID_CONTENT':
          return '보낼 수 없는 표현이 포함되어 있어요.'
        default:
          if (typeof record.message === 'string' && record.message.trim()) {
            return record.message
          }
      }
    }
  }
  if (error instanceof ApiError && error.message) return error.message
  if (error instanceof Error && error.message) return error.message
  return '요청을 처리하지 못했어요.'
}
