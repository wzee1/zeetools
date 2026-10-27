"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SidebarGroup from "@zeetools/ui/components/brand/sidebar-group";
import CloseIcon from "@zeetools/ui/components/icons/actions/close-icon";
import LinkIcon from "@zeetools/ui/components/icons/navigation/link-icon";
import { useSidebar } from "@zeetools/ui/hooks/use-sidebar";
import { sidebarItemClass } from "@zeetools/ui/lib/sidebar";
import { useSecretHistory } from "@/hooks/use-secret-history";
import { expiresAt, formatRemaining } from "@/lib/secret/history";

const ease = [0.32, 0.72, 0, 1] as const;

/**
 * The sidebar's group slot: the secrets this browser created (from localStorage, newest first, with
 * time left). Picking one opens its link in the main panel; the cross removes it from this device.
 */
export default function SecretHistory() {
  const selectedId = useSearchParams().get("secret");
  const { secrets, now, remove } = useSecretHistory();
  const { onNavigate } = useSidebar();

  return (
    <SidebarGroup title="On this device" id="secrets-heading">
      {secrets.length === 0 ? (
        <p className="mt-2 px-2.5 text-xs leading-relaxed text-muted/80">Links you create stay listed here until they expire.</p>
      ) : (
        <>
        <ul className="mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          <AnimatePresence initial={false}>
            {secrets.map((secret) => {
              const active = selectedId === secret.id;
              return (
                <motion.li
                  key={secret.id}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.25, ease }}
                  className="group relative"
                >
                  <Link
                    href={`/?secret=${secret.id}`}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={sidebarItemClass(active, "pr-9")}
                  >
                    <LinkIcon />
                    <span className="min-w-0 flex-1 truncate font-mono text-xs">{secret.id.slice(0, 8)}</span>
                    <span className="shrink-0 font-mono text-xs text-muted tabular-nums" title="Time left before it expires">
                      {formatRemaining(expiresAt(secret) - now)}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(secret.id)}
                    aria-label={`Remove ${secret.id.slice(0, 8)} from this device`}
                    className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-control text-muted opacity-0 transition-[opacity,color,background-color] duration-200 ease-out group-hover:opacity-100 hover:bg-foreground/[0.06] hover:text-foreground focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                  >
                    <CloseIcon className="size-3.5" />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
        <p className="mt-2 shrink-0 px-2.5 text-xs leading-relaxed text-muted/80">Listed until they expire, even after they’re opened.</p>
        </>
      )}
    </SidebarGroup>
  );
}
