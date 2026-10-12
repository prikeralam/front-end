import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const updateTag = vi.fn();
vi.mock("next/cache", () => ({ updateTag }));

const getAccessToken = vi.fn();
vi.mock("../auth/serverAuth", () => ({ getAccessToken }));

const backendRequest = vi.fn();
vi.mock("../api/backendRequest", () => ({ backendRequest }));

const { addEventPhotoAction, listEventPhotosAction, removeEventPhotoAction } = await import("./eventActions");

const ok = (data: unknown, status = 200) => ({ ok: true, status, data, message: "" });
const photoForm = (name = "opening.jpg", size = 100, caption = "Opening session") => {
  const form = new FormData();
  form.append("image", new File([new Uint8Array(size)], name, { type: "image/jpeg" }));
  form.append("caption", caption);
  return form;
};

beforeEach(() => {
  for (const fn of [getAccessToken, backendRequest, updateTag]) fn.mockReset();
  getAccessToken.mockResolvedValue("tok");
});

describe("listEventPhotosAction", () => {
  it("reads the event's photos with the user's token and ignores malformed entries", async () => {
    backendRequest.mockResolvedValueOnce(ok({ images: [{ id: 3, image: "https://bucket.example/a.jpg", caption: "A" }, { id: "x" }, null] }));
    expect(await listEventPhotosAction("conclave-2026")).toEqual({ status: "ok", photos: [{ id: 3, url: "https://bucket.example/a.jpg", caption: "A" }] });
    expect(backendRequest).toHaveBeenCalledWith("GET", "/api/v1/events/conclave-2026/", { accessToken: "tok" });
  });

  it("refuses a bad slug without calling the backend and reports a signed-out user", async () => {
    expect(await listEventPhotosAction("../users")).toEqual({ status: "not-found" });
    getAccessToken.mockResolvedValueOnce(null);
    expect(await listEventPhotosAction("conclave-2026")).toEqual({ status: "signed-out" });
    expect(backendRequest).not.toHaveBeenCalled();
  });
});

describe("addEventPhotoAction", () => {
  it("uploads the photo and caption as multipart and refreshes public pages", async () => {
    backendRequest.mockResolvedValueOnce(ok({ id: 4 }, 201));
    expect(await addEventPhotoAction("conclave-2026", photoForm())).toEqual({ ok: true });
    const [method, path, { form }] = backendRequest.mock.calls[0];
    expect([method, path]).toEqual(["POST", "/api/v1/events/conclave-2026/images/"]);
    expect((form as FormData).get("caption")).toBe("Opening session");
    expect(updateTag).toHaveBeenCalledWith("public-api");
  });

  it("checks type, size and caption before calling the backend", async () => {
    expect(await addEventPhotoAction("conclave-2026", photoForm("slides.gif"))).toMatchObject({ ok: false, message: expect.stringContaining("JPG, PNG or WebP") });
    expect(await addEventPhotoAction("conclave-2026", photoForm("big.jpg", 5 * 1024 * 1024 + 1))).toMatchObject({ ok: false, message: expect.stringContaining("5 MB") });
    expect(await addEventPhotoAction("conclave-2026", photoForm("a.jpg", 10, "x".repeat(201)))).toMatchObject({ ok: false, message: expect.stringContaining("caption") });
    expect(await addEventPhotoAction("conclave-2026", new FormData())).toMatchObject({ ok: false });
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("reports the backend's refusals", async () => {
    backendRequest.mockResolvedValueOnce({ ok: false, status: 400, data: { detail: "An event can have up to 20 photos. Remove one first." }, message: "" });
    expect(await addEventPhotoAction("conclave-2026", photoForm())).toEqual({ ok: false, message: "An event can have up to 20 photos. Remove one first." });
    backendRequest.mockResolvedValueOnce({ ok: false, status: 403, data: null, message: "" });
    expect(await addEventPhotoAction("conclave-2026", photoForm())).toMatchObject({ ok: false, message: expect.stringContaining("role") });
    expect(updateTag).not.toHaveBeenCalled();
  });
});

describe("removeEventPhotoAction", () => {
  it("deletes by id and refuses nonsense ids without calling the backend", async () => {
    backendRequest.mockResolvedValueOnce(ok(null, 204));
    expect(await removeEventPhotoAction("conclave-2026", 4)).toEqual({ ok: true });
    expect(backendRequest).toHaveBeenCalledWith("DELETE", "/api/v1/events/conclave-2026/images/4/", { accessToken: "tok" });
    expect(await removeEventPhotoAction("conclave-2026", -1)).toMatchObject({ ok: false });
    expect(await removeEventPhotoAction("conclave-2026", 1.5)).toMatchObject({ ok: false });
    expect(backendRequest).toHaveBeenCalledTimes(1);
  });
});
