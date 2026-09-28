import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const POST = vi.fn();
const uncachedApi = vi.fn((accessToken?: string) => ({ POST: (...args: unknown[]) => POST(accessToken, ...args) }));
vi.mock("../api/client", () => ({ uncachedApi }));

const getAccessToken = vi.fn();
vi.mock("./serverAuth", () => ({ getAccessToken }));

const { requestPasswordResetAction, confirmPasswordResetAction, changeOwnPasswordAction } = await import("./passwordActions");

const answer = (status: number, error?: unknown) => ({ error, response: { status, ok: status >= 200 && status < 300 } });

beforeEach(() => {
  POST.mockReset();
  getAccessToken.mockReset();
  getAccessToken.mockResolvedValue("tok");
});

describe("requestPasswordResetAction", () => {
  it("asks the backend anonymously and reports success either way it answers 204", async () => {
    POST.mockResolvedValueOnce(answer(204));

    expect(await requestPasswordResetAction(" asha@example.org ")).toEqual({ ok: true });
    expect(POST).toHaveBeenCalledWith(undefined, "/api/v1/password-reset/", { body: { email: "asha@example.org" } });
  });

  it("rejects a malformed email without calling the backend, and reports throttling", async () => {
    expect(await requestPasswordResetAction("nope")).toMatchObject({ ok: false });
    expect(POST).not.toHaveBeenCalled();

    POST.mockResolvedValueOnce(answer(429));
    expect(await requestPasswordResetAction("a@b.org")).toEqual({ ok: false, message: expect.stringContaining("Too many") });
  });

  it("treats a network failure as unavailable", async () => {
    POST.mockRejectedValueOnce(new TypeError("fetch failed"));
    expect(await requestPasswordResetAction("a@b.org")).toEqual({ ok: false, message: expect.stringContaining("couldn't reach") });
  });
});

describe("confirmPasswordResetAction", () => {
  it("sets the new password from the link", async () => {
    POST.mockResolvedValueOnce(answer(204));
    expect(await confirmPasswordResetAction("MQ", "abc-123", "A-good-passphrase")).toEqual({ ok: true });
    expect(POST).toHaveBeenCalledWith(undefined, "/api/v1/password-reset/confirm/", { body: { uid: "MQ", token: "abc-123", new_password: "A-good-passphrase" } });
  });

  it("tells a weak password apart from a dead link", async () => {
    POST.mockResolvedValueOnce(answer(400, { new_password: ["This password is too common."] }));
    expect(await confirmPasswordResetAction("MQ", "t", "password")).toEqual({ ok: false, message: "This password is too common." });

    POST.mockResolvedValueOnce(answer(400, { detail: "Invalid or expired link." }));
    expect(await confirmPasswordResetAction("MQ", "t", "A-good-passphrase")).toEqual({ ok: false, message: expect.stringContaining("expired"), reason: "link" });
  });

  it("rejects an incomplete link without calling the backend", async () => {
    expect(await confirmPasswordResetAction("", "t", "pw")).toMatchObject({ ok: false });
    expect(await confirmPasswordResetAction("MQ", "t".repeat(300), "pw")).toMatchObject({ ok: false });
    expect(POST).not.toHaveBeenCalled();
  });
});

describe("changeOwnPasswordAction", () => {
  it("changes the password with the user's token", async () => {
    POST.mockResolvedValueOnce(answer(204));
    expect(await changeOwnPasswordAction("Temp-pass-1", "A-good-passphrase")).toEqual({ ok: true });
    expect(POST).toHaveBeenCalledWith("tok", "/api/v1/users/me/password/", { body: { old_password: "Temp-pass-1", new_password: "A-good-passphrase" } });
  });

  it("reports a wrong current password and a weak new one", async () => {
    POST.mockResolvedValueOnce(answer(400, { old_password: ["Your current password is incorrect."] }));
    expect(await changeOwnPasswordAction("wrong", "A-good-passphrase")).toEqual({ ok: false, message: "Your current password is incorrect." });

    POST.mockResolvedValueOnce(answer(400, { new_password: ["This password is too short."] }));
    expect(await changeOwnPasswordAction("Temp-pass-1", "short")).toEqual({ ok: false, message: "This password is too short." });
  });

  it("needs a session", async () => {
    getAccessToken.mockResolvedValueOnce(null);
    expect(await changeOwnPasswordAction("a", "b")).toEqual({ ok: false, message: expect.stringContaining("sign in") });
    expect(POST).not.toHaveBeenCalled();
  });
});
