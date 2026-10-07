import { useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { areaLabel, monthlyBurden } from './toDetail'
import { useRoommate } from './store'
import styles from './flow.module.css'

export function ChatPage() {
  const navigate = useNavigate()
  const { threadId = '' } = useParams()
  const { threads, listings, sendMessage, requestMatch } = useRoommate()
  const thread = threads.find((item) => item.id === threadId)
  const listing = listings.find((item) => item.id === thread?.listingId)
  const [text, setText] = useState('')

  if (!thread || !listing) {
    return (
      <section className={styles.page}>
        <p className={styles.sub}>대화를 찾지 못했어요.</p>
      </section>
    )
  }

  const cost = monthlyBurden(listing)
  const cover = listing.photos.find((photo) => photo.cover) ?? listing.photos[0]
  const canRequest = thread.status === 'CHATTING'

  return (
    <section className={styles.chat}>
      <header className={styles.wizardTop}>
        <button type="button" className={styles.iconBtn} aria-label="뒤로" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <p className={styles.stepNo}>{listing.host.nickname}</p>
        <span />
      </header>
      <button
        type="button"
        className={styles.listingChip}
        onClick={() => navigate(`/explore/listing/${listing.id}`)}
      >
        {cover ? <img src={cover.url} alt="" /> : null}
        <span>
          <p>{areaLabel(listing)}</p>
          <p>{cost == null ? '비용은 대화로 조율' : `한 달에 약 ${cost}만원`}</p>
        </span>
      </button>
      <div className={styles.thread}>
        <p className={styles.sub}>이 공고에 대해 문의하고 있어요.</p>
        {thread.messages.map((message) => (
          <p
            key={message.id}
            className={`${styles.bubble} ${message.from === 'me' ? styles.mine : styles.theirs}`}
          >
            {message.text}
          </p>
        ))}
        {thread.status === 'MATCH_REQUESTED' ? (
          <p className={styles.sub}>{listing.host.nickname}님에게 함께 살기를 요청했어요.</p>
        ) : null}
        {canRequest ? (
          <button type="button" className={styles.primary} onClick={() => requestMatch(thread.id)}>
            함께 살기로 요청
          </button>
        ) : null}
        {thread.status === 'MATCH_REQUESTED' ? (
          <button
            type="button"
            className={styles.primary}
            onClick={() => navigate(`/roommate/match/${thread.id}`)}
          >
            요청 확인하기
          </button>
        ) : null}
      </div>
      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault()
          const value = text.trim()
          if (!value) return
          sendMessage(thread.id, value)
          setText('')
        }}
      >
        <input
          value={text}
          placeholder="메시지를 입력하세요"
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit" className={styles.iconBtn} aria-label="보내기">
          <Send size={18} />
        </button>
      </form>
    </section>
  )
}
