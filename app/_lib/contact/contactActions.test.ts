import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const POST = vi.fn();
vi.mock("../api/client", () => ({ uncachedApi: () => ({ POST }) }));

let realIp = "203.0.113.1";
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-real-ip": realIp }) }));

const { sendContactMessageAction } = await import("./contactActions");

const answer = (status: number, error?: unknown) => ({ error, response: { status, ok: status >= 200 && status < 300 } });
const valid = { category: "collaboration", name: " Asha ", email: " asha@example.org ", message: "  I'd like to discuss your study.  " };
let ip = 0;

beforeEach(() => {
  POST.mockReset();
  realIp = `198.51.100.${++ip}`;
});

describe("sendContactMessageAction", () => {
  it("sends trimmed fields to the backend", async () => {
    POST.mockResolvedValueOnce(answer(201));
    expect(await sendContactMessageAction(valid)).toEqual({ ok: true });
    expect(POST).toHaveBeenCalledWith("/api/v1/contact/", {
      body: { category: "collaboration", name: "Asha", email: "asha@example.org", message: "I'd like to discuss your study." },
    });
  });

  it("points at every invalid field without calling the backend", async () => {
    const result = await sendContactMessageAction({ category: "sales", name: " ", email: "nope", message: "hi" });
    expect(result).toMatchObject({ ok: false, fieldErrors: { category: expect.any(String), name: expect.any(String), email: expect.any(String), message: expect.any(String) } });
    expect(await sendContactMessageAction(null as never)).toMatchObject({ ok: false });
    expect(POST).not.toHaveBeenCalled();
  });

  it("answers a filled honeypot as success and sends nothing", async () => {
    expect(await sendContactMessageAction({ ...valid, website: "http://spam.example" })).toEqual({ ok: true });
    expect(POST).not.toHaveBeenCalled();
  });

  it("limits one visitor to five messages an hour", async () => {
    POST.mockResolvedValue(answer(201));
    for (let i = 0; i < 5; i++) expect(await sendContactMessageAction(valid)).toEqual({ ok: true });
    expect(await sendContactMessageAction(valid)).toMatchObject({ ok: false, message: expect.stringContaining("several messages") });
    expect(POST).toHaveBeenCalledTimes(5);

    realIp = "192.0.2.200";
    expect(await sendContactMessageAction(valid)).toEqual({ ok: true });
  });

  it("maps the backend's field errors, throttling and outages to messages", async () => {
    POST.mockResolvedValueOnce(answer(400, { email: ["Enter a valid email address."] }));
    expect(await sendContactMessageAction(valid)).toEqual({ ok: false, message: "Check the highlighted fields.", fieldErrors: { email: "Enter a valid email address." } });

    POST.mockResolvedValueOnce(answer(429));
    expect(await sendContactMessageAction(valid)).toMatchObject({ ok: false, message: expect.stringContaining("lot of messages") });

    POST.mockResolvedValueOnce(answer(500));
    expect(await sendContactMessageAction(valid)).toMatchObject({ ok: false, message: expect.stringContaining("couldn't send") });

    POST.mockRejectedValueOnce(new TypeError("fetch failed"));
    expect(await sendContactMessageAction(valid)).toMatchObject({ ok: false, message: expect.stringContaining("couldn't reach") });
  });
});
