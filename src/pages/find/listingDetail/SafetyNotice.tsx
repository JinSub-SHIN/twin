import { Ban, BadgeCheck, Lock, ShieldCheck, UserRound } from 'lucide-react'
import { COUNSELOR_IMG } from '@/pages/home/CounselorAvatar'
import styles from './ListingDetail.module.css'

const ITEMS = [
  { icon: BadgeCheck, label: '공고 등록자 정보 확인' },
  { icon: Ban, label: '신고 · 차단 기능' },
  { icon: Lock, label: '정확한 주소 비공개' },
  { icon: UserRound, label: '매칭 전 개인정보 보호' },
]

export function SafetyNotice({ hostName }: { hostName: string }) {
  return (
    <>
      <div className={styles.mascotBand}>
        <img src={COUNSELOR_IMG.greeting} alt="" />
        <p>
          <strong>살짝이는</strong>
          {hostName}님의 공간에 새로운 인연이 생기길 바라고 있어요!
        </p>
      </div>

      <section className={styles.safety} aria-labelledby="safety-title">
        <h3 id="safety-title" className={styles.safetyTitle}>
          <ShieldCheck size={18} strokeWidth={2.3} aria-hidden />
          안전한 매칭을 위해
        </h3>
        <p className={styles.safetyDesc}>살짝은 서로의 신뢰를 가장 중요하게 생각해요.</p>
        <ul className={styles.safetyList}>
          {ITEMS.map(({ icon: Icon, label }) => (
            <li key={label}>
              <Icon size={14} strokeWidth={2.3} aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
