import type { Dataset } from "../_lib/types";

// Datasets shown directly from files PRI has supplied under /public/datasets —
// a stand-in for Module C's real backend/API (see docs/PRDs/backend/
// C-data-repository-dashboard-integration.md's 2026-09-19 amendment). Same
// "hand-authored content, not yet backed by a real module" pattern as
// app/_content/dashboards.ts and mockAuth.ts's other mock stores. Swap this
// for a live fetch from pri-backend's datasets API once that exists.
export const datasets: Dataset[] = [
  {
    slug: "sametham-school-directory",
    title: "Sametham School Directory — Kerala",
    description:
      "School-level administrative data for Kerala's general education sector, sourced from KITE's Sametham platform: school profile and contact details, enrolment by class/medium/gender, campus facilities and infrastructure, and staff rosters.",
    theme: "Education",
    geography: "Kerala",
    year: "2025",
    type: "Administrative",
    visibility: "public",
    source: "KITE (Kerala Infrastructure and Technology for Education) — Sametham platform",
    coverage: "General-education schools registered on Sametham",
    frequency: "Annual",
    lastUpdated: "2025",
    status: "real",
    preview: null,
    tags: ["education", "schools", "kerala", "kite", "sametham"],
    fileFormat: "CSV",
    files: [
      { label: "School profile", path: "/datasets/sametham/profile.csv" },
      { label: "Schools master directory", path: "/datasets/sametham/schools_master.csv" },
      { label: "Enrolment", path: "/datasets/sametham/enrolment.csv" },
      { label: "Facility & infrastructure", path: "/datasets/sametham/facility.csv" },
      { label: "Staff roster", path: "/datasets/sametham/staff.csv" },
    ],
  },
];
