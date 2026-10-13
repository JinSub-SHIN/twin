import {
  ArrowRight,
  Bell,
  ChevronRight,
  ClipboardList,
  House,
  HousePlus,
  Leaf,
  Lock,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { COUNSELOR_IMG } from "./CounselorAvatar";
import styles from "./HomePage.module.css";

const GUIDE_STEPS = [
  {
    title: "조건 정하기",
    desc: "원하는 생활 방식과 조건을 설정해요.",
    icon: ClipboardList,
  },
  {
    title: "공고 확인하기",
    desc: "내 조건에 맞는 공고를 찾아보세요.",
    icon: Search,
  },
  {
    title: "함께 살기",
    desc: "마음에 드는 상대와 매칭되면 시작해요.",
    icon: House,
  },
] as const;

export function HomePage() {
  const navigate = useNavigate();

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.brand}>살짝</h1>
        <button type="button" className={styles.bell} aria-label="알림">
          <Bell size={21} strokeWidth={2} />
        </button>
      </header>

      <div className={styles.hero} data-tour="hero">
        <div className={styles.heroCopy}>
          <h2 className={styles.headline}>
            월세, <span className={styles.accent}>살짝</span> 나눠요.
          </h2>
          <p className={styles.desc}>
            혼자 살기 부담될 때,
            <br />
            함께 살짝을 찾아보세요.
          </p>
        </div>
        <img src={COUNSELOR_IMG.idle} alt="" className={styles.heroArt} />
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.action} ${styles.actionPrimary}`}
          onClick={() => navigate("/explore")}
        >
          <UsersRound className={styles.actionIcon} strokeWidth={1.9} />
          <strong className={styles.actionTitle}>함께 살 사람 찾기</strong>
          <span className={styles.actionDesc}>나와 잘 맞는 동거인을 찾아보세요.</span>
          <span className={styles.actionGo} aria-hidden>
            <ChevronRight size={16} strokeWidth={2.6} />
          </span>
        </button>
        <button
          type="button"
          className={`${styles.action} ${styles.actionSecondary}`}
          onClick={() => navigate("/roommate/new")}
        >
          <HousePlus className={styles.actionIcon} strokeWidth={1.9} />
          <strong className={styles.actionTitle}>내 공간 공유하기</strong>
          <span className={styles.actionDesc}>
            빈 공간을 함께 사용할 동거인을 찾아보세요.
          </span>
          <span className={styles.actionGo} aria-hidden>
            <ChevronRight size={16} strokeWidth={2.6} />
          </span>
        </button>
      </div>

      <section
        className={styles.guide}
        aria-labelledby="home-guide-title"
        data-tour="howto"
      >
        <h3 id="home-guide-title" className={styles.sectionTitle}>
          <Leaf size={17} strokeWidth={2.2} className={styles.sectionIcon} />
          살짝 이용 가이드
        </h3>
        <ol className={styles.steps}>
          {GUIDE_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepIcon}>
                  <Icon size={22} strokeWidth={2} />
                  <span className={styles.stepNo}>{index + 1}</span>
                </span>
                <strong className={styles.stepTitle}>{step.title}</strong>
                <span className={styles.stepDesc}>{step.desc}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={styles.safety} aria-labelledby="home-safety-title">
        <h3 id="home-safety-title" className={styles.safetyTitle}>
          <span className={styles.safetyBadge} aria-hidden>
            <ShieldCheck size={18} strokeWidth={2.2} />
          </span>
          안심하고 시작하는 살짝
        </h3>
        <ul className={styles.safetyList}>
          <li className={styles.safetyCard}>
            <Lock size={17} strokeWidth={2.1} className={styles.safetyIcon} />
            주소는 매칭 전까지 공개되지 않아요.
          </li>
          <li className={styles.safetyCard}>
            <ShieldCheck
              size={17}
              strokeWidth={2.1}
              className={styles.safetyIcon}
            />
            생활 방식과 조건을 먼저 확인해요.
          </li>
        </ul>
      </section>

      <button
        type="button"
        className={styles.counselor}
        data-tour="counselor"
        onClick={() => navigate("/counselor")}
      >
        <span className={styles.counselorCopy}>
          <span className={styles.counselorBadge}>AI 상담</span>
          <strong id="counselor-cta" className={styles.counselorTitle}>
            AI 상담사 살짝이
          </strong>
          <span className={styles.counselorDesc}>
            언제든지 궁금한 점이 있으면
            <br />
            살짝이에게 물어보세요!
          </span>
          <span className={styles.counselorGo}>
            상담하기
            <ArrowRight size={14} strokeWidth={2.4} />
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
