import type { Person, PRIDocument } from "../_lib/types";

// PLACEHOLDER — PRI's governance listings were not on the previous site.
// Names, roles and bios all need to be supplied.
export const people: Person[] = [
  {
    slug: "executive-director",
    name: "Name Surname",
    role: "Executive Director",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "placeholder",
    photo: { label: "Executive Director portrait", ratio: "square", kind: "photo" },
  },
  {
    slug: "director-of-research",
    name: "Name Surname",
    role: "Director of Research",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "placeholder",
    photo: { label: "Director of Research portrait", ratio: "square", kind: "photo" },
  },
  {
    slug: "director-finance-operations",
    name: "Name Surname",
    role: "Director of Finance & Operations",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "placeholder",
    photo: { label: "Director of Finance portrait", ratio: "square", kind: "photo" },
  },
  {
    slug: "steering-chair",
    name: "Name Surname",
    role: "Chair · Steering Council",
    group: "steering",
    status: "placeholder",
    photo: { label: "Steering Council Chair portrait", ratio: "square", kind: "photo" },
  },
  {
    slug: "steering-economics",
    name: "Name Surname",
    role: "Member · Development Economics",
    group: "steering",
    status: "placeholder",
    photo: null,
  },
  {
    slug: "steering-governance",
    name: "Name Surname",
    role: "Member · Governance & Public Policy",
    group: "steering",
    status: "placeholder",
    photo: null,
  },
  {
    slug: "steering-health",
    name: "Name Surname",
    role: "Member · Health Policy",
    group: "steering",
    status: "placeholder",
    photo: null,
  },
];

export const executiveCouncil = people.filter((p) => p.group === "executive");
export const steeringCouncil = people.filter((p) => p.group === "steering");

// PLACEHOLDER — Director's Note to be written.
export const directorsNote = {
  quote:
    "Good policy begins with an honest look at the data — including when it complicates the story we would rather tell. Protecting that discipline is what PRI exists to do.",
  name: "Name Surname",
  role: "Executive Director",
  status: "placeholder" as const,
};

// PLACEHOLDER — registration details to be confirmed.
export const legalStatus = [
  { label: "Registration", value: "Registered Society", note: "Reg. No. to be confirmed" },
  { label: "12A Status", value: "To be confirmed", note: "Income Tax Act, 1961" },
  { label: "80G Status", value: "To be confirmed", note: "Donations tax-deductible" },
];

// PLACEHOLDER — no annual reports or strategic plans supplied yet.
export const reports: PRIDocument[] = [
  { title: "Annual Report 2025–26", kind: "Annual Report", year: "2026", status: "placeholder" },
  { title: "Strategic Plan 2024–2028", kind: "Strategic Plan", year: "2024", status: "placeholder" },
  { title: "Annual Report 2024–25", kind: "Annual Report", year: "2025", status: "placeholder" },
];

// PLACEHOLDER — no testimonials existed on the previous site.
export const testimonials = [
  { quote: "PRI's district-level evidence has become the first stop for our editorial team.", name: "Name Surname", role: "Editor, partner publication", status: "placeholder" as const },
  { quote: "Working alongside PRI's research team taught me what it means to let the evidence lead.", name: "Name Surname", role: "Former Research Fellow", status: "placeholder" as const },
  { quote: "Few institutes make it this easy to trace a policy from the budget line to the ground.", name: "Name Surname", role: "Programme Director, partner NGO", status: "placeholder" as const },
];

export const orgChart = {
  label: "Organisational chart diagram",
  ratio: "4:3",
  kind: "diagram" as const,
};
