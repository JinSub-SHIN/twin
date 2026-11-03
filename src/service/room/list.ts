import { authHeaders } from '@/lib/authStorage'
import { apiRequest } from '@/service/http'
import type {
  RoomCountResponse,
  RoomDetail,
  RoomListQuery,
  RoomListResponse,
} from './types'

const PAGE_SIZE = 7

const QUERY_KEYS: (keyof RoomListQuery)[] = [
  'region',
  'district',
  'subway_stn',
  'walk_min_max',
  'page',
  'limit',
  'house_type',
  'smoking_policy',
  'drink_freq',
  'pet_policy',
  'noise_lifestyle',
  'clean_importance',
  'pref_gender',
  'pref_age_range',
  'pref_job',
  'rent_min',
  'rent_max',
]

const COUNT_KEYS = QUERY_KEYS.filter(
  (key): key is Exclude<keyof RoomListQuery, 'page' | 'limit'> =>
    key !== 'page' && key !== 'limit',
)

function appendQueryParams(params: URLSearchParams, query: RoomListQuery, keys: typeof QUERY_KEYS) {
  for (const key of keys) {
    const value = query[key]
    if (value === undefined || value === null || value === '') continue
    params.set(key, String(value))
  }
}

export function getRoomList(query: RoomListQuery = {}) {
  const params = new URLSearchParams()
  appendQueryParams(params, query, QUERY_KEYS)
  if (!params.has('page')) params.set('page', String(query.page ?? 1))
  if (!params.has('limit')) params.set('limit', String(query.limit ?? PAGE_SIZE))

  return apiRequest<RoomListResponse>(`/room/list?${params.toString()}`, {
    headers: authHeaders(),
  })
}

export type RoomCountQuery = Omit<RoomListQuery, 'page' | 'limit'>

export function getRoomCount(query: RoomCountQuery = {}, options: RequestInit = {}) {
  const params = new URLSearchParams()
  appendQueryParams(params, query, COUNT_KEYS)

  const headers = new Headers(options.headers)
  const auth = authHeaders()
  if (auth) {
    for (const [key, value] of Object.entries(auth)) {
      if (!headers.has(key)) headers.set(key, value as string)
    }
  }

  return apiRequest<RoomCountResponse>(`/room/count?${params.toString()}`, {
    ...options,
    headers,
  })
}

export function getRoom(id: string) {
  return apiRequest<RoomDetail>(`/room/${encodeURIComponent(id)}`, {
    headers: authHeaders(),
  })
}
