/**
 * Selected delivery country, kept outside React in the same observable-store
 * pattern as the bag. Read through useSyncExternalStore so the server renders
 * the default and the client swaps in the stored value without a hydration
 * mismatch — and without a setState inside an effect.
 */

const STORAGE_KEY = "osneez.country";
export const DEFAULT_COUNTRY = "DE";

let country = DEFAULT_COUNTRY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): string {
  if (typeof window === "undefined") return DEFAULT_COUNTRY;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && /^[A-Z]{2}$/.test(stored) ? stored : DEFAULT_COUNTRY;
  } catch {
    return DEFAULT_COUNTRY;
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  country = read();
  loaded = true;
}

export function subscribe(listener: () => void): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): string {
  ensureLoaded();
  return country;
}

export function getServerSnapshot(): string {
  return DEFAULT_COUNTRY;
}

export function setDestination(code: string): void {
  const next = code.trim().toUpperCase().slice(0, 2);
  if (!/^[A-Z]{2}$/.test(next) || next === country) return;
  country = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage blocked — the choice stays session-only */
  }
  for (const listener of listeners) listener();
}
