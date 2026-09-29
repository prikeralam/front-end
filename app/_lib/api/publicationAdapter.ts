import type { components } from "./schema";
import { dataStoryCoverPhotos } from "../stockPhotos";
import type { Publication } from "../types";

type ApiPublication = components["schemas"]["Publication"];
type ApiTheme = components["schemas"]["Theme"];

const FORMAT_LABELS: Record<ApiPublication["format"], Publication["format"]> = {
  report: "Report",
  working_paper: "Working Paper",
  brief: "Brief",
  explainer: "Explainer",
  infographic: "Infographic",
  video: "Video",
  data_story: "Data Story",
};

const LANGUAGE_LABELS: Record<NonNullable<ApiPublication["language"]>, Publication["language"]> = {
  en: "English",
  ml: "Malayalam",
};

export type PublicationLookups = {
  /** Sub-theme id -> its top-level theme's name. */
  themeBySubTheme: ReadonlyMap<number, string>;
  /** Person id -> slug, for the `authors` ids the API returns. */
  authorSlugById: ReadonlyMap<number, string>;
};

/** Each sub-theme id maps to the name of the top-level theme it sits under. */
export function themeBySubTheme(themes: readonly ApiTheme[]): Map<number, string> {
  const index = new Map<number, string>();
  for (const theme of themes) {
    for (const sub of theme.subthemes ?? []) index.set(sub.id, theme.name);
  }
  return index;
}

export function toPublication(publication: ApiPublication, lookups: PublicationLookups): Publication {
  return {
    slug: publication.slug,
    title: publication.title,
    abstract: publication.abstract,
    format: FORMAT_LABELS[publication.format],
    theme: lookups.themeBySubTheme.get(publication.sub_theme) ?? "Other",
    date: publication.date,
    authors: (publication.authors ?? []).flatMap((id) => {
      const slug = lookups.authorSlugById.get(id);
      return slug ? [slug] : [];
    }),
    language: LANGUAGE_LABELS[publication.language ?? "en"],
    views: publication.views ?? 0,
    status: "real",
    cover: {
      label: `${publication.title} cover`,
      ratio: "4:3",
      kind: "photo",
      // The API has no cover for the seeded data stories; the site's hand-picked stock covers stand in until it does.
      src: publication.cover || publication.cover_url || dataStoryCoverPhotos[publication.slug] || undefined,
    },
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-03-01" -> "1 Mar 2026". Fixed month names, since `Intl` abbreviations differ between Node/ICU versions. Anything unparseable is shown as sent. */
export function formatPublicationDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined;
  return match && month ? `${Number(match[3])} ${month} ${match[1]}` : iso;
}
