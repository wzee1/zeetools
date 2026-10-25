"use client";

import { createContext, useContext } from "react";
import { DEFAULT_ZEE, type ZeeInfo } from "../lib/zee";

export const ZeeContext = createContext<ZeeInfo>(DEFAULT_ZEE);

/** The app's identity (name, hub, privacy copy), as given to `ZeeProvider`. */
export function useZee(): ZeeInfo {
  return useContext(ZeeContext);
}
