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
 * Square icon links for one person: LinkedIn and email when the profile has them, and optionally share (the profile
 * page's own address). Every icon has a hover tooltip and an accessible name. `size="sm"` is the quiet card version;
 * `size="md"` the bordered one in the pop-up and on the profile page.
 */
export default function ProfileLinks({
  person,
  size = "sm",
  share = true,
}: {
  person: Pick<Person, "slug" | "name" | "linkedin" | "email">;
  size?: "sm" | "md";
  share?: boolean;
}) {
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

  if (!person.linkedin && !person.email && !share) return null;

  const item =
    size === "md"
      ? "grid h-10 w-10 place-items-center rounded-md border border-[#e3e6f0] bg-white text-[#3a4263] transition-colors hover:border-[#253D9A] hover:bg-[#253D9A] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253D9A]"
      : "grid h-8 w-8 place-items-center rounded-md text-[#6f7899] transition-colors hover:bg-[#253D9A]/8 hover:text-[#253D9A] focus-visible:outline-2 focus-visible:outline-[#253D9A]";

  return (
    <div className={`relative flex items-center ${size === "md" ? "gap-2" : "-ml-1.5 gap-0.5"}`}>
      {person.linkedin && (
        <a href={person.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label={`${person.name} on LinkedIn (opens in a new tab)`} className={item}>
          <LinkedInIcon />
        </a>
      )}
      {person.email && (
        <a href={`mailto:${person.email}`} title={person.email} aria-label={`Email ${person.name} at ${person.email}`} className={item}>
          <MailIcon />
        </a>
      )}
      {share && (
        <button type="button" onClick={handleShare} title="Share profile" aria-label={`Share ${person.name}'s profile`} className={item}>
          <ShareIcon />
        </button>
      )}
      <span role="status" aria-live="polite" className={notice ? "absolute left-0 top-full mt-2 whitespace-nowrap rounded-md bg-[#171a2b] px-2.5 py-1 text-[12px] font-semibold text-white" : "sr-only"}>
        {notice ?? ""}
      </span>
    </div>
  );
}
