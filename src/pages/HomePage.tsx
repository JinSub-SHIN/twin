import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

const HERO_IMAGE = "/images/hero-share.jpg";

export function HomePage() {
  return (
    <section className={styles.page}>
      <div className={styles.media}>
        <img src={HERO_IMAGE} alt="" className={styles.mediaImage} />
        <div className={styles.mediaGradient} />
        <div aria-hidden className={styles.orbit} />
        <div aria-hidden className={styles.glow} />
      </div>

      <div className={styles.content}>
        <div className={styles.brandBlock}>
          <h1 className={styles.brand}>살짝</h1>
          <div className={styles.taglineRow}>
            <span className={styles.taglineLine} />
            <p className={styles.tagline}>같이 살 사람을 찾다</p>
          </div>
        </div>

        <h2 className={styles.headline}>
          월세, <span className={styles.accent}>살짝</span> 나눠요.
        </h2>
        <p className={styles.desc}>
          혼자 살기엔 비싸니까.
          <br />내 방의 살짝을 찾아보세요.
        </p>

        <div className={styles.actions}>
          <Link to="/explore" className={styles.cta}>
            살짝 찾기
            <ArrowUpRight className={styles.ctaIcon} />
          </Link>
          <Link to="/profile" className={styles.secondaryLink}>
            내 프로필 만들기
          </Link>
        </div>
      </div>
    </section>
  );
}
