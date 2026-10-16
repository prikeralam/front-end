import "server-only";
import { mottoSlide } from "../../_content/projects";
import { aboutStats } from "../aboutPage";
import { getContentBlock } from "../api/contentBlocks";
import { listDatasets, listTopThemes } from "../api/datasets";
import { listEvents } from "../api/engage";
import { load } from "../api/load";
import { listPartners, listPeopleByGroup } from "../api/people";
import { listProjects } from "../api/projects";
import { listPublications } from "../api/publications";
import { heroSlides, orderEvents } from "./heroSlides";

/** Everything the homepage shows, read in one go. Each source settles separately, so one outage hides one section. */
export async function loadHomeData() {
  const [projects, research, topThemes, partners, executive, heroBlock, quoteBlock, events, datasets] = await Promise.all([
    load("projects", listProjects),
    load("research", listPublications),
    load("themes", listTopThemes),
    load("partners", listPartners),
    load("executive council", () => listPeopleByGroup("executive")),
    load("hero", () => getContentBlock("hero")),
    load("quote", () => getContentBlock("chairman-quote")),
    load("events", listEvents),
    load("datasets", () => listDatasets()),
  ]);

  const publications = research.ok ? research.data.publications : [];
  const allEvents = events.ok ? events.data : [];
  const hero = heroBlock.ok && heroBlock.data ? { title: heroBlock.data.title, blurb: heroBlock.data.body } : { title: mottoSlide.title, blurb: mottoSlide.blurb };
  const datasetList = datasets.ok ? datasets.data : [];

  return {
    slides: heroSlides({ hero, publications, events: allEvents }),
    projects,
    research,
    publications,
    authors: research.ok ? research.data.authors : {},
    events,
    orderedEvents: orderEvents(allEvents),
    /** Top-level themes that hold any datasets or publications, with how many of each (both carry the top-level name). */
    themes: topThemes.ok
      ? topThemes.data
          .map((t) => ({ ...t, datasets: datasetList.filter((d) => d.theme === t.name).length, publications: publications.filter((p) => p.theme === t.name).length }))
          .filter((t) => t.datasets + t.publications > 0)
      : [],
    partners: partners.ok ? partners.data : [],
    chairman: executive.ok ? executive.data.find((p) => /^chairman$/i.test(p.role.trim())) : undefined,
    quote: quoteBlock.ok ? quoteBlock.data : null,
    stats: aboutStats({
      publications: research.ok ? publications.length : undefined,
      datasets: datasets.ok ? datasetList.length : undefined,
      projects: projects.ok ? projects.data.length : undefined,
      events: events.ok ? allEvents.length : undefined,
    }),
  };
}

export type HomeData = Awaited<ReturnType<typeof loadHomeData>>;
