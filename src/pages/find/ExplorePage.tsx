import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ListingTeaserCard } from "@/components/ui/card";
import type { ListingSummary } from "@/lib/listingView";
import { roomTraits, type ListingTraits } from "@/lib/listingTraits";
import {
  matchesRoomRegion,
  matchesRoomStation,
  regionQueryOf,
  roomListItemToSummary,
  usesServerTotal,
} from "@/lib/roomListing";
import { COUNSELOR_IMG } from "@/pages/home/CounselorAvatar";
import { getRoomList } from "@/service/room";
import { ApiError } from "@/service/http";
import {
  ConditionFilter,
  ListingFilterBar,
  LocationSheet,
  SortDropdown,
  clearConditions,
  clearLocation,
  conditionChips,
  hasClientFilter,
  matchesTraits,
  parseListingFilter,
  parseSort,
  sortByKey,
  writeConditions,
  writeLocation,
  writeSort,
  type ListingFilter,
} from "./filter";
import styles from "./ExplorePage.module.css";

const PAGE_SIZE = 7;
const AD_INTERVALS = [3, 4];
/** 조건 필터로 걸러진 결과가 이보다 적으면 다음 페이지를 미리 불러옴 */
const MIN_FILTERED_ROWS = 6;

function showsAdAfter(index: number) {
  let cursor = -1;
  for (let step = 0; cursor < index; step += 1) {
    cursor += AD_INTERVALS[step % AD_INTERVALS.length];
    if (cursor === index) return true;
  }
  return false;
}

type ListingRow = {
  id: string;
  summary: ListingSummary;
  traits: ListingTraits;
};

async function fetchListingPage(
  regions: string[],
  station: string,
  stationRegion: string,
  page: number,
  isCancelled: () => boolean,
) {
  let cursor = page;
  let hasMore = true;
  let total = 0;
  const rows: ListingRow[] = [];

  const stationOnly = Boolean(station.trim());
  while (rows.length === 0 && hasMore && cursor - page < 40) {
    const result = await getRoomList({
      region: stationOnly ? stationRegion.trim() || undefined : regionQueryOf(regions),
      subway_stn: stationOnly ? station.trim() : undefined,
      page: cursor,
      limit: PAGE_SIZE,
    });
    if (isCancelled()) return null;
    total = result.total;
    hasMore = result.has_more;
    cursor += 1;
    for (const item of result.list) {
      if (!stationOnly && !matchesRoomRegion(item, regions)) continue;
      if (!matchesRoomStation(item, station)) continue;
      rows.push({
        id: item.id,
        summary: roomListItemToSummary(item),
        traits: roomTraits(item),
      });
    }
    if (rows.length > 0 || !hasMore) break;
  }

  return { rows, total, hasMore, nextPage: cursor };
}

