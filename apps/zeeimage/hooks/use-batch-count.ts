"use client";

import { createContext, useContext, useEffect } from "react";

interface BatchCountValue {
  count: number;
  setCount: (count: number) => void;
}

/** How many images are queued, so the sidebar can show it. A number only: the images themselves are never stored. */
export const BatchCountContext = createContext<BatchCountValue>({ count: 0, setCount: () => {} });

export function useBatchCount(): number {
  return useContext(BatchCountContext).count;
}

/** The page calls this with its queue length; the sidebar reads it back with `useBatchCount`. */
export function usePublishBatchCount(count: number): void {
  const { setCount } = useContext(BatchCountContext);
  useEffect(() => {
    setCount(count);
  }, [count, setCount]);
}
