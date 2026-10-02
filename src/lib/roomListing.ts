import {
  buildCostChart,
  optionLabel,
  type CostChart,
  type FactChip,
  type ListingSummary,
  type ListingView,
} from "@/lib/listingView";
import { cityOfRegion, districtOfRegion } from "@/lib/regions";
import type { RoomDetail, RoomListItem } from "@/service/room";
import { PREF_GENDER_OPTIONS, type PrefGender, type ShareMode } from "@/types/user";

const GENDER_LABEL: Record<string, string> = {
  male: "남성",
  female: "여성",
  other: "기타",
};

const SMOKING_LABEL: Record<string, string> = {
  none: "안함",
  e_cig: "전자담배",
  cigarette: "연초",
};

export function regionQueryOf(regions: string[]) {
  const cities = [
    ...new Set(regions.map((item) => cityOfRegion(item)).filter(Boolean)),
  ];
  return cities.length === 1 ? cities[0] : undefined;
}

export function matchesRoomRegion(item: RoomListItem, regions: string[]) {
  if (regions.length === 0) return true;
  return regions.some((region) => {
    const city = cityOfRegion(region);
    const district = districtOfRegion(region);
    if (item.region !== city) return false;
    if (!district || district === "전체") return true;
    return item.district === district;
  });
}

export function usesServerTotal(regions: string[]) {
  if (regions.length === 0) return true;
  const cities = new Set(regions.map((item) => cityOfRegion(item)).filter(Boolean));
  if (cities.size !== 1) return false;
  return regions.every((region) => {
    const district = districtOfRegion(region);
    return !district || district === "전체";
  });
}

function stationLabel(value: string | null | undefined) {
  const text = value?.trim();
  if (!text) return null;
  return text.endsWith("역") ? text : `${text}역`;
}

function placeLabel(item: { region?: string | null; district?: string | null }) {
  return [item.region?.trim(), item.district?.trim()].filter(Boolean).join(" ");
}

function genderLabel(gender: string | null | undefined) {
  if (!gender) return "";
  return GENDER_LABEL[gender] ?? gender;
}

function prefGenderOf(value: string | null | undefined): PrefGender | undefined {
  if (value === "male" || value === "female" || value === "any") return value;
  return undefined;
}

function manLabel(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(amount)) return null;
  return `${amount}만원`;
}

function formatHour(hour: number | null | undefined) {
  if (hour == null || Number.isNaN(hour)) return null;
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  if (m > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return `${h}시`;
}

function shareModeOf(value: string | null | undefined): ShareMode | undefined {
  if (value === "half" || value === "negotiate" || value === "custom") return value;
  return undefined;
}

function costChart(
  key: CostChart["key"],
  label: string,
  totalMan: number | null,
  mateMan: number | null,
  shareType: string | null,
): CostChart | null {
  const mode = shareModeOf(shareType);
  const amount = totalMan != null ? totalMan * 10000 : undefined;
  const percent =
    mode === "custom" && totalMan && mateMan != null && totalMan > 0
      ? Math.min(99, Math.max(1, Math.round((mateMan / totalMan) * 100)))
      : undefined;
  return buildCostChart(
    key,
    label,
    amount,
    mode ? { mode, percent } : undefined,
  );
}

export function roomListItemToSummary(item: RoomListItem): ListingSummary {
  const region = placeLabel(item) || null;
  const station = stationLabel(item.subway_stn);
  const prefGender = prefGenderOf(item.pref_gender);
  const meta = [
    item.age != null ? `${item.age}세` : "",
    genderLabel(item.gender),
    item.job?.trim() ?? "",
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    headline: region ?? "살짝 공고",
    region,
    station,
    nickname: item.nick,
    initial: item.nick.trim().slice(0, 1) || "ㅅ",
    meta,
    rentLabel: null,
    mateLabel: manLabel(item.share_total),
    prefGenderLabel: prefGender
      ? (optionLabel(PREF_GENDER_OPTIONS, prefGender) ?? null)
      : null,
    restrictListingByPrefGender: false,
    bio: "",
  };
}

export function roomDetailToView(room: RoomDetail): ListingView {
  const region = placeLabel(room);
  const station = stationLabel(room.subway_stn);
  const headline = region && station
    ? `${region}(${station} 인근)`
    : region || (station ? `${station} 인근` : "살짝 공고");
  const prefGender = prefGenderOf(room.pref_gender);
  const lifestyle: FactChip[] = [];

  const sleep = formatHour(room.sleep_hour);
  const wake = formatHour(room.wake_hour);
  if (sleep && wake) lifestyle.push({ emoji: "🌙", label: `${sleep} 취침 · ${wake} 기상` });
  else if (sleep) lifestyle.push({ emoji: "🌙", label: `${sleep} 취침` });
  else if (wake) lifestyle.push({ emoji: "☀️", label: `${wake} 기상` });

  if (room.pers_type?.trim()) {
    lifestyle.push({ emoji: "🙂", label: `성격 ${room.pers_type.trim()}` });
  }
  if (room.home_time?.trim()) {
    lifestyle.push({ emoji: "🏠", label: `집 체류 ${room.home_time.trim()}` });
  }
  if (room.clean_freq?.trim()) {
    lifestyle.push({ emoji: "✨", label: `청소 ${room.clean_freq.trim()}` });
  }
  if (room.drink_freq?.trim()) {
    lifestyle.push({ emoji: "🍺", label: `음주 ${room.drink_freq.trim()}` });
  }
  if (room.smoking?.trim()) {
    lifestyle.push({
      emoji: "🚬",
      label: `흡연 ${SMOKING_LABEL[room.smoking] ?? room.smoking}`,
    });
  }

  const hardNos: FactChip[] = [];
  if (room.avoid_smoke) hardNos.push({ emoji: "🚭", label: "흡연" });
  if (room.avoid_drink) hardNos.push({ emoji: "🍺", label: "음주" });
  if (room.avoid_pet) hardNos.push({ emoji: "🐾", label: "반려동물" });

  return {
    headline,
    nickname: room.nick,
    initial: room.nick.trim().slice(0, 1) || "ㅅ",
    meta: [
      room.age != null ? `${room.age}세` : "",
      genderLabel(room.gender),
      room.job?.trim() ?? "",
    ]
      .filter(Boolean)
      .join(" · "),
    charts: [
      costChart("rent", "월세", room.rent, room.share_rent, room.share_rent_type),
      costChart(
        "mgmt",
        "관리비",
        room.maint_fee,
        room.share_maint,
        room.share_maint_type,
      ),
    ].filter((item): item is CostChart => Boolean(item)),
    prefGender,
    restrictListingByPrefGender: room.locked,
    lifestyle,
    hardNos,
    bio: room.bio?.trim() ?? "",
  };
}
