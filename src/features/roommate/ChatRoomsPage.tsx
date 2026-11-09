import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { loadAccessToken } from '@/lib/authStorage'
import { chatErrorMessage, getChatRooms, type ChatRoomSummary } from '@/service/chat'
import styles from './flow.module.css'

function roomPlace(room: ChatRoomSummary) {
  const parts = [room.room_district, room.room_subway_stn].filter(Boolean)
  return parts.join(' · ') || '살짝 공고'
}

function applyLabel(status: ChatRoomSummary['apply_status']) {
  if (!status) return null
  if (status === 'pending') return '신청 대기'
  if (status === 'accepted') return '매칭됨'
  return '거절됨'
}

export function ChatRoomsPage() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<ChatRoomSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loadAccessToken()) {
      navigate('/login', { state: { from: '/roommate/chats' } })
      return
    }
    let active = true
    void getChatRooms()
      .then((res) => {
        if (active) setRooms(res.rooms ?? [])
      })
      .catch((err) => {
        if (active) setError(chatErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [navigate])

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
        <p className={styles.stepNo}>채팅</p>
        <span />
      </header>

      {loading ? (
        <p className={styles.sub}>채팅방을 불러오는 중이에요.</p>
      ) : error ? (
        <p className={styles.sub}>{error}</p>
      ) : rooms.length === 0 ? (
        <p className={styles.sub}>아직 열린 채팅방이 없어요.</p>
      ) : (
        <ul className={styles.chatRoomList}>
          {rooms.map((room) => {
            const badge = applyLabel(room.apply_status)
            return (
              <li key={room.chat_room_id}>
                <Link
                  to={`/roommate/chat/${room.chat_room_id}`}
                  className={styles.chatRoomItem}
                >
                  <strong>{room.partner_nick}</strong>
                  <span>{roomPlace(room)}</span>
                  {badge ? <em>{badge}</em> : null}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
