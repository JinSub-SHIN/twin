import { useNavigate } from 'react-router-dom'
import { areaLabel, monthlyBurden } from './toDetail'
import { useRoommate } from './store'
import styles from './flow.module.css'

export function BrowsePage() {
  const navigate = useNavigate()
  const { listings } = useRoommate()
  const open = listings.filter((item) => item.status !== 'DRAFT' && item.status !== 'CLOSED')

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>
            함께 살 사람을
            <br />
            찾아보세요
          </h1>
          <p className={styles.sub}>지금 살고 있는 집의 빈 공간을 나누는 공고예요.</p>
        </div>
        <button type="button" className={styles.linkBtn} onClick={() => navigate('/roommate/mine')}>
          내 공고
        </button>
      </header>

      <ul className={styles.list}>
        {open.map((listing) => {
          const cover = listing.photos.find((photo) => photo.cover) ?? listing.photos[0]
          const cost = monthlyBurden(listing)
          return (
            <li key={listing.id}>
              <button
                type="button"
                className={styles.card}
                onClick={() => navigate(`/explore/listing/${listing.id}`)}
              >
                {cover ? <img className={styles.cardPhoto} src={cover.url} alt="" /> : null}
                <span className={styles.cardBody}>
                  <p className={styles.cardArea}>{areaLabel(listing)}</p>
                  <p className={styles.cardTitle}>{listing.title.replace('\n', ' ')}</p>
                  <p className={styles.cardPrice}>
                    {cost == null ? '비용은 대화로 조율' : `한 달에 약 ${cost}만원`}
                  </p>
                  <ul className={styles.tags}>
                    {listing.preference.tags.slice(0, 3).map((tag) => (
                      <li key={tag}>#{tag.replace(/\s+/g, '')}</li>
                    ))}
                  </ul>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <button type="button" className={styles.primary} onClick={() => navigate('/roommate/new')}>
        함께 살 사람 찾기
      </button>
    </section>
  )
}
