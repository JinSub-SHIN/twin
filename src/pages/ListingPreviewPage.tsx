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
  if (region) {
    return { lead: `${region}에서`, action: "살짝 구해요." };
  }
  return { lead: "같이 살", action: "살짝을 구해요." };
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
    const headline = buildHeadline(user);

    return {
      headline,
      nickname: user.nickname,
      initial: user.nickname.trim().slice(0, 1) || "ㅅ",
      photoUrl: user.photoUrl,
      meta,
      gender,
      regions,
      rentAmount,
      mgmtAmount,
      rentShare,
      mgmtShare,
      prefGender,
      lifestyle: buildLifestyleChips(user),
      hardNos: buildHardNos(user),
      bio: user.bio?.trim() || "",
      roomType:
        user.pref?.seekRole === "has_room"
          ? "방 있음"
          : user.pref?.seekRole === "needs_room"
            ? "방 구함"
            : null,
    };
  }, [user]);

  if (!view) return null;

  const hasStats =
    Boolean(view.rentAmount || view.rentShare) ||
    Boolean(view.mgmtAmount || view.mgmtShare) ||
    Boolean(view.prefGender);

  const metaBits = [
    view.regions[0],
    view.roomType,
    view.gender || null,
  ].filter((bit): bit is string => Boolean(bit));

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

        <section className={styles.hero}>
          <p className={styles.eyebrow}>살짝 공고</p>
          <h2 className={styles.headline}>
            <span className={styles.headlineLead}>{view.headline.lead}</span>
            <span className={styles.headlineAction}>{view.headline.action}</span>
          </h2>

          {metaBits.length > 0 ? (
            <ul className={styles.metaRow}>
              {metaBits.map((bit) => (
                <li key={bit} className={styles.metaItem}>
                  {bit === view.regions[0] ? (
                    <>
                      <MapPin size={12} strokeWidth={2.4} aria-hidden />
                      <span>{bit}</span>
                    </>
                  ) : (
                    bit
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          <div className={styles.host}>
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
        </section>

        {hasStats ? (
          <section className={styles.section} aria-labelledby="housing-title">
            <header className={styles.sectionHead}>
              <h3 id="housing-title" className={styles.sectionTitle}>
                주거 조건
              </h3>
            </header>
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
                    {view.mgmtAmount
                      ? `평균 ${view.mgmtAmount}`
                      : view.mgmtShare}
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
          </section>
        ) : null}

        {view.lifestyle.length > 0 ? (
          <section className={styles.section} aria-labelledby="life-title">
            <header className={styles.sectionHead}>
              <h3 id="life-title" className={styles.sectionTitle}>
                생활 리듬
              </h3>
              <p className={styles.sectionDesc}>평소 생활 패턴이에요</p>
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
          <section className={styles.section} aria-labelledby="hard-title">
            <header className={styles.sectionHead}>
              <h3 id="hard-title" className={styles.sectionTitle}>
                함께하기 어려운 점
              </h3>
              <p className={styles.sectionDesc}>이 부분은 맞춰주기 어려워요</p>
            </header>
            <div className={styles.chips}>
              {view.hardNos.map((item) => (
                <span key={item} className={cn(styles.chip, styles.chipHard)}>
                  {item}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby="bio-title">
          <header className={styles.sectionHead}>
            <h3 id="bio-title" className={styles.sectionTitle}>
              한마디
            </h3>
            <p className={styles.sectionDesc}>살짝에게 전하는 소개예요</p>
          </header>
          {view.bio ? (
            <blockquote className={styles.bio}>{view.bio}</blockquote>
          ) : (
            <p className={styles.bioEmpty}>
              아직 소개 글이 없어요. 프로필에서 한마디를 적어보면 매칭이 더
              자연스러워져요.
            </p>
          )}
        </section>
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
