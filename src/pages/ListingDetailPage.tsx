import { useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/ListingCard";
import { getListingById } from "@/lib/demoListings";
import { buildListingView } from "@/lib/listingView";
import { cn } from "@/lib/utils";
import styles from "./ListingPreviewPage.module.css";

export function ListingDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { listingId } = useParams<{ listingId: string }>();
  const listing = listingId ? getListingById(listingId) : null;
  const returnTo =
    (location.state as { returnTo?: string } | null)?.returnTo ?? "/explore";

  useEffect(() => {
    if (!listing) navigate(returnTo, { replace: true });
  }, [listing, navigate, returnTo]);

  const view = useMemo(
    () => (listing ? buildListingView(listing.user) : null),
    [listing],
  );

  if (!listing || !view) return null;

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

        <ListingCard view={view} idPrefix={listing.id} />
      </div>

      <div className={cn(styles.footer, styles.footerSingle)}>
        <Button type="button" className={styles.submit} size="lg">
          살짝 신청하기
        </Button>
      </div>
    </section>
  );
}
