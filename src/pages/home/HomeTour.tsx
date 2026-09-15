import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";
import { COUNSELOR_IMG } from "./CounselorAvatar";
import styles from "./HomeTour.module.css";

const STEPS = [
  {
    id: "hero",
    kicker: "살짝 소개",
    title: "월세를 살짝 나눠요",
    desc: "혼자 살기 부담될 때, 같이 살 사람을 찾는 공간이에요.",
  },
  {
    id: "howto",
    kicker: "이용방법",
    title: "여기서 시작해요",
    desc: "방이 있으면 ‘나눠요’, 없으면 ‘구해요’. 세 단계만 따라가면 돼요.",
  },
  {
    id: "counselor",
    kicker: "AI 상담사",
    title: "궁금하면 살짝에게",
    desc: "월세 분담부터 공고까지, 살짝이 바로 알려줘요.",
  },
] as const;

type Hole = {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
};

function readHole(id: string): Hole | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${id}"]`);
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const pad = 10;

  return {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
    radius: 24,
  };
}

export function HomeTour() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [hole, setHole] = useState<Hole | null>(null);
  const [placement, setPlacement] = useState<"below" | "above">("below");
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardTop, setCardTop] = useState(0);

  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), 360);
    return () => window.clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    const target = document.querySelector<HTMLElement>(`[data-tour="${step.id}"]`);
    target?.scrollIntoView({ block: "center", inline: "nearest" });

    const update = () => {
      const next = readHole(step.id);
      if (next) setHole(next);
    };

    update();
    const delayed = window.setTimeout(update, 280);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.clearTimeout(delayed);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, step.id]);

  useLayoutEffect(() => {
    if (!open || !hole) return;

    const cardH = cardRef.current?.offsetHeight ?? 168;
    const gap = 18;
    const below = hole.top + hole.height + gap;
    const canBelow = below + cardH < window.innerHeight - 16;

    setPlacement(canBelow ? "below" : "above");
    setCardTop(canBelow ? below : Math.max(16, hole.top - gap - cardH));
  }, [open, hole, index]);

  if (!open || !hole) return null;

  const shell = document.querySelector<HTMLElement>("[data-app-shell]");
  const shellRect = shell?.getBoundingClientRect();
  const cardLeft = (shellRect?.left ?? 16) + 18;
  const cardWidth = Math.min(328, (shellRect?.width ?? 360) - 36);
  const caretLeft = Math.min(
    Math.max(28, hole.left + hole.width / 2 - cardLeft - 7),
    cardWidth - 36,
  );

  return createPortal(
    <div className={styles.root} role="dialog" aria-labelledby="home-tour-title">
      <div
        className={styles.hole}
        style={{
          top: hole.top,
          left: hole.left,
          width: hole.width,
          height: hole.height,
          borderRadius: hole.radius,
        }}
      />
      <div
        ref={cardRef}
        key={step.id}
        className={placement === "above" ? styles.cardAbove : styles.card}
        style={{ top: cardTop, left: cardLeft, width: cardWidth }}
      >
        <span className={styles.caret} style={{ left: caretLeft }} />
        <div className={styles.head}>
          <span className={styles.brand}>
            <img src={COUNSELOR_IMG.idle} alt="" />
            살짝 가이드
          </span>
          <span className={styles.stepNo}>
            {String(index + 1).padStart(2, "0")}
            <em>/{String(STEPS.length).padStart(2, "0")}</em>
          </span>
          <button
            type="button"
            className={styles.close}
            aria-label="닫기"
            onClick={() => setOpen(false)}
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>
        <p className={styles.kicker}>{step.kicker}</p>
        <h2 id="home-tour-title" className={styles.title}>
          {step.title}
        </h2>
        <p className={styles.desc}>{step.desc}</p>
        <div className={styles.progress} aria-hidden>
          {STEPS.map((item, i) => (
            <span
              key={item.id}
              className={i <= index ? styles.barOn : styles.bar}
            />
          ))}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.skip}
            onClick={() => setOpen(false)}
          >
            건너뛰기
          </button>
          <button
            type="button"
            className={styles.next}
            onClick={() => {
              if (last) {
                setOpen(false);
                return;
              }
              setIndex((prev) => prev + 1);
            }}
          >
            {last ? "시작하기" : "다음"}
            <ArrowRight size={15} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
