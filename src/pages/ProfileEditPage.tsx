import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Home, MapPin, Search, X } from "lucide-react";
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
import {
  NO_NEARBY_STATION,
  formatStationLabel,
  searchStations,
} from "@/lib/stations";
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

type Step = "role" | "cost" | "region" | "station" | "detail" | "prefs";

const STEP_PATH: Record<Step, string> = {
  role: "/profile/edit/role",
  cost: "/profile/edit/cost",
  region: "/profile/edit/region",
  station: "/profile/edit/station",
  detail: "/profile/edit/detail",
  prefs: "/profile/edit/prefs",
};

function parseStep(value: string | undefined): Step {
  if (
    value === "role" ||
    value === "cost" ||
    value === "region" ||
    value === "station" ||
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

function digitsOnly(value: string, maxLen = 4) {
  return value.replace(/\D/g, "").slice(0, maxLen);
}

/** 저장된 원 단위 → 입력용 만원 숫자 */
function wonToManDigits(won?: number) {
  if (won == null || won <= 0) return "";
  if (won < 1000) return String(Math.round(won));
  return String(Math.round(won / 10000));
}

/** 만원 숫자 → 저장용 원 */
function manDigitsToWon(digits: string) {
  const man = toInt(digits);
  if (man == null || man <= 0) return undefined;
  return man * 10000;
}

function normalizeShareMode(mode: string | undefined | null): ShareMode | null {
  if (mode === "half" || mode === "negotiate" || mode === "custom") return mode;
  if (mode === "nbbang") return "half";
  return null;
}

function selectDistrict(current: string[], city: string, district: string) {
  const value = formatRegion(city, district);
  if (current[0] === value) return [];
  return [value];
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
  const [nearestStation, setNearestStation] = useState("");
  const [stationQuery, setStationQuery] = useState("");
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
  const [restrictListingByPrefGender, setRestrictListingByPrefGender] =
    useState<boolean | null>(null);
  const [rentShareMode, setRentShareMode] = useState<ShareMode | null>(null);
  const [rentSharePercent, setRentSharePercent] = useState("");
  const [mgmtShareMode, setMgmtShareMode] = useState<ShareMode | null>(null);
  const [mgmtSharePercent, setMgmtSharePercent] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [mgmtAmount, setMgmtAmount] = useState("");
  const [noSmoker, setNoSmoker] = useState(false);
  const [noPet, setNoPet] = useState(false);
  const [noDrink, setNoDrink] = useState(false);
  const [bio, setBio] = useState("");
  const [agreedLocation, setAgreedLocation] = useState(false);
  const [agreedPush, setAgreedPush] = useState(false);
  const [agreedMarketing, setAgreedMarketing] = useState(false);
  const [agreedMatch, setAgreedMatch] = useState(false);
  const [autosaveTipOpen, setAutosaveTipOpen] = useState(false);
  const [postConfirmOpen, setPostConfirmOpen] = useState(false);
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate("/profile", { replace: true });
      return;
    }
    if (hydrated) return;

    setSeekRole(user.pref?.seekRole ?? null);
    setRegions(user.pref?.regions?.slice(0, 1) ?? []);
    setNearestStation(user.pref?.nearestStation ?? "");
    setStationQuery("");
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
    setRestrictListingByPrefGender(
      p?.prefGender === "male" || p?.prefGender === "female"
        ? (p.restrictListingByPrefGender ?? null)
        : null,
    );
    setRentShareMode(normalizeShareMode(p?.rentShare?.mode));
    setRentSharePercent(
      p?.rentShare?.percent != null ? String(p.rentShare.percent) : "",
    );
    setMgmtShareMode(normalizeShareMode(p?.mgmtShare?.mode));
    setMgmtSharePercent(
      p?.mgmtShare?.percent != null ? String(p.mgmtShare.percent) : "",
    );
    setRentAmount(wonToManDigits(p?.rentAmount));
    setMgmtAmount(wonToManDigits(p?.mgmtAmount));
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
      stepParam !== "cost" &&
      stepParam !== "region" &&
      stepParam !== "station" &&
      stepParam !== "detail" &&
      stepParam !== "prefs"
    ) {
      navigate(STEP_PATH.role, { replace: true });
      return;
    }
    if (step === "cost" && seekRole && seekRole !== "has_room") {
      navigate(STEP_PATH.region, { replace: true });
    }
  }, [hydrated, stepParam, step, seekRole, navigate]);

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
        regions: regions[0] ? [regions[0]] : undefined,
        nearestStation: nearestStation.trim() || undefined,
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
        restrictListingByPrefGender:
          prefGender === "male" || prefGender === "female"
            ? Boolean(restrictListingByPrefGender)
            : false,
        rentAmount: manDigitsToWon(rentAmount),
        mgmtAmount: manDigitsToWon(mgmtAmount),
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
    nearestStation,
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
    restrictListingByPrefGender,
    rentAmount,
    mgmtAmount,
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
    persistDraft();
    navigate(STEP_PATH.station);
  };

  const handleNextFromStation = () => {
    if (!nearestStation.trim()) return;
    persistDraft();
    if (seekRole === "has_room") {
      navigate(STEP_PATH.cost);
      return;
    }
    navigate(STEP_PATH.detail);
  };

  const handleNextFromCost = () => {
    if (!toInt(rentAmount) || !toInt(mgmtAmount)) return;
    persistDraft();
    navigate(STEP_PATH.detail);
  };

  const isShareValid = (mode: ShareMode | null, percent: string) => {
    if (!mode) return false;
    if (mode === "half" || mode === "negotiate") return true;
    const n = Number(percent);
    return percent.trim() !== "" && Number.isFinite(n) && n >= 1 && n <= 99;
  };

  const costInvalid = !toInt(rentAmount) || !toInt(mgmtAmount);

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
      ((prefGender === "male" || prefGender === "female") &&
        restrictListingByPrefGender == null) ||
      !isShareValid(rentShareMode, rentSharePercent) ||
      !isShareValid(mgmtShareMode, mgmtSharePercent));

  const detailInvalid =
    lifestyleInvalid ||
    prefsInvalid ||
    !agreedMatch ||
    (hasRoom && costInvalid);

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
      navigate("/explore/listing", { replace: true });
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
    if (detailInvalid) return;
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
    persistDraft();
    if (step === "role") {
      navigate("/profile");
      return;
    }
    if (step === "region") {
      navigate(STEP_PATH.role);
      return;
    }
    if (step === "station") {
      navigate(STEP_PATH.region);
      return;
    }
    if (step === "cost") {
      navigate(STEP_PATH.station);
      return;
    }
    if (step === "detail") {
      navigate(hasRoom ? STEP_PATH.cost : STEP_PATH.station);
      return;
    }
    navigate(STEP_PATH.detail);
  };

  if (!isLoggedIn || !user) return null;

  const districts = regionCity
    ? ["전체", ...(REGION_TREE[regionCity] ?? [])]
    : [];

  const selectedRegion = regions[0] ?? null;
  const selectedCity = selectedRegion?.split(" ")[0] ?? null;
  const stationSuggestions = useMemo(
    () => searchStations(stationQuery, selectedCity),
    [stationQuery, selectedCity],
  );
  const customStationLabel = stationQuery.trim()
    ? stationQuery.trim().endsWith("역")
      ? stationQuery.trim()
      : `${stationQuery.trim()}역`
    : "";
  const showCustomStation =
    Boolean(customStationLabel) &&
    customStationLabel !== nearestStation &&
    !stationSuggestions.some(
      (station) => formatStationLabel(station) === customStationLabel,
    );

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
          {(() => {
            if (hasRoom) {
              if (step === "role") return "추가 정보 · 1단계";
              if (step === "region") return "추가 정보 · 2단계";
              if (step === "station") return "추가 정보 · 3단계";
              if (step === "cost") return "추가 정보 · 4단계";
              if (step === "detail") return "추가 정보 · 5단계";
              return "추가 정보 · 6단계";
            }
            if (step === "role") return "추가 정보 · 1단계";
            if (step === "region") return "추가 정보 · 2단계";
            if (step === "station") return "추가 정보 · 3단계";
            if (step === "detail") return "추가 정보 · 4단계";
            return "추가 정보 · 5단계";
          })()}
        </p>
      </div>

      <div className={styles.stepBody}>
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
      ) : step === "cost" ? (
        <>
          <div className={styles.intro}>
            <h2 className={styles.title}>
              지금 내고 있는
              <br />
              <span className={styles.accent}>월세·관리비</span>를 알려주세요
            </h2>
            <p className={styles.desc}>
              룸메와 나눌 비용을 계산하는 데 쓰여요.
            </p>
          </div>

          <section className={styles.block}>
            <div className={styles.field}>
              <p className={styles.label}>
                현재 월세 <span className={styles.required}>*</span>
              </p>
              <p className={styles.fieldHint}>
                지금 내고 있는 월세 금액을 적어 주세요.
              </p>
              <div className={styles.amountField}>
                <Input
                  id="rentAmount"
                  className={styles.input}
                  inputMode="numeric"
                  placeholder="예: 30"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(digitsOnly(e.target.value))}
                />
                <span className={styles.amountSuffix} aria-hidden>
                  만원
                </span>
              </div>
            </div>

            <div className={styles.field}>
              <p className={styles.label}>
                현재 관리비 <span className={styles.required}>*</span>
              </p>
              <p className={styles.fieldHint}>
                평균적으로 내고 있는 관리비 금액을 적어 주세요.
              </p>
              <div className={styles.fieldNotice} role="note">
                공동사용료, 수도, 전기 등을 모두 포함한 금액으로 적어 주세요.
              </div>
              <div className={styles.amountField}>
                <Input
                  id="mgmtAmount"
                  className={styles.input}
                  inputMode="numeric"
                  placeholder="예: 3"
                  value={mgmtAmount}
                  onChange={(e) => setMgmtAmount(digitsOnly(e.target.value))}
                />
                <span className={styles.amountSuffix} aria-hidden>
                  만원
                </span>
              </div>
            </div>
          </section>
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
              광역을 고른 뒤 구/시를 하나 선택해 주세요.
            </p>
          </div>

          <section className={styles.block}>
            <h3 className={styles.blockTitle}>
              {hasRoom ? "거주 지역" : "희망 지역"}
            </h3>
            <p className={styles.blockHint}>
              광역을 고른 뒤 구/시를 하나 선택해 주세요.
            </p>
            <div className={styles.field}>
              <p className={styles.label}>
                1. 전체 지역 <span className={styles.required}>*</span>
              </p>
              <div className={styles.chipRow}>
                {REGION_CITIES.map((city) => {
                  return (
                    <button
                      key={city}
                      type="button"
                      className={cn(
                        styles.chip,
                        regionCity === city && styles.chipActive,
                        selectedCity === city &&
                          regionCity !== city &&
                          styles.chipSelected,
                      )}
                      onClick={() => setRegionCity(city)}
                    >
                      {city}
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
                          selectedRegion === value && styles.chipActive,
                        )}
                        onClick={() =>
                          setRegions((prev) =>
                            selectDistrict(prev, regionCity, district),
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

            {selectedRegion ? (
              <div className={styles.field}>
                <p className={styles.label}>선택한 지역</p>
                <div className={styles.selectedRow}>
                  <button
                    type="button"
                    className={styles.selectedChip}
                    onClick={() => setRegions([])}
                  >
                    {selectedRegion}
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </>
      ) : step === "station" ? (
        <>
          <div className={styles.intro}>
            <h2 className={styles.title}>
              가장 가까운
              <br />
              <span className={styles.accent}>지하철역</span>을 알려주세요
            </h2>
            <p className={styles.desc}>
              {selectedRegion
                ? `${selectedRegion}에서 가장 가까운 역을 찾아볼게요.`
                : "집 근처 역을 검색해 주세요."}
            </p>
          </div>

          <div className={styles.stationChoice}>
            <button
              type="button"
              className={cn(
                styles.stationChoiceBtn,
                nearestStation !== NO_NEARBY_STATION &&
                  styles.stationChoiceBtnOn,
              )}
              onClick={() => {
                if (nearestStation === NO_NEARBY_STATION) {
                  setNearestStation("");
                }
              }}
            >
              역 검색하기
            </button>
            <button
              type="button"
              className={cn(
                styles.stationChoiceBtn,
                nearestStation === NO_NEARBY_STATION &&
                  styles.stationChoiceBtnOn,
              )}
              onClick={() => {
                setNearestStation(NO_NEARBY_STATION);
                setStationQuery("");
              }}
            >
              가까운 역 없음
            </button>
          </div>

          <div
            className={cn(
              styles.stationFold,
              nearestStation === NO_NEARBY_STATION && styles.stationFoldClosed,
            )}
          >
            <div
              className={styles.stationFoldInner}
              aria-hidden={nearestStation === NO_NEARBY_STATION}
            >
              {nearestStation && nearestStation !== NO_NEARBY_STATION ? (
                <div className={styles.stationPicked}>
                  <span className={styles.stationPickedIcon} aria-hidden>
                    <MapPin className="size-4" strokeWidth={2.3} />
                  </span>
                  <span className={styles.stationPickedText}>
                    <span className={styles.stationPickedLabel}>선택한 역</span>
                    <span className={styles.stationPickedName}>
                      {nearestStation}
                    </span>
                  </span>
                  <button
                    type="button"
                    className={styles.stationPickedClear}
                    onClick={() => setNearestStation("")}
                  >
                    다시 고르기
                  </button>
                </div>
              ) : null}

              <div className={styles.stationSearch}>
                <Search
                  className={styles.stationSearchIcon}
                  size={18}
                  strokeWidth={2.2}
                  aria-hidden
                />
                <Input
                  className={cn(styles.input, styles.stationSearchInput)}
                  placeholder={
                    selectedCity
                      ? `${selectedCity} 역 이름 검색`
                      : "역 이름 검색"
                  }
                  value={stationQuery}
                  onChange={(e) => setStationQuery(e.target.value)}
                  tabIndex={
                    nearestStation === NO_NEARBY_STATION ? -1 : undefined
                  }
                />
                {stationQuery ? (
                  <button
                    type="button"
                    className={styles.stationSearchClear}
                    aria-label="검색어 지우기"
                    tabIndex={
                      nearestStation === NO_NEARBY_STATION ? -1 : undefined
                    }
                    onClick={() => setStationQuery("")}
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>

              {!stationQuery.trim() &&
              !(
                nearestStation && nearestStation !== NO_NEARBY_STATION
              ) ? (
                <p className={styles.stationHint}>
                  역 이름을 입력하면 아래에서 고를 수 있어요
                </p>
              ) : null}

              <div className={styles.stationList}>
                {showCustomStation ? (
                  <button
                    type="button"
                    className={styles.stationItem}
                    tabIndex={
                      nearestStation === NO_NEARBY_STATION ? -1 : undefined
                    }
                    onClick={() => {
                      setNearestStation(customStationLabel);
                      setStationQuery("");
                    }}
                  >
                    <span className={styles.stationItemIcon} aria-hidden>
                      <MapPin className="size-4" strokeWidth={2.3} />
                    </span>
                    <span className={styles.stationItemText}>
                      <span className={styles.stationName}>
                        {customStationLabel}
                      </span>
                      <span className={styles.stationMeta}>
                        이 이름으로 추가
                      </span>
                    </span>
                  </button>
                ) : null}

                {stationSuggestions.map((station) => {
                  const label = formatStationLabel(station);
                  return (
                    <button
                      key={`${station.city}-${station.name}-${station.line}`}
                      type="button"
                      className={cn(
                        styles.stationItem,
                        nearestStation === label && styles.stationItemActive,
                      )}
                      tabIndex={
                        nearestStation === NO_NEARBY_STATION ? -1 : undefined
                      }
                      onClick={() => {
                        setNearestStation(label);
                        setStationQuery("");
                      }}
                    >
                      <span className={styles.stationItemIcon} aria-hidden>
                        <MapPin className="size-4" strokeWidth={2.3} />
                      </span>
                      <span className={styles.stationItemText}>
                        <span className={styles.stationName}>{label}</span>
                        <span className={styles.stationMeta}>
                          {station.city} · {station.line}
                        </span>
                      </span>
                    </button>
                  );
                })}

                {stationQuery.trim() &&
                !showCustomStation &&
                stationSuggestions.length === 0 ? (
                  <p className={styles.stationHint}>맞는 역이 없어요.</p>
                ) : null}
              </div>
            </div>
          </div>
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
        </>
      ) : (
        <>
          <div className={styles.intro}>
            <h2 className={styles.title}>
              원하는 <span className={styles.accent}>살짝 조건</span> 및
              <br />
              동의 부분을 확인해 주세요
            </h2>
            <p className={styles.desc}>
              원하는 살짝 조건과 서비스 이용 동의를 확인해 주세요.
            </p>
          </div>

          {hasRoom ? (
            <section className={styles.block}>
              <h3 className={styles.blockTitle}>원하는 살짝 조건</h3>
              <p className={styles.blockHint}>
                성별, 분담 방식, 함께하기 어려운 점
              </p>

              <div className={styles.field}>
                <p className={styles.label}>
                  선호 살짝 성별 <span className={styles.required}>*</span>
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
                      onClick={() => {
                        setPrefGender(opt.value);
                        if (opt.value !== "male" && opt.value !== "female") {
                          setRestrictListingByPrefGender(null);
                        }
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {prefGender === "male" || prefGender === "female" ? (
                  <div className={styles.genderScopeCard}>
                    <div className={styles.genderScopeHead}>
                      <p className={styles.genderScopeTitle}>게시글 노출</p>
                      <p className={styles.genderScopeDesc}>
                        살짝을 찾을 때
                        <br />
                        {prefGender === "female" ? "여성" : "남성"}으로 가입한
                        기준으로만
                        <br />
                        노출을 시켜드릴까요?
                      </p>
                    </div>
                    <div className={styles.genderScopeActions}>
                      <button
                        type="button"
                        className={cn(
                          styles.genderScopeBtn,
                          restrictListingByPrefGender === false &&
                            styles.genderScopeBtnActive,
                        )}
                        onClick={() => setRestrictListingByPrefGender(false)}
                      >
                        <span className={styles.genderScopeBtnLabel}>
                          아니요, 괜찮아요
                        </span>
                        <span className={styles.genderScopeBtnSub}>
                          전체 성별로 공고 올릴게요
                        </span>
                      </button>
                      <button
                        type="button"
                        className={cn(
                          styles.genderScopeBtn,
                          restrictListingByPrefGender === true &&
                            styles.genderScopeBtnActive,
                        )}
                        onClick={() => setRestrictListingByPrefGender(true)}
                      >
                        <span className={styles.genderScopeBtnLabel}>
                          네, 도와주세요!
                        </span>
                        <span className={styles.genderScopeBtnSub}>
                          {prefGender === "female" ? "여성" : "남성"}만 볼 수
                          있게 해주세요
                        </span>
                      </button>
                    </div>
                  </div>
                ) : null}
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
                      placeholder="예:50 (살짝이 낼 분담률이에요)"
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
                      placeholder="예:50 (살짝이 낼 분담률이에요)"
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
                  : "예: 강남·서초 쪽 원룸 구해요. 주말엔 같이 밥 해먹을 살짝이면 좋아요"
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
                          살짝 매칭을 위해 프로필이 다른 회원에게 보여져요
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
        </>
      )}
      </div>

      {step !== "role" ? (
        <div className={styles.submitDock}>
          {step === "prefs" ? (
            <div className={styles.submitGroup}>
              <Button
                type="button"
                className={styles.submit}
                size="lg"
                disabled={detailInvalid}
                onClick={() => {
                  if (detailInvalid) return;
                  if (hasRoom) {
                    setPostConfirmOpen(true);
                    return;
                  }
                  leaveTo("find");
                }}
              >
                {hasRoom ? "바로 살짝 구할게요" : "이 정보로 살짝 찾기"}
              </Button>
              {hasRoom ? (
                <Button
                  type="button"
                  variant="outline"
                  className={cn(styles.submit, styles.submitSecondary)}
                  size="lg"
                  disabled={detailInvalid}
                  onClick={() => leaveTo("profile")}
                >
                  일단 등록만 할게요
                </Button>
              ) : null}
            </div>
          ) : (
            <Button
              type="button"
              className={styles.submit}
              size="lg"
              disabled={
                step === "cost"
                  ? costInvalid
                  : step === "region"
                    ? regions.length === 0
                    : step === "station"
                      ? !nearestStation.trim()
                      : lifestyleInvalid
              }
              onClick={
                step === "cost"
                  ? handleNextFromCost
                  : step === "region"
                    ? handleNextFromRegion
                    : step === "station"
                      ? handleNextFromStation
                      : handleNextFromDetail
              }
            >
              다음
            </Button>
          )}
        </div>
      ) : null}

      <Dialog open={autosaveTipOpen} onOpenChange={setAutosaveTipOpen}>
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

      <Dialog open={postConfirmOpen} onOpenChange={setPostConfirmOpen}>
        <DialogContent className={styles.dialogContent} showCloseButton={false}>
          <div className={cn(styles.modalInner, styles.modalInnerSpacious)}>
            <DialogHeader
              className={cn(styles.modalHeader, styles.modalHeaderSpacious)}
            >
              <DialogTitle className={styles.modalTitle}>
                살짝 구하기를 등록할까요?
              </DialogTitle>
              <DialogDescription className={styles.modalDesc}>
                입력한 정보를 토대로
                <br />
                찾기 탭에 게시글이 바로 올라가요.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter
              className={cn(styles.dialogFooter, styles.dialogFooterDual)}
            >
              <Button
                type="button"
                className={styles.modalAction}
                size="lg"
                onClick={() => {
                  setPostConfirmOpen(false);
                  leaveTo("post");
                }}
              >
                살짝 구하기
              </Button>
              <Button
                type="button"
                variant="outline"
                className={cn(styles.modalAction, styles.modalActionSecondary)}
                size="lg"
                onClick={() => setPostConfirmOpen(false)}
              >
                나중에 할게요
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
