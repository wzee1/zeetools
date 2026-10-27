import CloseIcon from '@zeetools/ui/components/icons/actions/close-icon';

interface BrowserTabPreviewProps {
  /** The generated 32px icon (an object URL); the tab shows it at 16px like a browser does. */
  iconUrl?: string;
  title: string;
}

/**
 * A small macOS browser window: a title bar with the three window lights (neutral, as everywhere in the
 * shell) centred on it, and the open tab sitting on the bar's bottom edge so it runs into the page below.
 */
export default function BrowserTabPreview({ iconUrl, title }: BrowserTabPreviewProps) {
  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-panel border border-border bg-surface-raised">
      <div className="relative flex h-11 items-end bg-surface pr-3 pl-4">
        <div aria-hidden className="mr-5 flex shrink-0 gap-2 self-center">
          <span className="size-3 rounded-full bg-border-strong/60" />
          <span className="size-3 rounded-full bg-border-strong/60" />
          <span className="size-3 rounded-full bg-border-strong/60" />
        </div>

        {/* The bar's bottom hairline runs under the tab, which covers it: the active tab and the page are one surface. */}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-border" />
        <div className="relative flex h-8 w-52 max-w-full min-w-0 items-center gap-2 rounded-t-control border border-b-0 border-border bg-surface-raised pr-2 pl-3 text-xs text-foreground">
          {iconUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- blob: preview generated locally; next/image cannot optimise it in a static export
            <img src={iconUrl} alt="Tab Icon" width={16} height={16} decoding="async" className="size-4 shrink-0" />
          )}
          <span className="min-w-0 flex-1 truncate">{title}</span>
          <CloseIcon className="size-3 shrink-0 text-muted" />
        </div>
      </div>

      <p className="px-6 py-10 text-center text-sm text-muted">Live Browser Tab Appearance Simulation</p>
    </div>
  );
}
