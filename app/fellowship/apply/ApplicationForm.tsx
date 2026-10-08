"use client";

import { useState, type FormEvent } from "react";
import { submitApplicationAction } from "../../_lib/apply/applyActions";
import {
  APPLICATION_KINDS,
  applicationKindLabels,
  DOCUMENT_ACCEPT,
  DOCUMENT_MAX_MB,
  type ApplicationField,
  type ApplicationKind,
  type ApplicationResult,
} from "../../_lib/apply/applyTypes";

const labelClass = "mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f7899]";
const inputClass =
  "w-full rounded-md border border-[#dcdee8] bg-white px-3 text-[15px] text-[#171a2b] outline-none transition-colors focus:border-[#253D9A] focus:ring-2 focus:ring-[#253D9A]/20 aria-[invalid=true]:border-[#E4633F]";
const fileClass =
  "block w-full rounded-md border border-dashed border-[#d3d8e8] bg-[#fafbfd] p-3 text-[13px] text-[#5b6280] file:mr-3 file:rounded-md file:border file:border-[#d9ddea] file:bg-white file:px-3 file:py-1.5 file:text-[12.5px] file:font-semibold file:text-[#253D9A] aria-[invalid=true]:border-[#E4633F]";
const fieldError = "mt-1.5 text-[12.5px] text-[#B4432A]";
const hint = "mt-1.5 text-[12.5px] text-[#6f7899]";

const unreachable = (): ApplicationResult => ({ ok: false, message: "We couldn't reach the server. Please try again, or email us directly." });

type Role = { slug: string; title: string };

/** One form for fellowships, internships and the open roles. Files travel as multipart through the Server Action. */
export default function ApplicationForm({ roles, initialRole, email: orgEmail }: { roles: Role[]; initialRole?: string; email: string }) {
  const startsWithRole = !!initialRole && roles.some((r) => r.slug === initialRole);
  const [kind, setKind] = useState<ApplicationKind>(startsWithRole ? "job" : "fellowship");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ApplicationField, string>>>({});
  const [sentTo, setSentTo] = useState<string | null>(null);
  // Without open roles there is nothing to choose, so "a job opening" isn't offered.
  const kinds = APPLICATION_KINDS.filter((k) => k !== "job" || roles.length > 0);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    setFieldErrors({});
    const result = await submitApplicationAction(form).catch(unreachable);
    setBusy(false);
    if (result.ok) {
      setSentTo(String(form.get("email") ?? "").trim());
      return;
    }
    setError(result.message);
    setFieldErrors(result.fieldErrors ?? {});
  }

  if (sentTo) {
    return (
      <div className="rounded-lg border border-[#e3e6f0] bg-white p-6 sm:p-8" role="status">
        <p className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0F6B5C]">Application sent</p>
        <p className="mt-3 text-[18px] leading-snug text-[#171a2b]">Thank you. We&rsquo;ve received your application.</p>
        <p className="mt-2 text-[14.5px] leading-relaxed text-[#4b4f66]">
          Our team reviews applications as they come in. If your profile is a good fit, we will write to <span className="font-semibold text-[#171a2b]">{sentTo}</span>.
        </p>
      </div>
    );
  }

  const describe = (field: ApplicationField, withHint = false) =>
    [fieldErrors[field] ? `apply-${field}-error` : "", withHint ? `apply-${field}-hint` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <form onSubmit={submit} noValidate aria-busy={busy} className="rounded-lg border border-[#e3e6f0] bg-white p-6 sm:p-8">
      <h2 className="text-[20px] leading-tight text-[#171a2b]">Apply to PRI</h2>
      <p className="mt-1.5 text-[14px] text-[#5b6280]">Applications are open on a rolling basis. All fields are required.</p>

      <div role="alert" className={error ? "mt-5 rounded-md border border-[#E4633F]/30 bg-[#E4633F]/8 p-3 text-[13.5px] leading-relaxed text-[#4b4f66]" : "sr-only"}>
        {error}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="apply-kind" className={labelClass}>Applying for</label>
          <select
            id="apply-kind"
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as ApplicationKind)}
            aria-invalid={!!fieldErrors.kind}
            aria-describedby={describe("kind")}
            className={`${inputClass} h-11 px-2`}
          >
            {kinds.map((k) => (
              <option key={k} value={k}>{applicationKindLabels[k]}</option>
            ))}
          </select>
          {fieldErrors.kind && <p id="apply-kind-error" className={fieldError}>{fieldErrors.kind}</p>}
        </div>
        {kind === "job" && (
          <div>
            <label htmlFor="apply-job" className={labelClass}>Role</label>
            <select
              id="apply-job"
              name="job"
              defaultValue={startsWithRole ? initialRole : ""}
              aria-invalid={!!fieldErrors.job}
              aria-describedby={describe("job")}
              className={`${inputClass} h-11 px-2`}
            >
              <option value="" disabled>Choose a role…</option>
              {roles.map((r) => (
                <option key={r.slug} value={r.slug}>{r.title}</option>
              ))}
            </select>
            {fieldErrors.job && <p id="apply-job-error" className={fieldError}>{fieldErrors.job}</p>}
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="apply-name" className={labelClass}>Full name</label>
          <input id="apply-name" name="full_name" autoComplete="name" maxLength={120} aria-invalid={!!fieldErrors.full_name} aria-describedby={describe("full_name")} className={`${inputClass} h-11`} />
          {fieldErrors.full_name && <p id="apply-full_name-error" className={fieldError}>{fieldErrors.full_name}</p>}
        </div>
        <div>
          <label htmlFor="apply-email" className={labelClass}>Email</label>
          <input id="apply-email" name="email" type="email" autoComplete="email" maxLength={254} aria-invalid={!!fieldErrors.email} aria-describedby={describe("email")} className={`${inputClass} h-11`} />
          {fieldErrors.email && <p id="apply-email-error" className={fieldError}>{fieldErrors.email}</p>}
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="apply-cv" className={labelClass}>CV</label>
          <input id="apply-cv" name="cv" type="file" accept={DOCUMENT_ACCEPT} aria-invalid={!!fieldErrors.cv} aria-describedby={describe("cv", true)} className={fileClass} />
          <p id="apply-cv-hint" className={hint}>PDF or Word, up to {DOCUMENT_MAX_MB} MB.</p>
          {fieldErrors.cv && <p id="apply-cv-error" className={fieldError}>{fieldErrors.cv}</p>}
        </div>
        <div>
          <label htmlFor="apply-sop" className={labelClass}>Statement of purpose</label>
          <input id="apply-sop" name="sop" type="file" accept={DOCUMENT_ACCEPT} aria-invalid={!!fieldErrors.sop} aria-describedby={describe("sop", true)} className={fileClass} />
          <p id="apply-sop-hint" className={hint}>Why you want to work with PRI. PDF or Word, up to {DOCUMENT_MAX_MB} MB.</p>
          {fieldErrors.sop && <p id="apply-sop-error" className={fieldError}>{fieldErrors.sop}</p>}
        </div>
      </div>

      {/* A trap for bots: hidden from people and assistive technology, so anything typed here is automated. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="apply-website">Website</label>
        <input id="apply-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#253D9A] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#1B2C70] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {busy ? "Sending…" : "Send application"}
      </button>
      <p className="mt-4 text-[12.5px] leading-relaxed text-[#6f7899]">
        We use your details and files only to consider your application. Questions? Write to <a href={`mailto:${orgEmail}`} className="font-semibold text-[#253D9A] hover:underline">{orgEmail}</a>.
      </p>
    </form>
  );
}
