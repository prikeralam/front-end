import { describe, expect, it } from "vitest";
import type { DatasetDetail } from "./datasetTypes";
import {
  absoluteUrl,
  datasetJsonLd,
  eventJsonLd,
  jobPostingJsonLd,
  organizationJsonLd,
  pageMetadata,
  publicationJsonLd,
  serializeJsonLd,
  summarize,
} from "./seo";
import type { Person, PRIEvent, Publication } from "./types";

describe("summarize", () => {
  it("keeps short text and cuts long text on a word, with an ellipsis", () => {
    expect(summarize("  Short   text. ")).toBe("Short text.");
    const long = "word ".repeat(60);
    const cut = summarize(long, 40);
    expect(cut.length).toBeLessThanOrEqual(40);
    expect(cut.endsWith("word…")).toBe(true);
    expect(summarize(undefined)).toBe("");
  });
});

describe("absoluteUrl", () => {
  it("puts site paths on the production domain and leaves full URLs alone", () => {
    expect(absoluteUrl("/data/x")).toBe("https://priresearch.in/data/x");
    expect(absoluteUrl("https://images.unsplash.com/a")).toBe("https://images.unsplash.com/a");
  });
});

describe("pageMetadata", () => {
  it("sets the title, a trimmed description, a canonical address and share cards", () => {
    const meta = pageMetadata({ title: "Careers", description: "Open roles.", path: "/careers" });
    expect(meta.title).toBe("Careers");
    expect(meta.description).toBe("Open roles.");
    expect(meta.alternates).toEqual({ canonical: "/careers" });
    expect(meta.openGraph).toMatchObject({ url: "/careers", siteName: "Policy and Research Initiative", images: ["https://priresearch.in/og"] });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
    expect(meta.robots).toBeUndefined();
  });

  it("uses a record's own image, falls back to the site description, and can keep a page out of search", () => {
    const meta = pageMetadata({ title: "Asha", path: "/people/asha", image: "/people/team/asha.jpg", noindex: true });
    expect(meta.openGraph).toMatchObject({ images: ["https://priresearch.in/people/team/asha.jpg"] });
    expect(String(meta.description)).toContain("Policy and Research Initiative");
    expect(meta.robots).toEqual({ index: false, follow: false });
  });
});

describe("structured data", () => {
  it("describes PRI with its short name, address and social profiles", () => {
    const org = organizationJsonLd();
    expect(org).toMatchObject({ "@type": "ResearchOrganization", name: "Policy and Research Initiative", alternateName: "PRI", url: "https://priresearch.in" });
    expect(org.sameAs).toContain("https://www.instagram.com/priresearch");
  });

  it("marks a data story as an article by its authors, and a report as a Report", () => {
    const pub: Publication = {
      slug: "plus-one-seats",
      title: "Plus One seats",
      abstract: "Seats by district.",
      format: "Data Story",
      theme: "Education",
      date: "2026-03-01",
      authors: ["asha"],
      language: "English",
      views: 0,
      status: "real",
      cover: null,
    };
    const author = { slug: "asha", name: "Asha" } as Person;
    expect(publicationJsonLd(pub, [author])).toMatchObject({
      "@type": "ScholarlyArticle",
      datePublished: "2026-03-01",
      url: "https://priresearch.in/research/plus-one-seats",
      author: [{ "@type": "Person", name: "Asha", url: "https://priresearch.in/people/asha" }],
    });
    expect(publicationJsonLd({ ...pub, format: "Report" }, [])).toMatchObject({ "@type": "Report", author: { "@type": "Organization" } });
  });

  it("describes a dataset for Google Dataset Search without exposing download links", () => {
    const ds = {
      slug: "plus-one",
      title: "Plus One batches",
      description: "Batches by district.",
      visibility: "public",
      accessState: "full",
      theme: "Education",
      geography: "Kerala",
      timePeriod: "2025",
      updatedAt: "2026-09-01T00:00:00Z",
      fileFormat: "CSV",
      formats: ["CSV", "JSON"],
      columns: ["district", "batches"],
      tags: ["schools"],
      files: [{ label: "CSV", format: "CSV", path: "https://bucket.example/signed?x=1" }],
    } as DatasetDetail;
    const data = datasetJsonLd(ds);
    expect(data).toMatchObject({
      "@type": "Dataset",
      name: "Plus One batches",
      isAccessibleForFree: true,
      temporalCoverage: "2025",
      spatialCoverage: { "@type": "Place", name: "Kerala" },
      keywords: ["Education", "schools"],
      variableMeasured: ["district", "batches"],
    });
    expect(JSON.stringify(data)).not.toContain("bucket.example");
  });

  it("gives events their dates and jobs a posting date", () => {
    const event: PRIEvent = {
      slug: "launch",
      title: "Launch",
      summary: "",
      body: "",
      startDate: "2026-11-01",
      endDate: null,
      startTime: null,
      endTime: null,
      timeLabel: "",
      location: "",
      mode: null,
      collaborators: [],
      speakers: [],
      focusAreas: [],
      image: null,
      gallery: [],
      kind: "event",
      dateLabel: "",
      dateFixed: true,
      timing: "upcoming",
    };
    expect(eventJsonLd(event)).toMatchObject({ "@type": "Event", startDate: "2026-11-01", url: "https://priresearch.in/events/launch" });
    const conclave = eventJsonLd({
      ...event,
      startTime: "09:30",
      endTime: "17:00",
      mode: "hybrid",
      location: "Thiruvananthapuram",
      speakers: [{ role: "Lead speaker", name: "Muhammed Thufail" }],
      collaborators: ["SAFI Institutions"],
    });
    expect(conclave).toMatchObject({
      startDate: "2026-11-01T09:30:00+05:30",
      endDate: "2026-11-01T17:00:00+05:30",
      eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
      performer: [{ "@type": "Person", name: "Muhammed Thufail" }],
    });
    expect((conclave.organizer as { name: string }[]).map((o) => o.name)).toEqual(["Policy and Research Initiative", "SAFI Institutions"]);
    expect(eventJsonLd({ ...event, mode: "online" }).location).toMatchObject({ "@type": "VirtualLocation" });
    const job = { slug: "data-analyst", title: "Data Analyst", summary: "", description: "", location: "", employment: "", rolling: true, deadline: null };
    expect(jobPostingJsonLd(job, "2026-10-08")).toMatchObject({ "@type": "JobPosting", datePosted: "2026-10-08", hiringOrganization: { name: "Policy and Research Initiative" } });
  });

  it("escapes < so stored text can't close the script tag", () => {
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});
