import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { COUNSELOR_IMG, CounselorAvatar, type CounselorMood } from "./CounselorAvatar";
import styles from "./CounselorChat.module.css";

type ChatRole = "salseuk" | "me";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  mood?: CounselorMood;
};

const SUGGESTIONS = [
  "월세는 어떻게 나눠요?",
  "어떤 살짝이 맞을까요?",
  "공고는 어떻게 올려요?",
];

const GREETING: ChatMessage = {
  id: "greet",
  role: "salseuk",
  text: "안녕, 나는 AI 상담사 살짝이야.\n월세 나누거나 같이 살 사람 찾는 거, 편하게 물어봐.",
  mood: "greeting",
};

function nextId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function replyTo(text: string): { text: string; mood: CounselorMood } {
  const t = text.replace(/\s/g, "");

  if (/잘가|바이|ㅂㅂ|고마워|감사|안녕히/.test(t)) {
    return {
      text: "응, 언제든 다시 와.\n살짝이 여기서 기다리고 있을게.",
      mood: "walkaway",
    };
  }
  if (/안녕|하이|헬로|ㅎㅇ/.test(t)) {
    return {
      text: "응, 나 살짝이야. 뭐가 궁금한지 말해 줘.",
      mood: "greeting",
    };
  }
  if (/월세|분담|돈|금액|비용|부담/.test(t)) {
    return {
      text: "월세는 둘이 나눠 내는 게 기본이야.\n공고마다 살짝이 낼 금액이 적혀 있으니, 찾기에서 부담 가능한 금액을 먼저 골라봐.",
      mood: "wink",
    };
  }
  if (/성별|남자|여자|남성|여성/.test(t)) {
    return {
      text: "성별은 본인 선호에 맞춰 골라.\n프로필에 원하는 살짝 성별을 적어 두면, 찾기에서 더 맞는 공고를 볼 수 있어.",
      mood: "wink",
    };
  }
  if (/지역|위치|역|동네|강남|홍대|서울/.test(t)) {
    return {
      text: "살고 싶은 동네나 가까운 역을 말해 주면 좋아.\n찾기 탭에서 지역·역 기준으로 공고를 둘러볼 수 있어.",
      mood: "wink",
    };
  }
  if (/등록|올려|공고|올리는/.test(t)) {
    return {
      text: "방이 있으면 공고를 올리고, 없으면 프로필만 만들어도 돼.\n원하는 살짝 조건부터 적어 봐.",
      mood: "wink",
    };
  }
  if (/매칭|추천|맞는|잘.?맞/.test(t)) {
    return {
      text: "잘 맞는 살짝은 생활 리듬이랑 분담 비율이 비슷할 때 나와.\n프로필을 채워 두면 찾기에서 더 가까운 공고를 추천해 줄게.",
      mood: "wink",
    };
  }

  return {
    text: "그 부분은 같이 천천히 짚어 보자.\n월세 분담, 원하는 동네, 어떤 사람과 살고 싶은지 중 하나만 먼저 말해 줘.",
    mood: "thinking",
  };
}

export function CounselorChat({ fullPage = false }: { fullPage?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const busy = thinking || streaming;

  const typeInto = (id: string, full: string) => {
    setStreaming(true);
    let index = 0;
    const typeNext = () => {
      index += 1;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, text: full.slice(0, index) } : msg,
        ),
      );
      if (index >= full.length) {
        setStreaming(false);
        return;
      }
      const pause = full[index - 1] === "\n";
      timerRef.current = window.setTimeout(typeNext, pause ? 90 : 16);
    };
    typeNext();
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      setThinking(false);
      setMessages([{ ...GREETING, text: "" }]);
      typeInto(GREETING.id, GREETING.text);
    }, 320);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;

    setMessages((prev) => [...prev, { id: nextId(), role: "me", text }]);
    setDraft("");
    setThinking(true);

    timerRef.current = window.setTimeout(() => {
      const reply = replyTo(text);
      const id = nextId();
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        { id, role: "salseuk", text: "", mood: reply.mood },
      ]);
      typeInto(id, reply.text);
    }, 380);
  };

  return (
    <section
      className={fullPage ? styles.wrapFull : styles.wrap}
      aria-label="AI 상담사 살짝 채팅"
    >
      {fullPage ? null : (
        <div className={styles.head}>
          <p className={styles.kicker}>AI 상담사</p>
          <h3 id="counselor-title" className={styles.title}>
            살짝과 채팅하기
          </h3>
        </div>
      )}

      <div className={styles.panel}>
        <div ref={listRef} className={styles.list} role="log" aria-live="polite">
          {messages.length <= 1 ? (
            <div className={styles.mascot} aria-hidden>
              <img
                src={COUNSELOR_IMG[thinking ? "thinking" : "greeting"]}
                alt=""
              />
            </div>
          ) : null}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.role === "me" ? styles.rowMe : styles.rowBot}
            >
              {msg.role === "salseuk" ? (
                <CounselorAvatar
                  className={styles.avatar}
                  mood={msg.mood ?? "idle"}
                />
              ) : null}
              {msg.text ? (
                <p
                  className={
                    msg.role === "me" ? styles.bubbleMe : styles.bubbleBot
                  }
                >
                  {msg.text}
                </p>
              ) : null}
            </div>
          ))}
          {thinking ? (
            <div className={styles.rowBot}>
              <CounselorAvatar className={styles.avatar} mood="thinking" />
              <p className={styles.typing} aria-label="살짝이 입력 중">
                <span />
                <span />
                <span />
              </p>
            </div>
          ) : null}
        </div>

        {messages.length < 3 ? (
          <div className={styles.chips}>
            {SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                className={styles.chip}
                onClick={() => send(item)}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}

        <form
          className={styles.composer}
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <input
            className={styles.input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="살짝에게 물어보세요"
            aria-label="메시지 입력"
            disabled={busy}
          />
          <button
            type="submit"
            className={styles.send}
            disabled={!draft.trim() || busy}
            aria-label="보내기"
          >
            <Send size={16} strokeWidth={2.3} />
          </button>
        </form>
      </div>
    </section>
  );
}
