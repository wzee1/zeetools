"use client";

import { useMemo, useState } from "react";
import { CallStatusContext } from "@/hooks/use-call-status";

/** Wraps the shell, so the sidebar and the page share the call's elapsed seconds. */
export default function CallStatusProvider({ children }: { children: React.ReactNode }) {
  const [seconds, setSeconds] = useState<number | null>(null);
  const value = useMemo(() => ({ seconds, setSeconds }), [seconds]);
  return <CallStatusContext.Provider value={value}>{children}</CallStatusContext.Provider>;
}
