export type SocialProvider = 'kakao' | 'naver' | 'apple' | 'email'

export type Gender = 'male' | 'female' | 'other'

/** sjj_user.job */
export type JobType =
  | 'employee'
  | 'student'
  | 'jobseeker'
  | 'freelancer'
  | 'other'

/** 성격 (구 noise_lvl 자리를 성격으로 사용) */
export type Personality = 'quiet' | 'normal' | 'outgoing'

/** 흡연 여부 */
export type SmokingType = 'none' | 'e_cig' | 'cigarette'

/** 반려동물 종류 */
export type PetKind = 'dog' | 'cat' | 'other'

/** sjj_pref.drink_freq */
export type DrinkFreq = 'never' | 'sometimes' | 'often'

/** sjj_pref.home_time */
export type HomeTime = 'rarely' | 'moderate' | 'mostly'

/** sjj_pref.clean_freq */
export type CleanFreq = 'daily' | 'weekly' | 'biweekly' | 'rarely'

/** sjj_pref.pref_gender */
export type PrefGender = 'male' | 'female' | 'any'

/** 추가정보 진입 케이스: 방 있음(룸메 구함) / 방 구함 */
export type SeekRole = 'has_room' | 'needs_room'

export type PetInfo = {
  kind: PetKind
  /** kind === other 일 때 직접 입력 (필수) */
  kindOther?: string
  name?: string
  note?: string
}

/**
 * sjj_pref — 프로필 추가정보에서 쓰는 선호/생활 조건
 * (방 등록·매칭·인증 테이블은 별도 플로우)
 */
export type UserPref = {
  seekRole?: SeekRole
  regions?: string[]
  sleepHour?: number
  wakeHour?: number
  personality?: Personality
  smoking?: boolean
  smokingType?: SmokingType
  pet?: boolean
  petInfo?: PetInfo
  cook?: boolean
  wfh?: boolean
  drinkFreq?: DrinkFreq
  homeTime?: HomeTime
  cleanFreq?: CleanFreq
  prefGender?: PrefGender
  ageMin?: number
  ageMax?: number
  budgetMin?: number
  budgetMax?: number
  noSmoker?: boolean
  noPet?: boolean
  noNoise?: boolean
  noDrink?: boolean
  noHomebody?: boolean
  noMessy?: boolean
}

export type UserProfile = {
  provider: SocialProvider
  /** 일반 회원가입(email)일 때만 사용 */
  loginId?: string
  nickname: string
  birthDate: string
  gender: Gender
  phone: string
  agreedTerms: boolean
  agreedPrivacy: boolean
  /** sjj_user.avatar_url */
  photoUrl?: string
  /** sjj_user.bio */
  bio?: string
  /** sjj_user.job */
  job?: JobType
  /** job === other 일 때 직접 입력 */
  jobOther?: string
  /** sjj_user.location_at 동의 여부 */
  agreedLocation?: boolean
  /** sjj_pref */
  pref?: UserPref
  createdAt: string
}

export const SEEK_ROLE_OPTIONS: {
  value: SeekRole
  title: string
  desc: string
}[] = [
  {
    value: 'has_room',
    title: '이미 월세를 내고 있어요',
    desc: '같이 살 사람을 구하고 있어요.',
  },
  {
    value: 'needs_room',
    title: '아직 방이 없어요',
    desc: '들어갈 집·방을 같이 구하고 있어요.',
  },
]

export const JOB_OPTIONS: { value: JobType; label: string }[] = [
  { value: 'employee', label: '직장인' },
  { value: 'student', label: '학생' },
  { value: 'jobseeker', label: '취업준비생' },
  { value: 'freelancer', label: '프리랜서' },
  { value: 'other', label: '기타' },
]

export const PERSONALITY_OPTIONS: { value: Personality; label: string }[] = [
  { value: 'quiet', label: '조용함' },
  { value: 'normal', label: '보통' },
  { value: 'outgoing', label: '활발함' },
]

