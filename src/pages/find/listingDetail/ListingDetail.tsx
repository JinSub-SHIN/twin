import { useEffect, useRef, useState } from 'react'
import { BottomActionBar } from './BottomActionBar'
import { HostProfile } from './HostProfile'
import { ListingGallery } from './ListingGallery'
import { ListingSummary } from './ListingSummary'
import { ListingTopBar } from './ListingTopBar'
import { LivingCondition } from './LivingCondition'
import { LocationCard } from './LocationCard'
import { PreferTags } from './PreferTags'
import { SafetyNotice } from './SafetyNotice'
import { SpaceIntro } from './SpaceIntro'
import type { ListingDetailData } from './types'
import styles from './ListingDetail.module.css'

export function ListingDetail({
  listing,
  onBack,
  onInquire,
  preview = false,
}: {
  listing: ListingDetailData
  onBack: () => void
  onInquire?: () => void
  preview?: boolean
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [solid, setSolid] = useState(false)
  const [liked, setLiked] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const scroller = rootRef.current?.closest('main')
    if (!scroller) return
    const onScroll = () => {
      const threshold = scroller.clientWidth * 0.62
      setSolid(scroller.scrollTop > threshold)
    }
    onScroll()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const toggleLike = () => {
    setLiked(!liked)
    setToast(liked ? '관심목록에서 뺐어요' : '관심목록에 담았어요')
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: '살짝 공고', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setToast('링크를 복사했어요')
    } catch {
      /* 사용자가 공유를 취소한 경우 */
    }
  }

  return (
    <div ref={rootRef} className={styles.root}>
      <ListingTopBar
        solid={solid}
        liked={liked}
        onBack={onBack}
        onLike={toggleLike}
        onShare={() => void share()}
      />
      <ListingGallery photos={listing.photos} />

      <div className={styles.body}>
        <ListingSummary listing={listing} />
        <SpaceIntro space={listing.space} photos={listing.photos} />
        <HostProfile host={listing.host} />
        <LivingCondition living={listing.living} />
        <PreferTags tags={listing.preferTags} />
        <LocationCard area={listing.area} />
        <SafetyNotice hostName={listing.host.nickname} />
      </div>

      {preview ? null : (
        <BottomActionBar
          liked={liked}
          onLike={toggleLike}
          onInquire={() => (onInquire ? onInquire() : setToast('문의하기는 곧 열려요'))}
        />
      )}

      {toast ? (
        <p className={styles.toast} role="status">
          {toast}
        </p>
      ) : null}
    </div>
  )
}
