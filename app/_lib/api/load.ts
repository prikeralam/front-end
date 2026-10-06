import { unstable_rethrow } from "next/navigation";

export type Loaded<T> = { ok: true; data: T } | { ok: false };

/** Runs an API read for a page: logs the failure server-side and returns a value the page can branch on. */
export async function load<T>(label: string, read: () => Promise<T>): Promise<Loaded<T>> {
  try {
    return { ok: true, data: await read() };
  } catch (error) {
    // Next signals "render this page per request" by throwing; that must reach Next, not become an error state.
    unstable_rethrow(error);
    console.error(`Failed to load ${label} from the API`, error);
    return { ok: false };
  }
}
