import { MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ListingSummary } from "@/lib/listingView";
import styles from "./ListingTeaserCard.module.css";

export function ListingTeaserCard({
  summary,
  onClick,
}: {
  summary: ListingSummary;
  onClick: () => void;
}) {
  const place = summary.region || summary.headline;
  const meta = summary.meta.replaceAll(" · ", " ");
  const pref =
    summary.prefGenderLabel === "상관없음"
      ? "성별 상관없음"
      : summary.prefGenderLabel
        ? `${summary.prefGenderLabel} 선호`
        : null;

  return (
    <button type="button" className={styles.teaser} onClick={onClick}>
      <Avatar className={styles.photo} aria-hidden>
        {summary.photoUrl ? (
          <AvatarImage src={summary.photoUrl} alt="" />
        ) : null}
        <AvatarFallback className={styles.photoFallback}>
          {summary.nickname.trim().slice(0, 2) || summary.initial}
        </AvatarFallback>
      </Avatar>

      <div className={styles.body}>
        <div className={styles.head}>
          <p className={styles.place}>{place}</p>
          {summary.mateLabel ? (
            <strong className={styles.price}>{summary.mateLabel}</strong>
          ) : null}
        </div>

        {meta ? <p className={styles.meta}>{meta}</p> : null}

        {summary.station || pref ? (
          <div className={styles.tags}>
            {summary.station ? (
              <span className={styles.tag}>
                <MapPin size={11} strokeWidth={2.4} />
                {summary.station}
              </span>
            ) : null}
            {pref ? <span className={styles.tag}>{pref}</span> : null}
          </div>
        ) : null}
      </div>
    </button>
  );
}
