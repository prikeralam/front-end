import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const GET = vi.fn();
vi.mock("./client", () => ({ api: { GET } }));
vi.mock("./themes", () => ({
  listThemes: async () => [{ id: 8, slug: "migration", name: "Migration", parent: null, subthemes: [{ id: 12, slug: "gulf", name: "Gulf Migration" }] }],
}));
vi.mock("./people", () => ({
  listPeopleById: async () =>
    new Map([
      [38, { slug: "pri-research-team", name: "PRI Research Team", role: "Research team", group: "author", status: "real", photo: null }],
      [1, { slug: "someone-else", name: "Someone Else", role: "Team", group: "team", status: "real", photo: null }],
    ]),
}));

const { listPublications, getPublicationBySlug } = await import("./publications");

const publication = (slug: string, date: string) => ({
  id: 1,
  slug,
  title: slug,
  abstract: "",
  format: "data_story",
  sub_theme: 12,
  language: "en",
  date,
  authors: [38],
  external_id: "",
  visibility: "public",
  tags: [],
  views: 0,
  cover_url: "",
  status: "published",
  created_by: 1,
  reviewed_by: null,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
  published_at: null,
});

describe("listPublications", () => {
  beforeEach(() => GET.mockReset());

  it("returns publications newest first, with only the authors they reference", async () => {
    GET.mockResolvedValueOnce({
      data: { count: 2, next: null, previous: null, results: [publication("old", "2025-01-01"), publication("new", "2026-01-01")] },
      response: { status: 200 },
    });

    const { publications, authors } = await listPublications();

    expect(publications.map((p) => p.slug)).toEqual(["new", "old"]);
    expect(publications[0]).toMatchObject({ theme: "Migration", authors: ["pri-research-team"] });
    expect(Object.keys(authors)).toEqual(["pri-research-team"]);
  });
});

describe("getPublicationBySlug", () => {
  beforeEach(() => GET.mockReset());

  it("looks the slug up directly on the API", async () => {
    GET.mockResolvedValueOnce({ data: publication("kerala-gulf-migration", "2026-03-01"), response: { status: 200 } });

    const found = await getPublicationBySlug("kerala-gulf-migration");

    expect(found?.publication.slug).toBe("kerala-gulf-migration");
    expect(GET).toHaveBeenCalledWith("/api/v1/publications/{slug}/", { params: { path: { slug: "kerala-gulf-migration" } } });
  });

  it("returns null on a 404, and throws on other failures", async () => {
    GET.mockResolvedValueOnce({ error: { detail: "Not found." }, response: { status: 404 } });
    expect(await getPublicationBySlug("missing")).toBeNull();

    GET.mockResolvedValueOnce({ error: { detail: "Server down." }, response: { status: 500 } });
    await expect(getPublicationBySlug("x")).rejects.toMatchObject({ status: 500 });
  });
});
