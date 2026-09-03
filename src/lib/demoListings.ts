import { cityOfRegion, districtOfRegion } from "@/lib/regions";
import { NO_NEARBY_STATION } from "@/lib/stations";
import type {
  CleanFreq,
  DrinkFreq,
  Gender,
  HomeTime,
  JobType,
  Personality,
  PrefGender,
  ShareMode,
  UserProfile,
} from "@/types/user";

export type DemoListing = {
  id: string;
  user: UserProfile;
};

type Seed = {
  id: string;
  nickname: string;
  birthDate: string;
  gender: Gender;
  job: JobType;
  bio: string;
  region: string;
  station?: string;
  rent: number;
  mgmt: number;
  prefGender: PrefGender;
  restrictListingByPrefGender?: boolean;
  createdAt?: string;
  personality?: Personality;
  drinkFreq?: DrinkFreq;
  homeTime?: HomeTime;
  cleanFreq?: CleanFreq;
  sleepHour?: number;
  wakeHour?: number;
  wfh?: boolean;
  pet?: boolean;
  petKind?: "dog" | "cat";
  noSmoker?: boolean;
  noDrink?: boolean;
  noPet?: boolean;
  rentShare?: ShareMode;
  rentPercent?: number;
  mgmtShare?: ShareMode;
  mgmtPercent?: number;
};

function makeListing(seed: Seed): DemoListing {
  return {
    id: seed.id,
    user: {
      provider: "kakao",
      nickname: seed.nickname,
      birthDate: seed.birthDate,
      gender: seed.gender,
      phone: "",
      agreedTerms: true,
      agreedPrivacy: true,
      job: seed.job,
      bio: seed.bio,
      createdAt: seed.createdAt ?? "2026-05-01",
      pref: {
        seekRole: "has_room",
        regions: [seed.region],
        nearestStation: seed.station,
        sleepHour: seed.sleepHour,
        wakeHour: seed.wakeHour,
        personality: seed.personality,
        smokingType: "none",
        drinkFreq: seed.drinkFreq,
        homeTime: seed.homeTime,
        cleanFreq: seed.cleanFreq,
        prefGender: seed.prefGender,
        restrictListingByPrefGender: seed.restrictListingByPrefGender,
        wfh: seed.wfh,
        pet: seed.pet,
        petInfo: seed.petKind ? { kind: seed.petKind } : undefined,
        rentAmount: seed.rent,
        mgmtAmount: seed.mgmt,
        rentShare: seed.rentShare
          ? { mode: seed.rentShare, percent: seed.rentPercent }
          : { mode: "half" },
        mgmtShare: seed.mgmtShare
          ? { mode: seed.mgmtShare, percent: seed.mgmtPercent }
          : { mode: "half" },
        noSmoker: seed.noSmoker,
        noDrink: seed.noDrink,
        noPet: seed.noPet,
      },
    },
  };
}

