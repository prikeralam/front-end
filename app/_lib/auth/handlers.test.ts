import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const jar = { set: vi.fn(), delete: vi.fn(), get: vi.fn() };
vi.mock("next/headers", () => ({ cookies: async () => jar }));

const service = { login: vi.fn(), loginWithGoogle: vi.fn(), resolveSession: vi.fn(), revokeRefresh: vi.fn(), register: vi.fn() };
class InvalidCredentialsError extends Error {}
class GoogleSignInRefusedError extends Error {}
class TooManyAttemptsError extends Error {}
class RegistrationError extends Error {
  constructor(readonly fields: Record<string, string>) {
    super("refused");
  }
}
vi.mock("./authService", () => ({ ...service, InvalidCredentialsError, GoogleSignInRefusedError, TooManyAttemptsError, RegistrationError }));

const { handleGoogleLogin, handleLogin, handleLogout, handleSession, handleSignup } = await import("./handlers");

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
  service.loginWithGoogle.mockReset();
  service.resolveSession.mockReset();
  service.revokeRefresh.mockReset();
  service.register.mockReset();
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

  it("behind a proxy, compares the Origin with the forwarded host, not the server's own address", async () => {
    // The standalone server sees request.url as its bind address; nginx forwards the host the browser used.
    const proxied = (headers: Record<string, string>) =>
      new Request("http://0.0.0.0:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ username: "u", password: "p" }),
      });

    const cross = await handleLogin(proxied({ Origin: "https://evil.example", Host: "pri.example", "X-Forwarded-Host": "pri.example" }));
    expect(cross.status).toBe(403);

    service.login.mockResolvedValueOnce(tokens);
    service.resolveSession.mockResolvedValueOnce({ user, access: tokens.access, accessWasRefreshed: false });
    const same = await handleLogin(proxied({ Origin: "https://pri.example", Host: "pri.example", "X-Forwarded-Host": "pri.example" }));
    expect(same.status).toBe(200);
  });
});

describe("handleGoogleLogin", () => {
  const googleRequest = (body: unknown, headers: Record<string, string> = {}) =>
    new Request("https://pri.example/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

  it("signs in with Google's ID token: sets httpOnly cookies and returns the user, never the tokens", async () => {
    service.loginWithGoogle.mockResolvedValueOnce(tokens);
    service.resolveSession.mockResolvedValueOnce({ user, access: tokens.access, accessWasRefreshed: false });

    const response = await handleGoogleLogin(googleRequest({ credential: "google.id.token" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(user);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(service.loginWithGoogle).toHaveBeenCalledWith("google.id.token");
    expect(jar.set).toHaveBeenCalledTimes(2);
    expect(jar.set.mock.calls.every(([, , options]) => (options as { httpOnly: boolean }).httpOnly)).toBe(true);
  });

  it("answers 401 when the backend refuses the token, 429 when throttled, 503 when it fails", async () => {
    service.loginWithGoogle.mockRejectedValueOnce(new GoogleSignInRefusedError());
    expect((await handleGoogleLogin(googleRequest({ credential: "c" }))).status).toBe(401);
    service.loginWithGoogle.mockRejectedValueOnce(new TooManyAttemptsError());
    expect((await handleGoogleLogin(googleRequest({ credential: "c" }))).status).toBe(429);
    service.loginWithGoogle.mockRejectedValueOnce(new TypeError("fetch failed"));
    expect((await handleGoogleLogin(googleRequest({ credential: "c" }))).status).toBe(503);
    expect(jar.set).not.toHaveBeenCalled();
  });

  it.each([
    ["invalid JSON", "{nope"],
    ["a missing credential", {}],
    ["an empty credential", { credential: "" }],
    ["a non-string credential", { credential: 7 }],
    ["an oversized credential", { credential: "c".repeat(4097) }],
  ])("rejects %s with 400 before calling the backend", async (_label, body) => {
    expect((await handleGoogleLogin(googleRequest(body))).status).toBe(400);
    expect(service.loginWithGoogle).not.toHaveBeenCalled();
  });

  it("rejects a cross-site Origin with 403", async () => {
    const response = await handleGoogleLogin(googleRequest({ credential: "c" }, { Origin: "https://evil.example" }));
    expect(response.status).toBe(403);
    expect(service.loginWithGoogle).not.toHaveBeenCalled();
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

describe("handleSignup", () => {
  const signup = { name: "Asha K Menon", email: " Asha@Example.org ", password: "a-long-pass", organisation: " Calicut ", purpose: "research", newsletter: true, terms: true, next: "/data/x" };
  let ip = 0;
  // Each test signs up from its own address, so the per-visitor limit doesn't carry over between tests.
  const signupRequest = (body: unknown, headers: Record<string, string> = {}) =>
    new Request("https://pri.example/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-real-ip": `10.0.0.${++ip}`, ...headers },
      body: JSON.stringify(body),
    });

  it("creates the account, signs the visitor in and returns them, never the tokens", async () => {
    service.register.mockResolvedValueOnce(undefined);
    service.login.mockResolvedValueOnce(tokens);
    service.resolveSession.mockResolvedValueOnce({ user: { ...user, role: "public", emailVerified: false }, access: tokens.access, accessWasRefreshed: false });

    const response = await handleSignup(signupRequest(signup));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ user: { ...user, role: "public", emailVerified: false } });
    expect(service.register).toHaveBeenCalledWith({
      email: "asha@example.org",
      password: "a-long-pass",
      first_name: "Asha",
      last_name: "K Menon",
      organisation: "Calicut",
      purpose: "research",
      newsletter_opt_in: true,
      next: "/data/x",
    });
    expect(service.login).toHaveBeenCalledWith("asha@example.org", "a-long-pass");
    expect(jar.set).toHaveBeenCalledTimes(2);
  });

  it("answers 202 without cookies when the address already had an account (its owner is emailed instead)", async () => {
    service.register.mockResolvedValueOnce(undefined);
    service.login.mockRejectedValueOnce(new InvalidCredentialsError());

    const response = await handleSignup(signupRequest(signup));

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ pending: true });
    expect(jar.set).not.toHaveBeenCalled();
  });

  it("checks the fields itself and drops an unsafe return path", async () => {
    const bad = await handleSignup(signupRequest({ ...signup, email: "nope", terms: false }));
    expect(bad.status).toBe(400);
    expect((await bad.json()).fields).toMatchObject({ email: expect.any(String), terms: expect.any(String) });
    expect(service.register).not.toHaveBeenCalled();

    service.register.mockResolvedValueOnce(undefined);
    service.login.mockRejectedValueOnce(new InvalidCredentialsError());
    await handleSignup(signupRequest({ ...signup, next: "https://evil.example" }));
    expect(service.register.mock.calls[0][0].next).toBe("");
  });

  it("passes the backend's field messages back under the form's names", async () => {
    service.register.mockRejectedValueOnce(new RegistrationError({ password: "This password is too common." }));

    const response = await handleSignup(signupRequest(signup));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ fields: { password: "This password is too common." } });
  });

  it("refuses cross-site requests and limits sign-ups per visitor", async () => {
    expect((await handleSignup(signupRequest(signup, { Origin: "https://evil.example" }))).status).toBe(403);

    service.register.mockResolvedValue(undefined);
    service.login.mockRejectedValue(new InvalidCredentialsError());
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await handleSignup(signupRequest(signup, { "x-real-ip": "10.9.9.9" }))).status);
    expect(statuses).toEqual([202, 202, 202, 202, 202, 429]);
  });
});
