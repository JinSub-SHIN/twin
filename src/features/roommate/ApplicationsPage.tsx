import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { loadAccessToken } from '@/lib/authStorage'
import { cn } from '@/lib/utils'
import { getChatRooms } from '@/service/chat'
import {
  applicationErrorMessage,
  getReceivedApplications,
  getSentApplications,
  respondToApplication,
  type ApplicationStatus,
  type ReceivedApplication,
  type SentApplication,
} from '@/service/room'
import { ApiError } from '@/service/http'
import activityStyles from '@/pages/mypage/ActivityPage.module.css'
import profileStyles from '@/pages/mypage/ProfilePage.module.css'

type Tab = 'received' | 'sent'
type FetchState = 'idle' | 'loading' | 'ready'

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: '대기 중',
  accepted: '수락됨',
  rejected: '거절됨',
}

const GENDER_LABEL: Record<string, string> = {
  male: '남성',
  female: '여성',
  other: '기타',
}

function roomPlace(district: string, station: string) {
  const parts = [district, station].filter(Boolean)
  return parts.join(' · ') || '살짝 공고'
}

function formatWhen(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function initials(name: string) {
  const text = name.trim()
  return text ? text.slice(0, 2) : '살'
}

function statusChipClass(status: ApplicationStatus) {
  if (status === 'pending') return activityStyles.chipAccent
  if (status === 'accepted') return activityStyles.chipPrimary
  return activityStyles.chip
}

export function ApplicationsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('received')
  const [received, setReceived] = useState<ReceivedApplication[]>([])
  const [sent, setSent] = useState<SentApplication[]>([])
  const [receivedState, setReceivedState] = useState<FetchState>('idle')
  const [sentState, setSentState] = useState<FetchState>('idle')
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchReceived = useCallback(
    async (quiet = false) => {
      if (!quiet) setReceivedState('loading')
      try {
        const res = await getReceivedApplications()
        setReceived(res.applications ?? [])
        setReceivedState('ready')
      } catch (err) {
        setError(applicationErrorMessage(err))
        setReceivedState('ready')
        if (
          err instanceof ApiError &&
          (err.status === 401 ||
            (err.body &&
              typeof err.body === 'object' &&
              ((err.body as { code?: string }).code === 'MISSING_TOKEN' ||
                (err.body as { code?: string }).code === 'INVALID_TOKEN')))
        ) {
          navigate('/login', { state: { from: '/roommate/applications' } })
        }
      }
    },
    [navigate],
  )

  const fetchSent = useCallback(
    async (quiet = false) => {
      if (!quiet) setSentState('loading')
      try {
        const res = await getSentApplications()
        setSent(res.applications ?? [])
        setSentState('ready')
      } catch (err) {
        setError(applicationErrorMessage(err))
        setSentState('ready')
        if (
          err instanceof ApiError &&
          (err.status === 401 ||
            (err.body &&
              typeof err.body === 'object' &&
              ((err.body as { code?: string }).code === 'MISSING_TOKEN' ||
                (err.body as { code?: string }).code === 'INVALID_TOKEN')))
        ) {
          navigate('/login', { state: { from: '/roommate/applications' } })
        }
      }
    },
    [navigate],
  )

  useEffect(() => {
    if (!loadAccessToken()) {
      navigate('/login', { state: { from: '/roommate/applications' } })
      return
    }
    setError('')
    void Promise.all([fetchReceived(), fetchSent()])
    // 마운트 시 1회만 — 탭/콜백 변경으로 신청 API가 반복 호출되지 않게 함
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only
  }, [])

  const respond = (applyId: string, status: 'accepted' | 'rejected') => {
    setBusyId(applyId)
    setError('')
    void respondToApplication(applyId, { status })
      .then(async () => {
        await fetchReceived(true)
        if (status === 'accepted') {
          navigate(`/roommate/match/${applyId}`)
        }
      })
      .catch((err) => {
        setError(applicationErrorMessage(err))
      })
      .finally(() => setBusyId(null))
  }

  const openChat = (roomId: string, applyId: string) => {
    void getChatRooms()
      .then((res) => {
        const found =
          res.rooms.find(
            (room) =>
              room.room_id === roomId &&
              (room.apply_id === applyId || room.apply_id),
          ) ?? res.rooms.find((room) => room.room_id === roomId)
        if (found) {
          navigate(`/roommate/chat/${found.chat_room_id}`)
          return
        }
        setError('채팅방을 찾지 못했어요.')
      })
      .catch(() => setError('채팅방을 찾지 못했어요.'))
  }

  const tabState = tab === 'received' ? receivedState : sentState
  const tabLoading = tabState === 'loading' || tabState === 'idle'
  const list = tab === 'received' ? received : sent
  const count = list.length
  const showEmpty = !tabLoading && count === 0 && !error

  return (
    <section
      className={cn(profileStyles.pageLoggedIn, profileStyles.pageActivity)}
    >
      <div className={profileStyles.intro}>
        <p className={profileStyles.eyebrow}>매칭</p>
        <h2 className={profileStyles.title}>
          함께 <span className={profileStyles.accent}>살기</span> 신청
        </h2>
        <p className={profileStyles.desc}>
          받은·보낸 신청을 확인하고 답할 수 있어요.
        </p>
      </div>

      <div className={activityStyles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'received'}
          className={tab === 'received' ? activityStyles.tabOn : activityStyles.tab}
          onClick={() => setTab('received')}
        >
          받은 신청
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'sent'}
          className={tab === 'sent' ? activityStyles.tabOn : activityStyles.tab}
          onClick={() => setTab('sent')}
        >
          보낸 신청
        </button>
      </div>

      <div className={activityStyles.panel}>
        <h3 className={activityStyles.panelTitle}>
          <ClipboardList size={17} strokeWidth={2} aria-hidden />
          {tab === 'received' ? '받은 요청' : '보낸 요청'}
        </h3>
        <p className={activityStyles.panelHint}>
          {tabLoading ? (
            <span
              className={`${activityStyles.skeletonHint} ${activityStyles.skeletonBone}`}
              aria-hidden
            />
          ) : (
            `총 ${count}건`
          )}
        </p>

        <div className={activityStyles.listStage}>
          {error ? (
            <p className={`${activityStyles.emptyPlate} ${activityStyles.mutedError}`}>
              {error}
            </p>
          ) : null}

          {tabLoading && !error ? <CompactListSkeleton /> : null}

          {showEmpty && tab === 'received' ? (
            <p className={activityStyles.emptyPlate}>
              받은 신청이 없어요.
              <br />
              내 공고에 요청이 오면 여기에 보여요.
            </p>
          ) : null}

          {showEmpty && tab === 'sent' ? (
            <p className={activityStyles.emptyPlate}>
              보낸 신청이 없어요.
              <br />
              채팅에서 함께 살기로 요청해 보세요.
            </p>
          ) : null}

          {!tabLoading && tab === 'received' && received.length > 0 ? (
            <ul className={activityStyles.items}>
              {received.map((item) => {
                const busy = busyId === item.id
                const gender =
                  GENDER_LABEL[item.applicant_gender] ?? item.applicant_gender
                return (
                  <li key={item.id} className={activityStyles.item}>
                    <div className={activityStyles.itemMain}>
                      <span className={activityStyles.itemAvatar} aria-hidden>
                        {initials(item.applicant_nick)}
                      </span>
                      <div className={activityStyles.itemCopy}>
                        <p className={activityStyles.itemTitle}>
                          {item.applicant_nick}
                        </p>
                        <p className={activityStyles.itemMeta}>
                          {gender} · {item.applicant_age}세 ·{' '}
                          {roomPlace(item.room_district, item.room_subway_stn)}
                        </p>
                      </div>
                    </div>
                    <ApplicationMeta
                      chipClassName={statusChipClass(item.status)}
                      label={STATUS_LABEL[item.status]}
                      time={formatWhen(item.created_at)}
                      message={item.message}
                    />
                    {item.status === 'pending' ? (
                      <>
                        <div className={activityStyles.actions}>
                          <Button
                            type="button"
                            className={profileStyles.action}
                            disabled={busy}
                            onClick={() => respond(item.id, 'accepted')}
                          >
                            {busy ? '처리 중…' : '수락'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className={profileStyles.loginAction}
                            disabled={busy}
                            onClick={() => respond(item.id, 'rejected')}
                          >
                            거절
                          </Button>
                        </div>
                        <button
                          type="button"
                          className={activityStyles.textLink}
                          onClick={() => openChat(item.room_id, item.id)}
                        >
                          채팅으로 이동
                        </button>
                      </>
                    ) : (
                      <div className={activityStyles.links}>
                        <button
                          type="button"
                          className={activityStyles.textLink}
                          onClick={() => openChat(item.room_id, item.id)}
                        >
                          채팅 보기
                        </button>
                        <Link
                          to={`/explore/listing/${item.room_id}`}
                          className={activityStyles.textLink}
                        >
                          공고 보기
                        </Link>
                        {item.status === 'accepted' ? (
                          <Link
                            to={`/roommate/match/${item.id}`}
                            className={activityStyles.textLink}
                          >
                            매칭 확인
                          </Link>
                        ) : null}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : null}

          {!tabLoading && tab === 'sent' && sent.length > 0 ? (
            <ul className={activityStyles.items}>
              {sent.map((item) => (
                <li key={item.id} className={activityStyles.item}>
                  <p className={activityStyles.itemTitle}>
                    {roomPlace(item.room_district, item.room_subway_stn)}
                  </p>
                  <ApplicationMeta
                    chipClassName={statusChipClass(item.status)}
                    label={STATUS_LABEL[item.status]}
                    time={formatWhen(item.created_at)}
                    message={item.message}
                  />
                  <SentLinks item={item} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className={activityStyles.footerActionSlot}>
        {showEmpty ? (
          <Link
            to={tab === 'sent' ? '/roommate/chats' : '/explore'}
            className={cn(buttonVariants({ size: 'lg' }), profileStyles.action)}
          >
            {tab === 'sent' ? '채팅 목록으로' : '공고 찾아보기'}
          </Link>
        ) : (
          <span className={activityStyles.footerActionPlaceholder} aria-hidden />
        )}
      </div>
    </section>
  )
}

function CompactListSkeleton() {
  const bone = activityStyles.skeletonBone
  return (
    <ul
      className={activityStyles.items}
      aria-busy="true"
      aria-label="불러오는 중"
    >
      <li className={`${activityStyles.item} ${activityStyles.skeletonItem}`}>
        <div className={activityStyles.itemMain}>
          <span
            className={`${activityStyles.skeletonAvatar} ${bone}`}
            aria-hidden
          />
          <div className={activityStyles.itemCopy}>
            <span
              className={`${activityStyles.skeletonLine} ${activityStyles.skeletonLineLg} ${bone}`}
            />
            <span
              className={`${activityStyles.skeletonLine} ${activityStyles.skeletonLineMd} ${bone}`}
            />
          </div>
        </div>
        <div className={activityStyles.skeletonChipRow}>
          <span className={`${activityStyles.skeletonChip} ${bone}`} />
          <span className={`${activityStyles.skeletonChip} ${bone}`} />
        </div>
      </li>
    </ul>
  )
}

function ApplicationMeta({
  chipClassName,
  label,
  time,
  message,
}: {
  chipClassName: string
  label: string
  time: string
  message: string | null
}) {
  return (
    <>
      <div className={activityStyles.chips}>
        <span className={chipClassName}>{label}</span>
        <span className={activityStyles.chip}>{time}</span>
      </div>
      {message ? <p className={activityStyles.quote}>{message}</p> : null}
    </>
  )
}

function SentLinks({ item }: { item: SentApplication }) {
  return (
    <div className={activityStyles.links}>
      <Link
        to={`/explore/listing/${item.room_id}`}
        className={activityStyles.textLink}
      >
        공고 보기
      </Link>
      {item.status === 'accepted' ? (
        <Link
          to={`/roommate/match/${item.id}`}
          className={activityStyles.textLink}
        >
          매칭 확인
        </Link>
      ) : null}
      {item.status === 'pending' ? (
        <Link to="/roommate/chats" className={activityStyles.textLink}>
          채팅 목록
        </Link>
      ) : null}
    </div>
  )
}
