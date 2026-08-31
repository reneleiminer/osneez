import { SiteChrome } from "@/components/layout/site-chrome";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return <SiteChrome settings={settings}>{children}</SiteChrome>;
}
