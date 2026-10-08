import "server-only";
import type { Partner, Person } from "../types";
import { api } from "./client";
import { collectAllPages } from "./pagination";
import { isPersonGroup, toPartner, toPerson } from "./personAdapter";
import { unwrap } from "./request";
import type { components } from "./schema";

const PEOPLE_PATH = "/api/v1/people/";

type ApiPerson = components["schemas"]["PersonProfile"];

async function fetchProfiles(group?: ApiPerson["group"]): Promise<ApiPerson[]> {
  const profiles = await collectAllPages(async (page) =>
    unwrap(await api.GET(PEOPLE_PATH, { params: { query: { group, page } } }), PEOPLE_PATH),
  );
  // Staff set `display_order`; ties (and an older backend without the field) keep creation order. Sorted here
  // as well as by the API because pages are collected one at a time.
  return profiles.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.id - b.id);
}

/** Published people in one group, following pagination. Throws `ApiError` on any non-2xx response. */
export async function listPeopleByGroup(group: Person["group"]): Promise<Person[]> {
  return (await fetchProfiles(group)).map((profile) => toPerson(profile, group));
}

/** The API addresses people by id only (backend gap G1), so a slug is resolved from the full published list. */
export async function getPersonBySlug(slug: string): Promise<Person | null> {
  const profile = (await fetchProfiles()).find((p) => p.slug === slug);
  return profile && isPersonGroup(profile.group) ? toPerson(profile, profile.group) : null;
}

export async function listPartners(): Promise<Partner[]> {
  return (await fetchProfiles("partner")).map(toPartner);
}

/** Every published person keyed by API id (publications reference authors by id). Partners are organisations, so excluded. */
export async function listPeopleById(): Promise<Map<number, Person>> {
  const index = new Map<number, Person>();
  for (const profile of await fetchProfiles()) {
    if (isPersonGroup(profile.group)) index.set(profile.id, toPerson(profile, profile.group));
  }
  return index;
}
