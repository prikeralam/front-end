import { homeSlidePhotos } from "../../_content/homeSlides";
import type { PRIEvent, Publication } from "../types";

export type HeroSlide = {
  id: "mission" | "research" | "events";
  /** Short label for the slide tabs and the mono kicker. */
  eyebrow: string;
  title: string;
  text: string;
  /** One extra line, e.g. an event's date and place. */
  meta?: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
  photo: { src: string; alt: string };
};

/** Upcoming events soonest first, then past ones newest first. `events` arrives newest first from the API. */
export function orderEvents(events: PRIEvent[]): PRIEvent[] {
  return [...events.filter((e) => e.timing === "upcoming").reverse(), ...events.filter((e) => e.timing === "past")];
}

/** The homepage's three slides: PRI's motto, the newest publication, and the next (or latest) event. Always three. */
export function heroSlides({ hero, publications, events }: { hero: { title: string; blurb: string }; publications: Publication[]; events: PRIEvent[] }): HeroSlide[] {
  const latest = publications[0];
  const event = orderEvents(events)[0];

  return [
    {
      id: "mission",
      eyebrow: "Policy and Research Initiative",
      title: hero.title,
      text: hero.blurb,
      cta: { label: "Explore our research", href: "/research" },
      secondary: { label: "About PRI", href: "/about" },
      photo: homeSlidePhotos.mission,
    },
    latest
      ? {
          id: "research",
          eyebrow: `Latest ${latest.format.toLowerCase()}`,
          title: latest.title,
          text: latest.abstract,
          cta: { label: latest.format === "Data Story" ? "Read the data story" : "Read more", href: `/research/${latest.slug}` },
          secondary: { label: "All research", href: "/research" },
          photo: homeSlidePhotos.research,
        }
      : {
          id: "research",
          eyebrow: "Research & publications",
          title: "Research that starts from the data",
          text: "Data stories, reports and briefs on Kerala's education, health, demography and governance.",
          cta: { label: "Browse research", href: "/research" },
          photo: homeSlidePhotos.research,
        },
    event
      ? {
          id: "events",
          eyebrow: event.timing === "upcoming" ? `Upcoming ${event.kind}` : `Recent ${event.kind}`,
          title: event.title,
          text: event.summary,
          meta: [event.dateLabel, event.location].filter(Boolean).join(" · "),
          cta: { label: event.kind === "campaign" ? "Campaign details" : "Event details", href: `/events/${event.slug}` },
          secondary: { label: "All events", href: "/events" },
          photo: homeSlidePhotos.events,
        }
      : {
          id: "events",
          eyebrow: "Events & campaigns",
          title: "Conversations that bring evidence to the table",
          text: "Conclaves, lectures and workshops with researchers, policymakers and communities.",
          cta: { label: "See events", href: "/events" },
          photo: homeSlidePhotos.events,
        },
  ];
}
