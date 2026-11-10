import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CookingPot,
  Eye,
  ImagePlus,
  Lock,
  MapPin,
  PenLine,
  RotateCcw,
  Search,
  ShieldCheck,
  Sofa,
  Sun,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { resolveStorageUserId } from "@/lib/authUserId";
import { loadAccessToken } from "@/lib/authStorage";
import { submitListingDraft } from "@/lib/roomRegister/submitListing";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { uploadTmpRoomPhotoFromUrl } from "@/lib/supabase/roomPhotos";
import { normalizePhotoCategory } from "@/lib/roomRegister/normalizePhotoCategory";
import { registerErrorMessage } from "@/service/room/register";
import {
  deleteTmpRoomPhoto,
  listTmpRoomPhotos,
  registerTmpRoomPhoto,
  tmpRoomPhotosErrorMessage,
} from "@/service/room/tmpPhotos";
import { ApiError } from "@/service/http";
import { useAuth } from "@/context/AuthContext";
import { SubwayLineBadges } from "@/components/ui/subway";
import { REGION_CITIES, REGION_TREE } from "@/lib/regions";
import { cn } from "@/lib/utils";
import { ListingDetail } from "@/pages/find/listingDetail";
import { COUNSELOR_IMG } from "@/pages/home/CounselorAvatar";
import { PRESET_TAGS } from "./draft";
import { MAX_PHOTOS, readPhoto } from "./photo";
import { searchJuso, type JusoItem } from "@/lib/juso";
import {
  searchRoomAddress,
  searchStations,
  type StationSearchItem,
} from "@/service/room";
import { useRoommate } from "./store";
import { areaLabel, monthlyBurden, toListingDetail } from "./toDetail";
import type {
  CleanLevel,
  Drink,
  HouseType,
  LifeRhythm,
  ListingDraft,
  ListingPhoto,
  NoiseLevel,
  Pet,
  PrefAge,
  PrefGender,
  PrefJob,
  PhotoCategory,
  SharedArea,
  Smoking,
  Utilities,
} from "./types";
import styles from "./create.module.css";

type Option<T extends string> = {
  value: T;
  label: string;
  desc?: string;
  icon?: LucideIcon;
};

const HOUSE: Option<HouseType>[] = [
  { value: "studio", label: "원룸" },
  { value: "two", label: "투룸" },
  { value: "three", label: "쓰리룸 이상" },
  { value: "other", label: "기타" },
];
const AREAS: Option<SharedArea>[] = [
  { value: "living", label: "거실", icon: Sofa },
  { value: "kitchen", label: "주방", icon: CookingPot },
  { value: "bath", label: "화장실", icon: Bath },
  { value: "balcony", label: "베란다", icon: Sun },
];
const UTILITIES: Option<Utilities>[] = [
  { value: "separate", label: "공과금 별도" },
  { value: "included", label: "공과금 포함" },
];
const SMOKING: Option<Smoking>[] = [
  { value: "no", label: "비흡연", desc: "담배를 피우지 않아요" },
  { value: "indoor-no", label: "실내 금연", desc: "밖에서만 피워요" },
  { value: "yes", label: "흡연 가능", desc: "집에서도 괜찮아요" },
];
const DRINK: Option<Drink>[] = [
  { value: "none", label: "음주 안 함" },
  { value: "sometimes", label: "가끔 마셔요" },
  { value: "often", label: "자주 마셔요" },
];
const PET: Option<Pet>[] = [
  { value: "none", label: "반려동물 없음" },
  { value: "have", label: "키우고 있어요" },
  { value: "ok", label: "함께해도 좋아요" },
];
const RHYTHM: Option<LifeRhythm>[] = [
  { value: "morning", label: "아침형", desc: "일찍 자고 일찍 일어나요" },
  { value: "evening", label: "저녁형", desc: "밤에 주로 활동해요" },
  { value: "flex", label: "자유로운 편", desc: "그때그때 달라요" },
];
const CLEAN: Option<CleanLevel>[] = [
  { value: "high", label: "매우 중요해요", desc: "바로바로 정리해요" },
  { value: "normal", label: "중요한 편이에요", desc: "정해진 날 함께 치워요" },
  { value: "easy", label: "편하게 지내요", desc: "크게 신경 쓰지 않아요" },
];
const NOISE: Option<NoiseLevel>[] = [
  { value: "quiet", label: "조용한 생활", desc: "집에서는 조용히 지내요" },
  {
    value: "normal",
    label: "일반적인 생활",
    desc: "평범한 생활 소음 정도예요",
  },
  { value: "ok", label: "소음 괜찮아요", desc: "어느 정도는 신경 쓰지 않아요" },
];
const GENDER: Option<PrefGender>[] = [
  { value: "any", label: "성별 무관" },
  { value: "female", label: "여성" },
  { value: "male", label: "남성" },
];
const AGE: Option<PrefAge | "any">[] = [
  { value: "20s", label: "20대" },
  { value: "30s", label: "30대" },
  { value: "40s", label: "40대 이상" },
  { value: "any", label: "상관없어요" },
];
const JOB: Option<PrefJob>[] = [
  { value: "worker", label: "직장인" },
  { value: "student", label: "학생" },
  { value: "freelance", label: "프리랜서" },
  { value: "any", label: "직업 무관" },
];
const SECTIONS = [
  "공간 정보",
  "사진 등록",
  "비용 정보",
  "생활 조건",
  "동거인 조건",
  "위치",
  "미리보기",
];

type QuestionId =
  | "house"
  | "areas"
  | "photos"
  | "price"
  | "smoking"
  | "drink"
  | "pet"
  | "rhythm"
  | "clean"
  | "noise"
  | "gender"
  | "age"
  | "job"
  | "tags"
  | "city"
  | "district"
  | "address"
  | "review";

type Question = {
  id: QuestionId;
  step: number;
  title: string;
  sub: string;
  auto: boolean;
};

