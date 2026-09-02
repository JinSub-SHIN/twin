import { useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { NO_NEARBY_STATION } from "@/lib/stations";
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

function formatWon(amount?: number | null) {
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

function shareMinePercent(share?: CostShare) {
  if (!share?.mode) return null;
  if (share.mode === "half") return 50;
  if (share.mode === "custom" && share.percent != null && share.percent > 0) {
    const mate = Math.min(99, Math.max(1, share.percent));
    return 100 - mate;
  }
  return null;
}

type CostChart = {
  key: "rent" | "mgmt";
  label: string;
  totalLabel: string | null;
  myPercent: number | null;
  negotiated: boolean;
  myAmountLabel: string | null;
  mateAmountLabel: string | null;
};

function buildCostChart(
  key: CostChart["key"],
  label: string,
  amount: number | undefined,
  share?: CostShare,
): CostChart | null {
  const myPercent = shareMinePercent(share);
  const negotiated = share?.mode === "negotiate";
  const totalLabel = formatWon(amount);
  if (!totalLabel && myPercent == null && !negotiated) return null;

  const mineWon =
    amount && myPercent != null
      ? Math.round((amount * myPercent) / 100)
      : null;
  const mateWon = amount && mineWon != null ? amount - mineWon : null;

  return {
    key,
    label,
    totalLabel,
    myPercent,
    negotiated,
    myAmountLabel: formatWon(mineWon),
    mateAmountLabel: formatWon(mateWon),
  };
}

function CostSplitChart({ chart }: { chart: CostChart }) {
  const matePercent =
    chart.myPercent != null ? 100 - chart.myPercent : null;
  const aria = [
    chart.label,
    chart.totalLabel ? `지금 ${chart.totalLabel}` : null,
    chart.negotiated
      ? "분담은 직접 조율"
      : chart.myPercent != null
        ? `나는 ${chart.myPercent}%${chart.myAmountLabel ? ` ${chart.myAmountLabel}` : ""}, 살짝은 ${matePercent}%${chart.mateAmountLabel ? ` ${chart.mateAmountLabel}` : ""}`
        : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className={styles.costCard} aria-label={aria}>
      <div className={styles.costCopy}>
        <p className={styles.costLabel}>{chart.label}</p>
        {chart.totalLabel ? (
          <>
            <p className={styles.costTotal}>{chart.totalLabel}</p>
            <p className={styles.costHint}>지금 내고 있는 금액이에요</p>
          </>
        ) : (
          <p className={styles.costHint}>분담 비율이에요</p>
        )}
      </div>

      {chart.negotiated ? (
        <div className={styles.negotiateBar}>분담은 만나서 조율해요</div>
      ) : chart.myPercent != null && matePercent != null ? (
        <>
          <div className={styles.splitBar} aria-hidden>
            <span
              className={styles.splitMe}
              style={{ flexGrow: chart.myPercent, flexBasis: 0 }}
            >
              {chart.myPercent >= 28 ? `${chart.myPercent}%` : ""}
            </span>
            <span
              className={styles.splitMate}
              style={{ flexGrow: matePercent, flexBasis: 0 }}
            >
              {matePercent >= 28 ? `${matePercent}%` : ""}
            </span>
          </div>
          <div className={styles.splitLegend}>
            <span className={styles.legendMe}>
              <i className={styles.legendDotMe} />
              나 {chart.myAmountLabel ?? `${chart.myPercent}%`}
            </span>
            <span className={styles.legendMate}>
              살짝 {chart.mateAmountLabel ?? `${matePercent}%`}
              <i className={styles.legendDotMate} />
            </span>
          </div>
        </>
      ) : null}
    </article>
  );
}

function formatHour(hour?: number) {
  if (hour == null) return null;
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  if (m > 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return `${h}시`;
}

function formatNearbyStation(station?: string) {
  const value = station?.trim();
  if (!value || value === NO_NEARBY_STATION) return null;
  const withSuffix = value.endsWith("역") ? value : `${value}역`;
  return withSuffix;
}

function buildHeadline(user: UserProfile) {
  const region = user.pref?.regions?.[0];
  const station = formatNearbyStation(user.pref?.nearestStation);
  if (region && station) return `${region}(${station} 인근)`;
  if (region) return region;
  if (station) return `${station} 인근`;
  return "살짝 공고";
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
    const prefGender = user.pref?.prefGender;
    const headline = buildHeadline(user);
    const charts = [
      buildCostChart("rent", "월세", user.pref?.rentAmount, user.pref?.rentShare),
      buildCostChart(
        "mgmt",
        "관리비",
        user.pref?.mgmtAmount,
        user.pref?.mgmtShare,
      ),
    ].filter((item): item is CostChart => Boolean(item));

    return {
      headline,
      nickname: user.nickname,
      initial: user.nickname.trim().slice(0, 1) || "ㅅ",
      photoUrl: user.photoUrl,
      meta,
      charts,
      prefGender,
      lifestyle: buildLifestyleChips(user),
      hardNos: buildHardNos(user),
      bio: user.bio?.trim() || "",
    };
  }, [user]);

  if (!view) return null;

  const hasStats = view.charts.length > 0;

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
          <h2 className={styles.headline}>{view.headline}</h2>

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

        {view.prefGender ? (
          <section className={styles.section} aria-labelledby="pref-title">
            <header className={styles.sectionHead}>
              <h3 id="pref-title" className={styles.sectionTitle}>
                선호 살짝
              </h3>
            </header>
            <article
              className={styles.costCard}
              aria-label={`선호 살짝 ${optionLabel(PREF_GENDER_OPTIONS, view.prefGender)}`}
            >
              <div className={styles.prefOptions}>
                {PREF_GENDER_OPTIONS.map((opt) => (
                  <span
                    key={opt.value}
                    className={cn(
                      styles.prefOption,
                      view.prefGender === opt.value && styles.prefOptionActive,
                    )}
                  >
                    {opt.label}
                  </span>
                ))}
              </div>
            </article>
          </section>
        ) : null}

        {hasStats ? (
          <section className={styles.section} aria-labelledby="housing-title">
            <header className={styles.sectionHead}>
              <h3 id="housing-title" className={styles.sectionTitle}>
                주거 조건
              </h3>
              <p className={styles.sectionDesc}>
                지금 내는 금액과, 살짝이 나눌 분담이에요
              </p>
            </header>
            <div className={styles.costCharts}>
              {view.charts.map((chart) => (
                <CostSplitChart key={chart.key} chart={chart} />
              ))}
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
            <article className={styles.costCard}>
              <div className={styles.factWrap}>
                {view.lifestyle.map((chip) => (
                  <span key={chip} className={styles.prefOption}>
                    {chip}
                  </span>
                ))}
              </div>
            </article>
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
            <article className={styles.costCard}>
              <div className={styles.factWrap}>
                {view.hardNos.map((item) => (
                  <span key={item} className={styles.prefOptionHard}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby="bio-title">
          <header className={styles.sectionHead}>
            <h3 id="bio-title" className={styles.sectionTitle}>
              한마디
            </h3>
            <p className={styles.sectionDesc}>살짝에게 전하는 소개예요</p>
          </header>
          <article className={styles.costCard}>
            {view.bio ? (
              <p className={styles.bio}>{view.bio}</p>
            ) : (
              <p className={styles.bioEmpty}>
                아직 소개 글이 없어요. 프로필에서 한마디를 적어보면 매칭이 더
                자연스러워져요.
              </p>
            )}
          </article>
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
