import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { ChevronDown, MapPin, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ListingTeaserCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { countByCity, countByDistrict, filterListings } from "@/lib/demoListings";
import { buildListingSummary } from "@/lib/listingView";
import {
  REGION_CITIES,
  REGION_TREE,
  cityOfRegion,
  districtOfRegion,
  formatRegion,
} from "@/lib/regions";
import { cn } from "@/lib/utils";
import { COUNSELOR_IMG } from "@/pages/home/CounselorAvatar";
import styles from "./ExplorePage.module.css";

const PAGE_SIZE = 7;

function toggleRegion(current: string[], city: string, district: string) {
  const value =
    district === "전체" ? `${city} 전체` : formatRegion(city, district);
  const inCity = current.filter((item) => cityOfRegion(item) === city);
  const others = current.filter((item) => cityOfRegion(item) !== city);

  if (district === "전체") {
    if (inCity.some((item) => districtOfRegion(item) === "전체")) return others;
    return [...others, value];
  }

  const withoutAll = inCity.filter((item) => districtOfRegion(item) !== "전체");
  if (withoutAll.includes(value)) {
    return [...others, ...withoutAll.filter((item) => item !== value)];
  }
  return [...others, ...withoutAll, value];
}

export function ExplorePage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const selectedRegions = params.getAll("regions");
  const [open, setOpen] = useState(false);
  const [draftCity, setDraftCity] = useState<string | null>(null);
  const [draftRegions, setDraftRegions] = useState<string[]>([]);

  const cityCounts = useMemo(() => countByCity(), []);
  const districtCounts = useMemo(
    () => (draftCity ? countByDistrict(draftCity) : {}),
    [draftCity],
  );
  const districts = draftCity ? ["전체", ...(REGION_TREE[draftCity] ?? [])] : [];

  const listings = useMemo(
    () =>
      filterListings(selectedRegions).map((item) => ({
        id: item.id,
        summary: buildListingSummary(item.user),
      })),
    [selectedRegions],
  );
  const filterKey = params.toString();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingRef = useRef(false);
  const armedRef = useRef(true);
  const hasMoreRef = useRef(false);
  const totalRef = useRef(0);

  const visibleListings = listings.slice(0, visibleCount);
  const hasMore = visibleCount < listings.length;
  hasMoreRef.current = hasMore;
  totalRef.current = listings.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setLoadingMore(false);
    loadingRef.current = false;
    armedRef.current = true;
  }, [filterKey]);

  useEffect(() => {
    const root = document.querySelector("main");
    if (!root) return;

    const atBottom = () =>
      root.scrollTop + root.clientHeight >= root.scrollHeight - 28;

    let timer = 0;
    const loadMore = () => {
      if (loadingRef.current || !hasMoreRef.current || !armedRef.current) return;
      loadingRef.current = true;
      armedRef.current = false;
      setLoadingMore(true);
      timer = window.setTimeout(() => {
        setVisibleCount((count) =>
          Math.min(count + PAGE_SIZE, totalRef.current),
        );
        setLoadingMore(false);
        loadingRef.current = false;
      }, 650);
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
      window.clearTimeout(timer);
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
    const first = selectedRegions[0];
    setDraftCity(first ? cityOfRegion(first) : null);
    setDraftRegions(selectedRegions);
    setOpen(true);
  }

  function applyFilter() {
    const next = new URLSearchParams();
    for (const region of draftRegions) next.append("regions", region);
    setParams(next);
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

  const previewListings = visibleListings.slice(0, 2);
  const restListings = visibleListings.slice(2);

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
              공고 <em>{listings.length}</em>개
            </p>
          </div>

          {previewListings.length > 0 ? (
            previewListings.map((item) => (
              <ListingTeaserCard
                key={item.id}
                summary={item.summary}
                onClick={() => openListing(item.id)}
              />
            ))
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>아직 이 지역 공고가 없어요</p>
              <p className={styles.emptyDesc}>다른 구/시를 골라보면 찾을 수 있어요.</p>
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
        {hasMore || loadingMore ? (
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
        <DialogContent className={styles.dialogContent} showCloseButton>
          <DialogHeader className={styles.dialogHeader}>
            <DialogTitle className={styles.dialogTitle}>지역 선택</DialogTitle>
            <DialogDescription className={styles.dialogDesc}>
              여러 지역을 함께 고를 수 있어요.
            </DialogDescription>
          </DialogHeader>

          <div className={styles.dialogBody}>
            <section className={styles.dialogCard}>
              <p className={styles.dialogLabel}>광역</p>
              <div className={styles.chipRow}>
                {REGION_CITIES.map((item) => {
                  const count = cityCounts[item] ?? 0;
                  const picked = draftRegions.some(
                    (region) => cityOfRegion(region) === item,
                  );
                  return (
                    <button
                      key={item}
                      type="button"
                      disabled={count === 0}
                      className={cn(
                        styles.modalChip,
                        draftCity === item && styles.modalChipFocus,
                        picked && styles.modalChipActive,
                      )}
                      onClick={() => setDraftCity(item)}
                    >
                      {item}
                      <span className={styles.modalChipCount}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={styles.dialogCard}>
              <p className={styles.dialogLabel}>
                {draftCity ? `${draftCity} 구/시` : "구/시"}
              </p>
              {draftCity ? (
                <div className={styles.chipRow}>
                  {districts.map((item) => {
                    const count =
                      item === "전체"
                        ? (cityCounts[draftCity] ?? 0)
                        : (districtCounts[item] ?? 0);
                    const value =
                      item === "전체"
                        ? `${draftCity} 전체`
                        : formatRegion(draftCity, item);
                    const active = draftRegions.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={count === 0}
                        className={cn(
                          styles.modalChip,
                          active && styles.modalChipActive,
                        )}
                        onClick={() =>
                          setDraftRegions((prev) =>
                            toggleRegion(prev, draftCity, item),
                          )
                        }
                      >
                        {item === "전체" ? `${draftCity} 전체` : item}
                        <span className={styles.modalChipCount}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.dialogGuide}>
                  먼저 위에서 광역을 선택해 주세요.
                </p>
              )}
            </section>

            {draftRegions.length > 0 ? (
              <section className={styles.dialogCard}>
                <p className={styles.dialogLabel}>선택한 지역</p>
                <div className={styles.selectedWrap}>
                  {draftRegions.map((region) => (
                    <button
                      key={region}
                      type="button"
                      className={styles.selectedChip}
                      onClick={() =>
                        setDraftRegions((prev) =>
                          prev.filter((item) => item !== region),
                        )
                      }
                    >
                      {region}
                      <X size={12} strokeWidth={2.4} />
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className={styles.dialogFooter}>
            <Button
              type="button"
              className={styles.applyBtn}
              size="lg"
              onClick={applyFilter}
            >
              {draftRegions.length > 0
                ? `${draftRegions.length}개 지역 적용`
                : "전체 지역 보기"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
