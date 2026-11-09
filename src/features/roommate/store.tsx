import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { emptyDraft } from "./draft";
import { SEED_LISTINGS } from "./seed";
import type {
  ChatMessage,
  InquiryThread,
  ListingDraft,
  RoommateListing,
} from "./types";

const DRAFT_KEY = "ssj-listing-draft";
const DRAFT_VERSION_KEY = "ssj-listing-draft-v";
const DRAFT_VERSION = "3";

function mergeDraft(saved: Partial<ListingDraft>): ListingDraft {
  const base = emptyDraft();
  return {
    ...base,
    ...saved,
    area: { ...base.area, ...saved.area },
    space: { ...base.space, ...saved.space },
    price: { ...base.price, ...saved.price },
    living: { ...base.living, ...saved.living },
    preference: { ...base.preference, ...saved.preference },
    register: { ...base.register, ...saved.register },
    consent: { ...base.consent, ...saved.consent },
    host: { ...base.host, ...saved.host },
  };
}

function clearDefaultSelections(draft: ListingDraft): ListingDraft {
  return {
    ...draft,
    space: { ...draft.space, sharedAreas: [] },
    price: { ...draft.price, depositMan: null, utilities: "" },
    living: {
      smoking: "",
      drink: "",
      pet: "",
      rhythm: "",
      clean: "",
      noise: "",
    },
    preference: { ...draft.preference, gender: "", age: "" },
  };
}

function loadDraft(): ListingDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) {
      localStorage.setItem(DRAFT_VERSION_KEY, DRAFT_VERSION);
      return emptyDraft();
    }
    const merged = mergeDraft(JSON.parse(raw) as Partial<ListingDraft>);
    if (localStorage.getItem(DRAFT_VERSION_KEY) === DRAFT_VERSION) return merged;
    const next = clearDefaultSelections(merged);
    localStorage.setItem(DRAFT_VERSION_KEY, DRAFT_VERSION);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    return next;
  } catch {
    return emptyDraft();
  }
}

type Store = {
  listings: RoommateListing[];
  threads: InquiryThread[];
  savedIds: string[];
  draft: ListingDraft;
  setDraft: (next: ListingDraft) => void;
  resetDraft: () => void;
  publishDraft: () => RoommateListing;
  toggleSave: (id: string) => void;
  recordView: (id: string) => void;
  rememberListing: (listing: RoommateListing) => void;
  openInquiry: (listingId: string, chatRoomId: string) => string;
  sendMessage: (threadId: string, text: string) => void;
  requestMatch: (threadId: string) => void;
  acceptMatch: (threadId: string) => void;
  rejectMatch: (threadId: string) => void;
};

const RoommateContext = createContext<Store | null>(null);

