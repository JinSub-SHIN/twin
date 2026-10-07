import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { emptyDraft } from './draft'
import { SEED_LISTINGS } from './seed'
import type { ChatMessage, InquiryThread, ListingDraft, RoommateListing } from './types'

const DRAFT_KEY = 'ssj-listing-draft'

function loadDraft(): ListingDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return emptyDraft()
    return { ...emptyDraft(), ...JSON.parse(raw) }
  } catch {
    return emptyDraft()
  }
}

type Store = {
  listings: RoommateListing[]
  threads: InquiryThread[]
  savedIds: string[]
  draft: ListingDraft
  setDraft: (next: ListingDraft) => void
  resetDraft: () => void
  publishDraft: () => RoommateListing
  toggleSave: (id: string) => void
  recordView: (id: string) => void
  rememberListing: (listing: RoommateListing) => void
  openInquiry: (listingId: string) => string
  sendMessage: (threadId: string, text: string) => void
  requestMatch: (threadId: string) => void
  acceptMatch: (threadId: string) => void
  rejectMatch: (threadId: string) => void
}

const RoommateContext = createContext<Store | null>(null)

export function RoommateProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<RoommateListing[]>(SEED_LISTINGS)
  const [threads, setThreads] = useState<InquiryThread[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [draft, setDraftState] = useState<ListingDraft>(loadDraft)

  const api = useMemo<Store>(() => {
    const setDraft = (next: ListingDraft) => {
      setDraftState(next)
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
    }
    return {
      listings,
      threads,
      savedIds,
      draft,
      setDraft,
      resetDraft: () => {
        const next = emptyDraft()
        setDraftState(next)
        localStorage.removeItem(DRAFT_KEY)
      },
      publishDraft: () => {
        const listing: RoommateListing = {
          ...draft,
          id: `mine-${Date.now()}`,
          mine: true,
          status: 'PUBLISHED',
          stats: { views: 0, saves: 0, inquiries: 0 },
        }
        setListings((prev) => [listing, ...prev])
        const cleared = emptyDraft()
        setDraftState(cleared)
        localStorage.removeItem(DRAFT_KEY)
        return listing
      },
      toggleSave: (id) => {
        setSavedIds((prev) => {
          const has = prev.includes(id)
          setListings((rows) =>
            rows.map((row) =>
              row.id === id
                ? { ...row, stats: { ...row.stats, saves: row.stats.saves + (has ? -1 : 1) } }
                : row,
            ),
          )
          return has ? prev.filter((item) => item !== id) : [...prev, id]
        })
      },
      recordView: (id) => {
        setListings((rows) =>
          rows.map((row) =>
            row.id === id ? { ...row, stats: { ...row.stats, views: row.stats.views + 1 } } : row,
          ),
        )
      },
      rememberListing: (listing) => {
        setListings((rows) => (rows.some((row) => row.id === listing.id) ? rows : [listing, ...rows]))
      },
      openInquiry: (listingId) => {
        const found = threads.find((thread) => thread.listingId === listingId)
        if (found) return found.id
        const id = `chat-${Date.now()}`
        const thread: InquiryThread = {
          id,
          listingId,
          status: 'OPEN',
          messages: [],
        }
        setThreads((prev) => [...prev, thread])
        setListings((rows) =>
          rows.map((row) =>
            row.id === listingId
              ? {
                  ...row,
                  status: row.status === 'PUBLISHED' ? 'MATCHING' : row.status,
                  stats: { ...row.stats, inquiries: row.stats.inquiries + 1 },
                }
              : row,
          ),
        )
        return id
      },
      sendMessage: (threadId, text) => {
        const message: ChatMessage = {
          id: `m-${Date.now()}`,
          from: 'me',
          text,
          at: new Date().toISOString(),
        }
        setThreads((prev) =>
          prev.map((thread) => {
            if (thread.id !== threadId) return thread
            const next = {
              ...thread,
              status: thread.status === 'OPEN' ? 'CHATTING' : thread.status,
              messages: [...thread.messages, message],
            } as InquiryThread
            const hostSpoke = next.messages.some((item) => item.from === 'host')
            if (!hostSpoke) {
              next.messages = [
                ...next.messages,
                {
                  id: `h-${Date.now()}`,
                  from: 'host',
                  text: '안녕하세요. 관심 주셔서 감사해요. 아직 함께 살 분을 찾고 있어요. 편하게 물어봐 주세요 :)',
                  at: new Date().toISOString(),
                },
              ]
            }
            return next
          }),
        )
      },
      requestMatch: (threadId) => {
        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === threadId ? { ...thread, status: 'MATCH_REQUESTED' } : thread,
          ),
        )
      },
      acceptMatch: (threadId) => {
        setThreads((prev) =>
          prev.map((thread) => {
            if (thread.id !== threadId) return thread
            setListings((rows) =>
              rows.map((row) =>
                row.id === thread.listingId ? { ...row, status: 'MATCHED' } : row,
              ),
            )
            return { ...thread, status: 'MATCHED' }
          }),
        )
      },
      rejectMatch: (threadId) => {
        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === threadId ? { ...thread, status: 'REJECTED' } : thread,
          ),
        )
      },
    }
  }, [listings, threads, savedIds, draft])

  return <RoommateContext.Provider value={api}>{children}</RoommateContext.Provider>
}

export function useRoommate() {
  const store = useContext(RoommateContext)
  if (!store) throw new Error('RoommateProvider가 필요합니다')
  return store
}
