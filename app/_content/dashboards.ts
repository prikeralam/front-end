import type { Dashboard } from "../_lib/types";

// Filter option lists shared by the datasets search UI and dashboards below —
// datasets themselves are now served live from CKAN (see app/_lib/datasetsService.ts),
// but these UI option lists still live here since CKAN has no endpoint to
// enumerate "all possible filter values" independent of a search.
export const datasetThemes = ["Education", "Health", "Public Finance", "Employment", "Demography"];
export const datasetGeographies = ["National", "Kerala", "District-level", "Panchayat-level"];
export const datasetYears = ["2026", "2025", "2024", "2023"];
export const datasetFormats = ["CSV", "Parquet", "ZIP"];

// PLACEHOLDER — embedded dashboards (Datawrapper / Tableau / D3) not built yet.
// CKAN has no native "dashboard" concept (an embed reference tied to one or
// more datasets), so these stay hand-authored content rather than moving to
// the catalog — see docs/PRDs/backend/C-data-repository-dashboard-integration.md's
// Out of Scope section.
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
