import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getAccessToken = vi.fn();
vi.mock("../auth/serverAuth", () => ({ getAccessToken }));

const backendRequest = vi.fn();
vi.mock("../api/backendRequest", () => ({ backendRequest }));

const { getApplicationFileAction, listApplicationsAction, setApplicationStatusAction } = await import("./applicationActions");

const ok = (data: unknown) => ({ ok: true, status: 200, data, message: "" });
const bad = (status: number) => ({ ok: false, status, data: null, message: "" });
const apiApplication = (over: Record<string, unknown> = {}) => ({
  id: 4,
  kind: "job",
  job_slug: "data-analyst",
  job_title: "Data Analyst",
  full_name: "Asha K",
  email: "asha@example.org",
  status: "new",
  created_at: "2026-10-08T08:00:00Z",
  handled_at: null,
  handled_by: null,
  ...over,
});

beforeEach(() => {
  getAccessToken.mockReset();
  backendRequest.mockReset();
  getAccessToken.mockResolvedValue("tok");
});

describe("listApplicationsAction", () => {
  it("filters by status and maps the page", async () => {
    backendRequest.mockResolvedValueOnce(ok({ count: 1, next: "x", previous: null, results: [apiApplication()] }));
    const result = await listApplicationsAction({ status: "new", page: 1 });
    expect(backendRequest).toHaveBeenCalledWith("GET", "/api/v1/applications/?page=1&status=new", { accessToken: "tok" });
    expect(result).toEqual({
      status: "ok",
      applications: [{ id: 4, kind: "job", jobTitle: "Data Analyst", fullName: "Asha K", email: "asha@example.org", status: "new", createdAt: "2026-10-08T08:00:00Z", handledAt: null, handledBy: null }],
      count: 1,
      hasNext: true,
      hasPrevious: false,
    });
  });

  it("refuses bad arguments, and reports signed-out and forbidden", async () => {
    expect(await listApplicationsAction({ status: "spam" as never })).toEqual({ status: "invalid" });
    expect(await listApplicationsAction({ page: 0 })).toEqual({ status: "invalid" });
    backendRequest.mockResolvedValueOnce(bad(403));
    expect(await listApplicationsAction()).toEqual({ status: "forbidden" });
    getAccessToken.mockResolvedValueOnce(null);
    expect(await listApplicationsAction()).toEqual({ status: "signed-out" });
  });
});

describe("setApplicationStatusAction", () => {
  it("patches the status only", async () => {
    backendRequest.mockResolvedValueOnce(ok(apiApplication({ status: "reviewed", handled_by: 2 })));
    const result = await setApplicationStatusAction(4, "reviewed");
    expect(backendRequest).toHaveBeenCalledWith("PATCH", "/api/v1/applications/4/", { accessToken: "tok", json: { status: "reviewed" } });
    expect(result).toMatchObject({ ok: true, application: { status: "reviewed", handledBy: 2 } });
  });

  it("refuses bad ids and statuses without calling the backend", async () => {
    expect(await setApplicationStatusAction(-1, "reviewed")).toMatchObject({ ok: false });
    expect(await setApplicationStatusAction(4, "deleted" as never)).toMatchObject({ ok: false });
    expect(backendRequest).not.toHaveBeenCalled();
  });
});

describe("getApplicationFileAction", () => {
  it("returns the backend's short-lived link", async () => {
    backendRequest.mockResolvedValueOnce(ok({ file: "https://bucket.example/applications/abc.pdf?sig=1" }));
    expect(await getApplicationFileAction(4, "cv")).toEqual({ ok: true, url: "https://bucket.example/applications/abc.pdf?sig=1" });
    expect(backendRequest).toHaveBeenCalledWith("GET", "/api/v1/applications/4/files/cv/", { accessToken: "tok" });
  });

  it("only asks for a CV or SOP, and never passes on a link that isn't http(s)", async () => {
    expect(await getApplicationFileAction(4, "passport" as never)).toMatchObject({ ok: false });
    expect(backendRequest).not.toHaveBeenCalled();
    backendRequest.mockResolvedValueOnce(ok({ file: "javascript:alert(1)" }));
    expect(await getApplicationFileAction(4, "sop")).toMatchObject({ ok: false });
    backendRequest.mockResolvedValueOnce(bad(403));
    expect(await getApplicationFileAction(4, "sop")).toEqual({ ok: false, error: "Only editors and admins can open applications." });
  });
});
