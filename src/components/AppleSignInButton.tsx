import { cn } from "@/lib/utils";
import styles from "./AppleSignInButton.module.css";

type AppleSignInButtonProps = {
  onClick: () => void;
  className?: string;
  label?: string;
};

export function AppleSignInButton({
  onClick,
  className,
  label = "Apple로 로그인",
}: AppleSignInButtonProps) {
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
          src="/images/apple_logo.svg"
          alt=""
          draggable={false}
          aria-hidden
        />
        <span className={styles.label}>{label}</span>
      </span>
    </button>
  );
}
