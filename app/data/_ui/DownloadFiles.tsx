import type { DatasetFile } from "../../_lib/datasetTypes";

const primary = "inline-flex items-center gap-2 rounded-md bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]";

/** "1.2 MB"; empty when the size isn't known. */
export function formatSize(bytes?: number): string {
  if (bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 3v10m0 0-4-4m4 4 4-4M4 16h12" />
  </svg>
);

/**
 * The dataset's downloads: one button when there is one file, otherwise a button that opens the list of formats.
 * A native <details> keeps it working without JavaScript and keyboard-accessible.
 */
export default function DownloadFiles({ files }: { files: DatasetFile[] }) {
  if (files.length === 1) {
    const [file] = files;
    return (
      <a href={file.path} download className={primary}>
        <DownloadIcon />
        Download {file.label}
        {file.size !== undefined && <span className="font-normal text-white/75">({formatSize(file.size)})</span>}
      </a>
    );
  }

  return (
    <details className="group relative inline-block">
      <summary className={`${primary} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
        <DownloadIcon />
        Download
        <span className="font-normal text-white/75">({files.length} formats)</span>
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="transition-transform group-open:rotate-180">
          <path d="M5 7l5 6 5-6z" />
        </svg>
      </summary>
      <ul className="absolute left-0 z-20 mt-2 min-w-[240px] overflow-hidden rounded-lg border border-[#e3e6f0] bg-white py-1 shadow-[0_16px_32px_-12px_rgba(23,26,43,0.35)]">
        {files.map((file) => (
          <li key={file.format}>
            <a href={file.path} download className="flex items-center justify-between gap-6 px-4 py-2.5 text-[14px] text-[#171a2b] hover:bg-[#f3f5fa] hover:text-[#253D9A]">
              <span className="font-semibold">{file.label}</span>
              <span className="font-[family-name:var(--font-mono)] text-[12px] text-[#6f7899]">{formatSize(file.size)}</span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
