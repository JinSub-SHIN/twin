import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ListingDetail } from '@/pages/find/listingDetail'
import { PRESET_TAGS } from './draft'
import { useRoommate } from './store'
import { toListingDetail } from './toDetail'
import type {
  Drink,
  HouseType,
  LifeRhythm,
  ListingDraft,
  NoiseLevel,
  Pet,
  PrefAge,
  PrefGender,
  PrefJob,
  SharedArea,
  ShareType,
  Smoking,
  CleanLevel,
} from './types'
import styles from './flow.module.css'

const STEPS = [
  '어떤 공간인가요?',
  '집 사진을 등록해주세요',
  '비용은 얼마인가요?',
  '어떤 환경에서 생활하나요?',
  '어떤 동거인을 찾고 있나요?',
  '위치는 어디인가요?',
  '공고 내용을 확인해주세요',
]

const SHARE: { value: ShareType; label: string }[] = [
  { value: 'private-room', label: '개인 침실' },
  { value: 'shared-room', label: '침실을 함께' },
  { value: 'living', label: '거실' },
  { value: 'other', label: '기타' },
]
const HOUSE: { value: HouseType; label: string }[] = [
  { value: 'studio', label: '원룸' },
  { value: 'two', label: '투룸' },
  { value: 'three', label: '쓰리룸 이상' },
  { value: 'other', label: '기타' },
]
const AREAS: { value: SharedArea; label: string }[] = [
  { value: 'living', label: '거실' },
  { value: 'kitchen', label: '주방' },
  { value: 'bath', label: '화장실' },
  { value: 'balcony', label: '베란다' },
]

