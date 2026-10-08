"use server";

import { headers } from "next/headers";
import { apiBaseUrl } from "../api/client";
import { createRateLimiter } from "../rateLimit";
import {
  APPLICATION_KINDS,
  DOCUMENT_EXTENSIONS,
  DOCUMENT_MAX_MB,
  type ApplicationField,
  type ApplicationKind,
  type ApplicationResult,
} from "./applyTypes";

// The public application form (fellowships, internships, job openings; website-backend's careers app). Server Actions
// are public POST endpoints, so every field is checked here as well as by the backend, which also checks each file's
// content. The backend only ever sees this server, so the per-visitor limit lives here.

const LIMITS = { full_name: 120, email: 254, job: 50, website: 200 };
const perVisitor = createRateLimiter({ limit: 3, windowMs: 60 * 60 * 1000 });
const FIELDS: ApplicationField[] = ["kind", "job", "full_name", "email", "cv", "sop"];

const isKind = (value: unknown): value is ApplicationKind => typeof value === "string" && (APPLICATION_KINDS as readonly string[]).includes(value);
const text = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

async function visitorKey(): Promise<string> {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** Why a CV or SOP can't be sent, or null when it is fine. */
function checkDocument(value: FormDataEntryValue | null, what: string): string | null {
  if (!(value instanceof File) || value.size === 0) return `Attach your ${what}.`;
  const extension = value.name.includes(".") ? value.name.split(".").pop()!.toLowerCase() : "";
  if (!(DOCUMENT_EXTENSIONS as readonly string[]).includes(extension)) return `Your ${what} must be a PDF or Word file (.pdf, .doc, .docx).`;
  if (value.size > DOCUMENT_MAX_MB * 1024 * 1024) return `Your ${what} must be ${DOCUMENT_MAX_MB} MB or smaller.`;
  return null;
}

export async function submitApplicationAction(form: FormData): Promise<ApplicationResult> {
  if (!(form instanceof FormData)) return { ok: false, message: "Check the highlighted fields." };

  const kind = text(form.get("kind"));
  const job = text(form.get("job"));
  const fullName = text(form.get("full_name"));
  const email = text(form.get("email"));
  const cv = form.get("cv");
  const sop = form.get("sop");

  const fieldErrors: Partial<Record<ApplicationField, string>> = {};
  if (!isKind(kind)) fieldErrors.kind = "Choose what you are applying for.";
  if (kind === "job" && (!job || job.length > LIMITS.job || !/^[a-z0-9-]+$/.test(job))) fieldErrors.job = "Choose the role you are applying for.";
  if (!fullName || fullName.length > LIMITS.full_name) fieldErrors.full_name = "Enter your full name (up to 120 characters).";
  if (email.length > LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Enter a valid email address.";
  const cvError = checkDocument(cv, "CV");
  if (cvError) fieldErrors.cv = cvError;
  const sopError = checkDocument(sop, "statement of purpose");
  if (sopError) fieldErrors.sop = sopError;
  if (Object.keys(fieldErrors).length > 0) return { ok: false, message: "Check the highlighted fields.", fieldErrors };

  // The hidden `website` field is a bot trap: say it worked, and send nothing.
  if (text(form.get("website")).slice(0, LIMITS.website)) return { ok: true };

  if (!perVisitor(await visitorKey())) return { ok: false, message: "You've sent several applications already. Please try again in an hour, or email us directly." };

  const body = new FormData();
  body.set("kind", kind);
  if (kind === "job") body.set("job", job);
  body.set("full_name", fullName);
  body.set("email", email);
  body.set("cv", cv as File);
  body.set("sop", sop as File);

  try {
    const response = await fetch(`${apiBaseUrl()}/api/v1/apply/`, { method: "POST", body, headers: { Accept: "application/json" }, cache: "no-store" });
    if (response.ok) return { ok: true };
    if (response.status === 429) return { ok: false, message: "We've received a lot of applications just now. Please try again later, or email us directly." };
    if (response.status === 400) {
      const errors = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      const serverErrors: Partial<Record<ApplicationField, string>> = {};
      for (const field of FIELDS) {
        const value = errors[field];
        if (Array.isArray(value) && value.length) serverErrors[field] = value.join(" ");
        else if (typeof value === "string") serverErrors[field] = value;
      }
      return { ok: false, message: "Check the highlighted fields.", fieldErrors: serverErrors };
    }
    return { ok: false, message: "We couldn't send your application just now. Please try again, or email us directly." };
  } catch {
    return { ok: false, message: "We couldn't reach the server. Please try again, or email us directly." };
  }
}
