import { useEffect, useState } from 'react'

/** 모바일 소프트 키보드가 가리는 하단 여백(px). 없으면 0 */
export function useVisualViewportBottomInset() {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const gap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setInset(Math.round(gap))
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    window.addEventListener('resize', update)

    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return inset
}
