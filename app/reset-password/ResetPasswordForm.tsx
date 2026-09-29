"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { confirmPasswordResetAction, requestPasswordResetAction, type PasswordResult } from "../_lib/auth/passwordActions";
import PasswordInput from "../_ui/PasswordInput";

const cardClass = "rounded-lg border border-[#e6e8f0] bg-white p-6 shadow-[0_2px_16px_rgba(23,26,43,0.06)] sm:p-8";
const buttonClass =
  "mt-7 flex h-11 w-full items-center justify-center rounded-full bg-[#253D9A] text-sm font-semibold text-white transition-colors hover:bg-[#1B2C70] disabled:cursor-not-allowed disabled:opacity-70";
const errorClass = "mb-5 rounded-lg border border-[#E4633F]/30 bg-[#E4633F]/8 p-3 text-[13px] leading-relaxed text-[#5b5f74]";

const unreachable = (): PasswordResult => ({ ok: false, message: "We couldn't reach the server. Please try again." });

function RequestLink({ intro }: { intro: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = await requestPasswordResetAction(email).catch(unreachable);
    setBusy(false);
    if (result.ok) setSent(true);
    else setError(result.message);
  }

  if (sent) {
    return (
      <div className={cardClass} role="status">
        <p className="text-xs font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Check your inbox</p>
        <p className="mt-2 text-[15px] leading-relaxed text-[#171a2b]">
          If <strong>{email.trim()}</strong> belongs to an active account, a link to set a new password is on its way. It works once and expires after three days.
        </p>
        <p className="mt-4 text-[13px] text-[#5b5f74]">Nothing arrived? Check spam, or ask a PRI admin to send you a new link.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={cardClass} aria-busy={busy}>
      <div id="request-error" role="alert" className={error ? errorClass : "sr-only"}>{error}</div>
      <p className="text-[14px] leading-relaxed text-[#5b5f74]">{intro}</p>
      <label htmlFor="reset-email" className="mb-1 mt-5 block text-xs font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Email</label>
      <input
        id="reset-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        maxLength={254}
        required
        aria-invalid={!!error}
        aria-describedby={error ? "request-error" : undefined}
        className="h-11 w-full rounded-lg border border-[#dcdee8] bg-white px-3 text-[15px] text-[#171a2b] outline-none transition-colors focus:border-[#253D9A] focus:ring-2 focus:ring-[#253D9A]/20 aria-[invalid=true]:border-[#E4633F]"
      />
      <button type="submit" disabled={busy} className={buttonClass}>{busy ? "Sending…" : "Email me a link"}</button>
      <p className="mt-6 border-t border-[#e6e8f0] pt-5 text-[13px] text-[#5b5f74]">
        Remembered it? <Link href="/account" className="font-semibold text-[#253D9A] hover:underline">Sign in</Link>.
      </p>
    </form>
  );
}

function SetPassword({ uid, token }: { uid: string; token: string }) {
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [state, setState] = useState<"form" | "done" | "dead-link">("form");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!next) return setError("Enter a new password.");
    if (next !== confirm) return setError("The passwords don't match.");
    setBusy(true);
    setError("");
    const result = await confirmPasswordResetAction(uid, token, next).catch(unreachable);
    setBusy(false);
    if (result.ok) setState("done");
    else if (result.reason === "link") setState("dead-link");
    else setError(result.message);
  }

  if (state === "done") {
    return (
      <div className={cardClass} role="status">
        <p className="text-xs font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#0F6B5C]">Password set</p>
        <p className="mt-2 text-[15px] leading-relaxed text-[#171a2b]">You can now sign in with your username and new password.</p>
        <Link href="/account" className="mt-6 inline-flex rounded-md bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]">Sign in</Link>
      </div>
    );
  }

  if (state === "dead-link") {
    return <RequestLink intro="This link has expired or has already been used. Enter your email and we'll send a fresh one." />;
  }

  return (
    <form onSubmit={submit} noValidate className={cardClass} aria-busy={busy}>
      <div id="set-error" role="alert" className={error ? errorClass : "sr-only"}>{error}</div>
      <p className="text-[14px] leading-relaxed text-[#5b5f74]">Choose a password for your PRI account. Use at least 8 characters, and avoid common words or anything like your name.</p>
      <div className="mt-6 space-y-5">
        <PasswordInput id="new-password" label="New password" value={next} onChange={setNext} autoComplete="new-password" autoFocus describedBy={error ? "set-error" : undefined} />
        <PasswordInput id="confirm-password" label="Repeat password" value={confirm} onChange={setConfirm} autoComplete="new-password" invalid={!!confirm && confirm !== next} describedBy={error ? "set-error" : undefined} />
      </div>
      <button type="submit" disabled={busy} className={buttonClass}>{busy ? "Saving…" : "Set password"}</button>
    </form>
  );
}

export default function ResetPasswordForm({ uid, token }: { uid: string; token: string }) {
  return uid && token ? (
    <SetPassword uid={uid} token={token} />
  ) : (
    <RequestLink intro="Enter the email address of your PRI account and we'll send you a link to set a new password." />
  );
}
