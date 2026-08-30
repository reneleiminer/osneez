const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

/** Formats an integer cent amount as a German EUR string. */
export function formatPrice(cents: number): string {
  return euro.format(cents / 100);
}

export function formatDropDate(value: string | null): string {
  if (!value) return "TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBA";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}

export function pad(value: number, length = 3): string {
  return String(value).padStart(length, "0");
}

/**
 * Wrapped so the current time is read inside a helper instead of during a
 * component render.
 */
export function isReleased(releaseDate: string | null): boolean {
  if (!releaseDate) return false;
  const time = new Date(releaseDate).getTime();
  return Number.isFinite(time) && time <= Date.now();
}
