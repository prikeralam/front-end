import { describe, expect, it } from "vitest";
import { jobAvailability, todayInIndia, toEvent, toJob } from "./engageAdapter";
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
