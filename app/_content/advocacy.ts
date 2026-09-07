import type { AdvocacyItem } from "../_lib/types";

export const advocacyTypes = ["Memo", "Policy Brief", "White Paper", "Letter", "Scorecard", "Event Snapshot"];

// PLACEHOLDER — no advocacy output supplied yet. Descriptions below are drawn
// from PRI's own stated advocacy functions on the previous site.
export const advocacyItems: AdvocacyItem[] = [
  {
    slug: "legislative-memo",
    title: "Legislative memo on equitable scheme delivery",
    summary: "Engaging with policymakers and government agencies to advocate for equitable policies.",
    type: "Memo",
    date: "To be confirmed",
    status: "placeholder",
    media: null,
  },
  {
    slug: "policy-brief-education",
    title: "Policy brief: closing district-level education gaps",
    summary: "Summary to be supplied.",
    type: "Policy Brief",
    date: "To be confirmed",
    status: "placeholder",
    media: { label: "Brief cover thumbnail", ratio: "3:4", kind: "document" },
  },
  {
    slug: "white-paper-inclusion",
    title: "White paper on representation and inclusion",
    summary: "Summary to be supplied.",
    type: "White Paper",
    date: "To be confirmed",
    status: "placeholder",
    media: { label: "White paper cover thumbnail", ratio: "3:4", kind: "document" },
  },
  {
    slug: "letter-to-ministry",
    title: "Letter submitted to the Ministry",
    summary: "Correspondence to be supplied.",
    type: "Letter",
    date: "To be confirmed",
    recipient: "Recipient to be confirmed",
    status: "placeholder",
    media: null,
  },
  {
    slug: "representation-scorecard",
    title: "Representation & inclusion scorecard",
    summary: "Structured scoring of representation across named institutions.",
    type: "Scorecard",
    date: "To be confirmed",
    status: "placeholder",
    media: null,
  },
  {
    slug: "roundtable-snapshot",
    title: "Snapshot: policy roundtable with stakeholders",
    summary: "Creating platforms to share research, address problems, and collaboratively build solutions.",
    type: "Event Snapshot",
    date: "To be confirmed",
    status: "placeholder",
    media: { label: "Roundtable photo gallery — people at the table", ratio: "16:9", kind: "photo" },
  },
];

// PLACEHOLDER — scorecard rows. Spec requires an accessible HTML table, not an image.
export const scorecard = {
  caption: "Representation & inclusion scorecard",
  columns: ["Institution", "Representation", "Access", "Transparency", "Score"],
  rows: [
    ["Institution name", "—", "—", "—", "—"],
    ["Institution name", "—", "—", "—", "—"],
    ["Institution name", "—", "—", "—", "—"],
  ],
  status: "placeholder" as const,
};
