import type { ListingDetailData } from './types'

const PHOTO = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`

export const MOCK_LISTING_DETAIL: ListingDetailData = {
  id: 'mock',
  kindLabel: '월세 함께 나누기',
  area: {
    city: '서울시',
    district: '강남구',
    dong: '역삼동',
    station: { name: '역삼역', lines: ['seoul_2'], walkMinutes: 8 },
  },
  title: '지금 있는 집의 여유 공간,\n함께 사용할 동거인을 찾고 있어요',
  intro: '조용하고 깔끔한 집에서 편하게 함께 생활하실 분을 기다리고 있어요.',
  photos: [
    { id: 'living', label: '거실', url: PHOTO('photo-1586023492125-27b2c045efd7') },
    { id: 'room', label: '침실', url: PHOTO('photo-1505693416388-ac5ce068fe85') },
    { id: 'kitchen', label: '주방', url: PHOTO('photo-1556911220-bff31c812dba') },
    { id: 'bath', label: '화장실', url: PHOTO('photo-1552321554-5fefe8c9ef14') },
    { id: 'window', label: '창가', url: PHOTO('photo-1493809842364-78817add7ffb') },
    { id: 'entry', label: '현관', url: PHOTO('photo-1484154218962-a197022b5858') },
  ],
  recruitCount: 1,
  moveIn: '즉시 입주 가능',
  cost: {
    monthlyMan: 45,
    depositMan: 300,
    maintenanceMan: 10,
    utilitiesIncluded: false,
  },
  space: {
    description:
      '현재 거주 중인 집의 빈 방을 함께 사용해요. 방은 따로 쓰고, 거실과 주방, 화장실은 함께 써요.',
    privateRoom: '개인 침실 1개',
    sharedAreas: ['거실', '주방', '화장실'],
    furnished: true,
    notes: ['침대 · 책상 · 옷장 기본 제공', '세탁기 · 냉장고 함께 사용', '엘리베이터 있는 건물'],
  },
  living: {
    smoking: 'no',
    pet: 'no',
    drink: 'sometimes',
    prefGender: 'any',
    lifeTime: '밤에는 조용히 쉬는 편이에요',
  },
  host: {
    nickname: '김진우',
    gender: 'male',
    ageGroup: '30대',
    job: '직장인',
    residing: true,
    joinedAt: '2026년 3월',
    verified: true,
    message:
      '현재 이 집에 거주하고 있어요. 서로 편하게 생활할 수 있는 분을 찾고 있습니다 :)',
  },
  preferTags: ['깔끔한 분', '비흡연', '조용한 생활', '반려동물 없음', '직장인'],
}

export function getMockListingDetail(id: string): ListingDetailData {
  return { ...MOCK_LISTING_DETAIL, id }
}
