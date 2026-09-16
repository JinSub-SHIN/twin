import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Info } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  LISTING_HOST_CONSENT_ITEMS,
  type ListingHostConsentItem,
  type ListingHostConsentSegment,
} from "@/lib/listingHostConsent";
import { cn } from "@/lib/utils";
import type { SeekRole } from "@/types/user";
import styles from "./ListingHostConsentPage.module.css";

type LocationState = {
  prevRole?: SeekRole | null;
  resumeStep?: number;
};

function ConsentText({ segments }: { segments: ListingHostConsentSegment[] }) {
  return (
    <p className={styles.noticeText}>
      {segments.map((segment, index) =>
        segment.emphasis ? (
          <strong key={index} className={styles.noticeEmphasis}>
            {segment.text}
          </strong>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </p>
  );
}

function ConfirmedNoticeCard({
  item,
  stepIndex,
}: {
  item: ListingHostConsentItem;
  stepIndex: number;
}) {
  const total = LISTING_HOST_CONSENT_ITEMS.length;

  return (
    <article className={cn(styles.noticeCard, styles.noticeCardDone)}>
      <div className={styles.noticeHead}>
        <div className={styles.noticeHeadRow}>
          <span className={styles.noticeStepDone}>
            확인 {stepIndex + 1} / {total}
          </span>
          <span className={styles.confirmedBadge}>
            <Check className="size-3.5" strokeWidth={2.8} aria-hidden />
            확인 완료
          </span>
        </div>
        <h2 className={styles.noticeTitle}>{item.title}</h2>
      </div>
      <ConsentText segments={item.segments} />
      <p className={styles.confirmedFoot}>위 내용을 확인했습니다</p>
    </article>
  );
}

function scrollBodyToElement(
  container: HTMLElement,
  element: HTMLElement,
  offset = 16,
) {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const nextTop =
    container.scrollTop + (elementRect.top - containerRect.top) - offset;
  container.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
}

function ConsentNoticeCard({
  item,
  stepIndex,
  cardId,
  onConfirm,
}: {
  item: ListingHostConsentItem;
  stepIndex: number;
  cardId: string;
  onConfirm: () => void;
}) {
  const total = LISTING_HOST_CONSENT_ITEMS.length;

  return (
    <article id={cardId} className={styles.noticeCard}>
      <div className={styles.noticeHead}>
        <span className={styles.noticeStep}>
          확인 {stepIndex + 1} / {total}
        </span>
        <h2 className={styles.noticeTitle}>{item.title}</h2>
      </div>
      <ConsentText segments={item.segments} />
      <Button
        type="button"
        className={styles.stepConfirm}
        size="lg"
        onClick={onConfirm}
      >
        위 내용을 확인했습니다
      </Button>
    </article>
  );
}

export function ListingHostConsentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(0);

  const locationState = location.state as LocationState | null;
  const prevRole = locationState?.prevRole;

  const totalSteps = LISTING_HOST_CONSENT_ITEMS.length;
  const allConfirmed = currentStep >= totalSteps;
  const progressPct = allConfirmed
    ? 100
    : Math.round(((currentStep + 1) / totalSteps) * 100);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate("/profile", { replace: true });
      return;
    }
    if (user.pref?.seekRole !== "has_room") {
      navigate("/profile/edit/role", { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  useEffect(() => {
    const resume = locationState?.resumeStep;
    if (typeof resume === "number" && resume >= 0 && resume <= totalSteps) {
      setCurrentStep(resume);
      prevStepRef.current = resume;
      return;
    }
    setCurrentStep(0);
    prevStepRef.current = 0;
  }, [location.key, locationState?.resumeStep, totalSteps]);

  useEffect(() => {
    if (currentStep <= prevStepRef.current) {
      prevStepRef.current = currentStep;
      return;
    }

    const container = bodyRef.current;
    if (!container) {
      prevStepRef.current = currentStep;
      return;
    }

    const scrollId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (allConfirmed) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
          return;
        }
        const target = document.getElementById(`consent-step-${currentStep}`);
        if (target) scrollBodyToElement(container, target);
      });
    });

    prevStepRef.current = currentStep;
    return () => window.cancelAnimationFrame(scrollId);
  }, [currentStep, allConfirmed]);

  const handleBack = () => {
    if (!user) return;
    updateUser({
      pref: {
        ...user.pref,
        seekRole: prevRole ?? undefined,
      },
    });
    navigate("/profile/edit/role");
  };

  const handleStepConfirm = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    navigate("/profile/edit/region");
  };

  if (!isLoggedIn || !user || user.pref?.seekRole !== "has_room") return null;

  return (
    <section className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.navRow}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBack}
            aria-label="뒤로"
          >
            <ArrowLeft className="size-5" strokeWidth={2.1} />
          </button>
          <p className={styles.stepLabel}>공고 등록 확인</p>
          <span aria-hidden />
        </div>
        <div
          className={styles.progress}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
          aria-label="확인 진행"
        >
          <span
            className={cn(
              styles.progressFill,
              allConfirmed && styles.progressFillDone,
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <div ref={bodyRef} className={styles.body}>
        <div className={styles.infoBanner} role="note">
          <Info className={styles.infoIcon} aria-hidden />
          <div className={styles.infoBody}>
            <p className={styles.infoTitle}>등록 전 확인해 주세요</p>
            <p className={styles.infoDesc}>
              아래 내용을 순서대로 읽고, 각 항목마다 확인 버튼을 눌러 주세요.
              모든 항목을 확인해야 공고 등록을 진행할 수 있습니다.
            </p>
          </div>
        </div>

        <div className={styles.noticeList}>
          {LISTING_HOST_CONSENT_ITEMS.map((item, index) => {
            if (index < currentStep) {
              return (
                <ConfirmedNoticeCard
                  key={item.key}
                  item={item}
                  stepIndex={index}
                />
              );
            }
            if (index === currentStep && !allConfirmed) {
              return (
                <ConsentNoticeCard
                  key={item.key}
                  item={item}
                  stepIndex={index}
                  cardId={`consent-step-${index}`}
                  onConfirm={handleStepConfirm}
                />
              );
            }
            if (allConfirmed) {
              return (
                <ConfirmedNoticeCard
                  key={item.key}
                  item={item}
                  stepIndex={index}
                />
              );
            }
            return null;
          })}
        </div>
      </div>

      <div id="consent-submit-dock" className={styles.submitDock}>
        <Button
          type="button"
          className={styles.submit}
          size="lg"
          disabled={!allConfirmed}
          onClick={handleContinue}
        >
          다음
        </Button>
      </div>
    </section>
  );
}
