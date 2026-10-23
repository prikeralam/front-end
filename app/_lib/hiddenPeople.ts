import type { Person } from "./types";

/** People groups taken off the public site for now (#242): their pages and profiles answer 404 and leave the sitemap. */
export const HIDDEN_PEOPLE_GROUPS: ReadonlySet<Person["group"]> = new Set(["patron", "executive"]);
