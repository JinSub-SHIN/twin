import { useNavigate } from 'react-router-dom'
import { areaLabel } from './toDetail'
import { useRoommate } from './store'
import type { ListingStatus } from './types'
import styles from './flow.module.css'

const STATUS: Record<ListingStatus, string> = {
  DRAFT: '작성 중',
  PUBLISHED: '게시중',
  PAUSED: '잠시 멈춤',
  MATCHING: '문의중',
  MATCHED: '매칭완료',
  CLOSED: '종료',
}

export function MinePage() {
  const navigate = useNavigate()
  const { listings } = useRoommate()
  const mine = listings.filter((item) => item.mine)

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>내 공고</h1>
          <p className={styles.sub}>게시중, 문의, 매칭 상태를 여기서 확인해요.</p>
        </div>
        <button type="button" className={styles.linkBtn} onClick={() => navigate('/roommate')}>
          목록
        </button>
      </header>
      {mine.length === 0 ? (
        <p className={styles.sub}>아직 올린 공고가 없어요.</p>
      ) : (
        <ul className={styles.list}>
          {mine.map((listing) => (
            <li key={listing.id}>
              <button
                type="button"
                className={styles.card}
                onClick={() => navigate(`/explore/listing/${listing.id}`)}
              >
                <span className={styles.cardBody}>
                  <p className={styles.status}>{STATUS[listing.status]}</p>
                  <p className={styles.cardTitle}>{listing.title.replace('\n', ' ')}</p>
                  <p className={styles.cardArea}>{areaLabel(listing)}</p>
                  <p className={styles.mineMeta}>
                    <span>조회 {listing.stats.views}</span>
                    <span>관심 {listing.stats.saves}</span>
                    <span>문의 {listing.stats.inquiries}</span>
                  </p>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
