import { houseGallery } from '@/lib/housePhotos'
import { optionLabel } from '@/lib/listingView'
import type { RoomDetail } from '@/service/room'
import {
  CLEAN_FREQ_OPTIONS,
  DRINK_OPTIONS,
  HOME_TIME_OPTIONS,
  JOB_OPTIONS,
  PERSONALITY_OPTIONS,
  type CleanFreq,
  type DrinkFreq,
  type HomeTime,
  type JobType,
  type Personality,
} from '@/types/user'
import type { Drink, PrefGender, RoommateListing, Smoking } from './types'

function manOf(value: number | string | null | undefined) {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value.trim())) return Number(value)
  return null
}

function stationName(value: string | null | undefined) {
  const text = value?.trim()
  if (!text) return ''
  return text.endsWith('역') ? text : `${text}역`
}

function ageGroup(age: number | null) {
  if (age == null) return ''
  if (age < 30) return '20대'
  if (age < 40) return '30대'
  return '40대 이상'
}

function hostGender(gender: string): RoommateListing['host']['gender'] {
  if (gender === 'female' || gender === 'male' || gender === 'other') return gender
  return 'other'
}

function prefGender(value: string | null | undefined): PrefGender {
  if (value === 'male' || value === 'female' || value === 'any') return value
  return 'any'
}

function smokingOf(room: RoomDetail): Smoking {
  if (room.smoking === 'cigarette') return 'yes'
  if (room.smoking === 'e_cig') return 'indoor-no'
  if (room.smoking === 'none' || room.avoid_smoke) return 'no'
  return 'no'
}

function drinkOf(room: RoomDetail): Drink {
  if (room.avoid_drink || room.drink_freq === 'never') return 'none'
  if (room.drink_freq === 'often') return 'often'
  if (room.drink_freq === 'sometimes') return 'sometimes'
  return 'sometimes'
}

function labeled<T extends string>(
  options: { value: T; label: string }[],
  value: string | null | undefined,
) {
  if (!value) return ''
  return optionLabel(options, value as T) ?? value
}

function preferTags(room: RoomDetail) {
  const tags: string[] = []
  if (room.avoid_smoke || room.smoking === 'none') tags.push('비흡연')
  if (room.avoid_pet) tags.push('반려동물없음')
  if (room.avoid_drink || room.drink_freq === 'never') tags.push('음주없음')
  if (room.pers_type === 'quiet') tags.push('조용한생활')
  const job = labeled(JOB_OPTIONS, room.job)
  if (job) tags.push(job)
  if (room.pref_gender === 'female') tags.push('여성')
  if (room.pref_gender === 'male') tags.push('남성')
  return tags
}

export function roomToRoommateListing(room: RoomDetail): RoommateListing {
  const place = [room.region?.trim(), room.district?.trim()].filter(Boolean).join(' ')
  const station = stationName(room.subway_stn)
  const bio = room.bio?.trim() ?? ''
  const job = labeled(JOB_OPTIONS, room.job as JobType | null)
  const home = labeled(HOME_TIME_OPTIONS, room.home_time as HomeTime | null)
  const clean = labeled(CLEAN_FREQ_OPTIONS, room.clean_freq as CleanFreq | null)
  const drink = labeled(DRINK_OPTIONS, room.drink_freq as DrinkFreq | null)
  const personality = labeled(PERSONALITY_OPTIONS, room.pers_type as Personality | null)
  const shareTotal = manOf(room.share_total)
  const shareRent = manOf(room.share_rent)
  const shareMaint = manOf(room.share_maint)

  return {
    id: room.id,
    mine: false,
    status: 'PUBLISHED',
    title: '지금 살고 있는 집에서\n함께 생활할 동거인을 찾아요',
    intro: bio || `${place || '이 집'}에서 편하게 함께 지낼 분을 기다리고 있어요.`,
    area: {
      city: room.region?.trim() || '',
      district: room.district?.trim() || '',
      dong: '',
      roadAddress: '',
      detailAddress: '',
      stationName: station,
      stationLines: room.subway_line ?? [],
      walkMinutes: 0,
    },
    space: {
      shareType: 'private-room',
      houseType: 'two',
      sharedAreas: ['living', 'kitchen', 'bath'],
      furnished: true,
      description:
        bio ||
        '지금 살고 있는 집의 빈 공간을 함께 써요. 개인 공간은 따로 두고, 거실과 주방, 화장실은 함께 사용해요.',
    },
    photos: houseGallery(room.id),
    price: {
      depositMan: null,
      rentMan: shareTotal ?? shareRent ?? manOf(room.rent),
      maintenanceMan: shareTotal == null ? (shareMaint ?? manOf(room.maint_fee)) : null,
      utilities: 'separate',
    },
    living: {
      smoking: smokingOf(room),
      drink: drinkOf(room),
      pet: room.avoid_pet ? 'none' : 'ok',
      rhythm: room.home_time === 'mostly' ? 'evening' : room.home_time === 'rarely' ? 'morning' : 'flex',
      clean: room.clean_freq === 'daily' ? 'high' : room.clean_freq === 'rarely' ? 'easy' : 'normal',
      noise: room.pers_type === 'quiet' ? 'quiet' : room.pers_type === 'outgoing' ? 'ok' : 'normal',
    },
    preference: {
      gender: prefGender(room.pref_gender),
      age: '',
      job:
        room.job === 'employee'
          ? 'worker'
          : room.job === 'student'
            ? 'student'
            : room.job === 'freelancer'
              ? 'freelance'
              : room.job
                ? 'any'
                : '',
      tags: preferTags(room),
    },
    host: {
      nickname: room.nick?.trim() || '호스트',
      gender: hostGender(room.gender),
      ageGroup: ageGroup(room.age),
      job,
      residing: true,
      joinedAt: '',
      verified: false,
      message:
        bio ||
        [personality && `성격은 ${personality} 편이에요`, home && `집에는 ${home}`, drink && `음주는 ${drink}`, clean && `청소는 ${clean}`]
          .filter(Boolean)
          .join('. ') ||
        '지금 이 집에서 함께 생활할 분을 찾고 있어요.',
    },
    stats: { views: 0, saves: 0, inquiries: 0 },
  }
}
