import type { ListingTraits } from "@/lib/listingTraits";
import { districtOfRegion } from "@/lib/regions";
import {
  AGE_CHOICES,
  CLEAN_CHOICES,
  DRINK_CHOICES,
  EXTRA_CHOICES,
  GENDER_CHOICES,
  JOB_CHOICES,
  LIFESTYLE_CHOICES,
  PET_CHOICES,
  SMOKING_CHOICES,
  labelOf,
} from "./options";
import {
  DEPOSIT_RANGE,
  MONTHLY_RANGE,
  type ExtraFilter,
  type ListingFilter,
  type SortKey,
  type WalkFilter,
} from "./types";

const LOCATION_KEYS = ["regions", "station", "stationRegion", "walk"] as const;
const CONDITION_KEYS = [
  "smoke",
  "pet",
  "drink",
  "life",
  "clean",
  "gender",
  "age",
  "job",
  "extra",
  "minCost",
  "maxCost",
  "minDep",
  "maxDep",
] as const;

function oneOf<T extends string>(value: string | null, allowed: readonly T[]) {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

function numberOf(value: string | null) {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function values<T>(options: { value: T | undefined }[]) {
  return options.map((option) => option.value).filter((v): v is T => v !== undefined);
}

export function parseListingFilter(params: URLSearchParams): ListingFilter {
  const walk = Number(params.get("walk"));
  return {
    region: params.get("regions")?.trim() || undefined,
    subwayStation: params.get("station")?.trim() || undefined,
    stationRegion: params.get("stationRegion")?.trim() || undefined,
    distance: walk === 5 || walk === 10 || walk === 15 ? (walk as WalkFilter) : undefined,
    smoking: oneOf(params.get("smoke"), values(SMOKING_CHOICES)),
    pet: oneOf(params.get("pet"), values(PET_CHOICES)),
    drinking: oneOf(params.get("drink"), values(DRINK_CHOICES)),
    lifestyle: oneOf(params.get("life"), values(LIFESTYLE_CHOICES)),
    cleanliness: oneOf(params.get("clean"), values(CLEAN_CHOICES)),
    gender: oneOf(params.get("gender"), values(GENDER_CHOICES)),
    ageRange: oneOf(params.get("age"), values(AGE_CHOICES)),
    occupation: oneOf(params.get("job"), values(JOB_CHOICES)),
    extras: params
      .getAll("extra")
      .filter((v): v is ExtraFilter => EXTRA_CHOICES.some((option) => option.value === v)),
    minMonthlyCost: numberOf(params.get("minCost")),
    maxMonthlyCost: numberOf(params.get("maxCost")),
    minDeposit: numberOf(params.get("minDep")),
    maxDeposit: numberOf(params.get("maxDep")),
  };
}

export function parseSort(params: URLSearchParams): SortKey {
  const sort = params.get("sort");
  return sort === "near" || sort === "cost" || sort === "popular" ? sort : "latest";
}

function setOptional(params: URLSearchParams, key: string, value: string | number | undefined) {
  if (value === undefined || value === "") return;
  params.set(key, String(value));
}

export function writeLocation(base: URLSearchParams, filter: ListingFilter) {
  const next = new URLSearchParams(base);
  for (const key of LOCATION_KEYS) next.delete(key);
  if (filter.subwayStation) {
    next.set("station", filter.subwayStation);
    setOptional(next, "stationRegion", filter.stationRegion);
  } else {
    setOptional(next, "regions", filter.region);
  }
  setOptional(next, "walk", filter.distance);
  return next;
}

export function writeConditions(base: URLSearchParams, filter: ListingFilter) {
  const next = new URLSearchParams(base);
  for (const key of CONDITION_KEYS) next.delete(key);
  setOptional(next, "smoke", filter.smoking);
  setOptional(next, "pet", filter.pet);
  setOptional(next, "drink", filter.drinking);
  setOptional(next, "life", filter.lifestyle);
  setOptional(next, "clean", filter.cleanliness);
  setOptional(next, "gender", filter.gender);
  setOptional(next, "age", filter.ageRange);
  setOptional(next, "job", filter.occupation);
  for (const extra of filter.extras ?? []) next.append("extra", extra);
  setOptional(next, "minCost", filter.minMonthlyCost || undefined);
  setOptional(next, "maxCost", filter.maxMonthlyCost);
  setOptional(next, "minDep", filter.minDeposit || undefined);
  setOptional(next, "maxDep", filter.maxDeposit);
  return next;
}

export function writeSort(base: URLSearchParams, sort: SortKey) {
  const next = new URLSearchParams(base);
  if (sort === "latest") next.delete("sort");
  else next.set("sort", sort);
  return next;
}

export function clearConditions(filter: ListingFilter): ListingFilter {
  return {
    region: filter.region,
    subwayStation: filter.subwayStation,
    stationRegion: filter.stationRegion,
    distance: filter.distance,
  };
}

export function clearLocation(filter: ListingFilter): ListingFilter {
  return { ...filter, region: undefined, subwayStation: undefined, stationRegion: undefined, distance: undefined };
}

function manLabel(value: number) {
  return value >= 10000 ? `${value / 10000}억` : `${value}만`;
}

function rangeLabel(
  name: string,
  min: number | undefined,
  max: number | undefined,
  limit: number,
) {
  const hasMin = Boolean(min);
  const hasMax = max !== undefined && max < limit;
  if (hasMin && hasMax) return `${name} ${manLabel(min!)}~${manLabel(max!)}`;
  if (hasMax) return `${name} ${manLabel(max!)} 이하`;
  if (hasMin) return `${name} ${manLabel(min!)} 이상`;
  return null;
}

export type AppliedChip = {
  key: string;
  label: string;
  remove: (filter: ListingFilter) => ListingFilter;
};

export function conditionChips(filter: ListingFilter): AppliedChip[] {
  const chips: AppliedChip[] = [];
  const single = (
    key: keyof ListingFilter,
    label: string,
  ) => {
    if (!label) return;
    chips.push({ key, label, remove: (f) => ({ ...f, [key]: undefined }) });
  };

  if (filter.smoking) single("smoking", labelOf(SMOKING_CHOICES, filter.smoking));
  if (filter.pet) single("pet", `반려동물 ${labelOf(PET_CHOICES, filter.pet)}`);
  if (filter.drinking) single("drinking", `음주 ${labelOf(DRINK_CHOICES, filter.drinking)}`);
  if (filter.lifestyle) single("lifestyle", labelOf(LIFESTYLE_CHOICES, filter.lifestyle));
  if (filter.cleanliness) single("cleanliness", labelOf(CLEAN_CHOICES, filter.cleanliness));
  if (filter.gender) single("gender", labelOf(GENDER_CHOICES, filter.gender));
  if (filter.ageRange) single("ageRange", labelOf(AGE_CHOICES, filter.ageRange));
  if (filter.occupation) single("occupation", labelOf(JOB_CHOICES, filter.occupation));
  for (const extra of filter.extras ?? []) {
    chips.push({
      key: `extra-${extra}`,
      label: EXTRA_CHOICES.find((option) => option.value === extra)?.label ?? extra,
      remove: (f) => ({ ...f, extras: (f.extras ?? []).filter((v) => v !== extra) }),
    });
  }
  const monthly = rangeLabel("월", filter.minMonthlyCost, filter.maxMonthlyCost, MONTHLY_RANGE.max);
  if (monthly) {
    chips.push({
      key: "monthly",
      label: monthly,
      remove: (f) => ({ ...f, minMonthlyCost: undefined, maxMonthlyCost: undefined }),
    });
  }
  const deposit = rangeLabel("보증금", filter.minDeposit, filter.maxDeposit, DEPOSIT_RANGE.max);
  if (deposit) {
    chips.push({
      key: "deposit",
      label: deposit,
      remove: (f) => ({ ...f, minDeposit: undefined, maxDeposit: undefined }),
    });
  }
  return chips;
}

export function locationLabel(filter: ListingFilter) {
  const place = filter.subwayStation
    ? filter.subwayStation
    : filter.region
      ? districtOfRegion(filter.region) === "전체"
        ? filter.region.replace(" 전체", "")
        : filter.region
      : "";
  const walk = filter.distance ? `도보 ${filter.distance}분` : "";
  if (place && walk) return `${place} · ${walk}`;
  if (place) return place;
  if (walk) return `역세권 · ${walk}`;
  return "지역 · 역세권";
}

export function hasLocation(filter: ListingFilter) {
  return Boolean(filter.region || filter.subwayStation || filter.distance);
}

/** 서버 목록 조회 범위 밖(클라이언트에서 거르는) 조건이 있는지 */
export function hasClientFilter(filter: ListingFilter) {
  return Boolean(filter.distance) || conditionChips(filter).length > 0;
}

function inRange(value: number | null, min: number | undefined, max: number | undefined, limit: number) {
  const hasMin = Boolean(min);
  const hasMax = max !== undefined && max < limit;
  if (!hasMin && !hasMax) return true;
  if (value == null) return false;
  if (hasMin && value < min!) return false;
  if (hasMax && value > max!) return false;
  return true;
}

export function matchesTraits(traits: ListingTraits, filter: ListingFilter) {
  if (filter.distance && traits.walkMinutes > filter.distance) return false;
  if (filter.smoking && traits.smoking !== filter.smoking) return false;
  if (filter.pet && traits.pet !== filter.pet) return false;
  if (filter.drinking && traits.drinking !== filter.drinking) return false;
  if (filter.lifestyle && traits.lifestyle !== filter.lifestyle) return false;
  if (filter.cleanliness && traits.cleanliness !== filter.cleanliness) return false;
  if (filter.gender && traits.hostGender !== filter.gender) return false;
  if (filter.ageRange && traits.ageRange !== filter.ageRange) return false;
  if (filter.occupation && traits.occupation !== filter.occupation) return false;
  for (const extra of filter.extras ?? []) {
    if (extra === "nonSmoker" && traits.smoking !== "no") return false;
    if (extra === "noPet" && traits.pet !== "none") return false;
    if (extra === "quiet" && traits.lifestyle !== "quiet") return false;
  }
  if (!inRange(traits.monthlyMan, filter.minMonthlyCost, filter.maxMonthlyCost, MONTHLY_RANGE.max)) {
    return false;
  }
  if (!inRange(traits.depositMan, filter.minDeposit, filter.maxDeposit, DEPOSIT_RANGE.max)) {
    return false;
  }
  return true;
}

export function sortByKey<T extends { traits: ListingTraits }>(rows: T[], sort: SortKey) {
  if (sort === "latest") return rows;
  const sorted = [...rows];
  if (sort === "near") sorted.sort((a, b) => a.traits.walkMinutes - b.traits.walkMinutes);
  if (sort === "popular") sorted.sort((a, b) => b.traits.popularity - a.traits.popularity);
  if (sort === "cost") {
    sorted.sort(
      (a, b) =>
        (a.traits.monthlyMan ?? Number.POSITIVE_INFINITY) -
        (b.traits.monthlyMan ?? Number.POSITIVE_INFINITY),
    );
  }
  return sorted;
}
