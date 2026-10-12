import { describe, expect, it } from "vitest";
import type { components } from "./schema";
import { toDocument, toProject } from "./contentAdapters";

const base = {
  id: 1,
  status: "published" as const,
  created_by: 1,
  reviewed_by: null,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
};

describe("toProject", () => {
  const project: components["schemas"]["Project"] = {
    ...base,
    slug: "education",
    title: "Education",
    blurb: "Access and outcomes.",
    image_url: "https://images.unsplash.com/photo-1",
    cta_label: "Explore project",
    cta_href: "/projects/education",
  };

  it("maps a project onto HeroProject", () => {
    expect(toProject(project)).toMatchObject({
      slug: "education",
      title: "Education",
      blurb: "Access and outcomes.",
      status: "real",
      image: { ratio: "3:2", kind: "photo", src: "https://images.unsplash.com/photo-1" },
      ctaLabel: "Explore project",
      ctaHref: "/projects/education",
    });
  });

  it("splits facts into label and text, and defaults both new fields for an older backend", () => {
    const mapped = toProject({ ...project, facts: ["Project duration: Nov 2025 - Feb 2026", "Unlabelled"], details: "## A" });
    expect(mapped.facts).toEqual([
      { label: "Project duration", text: "Nov 2025 - Feb 2026" },
      { label: "", text: "Unlabelled" },
    ]);
    expect(mapped.details).toBe("## A");
    expect(toProject(project)).toMatchObject({ facts: [], details: "" });
  });

  it("carries the project's stage, defaulting to ongoing for a backend without it", () => {
    expect(toProject({ ...project, stage: "completed" }).stage).toBe("completed");
    expect(toProject(project).stage).toBe("ongoing");
  });

  it("leaves image src and cta unset when the backend sends empty strings", () => {
    const mapped = toProject({ ...project, image_url: "", cta_label: "", cta_href: "" });

    expect(mapped.image.src).toBeUndefined();
    expect(mapped.ctaLabel).toBeUndefined();
    expect(mapped.ctaHref).toBeUndefined();
  });
});

describe("toDocument", () => {
  const document: components["schemas"]["Document"] = {
    ...base,
    slug: "annual-report-2025-26",
    title: "Annual Report 2025–26",
    file: "https://cdn.example.org/ar.pdf",
    document_type: "annual-report",
    year: 2026,
  };

  it("maps a document, humanizing its type and linking its file", () => {
    expect(toDocument(document)).toEqual({
      title: "Annual Report 2025–26",
      kind: "Annual Report",
      year: "2026",
      status: "real",
      href: "https://cdn.example.org/ar.pdf",
    });
  });

  it("omits the year when there is none and falls back to a generic kind", () => {
    const mapped = toDocument({ ...document, year: null, document_type: "" });

    expect(mapped.year).toBeUndefined();
    expect(mapped.kind).toBe("Document");
  });
});
