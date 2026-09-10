import type { ContentStatus, MediaNeed } from "../_lib/types";

export type HeroProject = {
  slug: string;
  title: string;
  blurb: string;
  status: ContentStatus;
  image: MediaNeed;
  /** Overrides the default "Explore project →" / `/projects/{slug}` link — used by the motto slide. */
  ctaLabel?: string;
  ctaHref?: string;
};

// PLACEHOLDER — full project names, descriptions and photography to be
// supplied by PRI; titles below are the working names given for the
// homepage banner and the /projects listing.
export const projects: HeroProject[] = [
  {
    slug: "sir-project",
    title: "SIR Project",
    blurb: "Full project name and description to be confirmed.",
    status: "placeholder",
    image: { label: "SIR Project photograph", ratio: "3:2", kind: "photo" },
  },
  {
    slug: "education",
    title: "Education",
    blurb: "Analysing educational access, quality, and outcomes across different communities and regions.",
    status: "placeholder",
    image: { label: "Education project photograph", ratio: "3:2", kind: "photo" },
  },
  {
    slug: "demography-migration",
    title: "Demography and Migration",
    blurb: "Population studies, migration patterns, and diaspora community analysis.",
    status: "placeholder",
    image: { label: "Demography and Migration project photograph", ratio: "3:2", kind: "photo" },
  },
];

/** Homepage hero carousel: PRI's motto, plus the two most-developed projects. */
export const heroProjects: HeroProject[] = [
  {
    slug: "motto",
    title: "Data-driven research. Evidence-based policy.",
    blurb: "Strategy and collaboration that turn rigorous research into real-world policy impact — for a more equitable society.",
    status: "real",
    image: { label: "PRI hero photograph", ratio: "3:2", kind: "photo" },
    ctaLabel: "Know more",
    ctaHref: "/about",
  },
  ...projects.filter((p) => p.slug === "education" || p.slug === "demography-migration"),
];
