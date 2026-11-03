import type { RoomPhotoInput } from './photoTypes'

export type RoomRegisterPhoto = RoomPhotoInput

export type RoomRegisterBody = {
  house_type?: string
  house_type_input?: string | null
  shared_spaces?: string[]
  photos?: RoomRegisterPhoto[]
  photo_public?: boolean
  rent: number
  maint_fee?: number | null
  utility_separate?: boolean
  share_percent?: number
  recruit_count?: number
  move_in_type?: 'immediate' | 'this_month' | 'negotiate'
  private_room_count?: number
  furniture_included?: boolean
  smoking_policy?: string
  drink_freq?: string
  pet_policy?: string
  activity_time?: string
  clean_importance?: string
  noise_lifestyle?: string
  pref_gender: 'any' | 'male' | 'female'
  restrict_gender?: boolean
  pref_age_range?: string | null
  pref_job?: string | null
  pref_tags?: string[]
  region: string
  district: string
  dong?: string | null
  road_address?: string | null
  detail_address?: string | null
  subway_stn?: string | null
  walk_min?: number | null
  title?: string | null
  bio?: string | null
  profile_agree: boolean
  location_agree?: boolean
  push_agree?: boolean
  marketing_agree?: boolean
}

export type RoomRegisterResponse = {
  success: boolean
}

export type RoomRegisterErrorBody = {
  code?: string
  message?: string
  error?: string
}
