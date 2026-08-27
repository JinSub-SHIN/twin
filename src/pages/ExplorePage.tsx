import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import styles from './ExplorePage.module.css'

export function ExplorePage() {
  return (
    <section className={styles.page}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>찾기</p>
        <h2 className={styles.title}>
          내 방의
          <br />
          <span className={styles.accent}>살짝</span>을 찾아보세요
        </h2>
        <p className={styles.desc}>월세를 나눌 사람, 생활 리듬이 맞는 사람을 살짝 만나보세요.</p>
      </div>

      <div className={styles.searchWrap}>
        <Search className={styles.searchIcon} />
        <Input className={styles.searchInput} placeholder="지역, 키워드로 검색" />
      </div>

      <div className={styles.empty}>
        <div aria-hidden className={styles.emptyGlow} />
        <p className={styles.emptyTitle}>아직 후보가 비어 있어요</p>
        <p className={styles.emptyDesc}>곧 여기에 월세를 살짝 나눌 룸메가 나타납니다.</p>
      </div>
    </section>
  )
}
