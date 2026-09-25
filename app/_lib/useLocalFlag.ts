"use client";

import { useCallback, useSyncExternalStore } from "react";

/** A boolean kept in localStorage (a remembered UI preference), readable without an effect. */
export function useLocalFlag(key: string): [boolean, (value: boolean) => void] {
  const event = `pri-flag:${key}`;
  const subscribe = useCallback(
    (listener: () => void) => {
      window.addEventListener(event, listener);
      window.addEventListener("storage", listener);
      return () => {
        window.removeEventListener(event, listener);
        window.removeEventListener("storage", listener);
      };
    },
    [event],
  );
  const read = useCallback(() => {
    try {
      return window.localStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  }, [key]);

  const value = useSyncExternalStore(subscribe, read, () => false);
  const set = useCallback(
    (next: boolean) => {
      try {
        window.localStorage.setItem(key, next ? "1" : "0");
      } catch {
        // Storage disabled: the preference just isn't remembered.
      }
      window.dispatchEvent(new Event(event));
    },
    [key, event],
  );
  return [value, set];
}
