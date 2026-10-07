import type { ListingDraft } from './types'

export function emptyDraft(): ListingDraft {
  return {
    title: '지금 살고 있는 집에서\n함께 생활할 사람을 찾아요',
    intro: '서로의 생활을 존중하면서 편하게 함께 지낼 분을 기다려요.',
    area: {
      city: '',
      district: '',
      dong: '',
      roadAddress: '',
      detailAddress: '',
      stationName: '',
      stationLines: [],
      walkMinutes: 10,
    },
    space: {
      shareType: 'private-room',
      houseType: 'two',
      sharedAreas: ['living', 'kitchen', 'bath'],
      furnished: true,
      description: '현재 거주 중인 집의 빈 공간을 함께 사용해요.',
    },
    photos: [],
    price: { depositMan: null, rentMan: null, maintenanceMan: null, utilities: 'separate' },
    living: {
      smoking: 'no',
      drink: 'sometimes',
      pet: 'none',
      rhythm: 'flex',
      clean: 'normal',
      noise: 'quiet',
    },
    preference: { gender: 'any', age: '', job: '', tags: [] },
    host: {
      nickname: '나',
      gender: 'female',
      ageGroup: '20대',
      job: '직장인',
      residing: true,
      joinedAt: '2026년 10월',
      verified: true,
      message: '지금 이 집에 살고 있어요. 서로 편한 분을 찾고 있습니다.',
    },
  }
}

export const PRESET_TAGS = [
  '비흡연',
  '깔끔한 분',
  '조용한 생활',
  '직장인',
  '반려동물 없음',
  '아침형',
  '학생',
]
