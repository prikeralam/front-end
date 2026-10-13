"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { checkSession } from "../_lib/auth/authClient";
import { resendVerificationAction, verifyEmailAction, type ResendResult, type VerifyResult } from "../_lib/auth/accountActions";

// A link works once, so each one is confirmed by a single request, shared by every render that asks (React runs effects
// twice in development; a second request would find the link already used and report it as expired).
const attempts = new Map<string, Promise<VerifyResult>>();

function confirmOnce(uid: string, token: string): Promise<VerifyResult> {
  const key = `${uid}:${token}`;
  let attempt = attempts.get(key);
  if (!attempt) {
    attempt = verifyEmailAction(uid, token)
      .catch(() => "error" as const)
      .then(async (outcome) => {
        // Refresh this browser's session so pages already open see the confirmed email.
        if (outcome === "confirmed") await checkSession().catch(() => null);
        return outcome;
      });
    attempts.set(key, attempt);
  }
  return attempt;
}

const cardClass = "rounded-lg border border-[#e6e8f0] bg-white p-6 shadow-[0_2px_16px_rgba(23,26,43,0.06)] sm:p-8";
const primary = "inline-flex rounded-md bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]";

/**
 * Confirms the address from the link, once, as soon as the page opens. On success it refreshes this browser's session
 * (so pages already open see the confirmed state) and sends the visitor back to `next`, usually the dataset they wanted.
 */
export default function VerifyEmail({ uid, token, next }: { uid: string; token: string; next: string }) {
  const complete = !!uid && !!token;
  const [result, setResult] = useState<VerifyResult | "checking">(complete ? "checking" : "invalid");
  const [resend, setResend] = useState<ResendResult | "sending" | null>(null);

  useEffect(() => {
    if (!complete) return;
    let current = true;
    confirmOnce(uid, token).then((outcome) => {
      if (current) setResult(outcome);
    });
    return () => {
      current = false;
    };
  }, [complete, uid, token]);

  async function handleResend() {
    setResend("sending");
    setResend(await resendVerificationAction(next).catch(() => "error" as const));
  }

  if (result === "checking") {
    return (
      <div className={cardClass} aria-busy="true">
        <p role="status" className="text-[14px] text-[#8b8fa3]">Confirming your email…</p>
      </div>
    );
  }

  if (result === "confirmed") {
    return (
      <div className={cardClass}>
        <p className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2f6b45]">Email confirmed</p>
        <p className="mt-2 text-lg font-bold text-[#171a2b]">You can now download PRI&rsquo;s datasets.</p>
        <Link href={next || "/data"} className={`mt-6 ${primary}`}>
          {next.startsWith("/data/") ? "Back to the dataset" : "Browse the data"} &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <p className="text-lg font-bold text-[#171a2b]">
        {result === "error" ? "We couldn't confirm your email right now." : "This link has expired or has already been used."}
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-[#5b5f74]">
        {result === "error"
          ? "Please try opening the link again in a few minutes."
          : "If your email is already confirmed, you can simply sign in. Otherwise, ask for a new link."}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleResend} disabled={resend === "sending"} className={`${primary} disabled:opacity-60`}>
          {resend === "sending" ? "Sending…" : "Send a new link"}
        </button>
        <Link href="/account" className="text-sm font-semibold text-[#253D9A] hover:underline">Sign in</Link>
      </div>
      {resend && resend !== "sending" && (
        <p role="status" className="mt-3 text-[13px] text-[#5b5f74]">
          {resend === "sent"
            ? "Sent. Check your inbox (and spam folder)."
            : resend === "signed-out"
              ? "Sign in first, then ask for a new link from the dataset page or your account."
              : resend === "throttled"
                ? "You've asked for several links already. Please wait a while and try again."
                : "We couldn't send the email. Please try again."}
        </p>
      )}
    </div>
  );
}
