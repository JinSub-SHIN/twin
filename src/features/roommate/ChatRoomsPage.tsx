import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, MessageCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { loadAccessToken } from '@/lib/authStorage'
import { cn } from '@/lib/utils'
import { chatErrorMessage, getChatRooms, type ChatRoomSummary } from '@/service/chat'
import activityStyles from '@/pages/mypage/ActivityPage.module.css'
import profileStyles from '@/pages/mypage/ProfilePage.module.css'

function roomPlace(room: ChatRoomSummary) {
  const parts = [room.room_district, room.room_subway_stn].filter(Boolean)
  return parts.join(' · ') || '살짝 공고'
}

function partnerInitials(name: string) {
  const text = name.trim()
  return text ? text.slice(0, 2) : '살'
}

function statusChip(status: ChatRoomSummary['apply_status']) {
  if (status === 'pending') return { label: '신청 대기', className: activityStyles.chipAccent }
  if (status === 'accepted') return { label: '매칭됨', className: activityStyles.chipPrimary }
  if (status === 'rejected') return { label: '거절됨', className: activityStyles.chip }
  return null
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

  const showEmpty = !loading && !error && rooms.length === 0

  return (
    <section
      className={cn(profileStyles.pageLoggedIn, profileStyles.pageActivity)}
    >
      <div className={profileStyles.intro}>
        <p className={profileStyles.eyebrow}>대화</p>
        <h2 className={profileStyles.title}>
          <span className={profileStyles.accent}>채팅</span> 목록
        </h2>
        <p className={profileStyles.desc}>
          문의하고 있는 공고와 대화를 이어가요.
          <br />
          함께 살기 신청 상태도 함께 확인할 수 있어요.
        </p>
      </div>

      <div className={activityStyles.panel}>
        <h3 className={activityStyles.panelTitle}>
          <MessageCircle size={17} strokeWidth={2} aria-hidden />
          열린 대화
        </h3>
        <p className={activityStyles.panelHint}>
          {loading ? (
            <span
              className={`${activityStyles.skeletonHint} ${activityStyles.skeletonBone}`}
              aria-hidden
            />
          ) : (
            `총 ${rooms.length}개의 채팅방이 있어요.`
          )}
        </p>

        <div className={activityStyles.listStage}>
          {error ? (
            <p className={`${activityStyles.emptyPlate} ${activityStyles.mutedError}`}>
              {error}
            </p>
          ) : null}

          {loading && !error ? <ChatListSkeleton /> : null}

          {showEmpty ? (
            <p className={activityStyles.emptyPlate}>
              아직 열린 채팅이 없어요.
              <br />
              공고에서 문의하기를 눌러 보세요.
            </p>
          ) : null}

          {!loading && rooms.length > 0 ? (
            <ul className={activityStyles.items}>
              {rooms.map((room) => {
                const chip = statusChip(room.apply_status)
                return (
                  <li key={room.chat_room_id} className={activityStyles.item}>
                    <Link
                      to={`/roommate/chat/${room.chat_room_id}`}
                      className={activityStyles.itemLink}
                    >
                      <div className={activityStyles.itemHead}>
                        <div className={activityStyles.itemMain}>
                          <span className={activityStyles.itemAvatar} aria-hidden>
                            {partnerInitials(room.partner_nick)}
                          </span>
                          <div className={activityStyles.itemCopy}>
                            <p className={activityStyles.itemTitle}>{room.partner_nick}</p>
                            <p className={activityStyles.itemMeta}>{roomPlace(room)}</p>
                          </div>
                        </div>
                        <span className={activityStyles.itemGo} aria-hidden>
                          <ChevronRight size={16} strokeWidth={2.4} />
                        </span>
                      </div>
                      <div className={activityStyles.chips}>
                        <span className={activityStyles.chip}>
                          {room.is_owner ? '내 공고 문의' : '문의 중'}
                        </span>
                        {chip ? (
                          <span className={chip.className}>{chip.label}</span>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>
      </div>

      <div className={activityStyles.footerActionSlot}>
        {showEmpty ? (
          <Link
            to="/explore"
            className={cn(buttonVariants({ size: 'lg' }), profileStyles.action)}
          >
            공고 찾아보기
          </Link>
        ) : (
          <span className={activityStyles.footerActionPlaceholder} aria-hidden />
        )}
      </div>
    </section>
  )
}

function ChatListSkeleton() {
  const bone = activityStyles.skeletonBone
  return (
    <ul
      className={activityStyles.items}
      aria-busy="true"
      aria-label="불러오는 중"
    >
      <li className={`${activityStyles.item} ${activityStyles.skeletonItem}`}>
        <div className={activityStyles.itemHead}>
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
        </div>
        <div className={activityStyles.skeletonChipRow}>
          <span className={`${activityStyles.skeletonChip} ${bone}`} />
          <span className={`${activityStyles.skeletonChip} ${bone}`} />
        </div>
      </li>
    </ul>
  )
}
