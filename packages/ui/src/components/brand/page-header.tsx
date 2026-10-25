import StaggerItem from "../motion/stagger-item";

interface PageHeaderProps {
  title: string;
  /** A small mark before the title (a drawn check, a status icon). */
  leading?: React.ReactNode;
  /** Quiet content on the right of the title row (a tag, an action). */
  aside?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * The page's title row, app-dashboard style: a regular-weight title (size and colour carry the
 * hierarchy, not weight) with its muted description under it, and an optional aside on the right.
 * Title and description stay one block, so when space runs out the aside moves below both,
 * never between them. The leading mark lines up with the title's first line.
 * Render it inside a `Stagger`, so it settles in with the rest of the view.
 */
export default function PageHeader({ title, leading, aside, children }: PageHeaderProps) {
  return (
    <StaggerItem className="flex flex-wrap items-start justify-between gap-x-6 gap-y-5">
      <div className="min-w-0 flex-1 basis-80 space-y-3">
        <div className="flex items-start gap-3">
          {leading && <span className="mt-px shrink-0 sm:mt-0.5">{leading}</span>}
          <h1 className="min-w-0 text-[1.75rem] leading-tight font-normal tracking-[-0.02em] text-balance text-foreground sm:text-[2rem]">
            {title}
          </h1>
        </div>
        {children && <p className="max-w-xl text-[0.9375rem] leading-relaxed text-pretty text-muted">{children}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </StaggerItem>
  );
}
