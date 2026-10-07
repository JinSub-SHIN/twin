import { CigaretteOff, Cigarette, Moon, PawPrint, UserRound, Wine } from 'lucide-react'
import type { LivingPolicy } from './types'
import styles from './ListingDetail.module.css'

const SMOKING = { no: '비흡연', outdoor: '실외 흡연만', yes: '흡연 가능' } as const
const PET = { no: '함께하기 어려워요', yes: '함께해도 좋아요' } as const
const DRINK = { none: '마시지 않아요', sometimes: '가끔 마셔요', often: '자주 마셔요' } as const
const GENDER = { any: '성별 무관', female: '여성 선호', male: '남성 선호' } as const

export function LivingCondition({ living }: { living: LivingPolicy }) {
  const items = [
    {
      icon: living.smoking === 'no' ? CigaretteOff : Cigarette,
      label: '흡연',
      value: SMOKING[living.smoking],
    },
    { icon: PawPrint, label: '반려동물', value: PET[living.pet] },
    { icon: Wine, label: '음주', value: DRINK[living.drink] },
    { icon: UserRound, label: '성별', value: GENDER[living.prefGender] },
  ]

  return (
    <section className={styles.block} aria-labelledby="living-title">
      <h3 id="living-title" className={styles.blockTitle}>
        생활 조건
      </h3>
      <div className={styles.livingGrid}>
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className={styles.livingItem}>
            <span className={styles.livingIcon}>
              <Icon size={18} strokeWidth={2.1} aria-hidden />
            </span>
            <span className={styles.livingLabel}>{label}</span>
            <span className={styles.livingValue}>{value}</span>
          </div>
        ))}
        <div className={`${styles.livingItem} ${styles.livingWide}`}>
          <span className={styles.livingIcon}>
            <Moon size={18} strokeWidth={2.1} aria-hidden />
          </span>
          <span className={styles.livingLabel}>생활시간</span>
          <span className={styles.livingValue}>{living.lifeTime}</span>
        </div>
      </div>
    </section>
  )
}
