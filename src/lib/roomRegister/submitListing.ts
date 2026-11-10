import type { ListingDraft } from '@/features/roommate/types'
import { isRoomPhotoTmpUrl } from '@/lib/supabase/roomPhotos'
import { registerRoom } from '@/service/room/register'
import { mapDraftToRegisterBody } from './mapDraftToRegisterBody'
import { normalizePhotoCategory } from './normalizePhotoCategory'

export async function submitListingDraft(draft: ListingDraft) {
  const cover = draft.photos.find(photo => photo.cover)
  const orderedPhotos = cover
    ? [cover, ...draft.photos.filter(photo => photo.id !== cover.id)]
    : [...draft.photos]

  const bad = orderedPhotos.find(photo => !isRoomPhotoTmpUrl(photo.url))
  if (bad) {
    throw new Error(
      '등록 전에 올린 임시 사진만 공고에 포함할 수 있어요. 사진 단계에서 다시 업로드해 주세요.',
    )
  }

  const photoPayload = orderedPhotos.map(photo => ({
    url: photo.url,
    category: normalizePhotoCategory(photo.category ?? null),
  }))

  const body = mapDraftToRegisterBody(draft, photoPayload)
  await registerRoom(body)
}
