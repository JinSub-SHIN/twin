import { ensureSupabaseAuthFromApiToken, isSupabaseConfigured } from './client'

const BUCKET = 'room-photos'
const PUBLIC_PREFIX = '/storage/v1/object/public/room-photos/'

export function isRoomPhotoPublicUrl(url: string) {
  const base = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '')
  if (!base) return url.includes(PUBLIC_PREFIX)
  return url.startsWith(`${base}${PUBLIC_PREFIX}`)
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export async function uploadRoomPhotoBlob(
  userId: string,
  blob: Blob,
): Promise<string> {
  const supabase = await ensureSupabaseAuthFromApiToken()
  const filePath = `${userId}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: false,
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

export async function uploadRoomPhotoFromUrl(
  userId: string,
  url: string,
): Promise<string> {
  if (isRoomPhotoPublicUrl(url)) return url
  if (url.startsWith('data:')) {
    return uploadRoomPhotoBlob(userId, dataUrlToBlob(url))
  }
  if (url.startsWith('blob:')) {
    const res = await fetch(url)
    return uploadRoomPhotoBlob(userId, await res.blob())
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
