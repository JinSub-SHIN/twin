import { useState } from "react";
import styles from "./HowToGuide.module.css";

type Path = "share" | "find";

const PATHS: { id: Path; label: string; hint: string }[] = [
  { id: "share", label: "집을 나눠요", hint: "이미 집이 있을 때" },
  { id: "find", label: "집을 구해요", hint: "같이 살 집을 찾을 때" },
];

const STEPS: Record<Path, { n: string; title: string; desc: string }[]> = {
  share: [
    {
      n: "01",
      title: "거주지와 나눌 비율을 정해요",
      desc: "월세 중 살짝이 낼 비율만 정해 두면 시작이에요.",
    },
    {
      n: "02",
      title: "공고로 보여 줘요",
      desc: "생활 리듬이 맞는 사람이 찾아와요.",
    },
    {
      n: "03",
      title: "살짝과 나눠요",
      desc: "신청을 확인하고, 월세를 살짝 나눠 같이 살아요.",
    },
  ],
  find: [
    {
      n: "01",
      title: "원하는 조건을 적어요",
      desc: "성별, 분담, 살고 싶은 동네만 있어도 충분해요.",
    },
    {
      n: "02",
      title: "공고를 둘러봐요",
      desc: "찾기에서 부담 가능한 월세와 위치를 골라 보세요.",
    },
    {
      n: "03",
      title: "마음에 들면 신청해요",
      desc: "맞는 살짝이면 바로 연결하고, 월세를 나눠요.",
    },
  ],
};

export function HowToGuide() {
  const [path, setPath] = useState<Path>("share");
  const steps = STEPS[path];

  return (
    <section
      className={styles.wrap}
      aria-labelledby="howto-title"
      data-tour="howto"
    >
      <div className={styles.head}>
        <p className={styles.kicker}>이용방법</p>
        <h3 id="howto-title" className={styles.title}>
          살짝은 이렇게 시작해요
        </h3>
      </div>

      <div className={styles.toggle} role="tablist" aria-label="이용 경로">
        {PATHS.map((item) => {
          const on = path === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={on}
              className={on ? styles.tabOn : styles.tab}
              onClick={() => setPath(item.id)}
            >
              <span className={styles.tabLabel}>{item.label}</span>
              <span className={styles.tabHint}>{item.hint}</span>
            </button>
          );
        })}
      </div>

      <ol key={path} className={styles.steps}>
        {steps.map((step, index) => (
          <li key={step.n} className={styles.step}>
            <div className={styles.card}>
              <span className={styles.badge} aria-hidden>
                {index + 1}
              </span>
              <span className={styles.cardText}>
                <strong>{step.title}</strong>
                <span>{step.desc}</span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
