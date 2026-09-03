import { MapPin } from "lucide-react";
import type { ListingSummary } from "@/lib/listingView";
import styles from "@/pages/find/ExplorePage.module.css";

export function ListingTeaserCard({
  summary,
  onClick,
}: {
  summary: ListingSummary;
  onClick: () => void;
}) {
  const pref =
    summary.prefGenderLabel === "상관없음"
      ? "성별 상관없음"
      : summary.prefGenderLabel
        ? `${summary.prefGenderLabel} 선호`
        : null;

  return (
    <button type="button" className={styles.teaser} onClick={onClick}>
      <div className={styles.teaserTop}>
        <div className={styles.teaserAvatar} aria-hidden>
          {summary.photoUrl ? (
            <img
              src={summary.photoUrl}
              alt=""
              className={styles.teaserAvatarImg}
            />
          ) : (
            <span>{summary.initial}</span>
          )}
        </div>

        <div className={styles.teaserWho}>
          <p className={styles.teaserName}>{summary.nickname}</p>
          {summary.meta ? (
            <p className={styles.teaserMeta}>{summary.meta}</p>
          ) : null}
        </div>

        {summary.mateLabel ? (
          <div className={styles.teaserRent}>
            <span className={styles.teaserRentLabel}>살짝 부담</span>
            <strong className={styles.teaserRentValue}>
              {summary.mateLabel}
            </strong>
          </div>
        ) : null}
      </div>

      <div className={styles.teaserTags}>
        <span className={styles.teaserTag}>
          <MapPin size={12} strokeWidth={2.4} />
          {summary.headline}
        </span>
        {pref ? <span className={styles.teaserTag}>{pref}</span> : null}
      </div>

      {summary.bio ? <p className={styles.teaserBio}>{summary.bio}</p> : null}
    </button>
  );
}
