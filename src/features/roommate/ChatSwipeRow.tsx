import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type TouchEvent,
} from 'react'
import { cn } from '@/lib/utils'
import styles from './ChatRoomsPage.module.css'

const ACTION_WIDTH = 76
const OPEN_RATIO = 0.38
export const CHAT_LEAVE_ICON = '/images/chatOut.png'

type ChatSwipeRowProps = {
  rowId: string
  open: boolean
  onOpen: () => void
  onClose: () => void
  onLeave: () => void
  leaving: boolean
  className?: string
  children: ReactNode
}

export function ChatSwipeRow({
  rowId,
  open,
  onOpen,
  onClose,
  onLeave,
  leaving,
  className,
  children,
}: ChatSwipeRowProps) {
  const frontRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(open ? ACTION_WIDTH : 0)
  const draggingRef = useRef(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const startOffsetRef = useRef(0)

  const applyOffset = useCallback((amount: number, animate: boolean) => {
    const el = frontRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(ACTION_WIDTH, amount))
    offsetRef.current = clamped
    el.style.transition = animate ? 'transform 0.2s ease-out' : 'none'
    el.style.transform =
      clamped > 0 ? `translate3d(${-clamped}px, 0, 0)` : ''
    if (animate && clamped === 0) {
      window.setTimeout(() => {
        el.style.transition = ''
      }, 210)
    }
  }, [])

  useEffect(() => {
    if (draggingRef.current) return
    applyOffset(open ? ACTION_WIDTH : 0, true)
  }, [applyOffset, open])

  const finishGesture = useCallback(
    (amount: number) => {
      draggingRef.current = false
      if (amount >= ACTION_WIDTH * OPEN_RATIO) {
        onOpen()
        applyOffset(ACTION_WIDTH, true)
      } else {
        onClose()
        applyOffset(0, true)
      }
    },
    [applyOffset, onClose, onOpen],
  )

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return
    const touch = event.touches[0]!
    draggingRef.current = false
    startXRef.current = touch.clientX
    startYRef.current = touch.clientY
    startOffsetRef.current = offsetRef.current
  }

  const handleTouchMove = useCallback(
    (event: globalThis.TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return

      const dx = startXRef.current - touch.clientX
      const dy = touch.clientY - startYRef.current

      if (!draggingRef.current) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        if (Math.abs(dy) > Math.abs(dx) * 1.15) return
        if (dx <= 0 && startOffsetRef.current <= 0) return
        draggingRef.current = true
      }

      const next = Math.max(
        0,
        Math.min(ACTION_WIDTH, startOffsetRef.current + dx),
      )
      applyOffset(next, false)
      if (next > 6) event.preventDefault()
    },
    [applyOffset],
  )

  const handleTouchEnd = useCallback(() => {
    if (!draggingRef.current) return
    finishGesture(offsetRef.current)
  }, [finishGesture])

  useEffect(() => {
    const el = frontRef.current
    if (!el) return
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd)
    el.addEventListener('touchcancel', handleTouchEnd)
    return () => {
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
      el.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [handleTouchEnd, handleTouchMove])

  return (
    <li className={styles.swipeRow} data-chat-row={rowId}>
      <div className={styles.swipeActions} aria-hidden={!open}>
        <button
          type="button"
          className={styles.leaveBtn}
          disabled={leaving}
          aria-label="채팅방 나가기"
          onClick={(event) => {
            event.stopPropagation()
            onLeave()
          }}
        >
          <span className={styles.leaveGlyph} aria-hidden>
            {leaving ? (
              '…'
            ) : (
              <img
                src={CHAT_LEAVE_ICON}
                alt=""
                className={styles.leaveIcon}
                width={34}
                height={34}
              />
            )}
          </span>
          <span className={styles.leaveCaption} aria-hidden>
            나가요
          </span>
        </button>
      </div>
      <div
        ref={frontRef}
        className={cn(styles.swipeFront, className)}
        onTouchStart={onTouchStart}
      >
        {children}
      </div>
    </li>
  )
}

export { ACTION_WIDTH as CHAT_SWIPE_ACTION_WIDTH }
