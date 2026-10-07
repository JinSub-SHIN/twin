import { useState } from "react";
import { ImageOff } from "lucide-react";
import { SubwayLineBadges } from "@/components/ui/subway";
import type { ListingSummary } from "@/lib/listingView";
import styles from "./ListingTeaserCard.module.css";

export function ListingTeaserCard({
  summary,
  onClick,
}: {
  summary: ListingSummary;
  onClick: () => void;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const place = summary.region || summary.headline;
  const pitch = summary.pitch || "함께 살 동거인을 찾아요";
  const price =
    !summary.mateLabel || summary.mateLabel === "직접조율"
      ? "직접조율"
      : summary.mateLabel.startsWith("월")
        ? summary.mateLabel
        : `월 ${summary.mateLabel}`;
  const tags = summary.tags ?? [];

  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <span className={styles.photo}>
        {summary.coverUrl && !photoFailed ? (
          <img
            src={summary.coverUrl}
            alt=""
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <span className={styles.photoFallback}>
            <ImageOff size={22} strokeWidth={1.8} aria-hidden />
          </span>
        )}
        {summary.station ? (
          <span className={styles.station}>
            {summary.subwayLines.length > 0 ? (
              <SubwayLineBadges lines={summary.subwayLines} />
            ) : null}
            <span className={styles.stationName}>{summary.station}</span>
          </span>
        ) : null}
      </span>

      <span className={styles.body}>
        <span className={styles.place}>{place}</span>
        <span className={styles.pitch}>{pitch}</span>
        <span className={styles.when}>
          {summary.recruitLabel ? <span>{summary.recruitLabel}</span> : null}
          {summary.moveInLabel ? <span>{summary.moveInLabel}</span> : null}
        </span>
        <strong className={styles.price}>{price}</strong>
        {tags.length > 0 ? (
          <span className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag}>#{tag.replace(/\s+/g, "")}</span>
            ))}
          </span>
        ) : null}
      </span>
    </button>
  );
}
