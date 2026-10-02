import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowLeft, Check, ChevronDown, MapPin, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ListingTeaserCard } from "@/components/ui/card";
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
import { getRoomList } from "@/service/room";
import { ApiError } from "@/service/http";
import styles from "./ExplorePage.module.css";

const PAGE_SIZE = 7;

type ListingRow = {
  id: string;
  summary: ListingSummary;
};

async function fetchListingPage(
  regions: string[],
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
  const [open, setOpen] = useState(false);
  const [sheetStep, setSheetStep] = useState<"city" | "district">("city");
  const [draftCity, setDraftCity] = useState<string | null>(null);
  const currentCity = cityOfRegion(selectedRegions[0]);

  const districts = draftCity
    ? ["전체", ...(REGION_TREE[draftCity] ?? [])]
    : [];
  const regionKey = selectedRegions.join("|");

  const [rows, setRows] = useState<ListingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const ready = loadedKey === regionKey;
  const visibleRows = ready ? rows : [];
  const visibleError = ready ? error : "";
  const visibleHasMore = ready && hasMore;
  const loading = !ready;
  const listingCount = usesServerTotal(selectedRegions)
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

  useEffect(() => {
    const generation = ++generationRef.current;
    const regions = regionKey ? regionKey.split("|") : [];
    regionsRef.current = regions;
    nextPageRef.current = 1;
    hasMoreRef.current = false;
    loadingRef.current = true;
    armedRef.current = true;

    void (async () => {
      try {
        const result = await fetchListingPage(regions, 1, () => {
          return generationRef.current !== generation;
        });
        if (!result || generationRef.current !== generation) return;
        setRows(result.rows);
        setTotal(result.total);
        setHasMore(result.hasMore);
        setError("");
        hasMoreRef.current = result.hasMore;
        nextPageRef.current = result.nextPage;
        setLoadedKey(regionKey);
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
        setLoadedKey(regionKey);
      } finally {
        if (generationRef.current === generation) {
          loadingRef.current = false;
        }
      }
    })();
  }, [regionKey]);

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
    setParams({});
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
        </div>
      </div>

      <div className={styles.feed}>
        <div className={styles.tourSpot} data-tour="explore">
          <div className={styles.feedHead}>
            <p className={styles.feedPlace}>
              {selectedRegions.length > 0 ? filterLabel : "전체 지역"}
            </p>
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
                {selectedRegions.length > 0 ? (
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
                {selectedRegions.length > 0
                  ? "다른 지역을 골라보면 찾을 수 있어요."
                  : "조금만 기다리면 새 공고가 올라올 거예요."}
              </p>
              {selectedRegions.length > 0 ? (
                <button
                  type="button"
                  className={styles.emptyAction}
                  onClick={openFilter}
                >
                  다른 지역 보기
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
    </section>
  );
}
