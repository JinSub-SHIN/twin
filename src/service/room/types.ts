export type RoomListItem = {
  id: string
  nick: string
  gender: string
  age: number | null
  job: string | null
  region: string
  district: string
  subway_stn: string | null
  pref_gender: string | null
  /** 직접조율이면 "직접조율" 같은 문자열로 내려옴 */
  share_total: number | string | null
}

export type RoomListResponse = {
  total: number
  page: number
  has_more: boolean
  list: RoomListItem[]
}

export type RoomListQuery = {
  region?: string
  page?: number
  limit?: number
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
