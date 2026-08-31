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
