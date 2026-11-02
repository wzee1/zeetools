import type { MetadataRoute } from "next";
import { appUrl } from "@/zee.config";

// Prerendered at build time, so the Worker serves it as a static file.
export const dynamic = "force-static";

// The tool and its FAQ; everything else (zeepass's /s/ links) is private and never listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: appUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${appUrl}/faq`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];
}
