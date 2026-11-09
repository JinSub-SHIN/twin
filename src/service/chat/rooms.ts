import { authHeaders } from '@/lib/authStorage'
import { apiRequest } from '@/service/http'
import type { ChatRoomsResponse } from './types'

export function getChatRooms() {
  return apiRequest<ChatRoomsResponse>('/chat/rooms', {
    headers: authHeaders(),
  })
}
