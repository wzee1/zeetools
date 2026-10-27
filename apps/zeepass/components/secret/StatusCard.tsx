import type { ReactNode } from "react";
import PageHeader from "@zeetools/ui/components/brand/page-header";
import Stagger from "@zeetools/ui/components/motion/stagger";
import StaggerItem from "@zeetools/ui/components/motion/stagger-item";
import { cn } from "@zeetools/ui/lib/utils";

interface StatusCardProps {
  /** Icon shown in the mark above the title. */
  icon: ReactNode;
  title: string;
  /** "danger" tints the mark red; "neutral" stays on the ink palette. */
  tone?: "neutral" | "danger";
  children: ReactNode;
  action?: ReactNode;
}

/** A message, not a form: the missing key, burned and failed states are set as large type with one action, no card. */
export default function StatusCard({ icon, title, tone = "neutral", children, action }: StatusCardProps) {
  const danger = tone === "danger";
  return (
    <Stagger className="max-w-xl space-y-8">
      <PageHeader
        title={title}
        leading={
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-control border [&>svg]:size-4",
              danger ? "border-danger/40 bg-danger/10 text-danger" : "border-border-strong bg-surface text-muted",
            )}
          >
            {icon}
          </span>
        }
      >
        {children}
      </PageHeader>
      {action && <StaggerItem>{action}</StaggerItem>}
    </Stagger>
  );
}
