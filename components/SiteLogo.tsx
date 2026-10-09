import { LOGO_DATA_URI } from "@/lib/logo";

/** DigiPlyra brand logo — inline data URI so it renders even if
 *  static-asset caching/CDN serves a stale 404 for /logo.jpg. */
export default function SiteLogo({
  className = "h-11 w-11 rounded-xl",
}: {
  className?: string;
}) {
  return <img src={LOGO_DATA_URI} alt="DigiPlyra" className={className} />;
}