export const SMOKING_OPTIONS: { value: SmokingType; label: string }[] = [
  { value: 'none', label: '안함' },
  { value: 'e_cig', label: '전자담배' },
  { value: 'cigarette', label: '연초' },
]

export const PET_KIND_OPTIONS: { value: PetKind; label: string }[] = [
  { value: 'dog', label: '강아지' },
  { value: 'cat', label: '고양이' },
  { value: 'other', label: '기타' },
]

export const DRINK_OPTIONS: { value: DrinkFreq; label: string }[] = [
  { value: 'never', label: '안 마심' },
  { value: 'sometimes', label: '가끔' },
  { value: 'often', label: '자주' },
]

export const HOME_TIME_OPTIONS: { value: HomeTime; label: string }[] = [
  { value: 'rarely', label: '거의 없음' },
  { value: 'moderate', label: '보통' },
  { value: 'mostly', label: '대부분 집' },
]

export const CLEAN_FREQ_OPTIONS: { value: CleanFreq; label: string }[] = [
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '주 1회' },
  { value: 'biweekly', label: '격주' },
  { value: 'rarely', label: '거의 안 함' },
]

export const PREF_GENDER_OPTIONS: { value: PrefGender; label: string }[] = [
  { value: 'any', label: '상관없음' },
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
]

function hasLifestyle(pref?: UserPref): boolean {
  if (!pref) return false
  return (
    pref.sleepHour != null ||
    pref.wakeHour != null ||
    Boolean(pref.personality) ||
    Boolean(pref.smokingType) ||
    pref.pet === true ||
    Boolean(pref.drinkFreq) ||
    Boolean(pref.homeTime) ||
    Boolean(pref.cleanFreq) ||
    pref.cook === true ||
    pref.wfh === true
  )
}

function hasHope(pref?: UserPref): boolean {
  if (!pref) return false
  return (
    Boolean(pref.prefGender) ||
    pref.ageMin != null ||
    pref.ageMax != null ||
    pref.budgetMin != null ||
    pref.budgetMax != null ||
    pref.noSmoker === true ||
    pref.noPet === true ||
    pref.noNoise === true ||
    pref.noDrink === true ||
    pref.noHomebody === true ||
    pref.noMessy === true
  )
}

/** 기본 가입 80%. 추가정보로 나머지 채움 */
export function getProfileCompletion(user: UserProfile | null): number {
  if (!user) return 0

  const hasBasics =
    Boolean(user.provider) &&
    Boolean(user.nickname.trim()) &&
    Boolean(user.birthDate) &&
    Boolean(user.gender) &&
    Boolean(user.phone.trim()) &&
    user.agreedTerms &&
    user.agreedPrivacy &&
    (user.provider !== 'email' || Boolean(user.loginId?.trim()))

  if (!hasBasics) return 0

  let score = 80
  if (user.job) score += 5
  if (user.pref?.regions && user.pref.regions.length > 0) score += 5
  if (hasLifestyle(user.pref)) score += 5
  if (hasHope(user.pref)) score += 3
  if (user.agreedLocation) score += 2
  return Math.min(100, score)
}

export function getAdditionalRemaining(user: UserProfile): string[] {
  return [
    !user.job ? '직업' : null,
    !(user.pref?.regions && user.pref.regions.length > 0) ? '희망 지역' : null,
    !hasLifestyle(user.pref) ? '생활 습관' : null,
    !hasHope(user.pref) ? '희망 조건' : null,
    !user.agreedLocation ? '위치정보 동의' : null,
  ].filter((v): v is string => Boolean(v))
}

export function getAgeGroup(birthDate: string): string {
  if (!birthDate) return ''
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return ''
  const age = Math.floor(
    (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  )
  if (age < 20) return '10대'
  if (age < 30) return '20대'
  if (age < 40) return '30대'
  if (age < 50) return '40대'
  return '50대+'
}