const QUESTIONS: Question[] = [
  {
    id: "house",
    step: 0,
    auto: true,
    title: "집 구조는 어떤가요?",
    sub: "방 형태를 골라주세요.",
  },
  {
    id: "areas",
    step: 0,
    auto: false,
    title: "함께 쓰는 공간을 골라주세요",
    sub: "여러 개 고를 수 있어요.",
  },
  {
    id: "photos",
    step: 1,
    auto: false,
    title: "함께 살 공간을 보여주세요",
    sub: `대표 사진 1장은 꼭 필요해요. 최대 ${MAX_PHOTOS}장까지 올릴 수 있어요.`,
  },
  {
    id: "price",
    step: 2,
    auto: false,
    title: "현재 내고 있는 월세는 얼마인가요?",
    sub: "내고 있는 월세와 관리비를 알려주세요.",
  },
  {
    id: "smoking",
    step: 3,
    auto: true,
    title: "집에서 흡연은 어떤가요?",
    sub: "함께 살 때 중요한 생활 습관을 알려주세요.",
  },
  {
    id: "drink",
    step: 3,
    auto: true,
    title: "술은 얼마나 마시나요?",
    sub: "평소 생활에 가까운 쪽을 골라주세요.",
  },
  {
    id: "pet",
    step: 3,
    auto: true,
    title: "반려동물이 있나요?",
    sub: "함께 사는 동물이 있다면 알려주세요.",
  },
  {
    id: "rhythm",
    step: 3,
    auto: true,
    title: "주로 언제 활동하나요?",
    sub: "생활 시간이 맞으면 더 편하게 지낼 수 있어요.",
  },
  {
    id: "clean",
    step: 3,
    auto: true,
    title: "청결은 얼마나 중요한가요?",
    sub: "집안일 기준을 미리 맞춰두면 좋아요.",
  },
  {
    id: "noise",
    step: 3,
    auto: true,
    title: "집에서의 소음은 어떤가요?",
    sub: "평소 생활 모습을 골라주세요.",
  },
  {
    id: "gender",
    step: 4,
    auto: true,
    title: "어떤 사람과 함께 살고 싶나요?",
    sub: "원하는 성별을 골라주세요.",
  },
  {
    id: "age",
    step: 4,
    auto: true,
    title: "원하는 연령대가 있나요?",
    sub: "비슷한 나이대를 원한다면 골라주세요.",
  },
  {
    id: "job",
    step: 4,
    auto: true,
    title: "어떤 일을 하는 분이면 좋을까요?",
    sub: "생활 패턴을 맞추는 데 도움이 돼요.",
  },
  {
    id: "tags",
    step: 4,
    auto: false,
    title: "이런 분이면 더 좋아요",
    sub: "선택하지 않아도 괜찮아요.",
  },
  {
    id: "city",
    step: 5,
    auto: true,
    title: "어디에서 함께 살게 되나요?",
    sub: "시·도를 골라주세요.",
  },
  {
    id: "district",
    step: 5,
    auto: true,
    title: "어느 구·군인가요?",
    sub: "공고에는 동네까지만 보여요.",
  },
  {
    id: "address",
    step: 5,
    auto: false,
    title: "동네와 주소를 알려주세요",
    sub: "",
  },
  {
    id: "review",
    step: 6,
    auto: false,
    title: "이렇게 공고를 등록할까요?",
    sub: "항목을 눌러 언제든 수정할 수 있어요.",
  },
];

const INTRO = -1;
const REVIEW = QUESTIONS.length - 1;
const STEP_KEY = "ssj-listing-step";
const AUTO_DELAY = 260;

function indexOf(id: QuestionId) {
  return QUESTIONS.findIndex((question) => question.id === id);
}

function labelOf<T extends string>(options: Option<T>[], value: T) {
  return options.find((option) => option.value === value)?.label ?? "";
}

function readStoredPos(): number | null {
  try {
    const raw = localStorage.getItem(STEP_KEY);
    if (raw == null) return null;
    const pos = Number(raw);
    return Number.isInteger(pos) && pos >= 0 && pos < QUESTIONS.length
      ? pos
      : null;
  } catch {
    return null;
  }
}

function writeStoredPos(pos: number | null) {
  try {
    if (pos == null) localStorage.removeItem(STEP_KEY);
    else localStorage.setItem(STEP_KEY, String(pos));
  } catch {
    /* ignore */
  }
}

function missingOf(id: QuestionId, draft: ListingDraft) {
  if (id === "house" && !draft.space.houseType) return "집 구조를 골라주세요.";
  if (id === "areas" && draft.space.sharedAreas.length === 0)
    return "함께 쓰는 공간을 하나 이상 골라주세요.";
  if (id === "photos" && draft.photos.length === 0) return "required";
  if (id === "price" && draft.price.rentMan == null)
    return "월세를 입력해주세요.";
  if (id === "price" && !draft.price.utilities) return "공과금을 골라주세요.";
  if (
    (id === "smoking" && !draft.living.smoking) ||
    (id === "drink" && !draft.living.drink) ||
    (id === "pet" && !draft.living.pet) ||
    (id === "rhythm" && !draft.living.rhythm) ||
    (id === "clean" && !draft.living.clean) ||
    (id === "noise" && !draft.living.noise) ||
    (id === "gender" && !draft.preference.gender) ||
    (id === "age" && !draft.preference.age)
  )
    return "required";
  if (id === "address" && (!draft.area.city || !draft.area.district))
    return "지역을 골라주세요.";
  return "";
}

const REQUIRED: QuestionId[] = [
  "house",
  "areas",
  "photos",
  "price",
  "smoking",
  "drink",
  "pet",
  "rhythm",
  "clean",
  "noise",
  "gender",
  "age",
  "address",
];

const PHOTO_CATEGORIES: PhotoCategory[] = [
  "거실",
  "방",
  "주방",
  "화장실",
  "현관",
  "기타",
];

