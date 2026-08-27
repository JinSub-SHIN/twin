import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import styles from './ExplorePage.module.css'

export function ExplorePage() {
  return (
    <section className={styles.page}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Explore</p>
        <h2 className={styles.title}>
          리듬이 맞는
          <br />
          <span className={styles.accent}>사람</span>을 고르세요
        </h2>
        <p className={styles.desc}>지역과 생활 패턴으로 후보를 좁혀가는 탐색 화면입니다.</p>
      </div>

      <div className={styles.searchWrap}>
        <Search className={styles.searchIcon} />
        <Input className={styles.searchInput} placeholder="지역, 키워드로 검색" />
      </div>

      <div className={styles.empty}>
        <div aria-hidden className={styles.emptyGlow} />
        <p className={styles.emptyTitle}>아직 후보가 비어 있어요</p>
        <p className={styles.emptyDesc}>
          매칭 로직이 붙으면 여기에 라이프스타일이 가까운 룸메가 나타납니다.
        </p>
      </div>
    </section>
  )
}
