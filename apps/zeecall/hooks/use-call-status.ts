"use client";

import { createContext, useContext, useEffect } from "react";

export interface CallStatus {
  /** The room the live call is in. */
  room: string;
  /** Seconds since the call was joined. */
  seconds: number;
}

interface CallStatusValue {
  status: CallStatus | null;
  setStatus: (status: CallStatus | null) => void;
}

/** Which room the call is live in and for how long, so the sidebar can mark it. Nothing about the call is stored. */
export const CallStatusContext = createContext<CallStatusValue>({ status: null, setStatus: () => {} });

export function useCallStatus(): CallStatus | null {
  return useContext(CallStatusContext).status;
}

/** The page calls this with the live call's room and elapsed seconds (null outside a call); the sidebar reads it with `useCallStatus`. */
export function usePublishCallStatus(room: string | null, seconds: number): void {
  const { setStatus } = useContext(CallStatusContext);
  useEffect(() => {
    setStatus(room ? { room, seconds } : null);
  }, [room, seconds, setStatus]);
}
