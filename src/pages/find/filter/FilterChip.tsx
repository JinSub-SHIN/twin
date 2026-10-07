import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Option } from "./options";
import styles from "./filter.module.css";

export function ChoiceChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(styles.chip, selected && styles.chipOn)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function AppliedFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className={styles.applied}>
      {label}
      <button type="button" aria-label={`${label} 조건 빼기`} onClick={onRemove}>
        <X size={13} strokeWidth={2.6} />
      </button>
    </span>
  );
}

/** 단일 선택. 선택된 값을 다시 누르면 해제 */
export function ChoiceGroup<T>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: Option<T>[];
  value: T | undefined;
  onChange: (next: T | undefined) => void;
}) {
  return (
    <section className={styles.section}>
      <h4 className={styles.sectionHead}>{title}</h4>
      <div className={styles.chips}>
        {options.map((option) => (
          <ChoiceChip
            key={option.label}
            selected={value === option.value}
            onClick={() =>
              onChange(option.value === undefined || option.value === value ? undefined : option.value)
            }
          >
            {option.label}
          </ChoiceChip>
        ))}
      </div>
    </section>
  );
}
