import { ChoiceChip, ChoiceGroup } from "./FilterChip";
import { AGE_CHOICES, EXTRA_CHOICES, GENDER_CHOICES, JOB_CHOICES } from "./options";
import type { ListingFilter } from "./types";
import styles from "./filter.module.css";

export function RoommateFilter({
  value,
  onChange,
}: {
  value: ListingFilter;
  onChange: (next: ListingFilter) => void;
}) {
  const extras = value.extras ?? [];

  return (
    <>
      <ChoiceGroup
        title="성별"
        options={GENDER_CHOICES}
        value={value.gender}
        onChange={(gender) => onChange({ ...value, gender })}
      />
      <ChoiceGroup
        title="연령대"
        options={AGE_CHOICES}
        value={value.ageRange}
        onChange={(ageRange) => onChange({ ...value, ageRange })}
      />
      <ChoiceGroup
        title="직업"
        options={JOB_CHOICES}
        value={value.occupation}
        onChange={(occupation) => onChange({ ...value, occupation })}
      />
      <section className={styles.section}>
        <h4 className={styles.sectionHead}>기타</h4>
        <p className={styles.sectionHint}>여러 개를 함께 고를 수 있어요.</p>
        <div className={styles.chips}>
          {EXTRA_CHOICES.map((option) => {
            const on = extras.includes(option.value);
            return (
              <ChoiceChip
                key={option.value}
                selected={on}
                onClick={() =>
                  onChange({
                    ...value,
                    extras: on
                      ? extras.filter((item) => item !== option.value)
                      : [...extras, option.value],
                  })
                }
              >
                {option.label}
              </ChoiceChip>
            );
          })}
        </div>
      </section>
    </>
  );
}
