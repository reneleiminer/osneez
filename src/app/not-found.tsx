import { SiteChrome } from "@/components/layout/site-chrome";
import { NotFoundView } from "@/components/layout/not-found-view";
import { getSettings } from "@/lib/settings";

/** Handles unmatched URLs and notFound() from any storefront route. */
export default async function NotFound() {
  const settings = await getSettings();
  return (
    <SiteChrome settings={settings}>
      <NotFoundView />
    </SiteChrome>
  );
}
