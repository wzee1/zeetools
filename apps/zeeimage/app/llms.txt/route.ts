import { llmsTxt } from "@/content/about";

export const dynamic = "force-static";

/** What an AI assistant reads about this tool (llmstxt.org), generated from the same copy as the About section. */
export function GET() {
  return new Response(llmsTxt, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
