import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const GET = vi.fn();
vi.mock("./client", () => ({ api: { GET } }));

const { listPeopleByGroup } = await import("./people");
const { ApiError } = await import("./errors");

const profile = (slug: string) => ({
  id: 1,
  slug,
  name: slug,
  role_title: "Role",
  group: "team",
  bio: "",
  photo_url: "",
  status: "published",
  created_by: 1,
  reviewed_by: null,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
});

describe("listPeopleByGroup", () => {
  beforeEach(() => GET.mockReset());

  it("requests the group, follows pagination and adapts every profile", async () => {
    GET.mockResolvedValueOnce({
      data: { count: 2, next: "http://api/?page=2", previous: null, results: [profile("a")] },
      response: { status: 200 },
    }).mockResolvedValueOnce({
      data: { count: 2, next: null, previous: null, results: [profile("b")] },
      response: { status: 200 },
    });

    const people = await listPeopleByGroup("team");

    expect(people.map((p) => p.slug)).toEqual(["a", "b"]);
    expect(people.every((p) => p.group === "team" && p.status === "real")).toBe(true);
    expect(GET).toHaveBeenNthCalledWith(1, "/api/v1/people/", { params: { query: { group: "team", page: 1 } } });
    expect(GET).toHaveBeenNthCalledWith(2, "/api/v1/people/", { params: { query: { group: "team", page: 2 } } });
  });

  it("throws ApiError carrying the status and detail on a non-2xx response", async () => {
    GET.mockResolvedValueOnce({ error: { detail: "Server down." }, response: { status: 503 } });

    const failure = listPeopleByGroup("team");

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({ status: 503, detail: "Server down." });
  });
});
