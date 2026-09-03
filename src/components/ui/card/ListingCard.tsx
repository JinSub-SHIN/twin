import {
  buildMateBurden,
  type CostChart,
  type ListingView,
} from "@/lib/listingView";
import styles from "@/pages/regist/ListingPreviewPage.module.css";

function CostSplitChart({ chart }: { chart: CostChart }) {
  const aria = [
    chart.label,
    chart.mateAmountLabel ? `살짝 ${chart.mateAmountLabel}` : null,
    chart.totalLabel ? `전체 ${chart.totalLabel}` : null,
    chart.negotiated ? "분담은 직접 조율" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className={styles.costCard} aria-label={aria}>
      <div className={styles.costCopy}>
        <p className={styles.costLabel}>살짝 {chart.label}</p>
        {chart.negotiated ? (
          <>
            <p className={styles.costTotal}>조율</p>
            <p className={styles.costHint}>
              {chart.totalLabel
                ? `전체 ${chart.totalLabel} · 분담은 만나서 맞춰요`
                : "분담은 만나서 맞춰요"}
            </p>
          </>
        ) : chart.mateAmountLabel ? (
          <>
            <p className={styles.costTotal}>{chart.mateAmountLabel}</p>
            <p className={styles.costHint}>
              {chart.totalLabel
                ? `전체 ${chart.totalLabel} 중 살짝 부담`
                : "살짝이 낼 금액이에요"}
            </p>
          </>
        ) : (
          <p className={styles.costHint}>분담 비율이에요</p>
        )}
      </div>

      {chart.negotiated ? (
        <div className={styles.negotiateBar}>분담은 만나서 조율해요</div>
      ) : chart.myPercent != null && chart.matePercent != null ? (
        <>
          <div className={styles.splitBar} aria-hidden>
            <span
              className={styles.splitMate}
              style={{ flexGrow: chart.matePercent, flexBasis: 0 }}
            >
              {chart.matePercent >= 28 ? `살짝 ${chart.matePercent}%` : ""}
            </span>
            <span
              className={styles.splitMe}
              style={{ flexGrow: chart.myPercent, flexBasis: 0 }}
            >
              {chart.myPercent >= 28 ? `나 ${chart.myPercent}%` : ""}
            </span>
          </div>
          <div className={styles.splitLegend}>
            <span className={styles.legendMate}>
              <i className={styles.legendDotMate} />
              살짝 {chart.mateAmountLabel ?? `${chart.matePercent}%`}
            </span>
            <span className={styles.legendMe}>
              나 {chart.myAmountLabel ?? `${chart.myPercent}%`}
              <i className={styles.legendDotMe} />
            </span>
          </div>
        </>
      ) : null}
    </article>
  );
}

export function ListingCard({
  view,
  idPrefix,
}: {
  view: ListingView;
  idPrefix: string;
}) {
  const hasStats = view.charts.length > 0;
  const burden = buildMateBurden(view.charts);
  const prefGenderWord =
    view.prefGender === "female"
      ? "여성"
      : view.prefGender === "male"
        ? "남성"
        : null;

  return (
    <div className={styles.sheet}>
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
            {view.prefGender ? (
              <div className={styles.hostPref}>
                <p className={styles.hostPrefSeek}>
                  {prefGenderWord
                    ? `${prefGenderWord} 살짝을 찾아요`
                    : "성별은 상관없어요"}
                </p>
                {view.restrictListingByPrefGender && prefGenderWord ? (
                  <p className={styles.hostPrefNote}>
                    {prefGenderWord}만 볼 수 있는 공고예요
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby={`${idPrefix}-bio`}>
        <header className={styles.sectionHead}>
          <h3 id={`${idPrefix}-bio`} className={styles.sectionTitle}>
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

      {hasStats ? (
        <section
          className={styles.section}
          aria-labelledby={`${idPrefix}-housing`}
        >
          <header className={styles.sectionHead}>
            <h3 id={`${idPrefix}-housing`} className={styles.sectionTitle}>
              주거 조건
            </h3>
            <p className={styles.sectionDesc}>
              살짝이 매달 부담할 (예상)금액이에요
            </p>
          </header>
          {burden.mateLabel || burden.negotiated ? (
            <article className={styles.burdenCard}>
              <p className={styles.burdenLabel}>살짝이 낼 돈</p>
              <p className={styles.burdenTotal}>{burden.mateLabel ?? "조율"}</p>
              {burden.mateBreakdown ? (
                <p className={styles.burdenBreak}>{burden.mateBreakdown}</p>
              ) : null}
              {burden.houseBreakdown ? (
                <p className={styles.burdenHouse}>
                  집 전체 {burden.houseBreakdown}
                </p>
              ) : null}
            </article>
          ) : null}
          <div className={styles.costCharts}>
            {view.charts.map((chart) => (
              <CostSplitChart key={chart.key} chart={chart} />
            ))}
          </div>
        </section>
      ) : null}

      {view.lifestyle.length > 0 ? (
        <section
          className={styles.section}
          aria-labelledby={`${idPrefix}-life`}
        >
          <header className={styles.sectionHead}>
            <h3 id={`${idPrefix}-life`} className={styles.sectionTitle}>
              생활 리듬
            </h3>
            <p className={styles.sectionDesc}>평소 생활 패턴이에요</p>
          </header>
          <article className={styles.costCard}>
            <div className={styles.factWrap}>
              {view.lifestyle.map((chip) => (
                <span key={chip.label} className={styles.prefOption}>
                  <span className={styles.factEmoji} aria-hidden>
                    {chip.emoji}
                  </span>
                  {chip.label}
                </span>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {view.hardNos.length > 0 ? (
        <section
          className={styles.section}
          aria-labelledby={`${idPrefix}-hard`}
        >
          <header className={styles.sectionHead}>
            <h3 id={`${idPrefix}-hard`} className={styles.sectionTitle}>
              함께하기 어려운 점
            </h3>
            <p className={styles.sectionDesc}>이 부분은 맞춰주기 어려워요</p>
          </header>
          <article className={styles.costCard}>
            <div className={styles.factWrap}>
              {view.hardNos.map((item) => (
                <span key={item.label} className={styles.prefOptionHard}>
                  <span className={styles.factEmoji} aria-hidden>
                    {item.emoji}
                  </span>
                  {item.label}
                </span>
              ))}
            </div>
          </article>
        </section>
      ) : null}
    </div>
  );
}
