import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const GET = vi.fn();
vi.mock("./client", () => ({ api: { GET } }));

const { listProjects, getProjectBySlug } = await import("./projects");

const project = (id: number, slug: string) => ({
  id,
  slug,
  title: slug,
  blurb: "",
  image_url: "",
  cta_label: "",
  cta_href: "",
  status: "published",
  created_by: 1,
  reviewed_by: null,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
});

describe("projects", () => {
  beforeEach(() => {
    GET.mockReset();
    GET.mockResolvedValue({
      data: { count: 2, next: null, previous: null, results: [project(2, "education"), project(1, "sir-project")] },
      response: { status: 200 },
    });
  });

  it("lists projects oldest first", async () => {
    expect((await listProjects()).map((p) => p.slug)).toEqual(["sir-project", "education"]);
  });

  it("resolves a slug from the list, or null when unknown", async () => {
    expect((await getProjectBySlug("education"))?.title).toBe("education");
    expect(await getProjectBySlug("nope")).toBeNull();
  });
});
