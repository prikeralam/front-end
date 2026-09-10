import type { Person } from "../_lib/types";

// PLACEHOLDER — no fellows, programmes, or timelines supplied yet.
export const programmes = [
  {
    name: "Research Fellowship",
    desc: "Programme to train the next generation of researchers and policymakers.",
    duration: "To be confirmed",
    status: "placeholder" as const,
  },
  {
    name: "Internship Programme",
    desc: "Short-term placements across PRI's five research departments.",
    duration: "To be confirmed",
    status: "placeholder" as const,
  },
];

export const timeline = [
  { stage: "Applications open", when: "To be confirmed" },
  { stage: "Application deadline", when: "To be confirmed" },
  { stage: "Shortlisting & interviews", when: "To be confirmed" },
  { stage: "Programme begins", when: "To be confirmed" },
];

export const fellows: Person[] = [
  {
    slug: "fellow-one",
    name: "Name Surname",
    role: "Research Fellow · Human Capital Development",
    group: "fellow",
    bio: "Biography and impact story to be supplied.",
    status: "placeholder",
    photo: { label: "Fellow headshot — Human Capital Development", ratio: "square", kind: "photo" },
  },
  {
    slug: "fellow-two",
    name: "Name Surname",
    role: "Research Fellow · Economic Analysis",
    group: "fellow",
    bio: "Biography and impact story to be supplied.",
    status: "placeholder",
    photo: { label: "Fellow headshot — Economic Analysis", ratio: "square", kind: "photo" },
  },
  {
    slug: "hisham",
    name: "Hisham",
    role: "Research Fellow · Governance & Policy Analysis",
    group: "fellow",
    bio: "Ph.D., Economics, IIT Delhi.",
    topic: "Trend Analysis of Kerala PSC Appointments & Policy Reforms",
    objectives: [
      "Examine historical and contemporary patterns in PSC recruitment.",
      "Assess the impact of reservation rotation systems on marginalized communities.",
      "Provide data-driven policy recommendations to enhance equity and representation.",
    ],
    status: "real",
    photo: { label: "Hisham — Research Fellow portrait", ratio: "square", kind: "photo" },
  },
  {
    slug: "past-fellow-one",
    name: "Name Surname",
    role: "Past Fellow · Demography & Health",
    group: "past-fellow",
    bio: "Biography and impact story to be supplied.",
    status: "placeholder",
    photo: { label: "Past fellow headshot — Demography & Health", ratio: "square", kind: "photo" },
  },
  {
    slug: "past-fellow-two",
    name: "Name Surname",
    role: "Past Fellow · Society Development",
    group: "past-fellow",
    bio: "Biography and impact story to be supplied.",
    status: "placeholder",
    photo: { label: "Past fellow headshot — Society Development", ratio: "square", kind: "photo" },
  },
];

export const currentFellows = fellows.filter((f) => f.group === "fellow");
export const pastFellows = fellows.filter((f) => f.group === "past-fellow");
