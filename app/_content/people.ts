import type { Person, PRIDocument } from "../_lib/types";
import { org } from "./org";

const portrait = (label: string, src?: string) => ({ label, ratio: "square" as const, kind: "photo" as const, src });

// Real names and designations supplied by PRI (2026-09-08). Photos are wired
// in as PRI supplies them (see /public/people/team/) — everyone else falls
// back to a themed stock portrait until a real one lands. Profile pages live
// at /people/[slug]; bios still need to be written.
export const people: Person[] = [
  // --- Our Team (7) ---
  {
    slug: "noushad",
    name: "Dr. Noushad T",
    role: "Director of Operations",
    group: "team",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Noushad — Director of Operations portrait", "/people/team/noushad.jpg"),
  },
  {
    slug: "thufail",
    name: "Muhammed Thufail",
    role: "Head of Data",
    group: "team",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Thufail — Head of Data portrait", "/people/team/thufail.jpg"),
  },
  {
    slug: "afsal",
    name: "Dr. Afsal K",
    role: "Researcher",
    group: "team",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Afsal — Researcher portrait", "/people/team/afsal.jpg"),
  },
  {
    slug: "sayyid-hashir",
    name: "Sayyid Hashir",
    role: "Editor",
    group: "team",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Sayyid Hashir — Editor portrait", "/people/team/hashir.png"),
  },
  {
    slug: "badusha",
    name: "Badusha",
    role: "Content Writer",
    group: "team",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Badusha — Content Writer portrait", "/people/team/badusha.png"),
  },
  {
    slug: "muhammed-sinan",
    name: "Muhammed Sinan",
    role: "Web Manager",
    group: "team",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Muhammed Sinan — Web Manager portrait", "/people/team/muhammed-sinan.png"),
  },
  {
    slug: "rashiq",
    name: "Rashiq",
    role: "Data Analyst",
    group: "team",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Rashiq — Data Analyst portrait", "/people/team/rashiq.jpg"),
  },

  // --- Patrons (2) ---
  {
    slug: "pk-kunjalikkutty",
    name: "PK Kunjalikkutty",
    role: "Patron",
    group: "patron",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("PK Kunjalikkutty — Patron portrait", "/people/patrons/pk-kunjalikkutty.jpg"),
  },
  {
    slug: "galfar-mohammed-ali",
    name: "Galfar Mohammed Ali",
    role: "Patron",
    group: "patron",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Galfar Mohammed Ali — Patron portrait", "/people/patrons/galfar-mohammed-ali.jpg"),
  },

  // --- Advisory Body (10) --- PLACEHOLDER, awaiting real names/designations from PRI.
  ...Array.from({ length: 10 }, (_, i) => ({
    slug: `advisory-member-${i + 1}`,
    name: `Advisory Member ${i + 1}`,
    role: "Advisory Body",
    group: "advisory" as const,
    bio: "Biography to be supplied.",
    status: "placeholder" as const,
    photo: portrait(`Advisory Member ${i + 1} portrait`),
  })),

  // --- Executive Council (13) ---
  {
    slug: "sayyid-sadiq-ali-shihab",
    name: "Sayyid Sadiq Ali Shihab",
    role: "Chairman",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Sayyid Sadiq Ali Shihab — Chairman portrait", "/people/executive/sayyid-sadiq-ali-shihab.jpg"),
  },
  {
    slug: "ahmad-munavvar-puthiya-maliyekkal",
    name: "Ahmad Munavvar Puthiya Maliyekkal",
    role: "Vice Chairman",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Ahmad Munavvar Puthiya Maliyekkal — Vice Chairman portrait", "/people/executive/ahmad-munavvar-puthiya-maliyekkal.jpg"),
  },
  {
    slug: "sayyid-rasheed-ali-puthiya-maliyekkal",
    name: "Sayyid Rasheed Ali Puthiya Maliyekkal",
    role: "Treasurer",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Sayyid Rasheed Ali Puthiya Maliyekkal — Treasurer portrait", "/people/executive/sayyid-rasheed-ali-puthiya-maliyekkal.jpg"),
  },
  {
    slug: "abubakr-t",
    name: "Abubakr T",
    role: "Vice President",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Abubakr T — Vice President portrait"),
  },
  {
    slug: "mohammed-haris-kt",
    name: "Dr. Mohammed Haris KT",
    role: "General Secretary",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Dr. Mohammed Haris KT — General Secretary portrait", "/people/executive/haris-kt.jpeg"),
  },
  {
    slug: "muhammed-nazeel-np",
    name: "Muhammed Nazeel NP",
    role: "Executive Member",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Muhammed Nazeel NP — Executive Member portrait", "/people/executive/naseel.jpeg"),
  },
  {
    slug: "sayyid-aseel-ali-shihab-thangal",
    name: "Sayyid Aseel Ali Shihab Thangal",
    role: "Executive Member",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Sayyid Aseel Ali Shihab Thangal — Executive Member portrait", "/people/executive/sayyid-aseel-ali-shihab-thangal.jpg"),
  },
  {
    slug: "sayyid-rajih-ali-shihab-thangal",
    name: "Sayyid Rajih Ali Shihab Thangal",
    role: "Executive Member",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Sayyid Rajih Ali Shihab Thangal — Executive Member portrait", "/people/executive/sayyid-rajih-ali-shihab-thangal.jpg"),
  },
  {
    slug: "anwar-naha",
    name: "Anwar Naha",
    role: "Vice Chairman",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Anwar Naha — Vice Chairman portrait"),
  },
  {
    slug: "ch-abdul-raheem",
    name: "C.H Abdul Raheem",
    role: "Executive Member",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("C.H Abdul Raheem — Executive Member portrait", "/people/executive/ch-abdul-raheem.jpeg"),
  },
  {
    slug: "pa-abdulla-ibrahim",
    name: "P.A Abdulla Ibrahim",
    role: "Executive Member",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("P.A Abdulla Ibrahim — Executive Member portrait", "/people/executive/pa-abdulla-ibrahim.jpg"),
  },
  {
    slug: "abdul-muhaimin-kakkiya",
    name: "Abdul Muhaimin Kakkiya",
    role: "Executive Member",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Abdul Muhaimin Kakkiya — Executive Member portrait"),
  },
  {
    slug: "muneer-kalliyil",
    name: "Dr. Muneer Kalliyil",
    role: "Executive Member",
    group: "executive",
    bio: "Biography to be supplied.",
    status: "real",
    photo: portrait("Dr. Muneer Kalliyil — Executive Member portrait", "/people/executive/muneer-kalliyil.jpg"),
  },

  // --- Authors (1) ---
  {
    slug: "pri-research-team",
    name: "PRI Research Team",
    role: "Research Team",
    group: "author",
    bio: "The collective byline for research produced across PRI's departments.",
    status: "placeholder",
    photo: portrait("PRI Research Team portrait"),
  },
];

