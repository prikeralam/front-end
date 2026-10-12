import type { Metadata } from "next";
import { org } from "../_content/org";
import type { DatasetDetail } from "./datasetTypes";
import type { JobListing, Person, PRIEvent, Publication } from "./types";

/**
 * Search and sharing metadata. Every canonical link, sitemap entry and structured-data URL points at the production
 * domain, whichever environment renders the page: staging copies then defer to production, and robots.txt keeps
 * staging out of search engines altogether.
 */
export const SITE_URL = "https://priresearch.in";
export const SITE_NAME = org.name;
export const DEFAULT_DESCRIPTION =
  "The Policy and Research Initiative (PRI) is a think tank in Kerala advancing inclusive development, social justice and national integration through data-driven research, evidence-based policy advocacy and strategic collaborations.";
/** The share card used when a page has no image of its own (`app/og/route.tsx`). */
export const DEFAULT_SHARE_IMAGE = "/og";

const LOGO_URL = `${SITE_URL}/logo.png`;
const SOCIAL_PROFILES = ["https://www.linkedin.com/company/priresearch", "https://www.instagram.com/priresearch"];

export const absoluteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

/** Plain text cut to about what search results show, ending on a word. */
export function summarize(text: string | undefined | null, max = 160): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max / 2)).replace(/[\s,;:.]+$/, "")}…`;
}

type PageMeta = {
  title: string;
  description?: string;
  /** The page's own address, e.g. "/research/plus-one-seats". */
  path: string;
  /** A record's own picture (cover, photo); the default share card otherwise. */
  image?: string;
  type?: "website" | "article" | "profile";
  /** Keeps the page out of search results (private or deferred pages). */
  noindex?: boolean;
};

/** Title, description, canonical address and share cards for one page. */
export function pageMetadata({ title, description, path, image, type = "website", noindex }: PageMeta): Metadata {
  const text = summarize(description) || DEFAULT_DESCRIPTION;
  const images = [image ? absoluteUrl(image) : absoluteUrl(DEFAULT_SHARE_IMAGE)];
  return {
    title,
    description: text,
    alternates: { canonical: path },
    openGraph: { title, description: text, url: path, siteName: SITE_NAME, locale: "en_IN", type, images },
    twitter: { card: "summary_large_image", title, description: text, images },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

// ---------------------------------------------------------------------------
// Structured data (schema.org JSON-LD): what Google reads to understand the organisation, its research and data.

type JsonLd = Record<string, unknown>;

const PUBLISHER: JsonLd = { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: LOGO_URL };

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ResearchOrganization",
    name: SITE_NAME,
    alternateName: org.short,
    url: SITE_URL,
    logo: LOGO_URL,
    description: DEFAULT_DESCRIPTION,
    email: org.email,
    telephone: org.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${org.address[0]}, ${org.address[1]}`,
      addressLocality: "Malappuram",
      addressRegion: "Kerala",
      postalCode: org.address[3],
      addressCountry: "IN",
    },
    sameAs: SOCIAL_PROFILES,
  };
}

export function websiteJsonLd(): JsonLd {
  return { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, alternateName: org.short, url: SITE_URL, publisher: PUBLISHER };
}

export function publicationJsonLd(publication: Publication, authors: Person[]): JsonLd {
  const isReport = publication.format === "Report" || publication.format === "Working Paper" || publication.format === "Brief";
  return {
    "@context": "https://schema.org",
    "@type": isReport ? "Report" : "ScholarlyArticle",
    headline: summarize(publication.title, 110),
    name: publication.title,
    description: summarize(publication.abstract, 300) || undefined,
    url: absoluteUrl(`/research/${publication.slug}`),
    datePublished: /^\d{4}-\d{2}-\d{2}/.test(publication.date) ? publication.date : undefined,
    inLanguage: publication.language === "Malayalam" ? "ml" : "en",
    about: publication.theme || undefined,
    image: publication.cover?.src ? absoluteUrl(publication.cover.src) : undefined,
    author: authors.length > 0 ? authors.map((a) => ({ "@type": "Person", name: a.name, url: absoluteUrl(`/people/${a.slug}`) })) : PUBLISHER,
    publisher: PUBLISHER,
  };
}

