export type Loaded<T> = { ok: true; data: T } | { ok: false };

/** Runs an API read for a page: logs the failure server-side and returns a value the page can branch on. */
export async function load<T>(label: string, read: () => Promise<T>): Promise<Loaded<T>> {
  try {
    return { ok: true, data: await read() };
  } catch (error) {
    console.error(`Failed to load ${label} from the API`, error);
    return { ok: false };
  }
}
