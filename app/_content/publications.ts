import type { Publication } from "../_lib/types";

export const publicationThemes = ["Education", "Employment", "Economics", "Public Finance", "Health", "Governance"];
export const publicationFormats = ["Report", "Working Paper", "Brief", "Explainer", "Infographic", "Video", "Data Story"];

// The two "Ongoing" studies are real — they were listed as current research
// initiatives on PRI's previous site. Everything else is PLACEHOLDER, shaped to
// show what the hub looks like populated.
export const publications: Publication[] = [
  {
    slug: "educational-equity-assessment",
    title: "Educational Equity Assessment",
    abstract:
      "Comprehensive analysis of educational access, quality, and outcomes across different communities to identify gaps and recommend interventions. Status: ongoing, expected Q2 2024.",
    format: "Report",
    theme: "Education",
    date: "Ongoing",
    authors: ["Name Surname"],
    status: "real",
    cover: { label: "Report cover — Educational Equity Assessment", ratio: "3:4", kind: "photo" },
  },
  {
    slug: "employment-patterns-study",
    title: "Employment Patterns Study",
    abstract:
      "Longitudinal study examining employment trends, skill gaps, and opportunities for workforce development in emerging sectors. Status: data collection, expected Q3 2024.",
    format: "Working Paper",
    theme: "Employment",
    date: "Ongoing",
    authors: ["Name Surname"],
    status: "real",
    cover: { label: "Report cover — Employment Patterns Study", ratio: "3:4", kind: "photo" },
  },
  {
    slug: "public-finance-brief",
    title: "Budget allocation and expenditure: a district-level brief",
    abstract: "Abstract to be supplied.",
    format: "Brief",
    theme: "Public Finance",
    date: "To be confirmed",
    authors: ["Name Surname"],
    status: "placeholder",
    cover: { label: "Brief cover image", ratio: "3:4", kind: "photo" },
  },
  {
    slug: "healthcare-access-explainer",
    title: "Healthcare accessibility and delivery: an explainer",
    abstract: "Abstract to be supplied.",
    format: "Explainer",
    theme: "Health",
    date: "To be confirmed",
    authors: ["Name Surname"],
    status: "placeholder",
    cover: { label: "Explainer cover image", ratio: "3:4", kind: "photo" },
  },
  {
    slug: "representation-infographic",
    title: "Political participation and legislative representation",
    abstract: "Abstract to be supplied.",
    format: "Infographic",
    theme: "Governance",
    date: "To be confirmed",
    authors: ["Name Surname"],
    status: "placeholder",
    cover: { label: "Full-size infographic artwork", ratio: "3:4", kind: "chart" },
  },
  {
    slug: "wealth-distribution-data-story",
    title: "Wealth and income distribution: a data story",
    abstract: "Abstract to be supplied.",
    format: "Data Story",
    theme: "Economics",
    date: "To be confirmed",
    authors: ["Name Surname"],
    status: "placeholder",
    cover: { label: "Data story lead visual", ratio: "3:4", kind: "chart" },
  },
];
