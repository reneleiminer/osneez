import "server-only";

import { formatPrice } from "@/lib/format";
import { formatAddress } from "@/lib/settings";
import type { Settings } from "@/types/settings";

type Line = { description: string; quantity: number };

const ACCENT = "#e4261c";
const INK = "#111214";
const MUTED = "#6c7075";

/**
 * Light, table-based markup on purpose: dark backgrounds and modern CSS are
 * unreliable across mail clients, so the brand shows up through type and the
 * single accent rule instead.
 */
function shell(settings: Settings, title: string, body: string): string {
  const address = formatAddress(settings).join(" · ");
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f2ee;font-family:Helvetica,Arial,sans-serif;color:${INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;">
<tr><td style="padding:28px 32px 0;">
  <div style="font-size:26px;font-weight:900;letter-spacing:-1px;">OSNEEZ®</div>
  <div style="height:4px;width:56px;background:${ACCENT};margin-top:10px;"></div>
</td></tr>
<tr><td style="padding:24px 32px 32px;">${body}</td></tr>
<tr><td style="padding:0 32px 28px;border-top:1px solid #e6e3dd;">
  <p style="margin:16px 0 0;font-size:11px;line-height:1.6;color:${MUTED};">
    ${escapeHtml(address || "OSNEEZ")}<br>
    ${settings.contact_email ? escapeHtml(settings.contact_email) : ""}
  </p>
</td></tr>
</table></td></tr></table></body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function itemRows(lines: Line[]): string {
  if (!lines.length) return "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;font-size:14px;">
${lines
  .map(
    (line) =>
      `<tr><td style="padding:8px 0;border-bottom:1px solid #eeece7;">${escapeHtml(
        line.description,
      )}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #eeece7;color:${MUTED};">${line.quantity}×</td></tr>`,
  )
  .join("\n")}
</table>`;
}

function itemText(lines: Line[]): string {
  return lines.map((line) => `- ${line.quantity}× ${line.description}`).join("\n");
}

export function orderConfirmationEmail(
  settings: Settings,
  order: {
    reference: string;
    amountTotal: number;
    lines: Line[];
  },
) {
  const subject = `Bestellung #${order.reference} — danke!`;
  const html = shell(
    settings,
    subject,
    `<h1 style="margin:0 0 12px;font-size:22px;">Danke für deine Order.</h1>
     <p style="margin:0;font-size:14px;line-height:1.7;color:${MUTED};">
       Wir haben deine Bestellung <strong style="color:${INK};">#${escapeHtml(order.reference)}</strong>
       erhalten. Sobald das Paket rausgeht, bekommst du eine Mail mit dem Tracking-Link.
     </p>
     ${itemRows(order.lines)}
     <p style="margin:0;font-size:14px;"><strong>Gesamt: ${formatPrice(order.amountTotal)}</strong>
     <span style="color:${MUTED};font-size:12px;"> inkl. MwSt.</span></p>`,
  );
  const text = `Danke für deine Order.

Bestellung #${order.reference}

${itemText(order.lines)}

Gesamt: ${formatPrice(order.amountTotal)} inkl. MwSt.

Sobald das Paket rausgeht, bekommst du eine Mail mit dem Tracking-Link.`;
  return { subject, html, text };
}

export function shippingNotificationEmail(
  settings: Settings,
  order: {
    reference: string;
    carrier: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    lines: Line[];
  },
) {
  const subject = `Deine Order #${order.reference} ist unterwegs`;
  const tracking = order.trackingNumber
    ? `<p style="margin:20px 0 0;font-size:14px;line-height:1.7;">
         ${escapeHtml(order.carrier ?? "Sendung")}:
         ${
           order.trackingUrl
             ? `<a href="${escapeHtml(order.trackingUrl)}" style="color:${ACCENT};font-weight:bold;">${escapeHtml(order.trackingNumber)}</a>`
             : `<strong>${escapeHtml(order.trackingNumber)}</strong>`
         }
       </p>`
    : "";
  const html = shell(
    settings,
    subject,
    `<h1 style="margin:0 0 12px;font-size:22px;">Unterwegs.</h1>
     <p style="margin:0;font-size:14px;line-height:1.7;color:${MUTED};">
       Deine Bestellung <strong style="color:${INK};">#${escapeHtml(order.reference)}</strong>
       hat das Lager verlassen.
     </p>
     ${tracking}
     ${itemRows(order.lines)}`,
  );
  const text = `Deine Order #${order.reference} ist unterwegs.

${order.trackingNumber ? `${order.carrier ?? "Sendung"}: ${order.trackingNumber}${order.trackingUrl ? `\n${order.trackingUrl}` : ""}\n\n` : ""}${itemText(order.lines)}`;
  return { subject, html, text };
}

const RETURN_COPY: Record<string, { title: string; body: string }> = {
  approved: {
    title: "Rücksendung genehmigt",
    body: "Schick die Ware ungetragen und mit Etikett zurück. Die Retourenadresse steht unten.",
  },
  received: {
    title: "Rücksendung angekommen",
    body: "Wir haben dein Paket erhalten und prüfen es gerade.",
  },
  refunded: {
    title: "Erstattung ist raus",
    body: "Der Betrag geht über das ursprüngliche Zahlungsmittel zurück. Je nach Bank dauert das ein paar Tage.",
  },
  rejected: {
    title: "Rücksendung abgelehnt",
    body: "Leider können wir die Rücksendung nicht annehmen. Melde dich gern, wenn du Fragen hast.",
  },
};

export function returnUpdateEmail(
  settings: Settings,
  input: { reference: string | null; status: string; note: string | null },
) {
  const copy = RETURN_COPY[input.status] ?? {
    title: "Update zu deiner Rücksendung",
    body: `Neuer Status: ${input.status}.`,
  };
  const subject = `${copy.title}${input.reference ? ` — #${input.reference}` : ""}`;
  const html = shell(
    settings,
    subject,
    `<h1 style="margin:0 0 12px;font-size:22px;">${escapeHtml(copy.title)}</h1>
     <p style="margin:0;font-size:14px;line-height:1.7;color:${MUTED};">${escapeHtml(copy.body)}</p>
     ${input.note ? `<p style="margin:16px 0 0;font-size:14px;line-height:1.7;">${escapeHtml(input.note)}</p>` : ""}`,
  );
  const text = `${copy.title}

${copy.body}${input.note ? `\n\n${input.note}` : ""}`;
  return { subject, html, text };
}

export function testEmail(settings: Settings) {
  const subject = "OSNEEZ — Testmail";
  const html = shell(
    settings,
    subject,
    `<h1 style="margin:0 0 12px;font-size:22px;">Zustellung funktioniert.</h1>
     <p style="margin:0;font-size:14px;line-height:1.7;color:${MUTED};">
       Wenn diese Mail ankommt, sind Absender und Anbieter korrekt eingerichtet.
     </p>`,
  );
  return { subject, html, text: "Zustellung funktioniert." };
}