export function ExplorePage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const filter = useMemo(() => parseListingFilter(params), [params]);
  const sort = parseSort(params);
  const selectedRegions = params.getAll("regions");
  const selectedStation = params.get("station")?.trim() ?? "";
  const selectedStationRegion = params.get("stationRegion")?.trim() ?? "";
  const regionKey = selectedRegions.join("|");
  const filterKey = `${regionKey}::${selectedStation}::${selectedStationRegion}`;

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSession, setLocationSession] = useState(0);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [conditionSession, setConditionSession] = useState(0);

  const [rows, setRows] = useState<ListingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const ready = loadedKey === filterKey;
  const loadedRows = useMemo(() => (ready ? rows : []), [ready, rows]);
  const clientFiltered = hasClientFilter(filter);
  const visibleRows = useMemo(
    () => sortByKey(loadedRows.filter((row) => matchesTraits(row.traits, filter)), sort),
    [loadedRows, filter, sort],
  );
  const visibleError = ready ? error : "";
  const visibleHasMore = ready && hasMore;
  const filling = clientFiltered && visibleHasMore && visibleRows.length === 0;
  const loading = !ready || filling;
  const serverCount = usesServerTotal(selectedRegions) ? (ready ? total : 0) : loadedRows.length;
  const listingCount = clientFiltered ? visibleRows.length : serverCount;

  const countOf = (draft: ListingFilter) =>
    hasClientFilter(draft)
      ? loadedRows.filter((row) => matchesTraits(row.traits, draft)).length
      : serverCount;

  const loadingRef = useRef(false);
  const armedRef = useRef(true);
  const hasMoreRef = useRef(false);
  const nextPageRef = useRef(1);
  const generationRef = useRef(0);
  const regionsRef = useRef(selectedRegions);
  const stationRef = useRef(selectedStation);
  const stationRegionRef = useRef(selectedStationRegion);
  const loadMoreRef = useRef<() => void>(() => {});

  useEffect(() => {
    const generation = ++generationRef.current;
    const regions = regionKey ? regionKey.split("|") : [];
    regionsRef.current = regions;
    stationRef.current = selectedStation;
    stationRegionRef.current = selectedStationRegion;
    nextPageRef.current = 1;
    hasMoreRef.current = false;
    loadingRef.current = true;
    armedRef.current = true;

    void (async () => {
      try {
        const result = await fetchListingPage(
          regions,
          selectedStation,
          selectedStationRegion,
          1,
          () => {
            return generationRef.current !== generation;
          },
        );
        if (!result || generationRef.current !== generation) return;
        setRows(result.rows);
        setTotal(result.total);
        setHasMore(result.hasMore);
        setError("");
        hasMoreRef.current = result.hasMore;
        nextPageRef.current = result.nextPage;
        setLoadedKey(filterKey);
      } catch (err) {
        if (generationRef.current !== generation) return;
        setRows([]);
        setTotal(0);
        setHasMore(false);
        setError(
          err instanceof ApiError
            ? err.message
            : "공고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
        );
        setLoadedKey(filterKey);
      } finally {
        if (generationRef.current === generation) {
          loadingRef.current = false;
        }
      }
    })();
  }, [filterKey, regionKey, selectedStation, selectedStationRegion]);

  useEffect(() => {
    const root = document.querySelector("main");
    if (!root) return;

    const atBottom = () =>
      root.scrollTop + root.clientHeight >= root.scrollHeight - 28;

    const loadMore = () => {
      if (loadingRef.current || !hasMoreRef.current || !armedRef.current)
        return;
      const generation = generationRef.current;
      loadingRef.current = true;
      armedRef.current = false;
      setLoadingMore(true);
      void (async () => {
        try {
          const result = await fetchListingPage(
            regionsRef.current,
            stationRef.current,
            stationRegionRef.current,
            nextPageRef.current,
            () => generationRef.current !== generation,
          );
          if (!result || generationRef.current !== generation) return;
          setRows((prev) => [...prev, ...result.rows]);
          setTotal(result.total);
          setHasMore(result.hasMore);
          hasMoreRef.current = result.hasMore;
          nextPageRef.current = result.nextPage;
        } catch (err) {
          if (generationRef.current !== generation) return;
          setError(
            err instanceof ApiError
              ? err.message
              : "공고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
          );
          hasMoreRef.current = false;
          setHasMore(false);
        } finally {
          if (generationRef.current === generation) {
            loadingRef.current = false;
            setLoadingMore(false);
          }
        }
      })();
    };

    loadMoreRef.current = () => {
      armedRef.current = true;
      loadMore();
    };

    const onScroll = () => {
      if (!atBottom()) {
        armedRef.current = true;
        return;
      }
      loadMore();
    };

    let startY = 0;
    const onTouchStart = (event: TouchEvent) => {
      startY = event.touches[0]?.clientY ?? 0;
      if (!loadingRef.current) armedRef.current = true;
    };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? startY;
      const pulledUp = startY - y > 18;
      if (atBottom() && pulledUp) loadMore();
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  useEffect(() => {
    if (!ready || !clientFiltered || !hasMore || loadingMore) return;
    if (visibleRows.length >= MIN_FILTERED_ROWS) return;
    const timer = window.setTimeout(() => loadMoreRef.current(), 0);
    return () => window.clearTimeout(timer);
  }, [ready, clientFiltered, hasMore, loadingMore, visibleRows.length]);

  function openLocation() {
    setLocationSession((n) => n + 1);
    setLocationOpen(true);
  }

  function openConditions() {
    setConditionSession((n) => n + 1);
    setConditionOpen(true);
  }

  function applyConditions(next: ListingFilter) {
    setParams(writeConditions(params, next));
  }

  const openListing = (id: string) => {
    navigate(`/explore/listing/${id}`, {
      state: {
        returnTo: `/explore?${params.toString()}`,
      },
    });
  };

  const previewListings = visibleRows.slice(0, 2);
  const restListings = visibleRows.slice(2);
  const hasConditions = conditionChips(filter).length > 0;

  function renderListing(item: ListingRow, index: number) {
    const card = (
      <ListingTeaserCard
        summary={item.summary}
        onClick={() => openListing(item.id)}
      />
    );
    if (!showsAdAfter(index)) return <Fragment key={item.id}>{card}</Fragment>;
    return (
      <Fragment key={item.id}>
        {card}
        <div className={styles.adBanner} aria-label="광고 영역">
          광고 예정 배너 구역
        </div>
      </Fragment>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.lead}>
        <div className={styles.intro}>
          <h2 className={styles.title}>
            내 방의 <span className={styles.accent}>살짝</span>을 찾아보세요
          </h2>
        </div>
      </div>

      <div className={styles.filterSticky}>
        <ListingFilterBar
          filter={filter}
          onOpenLocation={openLocation}
          onOpenConditions={openConditions}
          onClearLocation={() => setParams(writeLocation(params, clearLocation(filter)))}
          onChange={applyConditions}
          onClearConditions={() => applyConditions(clearConditions(filter))}
        />
      </div>

      <div className={styles.feed}>
        <div className={styles.tourSpot} data-tour="explore">
          <div className={styles.feedHead}>
            <p className={styles.feedLabel}>
              총 <em>{listingCount}</em>개의 공고
            </p>
            <SortDropdown
              value={sort}
              onChange={(next) => setParams(writeSort(params, next), { replace: true })}
            />
          </div>

          {loading ? (
            <div
              className={styles.sentinel}
              aria-live="polite"
              aria-label="공고를 불러오는 중"
            >
              <span className={styles.loader} aria-hidden>
                <img
                  src={COUNSELOR_IMG.thinking}
                  alt=""
                  className={styles.loaderFace}
                />
                <span className={styles.dots}>
                  <i />
                  <i />
                  <i />
                </span>
              </span>
            </div>
          ) : visibleError ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>공고를 불러오지 못했어요</p>
              <p className={styles.emptyDesc}>{visibleError}</p>
            </div>
          ) : previewListings.length > 0 ? (
            previewListings.map((item, index) =>
              renderListing(item, index),
            )
          ) : (
            <div className={styles.emptyListing}>
              <img
                src={COUNSELOR_IMG.thinking}
                alt=""
                className={styles.emptyFace}
              />
              <p className={styles.emptyListingTitle}>
                {clientFiltered ? (
                  <>
                    조건에 맞는 동거인을
                    <br />
                    아직 찾지 못했어요
                  </>
                ) : selectedStation ? (
                  <>
                    이 역 근처에는
                    <br />
                    아직 공고가 없어요
                  </>
                ) : selectedRegions.length > 0 ? (
                  <>
                    이 지역에는
                    <br />
                    아직 공고가 없어요
                  </>
                ) : (
                  <>
                    아직 올라온
                    <br />
                    공고가 없어요
                  </>
                )}
              </p>
              <p className={styles.emptyListingDesc}>
                {clientFiltered
                  ? "조건을 조금 넓히면 더 많은 분을 만날 수 있어요."
                  : selectedStation
                    ? "다른 역을 골라보면 찾을 수 있어요."
                    : selectedRegions.length > 0
                      ? "다른 지역을 골라보면 찾을 수 있어요."
                      : "조금만 기다리면 새 공고가 올라올 거예요."}
              </p>
              {clientFiltered || selectedStation || selectedRegions.length > 0 ? (
                <button
                  type="button"
                  className={styles.emptyAction}
                  onClick={hasConditions ? openConditions : openLocation}
                >
                  {hasConditions
                    ? "조건 다시 고르기"
                    : selectedStation
                      ? "다른 역 보기"
                      : "다른 지역 보기"}
                </button>
              ) : null}
            </div>
          )}
        </div>

        {restListings.map((item, index) =>
          renderListing(item, index + previewListings.length),
        )}
        {(visibleHasMore || loadingMore) && !loading ? (
          <div
            className={styles.sentinel}
            aria-live="polite"
            aria-label={loadingMore ? "공고를 불러오는 중" : undefined}
          >
            {loadingMore ? (
              <span className={styles.loader} aria-hidden>
                <img
                  src={COUNSELOR_IMG.thinking}
                  alt=""
                  className={styles.loaderFace}
                />
                <span className={styles.dots}>
                  <i />
                  <i />
                  <i />
                </span>
              </span>
            ) : (
              <span className={styles.dotsIdle} aria-hidden>
                <i />
                <i />
                <i />
              </span>
            )}
          </div>
        ) : null}
      </div>

      <LocationSheet
        key={`location-${locationSession}`}
        open={locationOpen}
        value={filter}
        onOpenChange={setLocationOpen}
        onApply={(next) => {
          setParams(writeLocation(params, next));
          setLocationOpen(false);
        }}
      />

      <ConditionFilter
        key={`condition-${conditionSession}`}
        open={conditionOpen}
        value={filter}
        onOpenChange={setConditionOpen}
        countOf={countOf}
        onApply={(next) => {
          applyConditions(next);
          setConditionOpen(false);
        }}
      />
    </section>
  );
}
