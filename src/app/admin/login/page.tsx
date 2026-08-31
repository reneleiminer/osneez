import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Field, Notice } from "@/components/admin/ui";
import { adminIsConfigured, getAdminUser } from "@/lib/supabase/auth";
import { signIn } from "../actions";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (await getAdminUser()) redirect("/admin");

  return (
    <div className="os-edge flex min-h-dvh flex-col justify-center py-16">
      <div className="mx-auto w-full max-w-sm">
        <p className="os-eyebrow text-signal">OSNEEZ Admin</p>
        <h1 className="os-display mt-3 text-5xl leading-[0.85]">Sign in</h1>

        {!adminIsConfigured() ? (
          <div className="mt-8">
            <Notice tone="error">
              Das Admin ist noch nicht eingerichtet. Es braucht
              <code className="text-bone"> NEXT_PUBLIC_SUPABASE_URL</code>,
              <code className="text-bone"> NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,
              <code className="text-bone"> SUPABASE_SERVICE_ROLE_KEY</code> und
              <code className="text-bone"> ADMIN_EMAILS</code> als Environment
              Variables.
            </Notice>
          </div>
        ) : null}

        {error ? (
          <div className="mt-8">
            <Notice tone="error">{error}</Notice>
          </div>
        ) : null}

        <form action={signIn} className="mt-8 grid gap-6">
          <Field
            label="E-Mail"
            name="email"
            type="email"
            required
            placeholder="du@osneez.com"
          />
          <Field label="Passwort" name="password" type="password" required />
          <button type="submit" className="os-btn os-btn-signal w-full">
            Sign in
          </button>
        </form>

        <p className="mt-8 text-[0.6875rem] leading-relaxed text-smoke">
          Zugang wird nicht hier angelegt, sondern in Supabase unter
          Authentication → Users. Danach muss dieselbe Adresse in
          <code className="text-bone"> ADMIN_EMAILS</code> stehen.
        </p>
      </div>
    </div>
  );
}
