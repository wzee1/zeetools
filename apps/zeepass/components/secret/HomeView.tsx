"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import CreateForm from "@/components/secret/CreateForm";
import LinkGenerated from "@/components/secret/LinkGenerated";
import { useSecretHistory } from "@/hooks/use-secret-history";

// Same curve out as in: the incoming view staggers itself in (see @zeetools/ui/components/motion/stagger).
const exit = { opacity: 0, y: -6, transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] as const } };

/** `?secret=<id>` opens a link this browser created (from the sidebar, or right after creating it). */
function HomeContent({ selectedId }: { selectedId: string | null }) {
  const router = useRouter();
  const { secrets } = useSecretHistory();
  const selected = secrets.find((s) => s.id === selectedId);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {selected ? (
        <motion.div key={selected.id} exit={exit} className="flex flex-col shell:min-h-0 shell:flex-1">
          <LinkGenerated
            shareUrl={selected.shareUrl}
            burnOnRead={selected.burnOnRead}
            ttlSeconds={selected.ttlSeconds}
            onReset={() => router.push("/")}
          />
        </motion.div>
      ) : (
        <motion.div key="form" exit={exit} className="flex flex-col shell:min-h-0 shell:flex-1">
          <CreateForm onSecretCreated={({ id }) => router.push(`/?secret=${id}`)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The only reader of the query string, so only this part waits for the browser. */
function HomeFromUrl() {
  return <HomeContent selectedId={useSearchParams().get("secret")} />;
}

export default function HomeView() {
  // useSearchParams needs a boundary for the static render. Its fallback is the default view (the create form),
  // so the prerendered HTML carries the page's heading and text instead of an empty shell.
  return (
    <Suspense fallback={<HomeContent selectedId={null} />}>
      <HomeFromUrl />
    </Suspense>
  );
}
