"use client";

import { createContext, useContext, useEffect } from "react";

interface CallStatusValue {
  /** Seconds since the call was joined, or null outside a call. */
  seconds: number | null;
  setSeconds: (seconds: number | null) => void;
}

/** How long the call has run, so the sidebar can show it. A number only: nothing about the call is stored. */
export const CallStatusContext = createContext<CallStatusValue>({ seconds: null, setSeconds: () => {} });

export function useCallSeconds(): number | null {
  return useContext(CallStatusContext).seconds;
}

/** The page calls this with the elapsed seconds (null outside a call); the sidebar reads it back with `useCallSeconds`. */
export function usePublishCallSeconds(seconds: number | null): void {
  const { setSeconds } = useContext(CallStatusContext);
  useEffect(() => {
    setSeconds(seconds);
  }, [seconds, setSeconds]);
}