export const teamMembers = people.filter((p) => p.group === "team");
export const patrons = people.filter((p) => p.group === "patron");
export const advisoryBody = people.filter((p) => p.group === "advisory");
export const executiveCouncil = people.filter((p) => p.group === "executive");
export const authors = people.filter((p) => p.group === "author");

// PLACEHOLDER — Director's Note to be written.
export const directorsNote = {
  quote:
    "Good policy begins with an honest look at the data — including when it complicates the story we would rather tell. Protecting that discipline is what PRI exists to do.",
  name: "Name Surname",
  role: "Executive Director",
  status: "placeholder" as const,
};

export const legalStatus = [
  { label: "Registration", value: org.registration.regNo, note: "Registered Society" },
  { label: "12A Status", value: org.registration.pan12A, note: "Income Tax Act, 1961" },
  { label: "80G Status", value: org.registration.cert80G, note: "Donations tax-deductible" },
];

export const reports: PRIDocument[] = [
  { title: "Annual Report 2025–26", kind: "Annual Report", year: "2026", status: "real", href: "/PDFs/Annual%20Report%2025-26.pdf" },
  // PLACEHOLDER — remaining reports/strategic plans not supplied yet.
  { title: "Strategic Plan 2024–2028", kind: "Strategic Plan", year: "2024", status: "placeholder" },
  { title: "Annual Report 2024–25", kind: "Annual Report", year: "2025", status: "placeholder" },
];

// PLACEHOLDER — no testimonials existed on the previous site.
export const testimonials = [
  { quote: "PRI's district-level evidence has become the first stop for our editorial team.", name: "Name Surname", role: "Editor, partner publication", status: "placeholder" as const },
  { quote: "Working alongside PRI's research team taught me what it means to let the evidence lead.", name: "Name Surname", role: "Former Research Fellow", status: "placeholder" as const },
  { quote: "Few institutes make it this easy to trace a policy from the budget line to the ground.", name: "Name Surname", role: "Programme Director, partner NGO", status: "placeholder" as const },
];

