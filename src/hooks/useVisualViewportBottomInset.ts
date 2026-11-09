import { useEffect, useState } from 'react'

export type VisualViewportLayout = {
  height: number
  offsetTop: number
  /** 소프트 키보드 등으로 보이는 영역이 줄었는지 */
  keyboardOpen: boolean
}

const KEYBOARD_GAP_PX = 48

function readLayout(): VisualViewportLayout {
  const vv = window.visualViewport
  if (!vv) {
    return {
      height: window.innerHeight,
      offsetTop: 0,
      keyboardOpen: false,
    }
  }
  const gap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
  return {
    height: vv.height,
    offsetTop: vv.offsetTop,
    keyboardOpen: gap >= KEYBOARD_GAP_PX,
  }
}

/** 모바일 키보드·주소창에 맞춘 보이는 뷰포트 크기 */
export function useVisualViewportLayout() {
  const [layout, setLayout] = useState<VisualViewportLayout>(() =>
    typeof window !== 'undefined'
      ? readLayout()
      : { height: 0, offsetTop: 0, keyboardOpen: false },
  )

  useEffect(() => {
    const vv = window.visualViewport
    const update = () => setLayout(readLayout())

    update()
    vv?.addEventListener('resize', update)
    vv?.addEventListener('scroll', update)
    window.addEventListener('resize', update)

    return () => {
      vv?.removeEventListener('resize', update)
      vv?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return layout
}

/** @deprecated useVisualViewportLayout 사용 */
export function useVisualViewportBottomInset() {
  const { height, offsetTop, keyboardOpen } = useVisualViewportLayout()
  if (!keyboardOpen) return 0
  return Math.max(0, Math.round(window.innerHeight - height - offsetTop))
}
