import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { COUNSELOR_IMG } from '@/pages/home/CounselorAvatar'
import { loadAccessToken } from '@/lib/authStorage'
import { getChatRooms } from '@/service/chat'
import {
  applicationErrorMessage,
  getReceivedApplications,
  getRoom,
  getSentApplications,
  respondToApplication,
  type ReceivedApplication,
  type SentApplication,
} from '@/service/room'
import styles from './flow.module.css'

type ApplyRole = 'host' | 'applicant'

type LoadedApply = {
  role: ApplyRole
  application: ReceivedApplication | SentApplication
}

function roomPlace(district: string, station: string) {
  const parts = [district, station].filter(Boolean)
  return parts.join(' · ') || '살짝 공고'
}

export function MatchPage() {
  const navigate = useNavigate()
  const { applyId = '' } = useParams()
  const [loaded, setLoaded] = useState<LoadedApply | null>(null)
  const [address, setAddress] = useState<{ road: string; detail: string } | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [responding, setResponding] = useState<'accepted' | 'rejected' | null>(
    null,
  )

  useEffect(() => {
    if (!loadAccessToken()) {
      navigate('/login', { state: { from: `/roommate/match/${applyId}` } })
      return
    }
    if (!applyId) {
      setError('신청 정보를 찾지 못했어요.')
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError('')

    void Promise.all([getReceivedApplications(), getSentApplications()])
      .then(([receivedRes, sentRes]) => {
        if (!active) return
        const asHost =
          receivedRes.applications?.find((item) => item.id === applyId) ?? null
        const asApplicant =
          sentRes.applications?.find((item) => item.id === applyId) ?? null
        if (asHost) {
          setLoaded({ role: 'host', application: asHost })
          return
        }
        if (asApplicant) {
          setLoaded({ role: 'applicant', application: asApplicant })
          return
        }
        setError('신청 내역을 찾을 수 없어요.')
      })
      .catch((err) => {
        if (!active) return
        setError(applicationErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [applyId, navigate])

  useEffect(() => {
    if (!loaded || loaded.application.status !== 'accepted') {
      setAddress(null)
      return
    }
    let active = true
    void getRoom(loaded.application.room_id)
      .then((room) => {
        if (!active) return
        if (room.locked) {
          setAddress(null)
          return
        }
        const road = room.road_address?.trim() ?? ''
        const detail = room.detail_address?.trim() ?? ''
        if (road || detail) {
          setAddress({ road, detail })
        } else {
          setAddress(null)
        }
      })
      .catch(() => {
        if (active) setAddress(null)
      })
    return () => {
      active = false
    }
  }, [loaded])

  const respond = (status: 'accepted' | 'rejected') => {
    if (!applyId || loaded?.role !== 'host') return
    setResponding(status)
    setError('')
    void respondToApplication(applyId, { status })
      .then((res) => {
        setLoaded((prev) =>
          prev
            ? {
                ...prev,
                application: { ...prev.application, status: res.status },
              }
            : prev,
        )
        if (status === 'rejected') {
          navigate(`/roommate/chats`)
        }
      })
      .catch((err) => setError(applicationErrorMessage(err)))
      .finally(() => setResponding(null))
  }

  if (!applyId) {
    return (
      <section className={styles.page}>
        <p className={styles.sub}>매칭 정보가 없어요.</p>
      </section>
    )
  }

  if (loading) {
    return (
      <section className={styles.wizard}>
        <p className={styles.sub}>불러오는 중이에요.</p>
      </section>
    )
  }

  if (error && !loaded) {
    return (
      <section className={styles.page}>
        <p className={styles.sub}>{error}</p>
        <div className={styles.footerBar}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => navigate('/roommate/applications')}
          >
            신청 목록
          </button>
        </div>
      </section>
    )
  }

  if (!loaded) return null

  const { application, role } = loaded
  const place = roomPlace(
    application.room_district,
    application.room_subway_stn,
  )
  const partnerName =
    role === 'host' && 'applicant_nick' in application
      ? application.applicant_nick
      : '호스트'

  if (application.status === 'accepted') {
    return (
      <section className={styles.wizard}>
        <div className={styles.done}>
          <img src={COUNSELOR_IMG.wink} alt="" />
          <h2>매칭이 완료되었어요!</h2>
          <p>
            {role === 'host'
              ? `${partnerName}님과 함께 살기로 했어요.`
              : `${place} 공고와 매칭됐어요.`}
            <br />
            상세 주소는 이제 서로 확인할 수 있어요.
          </p>
          {address ? (
            <p>
              {address.road}
              {address.detail ? ` ${address.detail}` : ''}
            </p>
          ) : (
            <p className={styles.sub}>
              상세 주소는 공고 상세 또는 채팅에서 확인해 주세요.
            </p>
          )}
        </div>
        <div className={styles.footerBar}>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => navigate(`/explore/listing/${application.room_id}`)}
          >
            공고 보기
          </button>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              void getChatRooms()
                .then((res) => {
                  const room =
                    res.rooms.find(
                      (row) =>
                        row.room_id === application.room_id &&
                        row.apply_id === application.id,
                    ) ??
                    res.rooms.find((row) => row.room_id === application.room_id)
                  if (room) {
                    navigate(`/roommate/chat/${room.chat_room_id}`)
                  } else {
                    navigate('/roommate/chats')
                  }
                })
                .catch(() => navigate('/roommate/chats'))
            }}
          >
            채팅 열기
          </button>
        </div>
      </section>
    )
  }

  if (application.status === 'rejected') {
    return (
      <section className={styles.wizard}>
        <div className={styles.done}>
          <img src={COUNSELOR_IMG.greeting} alt="" />
          <h2>함께하지 못하게 됐어요</h2>
          <p>
            {role === 'host'
              ? '이번 신청은 거절되었어요.'
              : '이번 공고와는 매칭되지 않았어요.'}
          </p>
        </div>
        <div className={styles.footerBar}>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => navigate('/explore')}
          >
            다른 공고 보기
          </button>
          <button
            type="button"
            className={styles.primary}
            onClick={() => navigate('/roommate/applications')}
          >
            신청 목록
          </button>
        </div>
      </section>
    )
  }

  if (role === 'applicant') {
    return (
      <section className={styles.wizard}>
        <div className={styles.done}>
          <img src={COUNSELOR_IMG.greeting} alt="" />
          <h2>답변을 기다리는 중이에요</h2>
          <p>
            {place} 공고에 함께 살기를 요청했어요.
            <br />
            호스트가 수락하면 알려드릴게요.
          </p>
          {application.message ? (
            <p className={styles.sub}>「{application.message}」</p>
          ) : null}
        </div>
        <div className={styles.footerBar}>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => navigate('/roommate/applications')}
          >
            신청 목록
          </button>
          <button
            type="button"
            className={styles.primary}
            onClick={() => navigate('/roommate/chats')}
          >
            채팅 목록
          </button>
        </div>
      </section>
    )
  }

  const received = application as ReceivedApplication

  return (
    <section className={styles.wizard}>
      <div className={styles.done}>
        <img src={COUNSELOR_IMG.greeting} alt="" />
        <h2>{received.applicant_nick}님과 함께 살까요?</h2>
        <p>{place}</p>
        {received.message ? (
          <p className={styles.sub}>「{received.message}」</p>
        ) : null}
        <p className={styles.sub}>수락하기 전까지는 정확한 주소를 보여주지 않아요.</p>
      </div>
      {error ? <p className={styles.sub}>{error}</p> : null}
      <div className={styles.footerBar}>
        <button
          type="button"
          className={styles.ghost}
          disabled={responding !== null}
          onClick={() => respond('rejected')}
        >
          {responding === 'rejected' ? '처리 중…' : '거절하기'}
        </button>
        <button
          type="button"
          className={styles.primary}
          disabled={responding !== null}
          onClick={() => respond('accepted')}
        >
          {responding === 'accepted' ? '처리 중…' : '수락하기'}
        </button>
      </div>
    </section>
  )
}
