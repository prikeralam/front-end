"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { signIn, signUp, type SignInResult } from "../../_lib/auth/authClient";
import type { Session } from "../../_lib/session";
import { PURPOSES, validateSignup, type Purpose, type SignupErrors } from "../../_lib/signup";

export const labelClass = "mb-1 block font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]";
export const inputClass =
  "h-11 w-full rounded-lg border border-[#dcdee8] bg-white px-3 text-[15px] text-[#171a2b] outline-none transition-colors focus:border-[#253D9A] focus:ring-2 focus:ring-[#253D9A]/20 aria-[invalid=true]:border-[#E4633F]";
const primaryClass =
  "mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#253D9A] text-sm font-semibold text-white transition-colors hover:bg-[#1B2C70] disabled:cursor-not-allowed disabled:opacity-70";
const alertClass = "mb-5 rounded-lg border border-[#E4633F]/30 bg-[#E4633F]/8 p-3 text-[13px] leading-relaxed text-[#5b5f74]";

function Spinner() {
  return <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />;
}

function PasswordField({ id, value, onChange, autoComplete, invalid, describedBy, inputRef }: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  invalid?: boolean;
  describedBy?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type={shown ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`${inputClass} pr-16`}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-pressed={shown}
        aria-label="Show password"
        className="absolute inset-y-0 right-0 rounded-r-lg px-3 text-[12px] font-semibold text-[#253D9A] hover:text-[#1B2C70] focus-visible:outline-2 focus-visible:outline-[#253D9A]"
      >
        {shown ? "Hide" : "Show"}
      </button>
    </div>
  );
}

type SignInFailure = Exclude<SignInResult, { ok: true }>["reason"];

const signInCopy: Record<SignInFailure, string> = {
  invalid: "That email and password don't match an account. Check them and try again.",
  input: "Enter your email and password.",
  throttled: "Too many sign-in attempts for this account. Wait a minute and try again.",
  unreachable: "We can't reach the sign-in service right now. Please try again in a few minutes.",
};

