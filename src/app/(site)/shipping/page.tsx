import type { Metadata } from "next";

import { LegalPage } from "@/components/ui/legal-page";
import { getLegalPage } from "@/lib/legal/queries";
import { parseLegalBody, resolveTokens } from "@/lib/legal/render";
import { getSettings } from "@/lib/settings";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("shipping");
  return {
    title: page.title,
    description: page.intro ?? undefined,
    alternates: { canonical: "/shipping" },
    robots: { index: !page.draft, follow: true },
  };
}

export default async function Page() {
  const [page, settings] = await Promise.all([
    getLegalPage("shipping"),
    getSettings(),
  ]);

  return (
    <LegalPage
      eyebrow="Legal"
      title={page.title}
      intro={page.intro ? resolveTokens(page.intro, settings) : undefined}
      sections={parseLegalBody(page.body, settings)}
      draft={page.draft}
    />
  );
}
