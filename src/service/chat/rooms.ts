import { authHeaders } from '@/lib/authStorage'
import { apiRequest } from '@/service/http'
import type { ChatRoomsResponse } from './types'

const CACHE_MS = 1500

let inflight: Promise<ChatRoomsResponse> | null = null
let cached: { data: ChatRoomsResponse; at: number } | null = null

/** 채팅방 목록 — 동시 호출은 한 요청으로 합치고, 짧게 캐시 */
export function getChatRooms(options?: { force?: boolean }) {
  const now = Date.now()
  if (!options?.force && cached && now - cached.at < CACHE_MS) {
    return Promise.resolve(cached.data)
  }
  if (inflight) return inflight

  inflight = apiRequest<ChatRoomsResponse>('/chat/rooms', {
    headers: authHeaders(),
  })
    .then((data) => {
      cached = { data, at: Date.now() }
      return data
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function clearChatRoomsCache() {
  cached = null
}

export type LeaveChatRoomResponse = {
  success: boolean
}

/** 채팅방 나가기 — 목록에서 숨김 */
export function leaveChatRoom(chatRoomId: string) {
  return apiRequest<LeaveChatRoomResponse>(
    `/chat/rooms/${encodeURIComponent(chatRoomId)}`,
    {
      method: 'DELETE',
      headers: authHeaders(),
    },
  )
}
