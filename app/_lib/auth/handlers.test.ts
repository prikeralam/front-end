import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const jar = { set: vi.fn(), delete: vi.fn(), get: vi.fn() };
vi.mock("next/headers", () => ({ cookies: async () => jar }));

const service = { login: vi.fn(), resolveSession: vi.fn(), revokeRefresh: vi.fn() };
class InvalidCredentialsError extends Error {}
class TooManyAttemptsError extends Error {}
vi.mock("./authService", () => ({ ...service, InvalidCredentialsError, TooManyAttemptsError }));

const { handleLogin, handleLogout, handleSession } = await import("./handlers");

const user = { id: 12, email: "admin@demo.example", role: "admin", name: "admin" };
const tokens = { access: "h.e30.s", refresh: "h.e30.s" };

const loginRequest = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("https://pri.example/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  jar.set.mockReset();
  jar.delete.mockReset();
  jar.get.mockReset();
  service.login.mockReset();
  service.resolveSession.mockReset();
  service.revokeRefresh.mockReset();
});

describe("handleLogin", () => {
  it("signs in: sets httpOnly cookies and returns the user, never the tokens", async () => {
    service.login.mockResolvedValueOnce(tokens);
    service.resolveSession.mockResolvedValueOnce({ user, access: tokens.access, accessWasRefreshed: false });

    const response = await handleLogin(loginRequest({ username: " demo_admin ", password: "pw" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(user);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(service.login).toHaveBeenCalledWith("demo_admin", "pw");
    expect(jar.set).toHaveBeenCalledTimes(2);
    expect(jar.set.mock.calls.every(([, , options]) => (options as { httpOnly: boolean }).httpOnly)).toBe(true);
  });

  it("answers 401 for wrong credentials and sets no cookies", async () => {
    service.login.mockRejectedValueOnce(new InvalidCredentialsError());

    const response = await handleLogin(loginRequest({ username: "u", password: "bad" }));

    expect(response.status).toBe(401);
    expect(jar.set).not.toHaveBeenCalled();
  });

  it("answers 429 when the backend throttles the username", async () => {
    service.login.mockRejectedValueOnce(new TooManyAttemptsError());

    const response = await handleLogin(loginRequest({ username: "u", password: "p" }));

    expect(response.status).toBe(429);
    expect(jar.set).not.toHaveBeenCalled();
  });

  it("answers 503 when the backend fails, distinct from a wrong password", async () => {
    service.login.mockRejectedValueOnce(new TypeError("fetch failed"));

    expect((await handleLogin(loginRequest({ username: "u", password: "p" }))).status).toBe(503);
    expect(jar.set).not.toHaveBeenCalled();
  });

  it.each([
    ["invalid JSON", "{nope"],
    ["missing fields", {}],
    ["blank username", { username: "  ", password: "pw" }],
    ["empty password", { username: "u", password: "" }],
    ["non-string values", { username: 1, password: 2 }],
    ["oversized username", { username: "u".repeat(151), password: "pw" }],
    ["oversized password", { username: "u", password: "p".repeat(129) }],
  ])("rejects %s with 400 before calling the backend", async (_label, body) => {
    const response = await handleLogin(loginRequest(body));

    expect(response.status).toBe(400);
    expect(service.login).not.toHaveBeenCalled();
  });

  it("rejects a cross-site Origin with 403 and allows the same origin", async () => {
    const cross = await handleLogin(loginRequest({ username: "u", password: "p" }, { Origin: "https://evil.example" }));
    expect(cross.status).toBe(403);
    expect(service.login).not.toHaveBeenCalled();

    service.login.mockResolvedValueOnce(tokens);
    service.resolveSession.mockResolvedValueOnce({ user, access: tokens.access, accessWasRefreshed: false });
    const same = await handleLogin(loginRequest({ username: "u", password: "p" }, { Origin: "https://pri.example" }));
    expect(same.status).toBe(200);
  });
});

describe("handleLogout", () => {
  const logoutRequest = () => new Request("https://pri.example/api/auth/logout", { method: "POST" });

  it("revokes the refresh token on the backend and clears both cookies", async () => {
    jar.get.mockImplementation((name: string) => ({ value: `${name}-token` }));
    service.revokeRefresh.mockResolvedValueOnce(true);

    const response = await handleLogout(logoutRequest());

    expect(response.status).toBe(200);
    expect(service.revokeRefresh).toHaveBeenCalledWith("pri_refresh-token");
    expect(jar.delete).toHaveBeenCalledTimes(2);
  });

  it("still signs out locally when the backend cannot revoke the token", async () => {
    jar.get.mockImplementation((name: string) => ({ value: `${name}-token` }));
    service.revokeRefresh.mockRejectedValueOnce(new TypeError("fetch failed"));

    const response = await handleLogout(logoutRequest());

    expect(response.status).toBe(200);
    expect(jar.delete).toHaveBeenCalledTimes(2);
  });

  it("skips revocation when there is no refresh cookie", async () => {
    const response = await handleLogout(logoutRequest());

    expect(response.status).toBe(200);
    expect(service.revokeRefresh).not.toHaveBeenCalled();
  });

  it("refuses a cross-site request", async () => {
    const response = await handleLogout(new Request("https://pri.example/api/auth/logout", { method: "POST", headers: { Origin: "https://evil.example" } }));

    expect(response.status).toBe(403);
    expect(jar.delete).not.toHaveBeenCalled();
  });
});

describe("handleSession", () => {
  it("returns the user for a valid session without touching cookies", async () => {
    jar.get.mockImplementation((name: string) => ({ value: `${name}-token` }));
    service.resolveSession.mockResolvedValueOnce({ user, access: "a", accessWasRefreshed: false });

    const response = await handleSession();

    expect(response.status).toBe(200);
    expect(service.resolveSession).toHaveBeenCalledWith({ access: "pri_access-token", refresh: "pri_refresh-token" });
    expect(jar.set).not.toHaveBeenCalled();
  });

  it("stores a renewed access token, and only that", async () => {
    service.resolveSession.mockResolvedValueOnce({ user, access: "h.e30.s", accessWasRefreshed: true });

    await handleSession();

    expect(jar.set).toHaveBeenCalledTimes(1);
    expect(jar.set.mock.calls[0][0]).toBe("pri_access");
  });

  it("answers 401 and clears the cookies when signed out", async () => {
    service.resolveSession.mockResolvedValueOnce(null);

    expect((await handleSession()).status).toBe(401);
    expect(jar.delete).toHaveBeenCalledTimes(2);
  });

  it("answers 503 during an outage and keeps the cookies", async () => {
    service.resolveSession.mockRejectedValueOnce(new TypeError("fetch failed"));

    expect((await handleSession()).status).toBe(503);
    expect(jar.delete).not.toHaveBeenCalled();
  });
});
