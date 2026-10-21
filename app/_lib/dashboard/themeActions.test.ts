import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getAccessToken = vi.fn();
vi.mock("../auth/serverAuth", () => ({ getAccessToken }));

const backendRequest = vi.fn();
const backendListAll = vi.fn();
vi.mock("../api/backendRequest", () => ({ backendRequest, backendListAll }));

const refreshPublicPages = vi.fn();
vi.mock("../api/publicCache", () => ({ refreshPublicPages }));

const { createThemeAction, listThemesAction, updateThemeAction } = await import("./themeActions");

const ok = (data: unknown = {}) => ({ ok: true, status: 201, data, message: "" });
const bad = (status: number, message = "") => ({ ok: false, status, data: null, message });

beforeEach(() => {
  vi.clearAllMocks();
  getAccessToken.mockResolvedValue("tok");
});

describe("listThemesAction", () => {
  it("reads every page fresh and builds the tree", async () => {
    backendListAll.mockResolvedValueOnce({
      ok: true,
      items: [
        { id: 1, slug: "education", name: "Education", parent: null },
        { id: 9, slug: "higher-secondary", name: "Higher Secondary", parent: 1 },
      ],
    });
    const result = await listThemesAction();
    expect(backendListAll).toHaveBeenCalledWith("/api/v1/themes/", "tok");
    expect(result).toEqual({
      status: "ok",
      themes: [{ id: 1, slug: "education", name: "Education", description: "", subthemes: [{ id: 9, slug: "higher-secondary", name: "Higher Secondary", description: "" }] }],
    });
  });

  it("reports a signed-out or failed read", async () => {
    getAccessToken.mockResolvedValueOnce(null);
    expect(await listThemesAction()).toEqual({ status: "signed-out" });
    backendListAll.mockResolvedValueOnce({ ok: false, status: 500 });
    expect(await listThemesAction()).toEqual({ status: "error" });
  });
});

describe("createThemeAction", () => {
  it("adds a sub-theme under its theme and refreshes public pages", async () => {
    backendRequest.mockResolvedValueOnce(ok());
    const result = await createThemeAction({ name: " School Education ", slug: "school-education", description: "", parentId: 1 });
    expect(result).toEqual({ ok: true });
    expect(backendRequest).toHaveBeenCalledWith("POST", "/api/v1/themes/1/subthemes/", {
      accessToken: "tok",
      json: { name: "School Education", slug: "school-education", description: "" },
    });
    expect(refreshPublicPages).toHaveBeenCalled();
  });

  it("adds a top-level theme without a parent", async () => {
    backendRequest.mockResolvedValueOnce(ok());
    await createThemeAction({ name: "Agriculture", slug: "agriculture", description: "Farms" });
    expect(backendRequest).toHaveBeenCalledWith("POST", "/api/v1/themes/", expect.anything());
  });

  it.each([
    [{ name: "", slug: "x", description: "" }, "Give it a name."],
    [{ name: "x".repeat(51), slug: "x", description: "" }, "Keep the name to 50 characters."],
    [{ name: "Ok", slug: "Bad Slug", description: "" }, "lowercase letters"],
    [{ name: "Ok", slug: "ok", description: "", parentId: -2 }, "no longer exists"],
  ])("refuses %o without calling the API", async (input, message) => {
    const result = await createThemeAction(input);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toContain(message);
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("passes on the backend's reason, and plain words for other failures", async () => {
    backendRequest.mockResolvedValueOnce(bad(400, "slug: theme with this slug already exists."));
    expect(await createThemeAction({ name: "Health", slug: "health", description: "" })).toEqual({ ok: false, error: "slug: theme with this slug already exists." });
    backendRequest.mockResolvedValueOnce(bad(403));
    expect(await createThemeAction({ name: "Health", slug: "health", description: "" })).toEqual({ ok: false, error: "Only editors and admins can manage themes." });
    expect(refreshPublicPages).not.toHaveBeenCalled();
  });
});

describe("updateThemeAction", () => {
  it("changes the name and description only (the slug stays)", async () => {
    backendRequest.mockResolvedValueOnce(ok());
    await updateThemeAction(9, { name: "Higher Secondary Schools", description: "Plus One and Two" });
    expect(backendRequest).toHaveBeenCalledWith("PATCH", "/api/v1/themes/9/", {
      accessToken: "tok",
      json: { name: "Higher Secondary Schools", description: "Plus One and Two" },
    });
  });

  it("rejects a bad id or a signed-out caller", async () => {
    expect(await updateThemeAction(0, { name: "x", description: "" })).toEqual({ ok: false, error: "That request isn't valid." });
    getAccessToken.mockResolvedValueOnce(null);
    expect(await updateThemeAction(3, { name: "x", description: "" })).toEqual({ ok: false, error: "Your session has ended. Please sign in again." });
    expect(backendRequest).not.toHaveBeenCalled();
  });
});
