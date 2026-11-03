import { authHeaders } from '@/lib/authStorage'
import { apiRequest } from '@/service/http'

export type RoomAddressSearchResult = {
  road_address: string | null
  subway_stn: string | null
  subway_line: string[] | null
  distance_m: number | null
  walk_min: number | null
}

export type RoomAddressSearchQuery = {
  q: string
  region?: string
  limit?: number
  signal?: AbortSignal
}

export function searchRoomAddress(query: RoomAddressSearchQuery) {
  const params = new URLSearchParams()
  params.set('q', query.q.trim())
  const region = query.region?.trim()
  if (region) params.set('region', region)
  if (query.limit != null) params.set('limit', String(query.limit))

  return apiRequest<RoomAddressSearchResult>(
    `/room/address-search?${params.toString()}`,
    {
      headers: authHeaders(),
      signal: query.signal,
    },
  )
}
