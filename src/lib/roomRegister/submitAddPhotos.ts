import { resolveStorageUserId } from '@/lib/authUserId'
import { normalizePhotoCategory } from '@/lib/roomRegister/normalizePhotoCategory'
import { resolvePhotosForRegister } from '@/lib/supabase/roomPhotos'
import { addRoomPhotos } from '@/service/room/addPhotos'
import type { RoomAddPhotosResponse, RoomPhotoInput } from '@/service/room/photoTypes'

export type PendingRoomPhoto = {
  url: string
  category?: string | null
}

export async function submitAddRoomPhotos(
  roomId: string,
  items: PendingRoomPhoto[],
): Promise<RoomAddPhotosResponse> {
  if (!roomId.trim()) throw new Error('공고 ID가 필요해요.')
  if (items.length === 0) throw new Error('추가할 사진을 선택해 주세요.')

  const userId = resolveStorageUserId()
  if (!userId) {
    throw new Error('로그인 후 사진을 추가할 수 있어요.')
  }

  const uploaded = await resolvePhotosForRegister(userId, items)
  const photos: RoomPhotoInput[] = uploaded.map(item => ({
    url: item.url,
    category: normalizePhotoCategory(item.category ?? null),
  }))

  return addRoomPhotos(roomId.trim(), photos)
}
