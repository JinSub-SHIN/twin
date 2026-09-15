export const THEME_KEY = "saljjak.theme";

export type Theme = "light" | "dark";

export function readTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function persistTheme(theme: Theme) {
  applyTheme(theme);
  localStorage.setItem(THEME_KEY, theme);
}

export function initTheme() {
  applyTheme(readTheme());
}