function SignInForm({ onSignedIn }: { onSignedIn: (session: Session) => void }) {
  const id = useId();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<SignInFailure | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setFailure(null);
    const result = await signIn(email, password);
    if (result.ok) return onSignedIn(result.session);
    setBusy(false);
    setFailure(result.reason);
    if (result.reason === "invalid") {
      setPassword("");
      passwordRef.current?.focus();
    }
  }

  return (
    <form onSubmit={submit} noValidate aria-busy={busy}>
      <div id={`${id}-error`} role="alert" className={failure ? alertClass : "sr-only"}>
        {failure ? signInCopy[failure] : ""}
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor={`${id}-email`} className={labelClass}>Email</label>
          <input
            id={`${id}-email`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            aria-invalid={failure === "input" && !email.trim()}
            aria-describedby={failure ? `${id}-error` : undefined}
            className={inputClass}
          />
          <p className="mt-1 text-[12px] text-[#8b8fa3]">PRI staff can also use their username.</p>
        </div>
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label htmlFor={`${id}-password`} className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Password</label>
            <Link href="/reset-password" className="text-[12px] font-semibold text-[#253D9A] hover:underline">Forgot your password?</Link>
          </div>
          <PasswordField
            id={`${id}-password`}
            inputRef={passwordRef}
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            invalid={failure === "invalid" || (failure === "input" && !password)}
            describedBy={failure ? `${id}-error` : undefined}
          />
        </div>
      </div>
      <button type="submit" disabled={busy} className={primaryClass}>
        {busy && <Spinner />}
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="mt-1 text-[12.5px] text-[#c2462a]">{message}</p> : null;
}

function SignUpForm({ next, onSignedUp }: { next: string; onSignedUp: (session: Session) => void }) {
  const id = useId();
  const [form, setForm] = useState({ name: "", email: "", password: "", organisation: "", purpose: "" as Purpose | "", newsletter: false, terms: false });
  const [errors, setErrors] = useState<SignupErrors & { form?: string }>({});
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const found = validateSignup(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    const result = await signUp({ ...form, purpose: form.purpose as Purpose, next });
    setBusy(false);
    if (result.ok && result.session) return onSignedUp(result.session);
    if (result.ok) return setSentTo(form.email.trim());
    if (result.reason === "fields") return setErrors(result.fields);
    setErrors({
      form: result.reason === "throttled" ? "Too many sign-ups from here. Please try again in an hour." : "We can't reach the server right now. Please try again in a few minutes.",
    });
  }

  if (sentTo) {
    return (
      <div role="status" className="rounded-lg bg-[#253D9A]/6 p-5 text-[14.5px] leading-relaxed text-[#3a3e56]">
        <p className="font-semibold text-[#171a2b]">Check your inbox</p>
        <p className="mt-1">
          We&rsquo;ve sent an email to <strong>{sentTo}</strong>. If you already have an account with this address, it explains how to sign in.
        </p>
      </div>
    );
  }

  const err = (key: keyof SignupErrors) => (errors[key] ? `${id}-${key}-error` : undefined);

  return (
    <form onSubmit={submit} noValidate aria-busy={busy}>
      {errors.form && <div role="alert" className={alertClass}>{errors.form}</div>}
      <div className="space-y-4">
        <div>
          <label htmlFor={`${id}-name`} className={labelClass}>Full name</label>
          <input id={`${id}-name`} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" required aria-invalid={!!errors.name} aria-describedby={err("name")} className={inputClass} />
          <FieldError id={`${id}-name-error`} message={errors.name} />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={labelClass}>Email</label>
          <input id={`${id}-email`} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} required aria-invalid={!!errors.email} aria-describedby={err("email")} className={inputClass} />
          <FieldError id={`${id}-email-error`} message={errors.email} />
        </div>
        <div>
          <label htmlFor={`${id}-password`} className={labelClass}>Password</label>
          <PasswordField id={`${id}-password`} value={form.password} onChange={(v) => set("password", v)} autoComplete="new-password" invalid={!!errors.password} describedBy={err("password") ?? `${id}-password-hint`} />
          {errors.password ? <FieldError id={`${id}-password-error`} message={errors.password} /> : <p id={`${id}-password-hint`} className="mt-1 text-[12px] text-[#8b8fa3]">At least 8 characters; avoid common passwords.</p>}
        </div>
        <div>
          <label htmlFor={`${id}-organisation`} className={labelClass}>
            Organisation <span className="font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input id={`${id}-organisation`} value={form.organisation} onChange={(e) => set("organisation", e.target.value)} autoComplete="organization" placeholder="University, newsroom, department…" aria-invalid={!!errors.organisation} aria-describedby={err("organisation")} className={inputClass} />
          <FieldError id={`${id}-organisation-error`} message={errors.organisation} />
        </div>
        <div>
          <label htmlFor={`${id}-purpose`} className={labelClass}>What will you use the data for?</label>
          <select id={`${id}-purpose`} value={form.purpose} onChange={(e) => set("purpose", e.target.value as Purpose)} required aria-invalid={!!errors.purpose} aria-describedby={err("purpose")} className={`${inputClass} px-2`}>
            <option value="">Choose one…</option>
            {PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <FieldError id={`${id}-purpose-error`} message={errors.purpose} />
        </div>
        <label className="flex items-start gap-2.5 text-[13.5px] leading-snug text-[#3a3e56]">
          <input type="checkbox" checked={form.newsletter} onChange={(e) => set("newsletter", e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#253D9A]" />
          Send me occasional updates on PRI&rsquo;s new research and data.
        </label>
        <div>
          <label className="flex items-start gap-2.5 text-[13.5px] leading-snug text-[#3a3e56]">
            <input type="checkbox" checked={form.terms} onChange={(e) => set("terms", e.target.checked)} required aria-invalid={!!errors.terms} aria-describedby={err("terms")} className="mt-0.5 h-4 w-4 shrink-0 accent-[#253D9A]" />
            <span>
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-[#253D9A] hover:underline">terms of use</Link> and{" "}
              <Link href="/privacy" target="_blank" className="font-semibold text-[#253D9A] hover:underline">privacy policy</Link>.
            </span>
          </label>
          <FieldError id={`${id}-terms-error`} message={errors.terms} />
        </div>
      </div>
      <button type="submit" disabled={busy} className={primaryClass}>
        {busy && <Spinner />}
        {busy ? "Creating your account…" : "Create account"}
      </button>
    </form>
  );
}

export type AuthTab = "signin" | "signup";

/**
 * Sign in and create-account, as two tabs. `next` is where a new account's confirmation email brings the visitor
 * back to (the dataset they wanted). The empty slot above the forms is where "Sign in with Google" will go.
 */
export default function AuthPanel({ next = "", initialTab = "signin", intro, onSignedIn }: {
  next?: string;
  initialTab?: AuthTab;
  intro?: ReactNode;
  /** Called with the new session after signing in or creating an account (which signs the visitor in). */
  onSignedIn: (session: Session) => void;
}) {
  const id = useId();
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const tabClass = (active: boolean) =>
    `flex-1 rounded-md px-3 py-2 text-[13.5px] font-semibold transition-colors ${active ? "bg-white text-[#171a2b] shadow-[0_1px_3px_rgba(23,26,43,0.12)]" : "text-[#5b5f74] hover:text-[#171a2b]"}`;

  return (
    <div>
      {intro}
      <div role="tablist" aria-label="Sign in or create an account" className="mb-6 flex gap-1 rounded-lg bg-[#eef0f6] p-1">
        <button type="button" role="tab" id={`${id}-tab-signin`} aria-selected={tab === "signin"} aria-controls={`${id}-panel`} onClick={() => setTab("signin")} className={tabClass(tab === "signin")}>
          Sign in
        </button>
        <button type="button" role="tab" id={`${id}-tab-signup`} aria-selected={tab === "signup"} aria-controls={`${id}-panel`} onClick={() => setTab("signup")} className={tabClass(tab === "signup")}>
          Create account
        </button>
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${tab}`}>
        {tab === "signin" ? <SignInForm onSignedIn={onSignedIn} /> : <SignUpForm next={next} onSignedUp={onSignedIn} />}
      </div>
    </div>
  );
}
