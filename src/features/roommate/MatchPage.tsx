import { useNavigate, useParams } from 'react-router-dom'
import { COUNSELOR_IMG } from '@/pages/home/CounselorAvatar'
import { useRoommate } from './store'
import styles from './flow.module.css'

export function MatchPage() {
  const navigate = useNavigate()
  const { threadId = '' } = useParams()
  const { threads, listings, acceptMatch, rejectMatch } = useRoommate()
  const thread = threads.find((item) => item.id === threadId)
  const listing = listings.find((item) => item.id === thread?.listingId)

  if (!thread || !listing) {
    return (
      <section className={styles.page}>
        <p className={styles.sub}>매칭 요청을 찾지 못했어요.</p>
      </section>
    )
  }

  if (thread.status === 'MATCHED') {
    return (
      <section className={styles.wizard}>
        <div className={styles.done}>
          <img src={COUNSELOR_IMG.wink} alt="" />
          <h2>매칭이 완료되었어요!</h2>
          <p>
            {listing.host.nickname}님과 함께 살기로 했어요.
            <br />
            상세 주소는 이제 서로 확인할 수 있어요.
          </p>
          {listing.area.roadAddress ? (
            <p>
              {listing.area.roadAddress} {listing.area.detailAddress}
            </p>
          ) : (
            <p>상세 주소는 아직 등록되지 않았어요.</p>
          )}
        </div>
        <div className={styles.footerBar}>
          <button type="button" className={styles.ghost} onClick={() => navigate('/explore')}>
            찾기
          </button>
          <button type="button" className={styles.primary} onClick={() => navigate('/')}>
            홈으로
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.wizard}>
      <div className={styles.done}>
        <img src={COUNSELOR_IMG.greeting} alt="" />
        <h2>{listing.host.nickname}님과 함께 살까요?</h2>
        <p>수락하기 전까지는 정확한 주소를 보여주지 않아요.</p>
      </div>
      <div className={styles.footerBar}>
        <button
          type="button"
          className={styles.ghost}
          onClick={() => {
            rejectMatch(thread.id)
            navigate(`/roommate/chat/${thread.id}`)
          }}
        >
          거절하기
        </button>
        <button
          type="button"
          className={styles.primary}
          onClick={() => acceptMatch(thread.id)}
        >
          수락하기
        </button>
      </div>
    </section>
  )
}
