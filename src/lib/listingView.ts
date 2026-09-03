import { NO_NEARBY_STATION } from "@/lib/stations";
import {
  CLEAN_FREQ_OPTIONS,
  DRINK_OPTIONS,
  HOME_TIME_OPTIONS,
  JOB_OPTIONS,
  PERSONALITY_OPTIONS,
  PET_KIND_OPTIONS,
  PREF_GENDER_OPTIONS,
  SMOKING_OPTIONS,
  getAgeGroup,
  type CostShare,
  type PrefGender,
  type UserProfile,
} from "@/types/user";

export const GENDER_LABEL: Record<string, string> = {
  male: "남성",
  female: "여성",
  other: "기타",
};

export type FactChip = { emoji: string; label: string };

export type CostChart = {
  key: "rent" | "mgmt";
  label: string;
  totalLabel: string | null;
  myPercent: number | null;
  matePercent: number | null;
  negotiated: boolean;
  myAmountLabel: string | null;
  mateAmountLabel: string | null;
  mateWon: number | null;
};

export type ListingView = {
  headline: string;
  nickname: string;
  initial: string;
  photoUrl?: string;
  meta: string;
  charts: CostChart[];
  prefGender?: PrefGender;
  restrictListingByPrefGender?: boolean;
  lifestyle: FactChip[];
  hardNos: FactChip[];
  bio: string;
};

export function optionLabel<T extends string>(
  options: { value: T; label: string }[],
  value: T | undefined,
) {
  return options.find((o) => o.value === value)?.label;
}

export function formatWon(amount?: number | null) {
  if (amount == null || amount <= 0) return null;
  if (amount >= 10000) {
    const man = amount / 10000;
    const text = Number.isInteger(man)
      ? `${man}`
      : man.toFixed(1).replace(/\.0$/, "");
    return `${text}만원`;
  }
  return `${amount.toLocaleString("ko-KR")}원`;
}

function shareMinePercent(share?: CostShare) {
  if (!share?.mode) return null;
  if (share.mode === "half") return 50;
  if (share.mode === "custom" && share.percent != null && share.percent > 0) {
    const mate = Math.min(99, Math.max(1, share.percent));
    return 100 - mate;
  }
  return null;
}

export function buildCostChart(
  key: CostChart["key"],
  label: string,
  amount: number | undefined,
  share?: CostShare,
): CostChart | null {
  const myPercent = shareMinePercent(share);
  const negotiated = share?.mode === "negotiate";
  const totalLabel = formatWon(amount);
  if (!totalLabel && myPercent == null && !negotiated) return null;

  const matePercent = myPercent != null ? 100 - myPercent : null;
  const mineWon =
    amount && myPercent != null ? Math.round((amount * myPercent) / 100) : null;
  const mateWon = amount && mineWon != null ? amount - mineWon : null;

  return {
    key,
    label,
    totalLabel,
    myPercent,
    matePercent,
    negotiated,
    myAmountLabel: formatWon(mineWon),
    mateAmountLabel: formatWon(mateWon),
    mateWon,
  };
}

export type MateBurden = {
  mateLabel: string | null;
  mateBreakdown: string | null;
  houseBreakdown: string | null;
  negotiated: boolean;
};

export function buildMateBurden(charts: CostChart[]): MateBurden {
  const known = charts.filter((chart) => chart.mateWon != null);
  const mateSum = known.reduce((sum, chart) => sum + (chart.mateWon ?? 0), 0);
  const mateParts = charts
    .map((chart) =>
      chart.mateAmountLabel ? `${chart.label} ${chart.mateAmountLabel}` : null,
    )
    .filter(Boolean);
  const houseParts = charts
    .map((chart) =>
      chart.totalLabel ? `${chart.label} ${chart.totalLabel}` : null,
    )
    .filter(Boolean);

  return {
    mateLabel: known.length > 0 ? formatWon(mateSum) : null,
    mateBreakdown: mateParts.length > 0 ? mateParts.join(" + ") : null,
    houseBreakdown: houseParts.length > 0 ? houseParts.join(" + ") : null,
    negotiated: charts.some((chart) => chart.negotiated),
  };
}

