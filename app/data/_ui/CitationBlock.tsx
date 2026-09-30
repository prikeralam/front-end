"use client";

import { useState, useSyncExternalStore } from "react";
import { citationFor } from "../../_lib/datasetCitation";
import type { DatasetDetail } from "../../_lib/datasetTypes";

/** How to cite the dataset, with a copy button. The address is the public dataset page, wherever this is shown. */
export default function CitationBlock({ dataset }: { dataset: Pick<DatasetDetail, "slug" | "title" | "citation" | "updatedAt"> }) {
  const [copied, setCopied] = useState<"yes" | "failed" | null>(null);
  // The site's address is only known in the browser: the server renders the path, and the browser fills in the rest.
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const text = citationFor(dataset, `${origin}/data/${dataset.slug}`);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("yes");
    } catch {
      setCopied("failed");
    }
    window.setTimeout(() => setCopied(null), 2500);
  }

  return (
    <div className="grid gap-3">
      <p className="text-[13.5px] text-[#5b6280]">Please cite this dataset when you use it:</p>
      <blockquote className="rounded-lg border border-[#e3e6f0] bg-white px-4 py-3.5 font-[family-name:var(--font-mono)] text-[12.5px] leading-relaxed text-[#171a2b]">
        {text}
      </blockquote>
      <div className="flex items-center gap-3">
        <button type="button" onClick={copy} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9ddea] bg-white px-3 text-[13px] font-semibold text-[#253D9A] transition-colors hover:border-[#253D9A]">
          Copy citation
        </button>
        <span role="status" aria-live="polite" className="text-[12.5px] font-semibold text-[#1f7a4d]">
          {copied === "yes" ? "Copied" : copied === "failed" ? "Couldn't copy; select the text instead" : ""}
        </span>
      </div>
    </div>
  );
}
