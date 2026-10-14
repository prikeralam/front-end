"use client";

import { useState, type MouseEvent } from "react";
import { getDownloadLinkAction } from "../../_lib/dashboard/datasetActions";
import type { DatasetFile } from "../../_lib/datasetTypes";
import { formatSize } from "../../_lib/formatSize";

const primary = "inline-flex items-center gap-2 rounded-md bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]";

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 3v10m0 0-4-4m4 4 4-4M4 16h12" />
  </svg>
);

/**
 * The dataset's downloads: one button when there is one file, otherwise a button that opens the list of formats.
 * Each click asks the backend's `/download/` for a fresh link, which records the download for PRI; if that fails the
 * link already on the page is used, so a download is never blocked by the record. Without JavaScript the plain links
 * still work (unrecorded), and the native <details> keeps the format list keyboard-accessible.
 */
export default function DownloadFiles({ slug, files }: { slug: string; files: DatasetFile[] }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function download(e: MouseEvent<HTMLAnchorElement>, file: DatasetFile) {
    e.preventDefault();
    if (busy) return;
    setBusy(file.format);
    const link = await getDownloadLinkAction(slug, file.format).catch(() => null);
    setBusy(null);
    window.location.assign(link ?? file.path);
  }

  if (files.length === 1) {
    const [file] = files;
    return (
      <a href={file.path} download onClick={(e) => download(e, file)} aria-busy={!!busy} className={`${primary} ${busy ? "cursor-wait opacity-80" : ""}`}>
        <DownloadIcon />
        {busy ? "Preparing…" : `Download ${file.label}`}
        {!busy && file.size !== undefined && <span className="font-normal text-white/75">({formatSize(file.size)})</span>}
      </a>
    );
  }

  return (
    <details className="group relative inline-block">
      <summary className={`${primary} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
        <DownloadIcon />
        {busy ? "Preparing…" : "Download"}
        <span className="font-normal text-white/75">({files.length} formats)</span>
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="transition-transform group-open:rotate-180">
          <path d="M5 7l5 6 5-6z" />
        </svg>
      </summary>
      <ul className="absolute left-0 z-20 mt-2 min-w-[240px] overflow-hidden rounded-lg border border-[#e3e6f0] bg-white py-1 shadow-[0_16px_32px_-12px_rgba(23,26,43,0.35)]">
        {files.map((file) => (
          <li key={file.format}>
            <a href={file.path} download onClick={(e) => download(e, file)} className="flex items-center justify-between gap-6 px-4 py-2.5 text-[14px] text-[#171a2b] hover:bg-[#f3f5fa] hover:text-[#253D9A]">
              <span className="font-semibold">{busy === file.format ? "Preparing…" : file.label}</span>
              <span className="font-[family-name:var(--font-mono)] text-[12px] text-[#6f7899]">{formatSize(file.size)}</span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
