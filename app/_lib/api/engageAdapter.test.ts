import { describe, expect, it } from "vitest";
import { formatTime, jobAvailability, splitLabelled, timeRange, todayInIndia, toEvent, toJob } from "./engageAdapter";
import type { components } from "./schema";

const workflow = {
  id: 1,
  status: "published" as const,
  created_by: 1,
  reviewed_by: null,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
  published_at: "2026-09-01T00:00:00Z",
};

const event: components["schemas"]["Event"] = {
  ...workflow,
  slug: "roundtable",
  kind: "event",
  title: "Policy roundtable",
  summary: "Researchers and officials.",
  body: "",
  start_date: "2026-11-01",
  end_date: null,
  location: "Malappuram",
  image_url: "",
  image: null,
  registration_url: "https://forms.example/register",
  images: [],
};

describe("toEvent", () => {
  it("maps an event and formats its date", () => {
    expect(toEvent(event, "2026-10-08")).toMatchObject({
      slug: "roundtable",
      kind: "event",
      dateLabel: "1 Nov 2026",
      location: "Malappuram",
      image: null,
      registrationUrl: "https://forms.example/register",
      timing: "upcoming",
    });
  });

  it("is past once its day is over, but a campaign stays upcoming until its end date", () => {
    expect(toEvent(event, "2026-11-01").timing).toBe("upcoming");
    expect(toEvent(event, "2026-11-02").timing).toBe("past");
    const campaign = toEvent({ ...event, kind: "campaign", end_date: "2026-12-31" }, "2026-12-01");
    expect([campaign.kind, campaign.timing, campaign.dateLabel]).toEqual(["campaign", "upcoming", "1 Nov 2026 to 31 Dec 2026"]);
  });

  it("prefers an uploaded image and drops a registration link that isn't https", () => {
    const mapped = toEvent({ ...event, image: "https://bucket.example/e.jpg", image_url: "https://cdn.example/e.jpg", registration_url: "javascript:alert(1)" }, "2026-10-08");
    expect(mapped.image?.src).toBe("https://bucket.example/e.jpg");
    expect(mapped.registrationUrl).toBeUndefined();
  });
});

describe("event details", () => {
  it("reads the times, mode, lists and gallery, and shows the date note instead of an unfixed date", () => {
    const mapped = toEvent(
      {
        ...event,
        start_date: "2026-12-14",
        date_note: "December 2026 (3rd or 4th week)",
        start_time: "09:30:00",
        end_time: "17:00:00",
        mode: "hybrid",
        collaborators: ["SAFI Institutions"],
        speakers: ["Closing remarks: P.K. Kunhalikutty (Minister for Industries & AI, Kerala State)", "PRI Research Team"],
        focus_areas: ["Data-driven governance: “Good Governance: Current Dynamics”", "Ethical data systems"],
        images: [
          { id: 1, image: "https://bucket.example/g1.jpg", caption: "Opening session" },
          { id: 2, image: "https://bucket.example/g2.jpg", caption: "" },
        ],
      },
      "2026-10-12",
    );
    expect(mapped).toMatchObject({
      dateLabel: "December 2026 (3rd or 4th week)",
      timeLabel: "9:30 AM - 5:00 PM",
      startTime: "09:30",
      mode: "hybrid",
      collaborators: ["SAFI Institutions"],
      timing: "upcoming",
    });
    expect(mapped.speakers).toEqual([
      { role: "Closing remarks", name: "P.K. Kunhalikutty (Minister for Industries & AI, Kerala State)" },
      { role: "", name: "PRI Research Team" },
    ]);
    // Only the first ": " splits, so a heading can introduce text that has its own colon.
    expect(mapped.focusAreas).toEqual([
      { heading: "Data-driven governance", text: "“Good Governance: Current Dynamics”" },
      { text: "Ethical data systems" },
    ]);
    expect(mapped.gallery.map((g) => [g.src, g.label])).toEqual([
      ["https://bucket.example/g1.jpg", "Opening session"],
      ["https://bucket.example/g2.jpg", "Policy roundtable, photo 2"],
    ]);
  });

  it("leaves everything empty for an event without details", () => {
    const mapped = toEvent(event, "2026-10-12");
    expect([mapped.timeLabel, mapped.mode, mapped.speakers, mapped.focusAreas, mapped.collaborators, mapped.gallery]).toEqual(["", null, [], [], [], []]);
  });
});

describe("time helpers", () => {
  it("formats 24-hour API times as 12-hour clock times", () => {
    expect([formatTime("00:05:00"), formatTime("11:00:00"), formatTime("12:30"), formatTime("23:59:00")]).toEqual(["12:05 AM", "11:00 AM", "12:30 PM", "11:59 PM"]);
    expect([formatTime(null), formatTime("noon"), formatTime("25:00")]).toEqual([null, null, null]);
    expect([timeRange("08:00:00", "14:00:00"), timeRange("10:30:00", null), timeRange(null, "14:00:00")]).toEqual(["8:00 AM - 2:00 PM", "10:30 AM", ""]);
  });

  it("splits labelled lines on the first colon only", () => {
    expect(splitLabelled("Speaker: Dr. A: B")).toEqual({ label: "Speaker", text: "Dr. A: B" });
    expect(splitLabelled("No label here")).toEqual({ label: "", text: "No label here" });
    expect(splitLabelled("Time 10:30 AM")).toEqual({ label: "", text: "Time 10:30 AM" });
  });
});

describe("todayInIndia", () => {
  it("rolls over at midnight in India, not UTC", () => {
    expect(todayInIndia(new Date("2026-10-08T18:00:00Z"))).toBe("2026-10-08");
    expect(todayInIndia(new Date("2026-10-08T18:31:00Z"))).toBe("2026-10-09");
  });
});

describe("toJob", () => {
  const job: components["schemas"]["JobOpening"] = { ...workflow, slug: "data-analyst", title: "Data Analyst", rolling: true, deadline: "2026-12-01" };

  it("treats a rolling role as open any time, whatever its deadline", () => {
    const mapped = toJob(job);
    expect([mapped.rolling, mapped.deadline, jobAvailability(mapped)]).toEqual([true, null, "Rolling, apply any time"]);
  });

  it("shows the deadline of a role that isn't rolling", () => {
    expect(jobAvailability(toJob({ ...job, rolling: false }))).toBe("Apply by 1 Dec 2026");
  });
});
