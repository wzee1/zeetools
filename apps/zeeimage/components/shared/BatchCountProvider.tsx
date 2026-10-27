"use client";

import { useMemo, useState } from "react";
import { BatchCountContext } from "@/hooks/use-batch-count";

/** Wraps the shell, so the sidebar and the page share the queue length. */
export default function BatchCountProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const value = useMemo(() => ({ count, setCount }), [count]);
  return <BatchCountContext.Provider value={value}>{children}</BatchCountContext.Provider>;
}
