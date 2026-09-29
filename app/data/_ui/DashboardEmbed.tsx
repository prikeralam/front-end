const EMBED_LABELS = { datawrapper: "Datawrapper", tableau: "Tableau", d3: "D3.js" } as const;

function isHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** A staff-published dashboard embedded in a sandboxed frame, with a plain link as the fallback. */
export default function DashboardEmbed({ url, title, type }: { url: string; title: string; type: keyof typeof EMBED_LABELS }) {
  if (!isHttpUrl(url)) return null;

  return (
    <>
      <div className="aspect-video overflow-hidden rounded-lg border border-[#e6e8f0] bg-white">
        <iframe
          src={url}
          title={`${title} (${EMBED_LABELS[type]})`}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-popups"
          className="h-full w-full"
        />
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[13px] font-semibold text-[#253D9A] hover:underline">
        Open in {EMBED_LABELS[type]} &rarr;
      </a>
    </>
  );
}
