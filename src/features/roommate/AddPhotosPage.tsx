import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { loadAccessToken } from '@/lib/authStorage'
import { submitAddRoomPhotos } from '@/lib/roomRegister/submitAddPhotos'
import { cn } from '@/lib/utils'
import { ApiError } from '@/service/http'
import { addRoomPhotosErrorMessage } from '@/service/room/addPhotos'
import { MAX_PHOTOS, readPhoto } from './photo'
import type { PhotoCategory } from './types'
import styles from './create.module.css'

const CATEGORIES: { value: PhotoCategory; label: string }[] = [
  { value: '거실', label: '거실' },
  { value: '방', label: '방' },
  { value: '주방', label: '주방' },
  { value: '화장실', label: '화장실' },
  { value: '현관', label: '현관' },
  { value: '기타', label: '기타' },
]

type Pending = {
  id: string
  url: string
  category: PhotoCategory | null
}

export function AddPhotosPage() {
  const { listingId = '' } = useParams<{ listingId: string }>()
  const navigate = useNavigate()
  const [photos, setPhotos] = useState<Pending[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [tip, setTip] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const pickFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const room = MAX_PHOTOS - photos.length
    if (room <= 0) {
      setTip(`한 번에 최대 ${MAX_PHOTOS}장까지 추가할 수 있어요.`)
      return
    }
    setLoading(true)
    setTip('')
    try {
      const slice = Array.from(files).slice(0, room)
      const added: Pending[] = []
      for (let index = 0; index < slice.length; index += 1) {
        const url = await readPhoto(slice[index])
        added.push({
          id: `new-${Date.now()}-${index}`,
          url,
          category: null,
        })
      }
      setPhotos(prev => [...prev, ...added])
    } catch {
      setTip('사진을 불러오지 못했어요. 다른 파일로 시도해 주세요.')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const submit = async () => {
    if (submitting || photos.length === 0) return
    if (!loadAccessToken()) {
      setTip('로그인 후 사진을 추가할 수 있어요.')
      navigate('/login', {
        state: { from: `/roommate/listing/${listingId}/photos` },
      })
      return
    }
    setSubmitting(true)
    setTip('')
    try {
      await submitAddRoomPhotos(
        listingId,
        photos.map(p => ({ url: p.url, category: p.category })),
      )
      navigate(`/explore/listing/${listingId}`, { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? addRoomPhotosErrorMessage(err)
          : err instanceof Error
            ? err.message
            : addRoomPhotosErrorMessage(err)
      setTip(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={styles.wizard}>
      <div className={styles.body}>
        <button
          type="button"
          className={styles.ghost}
          onClick={() => navigate(-1)}
        >
          돌아가기
        </button>
        <h1 className={styles.title}>사진 추가</h1>
        <p className={styles.sub}>
          선택한 사진은 Supabase room-photos에 올린 뒤, 이 공고 맨 뒤에
          이어 붙여요.
        </p>

        {tip ? <p className={styles.tip}>{tip}</p> : null}

        <div className={cn(styles.content, styles.field)}>
          <label className={cn(styles.photoEmpty, loading && styles.photoBusy)}>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={loading || photos.length >= MAX_PHOTOS}
              onChange={event => void pickFiles(event.target.files)}
            />
            {loading ? '사진 준비 중…' : '사진 선택'}
          </label>

          {photos.length > 0 ? (
            <ul className={styles.addPhotoList}>
              {photos.map(photo => (
                <li key={photo.id} className={styles.addPhotoCard}>
                  <img src={photo.url} alt="" />
                  <div className={styles.addPhotoCardActions}>
                    <select
                      value={photo.category ?? ''}
                      onChange={event => {
                        const value = event.target.value as PhotoCategory | ''
                        setPhotos(prev =>
                          prev.map(item =>
                            item.id === photo.id
                              ? { ...item, category: value || null }
                              : item,
                          ),
                        )
                      }}
                    >
                      <option value="">카테고리 (선택)</option>
                      {CATEGORIES.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={styles.photoDelete}
                      onClick={() =>
                        setPhotos(prev =>
                          prev.filter(item => item.id !== photo.id),
                        )
                      }
                    >
                      목록에서 제거
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={cn(styles.primary, styles.full)}
          disabled={submitting || photos.length === 0}
          onClick={() => void submit()}
        >
          {submitting ? '추가 중…' : `${photos.length}장 추가하기`}
        </button>
      </div>
    </section>
  )
}
