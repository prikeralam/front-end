import type { MediaNeed } from "../_lib/types";
import { org, vision } from "./org";
import { people, teamMembers, patrons, executiveCouncil, reports, testimonials, directorsNote, orgChart } from "./people";
import { publications } from "./publications";
import { datasets, dashboards } from "./datasets";
import { fellows, programmes } from "./fellows";
import { advocacyItems, scorecard } from "./advocacy";
import { mediaCases, explainers, toolkits } from "./mediaCases";
import { events, pastEvents, pastEventArchive } from "./events";
import { partners } from "./partners";
import { impactMetrics, namedPrograms, funderReports } from "./donors";
import { jobs, newsletterIssues, officeMap } from "./jobs";
import { updates, homeHeroImage } from "./updates";

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
    real: count(updates, "real") + 2, // mission + vision copy
    placeholder: count(updates, "placeholder") + count(testimonials, "placeholder"),
    media: media(homeHeroImage),
    documents: [],
    notes: ["Testimonials are invented — no real quotes from collaborators, fellows or donors exist."],
  },
  {
    section: "2 · About PRI",
    href: "/about",
    real: 3, // overview, vision, mission points
    placeholder: count(people, "placeholder") + count(reports, "placeholder") + 1,
    media: [...media(...people.map((p) => p.photo)), orgChart],
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
      "Names and designations are real for all 7 team, 2 patron and 17 executive council entries.",
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
    section: "4 · Data Repository",
    href: "/data",
    real: 0,
    placeholder: count(datasets, "placeholder") + count(dashboards, "placeholder"),
    media: media(...datasets.map((d) => d.preview), ...dashboards.map((d) => d.embed)),
    documents: datasets.map((d) => `${d.title} (dataset file)`),
    notes: [
      "No datasets exist yet — every card is a placeholder.",
      "Source, coverage and update frequency unconfirmed for all datasets.",
      "No dashboards built; embeds are empty slots.",
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
    section: "6 · Advocacy & Policy",
    href: "/advocacy",
    real: 0,
    placeholder: count(advocacyItems, "placeholder") + 1,
    media: media(...advocacyItems.map((a) => a.media)),
    documents: advocacyItems
      .filter((a) => ["Memo", "Policy Brief", "White Paper", "Letter"].includes(a.type))
      .map((a) => `${a.title} (PDF)`),
    notes: [
      "No memos, briefs, white papers or letters supplied.",
      "Scorecard has no institutions or scores — structure only.",
      "Roundtable photo galleries missing.",
    ],
  },
  {
    section: "7 · Media Watch",
    href: "/media-watch",
    real: 0,
    placeholder: count(mediaCases, "placeholder") + count(explainers, "placeholder"),
    media: media(...mediaCases.map((c) => c.screenshot), ...explainers.map((e) => e.media)),
    documents: toolkits.map((t) => `${t.title} (${t.kind})`),
    notes: [
      "No flagged cases logged; screenshots, source names and dates all missing.",
      "No video explainers produced.",
      "Press statements and social-media toolkits don't exist.",
    ],
  },
  {
    section: "8 · Partner Network",
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
    section: "9 · Donors & Sponsors",
    href: "/donors",
    real: 0,
    placeholder:
      count(impactMetrics, "placeholder") + count(namedPrograms, "placeholder") + count(funderReports, "placeholder"),
    media: media(...namedPrograms.map((p) => p.image)),
    documents: funderReports.map((r) => `${r.title} (PDF)`),
    notes: [
      "Every impact number is blank — these must be verified before publishing.",
      "No named programmes or funder credit lines.",
      "Donation tiers unset; no payment gateway chosen.",
    ],
  },
  {
    section: "10 · Events & Campaigns",
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
    section: "11 · Get Involved",
    href: "/get-involved",
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
    section: "12 · Contact & Newsletter",
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
export const scorecardStatus = scorecard.status;
