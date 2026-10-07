import { authHeaders } from '@/lib/authStorage'
import { apiRequest } from '@/service/http'
import type { RoomDetail, RoomListQuery, RoomListResponse } from './types'

const PAGE_SIZE = 7

export function getRoomList(query: RoomListQuery = {}) {
  const params = new URLSearchParams()
  const region = query.region?.trim()
  const station = query.subway_stn?.trim()
  if (region) params.set('region', region)
  if (station) params.set('subway_stn', station)
  params.set('page', String(query.page ?? 1))
  params.set('limit', String(query.limit ?? PAGE_SIZE))

  return apiRequest<RoomListResponse>(`/room/list?${params.toString()}`, {
    headers: authHeaders(),
  })
}

export function getRoom(id: string) {
  return apiRequest<RoomDetail>(`/room/${encodeURIComponent(id)}`, {
    headers: authHeaders(),
  })
}
