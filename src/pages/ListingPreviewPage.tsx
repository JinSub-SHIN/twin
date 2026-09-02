import { useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/ListingCard";
import { useAuth } from "@/context/AuthContext";
import { buildListingView } from "@/lib/listingView";
import { cn } from "@/lib/utils";
import styles from "./ListingPreviewPage.module.css";

export function ListingPreviewPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate("/profile", { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  const view = useMemo(() => (user ? buildListingView(user) : null), [user]);

  if (!view) return null;

  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <header className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            aria-label="뒤로"
            onClick={() => navigate("/profile/edit/prefs")}
          >
            <ArrowLeft size={20} strokeWidth={2.25} />
          </button>
          <h1 className={styles.topTitle}>살짝 공고 미리보기</h1>
          <span className={styles.previewBadge}>미리보기</span>
        </header>

        <ListingCard view={view} idPrefix="preview" />
      </div>

      <div className={styles.footer}>
        <Button
          type="button"
          variant="outline"
          className={cn(styles.submit, styles.submitSecondary)}
          size="lg"
          onClick={() => navigate("/profile/edit/prefs")}
        >
          정보 수정
        </Button>
        <Button
          type="button"
          className={styles.submit}
          size="lg"
          onClick={() =>
            navigate("/explore", {
              replace: true,
              state: { intent: "listed" },
            })
          }
        >
          이대로 올리기
        </Button>
      </div>
    </section>
  );
}
