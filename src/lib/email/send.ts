import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/settings";

export type EmailProvider = "resend" | "smtp" | "none";

/**
 * Credentials never live in the database — the settings table is world
 * readable. Provider selection therefore follows the environment:
 *
 *   RESEND_API_KEY   → Resend (free tier, plain HTTPS, no dependency)
 *   SMTP_URL         → any SMTP server, e.g. smtps://user:pass@mail.host:465
 */
export function emailProvider(): EmailProvider {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_URL) return "smtp";
  return "none";
}

export function emailConfigured(): boolean {
  return emailProvider() !== "none";
}

export type SendResult = { ok: boolean; provider: EmailProvider; error?: string };

async function sendViaResend(
  from: string,
  to: string,
  subject: string,
  html: string,
  text: string,
  replyTo: string | null,
): Promise<SendResult> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return {
      ok: false,
      provider: "resend",
      error: `Resend ${response.status}: ${detail.slice(0, 200)}`,
    };
  }
  return { ok: true, provider: "resend" };
}

async function sendViaSmtp(
  from: string,
  to: string,
  subject: string,
  html: string,
  text: string,
  replyTo: string | null,
): Promise<SendResult> {
  // Imported lazily so the dependency is only loaded when SMTP is actually used.
  const { createTransport } = await import("nodemailer");
  const transport = createTransport(process.env.SMTP_URL as string);
  await transport.sendMail({
    from,
    to,
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
  return { ok: true, provider: "smtp" };
}

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  template: string;
  orderId?: string | null;
};

/**
 * Sends one message and records the attempt. Never throws: a failing mail must
 * not roll back an order that Stripe already captured.
 */
export async function sendEmail(email: OutgoingEmail): Promise<SendResult> {
  const provider = emailProvider();
  const settings = await getSettings();
  const fromAddress = settings.email_from;

  const log = async (status: "sent" | "failed" | "skipped", error?: string) => {
    const db = getSupabaseAdminClient();
    if (!db) return;
    try {
      await db.from("email_log").insert({
        template: email.template,
        to_email: email.to,
        subject: email.subject,
        order_id: email.orderId ?? null,
        provider,
        status,
        error: error?.slice(0, 500) ?? null,
      });
    } catch (cause) {
      console.error("[osneez] could not write email log:", cause);
    }
  };

  if (provider === "none" || !fromAddress) {
    const reason =
      provider === "none"
        ? "Kein E-Mail-Anbieter konfiguriert (RESEND_API_KEY oder SMTP_URL fehlt)."
        : "Absenderadresse fehlt (Settings → E-Mail).";
    await log("skipped", reason);
    return { ok: false, provider, error: reason };
  }

  const from = settings.email_from_name
    ? `${settings.email_from_name} <${fromAddress}>`
    : fromAddress;

  try {
    const result =
      provider === "resend"
        ? await sendViaResend(
            from,
            email.to,
            email.subject,
            email.html,
            email.text,
            settings.email_reply_to,
          )
        : await sendViaSmtp(
            from,
            email.to,
            email.subject,
            email.html,
            email.text,
            settings.email_reply_to,
          );

    await log(result.ok ? "sent" : "failed", result.error);
    return result;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error("[osneez] email send failed:", cause);
    await log("failed", message);
    return { ok: false, provider, error: message };
  }
}

/** True when this template was already delivered for the order. */
export async function alreadySent(
  orderId: string,
  template: string,
): Promise<boolean> {
  const db = getSupabaseAdminClient();
  if (!db) return false;
  try {
    const { data } = await db
      .from("email_log")
      .select("id")
      .eq("order_id", orderId)
      .eq("template", template)
      .eq("status", "sent")
      .limit(1);
    return Boolean(data?.length);
  } catch {
    return false;
  }
}
