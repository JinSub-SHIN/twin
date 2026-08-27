import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import styles from "./ProfilePage.module.css";

export function ProfilePage() {
  return (
    <section className={styles.page}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>내정보</p>
        <h2 className={styles.title}>
          나의 정보를
          <br />
          <span className={styles.accent}>살짝</span> 소개해 주세요
        </h2>
        <p className={styles.desc}>
          작성된 선호값을 기반으로,
          <br />
          살짝 소개해드릴게요.
        </p>
      </div>

      <div className={styles.identity}>
        <Avatar className={styles.avatar}>
          <AvatarFallback className={styles.avatarFallback}>
            살짝
          </AvatarFallback>
        </Avatar>
        <div>
          <p className={styles.name}>김살짝</p>
          <p className={styles.hint}>프로필을 채우면 매칭이 열려요</p>
        </div>
      </div>

      <div className={styles.progressBlock}>
        <div className={styles.track}>
          <div className={styles.bar} />
        </div>
        <p className={styles.progressLabel}>프로필 완성도 28%</p>
        <Button className={styles.action} size="lg">
          프로필 이어서 작성
        </Button>
      </div>
    </section>
  );
}
