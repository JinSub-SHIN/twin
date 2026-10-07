import { useLocation, useNavigate } from 'react-router-dom'
import { COUNSELOR_IMG } from '@/pages/home/CounselorAvatar'
import styles from './flow.module.css'

export function DonePage() {
  const navigate = useNavigate()
  const id = (useLocation().state as { id?: string } | null)?.id

  return (
    <section className={styles.wizard}>
      <div className={styles.done}>
        <img src={COUNSELOR_IMG.greeting} alt="" />
        <h2>공고가 등록되었어요</h2>
        <p>
          이제 지금 살고 있는 집에
          <br />
          새로운 사람을 만나볼 준비가 됐어요.
        </p>
      </div>
      <div className={styles.footerBar}>
        <button
          type="button"
          className={styles.ghost}
          onClick={() => (id ? navigate(`/explore/listing/${id}`) : navigate('/roommate/mine'))}
        >
          내 공고 보기
        </button>
        <button type="button" className={styles.primary} onClick={() => navigate('/roommate/mine')}>
          공고 관리하기
        </button>
      </div>
    </section>
  )
}
