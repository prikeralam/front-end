import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { fetchStoryHtml, MAX_STORY_CHARS } = await import("./stories");

const respond = (body: string, status = 200) => vi.fn<(url: URL, init?: RequestInit) => Promise<Response>>(async () => new Response(body, { status }));

describe("fetchStoryHtml", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns the file's text, cached for public pages and uncached for the dashboard", async () => {
    const fetchMock = respond("<p>Story</p>");
    vi.stubGlobal("fetch", fetchMock);
    expect(await fetchStoryHtml("https://bucket.example.org/stories/a.txt?X-Amz-Signature=1")).toBe("<p>Story</p>");
    expect(fetchMock.mock.calls[0][1]).toEqual({ next: { revalidate: 300 } });
    await fetchStoryHtml("http://localhost:8000/media/stories/a.txt", { fresh: true });
    expect(fetchMock.mock.calls[1][1]).toEqual({ cache: "no-store" });
  });

  it("refuses addresses that are not http(s)", async () => {
    const fetchMock = respond("x");
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchStoryHtml("file:///etc/passwd")).rejects.toThrow(/file:/);
    await expect(fetchStoryHtml("not a url")).rejects.toThrow(/valid URL/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws on a failed or oversized response", async () => {
    vi.stubGlobal("fetch", respond("gone", 403));
    await expect(fetchStoryHtml("https://bucket.example.org/s.txt")).rejects.toThrow(/403/);
    vi.stubGlobal("fetch", respond("x".repeat(MAX_STORY_CHARS + 1)));
    await expect(fetchStoryHtml("https://bucket.example.org/s.txt")).rejects.toThrow(/larger/);
  });
});
