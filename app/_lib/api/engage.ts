import "server-only";
import type { JobListing, PRIEvent } from "../types";
import { api } from "./client";
import { todayInIndia, toEvent, toJob } from "./engageAdapter";
import { collectAllPages } from "./pagination";
import { unwrap } from "./request";

const EVENTS_PATH = "/api/v1/events/";
const EVENT_PATH = "/api/v1/events/{slug}/";
const JOBS_PATH = "/api/v1/jobs/";
const JOB_PATH = "/api/v1/jobs/{slug}/";

/** Published events and campaigns, newest first, each marked upcoming or past as of today. */
export async function listEvents(): Promise<PRIEvent[]> {
  const events = await collectAllPages(async (page) => unwrap(await api.GET(EVENTS_PATH, { params: { query: { page } } }), EVENTS_PATH));
  const today = todayInIndia();
  return events.map((event) => toEvent(event, today));
}

export async function getEventBySlug(slug: string): Promise<PRIEvent | null> {
  const result = await api.GET(EVENT_PATH, { params: { path: { slug } } });
  if (result.response.status === 404) return null;
  return toEvent(unwrap(result, EVENT_PATH), todayInIndia());
}

/** Published job openings in the order staff set. */
export async function listJobs(): Promise<JobListing[]> {
  const jobs = await collectAllPages(async (page) => unwrap(await api.GET(JOBS_PATH, { params: { query: { page } } }), JOBS_PATH));
  return jobs.map((job) => toJob(job));
}

/** The current link to a published role's job description PDF, or null when it has none (or no such role). */
export async function getJobDescriptionUrl(slug: string): Promise<string | null> {
  const result = await api.GET(JOB_PATH, { params: { path: { slug } } });
  if (result.response.status === 404) return null;
  const url = unwrap(result, JOB_PATH).description_pdf;
  return typeof url === "string" && /^https?:\/\//.test(url) ? url : null;
}

export async function getJobBySlug(slug: string): Promise<JobListing | null> {
  const result = await api.GET(JOB_PATH, { params: { path: { slug } } });
  if (result.response.status === 404) return null;
  return toJob(unwrap(result, JOB_PATH));
}
