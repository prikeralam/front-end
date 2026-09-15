"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, mockSessionHeaders, logDownload, type MockSession } from "../../_lib/mockAuth";

type AccessState = "full" | "requestable" | "locked";
type DatasetFile = { label: string; path: string };

export default function PortalDownloadPanel({ slug }: { slug: string }) {
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null | undefined>(undefined);
  const [state, setState] = useState<AccessState | null>(null);
  const [files, setFiles] = useState<DatasetFile[]>([]);
  const [pending, setPending] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/account");
      return;
    }
    setSession(s);

    async function load() {
      const res = await fetch(`/api/datasets/${slug}`, { headers: mockSessionHeaders(s) });
      if (res.ok) {
        const data = await res.json();
        setState(data.accessState);
        setFiles(data.files ?? []);
      }

      const mineRes = await fetch(`/api/access-requests?mine=1`, { headers: mockSessionHeaders(s) });
      if (mineRes.ok) {
        const mine = await mineRes.json();
        setPending(mine.results?.some((r: { datasetSlug: string; status: string }) => r.datasetSlug === slug && r.status === "pending"));
      }
    }
    load();
  }, [router, slug, tick]);

  if (!session) return null;

  if (state === "full") {
    if (files.length > 0) {
      return (
        <div className="mt-8 flex flex-wrap gap-2">
          {files.map((f) => (
            <a
              key={f.path}
              href={f.path}
              onClick={() => logDownload(slug, session)}
              className="inline-block rounded-full bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]"
            >
              {files.length > 1 ? `Download ${f.label}` : "Download"}
            </a>
          ))}
        </div>
      );
    }
    return <p className="mt-8 text-sm text-[#8b8fa3]">No file uploaded yet for this dataset.</p>;
  }

  if (state === "requestable") {
    if (pending) {
      return <p className="mt-8 text-sm text-[#8b8fa3]">Request pending — check your dashboard for updates.</p>;
    }
    return (
      <button
        onClick={async () => {
          await fetch(`/api/datasets/${slug}/request-access`, { method: "POST", headers: mockSessionHeaders(session) });
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
