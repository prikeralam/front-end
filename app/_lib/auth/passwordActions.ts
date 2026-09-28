"use server";

import { uncachedApi } from "../api/client";
import { getAccessToken } from "./serverAuth";

// Password flows (backend Module H). Requesting and confirming a reset are anonymous; changing your own password needs
// the session. Server Actions are public POST endpoints, so every argument is checked before it reaches the backend.

const MAX_EMAIL = 254;
const MAX_PASSWORD = 128;
const MAX_LINK_PART = 256;

/** `reason: "link"`: the invite or reset link was refused (used, expired or altered), so the page offers a new one. */
export type PasswordResult = { ok: true } | { ok: false; message: string; reason?: "link" };

const isText = (value: unknown, max: number): value is string => typeof value === "string" && value.length > 0 && value.length <= max;

/** The first message DRF sent for the password field, or a general one. */
function passwordMessage(error: unknown, field: string, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;
  const body = error as Record<string, unknown>;
  for (const key of [field, "detail", "non_field_errors"]) {
    const value = body[key];
    if (typeof value === "string" && value) return value;
    if (Array.isArray(value) && value.length) return value.join(" ");
  }
  return fallback;
}

const unavailable: PasswordResult = { ok: false, message: "We couldn't reach the server. Please try again." };

/**
 * Asks the backend to email a reset link. The backend answers 204 whether or not the address has an account, so this
 * never reveals which emails are registered; only malformed input and throttling are reported.
 */
export async function requestPasswordResetAction(email: string): Promise<PasswordResult> {
  if (!isText(email, MAX_EMAIL) || !/^[^\s@]+@[^\s@]+$/.test(email.trim())) return { ok: false, message: "Enter the email address of your account." };

  try {
    const result = await uncachedApi().POST("/api/v1/password-reset/", { body: { email: email.trim() } });
    if (result.response.status === 429) return { ok: false, message: "Too many reset requests for this address. Try again in an hour." };
    if (result.response.status === 400) return { ok: false, message: "Enter the email address of your account." };
    return result.response.ok ? { ok: true } : unavailable;
  } catch {
    return unavailable;
  }
}

/** Sets a new password from an invite or reset link. A used, expired or altered link answers 400. */
export async function confirmPasswordResetAction(uid: string, token: string, newPassword: string): Promise<PasswordResult> {
  if (!isText(uid, MAX_LINK_PART) || !isText(token, MAX_LINK_PART)) return { ok: false, message: "This link is incomplete. Open it again from the email." };
  if (!isText(newPassword, MAX_PASSWORD)) return { ok: false, message: "Enter a new password (at most 128 characters)." };

  try {
    const result = await uncachedApi().POST("/api/v1/password-reset/confirm/", { body: { uid, token, new_password: newPassword } });
    if (result.response.ok) return { ok: true };
    if (result.response.status === 400) {
      const error = result.error as Record<string, unknown> | undefined;
      // Password-validator errors come back under new_password; anything else means the link itself was refused.
      if (error && "new_password" in error) return { ok: false, message: passwordMessage(error, "new_password", "Choose a stronger password.") };
      return { ok: false, message: "This link has expired or has already been used. Request a new one below.", reason: "link" };
    }
    return unavailable;
  } catch {
    return unavailable;
  }
}

/** Changes the signed-in user's password; also clears the "must change password" flag set with a temporary one. */
export async function changeOwnPasswordAction(oldPassword: string, newPassword: string): Promise<PasswordResult> {
  if (!isText(oldPassword, MAX_PASSWORD)) return { ok: false, message: "Enter your current password." };
  if (!isText(newPassword, MAX_PASSWORD)) return { ok: false, message: "Enter a new password (at most 128 characters)." };

  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, message: "Your session has ended. Please sign in again." };

  try {
    const result = await uncachedApi(accessToken).POST("/api/v1/users/me/password/", { body: { old_password: oldPassword, new_password: newPassword } });
    if (result.response.ok) return { ok: true };
    if (result.response.status === 401) return { ok: false, message: "Your session has ended. Please sign in again." };
    if (result.response.status === 400) {
      const error = result.error as Record<string, unknown> | undefined;
      if (error && "old_password" in error) return { ok: false, message: passwordMessage(error, "old_password", "Your current password is incorrect.") };
      return { ok: false, message: passwordMessage(error, "new_password", "Choose a stronger password.") };
    }
    return unavailable;
  } catch {
    return unavailable;
  }
}
