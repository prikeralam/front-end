import type { HeroProject } from "../_lib/types";

/** PRI's motto: the homepage hero's text when the `hero` content block isn't published. */
export const mottoSlide: HeroProject = {
  slug: "motto",
  title: "Data-driven research. Evidence-based policy.",
  blurb: "Strategy and collaboration that turn rigorous research into real-world policy impact, for a more equitable society.",
  status: "real",
  image: { label: "PRI hero photograph", ratio: "3:2", kind: "photo" },
  ctaLabel: "Know more",
  ctaHref: "/about",
};
