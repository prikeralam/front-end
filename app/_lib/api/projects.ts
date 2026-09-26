import "server-only";
import type { HeroProject } from "../types";
import { api } from "./client";
import { toProject } from "./contentAdapters";
import { collectAllPages } from "./pagination";
import { unwrap } from "./request";

const PROJECTS_PATH = "/api/v1/projects/";

/** Published projects, oldest first (the seeded display order; the API lists newest-first, backend gap). */
export async function listProjects(): Promise<HeroProject[]> {
  const projects = await collectAllPages(async (page) =>
    unwrap(await api.GET(PROJECTS_PATH, { params: { query: { page } } }), PROJECTS_PATH),
  );
  return projects.sort((a, b) => a.id - b.id).map(toProject);
}

/** The API addresses projects by id only (backend gap G1), so a slug is resolved from the full published list. */
export async function getProjectBySlug(slug: string): Promise<HeroProject | null> {
  return (await listProjects()).find((project) => project.slug === slug) ?? null;
}
