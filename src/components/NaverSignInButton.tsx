import { cn } from "@/lib/utils";
import styles from "./NaverSignInButton.module.css";

type NaverSignInButtonProps = {
  onClick: () => void;
  className?: string;
  label?: string;
};

export function NaverSignInButton({
  onClick,
  className,
  label = "네이버 로그인",
}: NaverSignInButtonProps) {
  return (
    <button
      type="button"
      className={cn(styles.button, className)}
      onClick={onClick}
      aria-label={label}
    >
      <span className={styles.content}>
        <img
          className={styles.icon}
          src="/images/naver_n.png"
          alt=""
          draggable={false}
          aria-hidden
        />
        <span className={styles.label}>{label}</span>
      </span>
    </button>
  );
}
