import "server-only";

/**
 * Anton (SIL OFL) for the generated share cards. Fetched and cached at render
 * time instead of vendored into the repo; if the request fails the card still
 * renders in the default font rather than erroring.
 */
const ANTON_TTF = "https://fonts.gstatic.com/s/anton/v27/1Ptgg87LROyAm0K0.ttf";

let cached: ArrayBuffer | null = null;

export async function loadDisplayFont(): Promise<ArrayBuffer | null> {
  if (cached) return cached;
  try {
    const response = await fetch(ANTON_TTF, {
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!response.ok) return null;
    cached = await response.arrayBuffer();
    return cached;
  } catch (error) {
    console.warn("[osneez] could not load OG display font:", error);
    return null;
  }
}

export function displayFontOptions(font: ArrayBuffer | null) {
  if (!font) return undefined;
  return [
    { name: "Anton", data: font, style: "normal" as const, weight: 400 as const },
  ];
}
