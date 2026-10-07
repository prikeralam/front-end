"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkSession } from "../../_lib/auth/authClient";
import { getDatasetAccessAction, requestAccessAction } from "../../_lib/dashboard/datasetActions";
import type { AccessState, DatasetFile } from "../../_lib/datasetTypes";
import { getRequestedDatasets, rememberRequestedDataset } from "../../_lib/requestedAccess";
import DownloadFiles from "./DownloadFiles";

const secondary =
  "rounded-md border border-[#253D9A] px-5 py-2.5 text-sm font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white disabled:cursor-not-allowed disabled:opacity-60";

type Access = { accessState: AccessState; files: DatasetFile[] };

/**
 * What the visitor can do with a dataset. It starts from the anonymous answer the server rendered, and if someone is
 * signed in it asks the backend what *they* can do (an approved requester gets the file; staff see internal datasets).
 * The backend decides; this component only reflects it.
 */
export default function DatasetAccess({ slug, accessState, files }: { slug: string; accessState: AccessState; files: DatasetFile[] }) {
  const router = useRouter();
  const [access, setAccess] = useState<Access>({ accessState, files });
  const [email, setEmail] = useState<string | null | undefined>(undefined); // undefined while checking
  const [requested, setRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let current = true;
    checkSession().then(async (check) => {
      if (!current) return;
      if (check.status !== "signed-in") {
        setEmail(null);
        return;
      }
      setEmail(check.session.email);
      setRequested(getRequestedDatasets(check.session.email).includes(slug));
      const own = await getDatasetAccessAction(slug).catch(() => null);
      if (current && own) setAccess(own);
    });
    return () => {
      current = false;
    };
  }, [slug]);

  async function handleRequest() {
    if (!email) return;
    setBusy(true);
    setFailed(false);
    const result = await requestAccessAction(slug).catch(() => "error" as const);
    setBusy(false);

    if (result === "requested") {
      rememberRequestedDataset(email, slug);
      setRequested(true);
    } else if (result === "signed-out") {
      router.push("/account");
    } else {
      setFailed(true);
    }
  }

  if (access.accessState === "full" && access.files.length > 0) {
    return (
      <div className="mt-8">
        <DownloadFiles files={access.files} />
      </div>
    );
  }
  if (access.accessState === "full") return <p className="mt-8 text-sm text-[#8b8fa3]">No file has been uploaded for this dataset yet.</p>;

  if (access.accessState === "requestable") {
    return (
      <div className="mt-8">
        <p className="text-sm text-[#5b5f74]">Access to this dataset is granted on request.</p>
        {email === undefined ? null : email === null ? (
          <Link href="/account" className={`mt-3 inline-block ${secondary}`}>
            Sign in to request access
          </Link>
        ) : requested ? (
          <p className="mt-3 text-sm font-semibold text-[#253D9A]">Request submitted — you will be able to download once it is approved.</p>
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

  return <p className="mt-8 text-sm text-[#8b8fa3]">Restricted to internal staff roles.</p>;
}
