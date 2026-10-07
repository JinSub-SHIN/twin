import { ChevronDown, MapPin, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppliedFilterChip } from "./FilterChip";
import { conditionChips, hasLocation, locationLabel } from "./model";
import type { ListingFilter } from "./types";
import styles from "./filter.module.css";

const VISIBLE_CHIPS = 3;

export function ListingFilterBar({
  filter,
  onOpenLocation,
  onOpenConditions,
  onClearLocation,
  onChange,
  onClearConditions,
}: {
  filter: ListingFilter;
  onOpenLocation: () => void;
  onOpenConditions: () => void;
  onClearLocation: () => void;
  onChange: (next: ListingFilter) => void;
  onClearConditions: () => void;
}) {
  const chips = conditionChips(filter);
  const located = hasLocation(filter);
  const hidden = chips.length - VISIBLE_CHIPS;

  return (
    <div>
      <div className={styles.bar}>
        <button
          type="button"
          className={cn(styles.barBtn, styles.barBtnLocation, located && styles.barBtnOn)}
          onClick={onOpenLocation}
        >
          <MapPin size={16} strokeWidth={2.3} />
          <span className={styles.barBtnLabel}>{locationLabel(filter)}</span>
          {located ? (
            <span
              role="button"
              tabIndex={0}
              className={styles.barClear}
              aria-label="지역 · 역세권 지우기"
              onClick={(event) => {
                event.stopPropagation();
                onClearLocation();
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                event.stopPropagation();
                onClearLocation();
              }}
            >
              <X size={12} strokeWidth={2.6} />
            </span>
          ) : (
            <ChevronDown size={16} strokeWidth={2.3} />
          )}
        </button>
        <button
          type="button"
          className={cn(styles.barBtn, chips.length > 0 && styles.barBtnOn)}
          onClick={onOpenConditions}
        >
          <SlidersHorizontal size={16} strokeWidth={2.3} />
          조건 필터
          {chips.length > 0 ? <span className={styles.badge}>{chips.length}</span> : null}
        </button>
      </div>

      {chips.length > 0 ? (
        <div className={styles.appliedRow}>
          <div className={styles.appliedList}>
            {chips.slice(0, VISIBLE_CHIPS).map((chip) => (
              <AppliedFilterChip
                key={chip.key}
                label={chip.label}
                onRemove={() => onChange(chip.remove(filter))}
              />
            ))}
            {hidden > 0 ? (
              <button type="button" className={styles.more} onClick={onOpenConditions}>
                +{hidden}
              </button>
            ) : null}
          </div>
          <button type="button" className={styles.clearAll} onClick={onClearConditions}>
            전체 삭제
          </button>
        </div>
      ) : null}
    </div>
  );
}