export function CreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { draft, setDraft, resetDraft } = useRoommate();
  const [pos, setPos] = useState(INTRO);
  const [resumePos, setResumePos] = useState<number | null>(readStoredPos);
  const [dir, setDir] = useState<"forward" | "back">("forward");
  const [editing, setEditing] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tip, setTip] = useState("");
  const lockRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const tipTimerRef = useRef<number | null>(null);
  const submitRef = useRef(false);

  useEffect(
    () => () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      if (tipTimerRef.current != null) window.clearTimeout(tipTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    document.querySelector("main")?.scrollTo({ top: 0 });
    setTip("");
  }, [pos, detailOpen]);

  const patch = (next: Partial<ListingDraft>) =>
    setDraft({ ...draft, ...next });

  const goTo = (next: number, direction: "forward" | "back") => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    lockRef.current = false;
    setDir(direction);
    setPos(next);
    writeStoredPos(next >= 0 ? next : null);
  };

  const showTip = (message: string) => {
    setTip(message);
    if (tipTimerRef.current != null) window.clearTimeout(tipTimerRef.current);
    tipTimerRef.current = window.setTimeout(() => setTip(""), 2400);
  };

  const advance = () => {
    const next = pos + 1;
    if (editing && QUESTIONS[next]?.step !== QUESTIONS[pos].step) {
      setEditing(false);
      goTo(REVIEW, "forward");
      return;
    }
    goTo(next, "forward");
  };

  const pick = (apply: () => void) => {
    if (lockRef.current) return;
    lockRef.current = true;
    apply();
    timerRef.current = window.setTimeout(advance, AUTO_DELAY);
  };

  const back = () => {
    if (detailOpen) {
      setDetailOpen(false);
      return;
    }
    if (pos === INTRO) {
      navigate(-1);
      return;
    }
    if (editing) {
      setEditing(false);
      goTo(REVIEW, "back");
      return;
    }
    goTo(pos - 1, "back");
  };

  const editFrom = (id: QuestionId) => {
    setDetailOpen(false);
    setEditing(true);
    goTo(indexOf(id), "back");
  };

  const submit = async () => {
    if (submitRef.current) return;
    const missing = REQUIRED.find((id) => missingOf(id, draft));
    if (missing) {
      editFrom(missing);
      return;
    }
    if (!draft.consent.profileAgree) {
      showTip("매칭 프로필 제공 동의가 필요해요.");
      return;
    }
    if (!loadAccessToken()) {
      showTip("로그인 후 공고를 등록할 수 있어요.");
      navigate("/login", { state: { from: "/roommate/new" } });
      return;
    }
    if (
      draft.preference.gender &&
      draft.preference.gender !== "any" &&
      draft.register.restrictGender === undefined
    ) {
      /* restrictGender is boolean, default false — ok */
    }

    submitRef.current = true;
    setSubmitting(true);
    try {
      await submitListingDraft(draft);
      resetDraft();
      writeStoredPos(null);
      navigate("/roommate/done", { replace: true });
    } catch (err) {
      submitRef.current = false;
      const message =
        err instanceof ApiError
          ? registerErrorMessage(err)
          : err instanceof Error
            ? err.message
            : registerErrorMessage(err);
      showTip(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (detailOpen) {
    return (
      <section className={styles.wizard}>
        <ListingDetail
          preview
          listing={previewOf(draft)}
          onBack={() => setDetailOpen(false)}
        />
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => setDetailOpen(false)}
          >
            돌아가기
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={submitting}
            onClick={submit}
          >
            공고 등록하기
          </button>
        </div>
      </section>
    );
  }

  if (pos === INTRO) {
    return (
      <section className={styles.wizard}>
        <header className={styles.top}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="뒤로"
            onClick={back}
          >
            <ArrowLeft size={21} strokeWidth={2.2} />
          </button>
        </header>
        <div className={styles.intro}>
          <div className={styles.introArt}>
            <img src={COUNSELOR_IMG.greeting} alt="" />
          </div>
          <h1 className={styles.introTitle}>
            함께 살 사람을
            <br />
            <em>찾아보세요</em>
          </h1>
          <p className={styles.introDesc}>
            지금 살고 있는 집의 빈 공간을
            <br />
            함께 사용할 동거인을 모집해보세요.
          </p>
          <ul className={styles.introPoints}>
            <li>
              <PenLine size={19} strokeWidth={2} />
              간편한 등록
            </li>
            <li>
              <ShieldCheck size={19} strokeWidth={2} />
              주소는 비공개
            </li>
            <li>
              <RotateCcw size={19} strokeWidth={2} />
              이어서 작성
            </li>
          </ul>
        </div>
        <div className={styles.footer}>
          <button
            type="button"
            className={cn(styles.primary, styles.full)}
            onClick={() => {
              const next = resumePos ?? 0;
              setResumePos(null);
              goTo(next, "forward");
            }}
          >
            {resumePos != null ? "이어서 작성하기" : "공고 등록 시작하기"}
            <ArrowRight size={18} strokeWidth={2.4} />
          </button>
        </div>

        {resumePos != null ? (
          <div className={styles.sheetBackdrop} role="presentation">
            <div
              className={styles.sheet}
              role="dialog"
              aria-labelledby="resume-title"
            >
              <h2 id="resume-title" className={styles.sheetTitle}>
                작성 중인 공고가 있어요
              </h2>
              <p className={styles.sheetDesc}>
                지금까지 입력한 내용이 저장되어 있어요.
                <br />
                이어서 작성하거나 처음부터 다시 시작할 수 있어요.
              </p>
              <button
                type="button"
                className={cn(styles.primary, styles.full)}
                onClick={() => {
                  const next = resumePos;
                  setResumePos(null);
                  goTo(next, "forward");
                }}
              >
                이어서 작성하기
              </button>
              <button
                type="button"
                className={cn(styles.ghost, styles.full)}
                onClick={() => {
                  resetDraft();
                  writeStoredPos(null);
                  setResumePos(null);
                }}
              >
                처음부터 다시 쓰기
              </button>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  const question = QUESTIONS[pos];
  const steps = QUESTIONS.filter((item) => item.step === question.step);
  const subIndex = steps.findIndex((item) => item.id === question.id);
  const progress =
    ((question.step + (subIndex + 1) / steps.length) / SECTIONS.length) * 100;
  const missing = missingOf(question.id, draft);
  const lastOfStep = QUESTIONS[pos + 1]?.step !== question.step;
  const tipText = missing && missing !== "required" ? missing : "";

  const next = () => {
    if (tipText) {
      showTip(tipText);
      return;
    }
    setTip("");
    advance();
  };

  const body = (): ReactNode => {
    switch (question.id) {
      case "house":
        return (
          <>
            <ChoiceList
              options={HOUSE}
              value={draft.space.houseType || null}
              onPick={(houseType) =>
                pick(() => patch({ space: { ...draft.space, houseType } }))
              }
            />
            {draft.space.houseType === "other" ? (
              <label className={styles.field} style={{ marginTop: "1rem" }}>
                <span className={styles.fieldLabel}>기타 — 직접 입력</span>
                <input
                  className={styles.input}
                  value={draft.register.houseTypeInput}
                  onChange={(event) =>
                    patch({
                      register: {
                        ...draft.register,
                        houseTypeInput: event.target.value,
                      },
                    })
                  }
                  placeholder="예) 오피스텔, 복층"
                />
              </label>
            ) : null}
          </>
        );
      case "areas":
        return (
          <MultiChoice
            options={AREAS}
            values={draft.space.sharedAreas}
            onChange={(sharedAreas) =>
              patch({ space: { ...draft.space, sharedAreas } })
            }
          />
        );
      case "photos":
        return (
          <PhotoStep
            photos={draft.photos}
            onChange={(photos) => patch({ photos })}
          />
        );
      case "price":
        return <PriceStep draft={draft} patch={patch} />;
      case "smoking":
        return (
          <ChoiceList
            options={SMOKING}
            value={draft.living.smoking || null}
            onPick={(smoking) =>
              pick(() => patch({ living: { ...draft.living, smoking } }))
            }
          />
        );
      case "drink":
        return (
          <ChoiceList
            options={DRINK}
            value={draft.living.drink || null}
            onPick={(drink) =>
              pick(() => patch({ living: { ...draft.living, drink } }))
            }
          />
        );
      case "pet":
        return (
          <ChoiceList
            options={PET}
            value={draft.living.pet || null}
            onPick={(pet) =>
              pick(() => patch({ living: { ...draft.living, pet } }))
            }
          />
        );
      case "rhythm":
        return (
          <ChoiceList
            options={RHYTHM}
            value={draft.living.rhythm || null}
            onPick={(rhythm) =>
              pick(() => patch({ living: { ...draft.living, rhythm } }))
            }
          />
        );
      case "clean":
        return (
          <ChoiceList
            options={CLEAN}
            value={draft.living.clean || null}
            onPick={(clean) =>
              pick(() => patch({ living: { ...draft.living, clean } }))
            }
          />
        );
      case "noise":
        return (
          <ChoiceList
            options={NOISE}
            value={draft.living.noise || null}
            onPick={(noise) =>
              pick(() => patch({ living: { ...draft.living, noise } }))
            }
          />
        );
      case "gender":
        return (
          <>
            <ChoiceList
              options={GENDER}
              value={draft.preference.gender || null}
              onPick={(gender) =>
                pick(() =>
                  patch({
                    preference: { ...draft.preference, gender },
                    register: {
                      ...draft.register,
                      restrictGender:
                        gender === "any"
                          ? false
                          : draft.register.restrictGender,
                    },
                  }),
                )
              }
            />
            {draft.preference.gender && draft.preference.gender !== "any" ? (
              <div className={styles.field} style={{ marginTop: "1rem" }}>
                <span className={styles.fieldLabel}>상세 공개</span>
                <div className={styles.segment} role="radiogroup">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={!draft.register.restrictGender}
                    className={cn(
                      styles.segmentItem,
                      !draft.register.restrictGender && styles.segmentOn,
                    )}
                    onClick={() =>
                      patch({
                        register: { ...draft.register, restrictGender: false },
                      })
                    }
                  >
                    목록만 공개
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={draft.register.restrictGender}
                    className={cn(
                      styles.segmentItem,
                      draft.register.restrictGender && styles.segmentOn,
                    )}
                    onClick={() =>
                      patch({
                        register: { ...draft.register, restrictGender: true },
                      })
                    }
                  >
                    {labelOf(GENDER, draft.preference.gender)} 회원만 상세 열람
                  </button>
                </div>
              </div>
            ) : null}
          </>
        );
      case "age":
        return (
          <ChoiceList
            options={AGE}
            value={draft.preference.age || null}
            onPick={(age) =>
              pick(() => patch({ preference: { ...draft.preference, age } }))
            }
          />
        );
      case "job":
        return (
          <ChoiceList
            options={JOB}
            value={draft.preference.job || null}
            onPick={(job) =>
              pick(() => patch({ preference: { ...draft.preference, job } }))
            }
          />
        );
      case "tags":
        return (
          <TagStep
            tags={draft.preference.tags}
            onChange={(tags) =>
              patch({ preference: { ...draft.preference, tags } })
            }
          />
        );
      case "city":
        return (
          <ChoiceList
            layout="chips"
            options={REGION_CITIES.map((city) => ({
              value: city,
              label: city,
            }))}
            value={draft.area.city || null}
            onPick={(city) =>
              pick(() =>
                patch({
                  area:
                    city === draft.area.city
                      ? draft.area
                      : { ...draft.area, city, district: "", dong: "" },
                }),
              )
            }
          />
        );
      case "district": {
        const districts = REGION_TREE[draft.area.city] ?? [];
        if (districts.length === 0) {
          return <p className={styles.hint}>시·도를 먼저 골라주세요.</p>;
        }
        return (
          <ChoiceList
            layout="chips"
            options={districts.map((district) => ({
              value: district,
              label: district,
            }))}
            value={draft.area.district || null}
            onPick={(district) =>
              pick(() =>
                patch({
                  area:
                    district === draft.area.district
                      ? draft.area
                      : { ...draft.area, district, dong: "" },
                }),
              )
            }
          />
        );
      }
      case "address":
        return (
          <AddressStep
            draft={draft}
            patch={patch}
            onChangeRegion={() => goTo(indexOf("city"), "back")}
          />
        );
      case "review":
        return (
          <ReviewStep
            draft={draft}
            patch={patch}
            userAgreements={user}
            onEdit={editFrom}
            onPreview={() => setDetailOpen(true)}
          />
        );
    }
  };

  return (
    <section className={styles.wizard}>
      <header className={styles.top}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label="이전"
          onClick={back}
        >
          <ArrowLeft size={21} strokeWidth={2.2} />
        </button>
        <p className={styles.stepLabel}>
          {SECTIONS[question.step]}
          <span>
            {question.step + 1}/{SECTIONS.length}
          </span>
        </p>
        <span />
      </header>
      <div className={styles.progress} aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div
        key={question.id}
        className={cn(
          styles.body,
          dir === "forward" ? styles.slideForward : styles.slideBack,
        )}
      >
        <h1 className={styles.title}>{withMark(question.title)}</h1>
        <p className={styles.sub}>
          {question.id === "address" ? (
            <>
              정확한 주소는 매칭 전까지 공개되지 않아요.
              <br />
              공고에는 {draft.area.district || "구"}까지만 보여요.
            </>
          ) : (
            question.sub
          )}
        </p>
        <div className={styles.content}>{body()}</div>
      </div>

      {question.auto ? null : (
        <div className={styles.footer}>
          {question.id === "review" ? (
            <button
              type="button"
              className={cn(styles.primary, styles.full)}
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? "등록하는 중…" : "공고 등록하기"}
            </button>
          ) : (
            <>
              <button type="button" className={styles.ghost} onClick={back}>
                이전
              </button>
              <div className={styles.nextWrap}>
                {tip ? (
                  <p className={styles.tip} role="status">
                    {tip}
                  </p>
                ) : null}
                <button
                  type="button"
                  className={styles.primary}
                  disabled={missing === "required"}
                  onClick={next}
                >
                  {editing && lastOfStep ? "수정 완료" : "다음"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function withMark(text: string): ReactNode {
  if (!text.includes("?")) return text;
  return text.split("?").flatMap((part, index) =>
    index === 0
      ? [part]
      : [
          <span key={index} className={styles.mark}>
            ?
          </span>,
          part,
        ],
  );
}

function previewOf(draft: ListingDraft) {
  return toListingDetail({
    ...draft,
    space: { ...draft.space, houseType: draft.space.houseType || "two" },
    price: {
      ...draft.price,
      utilities: draft.price.utilities || "separate",
    },
    living: {
      smoking: draft.living.smoking || "no",
      drink: draft.living.drink || "sometimes",
      pet: draft.living.pet || "none",
      rhythm: draft.living.rhythm || "flex",
      clean: draft.living.clean || "normal",
      noise: draft.living.noise || "quiet",
    },
    preference: {
      ...draft.preference,
      gender: draft.preference.gender || "any",
      age:
        draft.preference.age === "any" || draft.preference.age === ""
          ? ""
          : draft.preference.age,
    },
    id: "preview",
    mine: true,
    status: "DRAFT",
    stats: { views: 0, saves: 0, inquiries: 0 },
  });
}

function ChoiceList<T extends string>({
  options,
  value,
  onPick,
  layout = "list",
}: {
  options: Option<T>[];
  value: T | null;
  onPick: (value: T) => void;
  layout?: "list" | "grid" | "chips";
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        layout === "list" && styles.choiceList,
        layout === "grid" && styles.choiceGrid,
        layout === "chips" && styles.chipGrid,
      )}
    >
      {options.map((option) => {
        const on = value === option.value;
        const Icon = option.icon;
        if (layout === "chips") {
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={on}
              className={cn(styles.chip, on && styles.chipOn)}
              onClick={() => onPick(option.value)}
            >
              {option.label}
            </button>
          );
        }
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={on}
            className={cn(
              styles.choice,
              layout === "grid" && styles.choiceTile,
              on && styles.choiceOn,
            )}
            onClick={() => onPick(option.value)}
          >
            {Icon ? (
              <span className={styles.choiceIcon}>
                <Icon size={24} strokeWidth={1.9} />
              </span>
            ) : null}
            <span className={styles.choiceText}>
              <strong>{option.label}</strong>
              {option.desc ? <span>{option.desc}</span> : null}
            </span>
            <span className={styles.choiceCheck} aria-hidden>
              <Check size={14} strokeWidth={3} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MultiChoice<T extends string>({
  options,
  values,
  onChange,
}: {
  options: Option<T>[];
  values: T[];
  onChange: (values: T[]) => void;
}) {
  return (
    <div className={styles.chipGrid} role="group">
      {options.map((option) => {
        const on = values.includes(option.value);
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            className={cn(
              styles.chip,
              Icon && styles.chipTall,
              on && styles.chipOn,
            )}
            onClick={() =>
              onChange(
                on
                  ? values.filter((item) => item !== option.value)
                  : [...values, option.value],
              )
            }
          >
            {Icon ? <Icon size={22} strokeWidth={1.9} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function PhotoStep({
  photos,
  onChange,
}: {
  photos: ListingPhoto[];
  onChange: (photos: ListingPhoto[]) => void;
}) {
  const initialPhotosRef = useRef(photos);
  const [selectedId, setSelectedId] = useState(
    () => photos.find((photo) => photo.cover)?.id ?? photos[0]?.id ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!loadAccessToken() || !isSupabaseConfigured()) return;
      setHydrating(true);
      try {
        const { photos: remote } = await listTmpRoomPhotos();
        if (cancelled || remote.length === 0) return;

        const localByUrl = new Map(
          initialPhotosRef.current.map((photo) => [photo.url, photo]),
        );
        const prevCover =
          initialPhotosRef.current.find((photo) => photo.cover)?.id ?? "";

        const next: ListingPhoto[] = remote.map((photo) => {
          const local = localByUrl.get(photo.url);
          const category =
            local?.category ??
            normalizePhotoCategory(photo.category) ??
            null;
          return {
            id: photo.id,
            url: photo.url,
            label: "집 사진",
            category,
            cover: false,
          };
        });

        const coverId =
          next.some((photo) => photo.id === prevCover) && prevCover
            ? prevCover
            : (next[0]?.id ?? "");
        onChange(
          next.map((photo, index) => ({
            ...photo,
            cover:
              photo.id === coverId || (coverId === "" && index === 0),
          })),
        );
        if (coverId) setSelectedId(coverId);
        else if (next[0]) setSelectedId(next[0].id);
      } catch {
        /* draft·로컬 상태만으로 진행 */
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 진입 시 임시 사진 1회 동기화
  }, []);

  const selectedIndex = Math.max(
    0,
    photos.findIndex((photo) => photo.id === selectedId),
  );
  const selected = photos[selectedIndex];
  const full = photos.length >= MAX_PHOTOS;

  const add = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    const picked = [...files].slice(0, room);
    setLoading(true);
    setError("");

    if (isSupabaseConfigured() && !resolveStorageUserId()) {
      setError("사진을 서버에 올리려면 로그인이 필요해요.");
      setLoading(false);
      return;
    }

    const added: ListingPhoto[] = [];
    let failed = 0;
    let lastError = "";

    for (let index = 0; index < picked.length; index += 1) {
      const file = picked[index];
      try {
        const localUrl = await readPhoto(file);
        if (!isSupabaseConfigured()) {
          throw new Error("supabase");
        }
        const userId = resolveStorageUserId();
        if (!userId) throw new Error("login");
        const url = await uploadTmpRoomPhotoFromUrl(userId, localUrl);
        const { photo } = await registerTmpRoomPhoto({ url, category: null });
        added.push({
          id: photo.id,
          url: photo.url,
          label: "집 사진",
          category: normalizePhotoCategory(photo.category),
          cover: false,
        });
      } catch (err) {
        failed += 1;
        lastError =
          err instanceof ApiError
            ? tmpRoomPhotosErrorMessage(err)
            : err instanceof Error && err.message === "login"
              ? "사진을 서버에 올리려면 로그인이 필요해요."
              : err instanceof Error && err.message === "supabase"
                ? "Supabase(.env) 미설정 — 사진 업로드를 할 수 없어요."
                : err instanceof Error
                  ? err.message
                  : tmpRoomPhotosErrorMessage(err);
      }
    }

    if (added.length === 0) {
      setError(
        lastError ||
          (failed > 0
            ? "사진 업로드에 실패했어요. 로그인·Supabase 설정을 확인해 주세요."
            : "사진을 불러오지 못했어요. 다른 사진으로 다시 시도해 주세요."),
      );
      setLoading(false);
      return;
    }

    const next = [...photos, ...added];
    if (next.length > 0 && !next.some((photo) => photo.cover)) {
      next[0] = { ...next[0], cover: true };
    }
    onChange(next);
    if (!selected && added[0]) setSelectedId(added[0].id);
    if (failed > 0)
      setError(`사진 ${failed}장을 올리지 못했어요. 나머지는 저장됐어요.`);
    else if (files.length > room)
      setError(`사진은 최대 ${MAX_PHOTOS}장까지 올릴 수 있어요.`);
    setLoading(false);
  };

  const remove = async (id: string) => {
    setError("");
    try {
      await deleteTmpRoomPhoto(id);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? tmpRoomPhotosErrorMessage(err)
          : tmpRoomPhotosErrorMessage(err),
      );
      return;
    }
    const next = photos.filter((photo) => photo.id !== id);
    if (next.length > 0 && !next.some((photo) => photo.cover)) {
      next[0] = { ...next[0], cover: true };
    }
    onChange(next);
    setSelectedId(next[Math.min(selectedIndex, next.length - 1)]?.id ?? "");
  };

  const move = (offset: -1 | 1) => {
    const target = selectedIndex + offset;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[selectedIndex], next[target]] = [next[target], next[selectedIndex]];
    onChange(next);
  };

  const fileInput = (
    <input
      type="file"
      accept="image/*"
      multiple
      hidden
      disabled={loading || hydrating || full}
      onChange={(event) => {
        void add(event.target.files);
        event.target.value = "";
      }}
    />
  );

  if (!selected) {
    return (
      <>
        <label className={cn(styles.photoEmpty, loading && styles.photoBusy)}>
          <ImagePlus size={30} strokeWidth={1.8} />
          <strong>
            {loading || hydrating
              ? hydrating
                ? "이전에 올린 사진 불러오는 중…"
                : "사진 업로드 중…"
              : "사진 추가하기"}
          </strong>
          <span>침실, 거실, 주방처럼 생활이 보이는 사진이 좋아요.</span>
          {fileInput}
        </label>
        {error ? <p className={styles.error}>{error}</p> : null}
      </>
    );
  }

  return (
    <>
      <div className={styles.photoMain}>
        <img src={selected.url} alt="" />
        {selected.cover ? (
          <span className={styles.coverBadge}>대표 사진</span>
        ) : (
          <button
            type="button"
            className={styles.coverSet}
            onClick={() =>
              onChange(
                photos.map((photo) => ({
                  ...photo,
                  cover: photo.id === selected.id,
                })),
              )
            }
          >
            대표로 설정
          </button>
        )}
        <span className={styles.photoCount}>
          {selectedIndex + 1}/{photos.length}
        </span>
      </div>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>사진 카테고리 (선택)</span>
        <select
          value={selected.category ?? ""}
          onChange={(event) => {
            const value = event.target.value as PhotoCategory | "";
            const next = photos.map((photo) =>
              photo.id === selected.id
                ? { ...photo, category: value || null }
                : photo,
            );
            onChange(next);
          }}
        >
          <option value="">선택 안 함</option>
          {PHOTO_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.photoTools}>
        <div className={styles.photoOrder}>
          <button
            type="button"
            aria-label="앞으로 이동"
            disabled={selectedIndex === 0}
            onClick={() => move(-1)}
          >
            <ChevronLeft size={18} strokeWidth={2.4} />
          </button>
          <span>순서</span>
          <button
            type="button"
            aria-label="뒤로 이동"
            disabled={selectedIndex === photos.length - 1}
            onClick={() => move(1)}
          >
            <ChevronRight size={18} strokeWidth={2.4} />
          </button>
        </div>
        <button
          type="button"
          className={styles.photoDelete}
          onClick={() => {
            void remove(selected.id);
          }}
        >
          <Trash2 size={15} strokeWidth={2.2} />
          삭제
        </button>
      </div>

      <div className={styles.thumbs}>
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            className={cn(
              styles.thumb,
              photo.id === selected.id && styles.thumbOn,
            )}
            aria-label={photo.cover ? "대표 사진" : "사진 선택"}
            onClick={() => setSelectedId(photo.id)}
          >
            <img src={photo.url} alt="" />
            {photo.cover ? (
              <span className={styles.thumbCover}>대표</span>
            ) : null}
          </button>
        ))}
        {full ? null : (
          <label
            className={cn(styles.thumbAdd, loading && styles.photoBusy)}
            aria-label="사진 추가"
          >
            <ImagePlus size={20} strokeWidth={2} />
            {fileInput}
          </label>
        )}
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
    </>
  );
}

function MoneyField({
  label,
  value,
  onChange,
  required = false,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  required?: boolean;
  placeholder: string;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        {label}
        {required ? null : <span>(선택)</span>}
      </span>
      <span className={styles.moneyInput}>
        <input
          type="text"
          inputMode="numeric"
          enterKeyHint="next"
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(event) => {
            const digits = event.target.value.replace(/[^\d]/g, "").slice(0, 5);
            onChange(digits === "" ? null : Number(digits));
          }}
        />
        <em>만원</em>
      </span>
    </label>
  );
}

function PriceStep({
  draft,
  patch,
}: {
  draft: ListingDraft;
  patch: (next: Partial<ListingDraft>) => void;
}) {
  const { price } = draft;
  const burden = price.rentMan == null ? null : monthlyBurden(draft);
  const setPrice = (next: Partial<ListingDraft["price"]>) =>
    patch({ price: { ...price, ...next } });

  return (
    <>
      <MoneyField
        label="월세"
        required
        placeholder="예) 40"
        value={price.rentMan}
        onChange={(rentMan) => setPrice({ rentMan })}
      />
      <MoneyField
        label="관리비"
        placeholder="예) 5"
        value={price.maintenanceMan}
        onChange={(maintenanceMan) => setPrice({ maintenanceMan })}
      />
      <div className={styles.field}>
        <span className={styles.fieldLabel}>공과금</span>
        <div className={styles.segment} role="radiogroup">
          {UTILITIES.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={price.utilities === option.value}
              className={cn(
                styles.segmentItem,
                price.utilities === option.value && styles.segmentOn,
              )}
              onClick={() => setPrice({ utilities: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <ShareGraph
        value={price.sharePercent}
        onChange={(sharePercent) => setPrice({ sharePercent })}
      >
        <div className={styles.estimate}>
          <span>예상 월 부담금</span>
          {burden == null ? (
            <p className={styles.estimateEmpty}>월세를 입력하면 계산해드려요</p>
          ) : (
            <>
              <strong>
                약 <b>{burden}</b>만원
                {price.utilities === "separate" ? " + 공과금" : ""}
              </strong>
              <small>
                월세 {price.rentMan}만원
                {price.maintenanceMan == null
                  ? ""
                  : ` + 관리비 ${price.maintenanceMan}만원`}
                의 {price.sharePercent}%
              </small>
            </>
          )}
        </div>
      </ShareGraph>
    </>
  );
}

function ShareGraph({
  value,
  onChange,
  children,
}: {
  value: number;
  onChange: (value: number) => void;
  children?: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const move = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const raw = ((clientX - rect.left) / rect.width) * 100;
    onChange(Math.round(Math.min(100, Math.max(0, raw))));
  };

  return (
    <div className={styles.shareBlock}>
      <p className={styles.shareAsk}>살짝과 나눌 비중을 정해주세요</p>
      <div className={styles.sharePanel}>
        <div
          ref={trackRef}
          className={styles.shareTrack}
          role="slider"
          tabIndex={0}
          aria-label="살짝과 나눌 비중"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          aria-valuetext={`살짝 ${value}퍼센트`}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            move(event.clientX);
          }}
          onPointerMove={(event) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
            move(event.clientX);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
              event.preventDefault();
              onChange(Math.min(100, value + 1));
            }
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
              event.preventDefault();
              onChange(Math.max(0, value - 1));
            }
          }}
        >
          <span className={styles.shareBar}>
            <span className={styles.shareMate} style={{ width: `${value}%` }} />
          </span>
          <span className={styles.shareHandle} style={{ left: `${value}%` }}>
            <em>{value}%</em>
          </span>
        </div>
        <div className={styles.shareLegend}>
          <span>살짝 {value}%</span>
          <span>나 {100 - value}%</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function normalizeTag(raw: string) {
  return raw.trim().replace(/^#+/, "").replace(/\s+/g, "");
}

function TagStep({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [text, setText] = useState("");
  const custom = tags.filter((tag) => !PRESET_TAGS.includes(tag));

  const add = () => {
    const next = normalizeTag(text);
    if (!next || tags.includes(next)) {
      setText("");
      return;
    }
    onChange([...tags, next]);
    setText("");
  };

  return (
    <>
      <MultiChoice
        options={PRESET_TAGS.map((tag) => ({
          value: tag,
          label: `#${tag.replace(/\s+/g, "")}`,
        }))}
        values={tags}
        onChange={onChange}
      />
      <label className={styles.tagComposer}>
        <span className={styles.fieldLabel}>직접 추가</span>
        <span className={styles.tagInput}>
          <input
            value={text}
            placeholder="#해시태그"
            enterKeyHint="done"
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              add();
            }}
          />
          <button type="button" onClick={add} disabled={!normalizeTag(text)}>
            추가
          </button>
        </span>
      </label>
      {custom.length > 0 ? (
        <div className={styles.customTags}>
          {custom.map((tag) => (
            <button
              key={tag}
              type="button"
              className={styles.customTag}
              onClick={() => onChange(tags.filter((item) => item !== tag))}
            >
              #{tag}
              <X size={13} strokeWidth={2.4} />
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

function StationSearch({
  city,
  stationName,
  stationLines,
  onPick,
}: {
  city: string;
  stationName: string;
  stationLines: string[];
  onPick: (station: { name: string; lines: string[] } | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StationSearchItem[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setState("idle");
      return;
    }
    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(() => {
      setState("loading");
      searchStations({
        q,
        region: city || undefined,
        limit: 20,
        signal: controller.signal,
      })
        .then((res) => {
          if (!active) return;
          setResults(res.stations ?? []);
          setState("idle");
        })
        .catch((error: unknown) => {
          if (
            !active ||
            (error instanceof DOMException && error.name === "AbortError")
          )
            return;
          setResults([]);
          setState("error");
        });
    }, 200);
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, city]);

  return (
    <div className={styles.station}>
      <span className={styles.fieldLabel}>
        가까운 역 <span>(선택)</span>
      </span>
      {stationName ? (
        <div className={styles.stationPicked}>
          <SubwayLineBadges lines={stationLines} />
          <strong>{stationName}</strong>
          <button
            type="button"
            aria-label="역 지우기"
            onClick={() => onPick(null)}
          >
            <X size={15} strokeWidth={2.4} />
          </button>
        </div>
      ) : null}
      <div
        className={cn(
          styles.stationSearch,
          query.trim() && styles.stationSearchOpen,
        )}
      >
        <Search size={18} strokeWidth={2.2} />
        <input
          value={query}
          placeholder="역 이름 검색 (예: 강남역)"
          enterKeyHint="search"
          onChange={(event) => setQuery(event.target.value)}
        />
        {query ? (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={() => setQuery("")}
          >
            <X size={14} strokeWidth={2.4} />
          </button>
        ) : null}
      </div>
      {query.trim() ? (
        <div className={styles.stationResults}>
          <p>
            {state === "loading" && results.length === 0
              ? "찾는 중"
              : state === "error"
                ? "역을 불러오지 못했어요"
                : results.length > 0
                  ? `${results.length}개 역`
                  : "맞는 역이 없어요"}
          </p>
          <ul>
            {results.map((station) => {
              const selected = stationName === station.name;
              return (
                <li
                  key={`${station.region}-${station.name}-${station.lines.join(",")}`}
                >
                  <button
                    type="button"
                    className={selected ? styles.stationItemOn : undefined}
                    onClick={() => {
                      onPick({ name: station.name, lines: station.lines });
                      setQuery("");
                    }}
                  >
                    <SubwayLineBadges lines={station.lines} />
                    <span>{station.name}</span>
                    {selected ? (
                      <Check size={16} strokeWidth={2.6} />
                    ) : (
                      <ChevronRight size={16} strokeWidth={2.2} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function AddressStep({
  draft,
  patch,
  onChangeRegion,
}: {
  draft: ListingDraft;
  patch: (next: Partial<ListingDraft>) => void;
  onChangeRegion: () => void;
}) {
  const setArea = (next: Partial<ListingDraft["area"]>) =>
    patch({ area: { ...draft.area, ...next } });

  const [addressOpen, setAddressOpen] = useState(false);
  const districtLabel = [draft.area.city, draft.area.district]
    .filter(Boolean)
    .join(" ");
  const privacyArea = draft.area.district || "구";

  return (
    <>
      <div className={styles.privacyBanner}>
        <span className={styles.privacyIcon}>
          <Lock size={16} strokeWidth={2.3} />
        </span>
        <p>
          정확한 주소는 매칭 전까지 공개되지 않아요.
          <strong>공고에는 {privacyArea}까지만 보여요.</strong>
        </p>
      </div>

      <section className={styles.regionCard}>
        <p className={styles.regionTitle}>
          <MapPin size={16} strokeWidth={2.3} />
          지역 선택
        </p>
        <button
          type="button"
          className={styles.regionSelect}
          onClick={onChangeRegion}
        >
          <MapPin size={16} strokeWidth={2.3} />
          <strong>{districtLabel || "시·도와 구를 골라주세요"}</strong>
          <ChevronDown size={18} strokeWidth={2.2} />
        </button>
      </section>

      <div className={styles.addressGroup}>
        <span className={styles.fieldLabel}>
          상세 주소 <span>(선택)</span>
        </span>
        <ClearField
          label="도로명 주소"
          placeholder="예) 테헤란로 123"
          value={draft.area.roadAddress}
          onChange={(roadAddress) => setArea({ roadAddress })}
          onOpen={() => setAddressOpen(true)}
          inline
        />
        <ClearField
          label="상세 주소"
          placeholder="예) 101동 101호"
          value={draft.area.detailAddress}
          onChange={(detailAddress) => setArea({ detailAddress })}
          inline
        />
      </div>

      <StationSearch
        city={draft.area.city}
        stationName={draft.area.stationName}
        stationLines={draft.area.stationLines}
        onPick={(station) =>
          setArea({
            stationName: station?.name ?? "",
            stationLines: station?.lines ?? [],
          })
        }
      />
      <div className={styles.addressMap} aria-hidden>
        <span className={styles.mapRoadH} />
        <span className={styles.mapRoadV} />
        <span className={styles.mapRoadD} />
        <span className={styles.mapPin}>
          <MapPin size={16} strokeWidth={2.4} />
        </span>
        {draft.area.stationName ? (
          <span className={styles.mapStation}>{draft.area.stationName}</span>
        ) : null}
        <span className={styles.mapCheck}>지도 위치 확인</span>
      </div>
      {addressOpen ? (
        <AddressSearchSheet
          city={draft.area.city}
          onClose={() => setAddressOpen(false)}
          onSelect={(picked) => {
            setArea({
              roadAddress: picked.roadAddress,
              dong: picked.dong,
              stationName: picked.stationName,
              stationLines: picked.stationLines,
              walkMinutes: picked.walkMinutes,
            });
            setAddressOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function stationLabel(name: string) {
  const text = name.trim();
  if (!text) return "";
  return text.endsWith("역") ? text : `${text}역`;
}

function AddressSearchSheet({
  city,
  onClose,
  onSelect,
}: {
  city: string;
  onClose: () => void;
  onSelect: (picked: {
    roadAddress: string;
    dong: string;
    stationName: string;
    stationLines: string[];
    walkMinutes: number;
  }) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JusoItem[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [picking, setPicking] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setState("idle");
      setHint("");
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setState("loading");
      setHint("");
      searchJuso(q)
        .then((list) => {
          if (!active) return;
          setResults(list);
          setState("idle");
        })
        .catch((error: unknown) => {
          if (!active) return;
          setResults([]);
          setState("error");
          setHint(
            error instanceof Error
              ? error.message
              : "주소를 불러오지 못했어요.",
          );
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const pick = async (item: JusoItem) => {
    if (picking) return;
    setPicking(true);
    setHint("");
    try {
      let roadAddress = item.roadAddr.trim();
      let stationName = "";
      let stationLines: string[] = [];
      let walkMinutes = 10;

      try {
        const enriched = await searchRoomAddress({
          q: item.roadAddr,
          region: city || undefined,
        });
        if (enriched.road_address?.trim()) {
          roadAddress = enriched.road_address.trim();
        }
        if (enriched.subway_stn?.trim()) {
          stationName = stationLabel(enriched.subway_stn);
        }
        if (enriched.subway_line?.length) {
          stationLines = [...enriched.subway_line];
        }
        if (
          typeof enriched.walk_min === "number" &&
          !Number.isNaN(enriched.walk_min)
        ) {
          walkMinutes = enriched.walk_min;
        }
      } catch {
        /* 역·도보 자동 입력만 생략 */
      }

      onSelect({
        roadAddress,
        dong: item.emdNm?.trim() ?? "",
        stationName,
        stationLines,
        walkMinutes,
      });
    } catch {
      setHint("주소를 적용하지 못했어요. 다시 선택해 주세요.");
    } finally {
      setPicking(false);
    }
  };

  const trimmed = query.trim();

  return (
    <div className={styles.sheetBackdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.addressSheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-search-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="address-search-title" className={styles.sheetTitle}>
          도로명 주소 검색
        </h2>
        <p className={styles.sheetDesc}>
          도로명·건물명·지번으로 검색한 뒤 항목을 선택해 주세요.
        </p>
        <div
          className={cn(
            styles.stationSearch,
            trimmed && styles.stationSearchOpen,
          )}
        >
          <Search size={18} strokeWidth={2.2} />
          <input
            value={query}
            placeholder="도로명, 건물명, 지번"
            enterKeyHint="search"
            autoFocus
            disabled={picking}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button
              type="button"
              aria-label="검색어 지우기"
              disabled={picking}
              onClick={() => setQuery("")}
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          ) : null}
        </div>

        {hint ? <p className={styles.error}>{hint}</p> : null}

        {trimmed.length >= 2 ? (
          <div className={styles.stationResults}>
            <p>
              {picking
                ? "주소 적용 중…"
                : state === "loading" && results.length === 0
                  ? "찾는 중"
                  : state === "error"
                    ? "주소를 불러오지 못했어요"
                    : results.length > 0
                      ? `${results.length}건`
                      : "맞는 주소가 없어요"}
            </p>
            <ul>
              {results.map((item) => (
                <li key={`${item.zipNo}-${item.roadAddr}`}>
                  <button
                    type="button"
                    disabled={picking}
                    onClick={() => void pick(item)}
                  >
                    <span>
                      <strong>{item.roadAddr}</strong>
                      <em>{item.jibunAddr}</em>
                    </span>
                    <ChevronRight size={16} strokeWidth={2.2} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className={styles.addressSearchEmpty}>
            {trimmed ? "두 글자 이상 입력해 주세요." : "검색어를 입력해 주세요."}
          </p>
        )}

        <button
          type="button"
          className={cn(styles.ghost, styles.full)}
          disabled={picking}
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function ClearField({
  label,
  placeholder,
  value,
  onChange,
  onOpen,
  inline = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onOpen?: () => void;
  inline?: boolean;
}) {
  return (
    <label className={styles.clearField}>
      {inline ? null : <span className={styles.fieldLabel}>{label}</span>}
      <span className={styles.clearControl}>
        {inline ? <em>{label}</em> : null}
        {onOpen ? (
          <button
            type="button"
            className={cn(styles.clearOpen, !value && styles.clearOpenEmpty)}
            onClick={onOpen}
          >
            {value || placeholder}
          </button>
        ) : (
          <input
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
        {value ? (
          <button
            type="button"
            aria-label={`${label} 지우기`}
            onClick={() => onChange("")}
          >
            <X size={14} strokeWidth={2.4} />
          </button>
        ) : null}
      </span>
    </label>
  );
}

function ReviewStep({
  draft,
  patch,
  userAgreements,
  onEdit,
  onPreview,
}: {
  draft: ListingDraft;
  patch: (next: Partial<ListingDraft>) => void;
  userAgreements: ReturnType<typeof useAuth>["user"];
  onEdit: (id: QuestionId) => void;
  onPreview: () => void;
}) {
  const cover = draft.photos.find((photo) => photo.cover) ?? draft.photos[0];
  const burden = monthlyBurden(draft);
  const { price, living, preference, space, consent, register } = draft;

  useEffect(() => {
    if (consent.profileAgree) return;
    patch({
      consent: {
        profileAgree: userAgreements?.agreedMatch ?? false,
        locationAgree: userAgreements?.agreedLocation ?? false,
        pushAgree: userAgreements?.agreedPush ?? false,
        marketingAgree: userAgreements?.agreedMarketing ?? false,
      },
    });
  }, []);

  return (
    <>
      <div className={styles.reviewCover}>
        {cover ? (
          <img src={cover.url} alt="" />
        ) : (
          <div className={styles.reviewNoPhoto}>사진 없음</div>
        )}
        <button
          type="button"
          className={styles.reviewCoverEdit}
          onClick={() => onEdit("photos")}
        >
          사진 {draft.photos.length}장 · 수정
        </button>
      </div>

      <div className={styles.reviewHead}>
        <p className={styles.reviewArea}>
          <MapPin size={14} strokeWidth={2.2} />
          {areaLabel(draft) || "지역 미입력"}
        </p>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>공고 제목</span>
          <textarea
            className={styles.textarea}
            rows={2}
            maxLength={40}
            value={draft.title}
            onChange={(event) => patch({ title: event.target.value })}
          />
        </label>
        <div className={styles.reviewBadges}>
          <span>{burden == null ? "월세 미입력" : `월 ${burden}만원`}</span>
          <span>{register.recruitCount}명 모집</span>
        </div>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            살짝에게 한마디 (최대 200자)
          </span>
          <textarea
            className={styles.textarea}
            rows={3}
            maxLength={200}
            value={draft.intro}
            onChange={(event) => patch({ intro: event.target.value })}
          />
        </label>
      </div>

      <section className={styles.reviewCard}>
        <header>
          <h2>동의</h2>
        </header>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={consent.profileAgree}
            onChange={(event) =>
              patch({
                consent: { ...consent, profileAgree: event.target.checked },
              })
            }
          />
          <span>매칭 프로필 정보 제공 동의 (필수)</span>
        </label>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={consent.locationAgree}
            onChange={(event) =>
              patch({
                consent: { ...consent, locationAgree: event.target.checked },
              })
            }
          />
          <span>위치기반 서비스 이용 동의</span>
        </label>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={consent.pushAgree}
            onChange={(event) =>
              patch({
                consent: { ...consent, pushAgree: event.target.checked },
              })
            }
          />
          <span>푸시 알림 수신 동의</span>
        </label>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={consent.marketingAgree}
            onChange={(event) =>
              patch({
                consent: { ...consent, marketingAgree: event.target.checked },
              })
            }
          />
          <span>마케팅 정보 수신 동의</span>
        </label>
      </section>

      <ReviewCard title="공간 정보" onEdit={() => onEdit("house")}>
        <p>{labelOf(HOUSE, space.houseType) || "집 구조 미선택"}</p>
        <p className={styles.reviewMuted}>
          함께 쓰는 공간{" "}
          {space.sharedAreas.map((area) => labelOf(AREAS, area)).join(", ") ||
            "없음"}
        </p>
      </ReviewCard>

      <ReviewCard title="비용" onEdit={() => onEdit("price")}>
        <p>
          월세 {price.rentMan ?? "-"}만원 · 관리비 {price.maintenanceMan ?? "-"}
          만원
        </p>
        <p className={styles.reviewMuted}>
          {labelOf(UTILITIES, price.utilities)} · 살짝 {price.sharePercent}%
          {burden == null ? "" : ` · 예상 월 ${burden}만원`}
        </p>
      </ReviewCard>

      <ReviewCard title="생활 조건" onEdit={() => onEdit("smoking")}>
        <div className={styles.reviewTags}>
          {[
            labelOf(SMOKING, living.smoking),
            labelOf(DRINK, living.drink),
            labelOf(PET, living.pet),
            labelOf(RHYTHM, living.rhythm),
            living.clean ? `청결 ${labelOf(CLEAN, living.clean)}` : "",
            labelOf(NOISE, living.noise),
          ]
            .filter(Boolean)
            .map((label) => (
              <span key={label}>{label}</span>
            ))}
        </div>
      </ReviewCard>

      <ReviewCard title="원하는 동거인" onEdit={() => onEdit("gender")}>
        <div className={styles.reviewTags}>
          <span>
            {preference.gender
              ? labelOf(GENDER, preference.gender)
              : "성별 미선택"}
          </span>
          <span>
            {!preference.age || preference.age === "any"
              ? "연령 무관"
              : labelOf(AGE, preference.age)}
          </span>
          <span>
            {preference.job ? labelOf(JOB, preference.job) : "직업 무관"}
          </span>
          {preference.tags.map((tag) => (
            <span key={tag}>#{tag.replace(/\s+/g, "")}</span>
          ))}
        </div>
      </ReviewCard>

      <ReviewCard title="위치" onEdit={() => onEdit("city")}>
        <p>{areaLabel(draft) || "지역 미입력"}</p>
        <p className={styles.reviewMuted}>
          {draft.area.stationName
            ? `가까운 역 ${draft.area.stationName} · `
            : ""}
          정확한 주소는 비공개
        </p>
      </ReviewCard>

      <button type="button" className={styles.previewBtn} onClick={onPreview}>
        <Eye size={17} strokeWidth={2.2} />
        공고 상세 화면으로 미리보기
      </button>
    </>
  );
}

function ReviewCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className={styles.reviewCard}>
      <header>
        <h2>{title}</h2>
        <button type="button" onClick={onEdit}>
          수정
        </button>
      </header>
      {children}
    </section>
  );
}
