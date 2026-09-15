"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession, mockSessionHeaders, type MockSession } from "../../_lib/mockAuth";

type AccessState = "full" | "requestable" | "locked";

export default function DatasetAccessPanel({ slug, theme }: { slug: string; theme: string | null }) {
  const [session, setSession] = useState<MockSession | null>(null);
  const [state, setState] = useState<AccessState | null>(null);
  const [pending, setPending] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = getSession();
    setSession(s);

    async function load() {
      const res = await fetch(`/api/datasets/${slug}`, { headers: mockSessionHeaders(s) });
      if (res.ok) {
        const data = await res.json();
        setState(data.accessState);
      }
      if (s) {
        const mineRes = await fetch(`/api/access-requests?mine=1`, { headers: mockSessionHeaders(s) });
        if (mineRes.ok) {
          const mine = await mineRes.json();
          setPending(mine.results?.some((r: { datasetSlug: string; status: string }) => r.datasetSlug === slug && r.status === "pending"));
        }
      }
      setHydrated(true);
    }
    load();
  }, [slug]);

  if (!hydrated) return null;

  if (!session) {
    return (
      <Link
        href="/account"
        title="Sign in to download"
        className="mt-8 inline-block rounded-full bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]"
      >
        Download
      </Link>
    );
  }

  if (state === "full") {
    return (
      <Link
        href={`/dashboard/theme/${encodeURIComponent(theme ?? "")}/data/${slug}`}
        title="Go to your dashboard to download"
        className="mt-8 inline-block rounded-full bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]"
      >
        Download
      </Link>
    );
  }

  if (state === "requestable") {
    if (pending) {
      return <p className="mt-8 text-sm text-[#8b8fa3]">Request pending — check your dashboard for updates.</p>;
    }
    return (
      <button
        onClick={async () => {
          await fetch(`/api/datasets/${slug}/request-access`, { method: "POST", headers: mockSessionHeaders(session) });
          setPending(true);
        }}
        className="mt-8 rounded-full border border-[#253D9A] px-5 py-2.5 text-sm font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
      >
        Request access
      </button>
    );
  }

  return <p className="mt-8 text-sm text-[#8b8fa3]">Restricted to internal staff roles.</p>;
}
