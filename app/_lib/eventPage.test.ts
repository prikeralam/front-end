import { describe, expect, it } from "vitest";
import type { PRIEvent } from "./types";
import { directionsUrl, googleCalendarUrl, initials, moreEvents, paragraphs, splitSpeaker } from "./eventPage";

const base: PRIEvent = {
  slug: "talk",
  kind: "event",
  title: "A talk",
  summary: "First line.\r\n\r\nSecond line.",
  body: "",
  startDate: "2026-12-14",
  endDate: null,
  dateLabel: "14 Dec 2026",
  dateFixed: true,
  timeLabel: "",
  startTime: null,
  endTime: null,
  location: "Thiruvananthapuram",
  mode: "in_person",
  collaborators: [],
  speakers: [],
  focusAreas: [],
  image: null,
  gallery: [],
  timing: "upcoming",
};

const params = (url: string | null) => new URL(url ?? "about:blank").searchParams;

describe("paragraphs", () => {
  it("keeps each non-empty line as a paragraph", () => {
    expect(paragraphs(" One \r\n\r\nTwo\nThree ")).toEqual(["One", "Two", "Three"]);
    expect(paragraphs("")).toEqual([]);
  });
});

describe("splitSpeaker", () => {
  it("separates a trailing parenthesised detail from the name", () => {
    expect(splitSpeaker("Dr. P. Mohammed Ali Galfar (Chairman Emeritus, SAFI)")).toEqual({ name: "Dr. P. Mohammed Ali Galfar", detail: "Chairman Emeritus, SAFI" });
    expect(splitSpeaker("Muhammed Thufail")).toEqual({ name: "Muhammed Thufail", detail: "" });
  });
});

describe("initials", () => {
  it("uses the first and last full words, skipping honorifics and single letters", () => {
    expect(initials("Dr. P. Mohammed Ali Galfar (Chairman Emeritus, SAFI)")).toBe("MG");
    expect(initials("Muhammed Thufail")).toBe("MT");
    expect(initials("P.K. Kunhalikutty")).toBe("K");
    expect(initials("Sayyid Sadiqali Shihab Thangal")).toBe("ST");
    expect(initials("P. M.")).toBe("PM");
    expect(initials("Demographers, development economists and sociologists")).toBe("");
  });
});

describe("directionsUrl", () => {
  it("searches Google Maps for the venue", () => {
    expect(directionsUrl("SAFI College, Vazhayur")).toBe("https://www.google.com/maps/search/?api=1&query=SAFI%20College%2C%20Vazhayur");
  });
});

describe("googleCalendarUrl", () => {
  it("makes a day without a time all-day, with Google's exclusive end date", () => {
    const p = params(googleCalendarUrl(base, "https://priresearch.in/events/talk"));
    expect(p.get("dates")).toBe("20261214/20261215");
    expect(p.get("ctz")).toBe("Asia/Kolkata");
    expect(p.get("details")).toBe("First line.\nSecond line.\n\nhttps://priresearch.in/events/talk");
    expect(p.get("location")).toBe("Thiruvananthapuram");
  });

  it("uses the times as entered, and an hour when there is no end time", () => {
    expect(params(googleCalendarUrl({ ...base, startTime: "09:30", endTime: "17:00" }, "")).get("dates")).toBe("20261214T093000/20261214T170000");
    expect(params(googleCalendarUrl({ ...base, startTime: "23:30" }, "")).get("dates")).toBe("20261214T233000/20261214T235900");
    expect(params(googleCalendarUrl({ ...base, startTime: "10:30" }, "")).get("dates")).toBe("20261214T103000/20261214T113000");
  });

  it("spans multi-day events and offers nothing while the date is only a note", () => {
    expect(params(googleCalendarUrl({ ...base, endDate: "2026-12-16" }, "")).get("dates")).toBe("20261214/20261217");
    expect(googleCalendarUrl({ ...base, dateFixed: false }, "")).toBeNull();
  });
});

describe("moreEvents", () => {
  it("leaves out the current event and lists upcoming soonest first, then past newest first", () => {
    const events = [
      { ...base, slug: "current" },
      { ...base, slug: "past-old", startDate: "2025-01-01", timing: "past" as const },
      { ...base, slug: "later", startDate: "2027-01-01" },
      { ...base, slug: "past-new", startDate: "2025-12-01", timing: "past" as const },
      { ...base, slug: "soon", startDate: "2026-11-01" },
    ];
    expect(moreEvents(events, "current").map((e) => e.slug)).toEqual(["soon", "later", "past-new"]);
  });
});
