import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Home, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DayClock } from "@/components/DayClock";
import { useAuth } from "@/context/AuthContext";
import { REGION_CITIES, REGION_TREE, formatRegion } from "@/lib/regions";
import { cn } from "@/lib/utils";
import {
  CLEAN_FREQ_OPTIONS,
  DRINK_OPTIONS,
  HOME_TIME_OPTIONS,
  JOB_OPTIONS,
  PERSONALITY_OPTIONS,
  PET_KIND_OPTIONS,
  PREF_GENDER_OPTIONS,
  SEEK_ROLE_OPTIONS,
  SMOKING_OPTIONS,
  type CleanFreq,
  type DrinkFreq,
  type HomeTime,
  type JobType,
  type Personality,
  type PetKind,
  type PrefGender,
  type SeekRole,
  type ShareMode,
  type SmokingType,
  type UserPref,
} from "@/types/user";
import styles from "./ProfileEditPage.module.css";

type Step = "role" | "region" | "detail";

const SHARE_MODE_OPTIONS: { value: ShareMode; label: string }[] = [
  { value: "half", label: "1/2" },
  { value: "negotiate", label: "직접조율" },
  { value: "custom", label: "직접입력" },
];

function normalizeShareMode(mode: string | undefined | null): ShareMode | null {
  if (mode === "half" || mode === "negotiate" || mode === "custom") return mode;
  if (mode === "nbbang") return "half";
  return null;
}

function toggleDistrict(list: string[], city: string, district: string) {
  const value = formatRegion(city, district);
  const allValue = formatRegion(city, "전체");
  const prefix = `${city} `;

  if (district === "전체") {
    const withoutCity = list.filter((item) => !item.startsWith(prefix));
    if (list.includes(allValue)) return withoutCity;
    return [...withoutCity, allValue];
  }

  const withoutAll = list.filter((item) => item !== allValue);
  return withoutAll.includes(value)
    ? withoutAll.filter((item) => item !== value)
    : [...withoutAll, value];
}

