/** Only one table filter panel open at a time across the app. */
let openToolbarId: string | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getOpenFilterToolbarId() {
  return openToolbarId;
}

export function openFilterToolbar(id: string) {
  if (openToolbarId === id) return;
  openToolbarId = id;
  notify();
}

export function closeFilterToolbar(id?: string) {
  if (id && openToolbarId !== id) return;
  openToolbarId = null;
  notify();
}

export function subscribeFilterToolbar(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
