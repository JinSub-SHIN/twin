import { ChoiceGroup } from "./FilterChip";
import {
  CLEAN_CHOICES,
  DRINK_CHOICES,
  LIFESTYLE_CHOICES,
  PET_CHOICES,
  SMOKING_CHOICES,
} from "./options";
import type { ListingFilter } from "./types";

export function LivingConditionFilter({
  value,
  onChange,
}: {
  value: ListingFilter;
  onChange: (next: ListingFilter) => void;
}) {
  return (
    <>
      <ChoiceGroup
        title="흡연"
        options={SMOKING_CHOICES}
        value={value.smoking}
        onChange={(smoking) => onChange({ ...value, smoking })}
      />
      <ChoiceGroup
        title="반려동물"
        options={PET_CHOICES}
        value={value.pet}
        onChange={(pet) => onChange({ ...value, pet })}
      />
      <ChoiceGroup
        title="음주"
        options={DRINK_CHOICES}
        value={value.drinking}
        onChange={(drinking) => onChange({ ...value, drinking })}
      />
      <ChoiceGroup
        title="생활 스타일"
        options={LIFESTYLE_CHOICES}
        value={value.lifestyle}
        onChange={(lifestyle) => onChange({ ...value, lifestyle })}
      />
      <ChoiceGroup
        title="청결"
        options={CLEAN_CHOICES}
        value={value.cleanliness}
        onChange={(cleanliness) => onChange({ ...value, cleanliness })}
      />
    </>
  );
}
