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
const listDashboards = vi.fn();
vi.mock("../api/datasets", () => ({ listDatasets, getDatasetDetail, listDashboards }));

const { listDatasetsAction, getDatasetAccessAction, requestAccessAction, listAccessRequestsAction, decideAccessRequestAction } = await import("./datasetActions");

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
  it("returns the caller's access state and download URL", async () => {
    getAccessToken.mockResolvedValueOnce("tok");
    getDatasetDetail.mockResolvedValueOnce({ accessState: "full", files: [{ label: "x", path: "http://api/media/x.csv" }] });

    expect(await getDatasetAccessAction("religious-composition")).toEqual({ accessState: "full", downloadUrl: "http://api/media/x.csv" });
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
