import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import ReadySignal from "@zeetools/ui/components/brand/ready-signal";
import SidebarExpandButton from "@zeetools/ui/components/brand/sidebar-expand-button";
import ZeeFooter from "@zeetools/ui/components/brand/zee-footer";
import ZeeMobileBar from "@zeetools/ui/components/brand/zee-mobile-bar";
import ZeeSidebar from "@zeetools/ui/components/brand/zee-sidebar";
import Providers from "@zeetools/ui/components/providers";
import { appUrl, zee } from "@/zee.config";
import { shellBootScript, shellKey } from "@zeetools/ui/lib/shell";
import { cn } from "@zeetools/ui/lib/utils";
import BatchCountProvider from "@/components/shared/BatchCountProvider";
import ModeNav from "@/components/shared/ModeNav";
import "./globals.css";

// One family, set in weights. next/font self-hosts it at build time, so visitors make no request to Google.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: `${zee.name} — ${zee.description}`,
  description: zee.description,
  openGraph: {
    title: `${zee.name} — ${zee.description}`,
    description: zee.description,
    url: appUrl,
    siteName: "wzee.dev",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
    { media: "(prefers-color-scheme: light)", color: "#efefee" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable)} suppressHydrationWarning>
      <head>
        {/* Applies the saved sidebar state before first paint (a string built from the app name in lib/shell, no user input). */}
        <script dangerouslySetInnerHTML={{ __html: shellBootScript(shellKey(zee.name)) }} />
      </head>
      <body>
        {/* Covers the first frames until hydration (ReadySignal), then fades; a CSS failsafe hides it anyway. */}
        <div className="preloader" aria-hidden>
          <span className="preloader-track">
            <span className="preloader-bar" />
          </span>
        </div>
        <Providers zee={zee}>
          <BatchCountProvider>
            {/* The app shell: a sidebar on the base and one inset panel holding the tool. On wide screens
                the shell is exactly the viewport, so the page itself never scrolls; phones keep the top bar.
                Images are never stored, so the sidebar has the modes and no history group. */}
            <div className="flex min-h-screen shell:h-screen shell:overflow-hidden">
              <ZeeSidebar nav={<ModeNav />} />
              <div className="flex min-w-0 flex-1 flex-col">
                <ZeeMobileBar nav={<ModeNav />} />
                <div className="flex flex-1 flex-col px-2 sm:px-3 shell:min-h-0 shell:py-2 shell:pr-2 shell:pl-0">
                  <div
                    data-enter="panel"
                    className="relative flex flex-1 flex-col rounded-2xl border border-border bg-panel shell:min-h-0 shell:overflow-y-auto"
                  >
                    <SidebarExpandButton />
                    {children}
                  </div>
                </div>
                <div className="shell:hidden">
                  <ZeeFooter />
                </div>
              </div>
            </div>
          </BatchCountProvider>
          <ReadySignal />
        </Providers>
      </body>
    </html>
  );
}
