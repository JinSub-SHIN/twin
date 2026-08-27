import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  return (
    <section className={styles.page}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Profile</p>
        <h2 className={styles.title}>
          나의 생활
          <br />
          <span className={styles.accent}>리듬</span>을 보여주세요
        </h2>
        <p className={styles.desc}>소개와 희망 조건이 채워질수록 더 정확한 Twin 매칭이 됩니다.</p>
      </div>

      <div className={styles.identity}>
        <Avatar className={styles.avatar}>
          <AvatarFallback className={styles.avatarFallback}>TW</AvatarFallback>
        </Avatar>
        <div>
          <p className={styles.name}>게스트</p>
          <p className={styles.hint}>프로필을 완성하면 매칭이 열립니다</p>
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
  )
}
