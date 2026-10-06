import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getAccessToken = vi.fn();
vi.mock("../auth/serverAuth", () => ({ getAccessToken }));

const backendRequest = vi.fn();
vi.mock("../api/backendRequest", () => ({ backendRequest }));

const { listInboxAction, setInboxStatusAction } = await import("./inboxActions");

const ok = (data: unknown) => ({ ok: true, status: 200, data, message: "" });
const bad = (status: number) => ({ ok: false, status, data: null, message: "" });
const apiMessage = (over: Record<string, unknown> = {}) => ({
  id: 3,
  category: "media",
  name: "Ravi",
  email: "ravi@example.org",
  message: "Interview request.",
  status: "new",
  created_at: "2026-09-30T08:00:00Z",
  handled_at: null,
  handled_by: null,
  ...over,
});

beforeEach(() => {
  getAccessToken.mockReset();
  backendRequest.mockReset();
  getAccessToken.mockResolvedValue("tok");
});

describe("listInboxAction", () => {
  it("filters by status and maps the page", async () => {
    backendRequest.mockResolvedValueOnce(ok({ count: 1, next: null, previous: null, results: [apiMessage()] }));
    const result = await listInboxAction({ status: "new", page: 2 });
    expect(backendRequest).toHaveBeenCalledWith("GET", "/api/v1/contact-messages/?page=2&status=new", { accessToken: "tok" });
    expect(result).toEqual({
      status: "ok",
      count: 1,
      hasNext: false,
      hasPrevious: false,
      messages: [{ id: 3, category: "media", name: "Ravi", email: "ravi@example.org", message: "Interview request.", status: "new", createdAt: "2026-09-30T08:00:00Z", handledAt: null, handledBy: null }],
    });
  });

  it("rejects bad arguments, and reports signed-out and forbidden", async () => {
    expect(await listInboxAction({ status: "spam" as never })).toEqual({ status: "invalid" });
    expect(await listInboxAction({ page: 0 })).toEqual({ status: "invalid" });
    expect(backendRequest).not.toHaveBeenCalled();

    getAccessToken.mockResolvedValueOnce(null);
    expect(await listInboxAction()).toEqual({ status: "signed-out" });
    backendRequest.mockResolvedValueOnce(bad(403));
    expect(await listInboxAction()).toEqual({ status: "forbidden" });
  });
});

describe("setInboxStatusAction", () => {
  it("patches the status and returns the updated message", async () => {
    backendRequest.mockResolvedValueOnce(ok(apiMessage({ status: "handled", handled_by: 2, handled_at: "2026-09-30T09:00:00Z" })));
    const result = await setInboxStatusAction(3, "handled");
    expect(backendRequest).toHaveBeenCalledWith("PATCH", "/api/v1/contact-messages/3/", { accessToken: "tok", json: { status: "handled" } });
    expect(result).toMatchObject({ ok: true, message: { status: "handled", handledBy: 2 } });
  });

  it("validates arguments and explains refusals", async () => {
    expect(await setInboxStatusAction(-1, "handled")).toMatchObject({ ok: false });
    expect(await setInboxStatusAction(3, "deleted" as never)).toMatchObject({ ok: false });
    expect(backendRequest).not.toHaveBeenCalled();

    backendRequest.mockResolvedValueOnce(bad(403));
    expect(await setInboxStatusAction(3, "handled")).toEqual({ ok: false, error: "Only editors and admins can manage the inbox." });
  });
});
