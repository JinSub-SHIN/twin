import { DEPOSIT_RANGE, MONTHLY_RANGE, type ListingFilter } from "./types";
import styles from "./filter.module.css";

function man(value: number) {
  if (value === 0) return "0원";
  if (value >= 10000) return `${value / 10000}억원`;
  return `${value.toLocaleString("ko-KR")}만원`;
}

function RangeField({
  title,
  limit,
  step,
  min,
  max,
  onChange,
}: {
  title: string;
  limit: number;
  step: number;
  min: number | undefined;
  max: number | undefined;
  onChange: (min: number | undefined, max: number | undefined) => void;
}) {
  const low = min ?? 0;
  const high = max ?? limit;
  const commit = (nextLow: number, nextHigh: number) => {
    const a = Math.max(0, Math.min(nextLow, limit));
    const b = Math.max(0, Math.min(nextHigh, limit));
    const [lo, hi] = a <= b ? [a, b] : [b, a];
    onChange(lo > 0 ? lo : undefined, hi < limit ? hi : undefined);
  };
  const summary =
    low === 0 && high === limit
      ? "전체"
      : `${man(low)} ~ ${high === limit ? `${man(limit)} 이상` : man(high)}`;

  return (
    <section className={styles.section}>
      <h4 className={styles.sectionHead}>{title}</h4>
      <p className={styles.rangeValue}>{summary}</p>
      <div className={styles.slider}>
        <span className={styles.track} />
        <span
          className={styles.fill}
          style={{ left: `${(low / limit) * 100}%`, right: `${100 - (high / limit) * 100}%` }}
        />
        <input
          type="range"
          aria-label={`${title} 최소`}
          min={0}
          max={limit}
          step={step}
          value={low}
          style={{ zIndex: low > limit / 2 ? 2 : 1 }}
          onChange={(event) => commit(Math.min(Number(event.target.value), high), high)}
        />
        <input
          type="range"
          aria-label={`${title} 최대`}
          min={0}
          max={limit}
          step={step}
          value={high}
          onChange={(event) => commit(low, Math.max(Number(event.target.value), low))}
        />
      </div>
      <div className={styles.inputs}>
        <label className={styles.amount}>
          <input
            inputMode="numeric"
            aria-label={`${title} 최소 금액`}
            value={low}
            onChange={(event) => {
              const n = Number(event.target.value.replace(/\D/g, "")) || 0;
              commit(Math.min(n, high), high);
            }}
          />
          <em>만원</em>
        </label>
        <span>~</span>
        <label className={styles.amount}>
          <input
            inputMode="numeric"
            aria-label={`${title} 최대 금액`}
            value={high}
            onChange={(event) => {
              const n = Number(event.target.value.replace(/\D/g, "")) || 0;
              commit(low, Math.max(n, low));
            }}
          />
          <em>만원</em>
        </label>
      </div>
    </section>
  );
}

export function PriceFilter({
  value,
  onChange,
}: {
  value: ListingFilter;
  onChange: (next: ListingFilter) => void;
}) {
  return (
    <>
      <RangeField
        title="월 예상 비용"
        limit={MONTHLY_RANGE.max}
        step={MONTHLY_RANGE.step}
        min={value.minMonthlyCost}
        max={value.maxMonthlyCost}
        onChange={(minMonthlyCost, maxMonthlyCost) =>
          onChange({ ...value, minMonthlyCost, maxMonthlyCost })
        }
      />
      <div className={styles.divider} />
      <RangeField
        title="보증금"
        limit={DEPOSIT_RANGE.max}
        step={DEPOSIT_RANGE.step}
        min={value.minDeposit}
        max={value.maxDeposit}
        onChange={(minDeposit, maxDeposit) => onChange({ ...value, minDeposit, maxDeposit })}
      />
    </>
  );
}
