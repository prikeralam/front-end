import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const GET = vi.fn();
vi.mock("./client", () => ({ api: { GET } }));

const { listDocuments } = await import("./documents");

const document = (slug: string, year: number | null) => ({
  id: 1,
  slug,
  title: slug,
  file: `https://cdn.example.org/${slug}.pdf`,
  description: "",
  document_type: "annual-report",
  year,
  status: "published",
  created_by: 1,
  reviewed_by: null,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
});

describe("listDocuments", () => {
  beforeEach(() => GET.mockReset());

  it("filters by document type and sorts newest year first, undated last", async () => {
    GET.mockResolvedValueOnce({
      data: { count: 3, next: null, previous: null, results: [document("old", 2024), document("undated", null), document("new", 2026)] },
      response: { status: 200 },
    });

    const docs = await listDocuments("annual-report");

    expect(docs.map((d) => d.title)).toEqual(["new", "old", "undated"]);
    expect(GET).toHaveBeenCalledWith("/api/v1/documents/", { params: { query: { document_type: "annual-report", page: 1 } } });
  });
});