/** Datasets marked up this way can appear in Google Dataset Search. */
export function datasetJsonLd(dataset: DatasetDetail): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: dataset.title,
    description: summarize(dataset.description, 5000) || `${dataset.title}, from the Policy and Research Initiative's data repository.`,
    url: absoluteUrl(`/data/${dataset.slug}`),
    keywords: [dataset.theme, ...dataset.tags].filter(Boolean),
    creator: PUBLISHER,
    publisher: PUBLISHER,
    isAccessibleForFree: dataset.visibility === "public",
    dateModified: dataset.updatedAt,
    temporalCoverage: dataset.timePeriod || dataset.year || undefined,
    spatialCoverage: dataset.geography ? { "@type": "Place", name: dataset.geography } : undefined,
    variableMeasured: dataset.columns.length > 0 ? dataset.columns.slice(0, 50) : undefined,
    citation: dataset.citation || undefined,
    // Download links are deliberately left out: they are signed and expire, and some need approval.
    distribution: dataset.formats.map((format) => ({ "@type": "DataDownload", encodingFormat: format, contentUrl: absoluteUrl(`/data/${dataset.slug}`) })),
  };
}

export function personJsonLd(person: Person): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.role || undefined,
    description: summarize(person.bio, 300) || undefined,
    image: person.photo?.src ? absoluteUrl(person.photo.src) : undefined,
    url: absoluteUrl(`/people/${person.slug}`),
    sameAs: person.linkedin ? [person.linkedin] : undefined,
    worksFor: PUBLISHER,
  };
}

const ATTENDANCE_MODE: Record<NonNullable<PRIEvent["mode"]>, string> = {
  in_person: "https://schema.org/OfflineEventAttendanceMode",
  online: "https://schema.org/OnlineEventAttendanceMode",
  hybrid: "https://schema.org/MixedEventAttendanceMode",
};

/** "2026-12-14" plus "09:30" -> "2026-12-14T09:30:00+05:30" (PRI's events are in India); the date alone otherwise. */
function eventDateTime(date: string, time: string | null): string {
  return time ? `${date}T${time}:00+05:30` : date;
}

export function eventJsonLd(event: PRIEvent): JsonLd {
  const place = { "@type": "Place", name: event.location || "Kerala, India", address: event.location || "Kerala, India" };
  const images = [event.image?.src, ...event.gallery.map((g) => g.src)].filter((src): src is string => Boolean(src));
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: summarize(event.summary || event.body, 300) || undefined,
    startDate: eventDateTime(event.startDate, event.startTime),
    endDate: event.endDate ? eventDateTime(event.endDate, event.endTime) : event.endTime ? eventDateTime(event.startDate, event.endTime) : undefined,
    eventAttendanceMode: ATTENDANCE_MODE[event.mode ?? "in_person"],
    eventStatus: "https://schema.org/EventScheduled",
    location: event.mode === "online" ? { "@type": "VirtualLocation", name: event.location || "Online" } : place,
    image: images.length > 0 ? images.map(absoluteUrl) : undefined,
    url: absoluteUrl(`/events/${event.slug}`),
    performer: event.speakers.length > 0 ? event.speakers.map((s) => ({ "@type": "Person", name: s.name })) : undefined,
    organizer: [PUBLISHER, ...event.collaborators.map((name) => ({ "@type": "Organization", name }))],
  };
}

/**
 * Google for Jobs. `datePosted` is required there; the API doesn't send it to this adapter, so it falls back to today,
 * which keeps rolling roles looking current.
 */
export function jobPostingJsonLd(job: JobListing, datePosted: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: [job.summary, job.description].filter(Boolean).join("\n\n") || `${job.title} at the Policy and Research Initiative.`,
    datePosted,
    employmentType: job.employment || undefined,
    hiringOrganization: { "@type": "Organization", name: SITE_NAME, sameAs: SITE_URL, logo: LOGO_URL },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location || "Malappuram", addressRegion: "Kerala", addressCountry: "IN" },
    },
    url: absoluteUrl(`/careers/jobs/${job.slug}`),
    directApply: true,
  };
}

/** JSON for a `<script type="application/ld+json">`, with `<` escaped so content can't close the tag. */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
