# @zeetools/ui

The app shell and component library behind the [wzee.dev](https://wzee.dev) tools: a resizable, hideable sidebar with a phone drawer, design tokens, a command palette, motion helpers and the UI primitives (buttons, forms, dialogs, menus, icons). Built for Next.js (App Router) and Tailwind CSS v4.

The package ships **TypeScript source**, not a build. Your Next.js app compiles it with `transpilePackages`.

## Install

```bash
npm install @zeetools/ui
```

Peer dependencies (install the ones you do not have yet):

```bash
npm install react react-dom next motion radix-ui next-themes sonner cmdk lucide-react
npm install -D tailwindcss @tailwindcss/postcss
```

| Peer | Range |
| --- | --- |
| `react`, `react-dom` | `^19.2` |
| `next` | `^16.3.8` |
| `tailwindcss` | `^4` |
| `motion` | `^14.4` |
| `radix-ui` | `^1.8` |
| `next-themes` | `^0.4.6` |
| `sonner` | `^2.0.8` |
| `cmdk` | `^1.1.1` |
| `lucide-react` | `^1.60` |

`class-variance-authority`, `clsx`, `tailwind-merge` and `idb-keyval` are regular dependencies.

## Set it up

**1. Transpile the package** (`next.config.ts`):

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@zeetools/ui"],
};

export default nextConfig;
```

**2. Load the styles** (`app/globals.css`). Tailwind v4 does not scan `node_modules` or workspace packages by default, so the `@source` line is what makes the package's classes exist:

```css
@import "tailwindcss";
@import "@zeetools/ui/styles/tokens.css";
@source "../node_modules/@zeetools/ui/src";
```

In a monorepo, point `@source` at the package folder instead, for example `@source "../../../packages/ui/src";`.

`tokens.css` holds the colors (light and dark), the type and radius tokens, the `shell` breakpoint, the base layer, the keyframes, and the styles of the sidebar (`.shell-*`), the preloader and the entrance animation. The font is read from `--font-inter`, so load Inter with `next/font` and put its variable on `<html>`.

**3. Describe your app** and wrap it in the providers. `zee.config.ts` stays yours:

```ts
export const zee = {
  name: "myapp", // shown in the sidebar; the sidebar state is saved under "myapp:shell"
  hub: "https://wzee.dev", // the suite's home, linked from the sidebar and the command menu
  localOnly: true, // shows the privacy badge in the header
} as const;
```

## A minimal `AppShell`

`Providers` wraps the theme, motion, tooltips, the command menu, toasts and `ZeeProvider`. `ZeeSidebar` and `ZeeMobileBar` take the same two slots: `nav` (rows under the top bar) and `group` (an optional titled section that fills the space below).

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";
import ReadySignal from "@zeetools/ui/components/brand/ready-signal";
import SidebarExpandButton from "@zeetools/ui/components/brand/sidebar-expand-button";
import ZeeMobileBar from "@zeetools/ui/components/brand/zee-mobile-bar";
import ZeeSidebar from "@zeetools/ui/components/brand/zee-sidebar";
import Providers from "@zeetools/ui/components/providers";
import { shellBootScript, shellKey } from "@zeetools/ui/lib/shell";
import { zee } from "@/zee.config";
import AppNav from "@/components/app-nav";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Applies the saved sidebar state before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: shellBootScript(shellKey(zee.name)) }} />
      </head>
      <body>
        <div className="preloader" aria-hidden>
          <span className="preloader-track">
            <span className="preloader-bar" />
          </span>
        </div>
        <Providers zee={zee}>
          <div className="flex min-h-screen shell:h-screen shell:overflow-hidden">
            <ZeeSidebar nav={<AppNav />} />
            <div className="flex min-w-0 flex-1 flex-col">
              <ZeeMobileBar nav={<AppNav />} />
              <div className="flex flex-1 flex-col px-2 sm:px-3 shell:min-h-0 shell:py-2 shell:pr-2 shell:pl-0">
                <div
                  data-enter="panel"
                  className="relative flex flex-1 flex-col rounded-2xl border border-border bg-panel shell:min-h-0 shell:overflow-y-auto"
                >
                  <SidebarExpandButton />
                  {children}
                </div>
              </div>
            </div>
          </div>
          <ReadySignal />
        </Providers>
      </body>
    </html>
  );
}
```

