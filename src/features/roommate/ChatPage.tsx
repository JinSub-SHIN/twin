import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useChatMessages } from '@/hooks/useChatMessages'
import { resolveStorageUserId } from '@/lib/authUserId'
import { loadAccessToken } from '@/lib/authStorage'
import {
  chatErrorMessage,
  clearChatRoomsCache,
  getChatRooms,
  sendChatMessage,
  type ChatRoomSummary,
} from '@/service/chat'
import {
  applicationErrorMessage,
  applyErrorMessage,
  applyRoom,
  cancelApplication,
  getRoom,
  respondToApplication,
} from '@/service/room'
import { ApiError } from '@/service/http'
import styles from './flow.module.css'

function roomPlace(room: ChatRoomSummary) {
  const parts = [room.room_district, room.room_subway_stn].filter(Boolean)
  return parts.join(' · ') || '살짝 공고'
}

export function ChatPage() {
  const navigate = useNavigate()
  const { threadId: chatRoomId = '' } = useParams()
  const { messages, loading, error, appendMessage, setError } =
    useChatMessages(chatRoomId)
  const [room, setRoom] = useState<ChatRoomSummary | null>(null)
  const [roomLoading, setRoomLoading] = useState(true)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [applying, setApplying] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [responding, setResponding] = useState<'accepted' | 'rejected' | null>(
    null,
  )
  const myId = resolveStorageUserId()
  const inputRef = useRef<HTMLInputElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loadAccessToken()) {
      navigate('/login', {
        state: { from: `/roommate/chat/${chatRoomId}` },
      })
    }
  }, [chatRoomId, navigate])

  useEffect(() => {
    if (!chatRoomId || roomLoading) return
    const timer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [chatRoomId, roomLoading])

  useEffect(() => {
    const el = threadRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, loading])

  useEffect(() => {
    if (!chatRoomId) return
    let active = true
    setRoomLoading(true)
    void getChatRooms()
      .then((res) => {
        if (!active) return
        const found =
          res.rooms.find((item) => item.chat_room_id === chatRoomId) ?? null
        setRoom(found)
        setError('')
      })
      .catch((err) => {
        if (!active) return
        setError(chatErrorMessage(err))
      })
      .finally(() => {
        if (active) setRoomLoading(false)
      })
    return () => {
      active = false
    }
  }, [chatRoomId, setError])

  useEffect(() => {
    if (!chatRoomId || room?.apply_status !== 'pending') return
    let active = true
    const timer = window.setInterval(() => {
      void getChatRooms({ force: true })
        .then((res) => {
          if (!active) return
          const found =
            res.rooms.find((item) => item.chat_room_id === chatRoomId) ?? null
          if (found) setRoom(found)
        })
        .catch(() => {
          /* 신청 상태 동기화 */
        })
    }, 10_000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [chatRoomId, room?.apply_status])

  useEffect(() => {
    if (!room?.room_id) return
    let active = true
    void getRoom(room.room_id)
      .then((detail) => {
        if (!active) return
        const cover = detail.cover_photo?.trim()
        if (cover) setCoverUrl(cover)
      })
      .catch(() => {
        /* 카드 썸네일만 생략 */
      })
    return () => {
      active = false
    }
  }, [room?.room_id])

  const partnerName = room?.partner_nick ?? '상대방'
  const isApplicant = room && !room.is_owner
  const applyPending =
    isApplicant &&
    room.apply_status === 'pending' &&
    Boolean(room.apply_id)
  const canRequestMatch =
    isApplicant &&
    !applyPending &&
    room.apply_status !== 'accepted' &&
    !room.apply_id
  const applyAccepted = isApplicant && room.apply_status === 'accepted'
  const showHostApplyActions =
    room?.is_owner && room.apply_status === 'pending' && Boolean(room.apply_id)

  if (!chatRoomId) {
    return (
      <section className={styles.page}>
        <p className={styles.sub}>대화를 찾지 못했어요.</p>
      </section>
    )
  }

  return (
    <section className={styles.chat}>
      <header className={styles.wizardTop}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label="뒤로"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </button>
        <p className={styles.stepNo}>{partnerName}</p>
        <span />
      </header>
      {room ? (
        <button
          type="button"
          className={styles.listingChip}
          onClick={() => navigate(`/explore/listing/${room.room_id}`)}
        >
          {coverUrl ? <img src={coverUrl} alt="" /> : null}
          <span>
            <p>{roomPlace(room)}</p>
            <p className={styles.sub}>
              {room.is_owner ? '내 공고 문의' : '이 공고에 대해 문의하고 있어요'}
            </p>
          </span>
        </button>
      ) : null}

      <div ref={threadRef} className={styles.thread}>
        {roomLoading || loading ? (
          <p className={styles.sub}>메시지를 불러오는 중이에요.</p>
        ) : null}
        {error ? <p className={styles.sub}>{error}</p> : null}
        {messages.map((message) =>
          message.type === 'system' ? (
            <p key={message.id} className={styles.systemLine}>
              {message.content}
            </p>
          ) : (
            <p
              key={message.id}
              className={`${styles.bubble} ${
                myId && message.sender_id === myId
                  ? styles.mine
                  : styles.theirs
              }`}
            >
              {message.content}
            </p>
          ),
        )}

        {canRequestMatch ? (
          <button
            type="button"
            className={styles.primary}
            disabled={applying || !room?.room_id}
            aria-busy={applying}
            onClick={() => {
              if (applying || !room?.room_id) return
              setApplying(true)
              setError('')
              void applyRoom(room.room_id)
                .then((res) => {
                  clearChatRoomsCache()
                  setRoom((prev) =>
                    prev
                      ? {
                          ...prev,
                          apply_id: res.apply_id,
                          apply_status: res.status,
                          chat_room_id: res.chat_room_id,
                        }
                      : prev,
                  )
                  if (res.chat_room_id && res.chat_room_id !== chatRoomId) {
                    navigate(`/roommate/chat/${res.chat_room_id}`, {
                      replace: true,
                    })
                  }
                })
                .catch((err) => {
                  setError(applyErrorMessage(err))
                  if (
                    err instanceof ApiError &&
                    (err.status === 401 ||
                      (err.body &&
                        typeof err.body === 'object' &&
                        ((err.body as { code?: string }).code ===
                          'MISSING_TOKEN' ||
                          (err.body as { code?: string }).code ===
                            'INVALID_TOKEN')))
                  ) {
                    navigate('/login', {
                      state: { from: `/roommate/chat/${chatRoomId}` },
                    })
                    return
                  }
                  if (
                    err instanceof ApiError &&
                    err.body &&
                    typeof err.body === 'object' &&
                    (err.body as { code?: string }).code === 'ALREADY_APPLIED'
                  ) {
                    void getChatRooms({ force: true })
                      .then((list) => {
                        const found =
                          list.rooms.find(
                            (item) => item.chat_room_id === chatRoomId,
                          ) ?? null
                        if (found) setRoom(found)
                      })
                      .catch(() => {
                        /* 상태 갱신 실패는 무시 */
                      })
                  }
                })
                .finally(() => setApplying(false))
            }}
          >
            {applying ? '요청 중…' : '함께 살기로 요청'}
          </button>
        ) : null}

        {applyPending && room?.apply_id ? (
          <button
            type="button"
            className={styles.primaryDanger}
            disabled={canceling}
            aria-busy={canceling}
            onClick={() => {
              if (canceling || !room.apply_id) return
              setCanceling(true)
              setError('')
              void cancelApplication(room.apply_id)
                .then(() => {
                  clearChatRoomsCache()
                  setRoom((prev) =>
                    prev
                      ? {
                          ...prev,
                          apply_id: null,
                          apply_status: null,
                        }
                      : prev,
                  )
                })
                .catch((err) => setError(applicationErrorMessage(err)))
                .finally(() => setCanceling(false))
            }}
          >
            {canceling ? '취소 중…' : '함께 살기로 요청취소'}
          </button>
        ) : null}

        {applyAccepted ? (
          <button type="button" className={styles.primary} disabled>
            함께 살기 매칭됨
          </button>
        ) : null}

        {showHostApplyActions && room?.apply_id ? (
          <div className={styles.hostApplyActions}>
            <button
              type="button"
              className={styles.primary}
              disabled={responding !== null}
              onClick={() => {
                setResponding('accepted')
                setError('')
                void respondToApplication(room.apply_id!, { status: 'accepted' })
                  .then((res) => {
                    setRoom((prev) =>
                      prev
                        ? { ...prev, apply_status: res.status }
                        : prev,
                    )
                    navigate(`/roommate/match/${room.apply_id}`)
                  })
                  .catch((err) => setError(applicationErrorMessage(err)))
                  .finally(() => setResponding(null))
              }}
            >
              {responding === 'accepted' ? '처리 중…' : '수락'}
            </button>
            <button
              type="button"
              className={styles.ghost}
              disabled={responding !== null}
              onClick={() => {
                setResponding('rejected')
                setError('')
                void respondToApplication(room.apply_id!, { status: 'rejected' })
                  .then((res) => {
                    setRoom((prev) =>
                      prev
                        ? { ...prev, apply_status: res.status }
                        : prev,
                    )
                  })
                  .catch((err) => setError(applicationErrorMessage(err)))
                  .finally(() => setResponding(null))
              }}
            >
              {responding === 'rejected' ? '처리 중…' : '거절'}
            </button>
          </div>
        ) : null}
      </div>

      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault()
          const value = text.trim()
          if (!value || sending) return
          setSending(true)
          void sendChatMessage(chatRoomId, { content: value })
            .then((res) => {
              appendMessage(res.message)
              setText('')
              setError('')
            })
            .catch((err) => {
              setError(chatErrorMessage(err))
              if (
                err instanceof ApiError &&
                (err.status === 401 ||
                  (err.body &&
                    typeof err.body === 'object' &&
                    ((err.body as { code?: string }).code === 'MISSING_TOKEN' ||
                      (err.body as { code?: string }).code === 'INVALID_TOKEN')))
              ) {
                navigate('/login', {
                  state: { from: `/roommate/chat/${chatRoomId}` },
                })
              }
            })
            .finally(() => {
              setSending(false)
              requestAnimationFrame(() => {
                inputRef.current?.focus()
              })
            })
        }}
      >
        <input
          ref={inputRef}
          value={text}
          placeholder="메시지를 입력하세요"
          onChange={(event) => setText(event.target.value)}
          autoComplete="off"
          enterKeyHint="send"
        />
        <button
          type="submit"
          className={styles.iconBtn}
          aria-label="보내기"
          disabled={sending}
        >
          <Send size={18} />
        </button>
      </form>
    </section>
  )
}
