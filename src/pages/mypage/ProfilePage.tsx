import { useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { getAdditionalRemaining, getAgeGroup } from "@/types/user";
import styles from "./ProfilePage.module.css";

const GENDER_LABEL = {
  male: "남성",
  female: "여성",
  other: "기타",
} as const;

const JOB_LABEL = {
  employee: "직장인",
  student: "학생",
  jobseeker: "취업준비생",
  freelancer: "프리랜서",
  other: "기타",
} as const;

export function ProfilePage() {
  const { user, isLoggedIn, completion } = useAuth();
  const [pauseOpen, setPauseOpen] = useState(false);

  if (!isLoggedIn || !user) {
    return (
      <section className={styles.pageGuest}>
        <div className={styles.intro} data-tour="profile">
          <p className={styles.eyebrow}>내정보</p>
          <h2 className={styles.title}>
            먼저 <span className={styles.accent}>살짝</span> 가입하고
            <br />
            시작해 주세요
          </h2>
          <p className={styles.desc}>
            기본 정보만 있으면 가입할 수 있어요.
            <br />
            나머지는 나중에 이어서 입력하면 됩니다.
          </p>
        </div>

        <div className={styles.bottomActions}>
          <Link
            to="/login"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              styles.loginAction,
            )}
          >
            이미 계정이 있어요
          </Link>
          <Link
            to="/signup"
            className={cn(buttonVariants({ size: "lg" }), styles.action)}
          >
            회원가입 하러 가기
          </Link>
        </div>
      </section>
    );
  }

  const ageGroup = getAgeGroup(user.birthDate);
  const remaining = getAdditionalRemaining(user);

  return (
    <section className={styles.pageLoggedIn}>
      <div className={styles.intro} data-tour="profile">
        <p className={styles.eyebrow}>내정보</p>
        <h2 className={styles.title}>
          나의 정보를
          <br />
          <span className={styles.accent}>살짝</span> 소개해 주세요
        </h2>
        <p className={styles.desc}>
          기본 가입이 완료됐어요.
          <br />
          남은 정보는 필요할 때 이어서 채울 수 있어요.
        </p>
      </div>

      <div className={styles.identity}>
        <Avatar className={styles.avatar}>
          <AvatarFallback className={styles.avatarFallback}>
            {user.nickname.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className={styles.name}>{user.nickname}</p>
          <p className={styles.hint}>
            {ageGroup} · {GENDER_LABEL[user.gender]}
            {user.job
              ? ` · ${user.job === 'other' && user.jobOther ? user.jobOther : JOB_LABEL[user.job]}`
              : ''}
          </p>
        </div>
      </div>

      <Link to="/roommate/chats" className={cn(buttonVariants({ variant: "outline", size: "lg" }), styles.chatEntry)}>
        <MessageCircle size={18} aria-hidden />
        채팅 목록
      </Link>

      <Link
        to="/roommate/applications"
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), styles.chatEntry)}
      >
        <ClipboardList size={18} aria-hidden />
        함께 살기 신청
      </Link>

      <div className={styles.progressBlock}>
        <div className={styles.track}>
          <div className={styles.bar} style={{ width: `${completion}%` }} />
        </div>
        <p className={styles.progressLabel}>프로필 완성도 {completion}%</p>
        <button
          type="button"
          className={cn(buttonVariants({ size: "lg" }), styles.action)}
          onClick={() => setPauseOpen(true)}
        >
          {remaining.length > 0 ? "추가 정보 입력" : "추가 정보 수정"}
        </button>
      </div>

      <Dialog open={pauseOpen} onOpenChange={setPauseOpen}>
        <DialogContent className={styles.pausePanel} showCloseButton={false}>
          <DialogTitle className={styles.pauseTitle}>
            기능 점검 중
          </DialogTitle>
          <DialogDescription className={styles.pauseDesc}>
            추가 정보 입력·수정 기능은 점검 중이에요.
            <br />
            조금만 기다려 주세요.
          </DialogDescription>
          <Button
            type="button"
            className={styles.pauseConfirm}
            onClick={() => setPauseOpen(false)}
          >
            확인
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
