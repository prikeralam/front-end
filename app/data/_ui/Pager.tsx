"use client";

/** Previous / page n of m / Next under a list. Renders nothing when everything fits on one page. */
export default function Pager({ page, pages, onChange, tone = "light" }: { page: number; pages: number; onChange: (page: number) => void; tone?: "light" | "dark" }) {
  if (pages <= 1) return null;
  const button =
    tone === "dark"
      ? "rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[13.5px] font-semibold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
      : "rounded-lg border border-[#d9ddea] bg-white px-3.5 py-2 text-[13.5px] font-semibold text-[#171a2b] hover:border-[#253D9A] hover:text-[#253D9A] disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <nav aria-label="Pages" className="mt-4 flex items-center justify-between gap-3">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className={button}>
        &larr; Previous
      </button>
      <p className={`text-[13px] ${tone === "dark" ? "text-white/75" : "text-[#5b5f74]"}`} aria-live="polite">
        Page {page} of {pages}
      </p>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= pages} className={button}>
        Next &rarr;
      </button>
    </nav>
  );
}
