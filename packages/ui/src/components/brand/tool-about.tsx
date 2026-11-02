import { ChevronDown } from "lucide-react";
import type { ToolAboutContent } from "../../lib/about";

interface ToolAboutProps extends ToolAboutContent {
  /** The tool's code on GitHub; the link is left out when empty. */
  source?: string;
}

const LINK = "text-foreground underline decoration-border-strong underline-offset-2 transition-colors hover:decoration-foreground";

/**
 * The tool's plain-language explanation under the tool: what it is, how it works, and the questions people ask.
 * It is server-rendered text, and the FAQ is native <details>, so readers, search engines and AI crawlers get
 * every answer without JavaScript. Quiet on purpose: it sits under the tool and never competes with it.
 */
export default function ToolAbout({ heading, intro, points, faq, source }: ToolAboutProps) {
  return (
    <section
      aria-labelledby="about-heading"
      className="mx-auto mt-4 w-full max-w-4xl shrink-0 px-5 pb-12 sm:px-10"
    >
      <div className="space-y-10 border-t border-border pt-10">
        <div className="space-y-3">
          <h2 id="about-heading" className="text-xl font-normal tracking-[-0.01em] text-foreground">
            {heading}
          </h2>
          <p className="max-w-xl text-[0.9375rem] leading-relaxed text-pretty text-muted">{intro}</p>
        </div>

        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {points.map(({ title, body }) => (
            <li key={title} className="min-w-0 space-y-1.5">
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-pretty text-muted">{body}</p>
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Frequently asked questions</h3>
          <div className="divide-y divide-border border-y border-border">
            {faq.map(({ q, a }) => (
              <details key={q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-3.5 text-sm text-foreground outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 text-pretty">{q}</span>
                  <ChevronDown aria-hidden className="size-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="max-w-xl pb-4 text-sm leading-relaxed text-pretty text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted">
          {source && (
            <>
              <a href={source} className={LINK}>
                Source on GitHub
              </a>
              {" · "}
            </>
          )}
          <a href="https://wzee.dev/privacy" className={LINK}>
            Privacy notice
          </a>
        </p>
      </div>
    </section>
  );
}
