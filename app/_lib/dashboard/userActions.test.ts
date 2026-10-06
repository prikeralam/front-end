import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getAccessToken = vi.fn();
vi.mock("../auth/serverAuth", () => ({ getAccessToken }));

const backendRequest = vi.fn();
vi.mock("../api/backendRequest", () => ({ backendRequest }));

const { listUsersAction, createUserAction, updateUserAction, setUserRoleAction, setUserActiveAction, sendPasswordResetAction } = await import("./userActions");

const ok = (data: unknown, status = 200) => ({ ok: true, status, data, message: "" });
const bad = (status: number, data: unknown = null) => ({ ok: false, status, data, message: "" });
const apiUser = (over: Record<string, unknown> = {}) => ({
  id: 7,
  username: "rafi",
  email: "rafi@example.org",
  first_name: "Rafi",
  last_name: "K",
  role: "researcher",
  is_active: true,
  must_change_password: false,
  date_joined: "2026-09-28T10:00:00Z",
  last_login: null,
  ...over,
});

beforeEach(() => {
  getAccessToken.mockReset();
  backendRequest.mockReset();
  getAccessToken.mockResolvedValue("tok");
});

describe("listUsersAction", () => {
  it("passes the filters through and maps the page", async () => {
    backendRequest.mockResolvedValueOnce(ok({ count: 3, next: "x", previous: null, results: [apiUser()] }));

    const result = await listUsersAction({ q: " rafi ", role: "researcher", active: "inactive", page: 2 });

    expect(backendRequest).toHaveBeenCalledWith("GET", "/api/v1/users/?page=2&q=rafi&role=researcher&is_active=false", { accessToken: "tok" });
    expect(result).toMatchObject({ status: "ok", count: 3, hasNext: true, hasPrevious: false });
    expect(result.status === "ok" && result.users[0].name).toBe("Rafi K");
  });

  it("rejects bad filters without calling the backend", async () => {
    expect(await listUsersAction({ role: "superuser" as never })).toEqual({ status: "invalid" });
    expect(await listUsersAction({ page: 0 })).toEqual({ status: "invalid" });
    expect(await listUsersAction({ q: "x".repeat(101) })).toEqual({ status: "invalid" });
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("reports signed-out and forbidden", async () => {
    getAccessToken.mockResolvedValueOnce(null);
    expect(await listUsersAction()).toEqual({ status: "signed-out" });

    backendRequest.mockResolvedValueOnce(bad(403));
    expect(await listUsersAction()).toEqual({ status: "forbidden" });
  });
});

describe("createUserAction", () => {
  const base = { username: "asha", email: "asha@example.org", firstName: "Asha", lastName: "", role: "editor" as const };

  it("sends an invite when no password is given", async () => {
    backendRequest.mockResolvedValueOnce(ok(apiUser({ id: 9, username: "asha" }), 201));

    const result = await createUserAction({ ...base, mode: "invite", password: "ignored" });

    expect(backendRequest).toHaveBeenCalledWith("POST", "/api/v1/users/", {
      accessToken: "tok",
      json: { username: "asha", email: "asha@example.org", first_name: "Asha", last_name: "", role: "editor" },
    });
    expect(result).toMatchObject({ ok: true, user: { id: 9 } });
  });

  it("sends the temporary password in password mode", async () => {
    backendRequest.mockResolvedValueOnce(ok(apiUser(), 201));
    await createUserAction({ ...base, mode: "password", password: "Temp-pass-2026" });
    expect(backendRequest.mock.calls[0][2].json.password).toBe("Temp-pass-2026");
  });

  it("validates before calling the backend", async () => {
    expect(await createUserAction({ ...base, username: "has space", mode: "invite" })).toMatchObject({ ok: false, fieldErrors: { username: expect.any(String) } });
    expect(await createUserAction({ ...base, email: "nope", mode: "invite" })).toMatchObject({ ok: false, fieldErrors: { email: expect.any(String) } });
    expect(await createUserAction({ ...base, mode: "password" })).toMatchObject({ ok: false, fieldErrors: { password: expect.any(String) } });
    expect(await createUserAction({ ...base, role: "root" as never, mode: "invite" })).toMatchObject({ ok: false });
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("maps the backend's field errors onto the form's fields", async () => {
    backendRequest.mockResolvedValueOnce(bad(400, { email: ["A user with that email already exists."], password: ["This password is too common."] }));

    const result = await createUserAction({ ...base, mode: "password", password: "password" });

    expect(result).toEqual({
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: { email: "A user with that email already exists.", password: "This password is too common." },
    });
  });
});

describe("updateUserAction", () => {
  it("patches only contact details", async () => {
    backendRequest.mockResolvedValueOnce(ok(apiUser({ first_name: "R." })));

    const result = await updateUserAction(7, { email: "rafi@example.org", firstName: "R.", lastName: "K" });

    expect(backendRequest).toHaveBeenCalledWith("PATCH", "/api/v1/users/7/", { accessToken: "tok", json: { email: "rafi@example.org", first_name: "R.", last_name: "K" } });
    expect(result).toMatchObject({ ok: true, user: { firstName: "R." } });
  });

  it("rejects a bad id", async () => {
    expect(await updateUserAction(-1, { email: "a@b.c" })).toMatchObject({ ok: false });
    expect(await updateUserAction("7" as never, { email: "a@b.c" })).toMatchObject({ ok: false });
    expect(backendRequest).not.toHaveBeenCalled();
  });
});

describe("setUserRoleAction", () => {
  it("changes the role", async () => {
    backendRequest.mockResolvedValueOnce(ok({ id: 7, email: "rafi@example.org", role: "editor" }));
    expect(await setUserRoleAction(7, "editor")).toEqual({ ok: true });
    expect(backendRequest).toHaveBeenCalledWith("PATCH", "/api/v1/users/7/role/", { accessToken: "tok", json: { role: "editor" } });
  });

  it("shows the lockout guard's message, which DRF sends as a list", async () => {
    backendRequest.mockResolvedValueOnce(bad(400, { detail: ["This is the last active admin."] }));
    expect(await setUserRoleAction(1, "editor")).toEqual({ ok: false, message: "This is the last active admin." });
  });

  it("reports a non-admin caller", async () => {
    backendRequest.mockResolvedValueOnce(bad(403, { detail: "You do not have permission to perform this action." }));
    expect(await setUserRoleAction(7, "admin")).toEqual({ ok: false, message: "Only admins can manage users." });
  });
});

describe("setUserActiveAction and sendPasswordResetAction", () => {
  it("deactivates and reactivates", async () => {
    backendRequest.mockResolvedValueOnce(ok(apiUser({ is_active: false })));
    expect(await setUserActiveAction(7, false)).toMatchObject({ ok: true, user: { active: false } });
    expect(backendRequest).toHaveBeenLastCalledWith("POST", "/api/v1/users/7/deactivate/", { accessToken: "tok" });

    backendRequest.mockResolvedValueOnce(ok(apiUser()));
    await setUserActiveAction(7, true);
    expect(backendRequest).toHaveBeenLastCalledWith("POST", "/api/v1/users/7/reactivate/", { accessToken: "tok" });
  });

  it("sends a reset link, and relays the backend's refusal for an inactive user", async () => {
    backendRequest.mockResolvedValueOnce(ok(null, 204));
    expect(await sendPasswordResetAction(7)).toEqual({ ok: true });

    backendRequest.mockResolvedValueOnce(bad(400, { detail: "This account is deactivated." }));
    expect(await sendPasswordResetAction(7)).toEqual({ ok: false, message: "This account is deactivated." });
  });

  it("reports a signed-out caller", async () => {
    getAccessToken.mockResolvedValueOnce(null);
    expect(await sendPasswordResetAction(7)).toMatchObject({ ok: false, message: expect.stringContaining("sign in") });
  });
});