function Choice<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className={styles.choices}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.choice} ${value === option.value ? styles.choiceOn : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function CreatePage() {
  const navigate = useNavigate()
  const { draft, setDraft, publishDraft } = useRoommate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  const patch = (next: Partial<ListingDraft>) => setDraft({ ...draft, ...next })

  const validate = () => {
    if (step === 1 && draft.photos.length === 0) return '사진을 한 장 이상 올려 주세요.'
    if (step === 2 && (draft.price.rentMan == null || draft.price.rentMan < 0))
      return '월세를 입력해 주세요.'
    if (step === 5 && (!draft.area.city || !draft.area.district || !draft.area.dong))
      return '시, 구, 동까지 입력해 주세요. 상세 주소는 공고에 보이지 않아요.'
    return ''
  }

  const next = () => {
    const message = validate()
    if (message) {
      setError(message)
      return
    }
    setError('')
    if (step === STEPS.length - 1) {
      const listing = publishDraft()
      navigate('/roommate/done', { state: { id: listing.id } })
      return
    }
    setStep((value) => value + 1)
  }

  const burden = (draft.price.rentMan ?? 0) + (draft.price.maintenanceMan ?? 0)

  return (
    <section className={styles.wizard}>
      <header className={styles.wizardTop}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label="이전"
          onClick={() => (step === 0 ? navigate(-1) : setStep((value) => value - 1))}
        >
          <ArrowLeft size={20} />
        </button>
        <p className={styles.stepNo}>
          {step + 1} / {STEPS.length}
        </p>
        <span />
      </header>
      <div className={styles.progress} aria-hidden>
        <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <div className={styles.wizardBody}>
        <h1 className={styles.title}>{STEPS[step]}</h1>
        {step === 0 ? (
          <>
            <p className={styles.sub}>지금 살고 있는 집에서 함께 쓸 공간이에요.</p>
            <Choice
              options={SHARE}
              value={draft.space.shareType}
              onChange={(shareType) => patch({ space: { ...draft.space, shareType } })}
            />
            <Choice
              options={HOUSE}
              value={draft.space.houseType}
              onChange={(houseType) => patch({ space: { ...draft.space, houseType } })}
            />
            <div className={styles.tags}>
              {AREAS.map((area) => {
                const on = draft.space.sharedAreas.includes(area.value)
                return (
                  <button
                    key={area.value}
                    type="button"
                    className={`${styles.tag} ${on ? styles.tagOn : ''}`}
                    onClick={() =>
                      patch({
                        space: {
                          ...draft.space,
                          sharedAreas: on
                            ? draft.space.sharedAreas.filter((item) => item !== area.value)
                            : [...draft.space.sharedAreas, area.value],
                        },
                      })
                    }
                  >
                    {area.label}
                  </button>
                )
              })}
            </div>
          </>
        ) : null}
        {step === 1 ? <PhotoStep draft={draft} patch={patch} /> : null}
        {step === 2 ? (
          <>
            <NumberField
              label="보증금 (만원)"
              value={draft.price.depositMan}
              onChange={(depositMan) => patch({ price: { ...draft.price, depositMan } })}
            />
            <NumberField
              label="월세 (만원)"
              value={draft.price.rentMan}
              onChange={(rentMan) => patch({ price: { ...draft.price, rentMan } })}
            />
            <NumberField
              label="관리비 (만원)"
              value={draft.price.maintenanceMan}
              onChange={(maintenanceMan) => patch({ price: { ...draft.price, maintenanceMan } })}
            />
            <Choice
              options={[
                { value: 'separate' as const, label: '공과금 별도' },
                { value: 'included' as const, label: '공과금 포함' },
              ]}
              value={draft.price.utilities}
              onChange={(utilities) => patch({ price: { ...draft.price, utilities } })}
            />
            <div className={styles.estimate}>
              <span>한 달에 함께 나누는 비용</span>
              <strong>
                약 {burden}만원{draft.price.utilities === 'separate' ? ' +' : ''}
              </strong>
            </div>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <Choice
              options={[
                { value: 'no' as Smoking, label: '비흡연' },
                { value: 'indoor-no' as Smoking, label: '실내 금연' },
                { value: 'yes' as Smoking, label: '흡연 가능' },
              ]}
              value={draft.living.smoking}
              onChange={(smoking) => patch({ living: { ...draft.living, smoking } })}
            />
            <Choice
              options={[
                { value: 'none' as Drink, label: '음주 안 함' },
                { value: 'sometimes' as Drink, label: '가끔' },
                { value: 'often' as Drink, label: '자주' },
              ]}
              value={draft.living.drink}
              onChange={(drink) => patch({ living: { ...draft.living, drink } })}
            />
            <Choice
              options={[
                { value: 'none' as Pet, label: '반려동물 없음' },
                { value: 'have' as Pet, label: '키우고 있어요' },
                { value: 'ok' as Pet, label: '함께해도 좋아요' },
              ]}
              value={draft.living.pet}
              onChange={(pet) => patch({ living: { ...draft.living, pet } })}
            />
            <Choice
              options={[
                { value: 'morning' as LifeRhythm, label: '아침형' },
                { value: 'evening' as LifeRhythm, label: '저녁형' },
                { value: 'flex' as LifeRhythm, label: '자유로운 편' },
              ]}
              value={draft.living.rhythm}
              onChange={(rhythm) => patch({ living: { ...draft.living, rhythm } })}
            />
            <Choice
              options={[
                { value: 'high' as CleanLevel, label: '청결 매우 중요' },
                { value: 'normal' as CleanLevel, label: '청결 중요' },
                { value: 'easy' as CleanLevel, label: '편한 편' },
              ]}
              value={draft.living.clean}
              onChange={(clean) => patch({ living: { ...draft.living, clean } })}
            />
            <Choice
              options={[
                { value: 'quiet' as NoiseLevel, label: '조용한 생활' },
                { value: 'normal' as NoiseLevel, label: '일반적인 생활' },
                { value: 'ok' as NoiseLevel, label: '소음 어느 정도 괜찮음' },
              ]}
              value={draft.living.noise}
              onChange={(noise) => patch({ living: { ...draft.living, noise } })}
            />
          </>
        ) : null}
        {step === 4 ? (
          <>
            <Choice
              options={[
                { value: 'any' as PrefGender, label: '성별 무관' },
                { value: 'male' as PrefGender, label: '남성' },
                { value: 'female' as PrefGender, label: '여성' },
              ]}
              value={draft.preference.gender}
              onChange={(gender) => patch({ preference: { ...draft.preference, gender } })}
            />
            <Choice
              options={[
                { value: '20s' as PrefAge, label: '20대' },
                { value: '30s' as PrefAge, label: '30대' },
                { value: '40s' as PrefAge, label: '40대 이상' },
              ]}
              value={(draft.preference.age || '20s') as PrefAge}
              onChange={(age) => patch({ preference: { ...draft.preference, age } })}
            />
            <Choice
              options={[
                { value: 'worker' as PrefJob, label: '직장인' },
                { value: 'student' as PrefJob, label: '학생' },
                { value: 'freelance' as PrefJob, label: '프리랜서' },
                { value: 'any' as PrefJob, label: '직업 무관' },
              ]}
              value={(draft.preference.job || 'any') as PrefJob}
              onChange={(job) => patch({ preference: { ...draft.preference, job } })}
            />
            <div className={styles.tags}>
              {PRESET_TAGS.map((tag) => {
                const on = draft.preference.tags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`${styles.tag} ${on ? styles.tagOn : ''}`}
                    onClick={() =>
                      patch({
                        preference: {
                          ...draft.preference,
                          tags: on
                            ? draft.preference.tags.filter((item) => item !== tag)
                            : [...draft.preference.tags, tag],
                        },
                      })
                    }
                  >
                    #{tag.replace(/\s+/g, '')}
                  </button>
                )
              })}
            </div>
          </>
        ) : null}
        {step === 5 ? (
          <>
            <p className={styles.sub}>
              도로명과 상세 주소는 저장만 하고, 공고에는 동 단위만 보여요.
            </p>
            {(
              [
                ['city', '시·도'],
                ['district', '구·군'],
                ['dong', '동'],
                ['roadAddress', '도로명 주소'],
                ['detailAddress', '상세 주소'],
                ['stationName', '가까운 역'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className={styles.field}>
                {label}
                <input
                  value={draft.area[key]}
                  onChange={(event) =>
                    patch({ area: { ...draft.area, [key]: event.target.value } })
                  }
                />
              </label>
            ))}
          </>
        ) : null}
        {step === 6 ? (
          <ListingDetail
            preview
            listing={toListingDetail({
              ...draft,
              id: 'preview',
              mine: true,
              status: 'DRAFT',
              stats: { views: 0, saves: 0, inquiries: 0 },
            })}
            onBack={() => setStep(5)}
          />
        ) : null}
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
      {step === 6 ? null : (
        <div className={styles.footerBar}>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => (step === 0 ? navigate(-1) : setStep((value) => value - 1))}
          >
            이전
          </button>
          <button type="button" className={styles.primary} onClick={next}>
            {step === STEPS.length - 1 ? '등록하기' : '다음'}
          </button>
        </div>
      )}
      {step === 6 ? (
        <div className={styles.footerBar}>
          <button type="button" className={styles.ghost} onClick={() => setStep(5)}>
            이전
          </button>
          <button type="button" className={styles.primary} onClick={next}>
            등록하기
          </button>
        </div>
      ) : null}
    </section>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (value: number | null) => void
}) {
  return (
    <label className={styles.field}>
      {label}
      <input
        inputMode="numeric"
        value={value ?? ''}
        onChange={(event) => {
          const text = event.target.value.trim()
          onChange(text === '' ? null : Number(text.replace(/[^\d]/g, '')))
        }}
      />
    </label>
  )
}

