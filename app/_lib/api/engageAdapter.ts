import type { JobListing, PRIEvent } from "../types";
import { formatPublicationDate } from "./publicationAdapter";
import type { components } from "./schema";

type ApiEvent = components["schemas"]["Event"];
type ApiJob = components["schemas"]["JobOpening"];

/** Today as "YYYY-MM-DD" in India, where PRI's events happen; dates from the API compare as strings. */
export function todayInIndia(now: Date = new Date()): string {
  return new Date(now.getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** "1 Nov 2026", or "1 Nov 2026 to 31 Dec 2026" for something that runs over several days. */
function dateRange(start: string, end: string | null): string {
  return end && end !== start ? `${formatPublicationDate(start)} to ${formatPublicationDate(end)}` : formatPublicationDate(start);
}

/**
 * Maps a backend `Event`. An event is upcoming until its last day has passed, so a running campaign stays
 * upcoming; `today` is passed in so pages (and tests) decide it once.
 */
export function toEvent(event: ApiEvent, today: string): PRIEvent {
  const end = event.end_date ?? null;
  const image = event.image || event.image_url || undefined;
  return {
    slug: event.slug,
    kind: event.kind === "campaign" ? "campaign" : "event",
    title: event.title,
    summary: event.summary ?? "",
    body: event.body ?? "",
    startDate: event.start_date,
    endDate: end,
    dateLabel: dateRange(event.start_date, end),
    location: event.location ?? "",
    image: image ? { label: `${event.title} photograph`, ratio: "16:9", kind: "photo", src: image } : null,
    // The backend only accepts https; checked again because it becomes a link.
    registrationUrl: event.registration_url?.startsWith("https://") ? event.registration_url : undefined,
    timing: (end ?? event.start_date) >= today ? "upcoming" : "past",
  };
}

export function toJob(job: ApiJob): JobListing {
  return {
    slug: job.slug,
    title: job.title,
    summary: job.summary ?? "",
    description: job.description ?? "",
    location: job.location ?? "",
    employment: job.employment_type ?? "",
    rolling: job.rolling ?? true,
    deadline: !job.rolling && job.deadline ? formatPublicationDate(job.deadline) : null,
  };
}

/** How a job reads on its card: rolling roles say so, others show their deadline. */
export function jobAvailability(job: JobListing): string {
  if (job.rolling || !job.deadline) return "Rolling, apply any time";
  return `Apply by ${job.deadline}`;
}
