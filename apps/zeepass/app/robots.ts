import type { MetadataRoute } from "next";
import { appUrl } from "@/zee.config";

// Written once at build time (zeeimage and zeecall are static exports).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${appUrl}/sitemap.xml` };
}
