"use client";

import { useEffect, useState } from "react";
import type { Person } from "../../_lib/types";
import { shareProfile } from "./shareProfile";

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm7 0h3.8v1.5h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-4v-11Z" />
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </svg>
);
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
  </svg>
);

const NOTICE: Record<string, string> = { copied: "Link copied", failed: "Couldn't copy the link" };

/**
 * LinkedIn, email and share for one person. LinkedIn and email appear only when the profile has them; share is
 * always there and shares the profile page's own address. `size="md"` adds text labels (pop-up and profile page).
 */
export default function ProfileLinks({ person, size = "sm" }: { person: Pick<Person, "slug" | "name" | "linkedin" | "email">; size?: "sm" | "md" }) {
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function handleShare() {
    const outcome = await shareProfile(`${window.location.origin}/people/${person.slug}`, `${person.name} · PRI`);
    setNotice(NOTICE[outcome] ?? null);
  }

  const labelled = size === "md";
  const item = labelled
    ? "inline-flex h-9 items-center gap-2 rounded-md border border-[#e3e6f0] bg-white px-3 text-[13px] font-semibold text-[#3a4263] transition-colors hover:border-[#253D9A] hover:text-[#253D9A]"
    : "grid h-8 w-8 place-items-center rounded-md text-[#6f7899] transition-colors hover:bg-[#253D9A]/8 hover:text-[#253D9A]";

  return (
    <div className={`relative flex items-center ${labelled ? "flex-wrap gap-1.5" : "-ml-1.5 gap-0.5"}`}>
      {person.linkedin && (
        <a href={person.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${person.name} on LinkedIn (opens in a new tab)`} className={item}>
          <LinkedInIcon />
          {labelled && "LinkedIn"}
        </a>
      )}
      {person.email && (
        <a href={`mailto:${person.email}`} aria-label={`Email ${person.name}`} title={labelled ? undefined : person.email} className={item}>
          <MailIcon />
          {labelled && <span className="max-w-[22ch] truncate">{person.email}</span>}
        </a>
      )}
      <button type="button" onClick={handleShare} aria-label={`Share ${person.name}'s profile`} className={item}>
        <ShareIcon />
        {labelled && "Share"}
      </button>
      <span role="status" aria-live="polite" className={notice ? "absolute -top-8 right-0 whitespace-nowrap rounded-md bg-[#171a2b] px-2.5 py-1 text-[12px] font-semibold text-white" : "sr-only"}>
        {notice ?? ""}
      </span>
    </div>
  );
}
