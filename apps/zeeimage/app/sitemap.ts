import type { MetadataRoute } from "next";
import { appUrl } from "@/zee.config";

// Written once at build time (zeeimage and zeecall are static exports).
export const dynamic = "force-static";

// The tool is one page; everything else (zeepass's /s/ links) is private and never listed.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: appUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
