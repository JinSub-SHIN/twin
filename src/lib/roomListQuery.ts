import { cityOfRegion, districtOfRegion } from '@/lib/regions'
import type { ListingFilter } from '@/pages/find/filter/types'
import type { RoomListQuery } from '@/service/room/types'

const SMOKING: Record<string, string> = {
  no: '비흡연',
  'indoor-no': '실내 금연',
  yes: '흡연 가능',
}

const PET: Record<string, string> = {
  none: '반려동물 없음',
  have: '키우고 있어요',
  ok: '함께해도 좋아요',
}

const DRINK: Record<string, string> = {
  none: '안 함',
  sometimes: '가끔 마셔요',
  often: '자주 마셔요',
}

const NOISE: Record<string, string> = {
  quiet: '조용한 생활',
  active: '일반적인 생활',
}

const CLEAN: Record<string, string> = {
  tidy: '매우 중요해요',
  normal: '중요한 편이에요',
}

const PREF_AGE: Record<string, string> = {
  '20s': '20',
  '30s': '30',
  '40s': '40',
}

const PREF_JOB: Record<string, string> = {
  worker: '직장인',
  student: '학생',
  freelance: '프리랜서',
}

function stationParam(name?: string | null) {
  const text = name?.trim()
  if (!text) return undefined
  return text.endsWith('역') ? text : `${text}역`
}

/** 목록 API에 보낼 region/district (다중 구 선택 시 district 생략 → 클라이언트에서 추가 필터) */
export function listLocationOf(filter: ListingFilter, legacyRegions: string[]) {
  const station = filter.subwayStation?.trim()
  if (station) {
    return {
      region: filter.stationRegion?.trim() || undefined,
      district: undefined as string | undefined,
      subway_stn: stationParam(station),
    }
  }

  const fromFilter = filter.region?.trim()
  if (fromFilter) {
    const city = cityOfRegion(fromFilter)
    const district = districtOfRegion(fromFilter)
    return {
      region: city || undefined,
      district: district && district !== '전체' ? district : undefined,
      subway_stn: undefined as string | undefined,
    }
  }

  if (legacyRegions.length === 1) {
    const city = cityOfRegion(legacyRegions[0])
    const district = districtOfRegion(legacyRegions[0])
    return {
      region: city || undefined,
      district: district && district !== '전체' ? district : undefined,
      subway_stn: undefined as string | undefined,
    }
  }

  const cities = [...new Set(legacyRegions.map((r) => cityOfRegion(r)).filter(Boolean))]
  return {
    region: cities.length === 1 ? cities[0] : undefined,
    district: undefined as string | undefined,
    subway_stn: undefined as string | undefined,
  }
}

export function buildRoomListQuery(
  filter: ListingFilter,
  legacyRegions: string[],
  page: number,
  limit: number,
): RoomListQuery {
  const loc = listLocationOf(filter, legacyRegions)
  const extras = filter.extras ?? []

  let smoking = filter.smoking ? SMOKING[filter.smoking] : undefined
  if (!smoking && extras.includes('nonSmoker')) smoking = SMOKING.no

  let pet = filter.pet ? PET[filter.pet] : undefined
  if (!pet && extras.includes('noPet')) pet = PET.none

  let noise = filter.lifestyle ? NOISE[filter.lifestyle] : undefined
  if (!noise && extras.includes('quiet')) noise = NOISE.quiet

  const base = {
    region: loc.region,
    district: loc.district,
    subway_stn: loc.subway_stn,
    walk_min_max: filter.distance,
    smoking_policy: smoking,
    drink_freq: filter.drinking ? DRINK[filter.drinking] : undefined,
    pet_policy: pet,
    noise_lifestyle: noise,
    clean_importance: filter.cleanliness ? CLEAN[filter.cleanliness] : undefined,
    pref_gender: filter.gender,
    pref_age_range: filter.ageRange ? PREF_AGE[filter.ageRange] : undefined,
    pref_job: filter.occupation ? PREF_JOB[filter.occupation] : undefined,
    rent_min: filter.minMonthlyCost,
    rent_max:
      filter.maxMonthlyCost !== undefined &&
      filter.maxMonthlyCost < 150
        ? filter.maxMonthlyCost
        : undefined,
  }

  return { ...base, page, limit }
}

/** GET /room/count — list와 동일 필터, page/limit 제외 */
export function buildRoomCountQuery(
  filter: ListingFilter,
  legacyRegions: string[],
) {
  const { page: _p, limit: _l, ...query } = buildRoomListQuery(
    filter,
    legacyRegions,
    1,
    1,
  )
  return query
}

/** 서버 total·조건 필터를 그대로 쓸 수 있는지 (보증금·다중 구·정렬만 클라이언트) */
export function usesServerListTotal(
  filter: ListingFilter,
  legacyRegions: string[],
): boolean {
  const hasDeposit =
    Boolean(filter.minDeposit) ||
    (filter.maxDeposit !== undefined && filter.maxDeposit < 1000)
  if (hasDeposit) return false

  const loc = listLocationOf(filter, legacyRegions)
  if (!loc.subway_stn && legacyRegions.length > 1) {
    const districts = legacyRegions
      .map((r) => districtOfRegion(r))
      .filter((d) => d && d !== '전체')
    if (districts.length > 1) return false
  }

  return true
}
