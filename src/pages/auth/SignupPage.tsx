import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import {
  AppleSignInButton,
  GoogleSignInButton,
  KakaoSignInButton,
  NaverSignInButton,
} from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  checkLoginId,
  confirmPhoneCode,
  requestPhoneCode,
  signupUser,
  type PhoneCarrier,
} from "@/service/auth";
import { ApiError } from "@/service/http";
import type { Gender, SocialProvider } from "@/types/user";
import styles from "./SignupPage.module.css";

type Step =
  | "social"
  | "id"
  | "idCheck"
  | "password"
  | "passwordConfirm"
  | "phone"
  | "agree";
type Carrier = "SKT" | "KT" | "LGU+" | "MVNO";
type StepAnim = "none" | "forward" | "back";

const CARRIER_OPTIONS: Carrier[] = ["SKT", "KT", "LGU+", "MVNO"];

const LOGIN_ID_PATTERN = /^[a-zA-Z0-9_]{4,20}$/;
const CHECK_MIN_MS = 1200;
const PIN_LENGTH = 6;

function pickPhoneCode(data: unknown) {
  if (!data || typeof data !== "object") return "";
  const code = (data as { code?: unknown }).code;
  if (typeof code === "number" && Number.isFinite(code)) {
    return String(code).replace(/\D/g, "").slice(0, PIN_LENGTH);
  }
  if (typeof code === "string") {
    return code.replace(/\D/g, "").slice(0, PIN_LENGTH);
  }
  return "";
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function residentDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 7);
}

function centuryFromGenderDigit(digit: number) {
  if (digit === 9 || digit === 0) return 1800;
  if (digit === 3 || digit === 4 || digit === 7 || digit === 8) return 2000;
  return 1900;
}

function genderFromResident(digits: string): Gender | null {
  const value = residentDigits(digits);
  if (value.length !== 7) return null;
  const code = Number(value[6]);
  if ([1, 3, 5, 7, 9].includes(code)) return "male";
  if ([2, 4, 6, 8, 0].includes(code)) return "female";
  return null;
}

function isValidResidentId(digits: string) {
  const value = residentDigits(digits);
  if (value.length !== 7) return false;
  const year = centuryFromGenderDigit(Number(value[6])) + Number(value.slice(0, 2));
  const month = Number(value.slice(2, 4));
  const day = Number(value.slice(4, 6));
  if (year < 1900 || year > new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    Boolean(genderFromResident(value))
  );
}

