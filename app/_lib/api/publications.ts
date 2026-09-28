import "server-only";
import type { Person, Publication } from "../types";
import { api } from "./client";
import { listPeopleById } from "./people";
import { collectAllPages } from "./pagination";
import { themeBySubTheme, toPublication, type PublicationLookups } from "./publicationAdapter";
import { unwrap } from "./request";
import { listThemes } from "./themes";

const PUBLICATIONS_PATH = "/api/v1/publications/";
const PUBLICATION_PATH = "/api/v1/publications/{slug}/";

export type PublicationsWithAuthors = {
  publications: Publication[];
  /** Authors that at least one publication references, by slug. */
  authors: Record<string, Person>;
};

async function loadLookups(): Promise<{ lookups: PublicationLookups; peopleById: Map<number, Person> }> {
  const [themes, peopleById] = await Promise.all([listThemes(), listPeopleById()]);
  const authorSlugById = new Map([...peopleById].map(([id, person]) => [id, person.slug]));
  return { lookups: { themeBySubTheme: themeBySubTheme(themes), authorSlugById }, peopleById };
}

function authorsOf(publications: Publication[], peopleById: Map<number, Person>): Record<string, Person> {
  const referenced = new Set(publications.flatMap((p) => p.authors));
  return Object.fromEntries([...peopleById.values()].filter((p) => referenced.has(p.slug)).map((p) => [p.slug, p]));
}

/** Published, public publications, newest first. Throws `ApiError` on any non-2xx response. */
export async function listPublications(): Promise<PublicationsWithAuthors> {
  const [raw, { lookups, peopleById }] = await Promise.all([
    collectAllPages(async (page) => unwrap(await api.GET(PUBLICATIONS_PATH, { params: { query: { page } } }), PUBLICATIONS_PATH)),
    loadLookups(),
  ]);
  const publications = raw.map((p) => toPublication(p, lookups)).sort((a, b) => b.date.localeCompare(a.date));
  return { publications, authors: authorsOf(publications, peopleById) };
}

/** Publications support slug lookup on the API, unlike people and projects. `null` when it is not published. */
export async function getPublicationBySlug(slug: string): Promise<{ publication: Publication; authors: Record<string, Person> } | null> {
  const [result, { lookups, peopleById }] = await Promise.all([
    api.GET(PUBLICATION_PATH, { params: { path: { slug } } }),
    loadLookups(),
  ]);
  if (result.response.status === 404) return null;
  const publication = toPublication(unwrap(result, PUBLICATION_PATH), lookups);
  return { publication, authors: authorsOf([publication], peopleById) };
}
