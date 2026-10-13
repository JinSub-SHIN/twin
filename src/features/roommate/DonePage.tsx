import { ChevronRight } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { COUNSELOR_IMG } from '@/pages/home/CounselorAvatar'
import styles from './create.module.css'

export function DonePage() {
  const navigate = useNavigate()
  const id = (useLocation().state as { id?: string } | null)?.id

  return (
    <section className={styles.wizard}>
      <div className={styles.done}>
        <img src={COUNSELOR_IMG.greeting} alt="" />
        <h1 className={styles.doneTitle}>공고가 등록되었어요!</h1>
        <p className={styles.doneDesc}>
          이제 새로운 동거인을 만날
          <br />
          준비가 됐어요.
        </p>
        <div className={styles.doneActions}>
          <button
            type="button"
            className={cn(styles.primary, styles.full)}
            onClick={() => (id ? navigate(`/explore/listing/${id}`) : navigate('/roommate/mine'))}
          >
            내 공고 보기
          </button>
          <button
            type="button"
            className={cn(styles.ghost, styles.full)}
            onClick={() => navigate('/roommate/mine')}
          >
            공고 관리하기
          </button>
        </div>

        <button type="button" className={styles.exploreCard} onClick={() => navigate('/explore')}>
          <strong>다른 공고도 찾아볼까요?</strong>
          <span>지금 내 조건에 맞는 다른 공고도 둘러보세요.</span>
          <em>
            공고 둘러보기
            <ChevronRight size={14} strokeWidth={2.4} />
          </em>
          <img src={COUNSELOR_IMG.wink} alt="" />
        </button>
      </div>
    </section>
  )
}
