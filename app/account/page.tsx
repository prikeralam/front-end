"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { roleLabels, type Session } from "../_lib/session";
import { checkSession, signIn, signOut, type SignInResult } from "../_lib/auth/authClient";
import { PageHeader } from "../_ui/kit";

type Failure = Exclude<SignInResult, { ok: true }>["reason"];

const failureCopy: Record<Failure, string> = {
  invalid: "That username and password don't match an active account. Check them and try again.",
  input: "Enter both your username and password.",
  throttled: "Too many sign-in attempts for this account. Wait a minute and try again.",
  unreachable: "We can't reach the sign-in service right now. Please try again in a few minutes.",
};

const cardClass = "rounded-lg border border-[#e6e8f0] bg-white p-6 shadow-[0_2px_16px_rgba(23,26,43,0.06)] sm:p-8";
const labelClass = "mb-1 block text-xs font-bold uppercase tracking-wider text-[#8b8fa3]";
const inputClass =
  "h-11 w-full rounded-lg border bg-white px-3 text-[15px] text-[#171a2b] outline-none transition-colors focus:border-[#253D9A] focus:ring-2 focus:ring-[#253D9A]/20 aria-[invalid=true]:border-[#E4633F]";

function Spinner() {
  return <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />;
}

function SignedIn({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  return (
    <div className={cardClass}>
      <p className="text-xs font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Signed in</p>
      <p className="mt-2 text-lg font-bold text-[#171a2b]">{session.name}</p>
      <p className="text-[14px] text-[#5b5f74]">
        {session.email} &middot; {roleLabels[session.role]}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard" className="rounded-md bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]">
          Go to your dashboard
        </Link>
        <button
          onClick={onSignOut}
          className="rounded-md border border-[#dcdee8] px-5 py-2.5 text-sm font-semibold text-[#3a3f55] hover:border-[#253D9A] hover:text-[#253D9A]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [existing, setExisting] = useState<Session | null | "checking">("checking");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  useEffect(() => {
    checkSession().then((check) => setExisting(check.status === "signed-in" ? check.session : null));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFailure(null);

    const result = await signIn(username, password);
    if (result.ok) {
      router.push("/dashboard");
      return;
    }

    setSubmitting(false);
    setFailure(result.reason);
    if (result.reason === "invalid") {
      // A wrong password is the likeliest slip: clear it and put the cursor back on it.
      setPassword("");
      passwordRef.current?.focus();
    } else if (result.reason === "input") {
      (username.trim() ? passwordRef : usernameRef).current?.focus();
    }
  }

  async function handleSignOut() {
    await signOut();
    setExisting(null);
  }

  return (
    <>
      <PageHeader compact kicker="Sign in" title="Access your data dashboard" />
      <section className="mx-auto max-w-md px-6 py-16">
        {existing === "checking" ? (
          <div className={`${cardClass} min-h-[18rem]`} aria-busy="true">
            <p role="status" className="text-[14px] text-[#8b8fa3]">Checking your session…</p>
          </div>
        ) : existing ? (
          <SignedIn session={existing} onSignOut={handleSignOut} />
        ) : (
          <form onSubmit={handleSubmit} noValidate className={cardClass} aria-busy={submitting}>
            <div id="signin-error" role="alert" className={failure ? "mb-6 rounded-lg border border-[#E4633F]/30 bg-[#E4633F]/8 p-3 text-[13px] leading-relaxed text-[#5b5f74]" : "sr-only"}>
              {failure ? failureCopy[failure] : ""}
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="username" className={labelClass}>Username</label>
                <input
                  ref={usernameRef}
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  autoFocus
                  aria-invalid={failure === "input" && !username.trim()}
                  aria-describedby={failure ? "signin-error" : undefined}
                  className={`${inputClass} border-[#dcdee8]`}
                />
              </div>

              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <label htmlFor="password" className="block text-xs font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">Password</label>
                  <Link href="/reset-password" className="text-[12px] font-semibold text-[#253D9A] hover:underline">Forgot your password?</Link>
                </div>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    aria-invalid={failure === "invalid" || (failure === "input" && !password)}
                    aria-describedby={failure ? "signin-error" : undefined}
                    className={`${inputClass} border-[#dcdee8] pr-16`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-pressed={showPassword}
                    aria-label="Show password"
                    className="absolute inset-y-0 right-0 rounded-r-lg px-3 text-[12px] font-semibold text-[#253D9A] hover:text-[#1B2C70] focus-visible:outline-2 focus-visible:outline-[#253D9A]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#253D9A] text-sm font-semibold text-white transition-colors hover:bg-[#1B2C70] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting && <Spinner />}
              {submitting ? "Signing in…" : "Sign in"}
            </button>

            <p className="mt-6 border-t border-[#e6e8f0] pt-5 text-[13px] leading-relaxed text-[#5b5f74]">
              Accounts are created by the PRI team, so there is no sign-up. Need access?{" "}
              <Link href="/contact" className="font-semibold text-[#253D9A] hover:underline">Contact us</Link>.
            </p>
          </form>
        )}
      </section>
    </>
  );
}
