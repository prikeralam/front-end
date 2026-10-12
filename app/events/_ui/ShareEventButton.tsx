"use client";

import { useState } from "react";
import { shareProfile } from "../../people/_ui/shareProfile";

const NOTICE: Record<string, string> = { copied: "Link copied", failed: "Couldn't copy the link" };

/** Shares the event through the device's share sheet, or copies its address where there is none. */
export default function ShareEventButton({ slug, title, className, noticeClassName = "text-[#5b5f74]" }: { slug: string; title: string; className: string; noticeClassName?: string }) {
  const [notice, setNotice] = useState<string | null>(null);

  async function handleShare() {
    const outcome = await shareProfile(`${window.location.origin}/events/${slug}`, `${title} · PRI`);
    setNotice(NOTICE[outcome] ?? null);
    if (NOTICE[outcome]) window.setTimeout(() => setNotice(null), 2500);
  }

  return (
    <span className="relative inline-flex">
      <button type="button" onClick={handleShare} className={className}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
        </svg>
        Share
      </button>
      <span role="status" aria-live="polite" className={`pointer-events-none absolute left-0 top-full mt-1.5 whitespace-nowrap text-[12px] ${noticeClassName}`}>
        {notice}
      </span>
    </span>
  );
}
