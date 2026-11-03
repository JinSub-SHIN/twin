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

function smokingOf(value: string | null | undefined, id: string): SmokingFilter {
  if (value === "비흡연") return "no";
  if (value === "실내 금연") return "indoor-no";
  if (value === "흡연 가능") return "yes";
  return pick(id, "smoke", ["no", "no", "indoor-no", "yes"] as const);
}

function petOf(value: string | null | undefined, id: string): PetFilter {
  if (value === "반려동물 없음") return "none";
  if (value === "키우고 있어요") return "have";
  if (value === "함께해도 좋아요") return "ok";
  return pick(id, "pet", ["none", "none", "have", "ok"] as const);
}

function drinkOf(value: string | null | undefined, id: string): DrinkFilter {
  if (value === "안 함") return "none";
  if (value === "가끔 마셔요") return "sometimes";
  if (value === "자주 마셔요") return "often";
  return pick(id, "drink", ["none", "sometimes", "sometimes", "often"] as const);
}

function lifestyleOf(value: string | null | undefined, id: string): LifestyleFilter {
  if (value === "조용한 생활") return "quiet";
  if (value === "일반적인 생활" || value === "소음 괜찮아요") return "active";
  return pick(id, "life", ["quiet", "quiet", "active"] as const);
}

function cleanOf(value: string | null | undefined, id: string): CleanFilter {
  if (value === "매우 중요해요") return "tidy";
  if (value === "중요한 편이에요" || value === "편하게 지내요") return "normal";
  return pick(id, "clean", ["tidy", "tidy", "normal"] as const);
}

function ageRangeOf(age: number | null, id: string): AgeFilter {
  if (age == null) return pick(id, "age", ["20s", "30s", "20s", "40s"] as const);
  if (age < 30) return "20s";
  if (age < 40) return "30s";
  return "40s";
}

function occupationOf(job: string | null, id: string): ListingTraits["occupation"] {
  if (job === "직장인" || job === "employee") return "worker";
  if (job === "학생" || job === "student") return "student";
  if (job === "프리랜서" || job === "freelancer") return "freelance";
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
    smoking: smokingOf(item.smoking_policy, id),
    pet: petOf(item.pet_policy, id),
    drinking: drinkOf(item.drink_freq, id),
    lifestyle: lifestyleOf(item.noise_lifestyle, id),
    cleanliness: cleanOf(item.clean_importance, id),
    hostGender: item.gender === "male" || item.gender === "female" ? item.gender : null,
    ageRange: ageRangeOf(item.age, id),
    occupation: occupationOf(item.job, id),
    monthlyMan: monthlyOf(item.share_total),
    depositMan: pick(id, "deposit", [100, 200, 300, 300, 500, 1000] as const),
    walkMinutes:
      item.walk_min != null && !Number.isNaN(item.walk_min)
        ? item.walk_min
        : 3 + (hash(id, "walk") % 16),
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
