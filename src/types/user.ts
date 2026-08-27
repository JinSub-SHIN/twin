export type SocialProvider = 'kakao' | 'naver' | 'apple' | 'email'

export type Gender = 'male' | 'female' | 'other'

export type UserProfile = {
  provider: SocialProvider
  nickname: string
  birthDate: string
  gender: Gender
  phone: string
  agreedTerms: boolean
  agreedPrivacy: boolean
  photoUrl?: string
  region?: string
  agreedLocation?: boolean
  createdAt: string
}

/** 기본 가입 정보만 있으면 80%. 나머지(사진/지역/위치)는 이후 입력 */
export function getProfileCompletion(user: UserProfile | null): number {
  if (!user) return 0

  const hasBasics =
    Boolean(user.provider) &&
    Boolean(user.nickname.trim()) &&
    Boolean(user.birthDate) &&
    Boolean(user.gender) &&
    Boolean(user.phone.trim()) &&
    user.agreedTerms &&
    user.agreedPrivacy

  if (!hasBasics) return 0

  let score = 80
  if (user.photoUrl) score += 7
  if (user.region) score += 7
  if (user.agreedLocation) score += 6
  return Math.min(100, score)
}

export function getAgeGroup(birthDate: string): string {
  if (!birthDate) return ''
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return ''
  const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  if (age < 20) return '10대'
  if (age < 30) return '20대'
  if (age < 40) return '30대'
  if (age < 50) return '40대'
  return '50대+'
}
