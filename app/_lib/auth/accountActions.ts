"use server";

import { uncachedApi } from "../api/client";
import { PURPOSES, safeNext, type Purpose } from "../signup";
import { getAccessToken } from "./serverAuth";

// A visitor's own account (backend Module H): confirming the email, asking for a new link, and the sign-up answers.
// Server Actions are public POST endpoints, so every argument is checked before it reaches the backend.

const MAX_LINK_PART = 256;
const isText = (value: unknown, max: number): value is string => typeof value === "string" && value.length > 0 && value.length <= max;

/** `invalid`: the link was refused (used, expired or altered). */
export type VerifyResult = "confirmed" | "invalid" | "error";

/** Confirms an address from the emailed link. Needs no session: the link itself is the proof. */
export async function verifyEmailAction(uid: string, token: string): Promise<VerifyResult> {
  if (!isText(uid, MAX_LINK_PART) || !isText(token, MAX_LINK_PART)) return "invalid";
  try {
    const result = await uncachedApi().POST("/api/v1/verify-email/", { body: { uid, token } });
    if (result.response.status === 204) return "confirmed";
    return result.response.status === 400 ? "invalid" : "error";
  } catch {
    return "error";
  }
}

export type ResendResult = "sent" | "signed-out" | "throttled" | "error";

/** Emails the signed-in visitor a new confirmation link, which brings them back to `next`. */
export async function resendVerificationAction(next: string): Promise<ResendResult> {
  const token = await getAccessToken();
  if (!token) return "signed-out";
  try {
    const result = await uncachedApi(token).POST("/api/v1/users/me/resend-verification/", { body: { next: safeNext(next) } });
    if (result.response.status === 204) return "sent";
    if (result.response.status === 401) return "signed-out";
    return result.response.status === 429 ? "throttled" : "error";
  } catch {
    return "error";
  }
}

export type Profile = { organisation: string; purpose: Purpose | ""; newsletter: boolean };

const isPurpose = (value: unknown): value is Purpose => PURPOSES.some((p) => p.value === value);

/** The signed-in user's sign-up answers, or null when signed out or unreachable. */
export async function getProfileAction(): Promise<Profile | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const result = await uncachedApi(token).GET("/api/v1/users/me/");
    if (!result.data) return null;
    const { organisation, purpose, newsletter_opt_in: newsletter } = result.data;
    return { organisation: organisation ?? "", purpose: isPurpose(purpose) ? purpose : "", newsletter: !!newsletter };
  } catch {
    return null;
  }
}

/** Saves the signed-in user's sign-up answers. */
export async function updateProfileAction(profile: Profile): Promise<"saved" | "invalid" | "signed-out" | "error"> {
  if (!profile || typeof profile !== "object") return "invalid";
  const { organisation, purpose, newsletter } = profile;
  if (typeof organisation !== "string" || organisation.length > 200 || (purpose !== "" && !isPurpose(purpose)) || typeof newsletter !== "boolean") return "invalid";
  const token = await getAccessToken();
  if (!token) return "signed-out";
  try {
    const result = await uncachedApi(token).PATCH("/api/v1/users/me/", {
      body: { organisation: organisation.trim(), purpose, newsletter_opt_in: newsletter },
    });
    if (result.response.ok) return "saved";
    if (result.response.status === 401) return "signed-out";
    return result.response.status === 400 ? "invalid" : "error";
  } catch {
    return "error";
  }
}
