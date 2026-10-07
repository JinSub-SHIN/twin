import { type ReactNode } from "react";
import { Banknote, PawPrint, UserRound } from "lucide-react";
import {
  buildMateBurden,
  type FactChip,
  type ListingView,
} from "@/lib/listingView";
import { COUNSELOR_IMG } from "@/pages/home/CounselorAvatar";
import styles from "@/pages/regist/ListingPreviewPage.module.css";

function glanceValue(chip: FactChip) {
  return chip.label.replace(/^(성격|집 체류|청소|음주|흡연)\s*/, "");
}

function topicParticle(name: string) {
  const last = name.trim().slice(-1);
  const code = last.charCodeAt(0);
  if (!last || code < 0xac00 || code > 0xd7a3) return "는";
  return (code - 0xac00) % 28 === 0 ? "는" : "은";
}

export function ListingCard({
  view,
  idPrefix,
  footer,
}: {
  view: ListingView;
  idPrefix: string;
  footer?: ReactNode;
}) {
  const burden = buildMateBurden(view.charts);
  const amount = burden.negotiated && !burden.mateLabel ? "조율" : burden.mateLabel;
  const prefGenderWord =
    view.prefGender === "female"
      ? "여성"
      : view.prefGender === "male"
        ? "남성"
        : null;
  const petBlocked = view.hardNos.some((item) => item.label.includes("반려"));
  const life = view.lifestyle[0];
  const restLife = view.lifestyle.slice(petBlocked || !life ? 0 : 1);
  const bio = view.bio.trim();
  const prefValue = prefGenderWord
    ? `${prefGenderWord} 선호`
    : view.prefGender === "any"
      ? "성별 무관"
      : "아직 없어요";

  return (
    <article className={styles.detail} aria-label={`${view.nickname}의 공고`}>
      <h2 id={`${idPrefix}-title`} className={styles.detailTitle}>
        {view.headline}
      </h2>
      <section className={styles.whisper} aria-labelledby={`${idPrefix}-bio`}>
        <h3 id={`${idPrefix}-bio`} className={styles.whisperLabel}>
          살짝 한마디
        </h3>
        <p className={bio ? styles.whisperBody : styles.whisperEmpty}>
          {bio || "아직 한마디가 없어요."}
        </p>
      </section>
      {view.meta ? <p className={styles.detailDesc}>{view.meta}</p> : null}
      {view.restrictListingByPrefGender && prefGenderWord ? (
        <p className={styles.detailDesc}>{prefGenderWord}만 볼 수 있는 공고예요</p>
      ) : null}

      <div className={styles.glance}>
        <div className={styles.glanceItem}>
          <Banknote className={styles.glanceIcon} size={16} strokeWidth={2.2} aria-hidden />
          <p className={styles.glanceLabel}>살짝 부담</p>
          <p className={styles.glanceValue}>{amount ?? "아직 없어요"}</p>
        </div>
        <div className={styles.glanceItem}>
          <UserRound className={styles.glanceIcon} size={16} strokeWidth={2.2} aria-hidden />
          <p className={styles.glanceLabel}>함께할 분</p>
          <p className={styles.glanceValue}>{prefValue}</p>
        </div>
        <div className={styles.glanceItem}>
          {petBlocked || !life ? (
            <PawPrint className={styles.glanceIcon} size={16} strokeWidth={2.2} aria-hidden />
          ) : (
            <span className={styles.glanceEmoji} aria-hidden>
              {life.emoji}
            </span>
          )}
          <p className={styles.glanceLabel}>
            {petBlocked ? "반려동물" : life ? "생활" : "반려동물"}
          </p>
          <p className={styles.glanceValue}>
            {petBlocked ? "어려워요" : life ? glanceValue(life) : "괜찮아요"}
          </p>
        </div>
      </div>

      {restLife.length > 0 || view.hardNos.length > 0 ? (
        <ul className={styles.detailNotes}>
          {restLife.map((chip) => (
            <li key={chip.label}>
              <span aria-hidden>{chip.emoji}</span>
              {chip.label}
            </li>
          ))}
          {view.hardNos
            .filter((item) => !(petBlocked && item.label.includes("반려")))
            .map((item) => (
              <li key={item.label}>
                <span aria-hidden>{item.emoji}</span>
                함께하기 어려워요 · {item.label}
              </li>
            ))}
        </ul>
      ) : null}

      <div className={styles.mascotBand}>
        <img src={COUNSELOR_IMG.greeting} alt="" />
        <p>
          {view.nickname}
          {topicParticle(view.nickname)} 지금 이 공간에 새로운 인연이 생기길
          바라고 있어요!!
        </p>
      </div>
      {footer ? <div className={styles.detailAction}>{footer}</div> : null}
    </article>
  );
}
