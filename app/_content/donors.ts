import type { NamedProgram, PRIDocument } from "../_lib/types";
import { galleryPhotos } from "./gallery";

export const impactMetrics = [
  { value: "8", label: "Districts covered", status: "real" as const },
  { value: "5", label: "Studies published", status: "real" as const },
  { value: "578K", label: "People reached", status: "real" as const },
  { value: "16", label: "Partner institutions", status: "real" as const },
];

// PLACEHOLDER — no named/funded programmes supplied.
export const namedPrograms: NamedProgram[] = [
  {
    slug: "programme-one",
    name: "Named programme",
    description: "Programme description to be supplied.",
    funder: "Supported by — funder credit line to be confirmed",
    status: "placeholder",
    image: { label: "Programme photograph — Named programme 1", ratio: "16:9", kind: "photo", src: "/gallery/programme-planning-session-1.jpg" },
  },
  {
    slug: "programme-two",
    name: "Named programme",
    description: "Programme description to be supplied.",
    funder: "Supported by — funder credit line to be confirmed",
    status: "placeholder",
    image: { label: "Programme photograph — Named programme 2", ratio: "16:9", kind: "photo", src: "/gallery/programme-planning-session-2.jpg" },
  },
];

// Well Wishers Program — real events/moments with PRI's donors and supporters.
export const wellWishersEvents: NamedProgram[] = galleryPhotos.map((g) => ({
  slug: `well-wishers-${g.slug}`,
  name: g.caption,
  description: g.description,
  funder: "Well Wishers Program",
  status: "real",
  image: { label: `Well Wishers Program — ${g.caption}`, ratio: "16:9", kind: "photo", src: g.src },
}));

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
