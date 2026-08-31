import { ImageResponse } from "next/og";

import { displayFontOptions, loadDisplayFont } from "@/lib/og-font";
import { SITE } from "@/lib/site";

export const alt = "OSNEEZ — Streetwear built after dark";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated share card. No campaign photography exists yet, so the card leans
 * on the brand's display type and the single accent colour.
 */
export default async function OpengraphImage() {
  const font = await loadDisplayFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#08080a",
          backgroundImage:
            "radial-gradient(60% 70% at 18% 20%, rgba(228,38,28,0.30) 0%, rgba(8,8,10,0) 60%), linear-gradient(160deg, #14161b 0%, #08080a 60%)",
          color: "#e9e5dc",
          fontFamily: "Anton, sans-serif",
          textTransform: "uppercase",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: 7,
            color: "#8b9098",
          }}
        >
          <span>Drop 001 — available now</span>
          <span>Independent</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 210,
              letterSpacing: -4,
              lineHeight: 1,
            }}
          >
            OSNEEZ
          </div>
          <div
            style={{
              display: "flex",
              width: 260,
              height: 10,
              marginTop: 26,
              backgroundColor: "#e4261c",
            }}
          />
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 56,
              letterSpacing: 1,
            }}
          >
            Built after dark.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: 6,
            color: "#8b9098",
          }}
        >
          <span>Made for the hours nobody talks about</span>
          <span>{SITE.url.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    ),
    { ...size, fonts: displayFontOptions(font) },
  );
}
