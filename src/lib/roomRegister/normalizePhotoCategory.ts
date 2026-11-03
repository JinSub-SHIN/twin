import type { RoomPhotoCategory } from '@/service/room/photoTypes'

const PHOTO_CATEGORIES = new Set<string>([
  '거실',
  '방',
  '주방',
  '화장실',
  '현관',
  '기타',
])

export function normalizePhotoCategory(
  raw: string | undefined | null,
): RoomPhotoCategory | null {
  if (!raw) return null
  const trimmed = raw.trim()
  return PHOTO_CATEGORIES.has(trimmed) ? (trimmed as RoomPhotoCategory) : null
}
