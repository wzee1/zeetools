"use client";

import { motion } from "motion/react";
import ShieldCheckIcon from "../icons/status/shield-check-icon";
import { Tooltip } from "../ui/overlays/tooltip";
import { useZee } from "../../hooks/use-zee";
import { interactive, springSnappy } from "../../lib/motion";
import { DEFAULT_PRIVACY } from "../../lib/zee";

/** The header's "stays on this device" badge, linking to the suite's privacy notice. Its copy comes from `privacy` in the app's zee config. */
export default function PrivacyBadge() {
  const { hub, privacy = DEFAULT_PRIVACY } = useZee();
  return (
    <Tooltip label={privacy.tooltip}>
      <motion.a
        {...interactive}
        href={`${hub}/privacy`}
        target="_blank"
        rel="noopener noreferrer"
        variants={{ rest: { scale: 1 }, hover: { scale: 1.02 }, tap: { scale: 0.96 } }}
        transition={springSnappy}
        className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-control border border-border px-2.5 text-xs text-muted transition-colors duration-200 ease-out hover:border-border-strong hover:text-foreground"
      >
        <ShieldCheckIcon className="size-3.5 text-primary-text" />
        <span className="hidden sm:inline">{privacy.label}</span>
        <span className="sr-only sm:hidden">{privacy.srLabel ?? privacy.label}</span>
      </motion.a>
    </Tooltip>
  );
}
