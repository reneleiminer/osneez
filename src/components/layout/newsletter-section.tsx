"use client";

import { useState } from "react";

import { Reveal } from "@/components/motion/reveal";

type Status = "idle" | "loading" | "done" | "error";

const PERKS = ["Early access", "Private drops", "Restocks", "Events"];

export function NewsletterSection({ source = "footer" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage(null);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Das hat nicht geklappt.");
      setStatus("done");
      setEmail("");
    } catch (cause) {
      setStatus("error");
      setMessage(
        cause instanceof Error ? cause.message : "Das hat nicht geklappt.",
      );
    }
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative overflow-hidden border-t os-rule bg-ink"
    >
      <div className="os-edge grid gap-12 py-20 lg:grid-cols-12 lg:py-32">
        <div className="lg:col-span-6">
          <p className="os-eyebrow mb-6">04 / Inner circle</p>
          <Reveal variant="fade">
            <h2
              id="newsletter-heading"
              className="os-display text-[clamp(2.75rem,8vw,6.5rem)]"
            >
              Join the
              <br />
              inner circle.
            </h2>
          </Reveal>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {PERKS.map((perk) => (
              <li key={perk} className="os-label text-[0.625rem] text-smoke">
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5 lg:col-start-8 lg:self-end">
          {status === "done" ? (
            <div
              role="status"
              className="border-l-2 border-signal pl-5 duration-700 animate-[os-fade-up_0.7s_cubic-bezier(0.16,1,0.3,1)]"
            >
              <p className="os-display text-4xl">You&apos;re in.</p>
              <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-smoke">
                Wir melden uns, bevor der nächste Drop öffentlich wird. Kein
                Spam, kein Rabatt-Geschrei.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label htmlFor="newsletter-email" className="os-eyebrow">
                Email
              </label>
              <div className="mt-2 flex items-center gap-4">
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@domain.com"
                  aria-describedby={message ? "newsletter-message" : undefined}
                  className="os-input"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="os-btn os-btn-signal shrink-0"
                >
                  {status === "loading" ? "…" : "Join"}
                </button>
              </div>
              {message ? (
                <p
                  id="newsletter-message"
                  role="alert"
                  className="mt-4 text-xs text-signal"
                >
                  {message}
                </p>
              ) : null}
              <p className="mt-5 max-w-[42ch] text-[0.6875rem] leading-relaxed text-smoke">
                Mit dem Absenden stimmst du dem Empfang von E-Mails zu. Abmeldung
                jederzeit über den Link in jeder Mail.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
