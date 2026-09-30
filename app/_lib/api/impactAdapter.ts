import type { components } from "./schema";
import { formatPublicationDate } from "./publicationAdapter";

type ApiMention = components["schemas"]["Mention"];
type ApiRecognition = components["schemas"]["Recognition"];
type ApiCollection = components["schemas"]["Collection"];

export type MentionKind = "news" | "research" | "report" | "legislature" | "other";

export const MENTION_KIND_LABELS: Record<MentionKind, string> = {
  news: "News",
  research: "Research papers",
  report: "Reports",
  legislature: "Legislature",
  other: "Other",
};

export type Mention = {
  slug: string;
  title: string;
  publisher: string;
  url: string;
  kind: MentionKind;
  /** ISO date, for sorting. */
  date: string;
  dateLabel: string;
  summary?: string;
  logo?: string;
  publicationSlug?: string;
  datasetSlug?: string;
};

export type Recognition = { slug: string; title: string; awardedBy: string; year: number; description?: string; url?: string; image?: string };

export type Collection = { slug: string; title: string; description: string; datasetSlugs: string[]; publicationSlug?: string };

const KINDS = Object.keys(MENTION_KIND_LABELS) as MentionKind[];

export function toMention(m: ApiMention): Mention {
  return {
    slug: m.slug,
    title: m.title,
    publisher: m.publisher,
    url: m.url,
    kind: KINDS.includes(m.kind as MentionKind) ? (m.kind as MentionKind) : "other",
    date: m.date,
    dateLabel: formatPublicationDate(m.date),
    summary: m.summary || undefined,
    logo: m.publisher_logo || undefined,
    publicationSlug: m.publication || undefined,
    datasetSlug: m.dataset || undefined,
  };
}

export function toRecognition(r: ApiRecognition): Recognition {
  return {
    slug: r.slug,
    title: r.title,
    awardedBy: r.awarded_by,
    year: r.year,
    description: r.description || undefined,
    url: r.url || undefined,
    image: r.image || undefined,
  };
}

export function toCollection(c: ApiCollection): Collection {
  return {
    slug: c.slug,
    title: c.title,
    description: c.description ?? "",
    datasetSlugs: c.datasets ?? [],
    publicationSlug: c.publication || undefined,
  };
}
