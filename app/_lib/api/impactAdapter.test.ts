import { describe, expect, it } from "vitest";
import { toCollection, toMention, toRecognition } from "./impactAdapter";

const workflow = { status: "published" as const, created_by: 1, reviewed_by: null, created_at: "", updated_at: "", published_at: "" };

describe("impact adapters", () => {
  it("maps a mention, with optional links left out when empty", () => {
    const mention = toMention({
      ...workflow,
      id: 1,
      slug: "hindu",
      title: "Plus One seats",
      publisher: "The Hindu",
      url: "https://thehindu.com/a",
      kind: "news",
      date: "2026-09-01",
      summary: "",
      publisher_logo: null,
      publication: "malappuram-classrooms",
      dataset: null,
    });

    expect(mention).toMatchObject({ kind: "news", dateLabel: "1 Sep 2026", publicationSlug: "malappuram-classrooms" });
    expect([mention.summary, mention.logo, mention.datasetSlug]).toEqual([undefined, undefined, undefined]);
  });

  it("files an unknown kind under other", () => {
    const base = { ...workflow, id: 2, slug: "x", title: "X", publisher: "P", url: "https://p", date: "2026-01-01" };
    expect(toMention({ ...base, kind: "podcast" } as never).kind).toBe("other");
  });

  it("maps recognition and collections", () => {
    expect(toRecognition({ ...workflow, id: 3, slug: "g", title: "Grant", awarded_by: "Body", year: 2026, description: "", url: "", image: null })).toEqual({
      slug: "g",
      title: "Grant",
      awardedBy: "Body",
      year: 2026,
      description: undefined,
      url: undefined,
      image: undefined,
    });
    expect(toCollection({ ...workflow, id: 4, slug: "c", title: "C", description: "", datasets: ["a", "b"], publication: null })).toEqual({
      slug: "c",
      title: "C",
      description: "",
      datasetSlugs: ["a", "b"],
      publicationSlug: undefined,
    });
  });
});
