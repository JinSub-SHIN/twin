import { useEffect, type RefObject } from 'react'

type SwipeBackOptions = {
  /** 이 비율 이상 오른쪽으로 밀면 뒤로 (0~1) */
  thresholdRatio?: number
  /** 왼쪽 가장자리(px)에서 시작하면 바로 인식 */
  edgeWidth?: number
}

const DEFAULTS: Required<SwipeBackOptions> = {
  thresholdRatio: 0.32,
  edgeWidth: 28,
}

function isInteractiveField(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]'),
  )
}

function scrollHostUnderTouch(root: HTMLElement, target: EventTarget | null) {
  let node = target instanceof Element ? target : null
  while (node && root.contains(node)) {
    if (node instanceof HTMLElement && node !== root) {
      const { overflowY } = getComputedStyle(node)
      if (
        (overflowY === 'auto' || overflowY === 'scroll') &&
        node.scrollHeight > node.clientHeight + 1
      ) {
        return node
      }
    }
    node = node.parentElement
  }
  return null
}

export function useSwipeBack(
  ref: RefObject<HTMLElement | null>,
  onBack: () => void,
  options: SwipeBackOptions = {},
) {
  const { thresholdRatio, edgeWidth } = { ...DEFAULTS, ...options }

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let startX = 0
    let startY = 0
    let tracking = false
    let dragging = false
    let offsetX = 0
    let fromEdge = false

    const resetTransform = (animate: boolean) => {
      el.style.transition = animate ? 'transform 0.22s ease-out' : 'none'
      el.style.transform = ''
      if (animate) {
        window.setTimeout(() => {
          el.style.transition = ''
        }, 230)
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      const touch = event.touches[0]!
      if (isInteractiveField(event.target)) return

      startX = touch.clientX
      startY = touch.clientY
      fromEdge = startX <= edgeWidth
      const scrollHost = scrollHostUnderTouch(el, event.target)
      const canPanBack =
        fromEdge ||
        !scrollHost ||
        scrollHost.scrollTop <= 4
      tracking = canPanBack
      dragging = false
      offsetX = 0
    }

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return

      const dx = touch.clientX - startX
      const dy = touch.clientY - startY

      if (!tracking) {
        if (dx <= 0 || Math.abs(dy) > Math.abs(dx) * 1.15) return
        if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return
        if (Math.abs(dx) <= Math.abs(dy)) return
        if (isInteractiveField(event.target)) return
        tracking = true
      }

      if (!dragging) {
        if (!fromEdge && dx < 18) return
        dragging = true
      }

      offsetX = Math.max(0, dx)
      el.style.transition = 'none'
      el.style.transform = `translate3d(${offsetX}px, 0, 0)`
      if (offsetX > 8) event.preventDefault()
    }

    const finish = () => {
      if (!tracking) return
      const width = window.innerWidth || 360
      const threshold = width * thresholdRatio
      tracking = false

      if (offsetX >= threshold) {
        el.style.transition = 'transform 0.2s ease-out'
        el.style.transform = `translate3d(${width}px, 0, 0)`
        window.setTimeout(() => {
          onBack()
          resetTransform(false)
        }, 200)
      } else {
        resetTransform(true)
      }

      dragging = false
      offsetX = 0
      fromEdge = false
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', finish)
    el.addEventListener('touchcancel', finish)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', finish)
      el.removeEventListener('touchcancel', finish)
      resetTransform(false)
    }
  }, [edgeWidth, onBack, ref, thresholdRatio])
}
