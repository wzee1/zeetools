import type { MetadataRoute } from "next";
import { appUrl } from "@/zee.config";

// Written once at build time (zeeimage and zeecall are static exports).
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
