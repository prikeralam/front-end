"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { roleLabels, type Session } from "../_lib/session";
import { checkSession, signOut } from "../_lib/auth/authClient";
import {
  getProfileAction,
  resendVerificationAction,
  updateProfileAction,
  type Profile,
  type ResendResult,
} from "../_lib/auth/accountActions";
import { PURPOSES, type Purpose } from "../_lib/signup";
import AuthPanel, { inputClass, labelClass } from "../_ui/auth/AuthPanel";
import { PageHeader } from "../_ui/kit";

const cardClass = "rounded-lg border border-[#e6e8f0] bg-white p-6 shadow-[0_2px_16px_rgba(23,26,43,0.06)] sm:p-8";
const outline =
  "rounded-md border border-[#dcdee8] px-5 py-2.5 text-sm font-semibold text-[#3a3f55] hover:border-[#253D9A] hover:text-[#253D9A]";
const primary = "rounded-md bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70] disabled:opacity-60";

/** PRI staff: their dashboard is where they work. */
function StaffAccount({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  return (
    <div className={cardClass}>
      <p className="font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Signed in</p>
      <p className="mt-2 text-lg font-bold text-[#171a2b]">{session.name}</p>
      <p className="text-[14px] text-[#5b5f74]">
        {session.email} &middot; {roleLabels[session.role]}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard" className={primary}>Go to your dashboard</Link>
        <button onClick={onSignOut} className={outline}>Sign out</button>
      </div>
    </div>
  );
}

/** A visitor who signed up to download data: their details, email confirmation, and their sign-up answers. */
function VisitorAccount({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  const [profile, setProfile] = useState<Profile | null | "loading">("loading");
  const [saved, setSaved] = useState<"saving" | "saved" | "error" | null>(null);
  const [resend, setResend] = useState<ResendResult | "sending" | null>(null);

  useEffect(() => {
    let current = true;
    getProfileAction().then((p) => {
      if (current) setProfile(p);
    });
    return () => {
      current = false;
    };
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!profile || profile === "loading") return;
    setSaved("saving");
    const result = await updateProfileAction(profile).catch(() => "error" as const);
    setSaved(result === "saved" ? "saved" : "error");
  }

  const confirmed = session.emailVerified !== false;

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <p className="font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Your account</p>
        <p className="mt-2 text-lg font-bold text-[#171a2b]">{session.name}</p>
        <p className="text-[14px] text-[#5b5f74]">{session.email}</p>
        {confirmed ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#eef7f1] px-3 py-1.5 text-[13px] font-semibold text-[#2f6b45]">
            <span aria-hidden="true">&#10003;</span> Email confirmed: you can download datasets
          </p>
        ) : (
          <div className="mt-4 rounded-lg border border-[#e3c98a] bg-[#fdf8ec] p-4">
            <p className="text-[14px] font-semibold text-[#171a2b]">Confirm your email to download datasets</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-[#5b5f74]">We sent a link to {session.email}.</p>
            <button
              type="button"
              onClick={async () => {
                setResend("sending");
                setResend(await resendVerificationAction("/data").catch(() => "error" as const));
              }}
              disabled={resend === "sending"}
              className="mt-2 text-[13.5px] font-semibold text-[#253D9A] hover:underline disabled:opacity-60"
            >
              {resend === "sending" ? "Sending…" : "Send the link again"}
            </button>
            {resend && resend !== "sending" && (
              <p role="status" className="mt-1 text-[13px] text-[#5b5f74]">
                {resend === "sent" ? "Sent. Check your inbox (and spam folder)." : resend === "throttled" ? "Please wait a while before asking again." : "We couldn't send the email. Please try again."}
              </p>
            )}
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/data" className={primary}>Browse the data</Link>
          <button onClick={onSignOut} className={outline}>Sign out</button>
        </div>
      </div>

      {profile && profile !== "loading" && (
        <form onSubmit={save} className={cardClass}>
          <p className="font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">About you</p>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="organisation" className={labelClass}>Organisation</label>
              <input id="organisation" value={profile.organisation} maxLength={200} onChange={(e) => setProfile({ ...profile, organisation: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="purpose" className={labelClass}>What you use the data for</label>
              <select id="purpose" value={profile.purpose} onChange={(e) => setProfile({ ...profile, purpose: e.target.value as Purpose })} className={`${inputClass} px-2`}>
                <option value="">Not given</option>
                {PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <label className="flex items-start gap-2.5 text-[13.5px] leading-snug text-[#3a3e56]">
              <input type="checkbox" checked={profile.newsletter} onChange={(e) => setProfile({ ...profile, newsletter: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-[#253D9A]" />
              Send me occasional updates on PRI&rsquo;s new research and data.
            </label>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button type="submit" disabled={saved === "saving"} className={primary}>{saved === "saving" ? "Saving…" : "Save"}</button>
            {saved === "saved" && <span role="status" className="text-[13px] text-[#2f6b45]">Saved.</span>}
            {saved === "error" && <span role="alert" className="text-[13px] text-[#c2462a]">We couldn&apos;t save. Please try again.</span>}
          </div>
        </form>
      )}
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null | "checking">("checking");

  useEffect(() => {
    checkSession().then((check) => setSession(check.status === "signed-in" ? check.session : null));
  }, []);

  function handleSignedIn(next: Session) {
    // Staff go to work; visitors stay here and see their account.
    if (next.role !== "public") router.push("/dashboard");
    else setSession(next);
  }

  async function handleSignOut() {
    await signOut();
    setSession(null);
  }

  const visitor = session !== "checking" && session?.role === "public";

  return (
    <>
      <PageHeader compact kicker="Account" title={session && session !== "checking" ? (visitor ? "Your account" : "Welcome back") : "Sign in or create an account"} />
      <section className="mx-auto max-w-md px-6 py-14">
        {session === "checking" ? (
          <div className={`${cardClass} min-h-[18rem]`} aria-busy="true">
            <p role="status" className="text-[14px] text-[#8b8fa3]">Checking your session…</p>
          </div>
        ) : session ? (
          visitor ? <VisitorAccount session={session} onSignOut={handleSignOut} /> : <StaffAccount session={session} onSignOut={handleSignOut} />
        ) : (
          <div className={cardClass}>
            <AuthPanel
              next="/data"
              onSignedIn={handleSignedIn}
              intro={<p className="mb-5 text-[14px] leading-relaxed text-[#5b5f74]">An account lets you download PRI&rsquo;s datasets. It&rsquo;s free.</p>}
            />
          </div>
        )}
      </section>
    </>
  );
}
