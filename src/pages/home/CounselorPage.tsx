import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { COUNSELOR_IMG } from "./CounselorAvatar";
import { CounselorChat } from "./CounselorChat";
import styles from "./CounselorPage.module.css";

export function CounselorPage() {
  const navigate = useNavigate();

  return (
    <section className={styles.page}>
      <header className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          aria-label="뒤로"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={20} strokeWidth={2.25} />
        </button>
        <div className={styles.topIdentity}>
          <img src={COUNSELOR_IMG.idle} alt="" className={styles.topAvatar} />
          <div>
            <h1 className={styles.topTitle}>AI 상담사 살짝</h1>
            <p className={styles.topStatus}>지금 상담 가능</p>
          </div>
        </div>
      </header>
      <CounselorChat fullPage />
    </section>
  );
}
