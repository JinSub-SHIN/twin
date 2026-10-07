import type {
  AgeFilter,
  CleanFilter,
  DrinkFilter,
  ExtraFilter,
  GenderFilter,
  JobFilter,
  LifestyleFilter,
  PetFilter,
  SmokingFilter,
  SortKey,
  WalkFilter,
} from "./types";

export type Option<T> = { value: T | undefined; label: string };

export const SMOKING_CHOICES: Option<SmokingFilter>[] = [
  { value: "no", label: "비흡연" },
  { value: "indoor-no", label: "실내 금연" },
  { value: "yes", label: "흡연 가능" },
];

export const PET_CHOICES: Option<PetFilter>[] = [
  { value: "none", label: "없음" },
  { value: "have", label: "있음" },
  { value: "ok", label: "가능" },
];

export const DRINK_CHOICES: Option<DrinkFilter>[] = [
  { value: "none", label: "안 함" },
  { value: "sometimes", label: "가끔" },
  { value: "often", label: "자주" },
];

export const LIFESTYLE_CHOICES: Option<LifestyleFilter>[] = [
  { value: "quiet", label: "조용한 생활" },
  { value: "active", label: "활동적인 생활" },
  { value: undefined, label: "상관없음" },
];

export const CLEAN_CHOICES: Option<CleanFilter>[] = [
  { value: "tidy", label: "깔끔한 편" },
  { value: "normal", label: "보통" },
  { value: undefined, label: "상관없음" },
];

export const GENDER_CHOICES: Option<GenderFilter>[] = [
  { value: undefined, label: "무관" },
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
];

export const AGE_CHOICES: Option<AgeFilter>[] = [
  { value: "20s", label: "20대" },
  { value: "30s", label: "30대" },
  { value: "40s", label: "40대 이상" },
];

export const JOB_CHOICES: Option<JobFilter>[] = [
  { value: "worker", label: "직장인" },
  { value: "student", label: "학생" },
  { value: "freelance", label: "프리랜서" },
  { value: undefined, label: "무관" },
];

export const EXTRA_CHOICES: { value: ExtraFilter; label: string }[] = [
  { value: "nonSmoker", label: "비흡연자" },
  { value: "noPet", label: "반려동물 없음" },
  { value: "quiet", label: "조용한 사람" },
];

export const WALK_CHOICES: { value: WalkFilter; label: string }[] = [
  { value: 5, label: "도보 5분 이내" },
  { value: 10, label: "도보 10분 이내" },
  { value: 15, label: "도보 15분 이내" },
];

export const SORT_CHOICES: { value: SortKey; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "near", label: "가까운 순" },
  { value: "cost", label: "월 예상 비용 낮은 순" },
  { value: "popular", label: "인기순" },
];

export function labelOf<T>(options: Option<T>[], value: T | undefined) {
  return options.find((option) => option.value === value)?.label ?? "";
}
