import { describe, expect, it } from "vitest";
import type { PRIEvent, Publication } from "../types";
import { heroSlides, orderEvents } from "./heroSlides";

const hero = { title: "Data-driven research. Evidence-based policy.", blurb: "Strategy and collaboration." };

function event(slug: string, timing: PRIEvent["timing"], overrides: Partial<PRIEvent> = {}): PRIEvent {
  return {
    slug, kind: "event", title: slug, summary: `About ${slug}`, body: "", startDate: "2026-01-01", endDate: null, dateLabel: "1 Jan 2026", dateFixed: true,
    timeLabel: "", startTime: null, endTime: null, location: "Malappuram", mode: null, collaborators: [], speakers: [], focusAreas: [], image: null, gallery: [],
    timing, ...overrides,
  };
}

const story: Publication = {
  slug: "districts", title: "Why Kerala Needs to Reorganize Its Districts", abstract: "A data story.", format: "Data Story", theme: "Governance",
  date: "2026-10-13", authors: [], language: "English", views: 0, status: "real", cover: null,
};

describe("orderEvents", () => {
  it("puts upcoming events first, soonest first, then past ones newest first", () => {
    const newestFirst = [event("far", "upcoming"), event("soon", "upcoming"), event("last-week", "past"), event("last-year", "past")];
    expect(orderEvents(newestFirst).map((e) => e.slug)).toEqual(["soon", "far", "last-week", "last-year"]);
  });
});

describe("heroSlides", () => {
  it("builds the motto, the newest publication and the next event, each with its own photo", () => {
    const slides = heroSlides({ hero, publications: [story], events: [event("past-one", "past"), event("conclave", "upcoming")].reverse() });
    expect(slides.map((s) => s.id)).toEqual(["mission", "research", "events"]);
    expect(slides[0]).toMatchObject({ title: hero.title, text: hero.blurb, cta: { href: "/research" } });
    expect(slides[1]).toMatchObject({ eyebrow: "Latest data story", title: story.title, cta: { label: "Read the data story", href: "/research/districts" } });
    expect(slides[2]).toMatchObject({ eyebrow: "Upcoming event", cta: { href: "/events/conclave" }, meta: "1 Jan 2026 · Malappuram" });
    expect(new Set(slides.map((s) => s.photo.src)).size).toBe(3);
  });

  it("falls back to the most recent past event when nothing is upcoming", () => {
    const slides = heroSlides({ hero, publications: [], events: [event("recent", "past", { location: "" }), event("older", "past")] });
    expect(slides[2]).toMatchObject({ eyebrow: "Recent event", cta: { href: "/events/recent" }, meta: "1 Jan 2026" });
  });

  it("still gives three slides when there is no research and no events", () => {
    const slides = heroSlides({ hero, publications: [], events: [] });
    expect(slides).toHaveLength(3);
    expect(slides[1].cta.href).toBe("/research");
    expect(slides[2].cta.href).toBe("/events");
  });
});
