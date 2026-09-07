import type { Dataset, Dashboard } from "../_lib/types";

export const datasetThemes = ["Education", "Health", "Public Finance", "Employment", "Demography"];
export const datasetGeographies = ["National", "Kerala", "District-level", "Panchayat-level"];
export const datasetYears = ["2026", "2025", "2024", "2023"];

// PLACEHOLDER — no datasets have been supplied. Shapes follow the spec's
// metadata requirements (source, coverage, update frequency, visibility tier).
export const datasets: Dataset[] = [
  {
    slug: "school-coverage",
    title: "School coverage and enrolment",
    description: "Enrolment, infrastructure, and access indicators by district.",
    theme: "Education",
    geography: "District-level",
    year: "2025",
    type: "Administrative",
    visibility: "public",
    source: "To be confirmed",
    coverage: "To be confirmed",
    frequency: "To be confirmed",
    status: "placeholder",
    preview: { label: "School coverage choropleth map", ratio: "4:3", kind: "map" },
  },
  {
    slug: "health-expenditure-panel",
    title: "Health expenditure panel",
    description: "Public health spending by state across successive budget years.",
    theme: "Health",
    geography: "National",
    year: "2025",
    type: "Panel",
    visibility: "public",
    source: "To be confirmed",
    coverage: "To be confirmed",
    frequency: "To be confirmed",
    status: "placeholder",
    preview: null,
  },
  {
    slug: "budget-expenditure",
    title: "Budget allocation and expenditure",
    description: "Allocation versus actual expenditure across departments and schemes.",
    theme: "Public Finance",
    geography: "Kerala",
    year: "2026",
    type: "Administrative",
    visibility: "on-request",
    source: "To be confirmed",
    coverage: "To be confirmed",
    frequency: "To be confirmed",
    status: "placeholder",
    preview: null,
  },
  {
    slug: "employment-survey",
    title: "Occupational and employment survey",
    description: "Employment patterns, skill levels, and occupational mobility.",
    theme: "Employment",
    geography: "District-level",
    year: "2024",
    type: "Survey",
    visibility: "on-request",
    source: "To be confirmed",
    coverage: "To be confirmed",
    frequency: "To be confirmed",
    status: "placeholder",
    preview: null,
  },
  {
    slug: "migration-remittances",
    title: "Migration and remittances",
    description: "Out-migration, destination patterns, and remittance flows.",
    theme: "Demography",
    geography: "Kerala",
    year: "2024",
    type: "Survey",
    visibility: "internal",
    source: "To be confirmed",
    coverage: "To be confirmed",
    frequency: "To be confirmed",
    status: "placeholder",
    preview: null,
  },
];

// PLACEHOLDER — embedded dashboards (Datawrapper / Tableau / D3) not built yet.
export const dashboards: Dashboard[] = [
  {
    slug: "education-access-dashboard",
    title: "Education access dashboard",
    description: "Interactive view of enrolment and infrastructure indicators by district.",
    theme: "Education",
    status: "placeholder",
    embed: { label: "Embedded dashboard (Datawrapper / Tableau)", ratio: "16:9", kind: "chart" },
  },
  {
    slug: "public-finance-dashboard",
    title: "Public finance dashboard",
    description: "Budget allocation against expenditure, filterable by department.",
    theme: "Public Finance",
    status: "placeholder",
    embed: { label: "Embedded dashboard (Datawrapper / Tableau)", ratio: "16:9", kind: "chart" },
  },
];
