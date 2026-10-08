"use server";

import { headers } from "next/headers";
import { uncachedApi } from "../api/client";
import { createRateLimiter } from "../rateLimit";
import { CONTACT_CATEGORIES, type ContactCategory, type ContactField, type ContactInput, type ContactResult } from "./contactTypes";

// The public contact form (backend Module G, contact slice). Server Actions are public POST endpoints, so every field is
// checked here as well as by the backend. The backend only ever sees this server, so the per-visitor limit lives here.

const LIMITS = { name: 120, email: 254, message: 5000, website: 200 };
const MIN_MESSAGE = 10;
const perVisitor = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

const isCategory = (value: unknown): value is ContactCategory => typeof value === "string" && (CONTACT_CATEGORIES as readonly string[]).includes(value);
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** The visitor's address as this site's nginx saw it; it sets X-Real-IP itself, so a client can't choose it. */
async function visitorKey(): Promise<string> {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function check(input: ContactInput): Partial<Record<ContactField, string>> {
  const errors: Partial<Record<ContactField, string>> = {};
  if (!isCategory(input.category)) errors.category = "Choose an enquiry type.";
  const name = text(input.name);
  if (!name || name.length > LIMITS.name) errors.name = "Enter your name (up to 120 characters).";
  const email = text(input.email);
  if (email.length > LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  const message = text(input.message);
  if (message.length < MIN_MESSAGE) errors.message = "Please write a little more (at least 10 characters).";
  else if (message.length > LIMITS.message) errors.message = "Keep your message under 5,000 characters.";
  return errors;
}

const FIELDS: ContactField[] = ["category", "name", "email", "message"];

export async function sendContactMessageAction(input: ContactInput): Promise<ContactResult> {
  if (!input || typeof input !== "object") return { ok: false, message: "Check the highlighted fields." };
  const fieldErrors = check(input);
  if (Object.keys(fieldErrors).length > 0) return { ok: false, message: "Check the highlighted fields.", fieldErrors };

  // The hidden `website` field is a bot trap: say it worked, and send nothing.
  const website = typeof input.website === "string" ? input.website.slice(0, LIMITS.website) : "";
  if (website.trim()) return { ok: true };

  if (!perVisitor(await visitorKey())) return { ok: false, message: "You've sent several messages already. Please try again in an hour, or email us directly." };

  try {
    const result = await uncachedApi().POST("/api/v1/contact/", {
      body: { category: input.category as ContactCategory, name: text(input.name), email: text(input.email), message: text(input.message) },
    });
    if (result.response.ok) return { ok: true };
    if (result.response.status === 429) return { ok: false, message: "We've received a lot of messages just now. Please try again later, or email us directly." };
    if (result.response.status === 400) {
      const body = (result.error ?? {}) as Record<string, unknown>;
      const serverErrors: Partial<Record<ContactField, string>> = {};
      for (const field of FIELDS) {
        const value = body[field];
        if (Array.isArray(value) && value.length) serverErrors[field] = value.join(" ");
      }
      return { ok: false, message: "Check the highlighted fields.", fieldErrors: serverErrors };
    }
    return { ok: false, message: "We couldn't send your message just now. Please try again, or email us directly." };
  } catch {
    return { ok: false, message: "We couldn't reach the server. Please try again, or email us directly." };
  }
}
