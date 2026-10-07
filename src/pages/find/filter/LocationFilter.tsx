import { useEffect, useState } from "react";
import { Check, ChevronDown, MapPin, Search, TrainFront, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SubwayLineBadges } from "@/components/ui/subway";
import { REGION_CITIES, REGION_TREE, cityOfRegion, districtOfRegion, formatRegion } from "@/lib/regions";
import { cn } from "@/lib/utils";
import { searchStations, type StationSearchItem } from "@/service/room";
import { FilterBottomSheet } from "./FilterBottomSheet";
import { ChoiceChip } from "./FilterChip";
import { clearLocation } from "./model";
import { WALK_CHOICES } from "./options";
import type { ListingFilter } from "./types";
import styles from "./filter.module.css";

export function LocationSheet({
  open,
  value,
  onOpenChange,
  onApply,
}: {
  open: boolean;
  value: ListingFilter;
  onOpenChange: (open: boolean) => void;
  onApply: (next: ListingFilter) => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <FilterBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="지역 · 역세권"
      applyLabel="적용하기"
      onReset={() => setDraft(clearLocation(draft))}
      onApply={() => onApply(draft)}
    >
      <LocationFilter value={draft} onChange={setDraft} />
    </FilterBottomSheet>
  );
}

export function LocationFilter({
  value,
  onChange,
}: {
  value: ListingFilter;
  onChange: (next: ListingFilter) => void;
}) {
  const city = value.subwayStation ? "" : cityOfRegion(value.region);
  const district = districtOfRegion(value.region);
  const [searching, setSearching] = useState(false);

  const pickRegion = (region: string | undefined) =>
    onChange({ ...value, region, subwayStation: undefined, stationRegion: undefined });

  return (
    <>
      <section className={styles.section}>
        <h4 className={styles.sectionHead}>
          <MapPin size={16} strokeWidth={2.3} />
          지역
        </h4>
        <div className={styles.chips}>
          <ChoiceChip
            selected={!value.region && !value.subwayStation}
            onClick={() => pickRegion(undefined)}
          >
            전체
          </ChoiceChip>
          {REGION_CITIES.map((item) => (
            <ChoiceChip
              key={item}
              selected={city === item}
              onClick={() => pickRegion(city === item ? undefined : `${item} 전체`)}
            >
              {item}
            </ChoiceChip>
          ))}
        </div>
        {city ? (
          <div className={cn(styles.chips, styles.districts)}>
            {["전체", ...(REGION_TREE[city] ?? [])].map((item) => {
              const region = item === "전체" ? `${city} 전체` : formatRegion(city, item);
              return (
                <ChoiceChip
                  key={region}
                  selected={district === item}
                  onClick={() => pickRegion(region)}
                >
                  {item === "전체" ? `${city} 전체` : item}
                </ChoiceChip>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionHead}>
          <TrainFront size={16} strokeWidth={2.3} />
          지하철역
        </h4>
        <button
          type="button"
          className={cn(styles.stationRow, value.subwayStation && styles.stationRowOn)}
          aria-expanded={searching}
          onClick={() => setSearching(!searching)}
        >
          <TrainFront size={17} strokeWidth={2.2} />
          <span className={cn(styles.stationRowText, !value.subwayStation && styles.stationRowMuted)}>
            {value.subwayStation ?? "전체 지하철역"}
          </span>
          {value.subwayStation ? (
            <span
              role="button"
              tabIndex={0}
              className={styles.barClear}
              aria-label="지하철역 지우기"
              onClick={(event) => {
                event.stopPropagation();
                onChange({ ...value, subwayStation: undefined, stationRegion: undefined });
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                event.stopPropagation();
                onChange({ ...value, subwayStation: undefined, stationRegion: undefined });
              }}
            >
              <X size={12} strokeWidth={2.6} />
            </span>
          ) : (
            <ChevronDown size={16} strokeWidth={2.3} />
          )}
        </button>
        {searching ? (
          <StationSearch
            selected={value.subwayStation}
            selectedRegion={value.stationRegion}
            onPick={(station) => {
              onChange({
                ...value,
                region: undefined,
                subwayStation: station.name,
                stationRegion: station.region.trim() || undefined,
              });
              setSearching(false);
            }}
          />
        ) : null}
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionHead}>역과의 거리</h4>
        <div className={styles.chips}>
          {WALK_CHOICES.map((option) => (
            <ChoiceChip
              key={option.value}
              selected={value.distance === option.value}
              onClick={() =>
                onChange({
                  ...value,
                  distance: value.distance === option.value ? undefined : option.value,
                })
              }
            >
              {option.label}
            </ChoiceChip>
          ))}
        </div>
      </section>
    </>
  );
}

function StationSearch({
  selected,
  selectedRegion,
  onPick,
}: {
  selected?: string;
  selectedRegion?: string;
  onPick: (station: StationSearchItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StationSearchItem[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const q = query.trim();

  useEffect(() => {
    if (!q) return;
    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(() => {
      setState("loading");
      searchStations({ q, limit: 20, signal: controller.signal })
        .then((res) => {
          if (!active) return;
          setResults(res.stations ?? []);
          setState("idle");
        })
        .catch(() => {
          if (!active) return;
          setResults([]);
          setState("error");
        });
    }, 200);
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  return (
    <div className={styles.stationPanel}>
      <div className={styles.search}>
        <Search className={styles.searchIcon} size={17} strokeWidth={2.2} aria-hidden />
        <Input
          autoFocus
          className={styles.searchInput}
          placeholder="역 이름 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query ? (
          <button
            type="button"
            className={styles.searchClear}
            aria-label="검색어 지우기"
            onClick={() => setQuery("")}
          >
            <X size={12} strokeWidth={2.6} />
          </button>
        ) : null}
      </div>
      {q ? (
        <div className={styles.results}>
          {state === "error" ? (
            <p className={styles.resultHint}>역을 불러오지 못했어요.</p>
          ) : state === "loading" && results.length === 0 ? (
            <p className={styles.resultHint}>찾는 중</p>
          ) : results.length === 0 ? (
            <p className={styles.resultHint}>맞는 역이 없어요.</p>
          ) : (
            results.map((station) => {
              const active = selected === station.name && (selectedRegion ?? "") === station.region;
              return (
                <button
                  key={`${station.region}-${station.name}-${station.lines.join(",")}`}
                  type="button"
                  className={styles.result}
                  onClick={() => onPick(station)}
                >
                  <SubwayLineBadges lines={station.lines} />
                  <span className={styles.resultName}>{station.name}</span>
                  {active ? <Check size={16} strokeWidth={2.6} /> : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