function toInt(v: string) {
  if (!v.trim()) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, updateUser } = useAuth();
  const [step, setStep] = useState<Step>("role");
  const [seekRole, setSeekRole] = useState<SeekRole | null>(null);
  const [regionCity, setRegionCity] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [job, setJob] = useState<JobType | null>(null);
  const [jobOther, setJobOther] = useState("");
  const [sleepHour, setSleepHour] = useState("");
  const [wakeHour, setWakeHour] = useState("");
  const [clockActive, setClockActive] = useState<"sleep" | "wake">("sleep");
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [smokingType, setSmokingType] = useState<SmokingType | null>(null);
  const [pet, setPet] = useState(false);
  const [petKind, setPetKind] = useState<PetKind | null>(null);
  const [petKindOther, setPetKindOther] = useState("");
  const [petName, setPetName] = useState("");
  const [petNote, setPetNote] = useState("");
  const [wfh, setWfh] = useState(false);
  const [drinkFreq, setDrinkFreq] = useState<DrinkFreq | null>(null);
  const [homeTime, setHomeTime] = useState<HomeTime | null>(null);
  const [cleanFreq, setCleanFreq] = useState<CleanFreq | null>(null);

  const [prefGender, setPrefGender] = useState<PrefGender | null>(null);
  const [rentShareMode, setRentShareMode] = useState<ShareMode | null>(null);
  const [rentSharePercent, setRentSharePercent] = useState("");
  const [mgmtShareMode, setMgmtShareMode] = useState<ShareMode | null>(null);
  const [mgmtSharePercent, setMgmtSharePercent] = useState("");
  const [noSmoker, setNoSmoker] = useState(false);
  const [noPet, setNoPet] = useState(false);
  const [noDrink, setNoDrink] = useState(false);
  const [bio, setBio] = useState("");
  const [agreedLocation, setAgreedLocation] = useState(false);
  const [agreedPush, setAgreedPush] = useState(false);
  const [agreedMarketing, setAgreedMarketing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate("/profile", { replace: true });
      return;
    }
    if (hydrated) return;

    setSeekRole(user.pref?.seekRole ?? null);
    setRegions(user.pref?.regions ?? []);
    const first = user.pref?.regions?.[0];
    if (first) {
      const city = first.split(" ")[0];
      setRegionCity(REGION_CITIES.includes(city) ? city : null);
    }

    setJob(user.job ?? null);
    setJobOther(user.jobOther ?? "");
    const p = user.pref;
    setSleepHour(p?.sleepHour != null ? String(p.sleepHour) : "");
    setWakeHour(p?.wakeHour != null ? String(p.wakeHour) : "");
    setPersonality(p?.personality ?? null);
    setSmokingType(p?.smokingType ?? null);
    setPet(Boolean(p?.pet));
    setPetKind(p?.petInfo?.kind ?? null);
    setPetKindOther(p?.petInfo?.kindOther ?? "");
    setPetName(p?.petInfo?.name ?? "");
    setPetNote(p?.petInfo?.note ?? "");
    setWfh(Boolean(p?.wfh));
    setDrinkFreq(p?.drinkFreq ?? null);
    setHomeTime(p?.homeTime ?? null);
    setCleanFreq(p?.cleanFreq ?? null);
    setPrefGender(p?.prefGender ?? null);
    setRentShareMode(normalizeShareMode(p?.rentShare?.mode));
    setRentSharePercent(
      p?.rentShare?.percent != null ? String(p.rentShare.percent) : "",
    );
    setMgmtShareMode(normalizeShareMode(p?.mgmtShare?.mode));
    setMgmtSharePercent(
      p?.mgmtShare?.percent != null ? String(p.mgmtShare.percent) : "",
    );
    setNoSmoker(Boolean(p?.noSmoker));
    setNoPet(Boolean(p?.noPet));
    setNoDrink(Boolean(p?.noDrink));
    setBio(user.bio ?? "");
    setAgreedLocation(Boolean(user.agreedLocation));
    setAgreedPush(Boolean(user.agreedPush));
    setAgreedMarketing(Boolean(user.agreedMarketing));

    setStep("role");
    setHydrated(true);
  }, [isLoggedIn, user, navigate, hydrated]);

  const handleSelectRole = (role: SeekRole) => {
    if (!user) return;
    const roleChanged = seekRole !== role;
    setSeekRole(role);
    if (roleChanged) {
      setRegions([]);
      setRegionCity(null);
    }
    updateUser({
      pref: {
        ...user.pref,
        seekRole: role,
        ...(roleChanged ? { regions: undefined } : {}),
      },
    });
    setStep("region");
  };

  const handleNextFromRegion = () => {
    if (!user || !seekRole || regions.length === 0) return;
    updateUser({
      pref: {
        ...user.pref,
        seekRole,
        regions,
      },
    });
    setStep("detail");
  };

  const hasRoom = seekRole === "has_room";
  const showWfhOption =
    job === "employee" || job === "freelancer" || job === "other";

  const isShareValid = (mode: ShareMode | null, percent: string) => {
    if (!mode) return false;
    if (mode === "half" || mode === "negotiate") return true;
    const n = Number(percent);
    return percent.trim() !== "" && Number.isFinite(n) && n >= 1 && n <= 99;
  };

  const detailInvalid =
    !job ||
    (job === "other" && !jobOther.trim()) ||
    sleepHour === "" ||
    wakeHour === "" ||
    !personality ||
    !homeTime ||
    !cleanFreq ||
    !drinkFreq ||
    !smokingType ||
    (pet && !petKind) ||
    (pet && petKind === "other" && !petKindOther.trim()) ||
    (hasRoom &&
      (!prefGender ||
        !isShareValid(rentShareMode, rentSharePercent) ||
        !isShareValid(mgmtShareMode, mgmtSharePercent)));

  const handleSaveDetail = () => {
    if (!user || !seekRole) return;
    if (detailInvalid) return;

    const pref: UserPref = {
      ...user.pref,
      seekRole,
      regions: regions.length ? regions : undefined,
      sleepHour: toInt(sleepHour),
      wakeHour: toInt(wakeHour),
      personality: personality ?? undefined,
      smoking: smokingType != null && smokingType !== "none",
      smokingType: smokingType ?? undefined,
      pet,
      petInfo:
        pet && petKind
          ? {
              kind: petKind,
              kindOther:
                petKind === "other"
                  ? petKindOther.trim() || undefined
                  : undefined,
              name: petName.trim() || undefined,
              note: petNote.trim() || undefined,
            }
          : undefined,
      wfh: showWfhOption ? wfh : false,
      drinkFreq: drinkFreq ?? undefined,
      homeTime: homeTime ?? undefined,
      cleanFreq: cleanFreq ?? undefined,
      prefGender: prefGender ?? undefined,
      rentShare: rentShareMode
        ? {
            mode: rentShareMode,
            percent:
              rentShareMode === "custom" ? toInt(rentSharePercent) : undefined,
          }
        : undefined,
      mgmtShare: mgmtShareMode
        ? {
            mode: mgmtShareMode,
            percent:
              mgmtShareMode === "custom" ? toInt(mgmtSharePercent) : undefined,
          }
        : undefined,
      noSmoker,
      noPet,
      noDrink,
    };

    updateUser({
      job: job ?? undefined,
      jobOther: job === "other" ? jobOther.trim() || undefined : undefined,
      bio: bio.trim() || undefined,
      agreedLocation,
      agreedPush,
      agreedMarketing,
      pref,
    });
    navigate("/profile", { replace: true });
  };

  const handleBack = () => {
    if (step === "detail") {
      setStep("region");
      return;
    }
    if (step === "region") {
      setStep("role");
      return;
    }
    navigate("/profile");
  };

  if (!isLoggedIn || !user) return null;

  const districts = regionCity
    ? ["전체", ...(REGION_TREE[regionCity] ?? [])]
    : [];

  const countCitySelections = (city: string) => {
    const prefix = `${city} `;
    return regions.filter((item) => item.startsWith(prefix)).length;
  };

  return (
    <section className={styles.page}>
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={handleBack}
          aria-label="뒤로"
        >
          <ArrowLeft className="size-[1.15rem]" strokeWidth={2.4} />
        </button>
        <p className={styles.stepLabel}>
          {step === "role"
            ? "추가 정보 · 1단계"
            : step === "region"
              ? "추가 정보 · 2단계"
              : "추가 정보 · 3단계"}
        </p>
      </div>

      {step === "role" ? (
        <>
          <div className={styles.intro}>
            <h2 className={styles.title}>
              지금 상황을
              <br />
              <span className={styles.accent}>살짝</span> 알려주세요
            </h2>
          </div>

          <div className={styles.roleList}>
            {SEEK_ROLE_OPTIONS.map((opt) => {
              const Icon = opt.value === "has_room" ? Home : Search;
              const active = seekRole === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(
                    styles.roleCard,
                    active && styles.roleCardActive,
                  )}
                  onClick={() => handleSelectRole(opt.value)}
                >
                  <span className={styles.roleIconWrap} aria-hidden>
                    <Icon className="size-5" />
                  </span>
                  <span className={styles.roleText}>
                    <span className={styles.roleTitle}>{opt.title}</span>
                    <span className={styles.roleDesc}>{opt.desc}</span>
                  </span>
                  <ArrowRight className={styles.roleArrow} />
                </button>
              );
            })}
          </div>
        </>
      ) : step === "region" ? (
        <>
          <div className={styles.intro}>
            <h2 className={styles.title}>
              {hasRoom ? (
                <>
                  어느 지역에
                  <br />
                  <span className={styles.accent}>거주</span>하고 계신가요?
                </>
              ) : (
                <>
                  어느 지역에
                  <br />
                  <span className={styles.accent}>거주</span>하실 예정인가요?
                </>
              )}
            </h2>
            <p className={styles.desc}>
              광역을 고른 뒤 구/시를 선택해 주세요.
              <br />
              여러 지역을 고를 수 있어요.
            </p>
          </div>

          <section className={styles.block}>
            <h3 className={styles.blockTitle}>희망 지역</h3>
            <p className={styles.blockHint}>
              광역을 고른 뒤 구/시를 선택해 주세요. 여러 지역을 고를 수 있어요.
            </p>
            <div className={styles.field}>
              <p className={styles.label}>
                1. 전체 지역 <span className={styles.required}>*</span>
              </p>
              <div className={styles.chipRow}>
                {REGION_CITIES.map((city) => {
                  const selectedCount = countCitySelections(city);
                  const hasSelection = selectedCount > 0;
                  return (
                    <button
                      key={city}
                      type="button"
                      className={cn(
                        styles.chip,
                        regionCity === city && styles.chipActive,
                        hasSelection &&
                          regionCity !== city &&
                          styles.chipSelected,
                      )}
                      onClick={() => setRegionCity(city)}
                    >
                      {hasSelection ? `${city}(${selectedCount})` : city}
                    </button>
                  );
                })}
              </div>
            </div>

            {regionCity ? (
              <div className={styles.field}>
                <p className={styles.label}>
                  2. {regionCity} 구/시{" "}
                  <span className={styles.required}>*</span>
                </p>
                <div className={styles.chipRow}>
                  {districts.map((district) => {
                    const value = formatRegion(regionCity, district);
                    return (
                      <button
                        key={value}
                        type="button"
                        className={cn(
                          styles.chip,
                          regions.includes(value) && styles.chipActive,
                        )}
                        onClick={() =>
                          setRegions((prev) =>
                            toggleDistrict(prev, regionCity, district),
                          )
                        }
                      >
                        {district}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className={styles.regionGuide}>
                먼저 전체 지역을 선택해 주세요.
              </p>
            )}

            {regions.length > 0 ? (
              <div className={styles.field}>
                <p className={styles.label}>선택한 지역</p>
                <div className={styles.selectedRow}>
                  {regions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={styles.selectedChip}
                      onClick={() =>
                        setRegions((prev) => prev.filter((r) => r !== item))
                      }
                    >
                      {item}
                      <X className="size-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <Button
            type="button"
            className={styles.submit}
            size="lg"
            disabled={regions.length === 0}
            onClick={handleNextFromRegion}
          >
            다음
          </Button>
        </>
      ) : (
        <>
          <div className={styles.intro}>
            <h2 className={styles.title}>
              {hasRoom ? (
                <>
                  룸메에게 맞는
                  <br />
                  <span className={styles.accent}>정보</span>를 알려주세요
                </>
              ) : (
                <>
                  집 구할 때 필요한
                  <br />
                  <span className={styles.accent}>정보</span>를 알려주세요
                </>
              )}
            </h2>
            <p className={styles.desc}>
              {hasRoom
                ? "내 생활 습관과 함께 지낼 사람 조건을 적어주세요."
                : "생활 습관을 알려주시면 매칭에 도움이 돼요."}
            </p>
          </div>

          <section className={styles.block}>
            <h3 className={styles.blockTitle}>기본 정보</h3>
            <p className={styles.blockHint}>직업과 근무 형태를 알려주세요</p>
            <div className={styles.field}>
              <p className={styles.label}>
                직업 <span className={styles.required}>*</span>
              </p>
              <div className={styles.chipRow}>
                {JOB_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      styles.chip,
                      job === opt.value && styles.chipActive,
                    )}
                    onClick={() => {
                      setJob(opt.value);
                      if (opt.value !== "other") setJobOther("");
                      if (
                        opt.value !== "employee" &&
                        opt.value !== "freelancer" &&
                        opt.value !== "other"
                      ) {
                        setWfh(false);
                      }
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {job === "other" ? (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="jobOther">
                  직업 입력 <span className={styles.required}>*</span>
                </label>
                <Input
                  id="jobOther"
                  className={styles.input}
                  placeholder="직업을 입력해 주세요"
                  value={jobOther}
                  maxLength={30}
                  onChange={(e) => setJobOther(e.target.value)}
                />
              </div>
            ) : null}
            {showWfhOption ? (
              <label className={styles.checkRow}>
                <Checkbox
                  checked={wfh}
                  onCheckedChange={(v) => setWfh(v === true)}
                />
                <span>재택근무</span>
              </label>
            ) : null}
          </section>

          <section className={styles.block}>
            <h3 className={styles.blockTitle}>생활 습관</h3>
            <p className={styles.blockHint}>
              취침·기상, 성격, 흡연·음주 등 평소 생활 패턴
            </p>

            <div className={styles.field}>
              <p className={styles.label}>
                취침 · 기상 <span className={styles.required}>*</span>
              </p>
              <DayClock
                sleepHour={sleepHour === "" ? null : Number(sleepHour)}
                wakeHour={wakeHour === "" ? null : Number(wakeHour)}
                active={clockActive}
                onActiveChange={setClockActive}
                onChange={(kind, hour) => {
                  if (kind === "sleep") {
                    setSleepHour(String(hour));
                    if (wakeHour === "") setClockActive("wake");
                  } else {
                    setWakeHour(String(hour));
                  }
                }}
              />
            </div>

            <div className={styles.field}>
              <p className={styles.label}>
                성격 <span className={styles.required}>*</span>
              </p>
              <div className={styles.chipRow3}>
                {PERSONALITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      styles.chip,
                      personality === opt.value && styles.chipActive,
                    )}
                    onClick={() => setPersonality(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <p className={styles.label}>
                집에 있는 시간 <span className={styles.required}>*</span>
              </p>
              <div className={styles.chipRow3}>
                {HOME_TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      styles.chip,
                      homeTime === opt.value && styles.chipActive,
                    )}
                    onClick={() => setHomeTime(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <p className={styles.label}>
                청소 빈도 <span className={styles.required}>*</span>
              </p>
              <div className={styles.chipRow2}>
                {CLEAN_FREQ_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      styles.chip,
                      cleanFreq === opt.value && styles.chipActive,
                    )}
                    onClick={() => setCleanFreq(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <p className={styles.label}>
                음주 <span className={styles.required}>*</span>
              </p>
              <div className={styles.chipRow3}>
                {DRINK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      styles.chip,
                      drinkFreq === opt.value && styles.chipActive,
                    )}
                    onClick={() => setDrinkFreq(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <p className={styles.label}>
                흡연여부 <span className={styles.required}>*</span>
              </p>
              <div className={styles.chipRow3}>
                {SMOKING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      styles.chip,
                      smokingType === opt.value && styles.chipActive,
                    )}
                    onClick={() => setSmokingType(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.checkGrid}>
              <label className={styles.checkRow}>
                <Checkbox
                  checked={pet}
                  onCheckedChange={(v) => {
                    const on = v === true;
                    setPet(on);
                    if (!on) {
                      setPetKind(null);
                      setPetKindOther("");
                      setPetName("");
                      setPetNote("");
                    }
                  }}
                />
                <span>반려동물 있음</span>
              </label>
            </div>

            {pet ? (
              <div className={styles.subForm}>
                <p className={styles.label}>
                  반려동물 종류 <span className={styles.required}>*</span>
                </p>
                <div className={styles.chipRow3}>
                  {PET_KIND_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={cn(
                        styles.chip,
                        petKind === opt.value && styles.chipActive,
                      )}
                      onClick={() => {
                        setPetKind(opt.value);
                        if (opt.value !== "other") setPetKindOther("");
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {petKind === "other" ? (
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="petKindOther">
                      종류 입력 <span className={styles.required}>*</span>
                    </label>
                    <Input
                      id="petKindOther"
                      className={styles.input}
                      placeholder="예: 토끼, 햄스터"
                      value={petKindOther}
                      maxLength={20}
                      onChange={(e) => setPetKindOther(e.target.value)}
                    />
                  </div>
                ) : null}
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="petName">
                    이름 (선택)
                  </label>
                  <Input
                    id="petName"
                    className={styles.input}
                    placeholder="예: 초코"
                    value={petName}
                    maxLength={20}
                    onChange={(e) => setPetName(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="petNote">
                    안내 메모 (선택)
                  </label>
                  <Input
                    id="petNote"
                    className={styles.input}
                    placeholder="크기, 성격, 주의사항 등"
                    value={petNote}
                    maxLength={80}
                    onChange={(e) => setPetNote(e.target.value)}
                  />
                </div>
              </div>
            ) : null}
          </section>

          {hasRoom ? (
            <section className={styles.block}>
              <h3 className={styles.blockTitle}>원하는 룸메 조건</h3>
              <p className={styles.blockHint}>
                성별, 분담 방식, 함께하기 어려운 점
              </p>

              <div className={styles.field}>
                <p className={styles.label}>
                  선호 룸메 성별 <span className={styles.required}>*</span>
                </p>
                <div className={styles.chipRow3}>
                  {PREF_GENDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={cn(
                        styles.chip,
                        prefGender === opt.value && styles.chipActive,
                      )}
                      onClick={() => setPrefGender(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <p className={styles.label}>
                  분담 월세 <span className={styles.required}>*</span>
                </p>
                <div className={styles.chipRow3}>
                  {SHARE_MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={cn(
                        styles.chip,
                        rentShareMode === opt.value && styles.chipActive,
                      )}
                      onClick={() => {
                        setRentShareMode(opt.value);
                        if (opt.value !== "custom") setRentSharePercent("");
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {rentShareMode === "custom" ? (
                  <div className={styles.percentField}>
                    <Input
                      id="rentSharePercent"
                      className={styles.input}
                      inputMode="numeric"
                      placeholder="예: 50"
                      value={rentSharePercent}
                      onChange={(e) =>
                        setRentSharePercent(
                          e.target.value.replace(/\D/g, "").slice(0, 2),
                        )
                      }
                    />
                    <span className={styles.percentSuffix}>%</span>
                  </div>
                ) : null}
              </div>

              <div className={styles.field}>
                <p className={styles.label}>
                  분담 관리비 <span className={styles.required}>*</span>
                </p>
                <div className={styles.chipRow3}>
                  {SHARE_MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={cn(
                        styles.chip,
                        mgmtShareMode === opt.value && styles.chipActive,
                      )}
                      onClick={() => {
                        setMgmtShareMode(opt.value);
                        if (opt.value !== "custom") setMgmtSharePercent("");
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {mgmtShareMode === "custom" ? (
                  <div className={styles.percentField}>
                    <Input
                      id="mgmtSharePercent"
                      className={styles.input}
                      inputMode="numeric"
                      placeholder="예: 50"
                      value={mgmtSharePercent}
                      onChange={(e) =>
                        setMgmtSharePercent(
                          e.target.value.replace(/\D/g, "").slice(0, 2),
                        )
                      }
                    />
                    <span className={styles.percentSuffix}>%</span>
                  </div>
                ) : null}
              </div>

              <p className={styles.label}>함께하기 어려운 점</p>
              <div className={styles.checkGrid2}>
                <label className={styles.checkRow}>
                  <Checkbox
                    checked={noSmoker}
                    onCheckedChange={(v) => setNoSmoker(v === true)}
                  />
                  <span>흡연</span>
                </label>
                <label className={styles.checkRow}>
                  <Checkbox
                    checked={noDrink}
                    onCheckedChange={(v) => setNoDrink(v === true)}
                  />
                  <span>음주</span>
                </label>
                <label className={styles.checkRow}>
                  <Checkbox
                    checked={noPet}
                    onCheckedChange={(v) => setNoPet(v === true)}
                  />
                  <span>반려동물</span>
                </label>
              </div>
            </section>
          ) : null}

          <section className={styles.block}>
            <h3 className={styles.blockTitle}>살짝에게 전하는 한마디</h3>
            <p className={styles.blockHint}>
              매칭 상대에게 보여질 소개예요. 원하는 생활이나 성향을 자유롭게
              적어주세요.
            </p>
            <textarea
              id="bio"
              className={styles.textarea}
              placeholder={
                hasRoom
                  ? "예: 투룸이고 거실 공유해요. 조용한 분과 월세 반반이면 좋겠어요"
                  : "예: 강남·서초 쪽 원룸 구해요. 주말엔 같이 밥 해먹을 룸메면 좋아요"
              }
              value={bio}
              maxLength={200}
              rows={4}
              onChange={(e) => setBio(e.target.value)}
            />
            <p className={styles.charCount}>{bio.length}/200</p>
          </section>

          <section className={styles.block}>
            <h3 className={styles.blockTitle}>서비스 동의</h3>
            <p className={styles.blockHint}>필요한 항목만 선택해 주세요</p>
            <label className={styles.agreeRow}>
              <Checkbox
                checked={agreedLocation}
                onCheckedChange={(v) => setAgreedLocation(v === true)}
              />
              <span className={styles.agreeText}>
                위치기반 서비스 이용 동의
                <span className={styles.agreeHint}>
                  근처 살짝 추천에 사용돼요. (선택)
                </span>
              </span>
            </label>
            <label className={styles.agreeRow}>
              <Checkbox
                checked={agreedPush}
                onCheckedChange={(v) => setAgreedPush(v === true)}
              />
              <span className={styles.agreeText}>
                푸시 알림 수신 동의
                <span className={styles.agreeHint}>
                  매칭·메시지 등 서비스 알림을 받아요. (선택)
                </span>
              </span>
            </label>
            <label className={styles.agreeRow}>
              <Checkbox
                checked={agreedMarketing}
                onCheckedChange={(v) => setAgreedMarketing(v === true)}
              />
              <span className={styles.agreeText}>
                마케팅 정보 수신 동의
                <span className={styles.agreeHint}>
                  이벤트·혜택 소식을 받아요. (선택)
                </span>
              </span>
            </label>
          </section>

          <Button
            type="button"
            className={styles.submit}
            size="lg"
            disabled={detailInvalid}
            onClick={handleSaveDetail}
          >
            저장하고 나가기
          </Button>
        </>
      )}
    </section>
  );
}
