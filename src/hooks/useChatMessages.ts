import { useEffect, useRef, useState } from 'react'
import { chatErrorMessage, getChatMessages } from '@/service/chat'
import type { ApiChatMessage } from '@/service/chat'

const POLL_MS = 3000

function mergeById(prev: ApiChatMessage[], incoming: ApiChatMessage[]) {
  if (incoming.length === 0) return prev
  const map = new Map(prev.map((item) => [item.id, item]))
  for (const item of incoming) map.set(item.id, item)
  return [...map.values()].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  )
}

export function useChatMessages(chatRoomId: string | undefined) {
  const [messages, setMessages] = useState<ApiChatMessage[]>([])
  const [loading, setLoading] = useState(Boolean(chatRoomId))
  const [error, setError] = useState('')
  const lastTimeRef = useRef<string | null>(null)
  const generationRef = useRef(0)

  useEffect(() => {
    if (!chatRoomId) return
    const generation = ++generationRef.current
    lastTimeRef.current = null
    setMessages([])
    setLoading(true)
    setError('')

    const poll = async (after?: string | null) => {
      try {
        const { messages: batch } = await getChatMessages(
          chatRoomId,
          after ?? undefined,
        )
        if (generationRef.current !== generation) return
        if (!after) {
          setMessages(batch)
        } else {
          setMessages((prev) => mergeById(prev, batch))
        }
        if (batch.length > 0) {
          lastTimeRef.current = batch[batch.length - 1]!.created_at
        }
        setError('')
      } catch (err) {
        if (generationRef.current !== generation) return
        if (!after) setError(chatErrorMessage(err))
      } finally {
        if (generationRef.current === generation) setLoading(false)
      }
    }

    void poll(null)
    const timer = window.setInterval(() => {
      void poll(lastTimeRef.current)
    }, POLL_MS)

    return () => {
      window.clearInterval(timer)
    }
  }, [chatRoomId])

  const appendMessage = (message: ApiChatMessage) => {
    setMessages((prev) => mergeById(prev, [message]))
    lastTimeRef.current = message.created_at
  }

  return { messages, loading, error, appendMessage, setError }
}