```tsx
// components/app-nav.tsx
"use client";

import { usePathname } from "next/navigation";
import PlusIcon from "@zeetools/ui/components/icons/actions/plus-icon";
import SidebarItem from "@zeetools/ui/components/brand/sidebar-item";

export default function AppNav() {
  return (
    <SidebarItem href="/" icon={<PlusIcon />} active={usePathname() === "/"}>
      New item
    </SidebarItem>
  );
}
```

A `group` is any node, usually a `SidebarGroup` with a list inside (see zeepass's `SecretHistory`). Slots that read the URL with `useSearchParams` are fine: the sidebar renders them inside a `Suspense` boundary, so the page stays static.

## Public API

Import from subpaths, for example `@zeetools/ui/components/ui/actions/button`.

**Context**

- `ZeeProvider` (`components/zee-provider`) and `useZee()` (`hooks/use-zee`): the app's identity, `{ name, hub, localOnly?, privacy? }` (`ZeeInfo`, in `lib/zee`). `Providers` takes it as its `zee` prop. Without it the components use a generic identity.

**App shell** (`components/brand`)

- `ZeeSidebar`, `ZeeMobileBar`, `SidebarContent`, `SidebarResizer`, `SidebarExpandButton`: the shell. Width limits are 232 to 360 px; dragging far past the minimum hides the sidebar; `[` toggles it.
- `SidebarItem` (a nav row; an optional `meta` shows a quiet value such as a count at its right edge), `SidebarGroup` (a titled section), `useSidebar()` (tells slots whether they sit in the phone drawer) and `sidebarItemClass()` for custom rows.
- `PageHeader` (a regular-weight title with its description, an optional `leading` mark and `aside`) with `Stagger` and `StaggerItem` (`components/motion`), which settle a view in one item after another.
- `ReadySignal`: marks the page ready so the preloader fades and the entrance plays.
- `ZeeHeader`, `ZeeFooter`, `PrivacyBadge`, `ZeeMark`: the top-bar layout and the logo.
- `lib/shell`: `shellKey(name)`, `shellBootScript(key)`, `SIDEBAR`, `clampSidebarWidth`. `useShell()` (`hooks/use-shell`) reads and writes the saved state.

**UI** (`components/ui`)

- actions: `Button`, `Toggle`, `CopyButton`, `CopyButtonView`
- display: `Card`, `Kbd`, `Separator`
- feedback: `Alert`, `Badge`, `Progress`, `Skeleton`
- forms: `Checkbox`, `Input`, `Label`, `Select`, `Slider`, `Switch`, `Textarea`
- navigation: `Accordion`, `Tabs`, `Segmented`
- overlays: `Dialog`, `DropdownMenu`, `Popover`, `Tooltip`

**Commands** (`components/commands`): `CommandProvider`, `useCommands()` to register commands (icons are Lucide components), `useCommandMenu()`, and the command menu and shortcuts dialog.

**Also**: `components/icons` (animated icons), `components/motion` (`CountUp`, `Stagger`, `StaggerItem`, `InkParagraph`, `Magnetic`, `Marquee`, `MaskReveal`, `RevealObserver`, `Rise`, `SplitText`), `components/drop-zone`, and the hooks `useHotkeys`, `useLocalStore`, `useIdbStore`, `useMediaQuery`, `useScroll`, `useThemeSwitch`.

## Develop

From the repository root:

```bash
pnpm install
pnpm --filter @zeetools/ui lint
pnpm --filter @zeetools/ui typecheck
pnpm --filter @zeetools/ui test          # Vitest
pnpm --filter @zeetools/ui test:ct   # Cypress component tests
pnpm --filter @zeetools/ui storybook
```

## License

MIT
