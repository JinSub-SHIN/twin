import type { ListingDraft } from '@/features/roommate/types'
import { normalizePhotoCategory } from '@/lib/roomRegister/normalizePhotoCategory'
import type { RoomRegisterBody } from '@/service/room/registerTypes'

const HOUSE: Record<string, string> = {
  studio: '원룸',
  two: '투룸',
  three: '쓰리룸 이상',
  other: '기타',
}

const AREA: Record<string, string> = {
  living: '거실',
  kitchen: '주방',
  bath: '화장실',
  balcony: '베란다',
}

const SMOKING: Record<string, string> = {
  no: '비흡연',
  'indoor-no': '실내 금연',
  yes: '흡연 가능',
}

const DRINK: Record<string, string> = {
  none: '안 함',
  sometimes: '가끔 마셔요',
  often: '자주 마셔요',
}

const PET: Record<string, string> = {
  none: '반려동물 없음',
  have: '키우고 있어요',
  ok: '함께해도 좋아요',
}

const RHYTHM: Record<string, string> = {
  morning: '아침형',
  evening: '저녁형',
  flex: '자유로운 편',
}

const CLEAN: Record<string, string> = {
  high: '매우 중요해요',
  normal: '중요한 편이에요',
  easy: '편하게 지내요',
}

const NOISE: Record<string, string> = {
  quiet: '조용한 생활',
  normal: '일반적인 생활',
  ok: '소음 괜찮아요',
}

const JOB: Record<string, string> = {
  worker: '직장인',
  student: '학생',
  freelance: '프리랜서',
}

const AGE: Record<string, string> = {
  '20s': '20',
  '30s': '30',
  '40s': '40',
}

export function mapDraftToRegisterBody(
  draft: ListingDraft,
  photos: { url: string; category?: string | null }[],
): RoomRegisterBody {
  const { space, price, living, preference, area, register, consent } = draft
  const prefGender = (preference.gender || 'any') as 'any' | 'male' | 'female'

  const body: RoomRegisterBody = {
    house_type: space.houseType ? HOUSE[space.houseType] : undefined,
    house_type_input:
      space.houseType === 'other' ? register.houseTypeInput.trim() || null : null,
    shared_spaces: space.sharedAreas.map(a => AREA[a]).filter(Boolean),
    photos: photos.map(p => ({
      url: p.url,
      category: normalizePhotoCategory(p.category ?? null),
    })),
    photo_public: register.photoPublic,
    rent: price.rentMan ?? 0,
    maint_fee: price.maintenanceMan ?? null,
    utility_separate: price.utilities === 'separate',
    share_percent: price.sharePercent,
    recruit_count: register.recruitCount,
    move_in_type: register.moveInType,
    private_room_count: register.privateRoomCount,
    furniture_included: space.furnished,
    smoking_policy: living.smoking ? SMOKING[living.smoking] : undefined,
    drink_freq: living.drink ? DRINK[living.drink] : undefined,
    pet_policy: living.pet ? PET[living.pet] : undefined,
    activity_time: living.rhythm ? RHYTHM[living.rhythm] : undefined,
    clean_importance: living.clean ? CLEAN[living.clean] : undefined,
    noise_lifestyle: living.noise ? NOISE[living.noise] : undefined,
    pref_gender: prefGender,
    restrict_gender:
      prefGender !== 'any' ? register.restrictGender : false,
    pref_age_range:
      !preference.age || preference.age === 'any'
        ? null
        : AGE[preference.age] ?? null,
    pref_job:
      !preference.job || preference.job === 'any'
        ? null
        : JOB[preference.job] ?? null,
    pref_tags: preference.tags.length ? [...preference.tags] : [],
    region: area.city,
    district: area.district,
    dong: area.dong.trim() || null,
    road_address: area.roadAddress.trim() || null,
    detail_address: area.detailAddress.trim() || null,
    subway_stn: area.stationName.trim() || null,
    walk_min: area.stationName.trim() ? area.walkMinutes : null,
    title: draft.title.replace(/\s+/g, ' ').trim() || null,
    bio: draft.intro.trim().slice(0, 200) || null,
    profile_agree: consent.profileAgree,
    location_agree: consent.locationAgree,
    push_agree: consent.pushAgree,
    marketing_agree: consent.marketingAgree,
  }

  return body
}
