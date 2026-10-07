import { useState } from 'react'
import { Bath, BedDouble, CookingPot, DoorOpen, House, Sofa } from 'lucide-react'
import type { ListingPhoto } from './types'
import styles from './ListingDetail.module.css'

const ICONS: Record<string, typeof House> = {
  living: Sofa,
  room: BedDouble,
  kitchen: CookingPot,
  bath: Bath,
  entry: DoorOpen,
}

export function ListingPhotoTile({
  photo,
  className,
}: {
  photo: ListingPhoto
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const Icon = ICONS[photo.id] ?? House

  if (!photo.url || failed) {
    return (
      <div className={`${styles.photoFallback} ${className ?? ''}`} role="img" aria-label={photo.label}>
        <Icon size={28} strokeWidth={1.8} aria-hidden />
        <span>{photo.label}</span>
      </div>
    )
  }

  return (
    <img
      src={photo.url}
      alt={photo.label}
      className={`${styles.photoImg} ${className ?? ''}`}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}
