import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const GET = vi.fn();
vi.mock("./client", () => ({ api: { GET } }));

const { listPeopleByGroup, getPersonBySlug, listPartners } = await import("./people");
const { ApiError } = await import("./errors");

const profile = (id: number, slug: string, group = "team", role_title = "Role") => ({
  id,
  slug,
  name: slug,
  role_title,
  group,
  bio: "",
  photo_url: "",
  status: "published",
  created_by: 1,
  reviewed_by: null,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
});

const onePage = (results: unknown[]) => ({
  data: { count: results.length, next: null, previous: null, results },
  response: { status: 200 },
});

describe("listPeopleByGroup", () => {
  beforeEach(() => GET.mockReset());

  it("requests the group, follows pagination and adapts every profile", async () => {
    GET.mockResolvedValueOnce({
      data: { count: 2, next: "http://api/?page=2", previous: null, results: [profile(2, "a")] },
      response: { status: 200 },
    }).mockResolvedValueOnce(onePage([profile(1, "b")]));

    const people = await listPeopleByGroup("team");

    expect(people.every((p) => p.group === "team" && p.status === "real")).toBe(true);
    expect(GET).toHaveBeenNthCalledWith(1, "/api/v1/people/", { params: { query: { group: "team", page: 1 } } });
    expect(GET).toHaveBeenNthCalledWith(2, "/api/v1/people/", { params: { query: { group: "team", page: 2 } } });
  });

  it("orders by id ascending, since the API lists newest-first and has no display order", async () => {
    GET.mockResolvedValueOnce(onePage([profile(3, "third"), profile(1, "first"), profile(2, "second")]));

    expect((await listPeopleByGroup("team")).map((p) => p.slug)).toEqual(["first", "second", "third"]);
  });

  it("throws ApiError carrying the status and detail on a non-2xx response", async () => {
    GET.mockResolvedValueOnce({ error: { detail: "Server down." }, response: { status: 503 } });

    const failure = listPeopleByGroup("team");

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({ status: 503, detail: "Server down." });
  });
});

describe("getPersonBySlug", () => {
  beforeEach(() => GET.mockReset());

  it("resolves a slug from the full list, using the person's own group", async () => {
    GET.mockResolvedValueOnce(onePage([profile(1, "a"), profile(2, "b", "executive")]));

    expect(await getPersonBySlug("b")).toMatchObject({ slug: "b", group: "executive" });
    expect(GET).toHaveBeenCalledWith("/api/v1/people/", { params: { query: { group: undefined, page: 1 } } });
  });

  it("returns null for an unknown slug and for a partner", async () => {
    GET.mockResolvedValue(onePage([profile(1, "a"), profile(2, "acme", "partner")]));

    expect(await getPersonBySlug("missing")).toBeNull();
    expect(await getPersonBySlug("acme")).toBeNull();
  });
});

describe("listPartners", () => {
  beforeEach(() => GET.mockReset());

  it("reads the partner group and splits institutions from researchers", async () => {
    GET.mockResolvedValueOnce(
      onePage([profile(2, "lab", "partner", "Research collaborator"), profile(1, "hadia", "partner", "Partner institution")]),
    );

    const partners = await listPartners();

    expect(partners.map((p) => [p.slug, p.type])).toEqual([["hadia", "institution"], ["lab", "researcher"]]);
    expect(GET).toHaveBeenCalledWith("/api/v1/people/", { params: { query: { group: "partner", page: 1 } } });
  });
});
