"use client";

import { useEffect, useState } from "react";
import { SITE_UPDATED_EVENT, isStaleDeploymentResponse } from "../_lib/staleDeployment";

/**
 * Tells someone whose page predates a deploy to reload it. The screens catch a failed save themselves and show a
 * generic message; this watches every response instead, so any save from an out-of-date tab (dashboard edits, sign-up,
 * contact form...) brings up the same clear bar with a Reload button.
 */
export default function SiteUpdatedNotice() {
  const [stale, setStale] = useState(false);

  useEffect(() => {
    const original = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const response = await original(...args);
      if (isStaleDeploymentResponse(response)) window.dispatchEvent(new Event(SITE_UPDATED_EVENT));
      return response;
    };
    const onStale = () => setStale(true);
    window.addEventListener(SITE_UPDATED_EVENT, onStale);
    return () => {
      window.fetch = original;
      window.removeEventListener(SITE_UPDATED_EVENT, onStale);
    };
  }, []);

  if (!stale) return null;
  return (
    <div role="alert" className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-[#16245c] px-5 py-4 text-white shadow-[0_18px_40px_-12px_rgba(15,18,32,0.55)] sm:inset-x-6 sm:bottom-6">
      <p className="min-w-0 flex-1 text-[14px] leading-snug">
        <strong className="font-semibold">PRI&rsquo;s site was just updated.</strong>{" "}
        <span className="text-white/80">Reload this page to continue. Copy anything you typed first: it wasn&rsquo;t saved.</span>
      </p>
      <button type="button" onClick={() => window.location.reload()} className="shrink-0 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#16245c] hover:bg-[#e8ecfa]">
        Reload
      </button>
    </div>
  );
}
