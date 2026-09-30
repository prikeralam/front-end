import { describe, expect, it } from "vitest";
import { REMOVE_IMAGE, RESOURCES, belongsToType, objectPath, slugify, toCmsRecord, toPayload, type ApiRecord } from "./resources";

const base = { id: 7, status: "draft" as const, created_by: 3, updated_at: "2026-09-25T10:00:00Z" };

describe("slugify", () => {
  it("lowercases, strips accents and punctuation, and dashes the rest", () => {
    expect(slugify("Annual Report 2025–26!")).toBe("annual-report-2025-26");
    expect(slugify("Café Ünïcode")).toBe("cafe-unicode");
  });

  it("caps the length, trims dashes, and never returns an empty slug", () => {
    expect(slugify("a".repeat(80))).toHaveLength(40);
    expect(slugify("word ".repeat(20)).endsWith("-")).toBe(false);
    expect(slugify("---")).toBe("item");
    expect(slugify("")).toBe("item");
  });
});

describe("toPayload", () => {
  it("builds a content-block create payload with the slug the user typed", () => {
    const result = toPayload("content-block", { slug: "our-mission", title: "Our mission", body: "Text", seo_title: "", seo_description: "" }, "create");

    expect(result).toEqual({ ok: true, payload: { slug: "our-mission", title: "Our mission", body: "Text", seo_title: "", seo_description: "" } });
  });

  it("never sends a create-only field (the slug) on update", () => {
    const result = toPayload("content-block", { slug: "changed", title: "T", body: "B", seo_title: "", seo_description: "" }, "update");

    expect(result.ok && "slug" in result.payload).toBe(false);
  });

  it("generates a slug from the attribution for a testimonial, with an optional collision suffix", () => {
    const values = { quote: "Great work", attribution: "Dr. A. Kumar", role: "" };

    expect(toPayload("testimonial", values, "create")).toMatchObject({ ok: true, payload: { slug: "dr-a-kumar" } });
    expect(toPayload("testimonial", values, "create", "-x1y2")).toMatchObject({ payload: { slug: "dr-a-kumar-x1y2" } });
  });

  it("adds the fixed partner group and leaves people alone", () => {
    const values = { name: "HADIA", role_title: "Partner institution", bio: "", photo_url: "" };

    expect(toPayload("partner", values, "create")).toMatchObject({ payload: { group: "partner", slug: "hadia" } });
    expect(toPayload("person-profile", { name: "A", role_title: "Analyst", group: "team", bio: "", photo_url: "" }, "create")).toMatchObject({ payload: { group: "team" } });
  });

  it("converts numbers, treats a blank optional number as null, and skips the file field", () => {
    const values = { title: "AR", document_type: "annual-report", year: "2026", description: "" };
    expect(toPayload("document", values, "create")).toMatchObject({ payload: { year: 2026, slug: "ar-2026" } });

    const blank = toPayload("document", { ...values, year: "" }, "create");
    expect(blank).toMatchObject({ ok: true, payload: { year: null } });
    expect(blank.ok && "file" in blank.payload).toBe(false);
  });

  it("maps a publication's author to a list, tags to an array and the sub-theme to a number", () => {
    const result = toPayload(
      "publication",
      { title: "Study", abstract: "A", format: "report", sub_theme: "12", language: "en", date: "2026-03-01", authors: "38", tags: "Health, Data ,", visibility: "public" },
      "create",
    );

    expect(result).toMatchObject({ ok: true, payload: { sub_theme: 12, authors: [38], tags: ["Health", "Data"], slug: "study" } });
  });

  it("clears optional list fields when blank", () => {
    const result = toPayload("publication", { title: "S", abstract: "A", format: "report", sub_theme: "12", language: "en", date: "2026-03-01", authors: "", tags: "", visibility: "public" }, "update");

    expect(result).toMatchObject({ ok: true, payload: { authors: [], tags: [] } });
  });

  it("rejects a missing required field and a non-integer number, naming the field", () => {
    expect(toPayload("project", { slug: "p", title: "", blurb: "b", image_url: "", cta_label: "", cta_href: "" }, "create")).toEqual({ ok: false, message: "Title is required." });
    expect(toPayload("document", { title: "T", document_type: "issue", year: "20x6", description: "" }, "create")).toEqual({ ok: false, message: "Year must be a whole number." });
  });
});

