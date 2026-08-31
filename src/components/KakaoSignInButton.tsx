import { cn } from "@/lib/utils";
import styles from "./KakaoSignInButton.module.css";

type KakaoSignInButtonProps = {
  onClick: () => void;
  className?: string;
  label?: string;
};

export function KakaoSignInButton({
  onClick,
  className,
  label = "카카오 로그인",
}: KakaoSignInButtonProps) {
  return (
    <button
      type="button"
      className={cn(styles.button, className)}
      onClick={onClick}
      aria-label={label}
    >
      <span className={styles.content}>
        <span className={styles.icon} aria-hidden>
          <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 0.5C4.02944 0.5 0 3.582 0 7.383C0 9.78 1.558 11.888 3.931 13.11L3.14 16.14C3.11 16.23 3.134 16.33 3.201 16.397C3.247 16.443 3.307 16.468 3.374 16.468C3.426 16.468 3.476 16.446 3.522 16.411L6.96 14.11C7.458 14.181 7.97 14.22 8.49 14.22H9C13.9706 14.22 18 11.138 18 7.337C18 3.536 13.9706 0.5 9 0.5Z"
              fill="#191919"
              fillOpacity="0.9"
            />
          </svg>
        </span>
        <span className={styles.label}>{label}</span>
      </span>
    </button>
  );
}
