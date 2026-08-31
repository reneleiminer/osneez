import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCustomer } from "@/lib/account";
import { customerSignIn, customerSignUp } from "../actions";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check?: string }>;
}) {
  const { error, check } = await searchParams;
  if (await getCustomer()) redirect("/account");

  return (
    <div className="os-edge py-14 lg:py-20">
      <header className="border-b os-rule pb-8">
        <p className="os-eyebrow text-signal">Account</p>
        <h1 className="os-display mt-4 text-[clamp(2.5rem,9vw,6rem)] leading-[0.82]">
          Your orders,
          <br />
          in one place.
        </h1>
        <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-smoke">
          Ein Konto ist optional — bestellen kannst du auch als Gast. Angemeldet
          siehst du deine Bestellhistorie und den Status jeder Lieferung.
        </p>
      </header>

      {error ? (
        <p
          role="alert"
          className="mt-8 border-l-2 border-signal pl-4 text-xs text-signal"
        >
          {error}
        </p>
      ) : null}

      {check ? (
        <p className="mt-8 border-l-2 border-bone pl-4 text-xs text-smoke">
          Fast fertig — bestätige zuerst die E-Mail, die wir dir geschickt
          haben. Danach kannst du dich hier anmelden.
        </p>
      ) : null}

      <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-8">
        <section aria-labelledby="signin-heading">
          <h2 id="signin-heading" className="os-display text-3xl">
            Sign in
          </h2>
          <form action={customerSignIn} className="mt-6 grid gap-6">
            <div>
              <label htmlFor="signin-email" className="os-eyebrow">
                E-Mail
              </label>
              <input
                id="signin-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="os-input"
              />
            </div>
            <div>
              <label htmlFor="signin-password" className="os-eyebrow">
                Passwort
              </label>
              <input
                id="signin-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="os-input"
              />
            </div>
            <button type="submit" className="os-btn os-btn-primary">
              Sign in
            </button>
          </form>
        </section>

        <section aria-labelledby="signup-heading">
          <h2 id="signup-heading" className="os-display text-3xl">
            Create account
          </h2>
          <form action={customerSignUp} className="mt-6 grid gap-6">
            <div>
              <label htmlFor="signup-email" className="os-eyebrow">
                E-Mail
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="os-input"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="os-eyebrow">
                Passwort
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="os-input"
              />
              <p className="mt-2 text-[0.625rem] text-smoke">
                Mindestens 8 Zeichen.
              </p>
            </div>
            <button type="submit" className="os-btn os-btn-signal">
              Create account
            </button>
          </form>
          <p className="mt-6 max-w-[42ch] text-[0.6875rem] leading-relaxed text-smoke">
            Mit dem Anlegen eines Kontos stimmst du unserer
            Datenschutzerklärung zu. Bestellungen werden dir über die E-Mail
            zugeordnet, die du im Checkout angibst.
          </p>
        </section>
      </div>
    </div>
  );
}
