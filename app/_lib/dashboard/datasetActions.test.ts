import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getAccessToken = vi.fn();
vi.mock("../auth/serverAuth", () => ({ getAccessToken }));

const POST = vi.fn();
const PATCH = vi.fn();
const GET = vi.fn();
const uncachedApi = vi.fn((token?: string) => ({ token, POST, PATCH, GET }));
vi.mock("../api/client", () => ({ uncachedApi }));

const listDatasets = vi.fn();
const getDatasetDetail = vi.fn();
vi.mock("../api/datasets", () => ({ listDatasets, getDatasetDetail }));

const backendRequest = vi.fn();
vi.mock("../api/backendRequest", () => ({ backendRequest }));

const {
  listDatasetsAction,
  getDatasetAccessAction,
  requestAccessAction,
  listAccessRequestsAction,
  decideAccessRequestAction,
  listExtraFormatsAction,
  addExtraFormatAction,
  removeExtraFormatAction,
} = await import("./datasetActions");

const res = (status: number) => ({ response: { status, ok: status >= 200 && status < 300 } });

beforeEach(() => {
  for (const fn of [getAccessToken, POST, PATCH, GET, listDatasets, getDatasetDetail, uncachedApi]) fn.mockClear();
  for (const fn of [getAccessToken, POST, PATCH, GET, listDatasets, getDatasetDetail]) fn.mockReset();
});

describe("listDatasetsAction", () => {
  it("lists with the caller's token, or anonymously when signed out", async () => {
    getAccessToken.mockResolvedValueOnce("tok");
    listDatasets.mockResolvedValueOnce([]);
    await listDatasetsAction();
    expect(listDatasets).toHaveBeenLastCalledWith({ accessToken: "tok" });

    getAccessToken.mockResolvedValueOnce(null);
    listDatasets.mockResolvedValueOnce([]);
    await listDatasetsAction();
    expect(listDatasets).toHaveBeenLastCalledWith({ accessToken: null });
  });
});

describe("getDatasetAccessAction", () => {
  it("returns the caller's access state and every file they may download", async () => {
    getAccessToken.mockResolvedValueOnce("tok");
    const files = [{ label: "CSV", format: "csv", path: "http://api/media/x.csv" }, { label: "JSON", format: "json", path: "http://api/media/x.json" }];
    getDatasetDetail.mockResolvedValueOnce({ accessState: "full", files });

    expect(await getDatasetAccessAction("religious-composition")).toEqual({ accessState: "full", files });
    expect(getDatasetDetail).toHaveBeenCalledWith("religious-composition", { accessToken: "tok" });
  });

  it("returns null for a dataset the caller cannot see, and rejects malformed slugs without calling the backend", async () => {
    getAccessToken.mockResolvedValue("tok");
    getDatasetDetail.mockResolvedValueOnce(null);
    expect(await getDatasetAccessAction("hidden")).toBeNull();

    for (const bad of ["../etc/passwd", "a b", "", "x".repeat(51), 42 as unknown as string]) {
      getDatasetDetail.mockClear();
      expect(await getDatasetAccessAction(bad)).toBeNull();
      expect(getDatasetDetail).not.toHaveBeenCalled();
    }
  });
});

describe("requestAccessAction", () => {
  it("requests access on behalf of the signed-in user", async () => {
    getAccessToken.mockResolvedValueOnce("tok");
    POST.mockResolvedValueOnce(res(201));

    expect(await requestAccessAction("phc-load-by-area")).toBe("requested");
    expect(uncachedApi).toHaveBeenCalledWith("tok");
    expect(POST).toHaveBeenCalledWith("/api/v1/datasets/{slug}/request-access/", expect.objectContaining({ params: { path: { slug: "phc-load-by-area" } } }));
  });

  it("treats an existing request (200) as requested too", async () => {
    getAccessToken.mockResolvedValueOnce("tok");
    POST.mockResolvedValueOnce(res(200));

    expect(await requestAccessAction("phc-load-by-area")).toBe("requested");
  });

  it("does not call the backend when signed out, and maps 401, 404 and other failures", async () => {
    getAccessToken.mockResolvedValueOnce(null);
    expect(await requestAccessAction("phc-load-by-area")).toBe("signed-out");
    expect(POST).not.toHaveBeenCalled();

    getAccessToken.mockResolvedValue("tok");
    POST.mockResolvedValueOnce(res(401));
    expect(await requestAccessAction("a")).toBe("signed-out");
    POST.mockResolvedValueOnce(res(404));
    expect(await requestAccessAction("a")).toBe("not-found");
    POST.mockResolvedValueOnce(res(500));
    expect(await requestAccessAction("a")).toBe("error");
  });

  it("rejects a malformed slug before anything else", async () => {
    expect(await requestAccessAction("../x")).toBe("not-found");
    expect(getAccessToken).not.toHaveBeenCalled();
  });
});

describe("listAccessRequestsAction", () => {
  const request = { id: 7, user: 8, dataset: 5, status: "pending", requested_at: "2026-09-25T06:52:45Z", reviewed_at: null, reviewed_by: null };

  it("maps pending requests, resolving dataset ids to slugs", async () => {
    getAccessToken.mockResolvedValueOnce("tok");
    listDatasets.mockResolvedValueOnce([{ id: 5, slug: "phc-load-by-area" }]);
    GET.mockResolvedValueOnce({ data: { count: 1, next: null, previous: null, results: [request] }, response: { status: 200, ok: true } });

    expect(await listAccessRequestsAction()).toEqual([
      { id: "7", datasetSlug: "phc-load-by-area", requesterName: "User #8", requesterEmail: "", status: "pending", createdAt: "2026-09-25T06:52:45Z" },
    ]);
    expect(GET).toHaveBeenCalledWith("/api/v1/access-requests/", { params: { query: { status: "pending" } } });
  });

  it("returns an empty list when signed out or when the backend says the caller is not staff", async () => {
    getAccessToken.mockResolvedValueOnce(null);
    expect(await listAccessRequestsAction()).toEqual([]);
    expect(GET).not.toHaveBeenCalled();

    getAccessToken.mockResolvedValueOnce("tok");
    listDatasets.mockResolvedValueOnce([]);
    GET.mockResolvedValueOnce({ error: { detail: "no" }, response: { status: 403, ok: false } });
    expect(await listAccessRequestsAction()).toEqual([]);
  });
});