function PhotoStep({
  draft,
  patch,
}: {
  draft: ListingDraft
  patch: (next: Partial<ListingDraft>) => void
}) {
  const add = (files: FileList | null) => {
    if (!files) return
    const photos = [
      ...draft.photos,
      ...[...files].map((file, index) => ({
        id: `${file.name}-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        label: '집 사진',
        cover: draft.photos.length === 0 && index === 0,
      })),
    ]
    patch({ photos })
  }

  return (
    <>
      <p className={styles.sub}>침실, 거실, 주방처럼 생활이 보이는 사진이 좋아요.</p>
      <div className={styles.photoGrid}>
        {draft.photos.map((photo, index) => (
          <div key={photo.id} className={styles.photoCard}>
            <img src={photo.url} alt="" />
            <div className={styles.photoActions}>
              <button
                type="button"
                onClick={() =>
                  patch({
                    photos: draft.photos.map((item) => ({
                      ...item,
                      cover: item.id === photo.id,
                    })),
                  })
                }
              >
                {photo.cover ? '대표' : '대표로'}
              </button>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => {
                  const photos = [...draft.photos]
                  ;[photos[index - 1], photos[index]] = [photos[index], photos[index - 1]]
                  patch({ photos })
                }}
              >
                위로
              </button>
              <button
                type="button"
                onClick={() =>
                  patch({ photos: draft.photos.filter((item) => item.id !== photo.id) })
                }
              >
                삭제
              </button>
            </div>
          </div>
        ))}
        <label className={styles.addPhoto}>
          사진 추가
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => add(event.target.files)}
          />
        </label>
      </div>
    </>
  )
}
