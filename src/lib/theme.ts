export type AppTheme = "blue" | "green" | "orange" | "teal" | "slate";

export const THEMES: {
  id: AppTheme;
  label: string;
  /** Swatch color shown in the profile menu */
  swatch: string;
}[] = [
  { id: "blue", label: "Blue", swatch: "#1a3a5c" },
  { id: "green", label: "Green", swatch: "#1f6b4a" },
  { id: "orange", label: "Orange", swatch: "#c45c16" },
  { id: "teal", label: "Teal", swatch: "#0f6e6e" },
  { id: "slate", label: "Slate", swatch: "#3d4f66" },
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
