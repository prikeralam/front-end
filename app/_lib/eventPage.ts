import type { PRIEvent } from "./types";

/** Text typed with line breaks (a summary, "other details"), as paragraphs: one per non-empty line. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** "Dr. A. Name (Chairman, SAFI)" -> {name: "Dr. A. Name", detail: "Chairman, SAFI"}. */
export function splitSpeaker(name: string): { name: string; detail: string } {
  const match = /^(.+?)\s*\((.+)\)\s*$/.exec(name.trim());
  return match ? { name: match[1], detail: match[2] } : { name: name.trim(), detail: "" };
}

const TITLES = new Set(["dr", "adv", "prof", "mr", "mrs", "ms", "sri", "smt", "sayyid", "syed", "panakkad"]);

/**
 * Up to two initials for a speaker's avatar, skipping honorifics and single-letter initials where possible. Empty for
 * a list of people ("Demographers, economists, ..."), which gets a group icon instead.
 */
export function initials(name: string): string {
  const person = splitSpeaker(name).name;
  if (person.includes(",")) return "";
  const words = person.split(/[\s.]+/)
    .filter((word) => /^\p{L}/u.test(word) && !TITLES.has(word.toLowerCase()));
  const full = words.filter((word) => word.length > 1);
  const picked = full.length ? full : words;
  if (!picked.length) return "";
  const letters = picked.length > 1 ? [picked[0], picked[picked.length - 1]] : [picked[0]];
  return letters.map((word) => word[0].toUpperCase()).join("");
}

/** Google Maps search for a venue. */
export function directionsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

const compact = (date: string) => date.replaceAll("-", "");

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * An "Add to Google Calendar" link. Times are India time as entered (`ctz` tells Google so); an event with no time is
 * all-day (Google's end date is exclusive), and one with a start but no end time is given an hour. Null while the
 * date isn't fixed yet, since there is nothing true to add.
 */
export function googleCalendarUrl(event: PRIEvent, pageUrl: string): string | null {
  if (!event.dateFixed) return null;
  const lastDay = event.endDate ?? event.startDate;
  let dates: string;
  if (event.startTime) {
    const start = `${compact(event.startDate)}T${event.startTime.replace(":", "")}00`;
    let end: string;
    if (event.endTime) end = `${compact(lastDay)}T${event.endTime.replace(":", "")}00`;
    else {
      const [h, m] = event.startTime.split(":").map(Number);
      const next = h + 1;
      end = next < 24 ? `${compact(event.startDate)}T${String(next).padStart(2, "0")}${String(m).padStart(2, "0")}00` : `${compact(event.startDate)}T235900`;
    }
    dates = `${start}/${end}`;
  } else {
    dates = `${compact(event.startDate)}/${compact(addDays(lastDay, 1))}`;
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates,
    ctz: "Asia/Kolkata",
    details: [paragraphs(event.summary).join("\n"), pageUrl].filter(Boolean).join("\n\n"),
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Other events to suggest under one: upcoming ones soonest first, then past ones newest first. */
export function moreEvents(events: PRIEvent[], currentSlug: string, count = 3): PRIEvent[] {
  const others = events.filter((e) => e.slug !== currentSlug);
  const upcoming = others.filter((e) => e.timing === "upcoming").sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = others.filter((e) => e.timing === "past").sort((a, b) => b.startDate.localeCompare(a.startDate));
  return [...upcoming, ...past].slice(0, count);
}
