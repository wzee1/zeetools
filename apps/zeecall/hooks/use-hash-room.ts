"use client";

import { useSyncExternalStore } from "react";
import { parseRoomFromHash } from "@/lib/room";

/** The slice of the Navigation API this hook needs; it is not in every TypeScript lib or browser. */
interface NavigationEvents {
  addEventListener: (type: "currententrychange", listener: () => void) => void;
  removeEventListener: (type: "currententrychange", listener: () => void) => void;
}

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  // Next's Link changes the URL with pushState, which fires no hashchange; the Navigation API reports it.
  const navigation = (window as Window & { navigation?: NavigationEvents }).navigation;
  navigation?.addEventListener("currententrychange", callback);
  return () => {
    window.removeEventListener("hashchange", callback);
    navigation?.removeEventListener("currententrychange", callback);
  };
}

const getRoom = () => parseRoomFromHash(window.location.hash);
const getServerRoom = () => "";

/**
 * The room lives in the URL hash. The server snapshot is "" so the prerendered home view matches the
 * first client render; a hash that is already present takes over right after hydration.
 */
export function useHashRoom(): string {
  return useSyncExternalStore(subscribe, getRoom, getServerRoom);
}
