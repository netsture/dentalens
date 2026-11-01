export type AppTheme = "blue" | "green" | "orange" | "teal" | "slate" | "light-green" | "coral" | "lime";

export const THEMES: {
  id: AppTheme;
  label: string;
  /** Swatch color shown in the profile menu */
  swatch: string;
  /** Check-mark color on the swatch */
  check: string;
}[] = [
  { id: "blue", label: "Blue", swatch: "#1a3a5c", check: "#ffffff" },
  { id: "green", label: "Green", swatch: "#1f6b4a", check: "#ffffff" },
  { id: "orange", label: "Orange", swatch: "#c45c16", check: "#ffffff" },
  { id: "teal", label: "Teal", swatch: "#0f6e6e", check: "#ffffff" },
  { id: "slate", label: "Slate", swatch: "#3d4f66", check: "#ffffff" },
  { id: "light-green", label: "Light green", swatch: "#86C56A", check: "#1a3314" },
  { id: "coral", label: "Coral", swatch: "#FF6C60", check: "#ffffff" },
  { id: "lime", label: "Lime", swatch: "#c9f279", check: "#2a3d0c" },
];

export const THEME_STORAGE_KEY = "dl-theme";
export const DEFAULT_THEME: AppTheme = "blue";

export function isAppTheme(value: string | null): value is AppTheme {
  return THEMES.some((t) => t.id === value);
}

export function getStoredTheme(): AppTheme {
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  return isAppTheme(raw) ? raw : DEFAULT_THEME;
}

/** Apply theme on <html> so CSS variables update across the whole app. */
export function applyTheme(theme: AppTheme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/** Call once at app boot (before paint if possible). */
export function initTheme() {
  applyTheme(getStoredTheme());
}
