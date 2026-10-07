export type SmokingFilter = "no" | "indoor-no" | "yes";
export type PetFilter = "none" | "have" | "ok";
export type DrinkFilter = "none" | "sometimes" | "often";
export type LifestyleFilter = "quiet" | "active";
export type CleanFilter = "tidy" | "normal";
export type GenderFilter = "male" | "female";
export type AgeFilter = "20s" | "30s" | "40s";
export type JobFilter = "worker" | "student" | "freelance";
export type ExtraFilter = "nonSmoker" | "noPet" | "quiet";
export type WalkFilter = 5 | 10 | 15;
export type SortKey = "latest" | "near" | "cost" | "popular";

export type ListingFilter = {
  /** "서울 전체" 또는 "서울 강남구" */
  region?: string;
  subwayStation?: string;
  /** 역 검색 결과의 region. 목록 API region 으로 함께 보냄 */
  stationRegion?: string;
  distance?: WalkFilter;

  smoking?: SmokingFilter;
  pet?: PetFilter;
  drinking?: DrinkFilter;
  lifestyle?: LifestyleFilter;
  cleanliness?: CleanFilter;

  gender?: GenderFilter;
  ageRange?: AgeFilter;
  occupation?: JobFilter;
  extras?: ExtraFilter[];

  /** 만원 단위 */
  minMonthlyCost?: number;
  maxMonthlyCost?: number;
  minDeposit?: number;
  maxDeposit?: number;
};

export const MONTHLY_RANGE = { max: 150, step: 5 } as const;
export const DEPOSIT_RANGE = { max: 1000, step: 50 } as const;
