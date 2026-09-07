import type { ContentStatus } from "../_lib/types";

/** Homepage "Latest Updates" feed — in production this is a CMS query across content types. */
export const updates: {
  type: string;
  meta: string;
  title: string;
  desc: string;
  href: string;
  status: ContentStatus;
}[] = [
  {
    type: "Research",
    meta: "Ongoing · Expected Q2 2024",
    title: "Educational Equity Assessment",
    desc: "Comprehensive analysis of educational access, quality, and outcomes across different communities to identify gaps and recommend interventions.",
    href: "/research/educational-equity-assessment",
    status: "real",
  },
  {
    type: "Research",
    meta: "Data Collection · Expected Q3 2024",
    title: "Employment Patterns Study",
    desc: "Longitudinal study examining employment trends, skill gaps, and opportunities for workforce development in emerging sectors.",
    href: "/research/employment-patterns-study",
    status: "real",
  },
  {
    type: "Media",
    meta: "Date to be confirmed",
    title: "Rapid response brief on emerging socio-political issues",
    desc: "Timely and research-backed responses to emerging socio-political issues to inform public debate.",
    href: "/media-watch/case-one",
    status: "placeholder",
  },
  {
    type: "Event",
    meta: "Date to be confirmed",
    title: "Policy roundtable with stakeholders",
    desc: "Creating platforms to share research, address problems, and collaboratively build solutions.",
    href: "/events/policy-roundtable",
    status: "placeholder",
  },
];

export const quickLinks = [
  {
    title: "Data Hub",
    desc: "A centralized data repository with controlled access, designed to store, manage, and analyze research datasets securely.",
    href: "/data",
  },
  {
    title: "Publications",
    desc: "Journals, research articles, policy papers, technical briefs, statements and policy blogs.",
    href: "/research",
  },
  {
    title: "Get Involved",
    desc: "Fellowships and internships to train the next generation of researchers and policymakers.",
    href: "/get-involved",
  },
];

/** Hero image the homepage design calls for but PRI has not supplied. */
export const homeHeroImage = {
  label: "Homepage hero photograph — documentary style, research or community setting",
  ratio: "16:9",
  kind: "photo" as const,
};
