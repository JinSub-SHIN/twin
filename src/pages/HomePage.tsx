import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80'

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
          <h1 className={styles.brand}>
            Twin
            <span className={styles.brandDot}>.</span>
          </h1>
          <div className={styles.taglineRow}>
            <span className={styles.taglineLine} />
            <p className={styles.tagline}>two lives, one place</p>
          </div>
        </div>

        <h2 className={styles.headline}>
          같이 살 사람을
          <br />
          <span className={styles.accent}>감각</span>으로 고르세요
        </h2>
        <p className={styles.desc}>생활 리듬과 취향이 맞는 룸메이트를 '트윈'이 이어줍니다.</p>

        <div className={styles.actions}>
          <Link to="/explore" className={styles.cta}>
            룸메 찾기 시작
            <ArrowUpRight className={styles.ctaIcon} />
          </Link>
          <Link to="/profile" className={styles.secondaryLink}>
            내 생활 프로필 만들기
          </Link>
        </div>
      </div>
    </section>
  )
}
