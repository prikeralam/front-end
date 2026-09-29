import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const GET = vi.fn();
vi.mock("./client", () => ({ api: { GET } }));
vi.mock("./themes", () => ({
  listThemes: async () => [
    { id: 7, slug: "demography", name: "Demography", description: "Population and change.", parent: null, subthemes: [{ id: 10, slug: "religious-composition", name: "Religious Composition" }] },
    { id: 10, slug: "religious-composition", name: "Religious Composition", parent: 7, subthemes: [] },
    { id: 4, slug: "public-finance", name: "Public Finance", parent: null, subthemes: [] },
  ],
}));

const { listDatasets, getDatasetDetail, getDatasetPreviews, listDashboards, listTopThemes } = await import("./datasets");

const apiDataset = (id: number, slug: string, extra: Record<string, unknown> = {}) => ({
  id,
  slug,
  title: slug,
  description: "",
  file: `http://api/media/${slug}.csv`,
  format: "csv",
  sub_theme: 10,
  geography: "Kerala",
  year: 2025,
  source: "",
  update_frequency: "",
  visibility: "public",
  status: "published",
  created_by: 1,
  reviewed_by: null,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-02T00:00:00Z",
  published_at: null,
  ...extra,
});

const onePage = (results: unknown[]) => ({ data: { count: results.length, next: null, previous: null, results }, response: { status: 200, ok: true } });

describe("listDatasets", () => {
  beforeEach(() => GET.mockReset());

  it("lists datasets oldest first with their top-level theme", async () => {
    GET.mockResolvedValueOnce(onePage([apiDataset(2, "b"), apiDataset(1, "a")]));

    const datasets = await listDatasets();

    expect(datasets.map((d) => d.slug)).toEqual(["a", "b"]);
    expect(datasets[0]).toMatchObject({ theme: "Demography", accessState: "full" });
  });
});

describe("getDatasetDetail", () => {
  beforeEach(() => GET.mockReset());

  it("returns the dataset by slug, or null when the API hides it with a 404", async () => {
    GET.mockResolvedValueOnce({ data: apiDataset(1, "a"), response: { status: 200, ok: true } });
    expect((await getDatasetDetail("a"))?.files).toHaveLength(1);
    expect(GET).toHaveBeenCalledWith("/api/v1/datasets/{slug}/", { params: { path: { slug: "a" } } });

    GET.mockResolvedValueOnce({ error: { detail: "Not found." }, response: { status: 404, ok: false } });
    expect(await getDatasetDetail("hidden")).toBeNull();
  });
});

describe("getDatasetPreviews", () => {
  beforeEach(() => GET.mockReset());
  const csv = { slug: "a", title: "A", fileFormat: "CSV" };

  it("reads the table preview for tabular formats", async () => {
    GET.mockResolvedValueOnce({ data: { page: 1, page_size: 50, header: ["x"], rows: [[1]] }, response: { status: 200, ok: true } });

    const previews = await getDatasetPreviews(csv);

    expect(previews.table).toMatchObject({ columns: ["x"], rows: [["1"]] });
    expect(previews.map).toBeNull();
    expect(GET).toHaveBeenCalledWith("/api/v1/datasets/{slug}/preview/table/", { params: { path: { slug: "a" } } });
  });

  it("reads the map preview for GeoJSON datasets", async () => {
    GET.mockResolvedValueOnce({ data: { type: "FeatureCollection", features: [] }, response: { status: 200, ok: true } });

    const previews = await getDatasetPreviews({ ...csv, fileFormat: "GeoJSON" });

    expect(previews.map).toEqual({ type: "FeatureCollection", features: [] });
    expect(GET).toHaveBeenCalledWith("/api/v1/datasets/{slug}/preview/map/", { params: { path: { slug: "a" } } });
  });

  it("degrades to no preview on 422, an unexpected body, or a network failure", async () => {
    GET.mockResolvedValueOnce({ error: { detail: "Unreadable file." }, response: { status: 422, ok: false } });
    expect(await getDatasetPreviews(csv)).toEqual({ table: null, map: null });

    GET.mockResolvedValueOnce({ data: { something: "else" }, response: { status: 200, ok: true } });
    expect(await getDatasetPreviews(csv)).toEqual({ table: null, map: null });

    vi.spyOn(console, "error").mockImplementation(() => undefined);
    GET.mockRejectedValueOnce(new TypeError("fetch failed"));
    expect(await getDatasetPreviews(csv)).toEqual({ table: null, map: null });
  });
});

describe("listDashboards / listTopThemes", () => {
  beforeEach(() => GET.mockReset());

  it("resolves dashboard theme names", async () => {
    GET.mockResolvedValueOnce(
      onePage([{ id: 1, slug: "d", title: "D", description: "", embed_url: "https://e/1", embed_type: "tableau", theme: 4, datasets: [], status: "published", created_by: 1, reviewed_by: null, created_at: "", updated_at: "", published_at: null }]),
    );

    expect(await listDashboards()).toMatchObject([{ slug: "d", theme: "Public Finance", embedType: "tableau" }]);
  });

  it("lists only top-level themes, with a blank description where none is set", async () => {
    expect(await listTopThemes()).toEqual([
      { name: "Demography", description: "Population and change." },
      { name: "Public Finance", description: "" },
    ]);
  });
});
