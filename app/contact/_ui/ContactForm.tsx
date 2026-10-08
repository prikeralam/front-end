"use client";

import { useState, type FormEvent } from "react";
import { sendContactMessageAction } from "../../_lib/contact/contactActions";
import { CONTACT_CATEGORIES, contactCategoryLabels, type ContactCategory, type ContactField, type ContactResult } from "../../_lib/contact/contactTypes";

const MAX_MESSAGE = 5000;
const labelClass = "mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f7899]";
const inputClass =
  "w-full rounded-md border border-[#dcdee8] bg-white px-3 text-[15px] text-[#171a2b] outline-none transition-colors focus:border-[#253D9A] focus:ring-2 focus:ring-[#253D9A]/20 aria-[invalid=true]:border-[#E4633F]";
const fieldError = "mt-1.5 text-[12.5px] text-[#B4432A]";

const unreachable = (): ContactResult => ({ ok: false, message: "We couldn't reach the server. Please try again, or email us directly." });

export default function ContactForm({ email: orgEmail }: { email: string }) {
  const [category, setCategory] = useState<ContactCategory>("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFieldErrors({});
    const result = await sendContactMessageAction({ category, name, email, message, website }).catch(unreachable);
    setBusy(false);
    if (result.ok) {
      setSentTo(email.trim());
      return;
    }
    setError(result.message);
    setFieldErrors(result.fieldErrors ?? {});
  }

  function reset() {
    setMessage("");
    setSentTo(null);
  }

  if (sentTo) {
    return (
      <div className="rounded-lg border border-[#e3e6f0] bg-white p-6 sm:p-8" role="status">
        <p className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0F6B5C]">Message sent</p>
        <p className="mt-3 text-[18px] leading-snug text-[#171a2b]">Thank you{name.trim() ? `, ${name.trim().split(/\s+/)[0]}` : ""}. We&rsquo;ve received your message.</p>
        <p className="mt-2 text-[14.5px] leading-relaxed text-[#4b4f66]">
          Someone from our team will reply to <span className="font-semibold text-[#171a2b]">{sentTo}</span>, usually within a few working days.
        </p>
        <button type="button" onClick={reset} className="mt-6 text-[14px] font-semibold text-[#253D9A] hover:underline">
          Send another message
        </button>
      </div>
    );
  }

  const describe = (field: ContactField) => (fieldErrors[field] ? `contact-${field}-error` : undefined);

  return (
    <form onSubmit={submit} noValidate aria-busy={busy} className="rounded-lg border border-[#e3e6f0] bg-white p-6 sm:p-8">
      <h2 className="text-[20px] leading-tight text-[#171a2b]">Send us a message</h2>
      <p className="mt-1.5 text-[14px] text-[#5b6280]">All fields are required.</p>

      <div role="alert" className={error ? "mt-5 rounded-md border border-[#E4633F]/30 bg-[#E4633F]/8 p-3 text-[13.5px] leading-relaxed text-[#4b4f66]" : "sr-only"}>
        {error}
      </div>

      <div className="mt-6">
        <label htmlFor="contact-category" className={labelClass}>Enquiry type</label>
        <select
          id="contact-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ContactCategory)}
          aria-invalid={!!fieldErrors.category}
          aria-describedby={describe("category")}
          className={`${inputClass} h-11 px-2`}
        >
          {CONTACT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{contactCategoryLabels[c]}</option>
          ))}
        </select>
        {fieldErrors.category && <p id="contact-category-error" className={fieldError}>{fieldErrors.category}</p>}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>Your name</label>
          <input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={120}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={describe("name")}
            className={`${inputClass} h-11`}
          />
          {fieldErrors.name && <p id="contact-name-error" className={fieldError}>{fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>Email</label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            maxLength={254}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={describe("email")}
            className={`${inputClass} h-11`}
          />
          {fieldErrors.email && <p id="contact-email-error" className={fieldError}>{fieldErrors.email}</p>}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="contact-message" className={labelClass}>Message</label>
          <span aria-hidden="true" className="font-[family-name:var(--font-mono)] text-[11px] text-[#8b8fa3]">
            {message.length.toLocaleString("en-IN")} / {MAX_MESSAGE.toLocaleString("en-IN")}
          </span>
        </div>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          maxLength={MAX_MESSAGE}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={describe("message")}
          className={`${inputClass} resize-y py-2.5 leading-relaxed`}
        />
        {fieldErrors.message && <p id="contact-message-error" className={fieldError}>{fieldErrors.message}</p>}
      </div>

      {/* A trap for bots: hidden from people and assistive technology, so anything typed here is automated. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#253D9A] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#1B2C70] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {busy ? "Sending…" : "Send message"}
      </button>
      <p className="mt-4 text-[12.5px] leading-relaxed text-[#6f7899]">
        We use your details only to reply. You can also write to <a href={`mailto:${orgEmail}`} className="font-semibold text-[#253D9A] hover:underline">{orgEmail}</a>.
      </p>
    </form>
  );
}
