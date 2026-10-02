import type { ListingSummary } from "@/lib/listingView";
import { cn } from "@/lib/utils";
import styles from "./ListingTeaserCard.module.css";

type CardType = "female" | "male" | "any";

const PREF: Record<CardType, string> = {
  female: "여성 선호",
  male: "남성 선호",
  any: "성별 무관",
};

function cardTypeOf(label: string | null): CardType {
  if (label === "여성") return "female";
  if (label === "남성") return "male";
  return "any";
}

function rewardLabel(value: string) {
  if (value === "직접조율") return "분담 직접조율";
  return `살짝 ${value}`;
}

export function ListingTeaserCard({
  summary,
  onClick,
}: {
  summary: ListingSummary;
  onClick: () => void;
}) {
  const place = summary.region || summary.headline;
  const type = cardTypeOf(summary.prefGenderLabel);
  const location = [summary.station ? `${summary.station} 인근` : null, summary.meta]
    .filter(Boolean)
    .join(" · ");

  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <span className={styles.body}>
        <span className={styles.titleRow}>
          <span className={styles.title}>{place}</span>
          <span className={cn(styles.badge, styles[type])}>{PREF[type]}</span>
        </span>
        {location ? <span className={styles.location}>{location}</span> : null}
        {summary.mateLabel ? (
          <span className={styles.reward}>{rewardLabel(summary.mateLabel)}</span>
        ) : null}
      </span>
    </button>
  );
}
