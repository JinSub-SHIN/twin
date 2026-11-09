import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { loadAccessToken } from '@/lib/authStorage'
import { cn } from '@/lib/utils'
import {
  chatErrorMessage,
  clearChatRoomsCache,
  getChatRooms,
  leaveChatRoom,
  type ChatRoomSummary,
} from '@/service/chat'
import activityStyles from '@/pages/mypage/ActivityPage.module.css'
import profileStyles from '@/pages/mypage/ProfilePage.module.css'
import { ChatSwipeRow } from './ChatSwipeRow'
import listStyles from './ChatRoomsPage.module.css'

function roomPlace(room: ChatRoomSummary) {
  const parts = [room.room_district, room.room_subway_stn].filter(Boolean)
  return parts.join(' · ') || '살짝 공고'
}

function partnerInitials(name: string) {
  const text = name.trim()
  return text ? text.slice(0, 2) : '살'
}

function unreadCount(room: ChatRoomSummary) {
  const record = room as ChatRoomSummary & { unread?: number | null }
  const raw = record.unread_count ?? record.unread ?? 0
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0
  return Math.max(0, Math.floor(raw))
}

function unreadLabel(count: number) {
  return count > 99 ? '99+' : String(count)
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
  const [openRowId, setOpenRowId] = useState<string | null>(null)
  const [leavingId, setLeavingId] = useState<string | null>(null)
  const [leaveConfirmId, setLeaveConfirmId] = useState<string | null>(null)

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

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== 'visible') return
      void getChatRooms({ force: true })
        .then((res) => setRooms(res.rooms ?? []))
        .catch(() => {
          /* 목록 갱신 실패는 무시 */
        })
    }
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [])

  useEffect(() => {
    if (!openRowId) return
    const close = (event: Event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest(`[data-chat-row="${openRowId}"]`)) return
      setOpenRowId(null)
    }
    document.addEventListener('touchstart', close, { passive: true })
    document.addEventListener('click', close)
    return () => {
      document.removeEventListener('touchstart', close)
      document.removeEventListener('click', close)
    }
  }, [openRowId])

  const requestLeave = (chatRoomId: string) => {
    if (leavingId) return
    setLeaveConfirmId(chatRoomId)
    setOpenRowId(null)
  }

  const confirmLeave = () => {
    if (!leaveConfirmId || leavingId) return
    const chatRoomId = leaveConfirmId
    setLeavingId(chatRoomId)
    setError('')
    void leaveChatRoom(chatRoomId)
      .then(() => {
        clearChatRoomsCache()
        setRooms((prev) => prev.filter((room) => room.chat_room_id !== chatRoomId))
        setOpenRowId(null)
        setLeaveConfirmId(null)
      })
      .catch((err) => setError(chatErrorMessage(err)))
      .finally(() => setLeavingId(null))
  }

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
                const unread = unreadCount(room)
                const isOpen = openRowId === room.chat_room_id
                return (
                  <ChatSwipeRow
                    key={room.chat_room_id}
                    rowId={room.chat_room_id}
                    open={isOpen}
                    onOpen={() => setOpenRowId(room.chat_room_id)}
                    onClose={() =>
                      setOpenRowId((prev) =>
                        prev === room.chat_room_id ? null : prev,
                      )
                    }
                    onLeave={() => requestLeave(room.chat_room_id)}
                    leaving={leavingId === room.chat_room_id}
                    className={activityStyles.item}
                  >
                    <Link
                      to={`/roommate/chat/${room.chat_room_id}`}
                      className={activityStyles.itemLink}
                      onClick={(event) => {
                        if (isOpen) {
                          event.preventDefault()
                          setOpenRowId(null)
                        }
                      }}
                    >
                      <div className={activityStyles.itemHead}>
                        <div className={activityStyles.itemMain}>
                          <span className={activityStyles.itemAvatar} aria-hidden>
                            {partnerInitials(room.partner_nick)}
                          </span>
                          <div className={activityStyles.itemCopy}>
                            <p className={activityStyles.itemTitle}>
                              {room.partner_nick}
                            </p>
                            <p className={activityStyles.itemMeta}>
                              {roomPlace(room)}
                            </p>
                          </div>
                        </div>
                        {unread > 0 ? (
                          <span
                            className={listStyles.unreadBadge}
                            aria-label={`읽지 않은 메시지 ${unread}개`}
                          >
                            {unreadLabel(unread)}
                          </span>
                        ) : null}
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
                  </ChatSwipeRow>
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

      <Dialog
        open={leaveConfirmId !== null}
        onOpenChange={(open) => {
          if (!open && !leavingId) setLeaveConfirmId(null)
        }}
      >
        <DialogContent
          className={listStyles.dialogContent}
          showCloseButton={false}
        >
          <div className={listStyles.modalInner}>
            <span className={listStyles.modalIconWrap} aria-hidden>
              <span className={listStyles.modalIcon}>👋</span>
            </span>
            <DialogHeader className={listStyles.modalHeader}>
              <DialogTitle className={listStyles.modalTitle}>
                채팅방을 나가시겠어요?
              </DialogTitle>
              <DialogDescription className={listStyles.modalDesc}>
                목록에서 대화가 사라져요.
                <br />
                상대방과의 채팅방은 그대로 남아 있을 수 있어요.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className={listStyles.dialogFooter}>
              <Button
                type="button"
                size="lg"
                className={listStyles.modalPrimary}
                disabled={Boolean(leavingId)}
                onClick={confirmLeave}
              >
                {leavingId ? '나가는 중…' : '나가기'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className={listStyles.modalSecondary}
                disabled={Boolean(leavingId)}
                onClick={() => setLeaveConfirmId(null)}
              >
                취소
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
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
