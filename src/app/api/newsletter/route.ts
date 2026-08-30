import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const payload = z.object({
  email: z.string().max(254),
  source: z.string().max(64).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = payload.safeParse(body);
  const email = parsed.success ? parsed.data.email.trim().toLowerCase() : "";
  if (!parsed.success || !EMAIL_PATTERN.test(email)) {
    return Response.json(
      { error: "Bitte gib eine gültige E-Mail-Adresse ein." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    // Without a service-role key we cannot persist — loud in the log, quiet
    // for the visitor, so the form never looks broken in a preview deploy.
    console.warn(
      "[osneez] newsletter signup dropped: SUPABASE_SERVICE_ROLE_KEY is not set",
    );
    return Response.json({ ok: true, stored: false });
  }

  const { error } = await supabase.from("newsletter_subscribers").upsert(
    {
      email,
      source: parsed.data.source?.trim() || "site",
      active: true,
    },
    { onConflict: "email", ignoreDuplicates: false },
  );

  if (error) {
    console.error("[osneez] newsletter insert failed:", error);
    return Response.json(
      { error: "Anmeldung fehlgeschlagen. Bitte versuch es später erneut." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, stored: true });
}
