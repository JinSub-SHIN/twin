import { useEffect, useMemo, useState } from 'react'
import { buildRoomCountQuery } from '@/lib/roomListQuery'
import { getRoomCount } from '@/service/room/list'
import type { ListingFilter } from './types'

const DEBOUNCE_MS = 280

export function useRoomCountPreview(
  draft: ListingFilter,
  legacyRegions: string[],
  enabled: boolean,
) {
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const regionKey = legacyRegions.join('|')
  const countQuery = useMemo(
    () => buildRoomCountQuery(draft, legacyRegions),
    [draft, regionKey],
  )

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    const timer = window.setTimeout(() => {
      setLoading(true)
      void getRoomCount(countQuery)
        .then((res) => {
          if (!cancelled) setTotal(res.total)
        })
        .catch(() => {
          if (!cancelled) setTotal(null)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [enabled, countQuery])

  return { total, loading }
}
