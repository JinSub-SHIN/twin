import { ArrowUpRight, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { COUNSELOR_IMG } from "./CounselorAvatar";
import { HomeTour } from "./HomeTour";
import { HowToGuide } from "./HowToGuide";
import styles from "./HomePage.module.css";

const HERO_IMAGE = "/images/hero-share.jpg";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.brand}>살짝</h1>
        <button type="button" className={styles.bell} aria-label="알림">
          <Bell size={20} strokeWidth={2.1} />
        </button>
      </header>

      <HomeTour />

      <div className={styles.hero} data-tour="hero">
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

      <HowToGuide />

      <div className={styles.adBanner} aria-label="광고 영역">
        광고 예정 배너 구역
      </div>

      <button
        type="button"
        className={styles.counselor}
        data-tour="counselor"
        onClick={() => navigate("/counselor")}
      >
        <span className={styles.counselorCopy}>
          <span className={styles.counselorKicker}>
            <span className={styles.counselorLive} />
            지금 상담 가능
          </span>
          <strong id="counselor-cta" className={styles.counselorTitle}>
            AI 상담사 살짝
          </strong>
          <span className={styles.counselorDesc}>
            안녕하세요! 살짝이에요
            <br />
            월세 나누는 법, 바로 물어보세요
          </span>
          <span className={styles.counselorGo}>
            상담하기
            <ArrowUpRight size={15} strokeWidth={2.4} />
          </span>
        </span>
        <img
          src={COUNSELOR_IMG.greeting}
          alt=""
          className={styles.counselorArt}
        />
      </button>
    </section>
  );
}
