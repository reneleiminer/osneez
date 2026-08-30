import type { CartLineView } from "@/types/shop";

/**
 * The bag lives outside React in a tiny observable store backed by
 * localStorage. Components read it through useSyncExternalStore, which gives
 * correct hydration (empty on the server, restored on the client) and free
 * cross-tab synchronisation.
 */

const STORAGE_KEY = "osneez.bag.v1";
export const MAX_QUANTITY = 10;

const EMPTY: CartLineView[] = [];

let lines: CartLineView[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function isCartLine(value: unknown): value is CartLineView {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.slug === "string" &&
    typeof line.size === "string" &&
    typeof line.name === "string" &&
    typeof line.price === "number" &&
    typeof line.quantity === "number" &&
    Number.isFinite(line.quantity)
  );
}

function read(): CartLineView[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const valid = parsed.filter(isCartLine).map((line) => ({
      ...line,
      quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.round(line.quantity))),
    }));
    return valid.length ? valid : EMPTY;
  } catch {
    return EMPTY;
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  lines = read();
  loaded = true;
}

function emit() {
  for (const listener of listeners) listener();
}

function commit(next: CartLineView[]) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked or full — the bag stays session-only */
  }
  emit();
}

function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  lines = read();
  emit();
}

export function subscribe(listener: () => void): () => void {
  ensureLoaded();
  if (listeners.size === 0 && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function getSnapshot(): CartLineView[] {
  ensureLoaded();
  return lines;
}

export function getServerSnapshot(): CartLineView[] {
  return EMPTY;
}

export function addLine(incoming: CartLineView): void {
  ensureLoaded();
  const existing = lines.find(
    (line) => line.slug === incoming.slug && line.size === incoming.size,
  );
  if (!existing) {
    commit([
      ...lines,
      { ...incoming, quantity: Math.max(1, Math.round(incoming.quantity)) },
    ]);
    return;
  }
  commit(
    lines.map((line) =>
      line === existing
        ? {
            ...line,
            quantity: Math.min(
              MAX_QUANTITY,
              line.quantity + Math.max(1, Math.round(incoming.quantity)),
            ),
          }
        : line,
    ),
  );
}

export function setLineQuantity(
  slug: string,
  size: string,
  quantity: number,
): void {
  ensureLoaded();
  commit(
    lines
      .map((line) =>
        line.slug === slug && line.size === size
          ? { ...line, quantity: Math.min(MAX_QUANTITY, quantity) }
          : line,
      )
      .filter((line) => line.quantity > 0),
  );
}

export function removeLine(slug: string, size: string): void {
  ensureLoaded();
  commit(lines.filter((line) => !(line.slug === slug && line.size === size)));
}

export function clearLines(): void {
  ensureLoaded();
  if (lines.length === 0) return;
  commit(EMPTY);
}
