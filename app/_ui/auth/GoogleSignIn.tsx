"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { signInWithGoogle, type GoogleSignInResult } from "../../_lib/auth/authClient";
import type { Session } from "../../_lib/session";

// Baked in at build time (the NEXT_PUBLIC_GOOGLE_CLIENT_ID repository variable, like IMAGE_HOSTS); unset hides Google.
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type GoogleId = {
  initialize(options: { client_id: string; callback: (response: { credential?: string }) => void; use_fedcm_for_button?: boolean }): void;
  renderButton(parent: HTMLElement, options: { type: "standard"; theme: "outline"; size: "large"; text: "continue_with"; shape: "pill"; width: number; logo_alignment: "center" }): void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

type Failure = Exclude<GoogleSignInResult, { ok: true }>["reason"];

const failureCopy: Record<Failure, string> = {
  refused: "Google sign-in didn't work. Try again, or use your email and password.",
  throttled: "Too many sign-in attempts. Wait a minute and try again.",
  unreachable: "We can't reach the sign-in service right now. Please try again in a few minutes.",
};

/**
 * Google's own "Continue with Google" button (Google Identity Services, in a popup). Its ID token goes to
 * `/api/auth/google`, which signs in the matching account or creates a confirmed visitor account. Renders nothing
 * without a client ID, and nothing until Google's script has drawn the button, so a blocked script leaves no gap.
 */
export default function GoogleSignIn({ onSignedIn }: { onSignedIn: (session: Session) => void }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  // The callback is registered once with Google; the ref keeps it calling the latest onSignedIn.
  const onSignedInRef = useRef(onSignedIn);
  useLayoutEffect(() => {
    onSignedInRef.current = onSignedIn;
  });

  if (!CLIENT_ID) return null;

  async function finish(credential: string | undefined) {
    if (!credential) return setFailure("refused");
    setBusy(true);
    setFailure(null);
    const result = await signInWithGoogle(credential);
    if (result.ok) return onSignedInRef.current(result.session);
    setBusy(false);
    setFailure(result.reason);
  }

  // Runs once the script loads, and again on every later mount (switching tabs, reopening the dialog).
  function draw() {
    const google = window.google?.accounts.id;
    const parent = buttonRef.current;
    if (!google || !parent) return;
    google.initialize({ client_id: CLIENT_ID, callback: (response) => void finish(response.credential), use_fedcm_for_button: true });
    // Google draws a fixed-width button (200 to 400px); match the form's width.
    const width = Math.max(200, Math.min(400, Math.floor(parent.getBoundingClientRect().width)));
    google.renderButton(parent, { type: "standard", theme: "outline", size: "large", text: "continue_with", shape: "pill", width, logo_alignment: "center" });
    setReady(true);
  }

  return (
    <div className="mb-6">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={draw} />
      {failure && (
        <div role="alert" className="mb-3 rounded-lg border border-[#E4633F]/30 bg-[#E4633F]/8 p-3 text-[13px] leading-relaxed text-[#5b5f74]">
          {failureCopy[failure]}
        </div>
      )}
      <div aria-busy={busy} className={`flex min-h-[44px] justify-center transition-opacity ${busy ? "pointer-events-none opacity-60" : ""}`}>
        <div ref={buttonRef} className="w-full max-w-[400px]" />
      </div>
      {busy && <p role="status" className="mt-2 text-center text-[12.5px] text-[#8b8fa3]">Signing you in…</p>}
      {ready && (
        <>
          <p className="mt-2.5 text-center text-[12px] leading-relaxed text-[#8b8fa3]">
            By continuing with Google, you agree to the{" "}
            <Link href="/terms" target="_blank" className="font-semibold text-[#253D9A] hover:underline">terms of use</Link> and{" "}
            <Link href="/privacy" target="_blank" className="font-semibold text-[#253D9A] hover:underline">privacy policy</Link>.
          </p>
          <div className="mt-5 flex items-center gap-3 text-[12px] font-medium text-[#8b8fa3]" aria-hidden="true">
            <span className="h-px flex-1 bg-[#e3e6f0]" />
            or use your email
            <span className="h-px flex-1 bg-[#e3e6f0]" />
          </div>
        </>
      )}
    </div>
  );
}
