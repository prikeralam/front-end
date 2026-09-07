import type { JobListing, PRIDocument } from "../_lib/types";

// PLACEHOLDER — no open roles supplied.
export const jobs: JobListing[] = [
  {
    slug: "research-associate",
    title: "Research Associate",
    location: "To be confirmed",
    employment: "To be confirmed",
    closes: "To be confirmed",
    description: "Role description to be supplied.",
    responsibilities: ["Responsibility to be supplied.", "Responsibility to be supplied."],
    status: "placeholder",
  },
  {
    slug: "data-analyst",
    title: "Data Analyst",
    location: "To be confirmed",
    employment: "To be confirmed",
    closes: "To be confirmed",
    description: "Role description to be supplied.",
    responsibilities: ["Responsibility to be supplied.", "Responsibility to be supplied."],
    status: "placeholder",
  },
  {
    slug: "communications-officer",
    title: "Communications Officer",
    location: "To be confirmed",
    employment: "To be confirmed",
    closes: "To be confirmed",
    description: "Role description to be supplied.",
    responsibilities: ["Responsibility to be supplied.", "Responsibility to be supplied."],
    status: "placeholder",
  },
];

export const involvementPaths = [
  { title: "Volunteer", desc: "Support PRI's research, outreach, and community engagement work." },
  { title: "Intern", desc: "Short-term placements across PRI's five research departments." },
  { title: "Open roles", desc: "Current recruitment across research, data, and communications." },
  { title: "Mailing list", desc: "Research updates, or media briefings for journalists." },
];

// PLACEHOLDER — no newsletter issues published yet.
export const newsletterIssues: PRIDocument[] = [
  { title: "Newsletter — issue to be published", kind: "Issue", year: "2026", status: "placeholder" },
  { title: "Newsletter — issue to be published", kind: "Issue", year: "2026", status: "placeholder" },
  { title: "Newsletter — issue to be published", kind: "Issue", year: "2025", status: "placeholder" },
];

export const contactCategories = ["Research", "Media", "General"];

export const officeMap = {
  label: "Live map embed — office location",
  ratio: "16:9",
  kind: "map" as const,
};
