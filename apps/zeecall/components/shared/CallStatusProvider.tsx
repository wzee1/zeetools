"use client";

import { useMemo, useState } from "react";
import { CallStatusContext, type CallStatus } from "@/hooks/use-call-status";

/** Wraps the shell, so the sidebar and the page share which room the call is live in and its elapsed time. */
export default function CallStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<CallStatus | null>(null);
  const value = useMemo(() => ({ status, setStatus }), [status]);
  return <CallStatusContext.Provider value={value}>{children}</CallStatusContext.Provider>;
}
