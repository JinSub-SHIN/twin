import { ensureSupabaseAuthFromApiToken, isSupabaseConfigured } from './client'

const BUCKET = 'room-photos'
const PUBLIC_PREFIX = '/storage/v1/object/public/room-photos/'
const TMP_SEGMENT = 'room-photos/tmp/'

export function isRoomPhotoPublicUrl(url: string) {
  const base = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '')
  if (!base) return url.includes(PUBLIC_PREFIX)
  return url.startsWith(`${base}${PUBLIC_PREFIX}`)
}

/** 공고 등록 전 임시 저장 경로 (v3.21) */
export function isRoomPhotoTmpUrl(url: string) {
  if (url.includes(TMP_SEGMENT)) return true
  const base = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '')
  if (!base) return false
  return url.startsWith(`${base}${PUBLIC_PREFIX}tmp/`)
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

async function uploadBlobToStorage(blob: Blob, objectKey: string): Promise<string> {
  const supabase = await ensureSupabaseAuthFromApiToken()
  const { error } = await supabase.storage.from(BUCKET).upload(objectKey, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: false,
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectKey)
  return data.publicUrl
}

/** 등록 후 사진 추가 — room-photos/{userId}/ */
export async function uploadRoomPhotoBlob(
  userId: string,
  blob: Blob,
): Promise<string> {
  const filePath = `${userId}/${crypto.randomUUID()}.jpg`
  return uploadBlobToStorage(blob, filePath)
}

/** 공고 등록 중 임시 — room-photos/tmp/{userId}/ */
export async function uploadTmpRoomPhotoBlob(
  userId: string,
  blob: Blob,
): Promise<string> {
  const filePath = `tmp/${userId}/${crypto.randomUUID()}.jpg`
  return uploadBlobToStorage(blob, filePath)
}

export async function uploadRoomPhotoFromUrl(
  userId: string,
  url: string,
): Promise<string> {
  if (isRoomPhotoPublicUrl(url) && !isRoomPhotoTmpUrl(url)) return url
  if (url.startsWith('data:')) {
    return uploadRoomPhotoBlob(userId, dataUrlToBlob(url))
  }
  if (url.startsWith('blob:')) {
    const res = await fetch(url)
    return uploadRoomPhotoBlob(userId, await res.blob())
  }
  throw new Error('업로드할 수 없는 사진 형식이에요.')
}

export async function uploadTmpRoomPhotoFromUrl(
  userId: string,
  url: string,
): Promise<string> {
  if (isRoomPhotoTmpUrl(url)) return url
  if (url.startsWith('data:')) {
    return uploadTmpRoomPhotoBlob(userId, dataUrlToBlob(url))
  }
  if (url.startsWith('blob:')) {
    const res = await fetch(url)
    return uploadTmpRoomPhotoBlob(userId, await res.blob())
  }
  throw new Error('업로드할 수 없는 사진 형식이에요.')
}

export async function resolvePhotosForRegister(
  userId: string,
  items: { url: string; category?: string | null }[],
): Promise<{ url: string; category?: string | null }[]> {
  if (!isSupabaseConfigured()) {
    const invalid = items.some(item => !isRoomPhotoPublicUrl(item.url))
    if (invalid) {
      throw new Error(
        '사진은 Supabase room-photos에 업로드된 URL이 필요해요. .env Supabase 설정을 확인해 주세요.',
      )
    }
    return items
  }

  const out: { url: string; category?: string | null }[] = []
  for (const item of items) {
    const url = await uploadRoomPhotoFromUrl(userId, item.url)
    out.push({ url, category: item.category ?? null })
  }
  return out
}
