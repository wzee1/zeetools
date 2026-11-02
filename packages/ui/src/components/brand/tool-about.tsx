import type { ToolAboutContent } from "../../lib/about";
import FaqItem from "./faq-item";

interface ToolAboutProps extends ToolAboutContent {
  /** The tool's code on GitHub; the link is left out when empty. */
  source?: string;
}

const LINK = "text-foreground underline decoration-border-strong underline-offset-2 transition-colors hover:decoration-foreground";

/**
 * The tool's FAQ page (linked from the sidebar): what it is, how it works, and the questions people ask.
 * It is server-rendered text, and the FAQ is native <details>, so readers, search engines and AI crawlers get
 * every answer without JavaScript. It has a page of its own so the tool's view stays the tool.
 */
export default function ToolAbout({ heading, intro, points, faq, source }: ToolAboutProps) {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-10 sm:py-12">
      <div className="space-y-10">
        <div className="space-y-3">
          {/* Sized like PageHeader's title, so the page reads as one of the app's own. */}
          <h1 className="text-[1.75rem] leading-tight font-normal tracking-[-0.02em] text-balance text-foreground sm:text-[2rem]">
            {heading}
          </h1>
          <p className="max-w-xl text-[0.9375rem] leading-relaxed text-pretty text-muted">{intro}</p>
        </div>

        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {points.map(({ title, body }) => (
            <li key={title} className="min-w-0 space-y-1.5">
              <h2 className="text-sm font-medium text-foreground">{title}</h2>
              <p className="text-sm leading-relaxed text-pretty text-muted">{body}</p>
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <h2 className="text-sm font-medium text-foreground">Frequently asked questions</h2>
          <div className="divide-y divide-border border-y border-border">
            {faq.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
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
    </main>
  );
}
