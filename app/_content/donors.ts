import type { NamedProgram, PRIDocument } from "../_lib/types";

// PLACEHOLDER — no impact figures verified. These tiles show the shape the
// section needs; every number has to come from PRI before this can go public.
export const impactMetrics = [
  { value: "—", label: "Districts covered", status: "placeholder" as const },
  { value: "—", label: "Studies published", status: "placeholder" as const },
  { value: "—", label: "People reached", status: "placeholder" as const },
  { value: "—", label: "Partner institutions", status: "placeholder" as const },
];

// PLACEHOLDER — no named/funded programmes supplied.
export const namedPrograms: NamedProgram[] = [
  {
    slug: "programme-one",
    name: "Named programme",
    description: "Programme description to be supplied.",
    funder: "Supported by — funder credit line to be confirmed",
    status: "placeholder",
    image: { label: "Programme photograph", ratio: "16:9", kind: "photo" },
  },
  {
    slug: "programme-two",
    name: "Named programme",
    description: "Programme description to be supplied.",
    funder: "Supported by — funder credit line to be confirmed",
    status: "placeholder",
    image: { label: "Programme photograph", ratio: "16:9", kind: "photo" },
  },
];

// PLACEHOLDER — financial transparency documents not supplied.
export const funderReports: PRIDocument[] = [
  { title: "Annual funder report 2025–26", kind: "PDF", year: "2026", status: "placeholder" },
  { title: "Annual funder report 2024–25", kind: "PDF", year: "2025", status: "placeholder" },
  { title: "Audited financial statement", kind: "PDF", year: "2025", status: "placeholder" },
];

// PLACEHOLDER — donation tiers to be set by PRI. No payment gateway is wired.
export const donationTiers = [
  { amount: "₹1,000", note: "" },
  { amount: "₹5,000", note: "" },
  { amount: "₹10,000", note: "" },
  { amount: "Other", note: "Choose your own amount" },
];
