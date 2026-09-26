import type { HeroProject } from "../_lib/types";

/** First homepage hero slide: PRI's motto. Not a project, so it isn't served by the projects API. */
export const mottoSlide: HeroProject = {
  slug: "motto",
  title: "Data-driven research. Evidence-based policy.",
  blurb: "Strategy and collaboration that turn rigorous research into real-world policy impact — for a more equitable society.",
  status: "real",
  image: { label: "PRI hero photograph", ratio: "3:2", kind: "photo" },
  ctaLabel: "Know more",
  ctaHref: "/about",
};
