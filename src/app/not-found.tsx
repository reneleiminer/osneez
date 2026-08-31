import { SiteChrome } from "@/components/layout/site-chrome";
import { NotFoundView } from "@/components/layout/not-found-view";

/** Handles unmatched URLs and notFound() from any storefront route. */
export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundView />
    </SiteChrome>
  );
}
