import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { canContributeContent, canReviewDrafts, clearSession, getSession, getSessionSnapshot, isAdmin, setSession, subscribeToSession, type Session } from "./session";

const store: Record<string, string> = {};
const listeners = new Map<string, Set<() => void>>();

beforeEach(() => {
  for (const key of Object.keys(store)) delete store[key];
  listeners.clear();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    },
    addEventListener: (name: string, fn: () => void) => (listeners.get(name) ?? listeners.set(name, new Set()).get(name)!).add(fn),
    removeEventListener: (name: string, fn: () => void) => listeners.get(name)?.delete(fn),
  });
});
afterEach(() => vi.unstubAllGlobals());

const editor: Session = { id: 5, name: "ed", email: "ed@x.org", role: "editor" };

describe("session storage", () => {
  it("round-trips a session and forgets it on clear", () => {
    expect(getSession()).toBeNull();
    setSession(editor);
    expect(getSession()).toEqual(editor);
    clearSession();
    expect(getSession()).toBeNull();
  });

  it("returns null for corrupt storage instead of throwing", () => {
    store.pri_session = "{not json";

    expect(getSession()).toBeNull();
    expect(getSessionSnapshot()).toBeNull();
  });
});

describe("getSessionSnapshot", () => {
  it("returns the same object until the stored value changes, as useSyncExternalStore requires", () => {
    setSession(editor);

    const first = getSessionSnapshot();
    expect(getSessionSnapshot()).toBe(first);

    setSession({ ...editor, name: "renamed" });
    const second = getSessionSnapshot();
    expect(second).not.toBe(first);
    expect(second?.name).toBe("renamed");

    clearSession();
    expect(getSessionSnapshot()).toBeNull();
  });
});

describe("subscribeToSession", () => {
  it("listens for sign-in changes and cross-tab storage events, and unsubscribes cleanly", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToSession(listener);

    expect(listeners.get("pri-session-changed")?.has(listener)).toBe(true);
    expect(listeners.get("storage")?.has(listener)).toBe(true);

    unsubscribe();
    expect(listeners.get("pri-session-changed")?.has(listener)).toBe(false);
    expect(listeners.get("storage")?.has(listener)).toBe(false);
  });
});

describe("role predicates", () => {
  const as = (role: Session["role"]): Session => ({ ...editor, role });

  it("lets contributors create and reviewers approve, and nobody else", () => {
    expect(["public", "fellow", "researcher", "editor", "admin"].map((r) => canContributeContent(as(r as Session["role"])))).toEqual([false, false, true, true, true]);
    expect(["public", "fellow", "researcher", "editor", "admin"].map((r) => canReviewDrafts(as(r as Session["role"])))).toEqual([false, false, false, true, true]);
  });

  it("reserves admin features for admins", () => {
    expect(isAdmin(as("admin"))).toBe(true);
    expect(isAdmin(as("editor"))).toBe(false);
  });

  it("denies everything to a signed-out visitor", () => {
    expect([canContributeContent(null), canReviewDrafts(null), isAdmin(null)]).toEqual([false, false, false]);
  });
});
