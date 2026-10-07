import type { RoomListItem } from "@/service/room";
import type {
  AgeFilter,
  CleanFilter,
  DrinkFilter,
  GenderFilter,
  JobFilter,
  LifestyleFilter,
  PetFilter,
  SmokingFilter,
} from "@/pages/find/filter/types";

/** 목록 API에 아직 없는 값은 공고 id 기준으로 항상 같은 mock 값을 씀 */
export type ListingTraits = {
  smoking: SmokingFilter;
  pet: PetFilter;
  drinking: DrinkFilter;
  lifestyle: LifestyleFilter;
  cleanliness: CleanFilter;
  hostGender: GenderFilter | null;
  ageRange: AgeFilter;
  occupation: JobFilter | "other";
  monthlyMan: number | null;
  depositMan: number;
  walkMinutes: number;
  popularity: number;
};

function hash(value: string, salt: string) {
  let n = 0;
  for (const ch of `${salt}:${value}`) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
  return n;
}

function pick<T>(id: string, salt: string, values: readonly T[]) {
  return values[hash(id, salt) % values.length];
}

function ageRangeOf(age: number | null, id: string): AgeFilter {
  if (age == null) return pick(id, "age", ["20s", "30s", "20s", "40s"] as const);
  if (age < 30) return "20s";
  if (age < 40) return "30s";
  return "40s";
}

function occupationOf(job: string | null, id: string): ListingTraits["occupation"] {
  if (job === "employee") return "worker";
  if (job === "student") return "student";
  if (job === "freelancer") return "freelance";
  if (job) return "other";
  return pick(id, "job", ["worker", "worker", "student", "freelance"] as const);
}

function monthlyOf(value: RoomListItem["share_total"]) {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim())) return Number(value);
  return null;
}

export function roomTraits(item: RoomListItem): ListingTraits {
  const id = item.id;
  return {
    smoking: pick(id, "smoke", ["no", "no", "indoor-no", "yes"] as const),
    pet: pick(id, "pet", ["none", "none", "have", "ok"] as const),
    drinking: pick(id, "drink", ["none", "sometimes", "sometimes", "often"] as const),
    lifestyle: pick(id, "life", ["quiet", "quiet", "active"] as const),
    cleanliness: pick(id, "clean", ["tidy", "tidy", "normal"] as const),
    hostGender: item.gender === "male" || item.gender === "female" ? item.gender : null,
    ageRange: ageRangeOf(item.age, id),
    occupation: occupationOf(item.job, id),
    monthlyMan: monthlyOf(item.share_total),
    depositMan: pick(id, "deposit", [100, 200, 300, 300, 500, 1000] as const),
    walkMinutes: 3 + (hash(id, "walk") % 16),
    popularity: hash(id, "popular") % 100,
  };
}

export function traitTags(traits: ListingTraits) {
  const tags: string[] = [];
  if (traits.smoking === "no") tags.push("비흡연");
  if (traits.lifestyle === "quiet") tags.push("조용한생활");
  if (traits.cleanliness === "tidy") tags.push("깔끔한분");
  if (traits.pet === "none") tags.push("반려동물없음");
  if (traits.pet === "ok") tags.push("반려동물가능");
  if (traits.occupation === "worker") tags.push("직장인");
  if (traits.occupation === "student") tags.push("학생");
  return tags.slice(0, 3);
}