export function RoommateProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<RoommateListing[]>(SEED_LISTINGS);
  const [threads, setThreads] = useState<InquiryThread[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [draft, setDraftState] = useState<ListingDraft>(loadDraft);

  const api = useMemo<Store>(() => {
    const setDraft = (next: ListingDraft) => {
      setDraftState(next);
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        /* 저장 공간이 부족하면 메모리 상태만 유지 */
      }
    };
    return {
      listings,
      threads,
      savedIds,
      draft,
      setDraft,
      resetDraft: () => {
        const next = emptyDraft();
        setDraftState(next);
        localStorage.removeItem(DRAFT_KEY);
        localStorage.setItem(DRAFT_VERSION_KEY, DRAFT_VERSION);
      },
      publishDraft: () => {
        const listing: RoommateListing = {
          ...draft,
          space: { ...draft.space, houseType: draft.space.houseType || "two" },
          price: {
            ...draft.price,
            depositMan: null,
            utilities: draft.price.utilities || "separate",
          },
          living: {
            smoking: draft.living.smoking || "no",
            drink: draft.living.drink || "sometimes",
            pet: draft.living.pet || "none",
            rhythm: draft.living.rhythm || "flex",
            clean: draft.living.clean || "normal",
            noise: draft.living.noise || "quiet",
          },
          preference: {
            ...draft.preference,
            gender: draft.preference.gender || "any",
            age:
              draft.preference.age === "any" || draft.preference.age === ""
                ? ""
                : draft.preference.age,
          },
          id: `mine-${Date.now()}`,
          mine: true,
          status: "PUBLISHED",
          stats: { views: 0, saves: 0, inquiries: 0 },
        };
        setListings((prev) => [listing, ...prev]);
        const cleared = emptyDraft();
        setDraftState(cleared);
        localStorage.removeItem(DRAFT_KEY);
        return listing;
      },
      toggleSave: (id) => {
        setSavedIds((prev) => {
          const has = prev.includes(id);
          setListings((rows) =>
            rows.map((row) =>
              row.id === id
                ? {
                    ...row,
                    stats: {
                      ...row.stats,
                      saves: row.stats.saves + (has ? -1 : 1),
                    },
                  }
                : row,
            ),
          );
          return has ? prev.filter((item) => item !== id) : [...prev, id];
        });
      },
      recordView: (id) => {
        setListings((rows) =>
          rows.map((row) =>
            row.id === id
              ? { ...row, stats: { ...row.stats, views: row.stats.views + 1 } }
              : row,
          ),
        );
      },
      rememberListing: (listing) => {
        setListings((rows) =>
          rows.some((row) => row.id === listing.id) ? rows : [listing, ...rows],
        );
      },
      openInquiry: (listingId, chatRoomId) => {
        const found = threads.find(
          (thread) =>
            thread.id === chatRoomId || thread.listingId === listingId,
        );
        if (found) {
          if (found.id !== chatRoomId) {
            setThreads((prev) =>
              prev.map((thread) =>
                thread.id === found.id ? { ...thread, id: chatRoomId } : thread,
              ),
            );
          }
          return chatRoomId;
        }
        const thread: InquiryThread = {
          id: chatRoomId,
          listingId,
          status: "OPEN",
          messages: [],
        };
        setThreads((prev) => [...prev, thread]);
        setListings((rows) =>
          rows.map((row) =>
            row.id === listingId
              ? {
                  ...row,
                  status: row.status === "PUBLISHED" ? "MATCHING" : row.status,
                  stats: { ...row.stats, inquiries: row.stats.inquiries + 1 },
                }
              : row,
          ),
        );
        return chatRoomId;
      },
      sendMessage: (threadId, text) => {
        const message: ChatMessage = {
          id: `m-${Date.now()}`,
          from: "me",
          text,
          at: new Date().toISOString(),
        };
        setThreads((prev) =>
          prev.map((thread) => {
            if (thread.id !== threadId) return thread;
            const next = {
              ...thread,
              status: thread.status === "OPEN" ? "CHATTING" : thread.status,
              messages: [...thread.messages, message],
            } as InquiryThread;
            const hostSpoke = next.messages.some(
              (item) => item.from === "host",
            );
            if (!hostSpoke) {
              next.messages = [
                ...next.messages,
                {
                  id: `h-${Date.now()}`,
                  from: "host",
                  text: "안녕하세요. 관심 주셔서 감사해요. 아직 함께 살 분을 찾고 있어요. 편하게 물어봐 주세요 :)",
                  at: new Date().toISOString(),
                },
              ];
            }
            return next;
          }),
        );
      },
      requestMatch: (threadId) => {
        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === threadId
              ? { ...thread, status: "MATCH_REQUESTED" }
              : thread,
          ),
        );
      },
      acceptMatch: (threadId) => {
        setThreads((prev) =>
          prev.map((thread) => {
            if (thread.id !== threadId) return thread;
            setListings((rows) =>
              rows.map((row) =>
                row.id === thread.listingId
                  ? { ...row, status: "MATCHED" }
                  : row,
              ),
            );
            return { ...thread, status: "MATCHED" };
          }),
        );
      },
      rejectMatch: (threadId) => {
        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === threadId ? { ...thread, status: "REJECTED" } : thread,
          ),
        );
      },
    };
  }, [listings, threads, savedIds, draft]);

  return (
    <RoommateContext.Provider value={api}>{children}</RoommateContext.Provider>
  );
}

export function useRoommate() {
  const store = useContext(RoommateContext);
  if (!store) throw new Error("RoommateProvider가 필요합니다");
  return store;
}
