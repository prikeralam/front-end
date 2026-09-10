"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Dataset } from "../../../_lib/types";
import { getSession, getAccessRequests, requestAccess, canAccessDataset, type MockSession } from "../../../_lib/mockAuth";

export default function DatasetAccessPanel({ dataset }: { dataset: Dataset }) {
  const [session, setSession] = useState<MockSession | null>(null);
  const [tick, setTick] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setHydrated(true);
  }, [tick]);

  if (!hydrated) return null;

  if (!session) {
    return (
      <Link href="/v1/account" className="mt-8 inline-block bg-[#253D9A] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1B2C70]">
        Sign in to view &amp; download
      </Link>
    );
  }

  const state = canAccessDataset(dataset, session);

  if (state === "full") {
    return (
      <Link href="/v1/dashboard" className="mt-8 inline-block bg-[#253D9A] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1B2C70]">
        View &amp; download in your dashboard
      </Link>
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
        className="mt-8 border border-[#253D9A] px-5 py-2.5 text-sm font-medium text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
      >
        Request access
      </button>
    );
  }

  return <p className="mt-8 text-sm text-[#8b8fa3]">Restricted to internal staff roles.</p>;
}
