import type { ListingDetailData } from '@/pages/find/listingDetail/types'
import type { RoommateListing } from './types'

const SHARE: Record<RoommateListing['space']['shareType'], string> = {
  'private-room': '개인 침실 1개',
  'shared-room': '침실을 함께 사용',
  living: '거실 공간을 함께 사용',
  other: '여유 공간을 함께 사용',
}

const SMOKE = { no: 'no', 'indoor-no': 'outdoor', yes: 'yes' } as const
const DRINK = { none: 'none', sometimes: 'sometimes', often: 'often' } as const
const PET = { none: 'no', have: 'yes', ok: 'yes' } as const
const RHYTHM = {
  morning: '아침형으로 생활해요',
  evening: '밤에는 조용히 쉬는 편이에요',
  flex: '생활 시간은 비교적 자유로워요',
} as const

export function monthlyBurden(listing: Pick<RoommateListing, 'price'>) {
  const rent = listing.price.rentMan ?? 0
  const fee = listing.price.maintenanceMan ?? 0
  if (listing.price.rentMan == null && listing.price.maintenanceMan == null) return null
  return rent + fee
}

export function toListingDetail(listing: RoommateListing): ListingDetailData {
  const photos = [...listing.photos].sort((a, b) => Number(b.cover) - Number(a.cover))
  return {
    id: listing.id,
    area: {
      city: listing.area.city,
      district: listing.area.district,
      dong: listing.area.dong,
      station: listing.area.stationName
        ? {
            name: listing.area.stationName,
            lines: listing.area.stationLines ?? [],
            walkMinutes: listing.area.walkMinutes || undefined,
          }
        : undefined,
    },
    title: listing.title,
    intro: listing.intro,
    photos: photos.map((photo) => ({ id: photo.id, url: photo.url, label: photo.label })),
    recruitCount: 1,
    moveIn: '일정은 대화로 맞춰요',
    cost: {
      monthlyMan: monthlyBurden(listing),
      depositMan: listing.price.depositMan,
      maintenanceMan: listing.price.maintenanceMan,
      utilitiesIncluded: listing.price.utilities === 'included',
    },
    space: {
      description: listing.space.description,
      privateRoom: SHARE[listing.space.shareType],
      sharedAreas: listing.space.sharedAreas.map((area) => {
        const labels = { living: '거실', kitchen: '주방', bath: '화장실', balcony: '베란다' }
        return labels[area]
      }),
      furnished: listing.space.furnished,
      notes: [],
    },
    living: {
      smoking: SMOKE[listing.living.smoking],
      pet: PET[listing.living.pet],
      drink: DRINK[listing.living.drink],
      prefGender: listing.preference.gender,
      lifeTime: RHYTHM[listing.living.rhythm],
    },
    host: listing.host,
    preferTags: listing.preference.tags,
  }
}

export function areaLabel(listing: Pick<RoommateListing, 'area'>) {
  return [listing.area.city.replace('시', ''), listing.area.district, listing.area.dong]
    .filter(Boolean)
    .join(' ')
}
