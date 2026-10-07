import { Check } from 'lucide-react'
import { ListingPhotoTile } from './ListingPhotoTile'
import type { ListingPhoto, ListingSpace } from './types'
import styles from './ListingDetail.module.css'

export function SpaceIntro({
  space,
  photos,
}: {
  space: ListingSpace
  photos: ListingPhoto[]
}) {
  const points = [
    space.privateRoom,
    `${space.sharedAreas.join(' · ')} 함께 사용`,
    space.furnished ? '기본 가구 있어요' : '가구는 직접 준비해요',
    ...space.notes,
  ]
  const rooms = photos.filter((photo) => ['room', 'living', 'kitchen'].includes(photo.id))

  return (
    <section className={styles.block} aria-labelledby="space-title">
      <h3 id="space-title" className={styles.blockTitle}>
        공간 소개
      </h3>
      <p className={styles.blockText}>{space.description}</p>
      <ul className={styles.checkList}>
        {points.map((point) => (
          <li key={point}>
            <Check size={15} strokeWidth={2.8} aria-hidden />
            {point}
          </li>
        ))}
      </ul>
      {rooms.length > 0 ? (
        <div className={styles.roomStrip}>
          {rooms.map((photo) => (
            <figure key={photo.id} className={styles.roomCard}>
              <ListingPhotoTile photo={photo} />
              <figcaption>{photo.label}</figcaption>
            </figure>
          ))}
        </div>
      ) : null}
    </section>
  )
}
