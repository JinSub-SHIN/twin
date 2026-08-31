import { useEffect, useMemo } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  CLEAN_FREQ_OPTIONS,
  DRINK_OPTIONS,
  HOME_TIME_OPTIONS,
  JOB_OPTIONS,
  PERSONALITY_OPTIONS,
  PET_KIND_OPTIONS,
  PREF_GENDER_OPTIONS,
  SMOKING_OPTIONS,
  getAgeGroup,
  type CostShare,
  type UserProfile,
} from "@/types/user";
import styles from "./ListingPreviewPage.module.css";

const GENDER_LABEL: Record<string, string> = {
  male: "남성",
  female: "여성",
  other: "기타",
};

function optionLabel<T extends string>(
  options: { value: T; label: string }[],
  value: T | undefined,
) {
  return options.find((o) => o.value === value)?.label;
}

function formatShare(share?: CostShare) {
  if (!share?.mode) return null;
  if (share.mode === "half") return "1/2";
  if (share.mode === "negotiate") return "직접 조율";
  if (share.mode === "custom" && share.percent != null) {
    return `내가 ${share.percent}%`;
  }
  return "직접 입력";
}

function formatWon(amount?: number) {
  if (amount == null || amount <= 0) return null;
  if (amount >= 10000) {
    const man = amount / 10000;
    const text = Number.isInteger(man)
      ? `${man}`
      : man.toFixed(1).replace(/\.0$/, "");
    return `${text}만원`;
  }
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatHour(hour?: number) {
  if (hour == null) return null;
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  if (m > 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return `${h}시`;
}

function buildHeadline(user: UserProfile) {
  const region = user.pref?.regions?.[0];
  if (region) return `${region}에서 살짝 구해요.`;
  return "같이 살 살짝을 구해요.";
}

function buildLifestyleChips(user: UserProfile) {
  const p = user.pref;
  if (!p) return [] as string[];
  const chips: string[] = [];

  const sleep = formatHour(p.sleepHour);
  const wake = formatHour(p.wakeHour);
  if (sleep && wake) chips.push(`${sleep} 취침 · ${wake} 기상`);
  else if (sleep) chips.push(`${sleep} 취침`);
  else if (wake) chips.push(`${wake} 기상`);

  const personality = optionLabel(PERSONALITY_OPTIONS, p.personality);
  if (personality) chips.push(`성격 ${personality}`);

  const home = optionLabel(HOME_TIME_OPTIONS, p.homeTime);
  if (home) chips.push(`집 체류 ${home}`);

  const clean = optionLabel(CLEAN_FREQ_OPTIONS, p.cleanFreq);
  if (clean) chips.push(`청소 ${clean}`);

  const drink = optionLabel(DRINK_OPTIONS, p.drinkFreq);
  if (drink) chips.push(`음주 ${drink}`);

  const smoking = optionLabel(SMOKING_OPTIONS, p.smokingType);
  if (smoking) chips.push(`흡연 ${smoking}`);

  if (p.pet) {
    const kind =
      p.petInfo?.kind === "other"
        ? p.petInfo.kindOther || "반려동물"
        : optionLabel(PET_KIND_OPTIONS, p.petInfo?.kind) || "반려동물";
    chips.push(`${kind} 함께`);
  }

  if (p.wfh) chips.push("재택 근무");

  return chips;
}

function buildHardNos(user: UserProfile) {
  const p = user.pref;
  if (!p) return [] as string[];
  const items: string[] = [];
  if (p.noSmoker) items.push("흡연");
  if (p.noDrink) items.push("음주");
  if (p.noPet) items.push("반려동물");
  return items;
}

export function ListingPreviewPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate("/profile", { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  const view = useMemo(() => {
    if (!user) return null;
    const job =
      user.job === "other"
        ? user.jobOther?.trim() || "기타"
        : optionLabel(JOB_OPTIONS, user.job);
    const ageGroup = getAgeGroup(user.birthDate);
    const gender = GENDER_LABEL[user.gender] ?? "";
    const meta = [ageGroup, gender, job].filter(Boolean).join(" · ");
    const regions = user.pref?.regions ?? [];
    const rentAmount = formatWon(user.pref?.rentAmount);
    const mgmtAmount = formatWon(user.pref?.mgmtAmount);
    const rentShare = formatShare(user.pref?.rentShare);
    const mgmtShare = formatShare(user.pref?.mgmtShare);
    const prefGender = optionLabel(PREF_GENDER_OPTIONS, user.pref?.prefGender);

    return {
      headline: buildHeadline(user),
      nickname: user.nickname,
      initial: user.nickname.trim().slice(0, 1) || "ㅅ",
      photoUrl: user.photoUrl,
      meta,
      regions,
      rentAmount,
      mgmtAmount,
      rentShare,
      mgmtShare,
      prefGender,
      lifestyle: buildLifestyleChips(user),
      hardNos: buildHardNos(user),
      bio: user.bio?.trim() || "",
    };
  }, [user]);

  if (!view) return null;

  const hasStats =
    Boolean(view.rentAmount || view.rentShare) ||
    Boolean(view.mgmtAmount || view.mgmtShare) ||
    Boolean(view.prefGender);

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
          <span className={styles.topTitle}>살짝 공고 미리보기</span>
          <span className={styles.previewBadge}>미리보기</span>
        </header>

        <article className={styles.cover}>
          <div className={styles.coverWash} aria-hidden />
          <div className={styles.coverHead}>
            <p className={styles.coverEyebrow}>살짝 공고</p>
            <h1 className={styles.coverTitle}>{view.headline}</h1>
            {view.regions.length > 0 ? (
              <p className={styles.coverRegion}>
                <MapPin size={14} strokeWidth={2.4} aria-hidden />
                <span>{view.regions.join(" · ")}</span>
              </p>
            ) : null}
          </div>

          <div className={styles.hostRow}>
            <div className={styles.avatar} aria-hidden>
              {view.photoUrl ? (
                <img src={view.photoUrl} alt="" className={styles.avatarImg} />
              ) : (
                <span>{view.initial}</span>
              )}
            </div>
            <div className={styles.hostText}>
              <p className={styles.hostName}>{view.nickname}</p>
              {view.meta ? <p className={styles.hostMeta}>{view.meta}</p> : null}
            </div>
          </div>

          {hasStats ? (
            <div className={styles.stats}>
              {view.rentAmount || view.rentShare ? (
                <div className={styles.stat}>
                  <span className={styles.statLabel}>월세</span>
                  <span className={styles.statValue}>
                    {view.rentAmount ?? view.rentShare}
                  </span>
                  {view.rentAmount && view.rentShare ? (
                    <span className={styles.statSub}>분담 {view.rentShare}</span>
                  ) : null}
                </div>
              ) : null}
              {view.mgmtAmount || view.mgmtShare ? (
                <div className={styles.stat}>
                  <span className={styles.statLabel}>관리비</span>
                  <span className={styles.statValue}>
                    {view.mgmtAmount ? `평균 ${view.mgmtAmount}` : view.mgmtShare}
                  </span>
                  {view.mgmtAmount && view.mgmtShare ? (
                    <span className={styles.statSub}>분담 {view.mgmtShare}</span>
                  ) : null}
                </div>
              ) : null}
              {view.prefGender ? (
                <div className={styles.stat}>
                  <span className={styles.statLabel}>선호 성별</span>
                  <span className={styles.statValue}>{view.prefGender}</span>
                </div>
              ) : null}
            </div>
          ) : null}
        </article>

        <div className={styles.sections}>
          {view.lifestyle.length > 0 ? (
            <section className={styles.panel}>
              <header className={styles.panelHead}>
                <h2 className={styles.panelTitle}>생활 리듬</h2>
                <p className={styles.panelDesc}>평소 생활 패턴이에요</p>
              </header>
              <div className={styles.chips}>
                {view.lifestyle.map((chip) => (
                  <span key={chip} className={styles.chip}>
                    {chip}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {view.hardNos.length > 0 ? (
            <section className={cn(styles.panel, styles.panelWarn)}>
              <header className={styles.panelHead}>
                <h2 className={styles.panelTitle}>함께하기 어려운 점</h2>
                <p className={styles.panelDesc}>이 부분은 맞춰주기 어려워요</p>
              </header>
              <div className={styles.chips}>
                {view.hardNos.map((item) => (
                  <span key={item} className={cn(styles.chip, styles.chipWarn)}>
                    {item}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className={cn(styles.panel, styles.panelBio)}>
            <header className={styles.panelHead}>
              <h2 className={styles.panelTitle}>한마디</h2>
              <p className={styles.panelDesc}>살짝에게 전하는 소개예요</p>
            </header>
            {view.bio ? (
              <p className={styles.bio}>{view.bio}</p>
            ) : (
              <p className={styles.bioEmpty}>
                아직 소개 글이 없어요. 프로필에서 한마디를 적어보면 매칭이 더
                자연스러워져요.
              </p>
            )}
          </section>
        </div>
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
