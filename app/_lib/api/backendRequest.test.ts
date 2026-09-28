import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("./client", () => ({ apiBaseUrl: () => "https://api.example" }));

const { backendListAll } = await import("./backendRequest");

const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

afterEach(() => vi.unstubAllGlobals());

describe("backendListAll", () => {
  it("follows next links and sends the user's token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(reply(200, { count: 3, results: [{ id: 1 }, { id: 2 }], next: "https://api.example/x/?page=2" }))
      .mockResolvedValueOnce(reply(200, { count: 3, results: [{ id: 3 }], next: null }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(backendListAll("/api/v1/people/", "tok")).resolves.toEqual({ ok: true, items: [{ id: 1 }, { id: 2 }, { id: 3 }] });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(["https://api.example/api/v1/people/?page=1", "https://api.example/api/v1/people/?page=2"]);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
  });

  it("reports the status of a failed page instead of throwing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(reply(403, { detail: "nope" })));

    await expect(backendListAll("/api/v1/people/", "tok")).resolves.toEqual({ ok: false, status: 403 });
  });
});
