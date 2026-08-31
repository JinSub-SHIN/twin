import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Home, Search, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "@/types/user";
import styles from "./ProfileEditPage.module.css";

type Step = "role" | "region" | "detail" | "prefs";

const STEP_PATH: Record<Step, string> = {
  role: "/profile/edit/role",
  region: "/profile/edit/region",
  detail: "/profile/edit/detail",
  prefs: "/profile/edit/prefs",
};

function parseStep(value: string | undefined): Step {
  if (
    value === "role" ||
    value === "region" ||
    value === "detail" ||
    value === "prefs"
  ) {
    return value;
  }
  return "role";
}

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
  const { step: stepParam } = useParams<{ step: string }>();
  const step = parseStep(stepParam);
  const { user, isLoggedIn, updateUser } = useAuth();
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
  const [agreedMatch, setAgreedMatch] = useState(false);
  const [autosaveTipOpen, setAutosaveTipOpen] = useState(false);
  const userRef = useRef(user);
  userRef.current = user;

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
    setAgreedMatch(Boolean(user.agreedMatch));

    setHydrated(true);
  }, [isLoggedIn, user, navigate, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (
      stepParam &&
      stepParam !== "role" &&
      stepParam !== "region" &&
      stepParam !== "detail" &&
      stepParam !== "prefs"
    ) {
      navigate(STEP_PATH.role, { replace: true });
    }
  }, [hydrated, stepParam, navigate]);

  const hasRoom = seekRole === "has_room";
  const showWfhOption =
    job === "employee" || job === "freelancer" || job === "other";

  const persistDraft = () => {
    const current = userRef.current;
    if (!current) return;

    updateUser({
      job: job ?? undefined,
      jobOther: job === "other" ? jobOther.trim() || undefined : undefined,
      bio: bio.trim() || undefined,
      agreedLocation,
      agreedPush,
      agreedMarketing,
      agreedMatch,
      pref: {
        ...current.pref,
        seekRole: seekRole ?? undefined,
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
                rentShareMode === "custom"
                  ? toInt(rentSharePercent)
                  : undefined,
            }
          : undefined,
        mgmtShare: mgmtShareMode
          ? {
              mode: mgmtShareMode,
              percent:
                mgmtShareMode === "custom"
                  ? toInt(mgmtSharePercent)
                  : undefined,
            }
          : undefined,
        noSmoker,
        noPet,
        noDrink,
      },
    });
  };

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      persistDraft();
    }, 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draft fields only; avoid user loop
  }, [
    hydrated,
    seekRole,
    regions,
    job,
    jobOther,
    sleepHour,
    wakeHour,
    personality,
    smokingType,
    pet,
    petKind,
    petKindOther,
    petName,
    petNote,
    wfh,
    drinkFreq,
    homeTime,
    cleanFreq,
    prefGender,
    rentShareMode,
    rentSharePercent,
    mgmtShareMode,
    mgmtSharePercent,
    noSmoker,
    noPet,
    noDrink,
    bio,
    agreedLocation,
    agreedPush,
    agreedMarketing,
    agreedMatch,
    showWfhOption,
  ]);

  const handleSelectRole = (role: SeekRole) => {
    if (!user) return;
    const roleChanged = seekRole !== role;
    setSeekRole(role);
    if (roleChanged) {
      setRegions([]);
      setRegionCity(null);
    }
    setAutosaveTipOpen(true);
  };

  const handleNextFromRegion = () => {
    if (!seekRole || regions.length === 0) return;
    navigate(STEP_PATH.detail);
  };

  const isShareValid = (mode: ShareMode | null, percent: string) => {
    if (!mode) return false;
    if (mode === "half" || mode === "negotiate") return true;
    const n = Number(percent);
    return percent.trim() !== "" && Number.isFinite(n) && n >= 1 && n <= 99;
  };

  const lifestyleInvalid =
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
    (pet && petKind === "other" && !petKindOther.trim());

  const prefsInvalid =
    hasRoom &&
    (!prefGender ||
      !isShareValid(rentShareMode, rentSharePercent) ||
      !isShareValid(mgmtShareMode, mgmtSharePercent));

  const detailInvalid =
    lifestyleInvalid || prefsInvalid || !agreedMatch;

  const agreeAll =
    agreedMatch && agreedLocation && agreedPush && agreedMarketing;

  const setAgreeAll = (checked: boolean) => {
    setAgreedMatch(checked);
    setAgreedLocation(checked);
    setAgreedPush(checked);
    setAgreedMarketing(checked);
  };

  const handleNextFromDetail = () => {
    if (lifestyleInvalid) return;
    persistDraft();
    navigate(STEP_PATH.prefs);
  };

  const leaveTo = (next: "profile" | "post" | "find") => {
    persistDraft();
    if (next === "post") {
      if (detailInvalid) return;
      navigate("/explore", {
        replace: true,
        state: { intent: "create-listing" },
      });
      return;
    }
    if (next === "find") {
      if (detailInvalid) return;
      navigate("/explore", {
        replace: true,
        state: { intent: "search" },
      });
      return;
    }
    navigate("/profile", { replace: true });
  };

  useEffect(() => {
    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const main = document.querySelector("main");
      if (main instanceof HTMLElement) {
        main.scrollTop = 0;
      }
    };
    scrollTop();
    // 레이아웃 반영 후 한 번 더 (모바일에서 잔여 스크롤 방지)
    const id = window.requestAnimationFrame(scrollTop);
    return () => window.cancelAnimationFrame(id);
  }, [step]);

  const confirmAutosaveTip = () => {
    setAutosaveTipOpen(false);
    navigate(STEP_PATH.region);
  };

  const handleBack = () => {
    if (step === "role") {
      persistDraft();
      navigate("/profile");
      return;
    }
    navigate(-1);
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
    <section
      className={cn(styles.page, step === "prefs" && styles.pagePrefs)}
    >
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
              : step === "detail"
                ? "추가 정보 · 3단계"
                : "추가 정보 · 4단계"}
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
      ) : step === "detail" ? (
        <>
          <div className={styles.intro}>
            <h2 className={styles.title}>
              나를 알려주는
              <br />
              <span className={styles.accent}>기본 정보</span>예요
            </h2>
            <p className={styles.desc}>직업과 생활 습관을 먼저 적어주세요.</p>
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

          <Button
            type="button"
            className={styles.submit}
            size="lg"
            disabled={lifestyleInvalid}
            onClick={handleNextFromDetail}
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
                  원하는 룸메와
                  <br />
                  <span className={styles.accent}>한 마디</span>를 남겨주세요
                </>
              ) : (
                <>
                  마지막으로
                  <br />
                  <span className={styles.accent}>한 마디</span>를 남겨주세요
                </>
              )}
            </h2>
            <p className={styles.desc}>
              {hasRoom
                ? "룸메 조건과 소개, 동의를 확인해주세요."
                : "소개와 동의를 확인해주세요."}
            </p>
          </div>

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
            <div className={styles.agreeCard}>
              <label className={styles.agreeAll}>
                <Checkbox
                  checked={agreeAll}
                  onCheckedChange={(v) => setAgreeAll(v === true)}
                />
                <span className={styles.agreeAllBody}>
                  <span className={styles.agreeAllTitle}>전체 동의</span>
                  <span className={styles.agreeAllDesc}>
                    필수·선택 항목을 모두 포함해요
                  </span>
                </span>
              </label>

              <div
                className={cn(
                  styles.agreeCollapse,
                  agreeAll && styles.agreeCollapseClosed,
                )}
              >
                <div className={styles.agreeCollapseInner}>
                  <div className={styles.agreeDivider} />

                  <div className={styles.agreeList}>
                    <label className={styles.agreeItem}>
                      <Checkbox
                        checked={agreedMatch}
                        onCheckedChange={(v) => setAgreedMatch(v === true)}
                      />
                      <span className={styles.agreeItemBody}>
                        <span className={styles.agreeItemTitle}>
                          매칭을 위한 프로필 정보 제공
                          <span className={styles.agreeTagRequired}>필수</span>
                        </span>
                        <span className={styles.agreeItemDesc}>
                          룸메 매칭을 위해 프로필이 다른 회원에게 보여져요
                        </span>
                      </span>
                    </label>
                    <label className={styles.agreeItem}>
                      <Checkbox
                        checked={agreedLocation}
                        onCheckedChange={(v) => setAgreedLocation(v === true)}
                      />
                      <span className={styles.agreeItemBody}>
                        <span className={styles.agreeItemTitle}>
                          위치기반 서비스 이용
                          <span className={styles.agreeTagOptional}>선택</span>
                        </span>
                        <span className={styles.agreeItemDesc}>
                          근처 살짝 추천에 사용돼요
                        </span>
                      </span>
                    </label>
                    <label className={styles.agreeItem}>
                      <Checkbox
                        checked={agreedPush}
                        onCheckedChange={(v) => setAgreedPush(v === true)}
                      />
                      <span className={styles.agreeItemBody}>
                        <span className={styles.agreeItemTitle}>
                          푸시 알림 수신
                          <span className={styles.agreeTagOptional}>선택</span>
                        </span>
                        <span className={styles.agreeItemDesc}>
                          매칭·메시지 등 서비스 알림을 받아요
                        </span>
                      </span>
                    </label>
                    <label className={styles.agreeItem}>
                      <Checkbox
                        checked={agreedMarketing}
                        onCheckedChange={(v) => setAgreedMarketing(v === true)}
                      />
                      <span className={styles.agreeItemBody}>
                        <span className={styles.agreeItemTitle}>
                          마케팅 정보 수신
                          <span className={styles.agreeTagOptional}>선택</span>
                        </span>
                        <span className={styles.agreeItemDesc}>
                          이벤트·혜택 소식을 받아요
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className={cn(styles.submitGroup, styles.submitGroupDock)}>
            <Button
              type="button"
              className={styles.submit}
              size="lg"
              disabled={detailInvalid}
              onClick={() => leaveTo(hasRoom ? "post" : "find")}
            >
              {hasRoom ? "이 정보로 살짝 구하기" : "이 정보로 살짝 찾기"}
            </Button>
            {hasRoom ? (
              <Button
                type="button"
                className={cn(styles.submit, styles.submitSecondary)}
                size="lg"
                variant="outline"
                onClick={() => leaveTo("profile")}
              >
                살짝은 나중에 구하기
              </Button>
            ) : null}
          </div>
        </>
      )}

      <Dialog
        open={autosaveTipOpen}
        onOpenChange={setAutosaveTipOpen}
      >
        <DialogContent className={styles.dialogContent} showCloseButton={false}>
          <div className={styles.modalInner}>
            <div className={styles.modalIconWrap} aria-hidden>
              <span className={styles.modalIcon}>✓</span>
            </div>
            <DialogHeader className={styles.modalHeader}>
              <DialogTitle className={styles.modalTitle}>
                입력한 정보는 자동 저장돼요
              </DialogTitle>
              <DialogDescription className={styles.modalDesc}>
                앱을 종료하거나 페이지를 나가도
                <br />
                작성 중이던 내용이 그대로 남아 있어요.
                <br />
                안심하고 천천히 적어 주세요.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className={styles.dialogFooter}>
              <Button
                type="button"
                className={styles.modalAction}
                size="lg"
                onClick={confirmAutosaveTip}
              >
                확인했어요
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
