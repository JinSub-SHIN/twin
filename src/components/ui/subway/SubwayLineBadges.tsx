import { cn } from "@/lib/utils";
import styles from "./SubwayLineBadges.module.css";

type LineMark = {
  key: string;
  label: string;
  color: string;
  round: boolean;
  order: number;
};

const LINE_MARKS: Record<string, Omit<LineMark, "key">> = {
  seoul_1: { label: "1", color: "#0052A4", round: true, order: 1 },
  seoul_2: { label: "2", color: "#00A84D", round: true, order: 2 },
  seoul_3: { label: "3", color: "#EF7C1C", round: true, order: 3 },
  seoul_4: { label: "4", color: "#00A5DE", round: true, order: 4 },
  seoul_5: { label: "5", color: "#996CAC", round: true, order: 5 },
  seoul_6: { label: "6", color: "#CD7C2F", round: true, order: 6 },
  seoul_7: { label: "7", color: "#747F00", round: true, order: 7 },
  seoul_8: { label: "8", color: "#E6186C", round: true, order: 8 },
  seoul_9: { label: "9", color: "#BDB092", round: true, order: 9 },
  충남_1: { label: "1", color: "#0052A4", round: true, order: 1 },
  incheon_1: { label: "인천1", color: "#7CA8D5", round: false, order: 11 },
  incheon_2: { label: "인천2", color: "#ED8B00", round: false, order: 12 },
  busan_1: { label: "1", color: "#F06A00", round: true, order: 1 },
  busan_2: { label: "2", color: "#81BF48", round: true, order: 2 },
  busan_3: { label: "3", color: "#BB8C00", round: true, order: 3 },
  busan_4: { label: "4", color: "#217DCB", round: true, order: 4 },
  daegu_1: { label: "1", color: "#D93F5C", round: true, order: 1 },
  daegu_2: { label: "2", color: "#00AA80", round: true, order: 2 },
  daegu_3: { label: "3", color: "#FFB100", round: true, order: 3 },
  gwangju_1: { label: "1", color: "#009088", round: true, order: 1 },
  daejeon_1: { label: "1", color: "#007448", round: true, order: 1 },
  sinbundang: { label: "신분당", color: "#D4003B", round: false, order: 20 },
  suin_bundang: { label: "수인분당", color: "#F5A200", round: false, order: 21 },
  gyeongui_jungang: { label: "경의중앙", color: "#77C4A3", round: false, order: 22 },
  gyeonggang: { label: "경강", color: "#0054A6", round: false, order: 23 },
  gyeongchun: { label: "경춘", color: "#178C4B", round: false, order: 24 },
  airport_railroad: { label: "공항", color: "#0090D2", round: false, order: 25 },
  seohae: { label: "서해", color: "#8FC31F", round: false, order: 26 },
  gtx_a: { label: "GTX-A", color: "#9A348E", round: false, order: 30 },
  everline: { label: "에버", color: "#6CB33F", round: false, order: 31 },
  uijeongbu: { label: "의정부", color: "#FF9E18", round: false, order: 32 },
  gimpo_goldline: { label: "김포", color: "#A17C00", round: false, order: 33 },
  ui_sinseol: { label: "우이", color: "#B7C452", round: false, order: 34 },
  sillim: { label: "신림", color: "#6789CA", round: false, order: 35 },
  donghae: { label: "동해", color: "#00A4A6", round: false, order: 36 },
  daegyeong: { label: "대경", color: "#8C1D40", round: false, order: 37 },
  busan_gimhae: { label: "김해", color: "#8651A0", round: false, order: 38 },
  maglev: { label: "자기", color: "#FFB81C", round: false, order: 39 },
};

function markOf(code: string): LineMark {
  const known = LINE_MARKS[code];
  if (known) return { key: code, ...known };
  return {
    key: code,
    label: code,
    color: "#8a8f98",
    round: false,
    order: 90,
  };
}

export function SubwayLineBadges({
  lines,
  className,
}: {
  lines: string[];
  className?: string;
}) {
  const marks = lines.map(markOf).sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, "ko"));
  if (marks.length === 0) return null;

  return (
    <span
      className={cn(styles.badges, className)}
      aria-label={marks.map((mark) => mark.label).join(" ")}
    >
      {marks.map((mark) => (
        <span
          key={mark.key}
          className={mark.round ? styles.round : styles.pill}
          style={{ background: mark.color }}
          aria-hidden
        >
          {mark.label}
        </span>
      ))}
    </span>
  );
}
