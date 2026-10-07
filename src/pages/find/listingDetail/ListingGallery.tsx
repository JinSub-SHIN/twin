import { useRef, useState } from 'react'
import { ListingPhotoTile } from './ListingPhotoTile'
import type { ListingPhoto } from './types'
import styles from './ListingDetail.module.css'

export function ListingGallery({
  photos,
  badge,
}: {
  photos: ListingPhoto[]
  badge: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  const onScroll = () => {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    const next = Math.round(track.scrollLeft / track.clientWidth)
    if (next !== index) setIndex(next)
  }

  return (
    <section className={styles.gallery} aria-roledescription="carousel" aria-label="집 사진">
      <div ref={trackRef} className={styles.galleryTrack} onScroll={onScroll}>
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className={styles.gallerySlide}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${photos.length} ${photo.label}`}
          >
            <ListingPhotoTile photo={photo} />
          </div>
        ))}
      </div>
      <span className={styles.galleryBadge}>{badge}</span>
      {photos.length > 1 ? (
        <span className={styles.galleryCount} aria-live="polite">
          {index + 1} / {photos.length}
        </span>
      ) : null}
    </section>
  )
}
