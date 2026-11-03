import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { FilterBottomSheet } from "./FilterBottomSheet";
import { LivingConditionFilter } from "./LivingConditionFilter";
import { PriceFilter } from "./PriceFilter";
import { RoommateFilter } from "./RoommateFilter";
import { clearConditions, conditionChips } from "./model";
import type { ListingFilter } from "./types";
import { useRoomCountPreview } from "./useRoomCountPreview";
import styles from "./filter.module.css";

type Tab = "living" | "roommate" | "price";

const TABS: { key: Tab; label: string; keys: string[] }[] = [
  { key: "living", label: "생활 조건", keys: ["smoking", "pet", "drinking", "lifestyle", "cleanliness"] },
  { key: "roommate", label: "동거인 조건", keys: ["gender", "ageRange", "occupation", "extra"] },
  { key: "price", label: "비용", keys: ["monthly", "deposit"] },
];

export type ConditionTab = Tab;

export function ConditionFilter({
  open,
  initialTab = "living",
  value,
  legacyRegions = [],
  onOpenChange,
  onApply,
}: {
  open: boolean;
  initialTab?: Tab;
  value: ListingFilter;
  /** URL regions (다중 구 선택 등). count/list와 동일한 region 해석 */
  legacyRegions?: string[];
  onOpenChange: (open: boolean) => void;
  onApply: (next: ListingFilter) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [tab, setTab] = useState<Tab>(initialTab);
  const keys = conditionChips(draft).map((chip) => chip.key.replace(/-.*$/, ""));
  const { total, loading } = useRoomCountPreview(draft, legacyRegions, open);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const countLabel =
    loading && total === null
      ? "…"
      : total != null
        ? String(total)
        : "—";

  return (
    <FilterBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="조건 필터"
      tall
      applyLabel={`${countLabel}개 공고 보기`}
      onReset={() => setDraft(clearConditions(draft))}
      onApply={() => onApply(draft)}
      tabs={
        <div className={styles.tabs} role="tablist">
          {TABS.map((item) => {
            const picked = keys.filter((key) => item.keys.includes(key)).length;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={tab === item.key}
                className={cn(styles.tab, tab === item.key && styles.tabOn)}
                onClick={() => setTab(item.key)}
              >
                {item.label}
                {picked > 0 ? <span className={styles.tabCount}>{picked}</span> : null}
              </button>
            );
          })}
        </div>
      }
    >
      {tab === "living" ? (
        <LivingConditionFilter value={draft} onChange={setDraft} />
      ) : tab === "roommate" ? (
        <RoommateFilter value={draft} onChange={setDraft} />
      ) : (
        <PriceFilter value={draft} onChange={setDraft} />
      )}
    </FilterBottomSheet>
  );
}
