"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dataset } from "../../../_lib/types";
import { getSession, getAccessRequests, requestAccess, canAccessDataset, logDownload, type MockSession } from "../../../_lib/mockAuth";

export default function PortalDownloadPanel({ dataset }: { dataset: Dataset }) {
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null | undefined>(undefined);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/v2/account");
      return;
    }
    setSession(s);
  }, [router, tick]);

  if (!session) return null;

  const state = canAccessDataset(dataset, session);

  if (state === "full") {
    if (dataset.files && dataset.files.length > 0) {
      return (
        <div className="mt-8 flex flex-wrap gap-2">
          {dataset.files.map((f) => (
            <a
              key={f.path}
              href={f.path}
              download
              onClick={() => logDownload(dataset.slug, session)}
              className="inline-block rounded-full bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]"
            >
              {dataset.files!.length > 1 ? `Download ${f.label}` : "Download"}
            </a>
          ))}
        </div>
      );
    }
    return (
      <button
        onClick={() => {
          logDownload(dataset.slug, session);
          setTick((t) => t + 1);
          alert("Mock download — no real file exists yet.");
        }}
        className="mt-8 rounded-full bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]"
      >
        Download
      </button>
    );
  }

  if (state === "requestable") {
    const pending = getAccessRequests().some(
      (r) => r.datasetSlug === dataset.slug && r.requesterEmail === session.email && r.status === "pending"
    );
    if (pending) {
      return <p className="mt-8 text-sm text-[#8b8fa3]">Request pending — check your dashboard for updates.</p>;
    }
    return (
      <button
        onClick={() => {
          requestAccess(dataset.slug, session);
          setTick((t) => t + 1);
        }}
        className="mt-8 rounded-full border border-[#253D9A] px-5 py-2.5 text-sm font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
      >
        Request access
      </button>
    );
  }

  return <p className="mt-8 text-sm text-[#8b8fa3]">Restricted to internal staff roles.</p>;
}
