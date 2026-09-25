import { afterEach, describe, expect, it, vi } from "vitest";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearSessionCookies, setSessionCookies } from "./cookies";

const tokenExpiringIn = (seconds: number) =>
  `h.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + seconds })).toString("base64url")}.s`;

const store = () => ({ set: vi.fn(), delete: vi.fn() });

afterEach(() => vi.unstubAllEnvs());

describe("setSessionCookies", () => {
  it("stores both tokens httpOnly, SameSite=Lax, for the whole site, living as long as the token", () => {
    const cookies = store();
    const access = tokenExpiringIn(300);
    const refresh = tokenExpiringIn(86_400);

    setSessionCookies(cookies, { access, refresh });

    expect(cookies.set).toHaveBeenCalledWith(ACCESS_COOKIE, access, expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }));
    expect(cookies.set).toHaveBeenCalledWith(REFRESH_COOKIE, refresh, expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }));
    const accessOptions = cookies.set.mock.calls[0][2] as { maxAge: number };
    const refreshOptions = cookies.set.mock.calls[1][2] as { maxAge: number };
    expect(accessOptions.maxAge).toBeGreaterThan(295);
    expect(accessOptions.maxAge).toBeLessThanOrEqual(300);
    expect(refreshOptions.maxAge).toBeGreaterThan(86_395);
  });

  it("marks cookies Secure only in production", () => {
    const dev = store();
    setSessionCookies(dev, { access: tokenExpiringIn(60) });
    expect(dev.set.mock.calls[0][2]).toMatchObject({ secure: false });

    vi.stubEnv("NODE_ENV", "production");
    const prod = store();
    setSessionCookies(prod, { access: tokenExpiringIn(60) });
    expect(prod.set.mock.calls[0][2]).toMatchObject({ secure: true });
  });

  it("leaves the refresh cookie alone when only a new access token is given", () => {
    const cookies = store();

    setSessionCookies(cookies, { access: tokenExpiringIn(60) });

    expect(cookies.set).toHaveBeenCalledTimes(1);
  });

  it("falls back to SimpleJWT's default lifetimes for tokens without an expiry", () => {
    const cookies = store();

    setSessionCookies(cookies, { access: "opaque", refresh: "opaque" });

    expect(cookies.set.mock.calls[0][2]).toMatchObject({ maxAge: 300 });
    expect(cookies.set.mock.calls[1][2]).toMatchObject({ maxAge: 86_400 });
  });
});

describe("clearSessionCookies", () => {
  it("deletes both cookies", () => {
    const cookies = store();

    clearSessionCookies(cookies);

    expect(cookies.delete.mock.calls.map(([name]) => name)).toEqual([ACCESS_COOKIE, REFRESH_COOKIE]);
  });
});
