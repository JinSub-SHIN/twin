import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
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
import { AppleSignInButton } from "@/components/AppleSignInButton";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { KakaoSignInButton } from "@/components/KakaoSignInButton";
import { NaverSignInButton } from "@/components/NaverSignInButton";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { Gender, SocialProvider, UserProfile } from "@/types/user";
import styles from "./SignupPage.module.css";

type Step = "social" | "info";
type Carrier = "SKT" | "KT" | "LGU+" | "MVNO";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
];

const CARRIER_OPTIONS: Carrier[] = ["SKT", "KT", "LGU+", "MVNO"];

const MOCK_CODE = "123456";
const LOGIN_ID_PATTERN = /^[a-zA-Z0-9_]{4,20}$/;

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/** 숫자만 받아 0000-00-00 형태로 포맷 (YYYY-MM-DD) */
function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function isValidBirthDate(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return false;
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  if (year < 1900 || year > new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/** 저장용 ISO (YYYY-MM-DD) */
function toIsoBirthDate(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return "";
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoggedIn } = useAuth();
  const [step, setStep] = useState<Step>("social");
  const [provider, setProvider] = useState<SocialProvider | null>(null);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [phone, setPhone] = useState("");
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [error, setError] = useState("");

  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [draftPhone, setDraftPhone] = useState("");
  const [draftCarrier, setDraftCarrier] = useState<Carrier | null>(null);
  const [draftBirthDate, setDraftBirthDate] = useState("");
  const [draftGender, setDraftGender] = useState<Gender | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    if (isLoggedIn) navigate("/profile", { replace: true });
  }, [isLoggedIn, navigate]);

  const canRequestVerify = useMemo(() => {
    return (
      draftPhone.replace(/\D/g, "").length >= 10 &&
      Boolean(draftCarrier) &&
      isValidBirthDate(draftBirthDate) &&
      Boolean(draftGender)
    );
  }, [draftPhone, draftCarrier, draftBirthDate, draftGender]);

  const isEmailSignup = provider === "email";

  const canSubmit = useMemo(() => {
    const emailOk =
      !isEmailSignup ||
      (LOGIN_ID_PATTERN.test(loginId.trim()) &&
        password.length >= 8 &&
        password === passwordConfirm);

    return (
      Boolean(provider) &&
      emailOk &&
      nickname.trim().length >= 2 &&
      isValidBirthDate(birthDate) &&
      Boolean(gender) &&
      phoneVerified &&
      phone.replace(/\D/g, "").length >= 10 &&
      agreedTerms &&
      agreedPrivacy
    );
  }, [
    provider,
    isEmailSignup,
    loginId,
    password,
    passwordConfirm,
    nickname,
    birthDate,
    gender,
    phoneVerified,
    phone,
    agreedTerms,
    agreedPrivacy,
  ]);

  const handleSocial = (next: SocialProvider) => {
    setProvider(next);
    setStep("info");
    setError("");
  };

  const handleBack = () => {
    if (step === "info") {
      setStep("social");
      setError("");
      return;
    }
    navigate(-1);
  };

  const openPhoneModal = () => {
    setDraftPhone(phone);
    setDraftCarrier(carrier);
    setDraftBirthDate(formatBirthDate(birthDate));
    setDraftGender(gender);
    setPhoneModalOpen(true);
  };

  const handleRequestVerify = () => {
    if (!canRequestVerify) return;
    setPhoneModalOpen(false);
    setVerifyCode("");
    setCodeError("");
    setCodeModalOpen(true);
  };

  const handleConfirmCode = () => {
    if (verifyCode.trim() !== MOCK_CODE) {
      setCodeError("인증번호가 올바르지 않습니다.");
      return;
    }
    if (!draftGender) {
      setCodeError("성별을 선택해 주세요.");
      return;
    }
    if (!isValidBirthDate(draftBirthDate)) {
      setCodeError("생년월일을 확인해 주세요.");
      return;
    }
    setPhone(formatPhone(draftPhone));
    setCarrier(draftCarrier);
    setBirthDate(formatBirthDate(draftBirthDate));
    setGender(draftGender);
    setPhoneVerified(true);
    setCodeModalOpen(false);
    setCodeError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    if (!canSubmit) {
      setError("필수 정보와 약관 동의를 확인해 주세요.");
      return;
    }

    const user: UserProfile = {
      provider,
      ...(isEmailSignup ? { loginId: loginId.trim() } : {}),
      nickname: nickname.trim(),
      birthDate: toIsoBirthDate(birthDate),
      gender,
      phone: phone.trim(),
      agreedTerms,
      agreedPrivacy,
      createdAt: new Date().toISOString(),
    };

    signup(user);
    navigate("/profile", { replace: true });
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
          <ArrowLeft className="size-4" />
        </button>
        <p className={styles.stepLabel}>
          {step === "social" ? "1 / 2 간편 로그인" : "2 / 2 기본 정보"}
        </p>
      </div>

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
      ) : (
        <>
          <div className={styles.intro}>
            <h2 className={styles.title}>
              기본 정보만
              <br />
              살짝 알려주세요
            </h2>
            <p className={styles.desc}>
              나중에 프로필 사진·거주 지역은
              <br />
              이어서 입력할 수 있어요.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {isEmailSignup && (
              <>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="loginId">
                    아이디<span className={styles.required}>*</span>
                  </label>
                  <Input
                    id="loginId"
                    className={styles.input}
                    autoComplete="username"
                    placeholder="영문/숫자 4~20자"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    maxLength={20}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="password">
                    비밀번호<span className={styles.required}>*</span>
                  </label>
                  <Input
                    id="password"
                    type="password"
                    className={styles.input}
                    autoComplete="new-password"
                    placeholder="8자 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="passwordConfirm">
                    비밀번호 확인<span className={styles.required}>*</span>
                  </label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    className={styles.input}
                    autoComplete="new-password"
                    placeholder="비밀번호를 한 번 더 입력"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                  />
                  {passwordConfirm.length > 0 &&
                  password !== passwordConfirm ? (
                    <p className={styles.fieldHintError}>
                      비밀번호가 일치하지 않습니다.
                    </p>
                  ) : null}
                </div>
              </>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="nickname">
                닉네임<span className={styles.required}>*</span>
              </label>
              <Input
                id="nickname"
                className={styles.input}
                placeholder="서비스에 표시될 이름"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={12}
                required
              />
            </div>

            <div className={styles.field}>
              <p className={styles.label}>
                휴대폰 번호<span className={styles.required}>*</span>
              </p>
              <button
                type="button"
                className={styles.phoneTrigger}
                onClick={openPhoneModal}
              >
                <span
                  className={
                    phoneVerified ? styles.phoneValue : styles.phonePlaceholder
                  }
                >
                  {phoneVerified
                    ? `${phone}${carrier ? ` · ${carrier}` : ""}`
                    : "휴대폰 번호 인증하기"}
                </span>
                <span
                  className={cn(
                    styles.phoneBadge,
                    phoneVerified && styles.phoneBadgeDone,
                  )}
                >
                  {phoneVerified ? "인증완료" : "인증"}
                </span>
              </button>
            </div>

            {phoneVerified && (
              <>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="birthDate">
                    생년월일<span className={styles.required}>*</span>
                  </label>
                  <Input
                    id="birthDate"
                    type="text"
                    inputMode="numeric"
                    className={styles.input}
                    value={birthDate}
                    disabled
                    readOnly
                    required
                  />
                  <p className={styles.fieldHint}>
                    휴대폰 인증 정보로 입력됐어요.
                  </p>
                </div>

                <div className={styles.field}>
                  <p className={styles.label}>
                    성별<span className={styles.required}>*</span>
                  </p>
                  <div className={styles.genderRow}>
                    {GENDER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        disabled
                        className={cn(
                          styles.genderBtn,
                          gender === option.value && styles.genderBtnActive,
                          styles.genderBtnDisabled,
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className={styles.fieldHint}>
                    휴대폰 인증 정보로 입력됐어요.
                  </p>
                </div>
              </>
            )}

            <div className={styles.agreements}>
              <label className={styles.agreeRow}>
                <Checkbox
                  checked={agreedTerms}
                  onCheckedChange={(checked) =>
                    setAgreedTerms(checked === true)
                  }
                />
                <span className={styles.agreeText}>
                  이용약관 동의<span className={styles.required}>*</span>
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
                  개인정보 수집 동의<span className={styles.required}>*</span>
                  <span className={styles.agreeHint}>
                    계정·본인확인을 위한 필수 동의입니다.
                  </span>
                </span>
              </label>
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}

            <Button
              type="submit"
              className={styles.submit}
              size="lg"
              disabled={!canSubmit}
            >
              가입하고 시작하기
            </Button>
          </form>
        </>
      )}

      <Dialog open={phoneModalOpen} onOpenChange={setPhoneModalOpen}>
        <DialogContent className={styles.dialogContent} showCloseButton>
          <DialogHeader>
            <DialogTitle>휴대폰 인증</DialogTitle>
            <DialogDescription>
              통신사·번호·생년월일·성별을 입력한 뒤
              <br />
              인증하기를 눌러 주세요.
            </DialogDescription>
          </DialogHeader>

          <div className={styles.modalBody}>
            <div className={styles.field}>
              <p className={styles.label}>통신사</p>
              <div className={styles.carrierRow}>
                {CARRIER_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={cn(
                      styles.carrierBtn,
                      draftCarrier === item && styles.carrierBtnActive,
                    )}
                    onClick={() => setDraftCarrier(item)}
                  >
                    {item === "MVNO" ? "알뜰폰" : item}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="draftPhone">
                휴대폰 번호
              </label>
              <Input
                id="draftPhone"
                type="tel"
                inputMode="numeric"
                className={styles.input}
                placeholder="010-1234-5678"
                value={draftPhone}
                onChange={(e) => setDraftPhone(formatPhone(e.target.value))}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="draftBirthDate">
                생년월일
              </label>
              <Input
                id="draftBirthDate"
                type="text"
                inputMode="numeric"
                className={styles.input}
                placeholder="0000-00-00"
                value={draftBirthDate}
                onChange={(e) =>
                  setDraftBirthDate(formatBirthDate(e.target.value))
                }
                maxLength={10}
              />
            </div>

            <div className={styles.field}>
              <p className={styles.label}>성별</p>
              <div className={styles.genderRow}>
                {GENDER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      styles.genderBtn,
                      draftGender === option.value && styles.genderBtnActive,
                    )}
                    onClick={() => setDraftGender(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className={styles.dialogFooter}>
            <Button
              type="button"
              className={styles.modalAction}
              size="lg"
              disabled={!canRequestVerify}
              onClick={handleRequestVerify}
            >
              인증하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={codeModalOpen} onOpenChange={setCodeModalOpen}>
        <DialogContent className={styles.dialogContent} showCloseButton={false}>
          <div className={styles.modalTop}>
            <button
              type="button"
              className={styles.modalBackBtn}
              aria-label="뒤로가기"
              onClick={() => {
                setCodeModalOpen(false);
                setCodeError("");
                setPhoneModalOpen(true);
              }}
            >
              <ArrowLeft className="size-4" />
            </button>
            <DialogHeader className={styles.modalHeader}>
              <DialogTitle>인증번호 입력</DialogTitle>
              <DialogDescription>
                {formatPhone(draftPhone)}로 보낸
                <br />
                인증번호 6자리를 입력해 주세요.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="verifyCode">
                인증번호
              </label>
              <Input
                id="verifyCode"
                type="text"
                inputMode="numeric"
                className={styles.input}
                placeholder="6자리 숫자"
                value={verifyCode}
                maxLength={6}
                onChange={(e) => {
                  setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setCodeError("");
                }}
              />
              <p className={styles.codeHint}>테스트용 인증번호: {MOCK_CODE}</p>
              {codeError ? <p className={styles.error}>{codeError}</p> : null}
            </div>
          </div>

          <DialogFooter className={styles.dialogFooter}>
            <Button
              type="button"
              className={styles.modalAction}
              size="lg"
              disabled={verifyCode.length !== 6}
              onClick={handleConfirmCode}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
