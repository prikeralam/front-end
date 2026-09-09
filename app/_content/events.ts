import type { PRIEvent } from "../_lib/types";

export const eventTypes = ["Webinar", "Launch", "Workshop", "Advocacy Day", "Roundtable"];

// PLACEHOLDER — no events scheduled or archived yet. Descriptions draw on PRI's
// stated seminar/workshop functions from the previous site.
export const events: PRIEvent[] = [
  {
    slug: "policy-roundtable",
    title: "Policy roundtable with stakeholders",
    description: "Creating platforms to share research, address problems, and collaboratively build solutions.",
    type: "Roundtable",
    date: "To be confirmed",
    time: "To be confirmed",
    venue: "To be confirmed",
    timing: "upcoming",
    status: "placeholder",
    image: { label: "Event hero photograph — Policy roundtable", ratio: "16:9", kind: "photo", src: "/gallery/policy-roundtable-1.jpg" },
  },
  {
    slug: "capacity-building-workshop",
    title: "Capacity-building workshop",
    description: "Capacity-building workshops for community leaders and policymakers.",
    type: "Workshop",
    date: "To be confirmed",
    time: "To be confirmed",
    venue: "To be confirmed",
    timing: "upcoming",
    status: "placeholder",
    image: { label: "Event hero photograph — Capacity-building workshop", ratio: "16:9", kind: "photo", src: "/gallery/capacity-building-workshop-1.jpg" },
  },
  {
    slug: "research-launch",
    title: "Research launch",
    description: "Description to be supplied.",
    type: "Launch",
    date: "To be confirmed",
    time: "To be confirmed",
    venue: "To be confirmed",
    timing: "upcoming",
    status: "placeholder",
    image: { label: "Event hero photograph — Research launch", ratio: "16:9", kind: "photo", src: "/gallery/research-launch-meeting-1.jpg" },
  },
  {
    slug: "past-seminar",
    title: "Seminar: translating research into policy action",
    description: "Description to be supplied.",
    type: "Webinar",
    date: "To be confirmed",
    time: "To be confirmed",
    venue: "To be confirmed",
    timing: "past",
    status: "placeholder",
    image: { label: "Event photograph — Seminar on translating research into policy", ratio: "16:9", kind: "photo", src: "/gallery/seminar-audience-1.jpg" },
  },
  {
    slug: "past-advocacy-day",
    title: "Advocacy day",
    description: "Description to be supplied.",
    type: "Advocacy Day",
    date: "To be confirmed",
    time: "To be confirmed",
    venue: "To be confirmed",
    timing: "past",
    status: "placeholder",
    image: { label: "Event photograph — Advocacy day", ratio: "16:9", kind: "photo", src: "/gallery/advocacy-day-delegation-1.jpg" },
  },
];

export const upcomingEvents = events.filter((e) => e.timing === "upcoming");
export const pastEvents = events.filter((e) => e.timing === "past");

/** Archive materials each past event needs — none of which exist yet. */
export const pastEventArchive = {
  recording: { label: "Event recording", ratio: "16:9", kind: "video" as const },
  gallery: { label: "Event photo gallery", ratio: "3:2", kind: "photo" as const },
  report: { title: "Event report", kind: "PDF", status: "placeholder" as const },
};
