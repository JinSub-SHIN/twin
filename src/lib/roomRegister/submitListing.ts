import type { ListingDraft } from '@/features/roommate/types'
import { resolveStorageUserId } from '@/lib/authUserId'
import { resolvePhotosForRegister } from '@/lib/supabase/roomPhotos'
import { registerRoom } from '@/service/room/register'
import { mapDraftToRegisterBody } from './mapDraftToRegisterBody'

export async function submitListingDraft(draft: ListingDraft) {
  const userId = resolveStorageUserId()
  if (!userId) {
    throw new Error('로그인이 필요해요. 사진 업로드와 공고 등록을 위해 다시 로그인해 주세요.')
  }

  const cover = draft.photos.find(photo => photo.cover)
  const orderedPhotos = cover
    ? [cover, ...draft.photos.filter(photo => photo.id !== cover.id)]
    : [...draft.photos]

  const photoPayload = await resolvePhotosForRegister(
    userId,
    orderedPhotos.map(photo => ({
      url: photo.url,
      category: photo.category ?? null,
    })),
  )

  const body = mapDraftToRegisterBody(draft, photoPayload)
  await registerRoom(body)
}
