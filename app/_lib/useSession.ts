"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getSessionSnapshot, subscribeToSession, type Session } from "./session";

/** The mirrored session: `undefined` until the browser can read it, then the user or `null` when signed out. */
export function useSession(): Session | null | undefined {
  return useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => undefined);
}

/**
 * For screens that need someone signed in: sends a signed-out visitor to the sign-in page and returns `null` until there is
 * a session. The dashboard layout has already had the server confirm the session before it renders its children.
 */
export function useRequireSession(): Session | null {
  const router = useRouter();
  const session = useSession();
  useEffect(() => {
    if (session === null) router.replace("/account");
  }, [session, router]);
  return session ?? null;
}
