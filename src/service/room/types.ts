export type RoomListItem = {
  id: string
  nick: string
  gender: string
  age: number | null
  job: string | null
  region: string
  district: string
  dong?: string | null
  subway_stn: string | null
  subway_line?: string[] | null
  walk_min?: number | null
  title?: string | null
  pref_gender: string | null
  /** 직접조율이면 "직접조율" 같은 문자열로 내려옴 */
  share_total: number | string | null
  house_type?: string | null
  recruit_count?: number | null
  move_in_type?: 'immediate' | 'this_month' | 'negotiate' | string | null
  smoking_policy?: string | null
  pet_policy?: string | null
  noise_lifestyle?: string | null
  clean_importance?: string | null
  drink_freq?: string | null
  pref_tags?: string[] | null
  cover_photo?: string | null
}

export type RoomListResponse = {
  total: number
  page: number
  has_more: boolean
  list: RoomListItem[]
}

export type RoomCountResponse = {
  total: number
}

export type RoomListQuery = {
  region?: string
  district?: string
  subway_stn?: string
  walk_min_max?: number
  page?: number
  limit?: number
  house_type?: string
  smoking_policy?: string
  drink_freq?: string
  pet_policy?: string
  noise_lifestyle?: string
  clean_importance?: string
  pref_gender?: 'male' | 'female'
  pref_age_range?: string
  pref_job?: string
  rent_min?: number
  rent_max?: number
}

export type StationSearchItem = {
  name: string
  region: string
  lines: string[]
}

export type StationSearchResponse = {
  stations: StationSearchItem[]
}

export type StationSearchQuery = {
  q: string
  region?: string
  limit?: number
  signal?: AbortSignal
}

export type RoomDetail = RoomListItem & {
  locked: boolean
  rent: number | null
  maint_fee: number | null
  share_rent_type: string | null
  share_rent: number | null
  share_maint_type: string | null
  share_maint: number | null
  avoid_smoke: boolean
  avoid_drink: boolean
  avoid_pet: boolean
  bio: string | null
  sleep_hour: number | null
  wake_hour: number | null
  pers_type: string | null
  home_time: string | null
  clean_freq: string | null
  drink_freq: string | null
  smoking: string | null
}
