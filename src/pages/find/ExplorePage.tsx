import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowLeft, Check, ChevronDown, MapPin, Search, TrainFront, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ListingTeaserCard } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubwayLineBadges } from "@/components/ui/subway";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ListingSummary } from "@/lib/listingView";
import {
  matchesRoomRegion,
  matchesRoomStation,
  regionQueryOf,
  roomListItemToSummary,
  usesServerTotal,
} from "@/lib/roomListing";
import {
  REGION_CITIES,
  REGION_TREE,
  cityOfRegion,
  formatRegion,
} from "@/lib/regions";
import { cn } from "@/lib/utils";
import { COUNSELOR_IMG } from "@/pages/home/CounselorAvatar";
import { getRoomList, searchStations, type StationSearchItem } from "@/service/room";
import { ApiError } from "@/service/http";
import styles from "./ExplorePage.module.css";

const PAGE_SIZE = 7;

type ListingRow = {
  id: string;
  summary: ListingSummary;
};

async function fetchListingPage(
  regions: string[],
  station: string,
  page: number,
  isCancelled: () => boolean,
) {
  let cursor = page;
  let hasMore = true;
  let total = 0;
  const rows: ListingRow[] = [];

  while (rows.length === 0 && hasMore && cursor - page < 40) {
    const result = await getRoomList({
      region: regionQueryOf(regions),
      page: cursor,
      limit: PAGE_SIZE,
    });
    if (isCancelled()) return null;
    total = result.total;
    hasMore = result.has_more;
    cursor += 1;
    for (const item of result.list) {
      if (!matchesRoomRegion(item, regions)) continue;
      if (!matchesRoomStation(item, station)) continue;
      rows.push({ id: item.id, summary: roomListItemToSummary(item) });
    }
    if (rows.length > 0 || !hasMore) break;
  }

  return { rows, total, hasMore, nextPage: cursor };
}