export const DEMO_LISTINGS: DemoListing[] = [
  makeListing({
    id: "minji",
    nickname: "민지",
    birthDate: "1998-04-12",
    gender: "female",
    job: "employee",
    bio: "강남에서 투룸 살고 있어요. 주중엔 회사 가고, 주말엔 집 청소하고 쉬어요. 조용한 분이면 좋아요.",
    createdAt: "2026-03-01",
    region: "서울 강남구",
    station: "강남",
    sleepHour: 24,
    wakeHour: 7,
    personality: "quiet",
    drinkFreq: "sometimes",
    homeTime: "moderate",
    cleanFreq: "weekly",
    prefGender: "female",
    rent: 700000,
    mgmt: 80000,
    noSmoker: true,
    noPet: true,
  }),
  makeListing({
    id: "junho",
    nickname: "준호",
    birthDate: "2001-11-03",
    gender: "male",
    job: "student",
    bio: "홍대 근처 원룸인데 월세가 부담돼서 살짝 구해요. 같이 밥 해먹을 수 있으면 더 좋아요.",
    createdAt: "2026-04-18",
    region: "서울 마포구",
    station: "홍대입구",
    sleepHour: 2,
    wakeHour: 10,
    personality: "outgoing",
    drinkFreq: "often",
    homeTime: "mostly",
    cleanFreq: "biweekly",
    prefGender: "any",
    rent: 550000,
    mgmt: 50000,
    rentShare: "custom",
    rentPercent: 40,
    noSmoker: true,
  }),
  makeListing({
    id: "sua",
    nickname: "수아",
    birthDate: "1994-07-21",
    gender: "female",
    job: "freelancer",
    bio: "성수에서 재택으로 일해요. 낮엔 집중해야 해서 너무 시끄럽지 않은 분이면 좋겠어요.",
    createdAt: "2026-05-02",
    region: "서울 성동구",
    station: "성수",
    sleepHour: 23,
    wakeHour: 8,
    personality: "normal",
    drinkFreq: "never",
    homeTime: "mostly",
    cleanFreq: "daily",
    prefGender: "female",
    wfh: true,
    rent: 800000,
    mgmt: 120000,
    mgmtShare: "custom",
    mgmtPercent: 30,
    noSmoker: true,
    noDrink: true,
  }),
  makeListing({
    id: "taeyoon",
    nickname: "태윤",
    birthDate: "1992-01-30",
    gender: "male",
    job: "employee",
    bio: "해운대에서 출퇴근해요. 분담은 만나서 맞춰보고 싶어요. 고양이 키우고 있습니다.",
    createdAt: "2026-06-11",
    region: "부산 해운대구",
    station: "센텀시티",
    sleepHour: 23.5,
    wakeHour: 6.5,
    personality: "quiet",
    drinkFreq: "sometimes",
    homeTime: "rarely",
    cleanFreq: "weekly",
    prefGender: "male",
    restrictListingByPrefGender: true,
    pet: true,
    petKind: "cat",
    rent: 450000,
    mgmt: 60000,
    rentShare: "negotiate",
    noSmoker: true,
  }),
  makeListing({
    id: "haeun",
    nickname: "하은",
    birthDate: "1999-09-08",
    gender: "female",
    job: "jobseeker",
    bio: "관악에서 취업 준비 중이에요. 밤에 공부할 때가 많아서 늦은 시간엔 조용하면 좋겠어요.",
    createdAt: "2026-07-20",
    region: "서울 관악구",
    station: NO_NEARBY_STATION,
    sleepHour: 1,
    wakeHour: 9,
    personality: "quiet",
    drinkFreq: "never",
    homeTime: "mostly",
    cleanFreq: "weekly",
    prefGender: "any",
    rent: 400000,
    mgmt: 40000,
    noSmoker: true,
    noDrink: true,
    noPet: true,
  }),
  makeListing({
    id: "jihun",
    nickname: "지훈",
    birthDate: "1996-03-14",
    gender: "male",
    job: "employee",
    bio: "수원 광교에서 출퇴근해요. 주중엔 일찍 자고, 주말엔 운동하러 나가요.",
    region: "경기 수원시",
    station: "광교",
    sleepHour: 23,
    wakeHour: 7,
    personality: "normal",
    drinkFreq: "sometimes",
    homeTime: "moderate",
    cleanFreq: "weekly",
    prefGender: "male",
    rent: 520000,
    mgmt: 70000,
    noSmoker: true,
  }),
  makeListing({
    id: "yerin",
    nickname: "예린",
    birthDate: "1997-08-22",
    gender: "female",
    job: "employee",
    bio: "분당 투룸이에요. 깔끔한 분과 조용히 지내고 싶어요.",
    region: "경기 성남시",
    station: "정자",
    sleepHour: 24,
    wakeHour: 7.5,
    personality: "quiet",
    drinkFreq: "never",
    homeTime: "mostly",
    cleanFreq: "daily",
    prefGender: "female",
    rent: 680000,
    mgmt: 90000,
    noSmoker: true,
    noDrink: true,
    noPet: true,
  }),
  makeListing({
    id: "minseok",
    nickname: "민석",
    birthDate: "1995-12-02",
    gender: "male",
    job: "freelancer",
    bio: "일산에서 재택 위주로 일해요. 낮에 통화가 많아서 양해 가능하면 좋아요.",
    region: "경기 고양시",
    station: "정발산",
    sleepHour: 1,
    wakeHour: 9,
    personality: "outgoing",
    drinkFreq: "often",
    homeTime: "mostly",
    cleanFreq: "biweekly",
    prefGender: "any",
    wfh: true,
    rent: 480000,
    mgmt: 55000,
    noPet: true,
  }),
  makeListing({
    id: "seoyeon",
    nickname: "서연",
    birthDate: "2000-05-19",
    gender: "female",
    job: "student",
    bio: "용인에서 학교 다녀요. 같이 장보고 간단한 저녁 해먹을 수 있으면 좋겠어요.",
    region: "경기 용인시",
    station: "기흥",
    sleepHour: 1,
    wakeHour: 8,
    personality: "normal",
    drinkFreq: "sometimes",
    homeTime: "moderate",
    cleanFreq: "weekly",
    prefGender: "female",
    rent: 430000,
    mgmt: 45000,
    noSmoker: true,
  }),
  makeListing({
    id: "doyoon",
    nickname: "도윤",
    birthDate: "1993-06-08",
    gender: "male",
    job: "employee",
    bio: "부천에서 서울로 출퇴근해요. 분담은 반반이면 제일 편할 것 같아요.",
    region: "경기 부천시",
    station: "상동",
    sleepHour: 23,
    wakeHour: 6.5,
    personality: "quiet",
    drinkFreq: "sometimes",
    homeTime: "rarely",
    cleanFreq: "weekly",
    prefGender: "any",
    rent: 410000,
    mgmt: 50000,
    noSmoker: true,
    noPet: true,
  }),
  makeListing({
    id: "chaewon",
    nickname: "채원",
    birthDate: "1998-10-27",
    gender: "female",
    job: "employee",
    bio: "동탄 신축이에요. 청소 주기만 맞으면 편하게 지낼 수 있을 거예요.",
    region: "경기 화성시",
    station: "동탄",
    sleepHour: 24,
    wakeHour: 7,
    personality: "quiet",
    drinkFreq: "never",
    homeTime: "moderate",
    cleanFreq: "weekly",
    prefGender: "female",
    rent: 590000,
    mgmt: 85000,
    noSmoker: true,
    noDrink: true,
  }),
  makeListing({
    id: "hyunwoo",
    nickname: "현우",
    birthDate: "1991-02-11",
    gender: "male",
    job: "employee",
    bio: "평촌에서 오래 살아서 동네는 잘 알아요. 강아지 한 마리 키우고 있습니다.",
    region: "경기 안양시",
    station: "평촌",
    sleepHour: 23,
    wakeHour: 7,
    personality: "normal",
    drinkFreq: "sometimes",
    homeTime: "moderate",
    cleanFreq: "weekly",
    prefGender: "male",
    pet: true,
    petKind: "dog",
    rent: 500000,
    mgmt: 60000,
    noSmoker: true,
  }),
  makeListing({
    id: "daeun",
    nickname: "다은",
    birthDate: "1999-01-15",
    gender: "female",
    job: "jobseeker",
    bio: "다산 신도시에서 취업 준비 중이에요. 낮엔 카페, 밤엔 집에서 공부해요.",
    region: "경기 남양주시",
    sleepHour: 1.5,
    wakeHour: 9,
    personality: "quiet",
    drinkFreq: "never",
    homeTime: "mostly",
    cleanFreq: "weekly",
    prefGender: "any",
    rent: 390000,
    mgmt: 40000,
    noSmoker: true,
    noDrink: true,
    noPet: true,
  }),
  makeListing({
    id: "gunwoo",
    nickname: "건우",
    birthDate: "1996-09-03",
    gender: "male",
    job: "freelancer",
    bio: "배곧에서 작업실처럼 집을 쓰고 있어요. 밤에 작업할 때 많아서 늦은 시간 소음은 조심해요.",
    region: "경기 시흥시",
    station: "정왕",
    sleepHour: 2,
    wakeHour: 10,
    personality: "outgoing",
    drinkFreq: "often",
    homeTime: "mostly",
    cleanFreq: "rarely",
    prefGender: "any",
    wfh: true,
    rent: 420000,
    mgmt: 35000,
    rentShare: "negotiate",
  }),
  makeListing({
    id: "sohee",
    nickname: "소희",
    birthDate: "1994-11-29",
    gender: "female",
    job: "employee",
    bio: "운정에서 출퇴근해요. 주말엔 집 근처 산책하는 걸 좋아해요.",
    region: "경기 파주시",
    station: "운정",
    sleepHour: 23.5,
    wakeHour: 6.5,
    personality: "normal",
    drinkFreq: "sometimes",
    homeTime: "moderate",
    cleanFreq: "weekly",
    prefGender: "female",
    rent: 470000,
    mgmt: 55000,
    noSmoker: true,
    noPet: true,
  }),
];

