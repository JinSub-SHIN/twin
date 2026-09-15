import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { persistTheme, readTheme, type Theme } from "@/lib/theme";
import styles from "./Header.module.css";

type HeaderProps = {
  immersive?: boolean;
};

export function Header({ immersive = false }: HeaderProps) {
  const { pathname } = useLocation();
  const { isLoggedIn, logout, withdraw } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => readTheme());
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const showSettings = pathname === "/profile" && isLoggedIn;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function setThemeMode(next: Theme) {
    if (next === theme) return;
    persistTheme(next);
    setTheme(next);
  }

  if (immersive) {
    return (
      <header className={styles.immersive}>
        <p className={styles.immersiveLabel}>월세, 살짝 나눠요</p>
      </header>
    );
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.brand}>살짝</h1>
        {showSettings ? (
          <div className={styles.settings} ref={menuRef}>
            <button
              type="button"
              className={styles.settingsBtn}
              aria-label="설정"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Settings size={20} strokeWidth={2.1} />
            </button>
            {menuOpen ? (
              <div className={styles.menu} role="menu">
                <div
                  className={styles.themeSwitch}
                  data-theme={theme}
                  role="group"
                  aria-label="테마"
                >
                  <span className={styles.themeThumb} aria-hidden />
                  <button
                    type="button"
                    className={styles.themeSide}
                    aria-pressed={theme === "dark"}
                    aria-label="다크모드"
                    onClick={() => setThemeMode("dark")}
                  >
                    🌙
                  </button>
                  <span className={styles.themeBar} aria-hidden>
                    |
                  </span>
                  <button
                    type="button"
                    className={styles.themeSide}
                    aria-pressed={theme === "light"}
                    aria-label="라이트모드"
                    onClick={() => setThemeMode("light")}
                  >
                    ☀️
                  </button>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  className={styles.menuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                >
                  <span className={styles.menuIcon} aria-hidden>
                    🚪
                  </span>
                  로그아웃
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.menuItem} ${styles.menuItemDanger}`}
                  onClick={() => {
                    setMenuOpen(false);
                    setWithdrawOpen(true);
                  }}
                >
                  <span className={styles.menuIcon} aria-hidden>
                    👋
                  </span>
                  회원탈퇴
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className={styles.withdrawPanel} showCloseButton={false}>
          <DialogTitle className={styles.withdrawTitle}>
            정말 탈퇴할까요?
          </DialogTitle>
          <DialogDescription className={styles.withdrawDesc}>
            계정 정보가 삭제되고, 다시 가입해야 이용할 수 있어요.
          </DialogDescription>
          <div className={styles.withdrawActions}>
            <Button
              type="button"
              variant="outline"
              className={styles.withdrawCancel}
              onClick={() => setWithdrawOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              className={styles.withdrawConfirm}
              onClick={() => {
                setWithdrawOpen(false);
                withdraw();
              }}
            >
              탈퇴하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
