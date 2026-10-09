import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const updateTag = vi.fn();
vi.mock("next/cache", () => ({ updateTag }));

const getAccessToken = vi.fn();
vi.mock("../auth/serverAuth", () => ({ getAccessToken }));

const backendRequest = vi.fn();
const backendListAll = vi.fn();
vi.mock("../api/backendRequest", () => ({ backendRequest, backendListAll }));

vi.mock("../api/themes", () => ({
  listThemes: async () => [
    { id: 5, slug: "health", name: "Health", parent: null, subthemes: [] },
    { id: 11, slug: "primary-care", name: "Primary Care", parent: 5, subthemes: [] },
  ],
}));
vi.mock("../api/people", () => ({ listPeopleById: async () => new Map([[38, { name: "PRI Research Team" }]]) }));
vi.mock("../api/publications", () => ({ listPublications: async () => ({ publications: [{ slug: "healthcare-gap", title: "Healthcare gap" }] }) }));
const listDatasets = vi.fn();
vi.mock("../api/datasets", () => ({ listDatasets }));

const { listCmsAction, listAllCmsAction, getFormOptionsAction, createCmsAction, updateCmsAction, transitionCmsAction, deleteCmsAction } = await import("./cmsActions");

const ok = (data: unknown, status = 200) => ({ ok: true, status, data, message: "" });
const bad = (status: number, message = "") => ({ ok: false, status, data: status === 400 ? { slug: ["taken"] } : null, message });
const api = (over: Record<string, unknown>) => ({ id: 1, status: "draft", created_by: 3, updated_at: "2026-09-25T10:00:00Z", ...over });

const form = (entries: Record<string, string | File>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
};

const testimonialForm = () => form({ quote: "Great", attribution: "Dr. A", role: "" });

beforeEach(() => {
  for (const fn of [getAccessToken, backendRequest, backendListAll, updateTag]) fn.mockReset();
  getAccessToken.mockResolvedValue("tok");
});

describe("listCmsAction", () => {
  it("lists one type, keeping people and partners apart, newest first", async () => {
    backendListAll.mockResolvedValueOnce({
      ok: true,
      items: [api({ id: 1, group: "partner", name: "HADIA", updated_at: "2026-09-20T00:00:00Z" }), api({ id: 2, group: "team", name: "A", updated_at: "2026-09-21T00:00:00Z" }), api({ id: 3, group: "team", name: "B", updated_at: "2026-09-22T00:00:00Z" })],
    });

    const result = await listCmsAction("person-profile");

    expect(result.status === "ok" && result.records.map((r) => r.title)).toEqual(["B", "A"]);
    expect(backendListAll).toHaveBeenCalledWith("/api/v1/people/", "tok");
  });

  it("maps signed-out, forbidden and failures, and rejects unknown types", async () => {
    getAccessToken.mockResolvedValueOnce(null);
    expect(await listCmsAction("project")).toEqual({ status: "signed-out" });

    backendListAll.mockResolvedValueOnce({ ok: false, status: 403 });
    expect(await listCmsAction("project")).toEqual({ status: "forbidden" });

    backendListAll.mockResolvedValueOnce({ ok: false, status: 500 });
    expect(await listCmsAction("project")).toEqual({ status: "error" });

    expect(await listCmsAction("nonsense" as never)).toEqual({ status: "error" });
    expect(backendListAll).toHaveBeenCalledTimes(2);
  });
});

describe("listAllCmsAction", () => {
  it("combines every type and skips the ones that fail", async () => {
    backendListAll.mockImplementation(async (path: string) =>
      path === "/api/v1/projects/" ? { ok: true, items: [api({ id: 1, slug: "p", title: "P", blurb: "b" })] } : { ok: false, status: 500 },
    );

    const all = await listAllCmsAction();

    expect(all.map((r) => r.type)).toEqual(["project"]);
  });
});

describe("getFormOptionsAction", () => {
  it("offers sub-themes labelled with their theme, people as authors, and publications and datasets by slug", async () => {
    listDatasets.mockResolvedValueOnce([{ slug: "plus-one", title: "Plus One batch size" }]);

    expect(await getFormOptionsAction()).toEqual({
      "sub-themes": [{ value: "11", label: "Health › Primary Care" }],
      authors: [{ value: "38", label: "PRI Research Team" }],
      publications: [{ value: "healthcare-gap", label: "Healthcare gap" }],
      datasets: [{ value: "plus-one", label: "Plus One batch size" }],
    });
    // Datasets are listed as the signed-in user sees them, so staff can bundle internal ones.
    expect(listDatasets).toHaveBeenCalledWith({ accessToken: "tok" });
  });

  it("leaves a list empty when it fails to load, rather than failing the form", async () => {
    listDatasets.mockRejectedValueOnce(new Error("down"));
    expect((await getFormOptionsAction()).datasets).toEqual([]);
  });
});

