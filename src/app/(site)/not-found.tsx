import { NotFoundView } from "@/components/layout/not-found-view";

/**
 * notFound() from a storefront route. Next nests this inside the (site)
 * layout, so the chrome is already there — rendering SiteChrome again would
 * duplicate the header and footer.
 */
export default function SiteNotFound() {
  return <NotFoundView />;
}
