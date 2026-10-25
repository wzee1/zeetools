"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import type { ZeeInfo } from "../lib/zee";
import { CommandProvider } from "./commands/commands";
import { TooltipProvider } from "./ui/overlays/tooltip";
import ZeeProvider from "./zee-provider";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      closeButton
      toastOptions={{
        className: "rounded-panel! border-border! glass! text-foreground! shadow-[0_8px_24px_-8px_rgb(0_0_0/0.2)]!",
        classNames: {
          closeButton:
            "border-border! bg-surface-raised! text-muted! transition-colors duration-200 ease-out hover:bg-surface! hover:text-foreground!",
        },
      }}
    />
  );
}

type ProvidersProps = {
  children: React.ReactNode;
  /** Pins light or dark, e.g. from the Storybook toolbar. */
  forcedTheme?: "light" | "dark";
  /** The theme for first-time visitors; tools follow the system, the portfolio opens dark. */
  defaultTheme?: "light" | "dark" | "system";
  /** The app's identity, from its zee.config. Without it the shared components use a generic one. */
  zee?: ZeeInfo;
};

export default function Providers({ children, forcedTheme, defaultTheme = "system", zee }: ProvidersProps) {
  const tree = (
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem disableTransitionOnChange forcedTheme={forcedTheme}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={300}>
          <CommandProvider>
            {children}
            <ThemedToaster />
          </CommandProvider>
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
  return zee ? <ZeeProvider zee={zee}>{tree}</ZeeProvider> : tree;
}
