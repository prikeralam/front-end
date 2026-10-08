import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "./_lib/seo";

const PRODUCTION_HOST = new URL(SITE_URL).host;

/**
 * Production is open to search engines except for private areas; every other host (staging, a local run) asks them to
 * stay away, so test copies never compete with the real site in results.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0].trim().toLowerCase();
  if (host !== PRODUCTION_HOST) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/account", "/reset-password", "/api/", "/data/dashboards"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
