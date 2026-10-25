"use client";

import { ZeeContext } from "../hooks/use-zee";
import type { ZeeInfo } from "../lib/zee";

/** Gives the shared components the app's identity. Fill `zee` from the app's zee.config. */
export default function ZeeProvider({ zee, children }: { zee: ZeeInfo; children: React.ReactNode }) {
  return <ZeeContext.Provider value={zee}>{children}</ZeeContext.Provider>;
}
