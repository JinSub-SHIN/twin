import type { ListingSummary } from "@/lib/listingView";
import styles from "./ListingTeaserCard.module.css";

type CardType = "female" | "male" | "any";

const PREF: Record<CardType, { emoji: string; label: string }> = {
  female: { emoji: "👩", label: "여성 선호" },
  male: { emoji: "👨", label: "남성 선호" },
  any: { emoji: "🤝", label: "성별 무관" },
};

function cardTypeOf(label: string | null): CardType {
  if (label === "여성") return "female";
  if (label === "남성") return "male";
  return "any";
}

export function ListingTeaserCard({
  summary,
  onClick,
}: {
  summary: ListingSummary;
  onClick: () => void;
}) {
  const place = summary.region || summary.headline;
  const pref = PREF[cardTypeOf(summary.prefGenderLabel)];

  return (
    <button
      type="button"
      className={[
        styles.card,
        summary.station ? styles.cardWithStop : "",
        summary.mateLabel ? styles.cardWithPrice : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      {summary.station ? (
        <span className={styles.ribbon}>{summary.station}</span>
      ) : null}
      <span className={styles.head}>
        <span className={styles.title}>{place}</span>
      </span>
      <span className={styles.facts}>
        <span className={styles.fact}>
          {pref.emoji} {pref.label}
        </span>
        {summary.meta ? (
          <span className={styles.fact}>👤 {summary.meta}</span>
        ) : null}
      </span>
    </button>
  );
}
