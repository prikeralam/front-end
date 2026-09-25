import type { MediaNeed } from "../_lib/types";
import { org, vision } from "./org";
import { people, teamMembers, patrons, executiveCouncil, reports, testimonials, directorsNote } from "./people";
import { publications } from "./publications";
import { fellows, programmes } from "./fellows";
import { events, pastEvents, pastEventArchive } from "./events";
import { partners } from "./partners";
import { jobs, newsletterIssues, officeMap } from "./jobs";
import { homeHeroImage } from "./updates";

export type SectionAudit = {
  section: string;
  href: string;
  /** Copy that exists and is verified. */
  real: number;
  /** Copy that is invented and needs replacing. */
  placeholder: number;
  /** Images, logos, charts, maps, videos and diagrams the design needs but PRI hasn't supplied. */
  media: MediaNeed[];
  /** Files (PDFs, datasets, asset packs) that don't exist yet. */
  documents: string[];
  /** Anything else blocking this section. */
  notes: string[];
};

const media = (...needs: (MediaNeed | null | undefined)[]) =>
  needs.filter((n): n is MediaNeed => Boolean(n));

const count = (items: { status: string }[], want: string) =>
  items.filter((i) => i.status === want).length;

export const auditSections: SectionAudit[] = [
  {
    section: "1 · Homepage",
    href: "/",
    real: 2, // mission + vision copy
    placeholder: count(testimonials, "placeholder"),
    media: media(homeHeroImage),
    documents: [],
    notes: ["Testimonials are invented — no real quotes from collaborators, fellows or donors exist."],
  },
  {
    section: "2 · About PRI",
    href: "/about",
    real: 3, // overview, vision, mission points
    placeholder: count(people, "placeholder") + count(reports, "placeholder") + 1,
    media: media(...people.map((p) => p.photo)),
    documents: reports.filter((r) => r.status === "placeholder").map((r) => r.title),
    notes: [
      "Governance names and roles are all placeholders.",
      "Director's Note is invented and needs writing.",
      "Society registration number, 12A and 80G status all unconfirmed.",
    ],
  },
  {
    section: "· People",
    href: "/people",
    real: count(teamMembers, "real") + count(patrons, "real") + count(executiveCouncil, "real"),
    placeholder: count(teamMembers, "placeholder") + count(patrons, "placeholder") + count(executiveCouncil, "placeholder"),
    media: media(...people.map((p) => p.photo)),
    documents: [],
    notes: [
      "Names and designations are real for all 7 team, 2 patron and 16 executive council entries.",
      "Only 2 of 26 have a real photo supplied (Rashiq, Muhammed Sinan) — everyone else shows a themed stock portrait until PRI supplies one.",
      "Profile pages exist at /people/[slug] but bios are unwritten.",
    ],
  },
  {
    section: "3 · Research & Publications",
    href: "/research",
    real: count(publications, "real"),
    placeholder: count(publications, "placeholder"),
    media: media(...publications.map((p) => p.cover)),
    documents: publications.map((p) => `${p.title} (PDF)`),
    notes: [
      "Only the two ongoing studies are real; the rest are shape-fillers.",
      "No abstracts, author names or publication dates supplied.",
    ],
  },
  {
    // Datasets and dashboards come from the backend (not static placeholder
    // content in this repo), so this section is no longer measured the
    // same way as the rest of this audit — see /data for live counts.
    section: "4 · Data Repository",
    href: "/data",
    real: 0,
    placeholder: 0,
    media: media(),
    documents: [],
    notes: [
      "Datasets and dashboards are served live from the backend — see /data, not this audit.",
      "Some seeded datasets still have unconfirmed source/update-frequency metadata in the backend.",
      "Seeded dashboards embed placeholder URLs until real Datawrapper/Tableau embeds are published.",
    ],
  },
  {
    section: "5 · Fellowship & Internship",
    href: "/fellowship",
    real: 0,
    placeholder: count(fellows, "placeholder") + count(programmes, "placeholder"),
    media: media(...fellows.map((f) => f.photo)),
    documents: [],
    notes: [
      "No fellows named; all headshots missing.",
      "Programme durations and the full application timeline are unconfirmed.",
      "Application form fields not defined.",
    ],
  },
  {
    section: "6 · Partner Network",
    href: "/partners",
    real: 0,
    placeholder: count(partners, "placeholder"),
    media: media(...partners.map((p) => p.logo)),
    documents: [],
    notes: [
      "No partner organisations named — the logo grid is entirely empty slots.",
      "Consortium members not identified.",
    ],
  },
  {
    section: "7 · Events & Campaigns",
    href: "/events",
    real: 0,
    placeholder: count(events, "placeholder"),
    media: [
      ...media(...events.map((e) => e.image)),
      ...(pastEvents.length ? [pastEventArchive.recording, pastEventArchive.gallery] : []),
    ],
    documents: pastEvents.map((e) => `${e.title} — event report (PDF)`),
    notes: [
      "No events scheduled; all dates, times and venues unconfirmed.",
      "Past events have no recordings, photo galleries or reports.",
    ],
  },
  {
    section: "8 · Careers",
    href: "/careers",
    real: 0,
    placeholder: count(jobs, "placeholder"),
    media: [{ label: "Volunteers / team at work photograph", ratio: "16:9", kind: "photo" }],
    documents: [],
    notes: [
      "No open roles posted — job descriptions, locations and closing dates all missing.",
      "Whistleblower handling policy needs defining before that form can go live.",
    ],
  },
  {
    section: "9 · Contact & Newsletter",
    href: "/contact",
    real: 1, // address, email, phone are real
    placeholder: count(newsletterIssues, "placeholder"),
    media: media(officeMap),
    documents: newsletterIssues.map((n) => n.title),
    notes: [
      "Office address, email and phone are real and verified.",
      "No newsletter has been published, so the archive is empty.",
      "Map embed not configured.",
    ],
  },
];

export const auditTotals = {
  media: auditSections.reduce((n, s) => n + s.media.length, 0),
  documents: auditSections.reduce((n, s) => n + s.documents.length, 0),
  placeholder: auditSections.reduce((n, s) => n + s.placeholder, 0),
  real: auditSections.reduce((n, s) => n + s.real, 0),
};

export const verifiedContent = [
  `Organisation name, tagline and summary — ${org.status}`,
  `Vision statement — ${vision.status}`,
  "Mission (4 points)",
  "Five research departments and their focus areas",
  "Eleven research domains",
  "Three operational wings (Research, Advocacy, Outreach)",
  "Research methodology (quantitative, qualitative, policy evaluation)",
  "Office address, email and phone",
  "Two ongoing studies (Educational Equity Assessment, Employment Patterns Study)",
];

export const directorsNoteStatus = directorsNote.status;
