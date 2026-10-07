import { Lock, MapPin, TrainFront } from 'lucide-react'
import type { ListingArea } from './types'
import styles from './ListingDetail.module.css'

export function LocationCard({ area }: { area: ListingArea }) {
  return (
    <section className={styles.block} aria-labelledby="location-title">
      <h3 id="location-title" className={styles.blockTitle}>
        위치
      </h3>
      <div className={styles.locationCard}>
        <div className={styles.mapArt} aria-hidden>
          <span className={styles.mapRoadH} />
          <span className={styles.mapRoadV} />
          <span className={styles.mapRoadD} />
          <span className={styles.mapArea} />
          <span className={styles.mapPin}>
            <MapPin size={18} strokeWidth={2.4} />
          </span>
        </div>
        <div className={styles.locationBody}>
          <p className={styles.locationName}>
            {area.city} {area.district} {area.dong}
          </p>
          {area.station ? (
            <p className={styles.locationSub}>
              <TrainFront size={14} strokeWidth={2.2} aria-hidden />
              {area.station.name}까지 도보 {area.station.walkMinutes}분
            </p>
          ) : null}
          <p className={styles.locationNote}>
            <Lock size={13} strokeWidth={2.4} aria-hidden />
            정확한 위치는 매칭 후 확인할 수 있어요.
          </p>
        </div>
      </div>
    </section>
  )
}