export function countByCity(listings = DEMO_LISTINGS) {
  const counts: Record<string, number> = {};
  for (const item of listings) {
    const city = cityOfRegion(item.user.pref?.regions?.[0]);
    if (!city) continue;
    counts[city] = (counts[city] ?? 0) + 1;
  }
  return counts;
}

export function countByDistrict(city: string, listings = DEMO_LISTINGS) {
  const counts: Record<string, number> = {};
  for (const item of listings) {
    const region = item.user.pref?.regions?.[0];
    if (cityOfRegion(region) !== city) continue;
    const district = districtOfRegion(region);
    if (!district) continue;
    counts[district] = (counts[district] ?? 0) + 1;
  }
  return counts;
}

export function filterListings(regions: string[] = []) {
  if (regions.length === 0) return DEMO_LISTINGS;
  return DEMO_LISTINGS.filter((item) => {
    const region = item.user.pref?.regions?.[0];
    if (!region) return false;
    const city = cityOfRegion(region);
    const district = districtOfRegion(region);
    return regions.some((selected) => {
      const selectedCity = cityOfRegion(selected);
      const selectedDistrict = districtOfRegion(selected);
      if (selectedCity !== city) return false;
      if (!selectedDistrict || selectedDistrict === "전체") return true;
      return selectedDistrict === district;
    });
  });
}

export function getListingById(id: string) {
  return DEMO_LISTINGS.find((item) => item.id === id) ?? null;
}