function toIsoBirthDate(digits: string) {
  const value = residentDigits(digits);
  if (value.length !== 7) return "";
  const year = centuryFromGenderDigit(Number(value[6])) + Number(value.slice(0, 2));
  return `${String(year)}-${value.slice(2, 4)}-${value.slice(4, 6)}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function SignupPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [step, setStep] = useState<Step>("social");
  const [stepAnim, setStepAnim] = useState<StepAnim>("none");
  const [provider, setProvider] = useState<SocialProvider | null>(null);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [residentId, setResidentId] = useState("");
  const [phone, setPhone] = useState("");
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [confirmingCode, setConfirmingCode] = useState(false);
  const [notice, setNotice] = useState("");
  const [pushCode, setPushCode] = useState("");
  const [pushOpen, setPushOpen] = useState(false);
  const [pushLeaving, setPushLeaving] = useState(false);
  const noticeTimerRef = useRef<number | null>(null);
  const pushTimerRef = useRef<number | null>(null);
  const pushHideTimerRef = useRef<number | null>(null);
  const pushOpenRef = useRef(false);

  const loginIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const birthRef = useRef<HTMLInputElement>(null);
  const verifyRef = useRef<HTMLInputElement>(null);

  const isEmailSignup = provider === "email";

  useEffect(() => {
    if (isLoggedIn) navigate("/profile", { replace: true });
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (step === "phone" && phoneVerified) return;
    const focusMap: Partial<Record<Step, HTMLInputElement | null>> = {
      id: loginIdRef.current,
      password: passwordRef.current,
      passwordConfirm: passwordConfirmRef.current,
      phone: phoneRef.current,
    };
    const timer = window.setTimeout(() => focusMap[step]?.focus(), 460);
    return () => window.clearTimeout(timer);
  }, [step, phoneVerified]);

  useEffect(() => {
    if (step !== "phone" || !carrier || phoneVerified) return;
    const timer = window.setTimeout(() => birthRef.current?.focus(), 420);
    return () => window.clearTimeout(timer);
  }, [step, carrier, phoneVerified]);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
      if (pushHideTimerRef.current) window.clearTimeout(pushHideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (step !== "idCheck") return;

    let cancelled = false;
    const started = Date.now();

    const run = async () => {
      try {
        const available = await checkLoginId(loginId.trim());
        const wait = Math.max(0, CHECK_MIN_MS - (Date.now() - started));
        await sleep(wait);
        if (cancelled) return;
        if (!available) {
          setError("이미 사용 중인 아이디예요.");
          setStepAnim("back");
          setStep("id");
          return;
        }
        setError("");
        setStepAnim("forward");
        setStep("password");
      } catch {
        const wait = Math.max(0, CHECK_MIN_MS - (Date.now() - started));
        await sleep(wait);
        if (cancelled) return;
        setError("아이디 확인에 실패했어요. 다시 시도해 주세요.");
        setStepAnim("back");
        setStep("id");
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [step, loginId]);

  const goForward = (next: Step) => {
    setError("");
    setStepAnim("forward");
    setStep(next);
  };

  const goBackTo = (next: Step) => {
    setError("");
    setStepAnim("back");
    setStep(next);
  };

  const handleSocial = (next: SocialProvider) => {
    setProvider(next);
    if (next === "email") {
      goForward("id");
      return;
    }
    goForward("phone");
  };

  const handleBack = () => {
    if (step === "social") {
      navigate(-1);
      return;
    }
    if (step === "id" || step === "idCheck") {
      goBackTo("social");
      return;
    }
    if (step === "password") {
      goBackTo("id");
      return;
    }
    if (step === "passwordConfirm") {
      goBackTo("password");
      return;
    }
    if (step === "phone") {
      if (phoneVerified) {
        hidePush();
        goBackTo(isEmailSignup ? "passwordConfirm" : "social");
        return;
      }
      if (codeSent) {
        hidePush();
        setCodeSent(false);
        setVerifyCode("");
        setPhoneVerified(false);
        setError("");
        return;
      }
      if (carrier) {
        setCarrier(null);
        setCodeSent(false);
        setVerifyCode("");
        setPhoneVerified(false);
        setError("");
        return;
      }
      goBackTo(isEmailSignup ? "passwordConfirm" : "social");
      return;
    }
    goBackTo("phone");
  };

  const handleIdNext = () => {
    if (!LOGIN_ID_PATTERN.test(loginId.trim())) {
      setError("아이디는 영문/숫자/밑줄 4~20자로 입력해 주세요.");
      return;
    }
    goForward("idCheck");
  };

  const handlePasswordNext = () => {
    if (password.length < 8) {
      setError("비밀번호는 8자 이상 입력해 주세요.");
      return;
    }
    goForward("passwordConfirm");
  };

  const handlePasswordConfirmNext = () => {
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    goForward("phone");
  };

  const phoneComplete = phone.replace(/\D/g, "").length === 11;
  const showCarrier = phoneComplete;
  const showBirth = phoneComplete && Boolean(carrier);
  const showVerify = showBirth && isValidResidentId(residentId);
  const gender = genderFromResident(residentId);

  const handlePhoneNext = () => {
    if (!phoneVerified) {
      setError("인증번호를 확인해 주세요.");
      return;
    }
    goForward("agree");
  };

  const handleSelectCarrier = (next: Carrier) => {
    if (phoneVerified) return;
    setCarrier(next);
    setError("");
  };

  const handleResidentChange = (nextRaw: string) => {
    if (phoneVerified) return;
    const nextDigits = residentDigits(nextRaw);
    setResidentId(nextDigits);
    setError("");
    if (!isValidResidentId(nextDigits)) {
      setCodeSent(false);
      setVerifyCode("");
      setPhoneVerified(false);
    }
  };

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(""), 3200);
  };

  const hidePush = () => {
    if (!pushOpenRef.current) return;
    pushOpenRef.current = false;
    setPushLeaving(true);
    if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
    if (pushHideTimerRef.current) window.clearTimeout(pushHideTimerRef.current);
    pushHideTimerRef.current = window.setTimeout(() => {
      setPushOpen(false);
      setPushLeaving(false);
      setPushCode("");
    }, 320);
  };

  const showPushCode = (code: string) => {
    if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
    if (pushHideTimerRef.current) window.clearTimeout(pushHideTimerRef.current);
    pushOpenRef.current = true;
    setPushCode(code);
    setPushLeaving(false);
    setPushOpen(true);
    pushTimerRef.current = window.setTimeout(() => hidePush(), 4200);
  };

  const toApiCarrier = (value: Carrier): PhoneCarrier => {
    return value === "MVNO" ? "알뜰폰" : value;
  };

  const handleSendCode = async () => {
    if (!showVerify || !carrier || sendingCode || phoneVerified) return;
    const digits = residentDigits(residentId);
    setSendingCode(true);
    setError("");
    try {
      const result = await requestPhoneCode({
        phone,
        carrier: toApiCarrier(carrier),
        birth6: digits.slice(0, 6),
        gender_code: digits.slice(6, 7),
      });
      const code = pickPhoneCode(result);
      setCodeSent(true);
      setVerifyCode("");
      setPhoneVerified(false);
      if (code) {
        showPushCode(code);
      } else {
        showNotice("위 정보로 발송된 인증번호를 입력해주세요.");
      }
      window.setTimeout(() => verifyRef.current?.focus(), 80);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "인증번호 발송에 실패했어요. 다시 시도해 주세요.",
      );
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyChange = (value: string) => {
    if (phoneVerified) return;
    const digits = value.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setVerifyCode(digits);
    setError("");
    if (digits.length !== PIN_LENGTH) {
      setPhoneVerified(false);
      return;
    }
    void confirmCode(digits);
  };

  const handlePushTap = () => {
    if (pushCode && !phoneVerified) {
      handleVerifyChange(pushCode);
    }
    hidePush();
  };

  const confirmCode = async (code: string) => {
    if (confirmingCode) return;
    setConfirmingCode(true);
    setError("");
    try {
      const result = await confirmPhoneCode({ phone, code });
      if (!result.success) {
        setPhoneVerified(false);
        setError("인증번호가 올바르지 않습니다.");
        return;
      }
      setPhoneVerified(true);
      hidePush();
      verifyRef.current?.blur();
      phoneRef.current?.blur();
      birthRef.current?.blur();
    } catch (err) {
      setPhoneVerified(false);
      setError(
        err instanceof ApiError
          ? err.message
          : "인증번호 확인에 실패했어요. 다시 시도해 주세요.",
      );
    } finally {
      setConfirmingCode(false);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!provider || !gender) {
      setError("필수 정보를 모두 입력해 주세요.");
      return;
    }
    if (isEmailSignup) {
      if (!LOGIN_ID_PATTERN.test(loginId.trim())) {
        setError("아이디는 영문/숫자/밑줄 4~20자로 입력해 주세요.");
        return;
      }
      if (password.length < 8) {
        setError("비밀번호는 8자 이상 입력해 주세요.");
        return;
      }
      if (password !== passwordConfirm) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
    }
    if (!phoneVerified) {
      setError("휴대폰 인증을 완료해 주세요.");
      return;
    }
    if (!agreedTerms || !agreedPrivacy) {
      setError("필수 약관에 동의해 주세요.");
      return;
    }

    const birth = toIsoBirthDate(residentId);

    if (isEmailSignup) {
      setSubmitting(true);
      setError("");
      try {
        await signupUser({
          id: loginId.trim(),
          password,
          gender,
          birth,
          phone: phone.trim(),
        });
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "회원가입에 실패했습니다. 다시 시도해 주세요.",
        );
        return;
      } finally {
        setSubmitting(false);
      }
    }

    setDoneOpen(true);
  };

  const goLogin = () => {
    navigate("/login", {
      replace: true,
      state: isEmailSignup ? { loginId: loginId.trim() } : undefined,
    });
  };

  const showNext =
    step === "id" ||
    step === "password" ||
    step === "passwordConfirm" ||
    (step === "phone" && phoneVerified) ||
    step === "agree";

  const canNext =
    (step === "id" && LOGIN_ID_PATTERN.test(loginId.trim())) ||
    (step === "password" && password.length >= 8) ||
    (step === "passwordConfirm" &&
      passwordConfirm.length >= 8 &&
      password === passwordConfirm) ||
    (step === "phone" && phoneVerified) ||
    (step === "agree" && agreedTerms && agreedPrivacy && !submitting);

  const handleNext = () => {
    if (step === "id") handleIdNext();
    else if (step === "password") handlePasswordNext();
    else if (step === "passwordConfirm") handlePasswordConfirmNext();
    else if (step === "phone") handlePhoneNext();
    else if (step === "agree") void handleSubmit();
  };

  const nextLabel =
    step === "agree"
      ? submitting
        ? "가입하는 중..."
        : "가입하고 시작하기"
      : "다음";

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
          <p className={styles.headerTitle}>회원가입</p>
          <span aria-hidden />
        </div>
      </header>

      <div className={styles.stepBody}>
        <div
          key={step}
          className={cn(
            styles.stepPage,
            stepAnim === "forward" && styles.stepPageForward,
            stepAnim === "back" && styles.stepPageBack,
          )}
        >
          <div className={styles.stepStack}>
            {step === "social" ? (
              <>
                <div className={styles.intro}>
                  <h2 className={styles.title}>
                    <span className={styles.accent}>살짝</span> 가입하고
                    <br />
                    월세 나눌 사람을 만나보세요
                  </h2>
                  <p className={styles.desc}>
                    간편 로그인 혹은 일반 회원가입으로 진행할 수 있어요.
                  </p>
                </div>

                <div className={styles.socialList}>
                  <NaverSignInButton
                    label="네이버로 시작하기"
                    onClick={() => handleSocial("naver")}
                  />
                  <KakaoSignInButton
                    label="카카오로 시작하기"
                    onClick={() => handleSocial("kakao")}
                  />
                  <GoogleSignInButton
                    label="Google로 시작하기"
                    onClick={() => handleSocial("google")}
                  />
                  <AppleSignInButton
                    label="Apple로 시작하기"
                    onClick={() => handleSocial("apple")}
                  />

                  <div className={styles.divider}>
                    <span>또는</span>
                  </div>

                  <button
                    type="button"
                    className={cn(styles.socialBtn, styles.email)}
                    onClick={() => handleSocial("email")}
                  >
                    일반 회원가입
                  </button>
                </div>
              </>
            ) : null}

            {step === "id" ? (
              <>
                <div className={styles.intro}>
                  <h2 className={styles.title}>
                    사용할 아이디를
                    <br />
                    입력해주세요
                  </h2>
                  <p className={styles.desc}>영문/숫자 4~20자</p>
                </div>
                <form
                  className={styles.field}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleIdNext();
                  }}
                >
                  <Input
                    ref={loginIdRef}
                    id="loginId"
                    className={styles.input}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    placeholder="아이디"
                    value={loginId}
                    onChange={(e) => {
                      setLoginId(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""));
                      setError("");
                    }}
                    maxLength={20}
                  />
                  {error ? <p className={styles.error}>{error}</p> : null}
                </form>
              </>
            ) : null}

            {step === "idCheck" ? (
              <div className={styles.checkScreen}>
                <span className={styles.spinner} aria-hidden />
                <h2 className={styles.title}>
                  아이디가 중복인지
                  <br />
                  알아볼게요
                </h2>
              </div>
            ) : null}

            {step === "password" ? (
              <>
                <div className={styles.intro}>
                  <h2 className={styles.title}>
                    사용하실 비밀번호를
                    <br />
                    입력해주세요
                  </h2>
                  <p className={styles.desc}>8자 이상</p>
                </div>
                <form
                  className={styles.field}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePasswordNext();
                  }}
                >
                  <Input
                    ref={passwordRef}
                    id="signup-pass"
                    type="text"
                    className={cn(styles.input, styles.pwMask)}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                  />
                  {error ? <p className={styles.error}>{error}</p> : null}
                </form>
              </>
            ) : null}

            {step === "passwordConfirm" ? (
              <>
                <div className={styles.intro}>
                  <h2 className={styles.title}>
                    다시 한 번 더 사용하실
                    <br />
                    비밀번호를 입력해주세요
                  </h2>
                </div>
                <form
                  className={styles.field}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePasswordConfirmNext();
                  }}
                >
                  <Input
                    ref={passwordConfirmRef}
                    id="signup-pass-check"
                    type="text"
                    className={cn(styles.input, styles.pwMask)}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    placeholder="비밀번호 확인"
                    value={passwordConfirm}
                    onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      setError("");
                    }}
                  />
                  {passwordConfirm.length > 0 && password !== passwordConfirm ? (
                    <p className={styles.fieldHintError}>
                      비밀번호가 일치하지 않습니다.
                    </p>
                  ) : null}
                  {error ? <p className={styles.error}>{error}</p> : null}
                </form>
              </>
            ) : null}

            {step === "phone" ? (
              <>
                <div className={styles.intro}>
                  <h2 className={styles.title}>
                    {phoneVerified ? (
                      <>
                        휴대폰 인증이
                        <br />
                        완료됐어요
                      </>
                    ) : (
                      <>
                        휴대폰 번호를
                        <br />
                        입력해주세요
                      </>
                    )}
                  </h2>
                </div>
                <form
                  className={styles.stackForm}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePhoneNext();
                  }}
                >
                  <div className={styles.field}>
                    <Input
                      ref={phoneRef}
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      className={cn(styles.input, phoneVerified && styles.inputLocked)}
                      autoComplete="tel"
                      placeholder="010-1234-5678"
                      value={phone}
                      disabled={phoneVerified}
                      readOnly={phoneVerified}
                      onChange={(e) => {
                        if (phoneVerified) return;
                        const next = formatPhone(e.target.value);
                        setPhone(next);
                        setError("");
                        if (next.replace(/\D/g, "").length < 11) {
                          setCarrier(null);
                          setCodeSent(false);
                          setVerifyCode("");
                          setPhoneVerified(false);
                        }
                      }}
                    />
                  </div>

                  {showCarrier ? (
                    <div className={cn(styles.revealBlock, styles.revealUp)}>
                      <p className={styles.stackLabel}>통신사</p>
                      <div className={styles.carrierGrid}>
                        {CARRIER_OPTIONS.map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={cn(
                              styles.choiceBtn,
                              carrier === item && styles.choiceBtnActive,
                              phoneVerified && styles.choiceBtnLocked,
                            )}
                            disabled={phoneVerified}
                            onClick={() => handleSelectCarrier(item)}
                          >
                            {item === "MVNO" ? "알뜰폰" : item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {showBirth ? (
                    <div className={cn(styles.revealBlock, styles.revealUp)}>
                      <p className={styles.stackLabel}>생년월일</p>
                      <div className={styles.ssnWrap}>
                        <input
                          ref={birthRef}
                          id="birthDate"
                          className={styles.pinHidden}
                          inputMode="numeric"
                          autoComplete="off"
                          value={residentId}
                          maxLength={7}
                          disabled={phoneVerified}
                          readOnly={phoneVerified}
                          onChange={(e) => handleResidentChange(e.target.value)}
                          aria-label="생년월일 주민번호 앞자리"
                        />
                        <button
                          type="button"
                          className={cn(
                            styles.ssnRow,
                            phoneVerified && styles.ssnLocked,
                          )}
                          disabled={phoneVerified}
                          tabIndex={phoneVerified ? -1 : 0}
                          onClick={() => {
                            if (phoneVerified) return;
                            birthRef.current?.focus();
                          }}
                        >
                          {Array.from({ length: 6 }, (_, index) => (
                            <span
                              key={index}
                              className={cn(
                                styles.ssnBox,
                                residentId[index] && styles.ssnBoxFilled,
                                residentId.length === index &&
                                  styles.ssnBoxActive,
                              )}
                            >
                              {residentId[index] ?? ""}
                            </span>
                          ))}
                          <span className={styles.ssnDash}>-</span>
                          <span
                            className={cn(
                              styles.ssnBox,
                              residentId[6] && styles.ssnBoxFilled,
                              residentId.length === 6 && styles.ssnBoxActive,
                            )}
                          >
                            {residentId[6] ?? ""}
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {showVerify ? (
                    <div className={cn(styles.revealBlock, styles.revealUp)}>
                      <p className={styles.stackLabel}>인증번호</p>
                      <div className={styles.codeField}>
                        <Input
                          ref={verifyRef}
                          id="verifyCode"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          className={cn(
                            styles.input,
                            styles.codeInput,
                            phoneVerified && styles.inputLocked,
                          )}
                          placeholder="6자리 숫자"
                          value={verifyCode}
                          maxLength={PIN_LENGTH}
                          disabled={phoneVerified || confirmingCode}
                          readOnly={phoneVerified}
                          onChange={(e) => handleVerifyChange(e.target.value)}
                        />
                        <button
                          type="button"
                          className={cn(
                            styles.codeSendBtn,
                            phoneVerified && styles.codeSendBtnDone,
                          )}
                          disabled={sendingCode || phoneVerified}
                          onClick={() => void handleSendCode()}
                        >
                          {phoneVerified
                            ? "인증 완료"
                            : sendingCode
                              ? "발송 중..."
                              : codeSent
                                ? "재전송"
                                : "인증번호 발송하기"}
                        </button>
                      </div>
                      {phoneVerified ? (
                        <p className={styles.verifiedBanner} role="status">
                          <span className={styles.verifiedIcon} aria-hidden>
                            <Check className="size-3.5" strokeWidth={3} />
                          </span>
                          인증이 완료됐어요. 다음으로 진행해 주세요.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {error ? <p className={styles.error}>{error}</p> : null}
                </form>
              </>
            ) : null}

            {step === "agree" ? (
              <>
                <div className={styles.intro}>
                  <h2 className={styles.title}>
                    마지막으로 개인정보 수집에
                    <br />
                    동의해주세요
                  </h2>
                </div>
                <div className={styles.agreements}>
                  <label className={styles.agreeRow}>
                    <Checkbox
                      checked={agreedTerms}
                      onCheckedChange={(checked) =>
                        setAgreedTerms(checked === true)
                      }
                    />
                    <span className={styles.agreeText}>
                      이용약관 동의
                      <span className={styles.agreeHint}>
                        서비스 이용을 위한 필수 동의입니다.
                      </span>
                    </span>
                  </label>
                  <label className={styles.agreeRow}>
                    <Checkbox
                      checked={agreedPrivacy}
                      onCheckedChange={(checked) =>
                        setAgreedPrivacy(checked === true)
                      }
                    />
                    <span className={styles.agreeText}>
                      개인정보 수집 동의
                      <span className={styles.agreeHint}>
                        계정·본인확인을 위한 필수 동의입니다.
                      </span>
                    </span>
                  </label>
                </div>
                {error ? <p className={styles.error}>{error}</p> : null}
              </>
            ) : null}

            {showNext ? (
              <div className={styles.submitDock}>
                <Button
                  type="button"
                  className={styles.submit}
                  size="lg"
                  disabled={!canNext}
                  onClick={handleNext}
                >
                  {nextLabel}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {notice ? (
        <div className={styles.notice} role="status">
          {notice}
        </div>
      ) : null}

      <Dialog
        open={doneOpen}
        onOpenChange={(open) => {
          if (!open) goLogin();
        }}
      >
        <DialogContent className={styles.dialogContent} showCloseButton={false}>
          <div className={styles.modalInner}>
            <div className={styles.modalIconWrap} aria-hidden>
              <span className={styles.modalIcon}>
                <Check className="size-5" strokeWidth={3} />
              </span>
            </div>
            <DialogHeader className={styles.modalHeader}>
              <DialogTitle className={styles.modalTitle}>
                회원가입이 완료됐어요
              </DialogTitle>
              <DialogDescription className={styles.modalDesc}>
                가입한 아이디로 로그인해 주세요.
                <br />
                로그인하면 살짝을 바로 시작할 수 있어요.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className={styles.dialogFooter}>
              <Button
                type="button"
                className={styles.modalAction}
                size="lg"
                onClick={goLogin}
              >
                로그인하러 가기
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {pushOpen ? (
        <div className={styles.pushLayer} aria-live="polite">
          <button
            type="button"
            className={cn(styles.pushCard, pushLeaving && styles.pushLeaving)}
            onClick={handlePushTap}
          >
            <span className={styles.pushGrip} aria-hidden />
            <span className={styles.pushRow}>
              <img
                src="/favicon.svg"
                alt=""
                className={styles.pushIcon}
              />
              <span className={styles.pushCopy}>
                <span className={styles.pushMeta}>
                  <span className={styles.pushApp}>살짝</span>
                  <span className={styles.pushTime}>지금</span>
                </span>
                <span className={styles.pushTitle}>인증번호가 도착했어요</span>
                <span className={styles.pushText}>
                  인증번호 <strong>{pushCode}</strong>
                </span>
              </span>
            </span>
          </button>
        </div>
      ) : null}
    </section>
  );
}
