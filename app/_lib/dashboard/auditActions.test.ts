import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getAccessToken = vi.fn();
vi.mock("../auth/serverAuth", () => ({ getAccessToken }));

const GET = vi.fn();
vi.mock("../api/client", () => ({ uncachedApi: () => ({ GET }) }));

const { listAuditLogAction } = await import("./auditActions");

const entry = { id: 4, actor: 12, module: "datarepo", action: "access_request_review", target: "accessrequest:2", metadata: {}, timestamp: "2026-09-25T10:06:38Z" };

beforeEach(() => {
  getAccessToken.mockReset();
  GET.mockReset();
  getAccessToken.mockResolvedValue("tok");
});

describe("listAuditLogAction", () => {
  it("returns a page of rows with paging flags, passing filters to the API", async () => {
    GET.mockResolvedValueOnce({ data: { count: 21, next: "http://api/?page=2", previous: null, results: [entry] }, response: { status: 200 } });

    const page = await listAuditLogAction({ module: "datarepo", actor: "12", page: 1 });

    expect(page).toMatchObject({ status: "ok", count: 21, hasNext: true, hasPrevious: false, rows: [{ id: 4, actor: "User #12" }] });
    expect(GET).toHaveBeenCalledWith("/api/v1/audit-log/", { params: { query: { module: "datarepo", actor: 12, page: 1 } } });
  });

  it("drops empty filters instead of sending them", async () => {
    GET.mockResolvedValueOnce({ data: { count: 0, next: null, previous: null, results: [] }, response: { status: 200 } });

    await listAuditLogAction({ module: "", actor: "" });

    expect(GET).toHaveBeenCalledWith("/api/v1/audit-log/", { params: { query: { module: undefined, actor: undefined, page: 1 } } });
  });

  it("reports forbidden for non-admins and signed-out for expired sessions", async () => {
    GET.mockResolvedValueOnce({ error: { detail: "no" }, response: { status: 403 } });
    expect(await listAuditLogAction()).toEqual({ status: "forbidden" });

    GET.mockResolvedValueOnce({ error: { detail: "no" }, response: { status: 401 } });
    expect(await listAuditLogAction()).toEqual({ status: "signed-out" });

    getAccessToken.mockResolvedValueOnce(null);
    expect(await listAuditLogAction()).toEqual({ status: "signed-out" });
  });

  it("maps other failures to error", async () => {
    GET.mockResolvedValueOnce({ error: { detail: "boom" }, response: { status: 500 } });

    expect(await listAuditLogAction()).toEqual({ status: "error" });
  });

  it.each([
    ["module with a slash", { module: "a/b" }],
    ["module too long", { module: "x".repeat(51) }],
    ["module not a string", { module: 5 as unknown as string }],
    ["actor not numeric", { actor: "12; drop" }],
    ["page zero", { page: 0 }],
    ["fractional page", { page: 1.5 }],
    ["absurd page", { page: 1e9 }],
  ])("rejects %s without calling the backend", async (_label, filters) => {
    expect(await listAuditLogAction(filters)).toEqual({ status: "invalid" });
    expect(GET).not.toHaveBeenCalled();
    expect(getAccessToken).not.toHaveBeenCalled();
  });
});
