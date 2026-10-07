import { authHeaders } from '@/lib/authStorage'
import { apiRequest } from '@/service/http'
import type { StationSearchQuery, StationSearchResponse } from './types'

export function searchStations(query: StationSearchQuery) {
  const params = new URLSearchParams()
  params.set('q', query.q.trim())
  const region = query.region?.trim()
  if (region) params.set('region', region)
  params.set('limit', String(query.limit ?? 20))

  return apiRequest<StationSearchResponse>(
    `/room/station-search?${params.toString()}`,
    {
      headers: authHeaders(),
      signal: query.signal,
    },
  )
}