describe("toCmsRecord", () => {
  it("addresses slug-lookup types by slug and the rest by id", () => {
    expect(toCmsRecord("content-block", { ...base, slug: "hero", title: "Hero", body: "b" } as ApiRecord).key).toBe("hero");
    expect(toCmsRecord("testimonial", { ...base, slug: "x", quote: "q", attribution: "A" } as ApiRecord).key).toBe("7");
  });

  it("maps API fields to form values: first author id, tags joined, nulls blank, file kept out of values", () => {
    const record = toCmsRecord("publication", {
      ...base,
      slug: "study",
      title: "Study",
      abstract: "A",
      format: "data_story",
      sub_theme: 12,
      language: "ml",
      date: "2026-03-01",
      authors: [38, 40],
      tags: ["Health", "Data"],
      visibility: "public",
    } as ApiRecord);

    expect(record).toMatchObject({
      key: "study",
      status: "draft",
      createdBy: 3,
      title: "Study",
      values: { authors: "38", tags: "Health, Data", sub_theme: "12", format: "data_story" },
    });
    expect(record.subtitle).toBe("data story · 2026-03-01");
  });

  it("exposes a document's file URL separately and blanks a null year", () => {
    const record = toCmsRecord("document", { ...base, slug: "ar", title: "AR", file: "http://api/media/ar.pdf", document_type: "annual-report", year: null } as ApiRecord);

    expect(record.fileUrl).toBe("http://api/media/ar.pdf");
    expect(record.values.file).toBe("");
    expect(record.values.year).toBe("");
  });
});

describe("image fields", () => {
  it("shows the uploaded photo first, else the link, else nothing", () => {
    const person = { ...base, name: "Asha", role_title: "Analyst", group: "team" };

    expect(toCmsRecord("person-profile", { ...person, photo: "http://api/media/a.jpg", photo_url: "https://x/a.jpg" } as ApiRecord).imageUrl).toBe("http://api/media/a.jpg");
    expect(toCmsRecord("person-profile", { ...person, photo: null, photo_url: "https://x/a.jpg" } as ApiRecord)).toMatchObject({ imageUrl: "https://x/a.jpg", values: { photo: "", photo_url: "https://x/a.jpg" } });
    expect(toCmsRecord("person-profile", { ...person, photo: null, photo_url: "" } as ApiRecord).imageUrl).toBeUndefined();
  });

  it("sends the link, never the upload's URL, and null only when removal was asked for", () => {
    const values = { name: "A", role_title: "Analyst", group: "team", bio: "", photo: "http://api/media/a.jpg", photo_url: " https://x/a.jpg " };

    const kept = toPayload("person-profile", values, "update");
    expect(kept).toMatchObject({ ok: true, payload: { photo_url: "https://x/a.jpg" } });
    expect(kept.ok && "photo" in kept.payload).toBe(false);
    expect(toPayload("person-profile", { ...values, photo: REMOVE_IMAGE }, "update")).toMatchObject({ payload: { photo: null } });
  });

  it("gives people, partners, projects, publications, mentions and recognition an image field", () => {
    const withImages = Object.entries(RESOURCES).filter(([, r]) => r.fields.some((f) => f.kind === "image")).map(([type]) => type);

    expect(withImages.sort()).toEqual(["mention", "partner", "person-profile", "project", "publication", "recognition"]);
  });
});

describe("phase D types", () => {
  it("links a mention to a publication or dataset by slug, and clears an empty choice", () => {
    const values = { title: "Seats", publisher: "The Hindu", url: "https://x", kind: "news", date: "2026-09-01", summary: "", publisher_logo: "", publication: "healthcare-gap", dataset: "" };

    expect(toPayload("mention", values, "create")).toMatchObject({
      ok: true,
      payload: { publication: "healthcare-gap", dataset: null, slug: "the-hindu-seats" },
    });
  });

  it("sends a collection's datasets as a list of slugs, empty when none are ticked", () => {
    expect(toPayload("collection", { title: "Plus One", description: "", datasets: "a, b ,", publication: "" }, "create")).toMatchObject({
      payload: { datasets: ["a", "b"], publication: null, slug: "plus-one" },
    });
    expect(toPayload("collection", { title: "T", description: "", datasets: "", publication: "" }, "update")).toMatchObject({ payload: { datasets: [] } });
  });

  it("reads a collection's datasets back as form values and counts them in the subtitle", () => {
    const record = toCmsRecord("collection", { ...base, slug: "plus-one", title: "Plus One", description: "", datasets: ["a", "b"], publication: null } as ApiRecord);
    expect(record).toMatchObject({ key: "plus-one", values: { datasets: "a, b", publication: "" }, subtitle: "2 datasets" });
  });
});

describe("belongsToType / objectPath", () => {
  it("splits the shared people endpoint into people and partners", () => {
    const partner = { ...base, group: "partner" } as ApiRecord;
    const person = { ...base, group: "team" } as ApiRecord;

    expect(belongsToType("partner", partner)).toBe(true);
    expect(belongsToType("partner", person)).toBe(false);
    expect(belongsToType("person-profile", person)).toBe(true);
    expect(belongsToType("person-profile", partner)).toBe(false);
    expect(belongsToType("project", person)).toBe(true);
  });

  it("builds object addresses", () => {
    expect(objectPath("person-profile", "12")).toBe("/api/v1/people/12/");
    expect(objectPath("publication", "study")).toBe("/api/v1/publications/study/");
  });

  it("gives every resource fields, and exactly the file types carry a file field", () => {
    const withFiles = Object.entries(RESOURCES).filter(([, r]) => r.fields.some((f) => f.kind === "file")).map(([type]) => type);

    expect(withFiles.sort()).toEqual(["dataset", "document"]);
  });
});
