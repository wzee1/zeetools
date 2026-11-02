import type { MetadataRoute } from "next";
import { appUrl } from "@/zee.config";

// Prerendered at build time, so the Worker serves it as a static file.
export const dynamic = "force-static";

// The AI crawlers, named so the choice is explicit: everything is open to search and to AI, training crawlers included.
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Meta-ExternalAgent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
