export type ApplyStatus = 'pending' | 'accepted' | 'rejected'

export type ChatRoomSummary = {
  chat_room_id: string
  room_id: string
  room_district: string | null
  room_subway_stn: string | null
  partner_nick: string
  is_owner: boolean
  apply_id: string | null
  apply_status: ApplyStatus | null
  /** 읽지 않은 메시지 수 (API 미제공 시 0) */
  unread_count?: number | null
  created_at: string
}

export type ChatRoomsResponse = {
  rooms: ChatRoomSummary[]
}

export type ChatMessageType = 'text' | 'system'

export type ApiChatMessage = {
  id: string
  sender_id: string
  content: string
  type: ChatMessageType
  created_at: string
}

export type ChatMessagesResponse = {
  messages: ApiChatMessage[]
}

export type SendChatMessageBody = {
  content: string
}

export type SendChatMessageResponse = {
  message: ApiChatMessage
}