describe("multiselect fields", () => {
  it("sends every ticked checkbox as a list of slugs", async () => {
    backendRequest.mockResolvedValueOnce(ok(api({ id: 5, slug: "plus-one", title: "Plus One", description: "", datasets: ["a", "b"], publication: null }), 201));
    const f = new FormData();
    f.append("title", "Plus One");
    f.append("description", "");
    f.append("datasets", "a");
    f.append("datasets", "b");
    f.append("publication", "");

    expect((await createCmsAction("collection", f)).ok).toBe(true);
    expect(backendRequest.mock.calls[0][2].json).toMatchObject({ datasets: ["a", "b"], publication: null, slug: "plus-one" });
  });
});


describe("createCmsAction", () => {
  it("creates as JSON with an auto slug and returns the record", async () => {
    backendRequest.mockResolvedValueOnce(ok(api({ id: 9, slug: "dr-a", quote: "Great", attribution: "Dr. A", role: "" }), 201));

    const result = await createCmsAction("testimonial", testimonialForm());

    expect(result).toMatchObject({ ok: true, record: { key: "9", title: "Great" } });
    expect(backendRequest).toHaveBeenCalledWith("POST", "/api/v1/testimonials/", { accessToken: "tok", json: expect.objectContaining({ slug: "dr-a", quote: "Great", attribution: "Dr. A" }) });
  });

  it("retries once with a random suffix when the generated slug is taken", async () => {
    backendRequest.mockResolvedValueOnce(bad(400)).mockResolvedValueOnce(ok(api({ id: 9, slug: "dr-a-x", quote: "Great", attribution: "Dr. A" }), 201));

    const result = await createCmsAction("testimonial", testimonialForm());

    expect(result.ok).toBe(true);
    expect(backendRequest).toHaveBeenCalledTimes(2);
    const retried = backendRequest.mock.calls[1][2] as { json: { slug: string } };
    expect(retried.json.slug).toMatch(/^dr-a-[a-z0-9]{1,4}$/);
  });

  it("does not retry a slug the user typed themselves", async () => {
    backendRequest.mockResolvedValueOnce(bad(400, "slug: taken"));

    const result = await createCmsAction("content-block", form({ slug: "hero", title: "T", body: "B", seo_title: "", seo_description: "" }));

    expect(result).toEqual({ ok: false, message: "slug: taken" });
    expect(backendRequest).toHaveBeenCalledTimes(1);
  });

  it("uploads a document as multipart when a file is chosen, and requires one on create", async () => {
    const pdf = new File(["%PDF"], "report.pdf", { type: "application/pdf" });
    backendRequest.mockResolvedValueOnce(ok(api({ id: 4, slug: "ar-2026", title: "AR", file: "http://api/media/ar.pdf", document_type: "annual-report", year: 2026 }), 201));

    const created = await createCmsAction("document", form({ title: "AR", document_type: "annual-report", year: "2026", description: "", file: pdf }));

    expect(created.ok).toBe(true);
    const call = backendRequest.mock.calls[0];
    expect(call[2].form).toBeInstanceOf(FormData);
    expect((call[2].form as FormData).get("year")).toBe("2026");
    expect((call[2].form as FormData).get("file")).toBeInstanceOf(File);

    backendRequest.mockClear();
    const missing = await createCmsAction("document", form({ title: "AR", document_type: "annual-report", year: "", description: "" }));
    expect(missing).toEqual({ ok: false, message: "File is required." });
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("rejects files that are too big or of an unaccepted type before contacting the backend", async () => {
    const values = { title: "AR", document_type: "issue", year: "", description: "" };
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "big.pdf");
    const exe = new File(["MZ"], "malware.exe");

    expect(await createCmsAction("document", form({ ...values, file: big }))).toEqual({ ok: false, message: "That file is larger than 10 MB." });
    expect(await createCmsAction("document", form({ ...values, file: exe }))).toMatchObject({ ok: false, message: expect.stringContaining(".exe") });
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("reports a missing field, a signed-out caller, a role refusal and a bad request shape", async () => {
    expect(await createCmsAction("testimonial", form({ quote: "", attribution: "A", role: "" }))).toEqual({ ok: false, message: "Quote is required." });

    getAccessToken.mockResolvedValueOnce(null);
    expect(await createCmsAction("testimonial", testimonialForm())).toMatchObject({ ok: false, message: expect.stringContaining("session") });

    backendRequest.mockResolvedValueOnce(bad(403));
    expect(await createCmsAction("testimonial", testimonialForm())).toEqual({ ok: false, message: "Your role isn't allowed to do that." });

    expect(await createCmsAction("bogus" as never, testimonialForm())).toEqual({ ok: false, message: "That request isn't valid." });
    expect(await createCmsAction("testimonial", {} as FormData)).toEqual({ ok: false, message: "That request isn't valid." });
  });
});

describe("updateCmsAction", () => {
  it("patches the object by its key and leaves the file alone when none is chosen", async () => {
    backendRequest.mockResolvedValueOnce(ok(api({ id: 9, slug: "x", quote: "New", attribution: "Dr. A", role: "" })));

    const result = await updateCmsAction("testimonial", "9", form({ quote: "New", attribution: "Dr. A", role: "" }));

    expect(result.ok).toBe(true);
    expect(backendRequest).toHaveBeenCalledWith("PATCH", "/api/v1/testimonials/9/", { accessToken: "tok", json: { quote: "New", attribution: "Dr. A", role: "" } });
  });

  it("uploads a person's photo from the computer as multipart under the photo field, keeping the link field", async () => {
    const jpg = new File(["ÿØ"], "asha.JPG", { type: "image/jpeg" });
    backendRequest.mockResolvedValueOnce(ok(api({ id: 12, name: "Asha", photo: "http://api/media/people/asha.jpg", photo_url: "" })));

    const result = await updateCmsAction("person-profile", "12", form({ name: "Asha", role_title: "Analyst", group: "team", bio: "", photo_url: "", photo: jpg }));

    expect(result).toMatchObject({ ok: true, record: { imageUrl: "http://api/media/people/asha.jpg" } });
    const sent = backendRequest.mock.calls[0][2].form as FormData;
    expect(sent.get("photo")).toBeInstanceOf(File);
    expect(sent.get("photo_url")).toBe("");
  });

  it("removes an uploaded image by sending null, and keeps it when nothing is chosen", async () => {
    backendRequest.mockResolvedValue(ok(api({ id: 12, name: "Asha" })));
    const values = { name: "Asha", role_title: "Analyst", group: "team", bio: "", photo_url: "https://example.org/a.jpg" };

    await updateCmsAction("person-profile", "12", form({ ...values, "photo-remove": "1" }));
    expect(backendRequest.mock.calls[0][2].json).toMatchObject({ photo: null, photo_url: "https://example.org/a.jpg" });

    await updateCmsAction("person-profile", "12", form(values));
    expect("photo" in backendRequest.mock.calls[1][2].json).toBe(false);
  });

  it("rejects images over 5 MB or of a non-image type before contacting the backend", async () => {
    const values = { name: "Asha", role_title: "Analyst", group: "team", bio: "", photo_url: "" };
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.png");
    const pdf = new File(["%PDF"], "cv.pdf");

    expect(await updateCmsAction("person-profile", "12", form({ ...values, photo: big }))).toEqual({ ok: false, message: "That image is larger than 5 MB." });
    expect(await updateCmsAction("person-profile", "12", form({ ...values, photo: pdf }))).toMatchObject({ ok: false, message: expect.stringContaining(".pdf") });
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("rejects a key that is not a plain slug or id", async () => {
    expect(await updateCmsAction("testimonial", "../../admin", testimonialForm())).toEqual({ ok: false, message: "That request isn't valid." });
    expect(backendRequest).not.toHaveBeenCalled();
  });
});

describe("transitionCmsAction / deleteCmsAction", () => {
  it("posts the target status to the object's transition endpoint", async () => {
    backendRequest.mockResolvedValueOnce(ok(api({ id: 9, status: "in_review", slug: "x", quote: "q", attribution: "A" })));

    const result = await transitionCmsAction("testimonial", "9", "in_review");

    expect(result).toMatchObject({ ok: true, record: { status: "in_review" } });
    expect(backendRequest).toHaveBeenCalledWith("POST", "/api/v1/testimonials/9/transition/", { accessToken: "tok", json: { status: "in_review" } });
    // Public pages drop their cached copy, so the change shows on the next page load.
    expect(updateTag).toHaveBeenCalledWith("public-api");
  });

  it("refuses an unknown status or key, and reports a backend refusal", async () => {
    expect(await transitionCmsAction("testimonial", "9", "deleted" as never)).toEqual({ ok: false, message: "That request isn't valid." });
    expect(await transitionCmsAction("testimonial", "9/../1", "draft")).toEqual({ ok: false, message: "That request isn't valid." });
    expect(backendRequest).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();

    backendRequest.mockResolvedValueOnce(bad(403));
    expect(await transitionCmsAction("testimonial", "9", "published")).toEqual({ ok: false, message: "Your role isn't allowed to do that." });
  });

  it("deletes by key and reports success or the backend's refusal", async () => {
    backendRequest.mockResolvedValueOnce(ok(null, 204));
    expect(await deleteCmsAction("project", "3")).toEqual({ ok: true });
    expect(backendRequest).toHaveBeenCalledWith("DELETE", "/api/v1/projects/3/", { accessToken: "tok" });

    backendRequest.mockResolvedValueOnce(bad(403));
    expect(await deleteCmsAction("project", "3")).toMatchObject({ ok: false });
  });
});
