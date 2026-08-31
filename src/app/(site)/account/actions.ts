"use server";

import { redirect } from "next/navigation";

import { createAuthClient } from "@/lib/supabase/auth";

const field = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();

export async function customerSignIn(form: FormData) {
  const supabase = await createAuthClient();
  if (!supabase) redirect("/account/login?error=Login+ist+nicht+eingerichtet");

  const { error } = await supabase.auth.signInWithPassword({
    email: field(form, "email").toLowerCase(),
    password: String(form.get("password") ?? ""),
  });

  if (error) redirect("/account/login?error=E-Mail+oder+Passwort+stimmt+nicht");
  redirect("/account");
}

export async function customerSignUp(form: FormData) {
  const supabase = await createAuthClient();
  if (!supabase) redirect("/account/login?error=Login+ist+nicht+eingerichtet");

  const password = String(form.get("password") ?? "");
  if (password.length < 8) {
    redirect("/account/login?error=Passwort+braucht+mindestens+8+Zeichen");
  }

  const { data, error } = await supabase.auth.signUp({
    email: field(form, "email").toLowerCase(),
    password,
  });

  if (error) {
    redirect(
      `/account/login?error=${encodeURIComponent("Registrierung fehlgeschlagen")}`,
    );
  }

  // With email confirmation switched on in Supabase there is no session yet.
  if (!data.session) {
    redirect("/account/login?check=1");
  }
  redirect("/account");
}

export async function customerSignOut() {
  const supabase = await createAuthClient();
  await supabase?.auth.signOut();
  redirect("/");
}

export async function requestReturn(form: FormData) {
  const supabase = await createAuthClient();
  if (!supabase) redirect("/account/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/account/login");

  // Inserted through the customer's own session: the RLS policy checks that
  // the email matches the signed-in user, so one account cannot file a return
  // in someone else's name.
  const { error } = await supabase.from("return_requests").insert({
    order_id: field(form, "order_id") || null,
    order_reference: field(form, "order_reference") || null,
    email: user.email,
    items: field(form, "items") || null,
    reason: field(form, "reason") || null,
  });

  if (error) {
    console.error("[osneez] return request failed:", error);
    redirect("/account?error=1");
  }
  redirect("/account?returned=1");
}
