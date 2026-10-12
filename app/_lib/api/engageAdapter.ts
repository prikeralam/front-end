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

/** "09:30:00" -> "9:30 AM"; null for anything unparseable. Times are local and shown as entered. */
export function formatTime(value: string | null | undefined): string | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value ?? "");
  if (!match) return null;
  const hours = Number(match[1]);
  if (hours > 23) return null;
  const suffix = hours < 12 ? "AM" : "PM";
  return `${hours % 12 === 0 ? 12 : hours % 12}:${match[2]} ${suffix}`;
}

/** "9:30 AM - 5:00 PM", just the start, or "". */
export function timeRange(start: string | null | undefined, end: string | null | undefined): string {
  const from = formatTime(start);
  const to = formatTime(end);
  if (!from) return "";
  return to ? `${from} - ${to}` : from;
}

/** "Role: Name (detail)" -> {role, name}; the first ": " separates, so names may contain colons after it. */
export function splitLabelled(line: string): { label: string; text: string } {
  const at = line.indexOf(": ");
  return at > 0 ? { label: line.slice(0, at).trim(), text: line.slice(at + 2).trim() } : { label: "", text: line.trim() };
}

const MODES = ["in_person", "online", "hybrid"] as const;

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
    // A date that isn't fixed yet reads as the note; start_date still orders it and decides upcoming/past.
    dateLabel: event.date_note?.trim() || dateRange(event.start_date, end),
    dateFixed: !event.date_note?.trim(),
    timeLabel: timeRange(event.start_time, event.end_time),
    startTime: event.start_time ? event.start_time.slice(0, 5) : null,
    endTime: event.end_time ? event.end_time.slice(0, 5) : null,
    location: event.location ?? "",
    mode: MODES.find((m) => m === event.mode) ?? null,
    collaborators: (event.collaborators ?? []).filter(Boolean),
    speakers: (event.speakers ?? []).filter(Boolean).map((line) => {
      const { label, text } = splitLabelled(line);
      return { role: label, name: text };
    }),
    focusAreas: (event.focus_areas ?? []).filter(Boolean).map((line) => {
      const { label, text } = splitLabelled(line);
      return label ? { heading: label, text } : { text };
    }),
    image: image ? { label: `${event.title} photograph`, ratio: "16:9", kind: "photo", src: image } : null,
    gallery: (event.images ?? []).flatMap((photo, i) =>
      photo.image ? [{ label: photo.caption || `${event.title}, photo ${i + 1}`, ratio: "4:3" as const, kind: "photo" as const, src: photo.image }] : [],
    ),
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
