"use server";

import { backendRequest } from "../api/backendRequest";
import { refreshPublicPages } from "../api/publicCache";
import { getAccessToken } from "../auth/serverAuth";
import { IMAGE_ACCEPT, KEY_PATTERN } from "../cms/resources";

// Server Actions are public POST endpoints: every argument is validated here, and the backend decides who may change
// an event's photos (the same rule as editing the event).

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_CAPTION = 200;

export type EventPhoto = { id: number; url: string; caption: string };
export type EventPhotosResult = { status: "ok"; photos: EventPhoto[] } | { status: "signed-out" | "not-found" | "error" };
export type PhotoChange = { ok: true } | { ok: false; message: string };

const signedOut: PhotoChange = { ok: false, message: "Your session has ended. Please sign in again." };

function refusal(status: number, data: unknown): PhotoChange {
  if (status === 401) return signedOut;
  if (status === 403) return { ok: false, message: "Your role isn't allowed to change this event's photos." };
  if (status === 404) return { ok: false, message: "That event or photo no longer exists." };
  if (status === 400 && data && typeof data === "object") {
    const messages = Object.values(data as Record<string, unknown>).flatMap((v) => (Array.isArray(v) ? v : [v])).filter((v) => typeof v === "string");
    if (messages.length) return { ok: false, message: messages.join(" ") };
  }
  return { ok: false, message: "Something went wrong on the server. Please try again." };
}

const validSlug = (slug: unknown): slug is string => typeof slug === "string" && KEY_PATTERN.test(slug);

/** The event's gallery as the signed-in user may see it (drafts included for their editors). */
export async function listEventPhotosAction(slug: string): Promise<EventPhotosResult> {
  if (!validSlug(slug)) return { status: "not-found" };
  const accessToken = await getAccessToken();
  if (!accessToken) return { status: "signed-out" };
  const result = await backendRequest("GET", `/api/v1/events/${slug}/`, { accessToken });
  if (result.status === 404) return { status: "not-found" };
  if (!result.ok) return { status: "error" };
  const images = (result.data as { images?: unknown } | null)?.images;
  const photos = (Array.isArray(images) ? images : []).flatMap((item): EventPhoto[] => {
    const { id, image, caption } = (item ?? {}) as Record<string, unknown>;
    return typeof id === "number" && typeof image === "string" ? [{ id, url: image, caption: typeof caption === "string" ? caption : "" }] : [];
  });
  return { status: "ok", photos };
}

/** Adds a photo. `form` holds `image` (JPG, PNG or WebP up to 5 MB) and an optional `caption`. */
export async function addEventPhotoAction(slug: string, form: FormData): Promise<PhotoChange> {
  if (!validSlug(slug)) return { ok: false, message: "That event no longer exists." };
  if (!(form instanceof FormData)) return { ok: false, message: "Choose a photo." };
  const file = form.get("image");
  const caption = String(form.get("caption") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose a photo to upload." };
  if (file.size > MAX_PHOTO_BYTES) return { ok: false, message: "That photo is larger than 5 MB." };
  const extension = /\.[^.]+$/.exec(file.name.toLowerCase())?.[0] ?? "";
  if (!IMAGE_ACCEPT.split(",").includes(extension)) return { ok: false, message: "Photos must be JPG, PNG or WebP." };
  if (caption.length > MAX_CAPTION) return { ok: false, message: `Keep the caption under ${MAX_CAPTION} characters.` };

  const accessToken = await getAccessToken();
  if (!accessToken) return signedOut;
  const upload = new FormData();
  upload.append("image", file, file.name);
  if (caption) upload.append("caption", caption);
  const result = await backendRequest("POST", `/api/v1/events/${slug}/images/`, { accessToken, form: upload });
  if (!result.ok) return refusal(result.status, result.data);
  refreshPublicPages();
  return { ok: true };
}

/** Removes one photo; the backend deletes the stored file. */
export async function removeEventPhotoAction(slug: string, id: number): Promise<PhotoChange> {
  if (!validSlug(slug) || !Number.isInteger(id) || id < 1 || id >= 2 ** 31) return { ok: false, message: "That photo no longer exists." };
  const accessToken = await getAccessToken();
  if (!accessToken) return signedOut;
  const result = await backendRequest("DELETE", `/api/v1/events/${slug}/images/${id}/`, { accessToken });
  if (!result.ok) return refusal(result.status, result.data);
  refreshPublicPages();
  return { ok: true };
}
