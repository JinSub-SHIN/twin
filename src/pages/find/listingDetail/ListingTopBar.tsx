import { ArrowLeft, Heart, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './ListingDetail.module.css'

export function ListingTopBar({
  solid,
  liked,
  onBack,
  onLike,
  onShare,
}: {
  solid: boolean
  liked: boolean
  onBack: () => void
  onLike: () => void
  onShare: () => void
}) {
  return (
    <header className={cn(styles.topBar, solid && styles.topBarSolid)}>
      <button type="button" className={styles.topBtn} aria-label="뒤로" onClick={onBack}>
        <ArrowLeft size={20} strokeWidth={2.3} />
      </button>
      <h1 className={styles.topTitle}>공고 상세</h1>
      <div className={styles.topActions}>
        <button
          type="button"
          className={cn(styles.topBtn, liked && styles.topBtnLiked)}
          aria-label={liked ? '관심목록에서 빼기' : '관심목록에 담기'}
          aria-pressed={liked}
          onClick={onLike}
        >
          <Heart size={19} strokeWidth={2.3} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <button type="button" className={styles.topBtn} aria-label="공유" onClick={onShare}>
          <Share2 size={18} strokeWidth={2.3} />
        </button>
      </div>
    </header>
  )
}
