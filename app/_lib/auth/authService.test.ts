import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const GET = vi.fn();
const POST = vi.fn();
const uncachedApi = vi.fn((accessToken?: string) => ({ GET: (...args: unknown[]) => GET(accessToken, ...args), POST }));
vi.mock("../api/client", () => ({ uncachedApi }));

const { InvalidCredentialsError, TooManyAttemptsError, login, refreshAccess, revokeRefresh, fetchMe, resolveSession } = await import("./authService");
const { ApiError } = await import("../api/errors");

const ok = (data: unknown) => ({ data, response: { status: 200 } });
const status = (code: number, error: unknown = { detail: "nope" }) => ({ error, response: { status: code } });
const me = { id: 12, email: "admin@demo.example", role: "admin" };

beforeEach(() => {
  GET.mockReset();
  POST.mockReset();
});

describe("login", () => {
  it("returns both tokens", async () => {
    POST.mockResolvedValueOnce(ok({ access: "a", refresh: "r" }));

    expect(await login("demo_admin", "pw")).toEqual({ access: "a", refresh: "r" });
    expect(POST).toHaveBeenCalledWith("/api/v1/token/", { body: { username: "demo_admin", password: "pw" } });
  });

  it("throws InvalidCredentialsError on 401 and ApiError on other failures", async () => {
    POST.mockResolvedValueOnce(status(401));
    await expect(login("u", "bad")).rejects.toBeInstanceOf(InvalidCredentialsError);

    POST.mockResolvedValueOnce(status(500, { detail: "boom" }));
    await expect(login("u", "p")).rejects.toBeInstanceOf(ApiError);
  });

  it("throws TooManyAttemptsError when the backend throttles the username", async () => {
    POST.mockResolvedValueOnce(status(429, { detail: "Request was throttled." }));
    await expect(login("u", "p")).rejects.toBeInstanceOf(TooManyAttemptsError);
  });
});

describe("revokeRefresh", () => {
  it("blacklists the refresh token, reports an already-invalid one as false, and throws on other failures", async () => {
    POST.mockResolvedValueOnce(ok({}));
    expect(await revokeRefresh("r")).toBe(true);
    expect(POST).toHaveBeenCalledWith("/api/v1/token/logout/", { body: { refresh: "r" } });

    POST.mockResolvedValueOnce(status(401));
    expect(await revokeRefresh("stale")).toBe(false);

    POST.mockResolvedValueOnce(status(500));
    await expect(revokeRefresh("r")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("refreshAccess", () => {
  it("returns the new access token, or null when the refresh token is rejected", async () => {
    POST.mockResolvedValueOnce(ok({ access: "new" }));
    expect(await refreshAccess("r")).toBe("new");

    POST.mockResolvedValueOnce(status(401));
    expect(await refreshAccess("expired")).toBeNull();
  });
});

describe("fetchMe", () => {
  it("sends the token and derives a display name from the email", async () => {
    GET.mockResolvedValueOnce(ok(me));

    expect(await fetchMe("tok")).toEqual({ id: 12, email: "admin@demo.example", role: "admin", name: "admin" });
    expect(uncachedApi).toHaveBeenCalledWith("tok");
  });

  it("returns null on 401 and rejects a malformed body", async () => {
    GET.mockResolvedValueOnce(status(401));
    expect(await fetchMe("bad")).toBeNull();

    GET.mockResolvedValueOnce(ok({ id: 1 }));
    await expect(fetchMe("tok")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("resolveSession", () => {
  it("uses a valid access token without touching the refresh token", async () => {
    GET.mockResolvedValueOnce(ok(me));

    const session = await resolveSession({ access: "a", refresh: "r" });

    expect(session).toMatchObject({ access: "a", accessWasRefreshed: false, user: { role: "admin" } });
    expect(POST).not.toHaveBeenCalled();
  });

  it("mints a new access token from the refresh token when the access token is expired or missing", async () => {
    GET.mockResolvedValueOnce(status(401)).mockResolvedValueOnce(ok(me));
    POST.mockResolvedValueOnce(ok({ access: "fresh" }));

    expect(await resolveSession({ access: "old", refresh: "r" })).toMatchObject({ access: "fresh", accessWasRefreshed: true });

    GET.mockResolvedValueOnce(ok(me));
    POST.mockResolvedValueOnce(ok({ access: "fresh2" }));
    expect(await resolveSession({ refresh: "r" })).toMatchObject({ access: "fresh2", accessWasRefreshed: true });
  });

  it("is signed out when there is nothing valid to use", async () => {
    expect(await resolveSession({})).toBeNull();

    GET.mockResolvedValueOnce(status(401));
    expect(await resolveSession({ access: "old" })).toBeNull();

    GET.mockResolvedValueOnce(status(401));
    POST.mockResolvedValueOnce(status(401));
    expect(await resolveSession({ access: "old", refresh: "expired" })).toBeNull();
  });

  it("lets a network failure propagate instead of reporting a sign-out", async () => {
    GET.mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(resolveSession({ access: "a", refresh: "r" })).rejects.toThrow("fetch failed");
  });
});
