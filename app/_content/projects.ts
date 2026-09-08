import type { ContentStatus, MediaNeed } from "../_lib/types";

export type HeroProject = {
  slug: string;
  title: string;
  blurb: string;
  status: ContentStatus;
  image: MediaNeed;
};

// PLACEHOLDER — full project names, descriptions and photography to be
// supplied by PRI; titles below are the working names given for the
// homepage banner.
export const heroProjects: HeroProject[] = [
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
