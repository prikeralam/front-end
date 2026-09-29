import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const GET = vi.fn();
vi.mock("./client", () => ({ api: { GET } }));

const { getContentBlock } = await import("./contentBlocks");

describe("getContentBlock", () => {
  beforeEach(() => GET.mockReset());

  it("returns the block's slug, title and body", async () => {
    GET.mockResolvedValue({ data: { slug: "hero", title: "Data-driven research.", body: "Text", status: "published" }, response: { status: 200 } });

    expect(await getContentBlock("hero")).toEqual({ slug: "hero", title: "Data-driven research.", body: "Text" });
    expect(GET).toHaveBeenCalledWith("/api/v1/content-blocks/{slug}/", { params: { path: { slug: "hero" } } });
  });

  it("returns null for a block that isn't published yet", async () => {
    GET.mockResolvedValue({ error: { detail: "Not found." }, response: { status: 404 } });

    expect(await getContentBlock("chairman-quote")).toBeNull();
  });

  it("still throws on other failures, so the page can show its error state", async () => {
    GET.mockResolvedValue({ error: { detail: "Server error" }, response: { status: 500 } });

    await expect(getContentBlock("hero")).rejects.toThrow();
  });
});
