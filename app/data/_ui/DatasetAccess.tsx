"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkSession, type SessionCheck } from "../../_lib/auth/authClient";
import { resendVerificationAction, type ResendResult } from "../../_lib/auth/accountActions";
import { getDatasetAccessAction, requestAccessAction } from "../../_lib/dashboard/datasetActions";
import type { AccessState, DatasetFile } from "../../_lib/datasetTypes";
import { downloadStep } from "../../_lib/downloadStep";
import { getRequestedDatasets, rememberRequestedDataset } from "../../_lib/requestedAccess";
import type { Session } from "../../_lib/session";
import AuthDialog from "../../_ui/auth/AuthDialog";
import DownloadFiles from "./DownloadFiles";

const primary =
  "inline-flex items-center gap-2 rounded-md bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B2C70]";
const secondary =
  "rounded-md border border-[#253D9A] px-5 py-2.5 text-sm font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white disabled:cursor-not-allowed disabled:opacity-60";

const DownloadIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" />
  </svg>
);

const RESEND_COPY: Record<ResendResult, string> = {
  sent: "Sent. Check your inbox (and spam folder).",
  "signed-out": "Please sign in again.",
  throttled: "You've asked for several links already. Please wait a while and try again.",
  error: "We couldn't send the email. Please try again.",
};

type Access = { accessState: AccessState; files: DatasetFile[] };

/**
 * What the visitor can do with a dataset. It starts from the anonymous answer the server rendered, then asks the
 * backend what the signed-in visitor may do. Public datasets need a signed-in account with a confirmed email: signed
 * out, Download opens the sign-in / create-account dialog; unconfirmed, it asks for the emailed link and checks again
 * when the tab comes back into focus. The backend decides; this component only reflects it.
 */
export default function DatasetAccess({ slug, accessState, files, formats = [] }: { slug: string; accessState: AccessState; files: DatasetFile[]; formats?: string[] }) {
  const router = useRouter();
  const [access, setAccess] = useState<Access>({ accessState, files });
  const [session, setSession] = useState<Session | null | undefined>(undefined); // undefined while checking
  const [dialog, setDialog] = useState(false);
  const [requested, setRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [resend, setResend] = useState<ResendResult | "sending" | null>(null);
  const here = `/data/${slug}`;

  /** Takes in who is signed in, then fetches what they may download. */
  const apply = useCallback(async (check: SessionCheck) => {
    if (check.status !== "signed-in") {
      setSession(check.status === "unreachable" ? check.session : null);
      return;
    }
    setSession(check.session);
    setRequested(getRequestedDatasets(check.session.email).includes(slug));
    const own = await getDatasetAccessAction(slug).catch(() => null);
    if (own) setAccess(own);
  }, [slug]);

  const refresh = useCallback(() => checkSession().then(apply), [apply]);

  useEffect(() => {
    let current = true;
    checkSession()
      .then((check) => {
        if (current) return apply(check);
      })
      .catch(() => {
        if (current) setSession(null);
      });
    return () => {
      current = false;
    };
  }, [apply]);

  // While waiting for the confirmation link (often opened in another tab), check again whenever this tab is shown.
  const waiting = session?.emailVerified === false;
  useEffect(() => {
    if (!waiting) return;
    const onFocus = () => document.visibilityState === "visible" && refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [waiting, refresh]);

  async function handleSignedIn() {
    setDialog(false);
    await refresh();
  }

  async function handleRequest() {
    if (!session) return;
    setBusy(true);
    setFailed(false);
    const result = await requestAccessAction(slug).catch(() => "error" as const);
    setBusy(false);
    if (result === "requested") {
      rememberRequestedDataset(session.email, slug);
      setRequested(true);
    } else if (result === "signed-out") {
      setSession(null);
    } else {
      setFailed(true);
    }
  }

  async function handleResend() {
    setResend("sending");
    const result = await resendVerificationAction(here).catch(() => "error" as const);
    setResend(result);
    if (result === "signed-out") router.refresh();
  }

  const step = downloadStep(access.accessState, access.files.length, session);
  const formatList = formats.length ? ` (${formats.join(", ")})` : "";
  const authDialog = (
    <AuthDialog
      open={dialog}
      onClose={() => setDialog(false)}
      onSignedIn={handleSignedIn}
      next={here}
      title={access.accessState === "requestable" ? "Request access to this dataset" : "Download this dataset"}
    />
  );

  if (step === "files") {
    return (
      <div className="mt-8">
        <DownloadFiles files={access.files} />
      </div>
    );
  }
  if (step === "no-file") return <p className="mt-8 text-sm text-[#8b8fa3]">No file has been uploaded for this dataset yet.</p>;
  if (step === "locked") return <p className="mt-8 text-sm text-[#8b8fa3]">Restricted to internal staff roles.</p>;

  if (step === "checking") {
    return (
      <div className="mt-8" aria-busy="true">
        <span className={`${primary} cursor-wait opacity-60`}>
          <DownloadIcon /> Download
        </span>
      </div>
    );
  }

  if (step === "sign-in") {
    return (
      <div className="mt-8">
        <button type="button" onClick={() => setDialog(true)} className={primary}>
          <DownloadIcon /> Download{formatList}
        </button>
        <p className="mt-2 text-[13px] text-[#8b8fa3]">Free with an account. Sign in or create one in a minute.</p>
        {authDialog}
      </div>
    );
  }

  if (step === "confirm-email" && session) {
    return (
      <div className="mt-8 rounded-lg border border-[#e3c98a] bg-[#fdf8ec] p-5">
        <p className="font-semibold text-[#171a2b]">Confirm your email to download</p>
        <p className="mt-1 text-[14px] leading-relaxed text-[#5b5f74]">
          We sent a link to <strong className="text-[#171a2b]">{session.email}</strong>. Open it and this page will let you download.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={handleResend} disabled={resend === "sending"} className="text-[13.5px] font-semibold text-[#253D9A] hover:underline disabled:opacity-60">
            {resend === "sending" ? "Sending…" : "Send the link again"}
          </button>
          {resend && resend !== "sending" && (
            <span role="status" className="text-[13px] text-[#5b5f74]">{RESEND_COPY[resend]}</span>
          )}
        </div>
      </div>
    );
  }

  // On-request datasets.
  return (
    <div className="mt-8">
      <p className="text-sm text-[#5b5f74]">Access to this dataset is granted on request.</p>
      {step === "sign-in-to-request" ? (
        <>
          <button type="button" onClick={() => setDialog(true)} className={`mt-3 ${secondary}`}>
            Sign in to request access
          </button>
          {authDialog}
        </>
      ) : requested ? (
        <p className="mt-3 text-sm font-semibold text-[#253D9A]">Request submitted. You will be able to download once it is approved.</p>
      ) : (
        <>
          <button onClick={handleRequest} disabled={busy} className={`mt-3 ${secondary}`}>
            {busy ? "Requesting…" : "Request access"}
          </button>
          {failed && (
            <p role="alert" className="mt-3 text-[13px] text-[#E4633F]">
              We couldn&apos;t send your request. Please try again.
            </p>
          )}
        </>
      )}
    </div>
  );
}
