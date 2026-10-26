export type AppDensity = "compact" | "standard" | "comfortable";

export const DENSITIES: AppDensity[] = ["compact", "standard", "comfortable"];
export const DENSITY_STORAGE_KEY = "dl-density";
export const DEFAULT_DENSITY: AppDensity = "standard";

export function isAppDensity(value: string | null): value is AppDensity {
  return DENSITIES.includes(value as AppDensity);
}

export function getStoredDensity(): AppDensity {
  const raw = localStorage.getItem(DENSITY_STORAGE_KEY);
  return isAppDensity(raw) ? raw : DEFAULT_DENSITY;
}

export function applyDensity(density: AppDensity) {
  document.documentElement.classList.remove("density-compact", "density-standard", "density-comfortable");
  document.documentElement.classList.add(`density-${density}`);
  localStorage.setItem(DENSITY_STORAGE_KEY, density);
}

export function initDensity() {
  applyDensity(getStoredDensity());
}