export function ExplorePage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const selectedRegions = params.getAll("regions");
  const selectedStation = params.get("station")?.trim() ?? "";
  const [open, setOpen] = useState(false);
  const [stationOpen, setStationOpen] = useState(false);
  const [stationQuery, setStationQuery] = useState("");
  const [stationSuggestions, setStationSuggestions] = useState<
    StationSearchItem[]
  >([]);
  const [stationSearchState, setStationSearchState] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [sheetStep, setSheetStep] = useState<"city" | "district">("city");
  const [draftCity, setDraftCity] = useState<string | null>(null);
  const currentCity = cityOfRegion(selectedRegions[0]);

  const districts = draftCity
    ? ["전체", ...(REGION_TREE[draftCity] ?? [])]
    : [];
  const regionKey = selectedRegions.join("|");
  const filterKey = `${regionKey}::${selectedStation}`;

  const [rows, setRows] = useState<ListingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const ready = loadedKey === filterKey;
  const visibleRows = ready ? rows : [];
  const visibleError = ready ? error : "";
  const visibleHasMore = ready && hasMore;
  const loading = !ready;
  const listingCount =
    !selectedStation && usesServerTotal(selectedRegions)
      ? ready
        ? total
        : 0
      : visibleRows.length;

  const loadingRef = useRef(false);
  const armedRef = useRef(true);
  const hasMoreRef = useRef(false);
  const nextPageRef = useRef(1);
  const generationRef = useRef(0);
  const regionsRef = useRef(selectedRegions);
  const stationRef = useRef(selectedStation);

  useEffect(() => {
    const generation = ++generationRef.current;
    const regions = regionKey ? regionKey.split("|") : [];
    regionsRef.current = regions;
    stationRef.current = selectedStation;
    nextPageRef.current = 1;
    hasMoreRef.current = false;
    loadingRef.current = true;
    armedRef.current = true;

    void (async () => {
      try {
        const result = await fetchListingPage(regions, selectedStation, 1, () => {
          return generationRef.current !== generation;
        });
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
  }, [filterKey, regionKey, selectedStation]);

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
    if (!stationOpen) return;
    const q = stationQuery.trim();
    if (!q) {
      setStationSuggestions([]);
      setStationSearchState("idle");
      return;
    }

    const controller = new AbortController();
    let active = true;
    const city = cityOfRegion(selectedRegions[0]);
    const timer = window.setTimeout(() => {
      setStationSearchState("loading");
      searchStations({
        q,
        region: city || undefined,
        limit: 20,
        signal: controller.signal,
      })
        .then((res) => {
          if (!active) return;
          setStationSuggestions(res.stations ?? []);
          setStationSearchState("idle");
        })
        .catch(() => {
          if (!active) return;
          setStationSuggestions([]);
          setStationSearchState("error");
        });
    }, 200);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [stationOpen, stationQuery, regionKey]);

  const filterLabel =
    selectedRegions.length === 0
      ? "지역을 고르세요"
      : selectedRegions.length === 1
        ? selectedRegions[0]
        : `${selectedRegions[0]} 외 ${selectedRegions.length - 1}곳`;

  function openFilter() {
    setDraftCity(null);
    setSheetStep("city");
    setOpen(true);
  }

  function pickCity(city: string) {
    setDraftCity(city);
    setSheetStep("district");
  }

  function pickDistrict(district: string) {
    if (!draftCity) return;
    const value =
      district === "전체"
        ? `${draftCity} 전체`
        : formatRegion(draftCity, district);
    setParams(new URLSearchParams([["regions", value]]));
    setOpen(false);
  }

  function clearFilter(event: MouseEvent) {
    event.stopPropagation();
    const next = new URLSearchParams(params);
    next.delete("regions");
    setParams(next);
  }

  function openStationFilter() {
    setStationQuery("");
    setStationSuggestions([]);
    setStationSearchState("idle");
    setStationOpen(true);
  }

  function pickStation(name: string) {
    const next = new URLSearchParams(params);
    next.set("station", name);
    setParams(next);
    setStationOpen(false);
  }

  function clearStation(event: MouseEvent) {
    event.stopPropagation();
    const next = new URLSearchParams(params);
    next.delete("station");
    setParams(next);
  }

  const placeLabel = [selectedRegions.length > 0 ? filterLabel : "", selectedStation]
    .filter(Boolean)
    .join(" · ");

  const openListing = (id: string) => {
    navigate(`/explore/listing/${id}`, {
      state: {
        returnTo: `/explore?${params.toString()}`,
      },
    });
  };

  const previewListings = visibleRows.slice(0, 2);
  const restListings = visibleRows.slice(2);

  return (
    <section className={styles.page}>
      <div className={styles.lead}>
        <div className={styles.intro}>
          <h2 className={styles.title}>
            내 방의 <span className={styles.accent}>살짝</span>을 찾아보세요
          </h2>
        </div>

        <div className={styles.filterRow}>
          <button
            type="button"
            className={cn(
              styles.filterChip,
              selectedRegions.length > 0 && styles.filterChipActive,
            )}
            onClick={openFilter}
          >
            <MapPin size={15} strokeWidth={2.3} />
            <span>{filterLabel}</span>
            <ChevronDown size={15} strokeWidth={2.3} />
          </button>
          {selectedRegions.length > 0 ? (
            <button
              type="button"
              className={styles.filterClear}
              aria-label="지역 필터 지우기"
              onClick={clearFilter}
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          ) : null}
          <button
            type="button"
            className={cn(
              styles.filterChip,
              selectedStation && styles.filterChipActive,
            )}
            onClick={openStationFilter}
          >
            <TrainFront size={15} strokeWidth={2.3} />
            <span>{selectedStation || "지하철역"}</span>
            <ChevronDown size={15} strokeWidth={2.3} />
          </button>
          {selectedStation ? (
            <button
              type="button"
              className={styles.filterClear}
              aria-label="지하철역 필터 지우기"
              onClick={clearStation}
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          ) : null}
        </div>
      </div>

      <div className={styles.feed}>
        <div className={styles.tourSpot} data-tour="explore">
          <div className={styles.feedHead}>
            <p className={styles.feedPlace}>{placeLabel || "전체 지역"}</p>
            <p className={styles.feedLabel}>
              공고 <em>{listingCount}</em>개
            </p>
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
            previewListings.map((item) => (
              <ListingTeaserCard
                key={item.id}
                summary={item.summary}
                onClick={() => openListing(item.id)}
              />
            ))
          ) : (
            <div className={styles.emptyListing}>
              <img
                src={COUNSELOR_IMG.thinking}
                alt=""
                className={styles.emptyFace}
              />
              <p className={styles.emptyListingTitle}>
                {selectedStation ? (
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
                {selectedStation
                  ? "다른 역을 골라보면 찾을 수 있어요."
                  : selectedRegions.length > 0
                    ? "다른 지역을 골라보면 찾을 수 있어요."
                    : "조금만 기다리면 새 공고가 올라올 거예요."}
              </p>
              {selectedStation || selectedRegions.length > 0 ? (
                <button
                  type="button"
                  className={styles.emptyAction}
                  onClick={selectedStation ? openStationFilter : openFilter}
                >
                  {selectedStation ? "다른 역 보기" : "다른 지역 보기"}
                </button>
              ) : null}
            </div>
          )}
        </div>

        {restListings.map((item) => (
          <ListingTeaserCard
            key={item.id}
            summary={item.summary}
            onClick={() => openListing(item.id)}
          />
        ))}
        {visibleHasMore || loadingMore ? (
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          sheet
          className={styles.sheet}
          overlayClassName={styles.sheetOverlay}
          showCloseButton={false}
        >
          <span className={styles.sheetHandle} aria-hidden />
          {sheetStep === "district" && draftCity ? (
            <section
              key={`district-${draftCity}`}
              className={cn(styles.sheetPane, styles.sheetPaneNext)}
            >
              <DialogHeader className={styles.sheetHeader}>
                <button
                  type="button"
                  className={styles.sheetBack}
                  onClick={() => setSheetStep("city")}
                >
                  <ArrowLeft size={16} strokeWidth={2.5} />
                  광역 다시 고르기
                </button>
                <DialogTitle className={styles.sheetTitle}>
                  <span className={styles.accent}>{draftCity}</span>에서
                  <br />
                  어디를 찾으세요?
                </DialogTitle>
              </DialogHeader>
              <div className={styles.sheetGrid}>
                {districts.map((item) => {
                  const value =
                    item === "전체"
                      ? `${draftCity} 전체`
                      : formatRegion(draftCity, item);
                  const active = selectedRegions[0] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={cn(
                        styles.sheetCell,
                        item === "전체" && styles.sheetCellWide,
                        active && styles.sheetCellOn,
                      )}
                      onClick={() => pickDistrict(item)}
                    >
                      {item === "전체" ? `${draftCity} 전체` : item}
                      {active ? <Check size={15} strokeWidth={2.8} /> : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            <section
              key="city"
              className={cn(
                styles.sheetPane,
                draftCity && styles.sheetPaneBack,
              )}
            >
              <DialogHeader className={styles.sheetHeader}>
                <DialogTitle className={styles.sheetTitle}>
                  어느 지역의
                  <br />
                  공고를 찾으세요?
                </DialogTitle>
                <DialogDescription className={styles.sheetDesc}>
                  시·도를 고르면 구·시를 이어서 골라요.
                </DialogDescription>
              </DialogHeader>
              <div className={styles.sheetGrid}>
                {REGION_CITIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={cn(
                      styles.sheetCell,
                      currentCity === item && styles.sheetCellOn,
                    )}
                    onClick={() => pickCity(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={stationOpen} onOpenChange={setStationOpen}>
        <DialogContent
          sheet
          className={styles.sheet}
          overlayClassName={styles.sheetOverlay}
          showCloseButton={false}
        >
          <span className={styles.sheetHandle} aria-hidden />
          <section className={styles.sheetPane}>
            <DialogHeader className={styles.sheetHeader}>
              <DialogTitle className={styles.sheetTitle}>
                어느 역 근처의
                <br />
                공고를 찾으세요?
              </DialogTitle>
              <DialogDescription className={styles.sheetDesc}>
                역 이름을 입력하면 그 역 공고만 보여요.
              </DialogDescription>
            </DialogHeader>
            <div className={styles.stationSearch}>
              <Search
                className={styles.stationSearchIcon}
                size={18}
                strokeWidth={2.2}
                aria-hidden
              />
              <Input
                className={styles.stationSearchInput}
                placeholder="역 이름 검색"
                value={stationQuery}
                onChange={(e) => setStationQuery(e.target.value)}
              />
              {stationQuery ? (
                <button
                  type="button"
                  className={styles.stationSearchClear}
                  aria-label="검색어 지우기"
                  onClick={() => setStationQuery("")}
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
            <div className={styles.stationResults}>
              {!stationQuery.trim() ? (
                <p className={styles.stationHint}>
                  역 이름을 입력하면 바로 아래에서 고를 수 있어요
                </p>
              ) : stationSearchState === "error" ? (
                <p className={styles.stationHint}>역을 불러오지 못했어요.</p>
              ) : stationSearchState === "loading" &&
                stationSuggestions.length === 0 ? (
                <p className={styles.stationHint}>찾는 중</p>
              ) : stationSuggestions.length === 0 ? (
                <p className={styles.stationHint}>맞는 역이 없어요.</p>
              ) : (
                stationSuggestions.map((station) => {
                  const active = selectedStation === station.name;
                  return (
                    <button
                      key={`${station.region}-${station.name}-${station.lines.join(",")}`}
                      type="button"
                      className={cn(
                        styles.stationRow,
                        active && styles.stationRowOn,
                      )}
                      onClick={() => pickStation(station.name)}
                    >
                      <SubwayLineBadges lines={station.lines} />
                      <span className={styles.stationName}>{station.name}</span>
                      {active ? <Check size={16} strokeWidth={2.6} /> : null}
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </DialogContent>
      </Dialog>
    </section>
  );
}
