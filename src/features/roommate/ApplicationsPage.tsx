import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { loadAccessToken } from '@/lib/authStorage'
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
import styles from './flow.module.css'

type Tab = 'received' | 'sent'

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

export function ApplicationsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('received')
  const [received, setReceived] = useState<ReceivedApplication[]>([])
  const [sent, setSent] = useState<SentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async (activeTab: Tab) => {
    setLoading(true)
    setError('')
    try {
      if (activeTab === 'received') {
        const res = await getReceivedApplications()
        setReceived(res.applications ?? [])
      } else {
        const res = await getSentApplications()
        setSent(res.applications ?? [])
      }
    } catch (err) {
      setError(applicationErrorMessage(err))
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
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    if (!loadAccessToken()) {
      navigate('/login', { state: { from: '/roommate/applications' } })
      return
    }
    void load(tab)
  }, [tab, load, navigate])

  const respond = (applyId: string, status: 'accepted' | 'rejected') => {
    setBusyId(applyId)
    setError('')
    void respondToApplication(applyId, { status })
      .then(async () => {
        await load('received')
        if (status === 'accepted') {
          navigate(`/roommate/match/${applyId}`)
        }
      })
      .catch((err) => {
        setError(applicationErrorMessage(err))
      })
      .finally(() => setBusyId(null))
  }

  const openChatForApplication = async (roomId: string, applyId: string) => {
    try {
      const { rooms } = await getChatRooms()
      const found =
        rooms.find(
          (room) =>
            room.room_id === roomId &&
            (room.apply_id === applyId || room.apply_id),
        ) ?? rooms.find((room) => room.room_id === roomId)
      if (found) {
        navigate(`/roommate/chat/${found.chat_room_id}`)
        return
      }
      setError('채팅방을 찾지 못했어요. 채팅 목록에서 확인해 주세요.')
    } catch (err) {
      setError(applicationErrorMessage(err))
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.wizardTop}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label="뒤로"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </button>
        <p className={styles.stepNo}>함께 살기 신청</p>
        <span />
      </header>

      <div className={styles.applyTabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'received'}
          className={tab === 'received' ? styles.applyTabActive : styles.applyTab}
          onClick={() => setTab('received')}
        >
          받은 신청
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'sent'}
          className={tab === 'sent' ? styles.applyTabActive : styles.applyTab}
          onClick={() => setTab('sent')}
        >
          보낸 신청
        </button>
      </div>

      {loading ? (
        <p className={styles.sub}>불러오는 중이에요.</p>
      ) : error ? (
        <p className={styles.sub}>{error}</p>
      ) : null}

      {tab === 'received' && !loading ? (
        received.length === 0 ? (
          <p className={styles.sub}>받은 신청이 없어요.</p>
        ) : (
          <ul className={styles.applicationList}>
            {received.map((item) => {
              const gender = GENDER_LABEL[item.applicant_gender] ?? item.applicant_gender
              const busy = busyId === item.id
              return (
                <li key={item.id} className={styles.applicationCard}>
                  <p className={styles.applicationStatus}>
                    {STATUS_LABEL[item.status]}
                  </p>
                  <strong>{item.applicant_nick}</strong>
                  <span className={styles.sub}>
                    {gender} · {item.applicant_age}세
                  </span>
                  <span>{roomPlace(item.room_district, item.room_subway_stn)}</span>
                  {item.message ? (
                    <p className={styles.applicationMessage}>{item.message}</p>
                  ) : null}
                  <span className={styles.sub}>{formatWhen(item.created_at)}</span>
                  {item.status === 'pending' ? (
                    <div className={styles.hostApplyActions}>
                      <button
                        type="button"
                        className={styles.primary}
                        disabled={busy}
                        onClick={() => respond(item.id, 'accepted')}
                      >
                        {busy ? '처리 중…' : '수락'}
                      </button>
                      <button
                        type="button"
                        className={styles.ghost}
                        disabled={busy}
                        onClick={() => respond(item.id, 'rejected')}
                      >
                        거절
                      </button>
                      <Link
                        to={`/roommate/match/${item.id}`}
                        className={styles.linkBtn}
                      >
                        상세 확인
                      </Link>
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => void openChatForApplication(item.room_id, item.id)}
                      >
                        채팅 보기
                      </button>
                    </div>
                  ) : (
                    <div className={styles.hostApplyActions}>
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => void openChatForApplication(item.room_id, item.id)}
                      >
                        채팅 보기
                      </button>
                      <Link
                        to={`/explore/listing/${item.room_id}`}
                        className={styles.linkBtn}
                      >
                        공고 보기
                      </Link>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )
      ) : null}

      {tab === 'sent' && !loading ? (
        sent.length === 0 ? (
          <p className={styles.sub}>보낸 신청이 없어요.</p>
        ) : (
          <ul className={styles.applicationList}>
            {sent.map((item) => (
              <li key={item.id} className={styles.applicationCard}>
                <p className={styles.applicationStatus}>
                  {STATUS_LABEL[item.status]}
                </p>
                <span>{roomPlace(item.room_district, item.room_subway_stn)}</span>
                {item.message ? (
                  <p className={styles.applicationMessage}>{item.message}</p>
                ) : null}
                <span className={styles.sub}>{formatWhen(item.created_at)}</span>
                <SentApplicationActions item={item} />
              </li>
            ))}
          </ul>
        )
      ) : null}
    </section>
  )
}

function SentApplicationActions({ item }: { item: SentApplication }) {
  const navigate = useNavigate()
  return (
    <div className={styles.hostApplyActions}>
      <Link to={`/explore/listing/${item.room_id}`} className={styles.linkBtn}>
        공고 보기
      </Link>
      {item.status === 'pending' ? (
        <Link to={`/roommate/match/${item.id}`} className={styles.linkBtn}>
          진행 상황
        </Link>
      ) : null}
      {item.status === 'accepted' ? (
        <>
          <Link to={`/roommate/match/${item.id}`} className={styles.linkBtn}>
            매칭 확인
          </Link>
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => {
              void getChatRooms()
                .then((res) => {
                  const room =
                    res.rooms.find(
                      (row) =>
                        row.room_id === item.room_id && row.apply_id === item.id,
                    ) ??
                    res.rooms.find((row) => row.room_id === item.room_id)
                  if (room) {
                    navigate(`/roommate/chat/${room.chat_room_id}`)
                  }
                })
                .catch(() => {
                  navigate('/roommate/chats')
                })
            }}
          >
            채팅 열기
          </button>
        </>
      ) : null}
    </div>
  )
}