function formatHour(hour?: number) {
  if (hour == null) return null;
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  if (m > 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return `${h}시`;
}

function formatNearbyStation(station?: string) {
  const value = station?.trim();
  if (!value || value === NO_NEARBY_STATION) return null;
  return value.endsWith("역") ? value : `${value}역`;
}

export function buildHeadline(user: UserProfile) {
  const region = user.pref?.regions?.[0];
  const station = formatNearbyStation(user.pref?.nearestStation);
  if (region && station) return `${region}(${station} 인근)`;
  if (region) return region;
  if (station) return `${station} 인근`;
  return "살짝 공고";
}

export function buildLifestyleChips(user: UserProfile) {
  const p = user.pref;
  if (!p) return [] as FactChip[];
  const chips: FactChip[] = [];

  const sleep = formatHour(p.sleepHour);
  const wake = formatHour(p.wakeHour);
  if (sleep && wake)
    chips.push({ emoji: "🌙", label: `${sleep} 취침 · ${wake} 기상` });
  else if (sleep) chips.push({ emoji: "🌙", label: `${sleep} 취침` });
  else if (wake) chips.push({ emoji: "☀️", label: `${wake} 기상` });

  const personality = optionLabel(PERSONALITY_OPTIONS, p.personality);
  if (personality) chips.push({ emoji: "🙂", label: `성격 ${personality}` });

  const home = optionLabel(HOME_TIME_OPTIONS, p.homeTime);
  if (home) chips.push({ emoji: "🏠", label: `집 체류 ${home}` });

  const clean = optionLabel(CLEAN_FREQ_OPTIONS, p.cleanFreq);
  if (clean) chips.push({ emoji: "✨", label: `청소 ${clean}` });

  const drink = optionLabel(DRINK_OPTIONS, p.drinkFreq);
  if (drink) chips.push({ emoji: "🍺", label: `음주 ${drink}` });

  const smoking = optionLabel(SMOKING_OPTIONS, p.smokingType);
  if (smoking) chips.push({ emoji: "🚬", label: `흡연 ${smoking}` });

  if (p.pet) {
    const kind =
      p.petInfo?.kind === "other"
        ? p.petInfo.kindOther || "반려동물"
        : optionLabel(PET_KIND_OPTIONS, p.petInfo?.kind) || "반려동물";
    chips.push({ emoji: "🐾", label: `${kind} 함께` });
  }

  if (p.wfh) chips.push({ emoji: "💻", label: "재택 근무" });

  return chips;
}

export function buildHardNos(user: UserProfile) {
  const p = user.pref;
  if (!p) return [] as FactChip[];
  const items: FactChip[] = [];
  if (p.noSmoker) items.push({ emoji: "🚭", label: "흡연" });
  if (p.noDrink) items.push({ emoji: "🍺", label: "음주" });
  if (p.noPet) items.push({ emoji: "🐾", label: "반려동물" });
  return items;
}

export function buildListingView(user: UserProfile): ListingView {
  const job =
    user.job === "other"
      ? user.jobOther?.trim() || "기타"
      : optionLabel(JOB_OPTIONS, user.job);
  const ageGroup = getAgeGroup(user.birthDate);
  const gender = GENDER_LABEL[user.gender] ?? "";
  const meta = [ageGroup, gender, job].filter(Boolean).join(" · ");

  return {
    headline: buildHeadline(user),
    nickname: user.nickname,
    initial: user.nickname.trim().slice(0, 1) || "ㅅ",
    photoUrl: user.photoUrl,
    meta,
    charts: [
      buildCostChart(
        "rent",
        "월세",
        user.pref?.rentAmount,
        user.pref?.rentShare,
      ),
      buildCostChart(
        "mgmt",
        "관리비",
        user.pref?.mgmtAmount,
        user.pref?.mgmtShare,
      ),
    ].filter((item): item is CostChart => Boolean(item)),
    prefGender: user.pref?.prefGender,
    restrictListingByPrefGender: user.pref?.restrictListingByPrefGender,
    lifestyle: buildLifestyleChips(user),
    hardNos: buildHardNos(user),
    bio: user.bio?.trim() || "",
  };
}

export type ListingSummary = {
  headline: string;
  region: string | null;
  station: string | null;
  nickname: string;
  initial: string;
  photoUrl?: string;
  meta: string;
  rentLabel: string | null;
  mateLabel: string | null;
  prefGenderLabel: string | null;
  restrictListingByPrefGender: boolean;
  bio: string;
};

export function isListingLocked(restricted?: boolean) {
  return Boolean(restricted);
}

export function buildListingSummary(user: UserProfile): ListingSummary {
  const view = buildListingView(user);
  const rent = view.charts.find((chart) => chart.key === "rent");
  const burden = buildMateBurden(view.charts);
  return {
    headline: view.headline,
    region: user.pref?.regions?.[0]?.trim() || null,
    station: formatNearbyStation(user.pref?.nearestStation),
    nickname: view.nickname,
    initial: view.initial,
    photoUrl: view.photoUrl,
    meta: view.meta,
    rentLabel: rent?.totalLabel ?? null,
    mateLabel: burden.mateLabel ?? rent?.totalLabel ?? null,
    prefGenderLabel: view.prefGender
      ? (optionLabel(PREF_GENDER_OPTIONS, view.prefGender) ?? null)
      : null,
    restrictListingByPrefGender: Boolean(view.restrictListingByPrefGender),
    bio: view.bio,
  };
}