describe("decideAccessRequestAction", () => {
  it("patches the request status and reports whether the backend accepted it", async () => {
    getAccessToken.mockResolvedValue("tok");
    PATCH.mockResolvedValueOnce(res(200));
    expect(await decideAccessRequestAction("7", "approved")).toBe(true);
    expect(PATCH).toHaveBeenCalledWith("/api/v1/access-requests/{id}/", { params: { path: { id: 7 } }, body: { status: "approved" } });

    PATCH.mockResolvedValueOnce(res(403));
    expect(await decideAccessRequestAction("7", "denied")).toBe(false);
  });

  it("refuses bad arguments and signed-out callers without calling the backend", async () => {
    getAccessToken.mockResolvedValue("tok");
    expect(await decideAccessRequestAction("7; drop", "approved")).toBe(false);
    expect(await decideAccessRequestAction("7", "maybe" as unknown as "approved")).toBe(false);
    expect(await decideAccessRequestAction(7 as unknown as string, "approved")).toBe(false);

    getAccessToken.mockResolvedValue(null);
    expect(await decideAccessRequestAction("7", "approved")).toBe(false);
    expect(PATCH).not.toHaveBeenCalled();
  });
});

describe("other formats of a dataset", () => {
  const ok = (data: unknown, status = 200) => ({ ok: true, status, data, message: "" });
  const bad = (status: number, data: unknown = null) => ({ ok: false, status, data, message: "" });
  const upload = (format: string, name: string, bytes = 10) => {
    const form = new FormData();
    form.append("format", format);
    form.append("file", new File([new Uint8Array(bytes)], name));
    return form;
  };

  beforeEach(() => {
    backendRequest.mockReset();
    getAccessToken.mockResolvedValue("tok");
  });

  it("lists the main format and the extra files (the main file has no id)", async () => {
    backendRequest.mockResolvedValueOnce(
      ok({ format: "csv", files: [{ id: null, format: "csv", url: "u", size: 8 }, { id: 4, format: "json", url: "u2", size: 2048 }, { format: "bad" }] }),
    );
    expect(await listExtraFormatsAction("plus-one")).toEqual({ status: "ok", mainFormat: "csv", extras: [{ id: 4, format: "json", label: "JSON", size: 2048 }] });
    expect(backendRequest).toHaveBeenCalledWith("GET", "/api/v1/datasets/plus-one/", { accessToken: "tok" });
  });

  it("checks the format, size and extension before uploading", async () => {
    expect(await addExtraFormatAction("plus-one", upload("xml", "a.xml"))).toMatchObject({ ok: false, message: "Choose a format." });
    expect(await addExtraFormatAction("plus-one", upload("json", "a.csv"))).toMatchObject({ ok: false, message: expect.stringContaining("doesn't look like JSON") });
    expect(await addExtraFormatAction("plus-one", upload("json", "a.json", 11 * 1024 * 1024))).toMatchObject({ ok: false, message: expect.stringContaining("10 MB") });
    expect(await addExtraFormatAction("../x", upload("json", "a.json"))).toMatchObject({ ok: false });
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("uploads as multipart and reports the backend's refusals", async () => {
    backendRequest.mockResolvedValueOnce(ok({ id: 5 }, 201));
    expect(await addExtraFormatAction("plus-one", upload("json", "data.JSON"))).toEqual({ ok: true });
    const [method, path, options] = backendRequest.mock.calls[0];
    expect([method, path, options.form.get("format"), (options.form.get("file") as File).name]).toEqual(["POST", "/api/v1/datasets/plus-one/files/", "json", "data.JSON"]);

    backendRequest.mockResolvedValueOnce(bad(400, { format: ["This dataset already has a file in that format; remove it first."] }));
    expect(await addExtraFormatAction("plus-one", upload("json", "a.json"))).toEqual({ ok: false, message: "This dataset already has a file in that format; remove it first." });
    backendRequest.mockResolvedValueOnce(bad(403));
    expect(await addExtraFormatAction("plus-one", upload("json", "a.json"))).toMatchObject({ ok: false, message: expect.stringContaining("isn't allowed") });
  });

  it("removes by id, and refuses nonsense ids without calling the backend", async () => {
    backendRequest.mockResolvedValueOnce(ok(null, 204));
    expect(await removeExtraFormatAction("plus-one", 4)).toEqual({ ok: true });
    expect(backendRequest).toHaveBeenCalledWith("DELETE", "/api/v1/datasets/plus-one/files/4/", { accessToken: "tok" });
    expect(await removeExtraFormatAction("plus-one", -1)).toMatchObject({ ok: false });
    expect(backendRequest).toHaveBeenCalledTimes(1);

    getAccessToken.mockResolvedValueOnce(null);
    expect(await removeExtraFormatAction("plus-one", 4)).toMatchObject({ ok: false, message: expect.stringContaining("session has ended") });
  });
});
