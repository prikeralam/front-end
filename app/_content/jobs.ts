import type { JobListing } from "../_lib/types";

// The two openings PRI is hiring for. Both are rolling: there is no deadline, and
// qualified applicants are hired whenever they apply. Moves to the backend in phase 3.
export const jobs: JobListing[] = [
  {
    slug: "research-associate",
    title: "Research Associate",
    location: "To be confirmed",
    employment: "To be confirmed",
    closes: "Rolling, apply any time",
    description: "Role description to be supplied.",
    responsibilities: ["Responsibility to be supplied.", "Responsibility to be supplied."],
    status: "placeholder",
  },
  {
    slug: "data-analyst",
    title: "Data Analyst",
    location: "To be confirmed",
    employment: "To be confirmed",
    closes: "Rolling, apply any time",
    description: "Role description to be supplied.",
    responsibilities: ["Responsibility to be supplied.", "Responsibility to be supplied."],
    status: "placeholder",
  },
];
