import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/ui/card";
import { GenderLockDialog } from "@/components/ui/dialog";
import { roomDetailToView } from "@/lib/roomListing";
import type { ListingView } from "@/lib/listingView";
import { cn } from "@/lib/utils";
import { getRoom } from "@/service/room";
import styles from "@/pages/regist/ListingPreviewPage.module.css";

export function ListingDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { listingId } = useParams<{ listingId: string }>();
  const returnTo =
    (location.state as { returnTo?: string } | null)?.returnTo ?? "/explore";
  const [view, setView] = useState<ListingView | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [failedId, setFailedId] = useState<string | null>(null);
  const currentView = loadedId === listingId ? view : null;
  const failed = Boolean(listingId) && failedId === listingId;

  useEffect(() => {
    if (!listingId) {
      navigate(returnTo, { replace: true });
      return;
    }

    let cancelled = false;
    void getRoom(listingId)
      .then((room) => {
        if (cancelled) return;
        setView(roomDetailToView(room));
        setLocked(Boolean(room.locked));
        setLoadedId(listingId);
      })
      .catch(() => {
        if (!cancelled) setFailedId(listingId);
      });

    return () => {
      cancelled = true;
    };
  }, [listingId, navigate, returnTo]);

  useEffect(() => {
    if (failed) navigate(returnTo, { replace: true });
  }, [failed, navigate, returnTo]);

  if (!currentView) return null;

  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <header className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            aria-label="뒤로"
            onClick={() => navigate(returnTo)}
          >
            <ArrowLeft size={20} strokeWidth={2.25} />
          </button>
          <h1 className={styles.topTitle}>살짝 공고</h1>
        </header>

        <div className={locked ? styles.lockedSheet : undefined}>
          <ListingCard view={currentView} idPrefix={listingId ?? "listing"} />
        </div>

        {locked ? null : (
          <div className={cn(styles.footer, styles.footerSingle, styles.footerInContent)}>
            <Button type="button" className={styles.submit} size="lg">
              살짝 신청하기
            </Button>
          </div>
        )}
      </div>

      <GenderLockDialog
        open={locked}
        onOpenChange={(open) => {
          if (!open) navigate(returnTo);
        }}
      />
    </section>
  );
}
