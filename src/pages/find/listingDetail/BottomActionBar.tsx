import { Heart, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './ListingDetail.module.css'

export function BottomActionBar({
  liked,
  onLike,
  onInquire,
}: {
  liked: boolean
  onLike: () => void
  onInquire: () => void
}) {
  return (
    <div className={styles.actionBar}>
      <button
        type="button"
        className={cn(styles.likeBtn, liked && styles.likeBtnOn)}
        aria-pressed={liked}
        onClick={onLike}
      >
        <Heart size={20} strokeWidth={2.3} fill={liked ? 'currentColor' : 'none'} />
        <span>관심</span>
      </button>
      <button type="button" className={styles.inquireBtn} onClick={onInquire}>
        <MessageCircle size={18} strokeWidth={2.4} aria-hidden />
        문의하기
      </button>
    </div>
  )
}
