export type ListingPhoto = {
  id: string
  url?: string
  label: string
}

export type ListingCost = {
  /** 만원 단위. null 이면 직접 조율 */
  monthlyMan: number | null
  depositMan: number | null
  maintenanceMan: number | null
  utilitiesIncluded: boolean
}

export type ListingSpace = {
  description: string
  privateRoom: string
  sharedAreas: string[]
  furnished: boolean
  notes: string[]
}

export type LivingPolicy = {
  smoking: 'no' | 'outdoor' | 'yes'
  pet: 'no' | 'yes'
  drink: 'none' | 'sometimes' | 'often'
  prefGender: 'any' | 'female' | 'male'
  lifeTime: string
}

export type ListingHost = {
  nickname: string
  photoUrl?: string
  gender: 'female' | 'male' | 'other'
  ageGroup: string
  job: string
  residing: boolean
  joinedAt: string
  verified: boolean
  message: string
}

export type ListingArea = {
  city: string
  district: string
  dong: string
  station?: { name: string; lines: string[]; walkMinutes?: number }
}

export type ListingDetailData = {
  id: string
  area: ListingArea
  title: string
  intro: string
  photos: ListingPhoto[]
  recruitCount: number
  moveIn: string
  cost: ListingCost
  space: ListingSpace
  living: LivingPolicy
  host: ListingHost
  preferTags: string[]
}
