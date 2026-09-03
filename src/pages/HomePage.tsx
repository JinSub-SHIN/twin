import { useMemo } from "react";
import { Bell, ChevronRight, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DEMO_LISTINGS } from "@/lib/demoListings";
import {
  GENDER_LABEL,
  buildListingSummary,
  type ListingSummary,
} from "@/lib/listingView";
import type { UserProfile } from "@/types/user";
import styles from "./HomePage.module.css";

const HERO_IMAGE = "/images/hero-share.jpg";

function priceLabel(summary: ListingSummary) {
  if (summary.mateLabel) return `살짝 ${summary.mateLabel}`;
  if (summary.rentLabel) return `월세 ${summary.rentLabel}`;
  return "분담 조율";
}

function hostGenderLabel(user: UserProfile) {
  return GENDER_LABEL[user.gender] ?? null;
}

function prefLine(summary: ListingSummary) {
  if (summary.prefGenderLabel === "상관없음") return "성별 상관없음";
  if (summary.prefGenderLabel) return `${summary.prefGenderLabel} 살짝`;
  return null;
}

export function HomePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const listings = useMemo(() => {
    const sorted = [...DEMO_LISTINGS].sort((a, b) =>
      (b.user.createdAt ?? "").localeCompare(a.user.createdAt ?? ""),
    );
    return sorted.map((item) => ({
      id: item.id,
      hostGender: hostGenderLabel(item.user),
      summary: buildListingSummary(item.user),
    }));
  }, []);

  const recent = listings.slice(0, 6);
  const recommended = listings.slice(6, 9);

  const openListing = (id: string) => {
    navigate(`/explore/listing/${id}`, { state: { returnTo: "/" } });
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.brand}>살짝</h1>
        <button type="button" className={styles.bell} aria-label="알림">
          <Bell size={20} strokeWidth={2.1} />
        </button>
      </header>

      <div className={styles.hero}>
        <img src={HERO_IMAGE} alt="" className={styles.heroImage} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroCopy}>
          <h2 className={styles.headline}>
            월세, <span className={styles.accent}>살짝</span> 나눠요.
          </h2>
          <p className={styles.desc}>
            혼자 살기 부담될 때,
            <br />
            함께 살 사람을 찾아보세요.
          </p>
        </div>
      </div>

      <div className={styles.feed}>
        <section className={styles.section} aria-labelledby="home-recent">
          <div className={styles.sectionHead}>
            <h3 id="home-recent" className={styles.sectionTitle}>
              최근 올라온 살짝
            </h3>
            <Link to="/explore" className={styles.sectionMore}>
              전체보기
              <ChevronRight size={14} strokeWidth={2.4} />
            </Link>
          </div>

          <div className={styles.railWrap}>
          <div className={styles.rail}>
            {recent.map((item) => {
              const pref = prefLine(item.summary);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={styles.railCard}
                  onClick={() => openListing(item.id)}
                >
                  <span className={styles.cardKicker}>
                    <MapPin size={12} strokeWidth={2.4} />
                    위치
                  </span>
                  <span className={styles.cardPlace}>
                    {item.summary.headline}
                  </span>
                  <strong className={styles.cardPrice}>
                    {priceLabel(item.summary)}
                  </strong>
                  <span className={styles.cardChips}>
                    {item.hostGender ? (
                      <span className={styles.cardChip}>
                        {item.hostGender} 거주
                      </span>
                    ) : null}
                    {pref ? (
                      <span className={styles.cardChip}>{pref}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
          </div>
        </section>

        <div className={styles.adBanner} aria-label="광고 영역">
          광고 예정 배너 구역
        </div>

        <section className={styles.section} aria-labelledby="home-reco">
          <div className={styles.sectionHead}>
            <h3 id="home-reco" className={styles.sectionTitle}>
              추천 살짝
            </h3>
          </div>
          <p className={styles.sectionLead}>
            지금 올려진 공고 중에서
            <br />
            같이 살아보기 좋은 살짝이에요.
          </p>

          <div className={styles.rows}>
            {recommended.map((item) => {
              const pref = prefLine(item.summary);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={styles.rowCard}
                  onClick={() => openListing(item.id)}
                >
                  <span className={styles.rowMain}>
                    <span className={styles.cardKicker}>
                      <MapPin size={12} strokeWidth={2.4} />
                      {item.summary.headline}
                    </span>
                    <strong className={styles.cardPrice}>
                      {priceLabel(item.summary)}
                    </strong>
                    <span className={styles.cardChips}>
                      {item.hostGender ? (
                        <span className={styles.cardChip}>
                          {item.hostGender} 거주
                        </span>
                      ) : null}
                      {pref ? (
                        <span className={styles.cardChip}>{pref}</span>
                      ) : null}
                    </span>
                  </span>
                  <ChevronRight
                    className={styles.rowArrow}
                    size={18}
                    strokeWidth={2.2}
                  />
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.profileCard}>
          <p className={styles.profileTitle}>나와 잘 맞는 살짝을 찾아보세요.</p>
          <p className={styles.profileDesc}>
            프로필을 만들어두면
            <br />
            나에게 맞는 동거인을 찾기 쉬워요.
          </p>
          <Link
            to={isLoggedIn ? "/profile" : "/signup"}
            className={styles.profileCta}
          >
            {isLoggedIn ? "내 프로필 보기" : "내 프로필 만들기"}
          </Link>
        </section>
      </div>
    </section>
  );
}
