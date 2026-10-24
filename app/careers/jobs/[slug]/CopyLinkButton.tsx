"use client";

import { useState } from "react";

/** Shares a link to the job description: the system share sheet where there is one (phones), else the clipboard. */
export default function CopyLinkButton({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share) {
      // A dismissed share sheet rejects; that is not an error worth showing.
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, () => undefined);
  }

  return (
    <button type="button" onClick={share} className="text-sm font-semibold text-[#253D9A] hover:underline">
      <span aria-live="polite">{copied ? "Link copied" : "Share job description"}</span>
    </button>
  );
}
