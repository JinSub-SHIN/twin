export type ListingStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'PAUSED'
  | 'MATCHING'
  | 'MATCHED'
  | 'CLOSED'

export type InquiryStatus =
  | 'OPEN'
  | 'CHATTING'
  | 'MATCH_REQUESTED'
  | 'MATCHED'
  | 'REJECTED'

export type ShareType = 'private-room' | 'shared-room' | 'living' | 'other'
export type HouseType = 'studio' | 'two' | 'three' | 'other'
export type SharedArea = 'living' | 'kitchen' | 'bath' | 'balcony'
export type Smoking = 'no' | 'indoor-no' | 'yes'
export type Drink = 'none' | 'sometimes' | 'often'
export type Pet = 'none' | 'have' | 'ok'
export type LifeRhythm = 'morning' | 'evening' | 'flex'
export type CleanLevel = 'high' | 'normal' | 'easy'
export type NoiseLevel = 'quiet' | 'normal' | 'ok'
export type PrefGender = 'any' | 'male' | 'female'
export type PrefAge = '20s' | '30s' | '40s'
export type PrefJob = 'worker' | 'student' | 'freelance' | 'any'
export type Utilities = 'separate' | 'included'

export type ListingPhoto = {
  id: string
  url: string
  label: string
  cover: boolean
}

export type RoommateListing = {
  id: string
  mine: boolean
  status: ListingStatus
  title: string
  intro: string
  area: {
    city: string
    district: string
    dong: string
    roadAddress: string
    detailAddress: string
    stationName: string
    stationLines: string[]
    walkMinutes: number
  }
  space: {
    shareType: ShareType
    houseType: HouseType
    sharedAreas: SharedArea[]
    furnished: boolean
    description: string
  }
  photos: ListingPhoto[]
  price: {
    depositMan: number | null
    rentMan: number | null
    maintenanceMan: number | null
    utilities: Utilities
  }
  living: {
    smoking: Smoking
    drink: Drink
    pet: Pet
    rhythm: LifeRhythm
    clean: CleanLevel
    noise: NoiseLevel
  }
  preference: {
    gender: PrefGender
    age: PrefAge | ''
    job: PrefJob | ''
    tags: string[]
  }
  host: {
    nickname: string
    gender: 'female' | 'male' | 'other'
    ageGroup: string
    job: string
    residing: boolean
    joinedAt: string
    verified: boolean
    message: string
  }
  stats: { views: number; saves: number; inquiries: number }
}

export type ListingDraft = Omit<RoommateListing, 'id' | 'status' | 'stats' | 'mine'> & {
  id?: string
}

export type ChatMessage = {
  id: string
  from: 'me' | 'host'
  text: string
  at: string
}

export type InquiryThread = {
  id: string
  listingId: string
  status: InquiryStatus
  messages: ChatMessage[]
}
