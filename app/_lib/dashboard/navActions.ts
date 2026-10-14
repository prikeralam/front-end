"use server";

import { backendRequest } from "../api/backendRequest";
import { getAccessToken } from "../auth/serverAuth";

/** Counts for the sidebar's badges. A count the signed-in role may not read (403) or that fails is left out. */
export type NavCounts = { messages?: number; applications?: number; newVisitors?: number };

async function count(path: string, accessToken: string): Promise<number | undefined> {
  const result = await backendRequest("GET", path, { accessToken }).catch(() => null);
  const body = result?.ok ? (result.data as { count?: unknown } | null) : null;
  return typeof body?.count === "number" ? body.count : undefined;
}

export async function getNavCountsAction(): Promise<NavCounts> {
  const accessToken = await getAccessToken();
  if (!accessToken) return {};
  const [messages, applications, stats] = await Promise.all([
    count("/api/v1/contact-messages/?status=new&page_size=1", accessToken),
    count("/api/v1/applications/?status=new&page_size=1", accessToken),
    backendRequest("GET", "/api/v1/users/stats/", { accessToken }).catch(() => null),
  ]);
  const visitors = stats?.ok ? ((stats.data as { visitors?: { new_7_days?: unknown } } | null)?.visitors?.new_7_days) : undefined;
  return { messages, applications, newVisitors: typeof visitors === "number" ? visitors : undefined };
}
