import type { ReactNode } from "react";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

// One line icon per tile, by position; a fifth tile or more reuses them in turn.
const ICONS: ReactNode[] = [
  // Research: a magnifier over bars.
  <svg key="r" viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
    <path d="M4 19V11M8 19V7M12 19v-5" />
    <circle cx="16.5" cy="9.5" r="3.5" />
    <path d="m19 12 2.5 2.5" />
  </svg>,
  // Policy: a document with lines and a seal.
  <svg key="p" viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
    <path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V3.5Z" />
    <path d="M14 3.5V8h4M9 12h6M9 15.5h3.5" />
  </svg>,
  // Advocacy: a megaphone.
  <svg key="a" viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
    <path d="M4 10v4a1 1 0 0 0 1 1h2l8 4.5V5.5L7 10H5a1 1 0 0 0-1 1Z" />
    <path d="M7.5 15l1.2 4.5M18.5 9.5a3.5 3.5 0 0 1 0 5" />
  </svg>,
  // Knowledge sharing: an open book.
  <svg key="k" viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
    <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z" />
    <path d="M12 6.5v13" />
  </svg>,
];

/** "What we do": the mission, one tile per line. */
export default function MissionTiles({ tiles }: { tiles: { title: string; text: string }[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-[#e3e6f0] bg-[#e3e6f0] sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile, i) => (
        <div key={i} className="group flex flex-col bg-white p-7 transition-colors hover:bg-[#fbfcff]">
          <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-md bg-[#253D9A]/8 text-[#253D9A] transition-colors group-hover:bg-[#253D9A] group-hover:text-white">
            {ICONS[i % ICONS.length]}
          </span>
          <h3 className="mt-6 font-[family-name:var(--font-heading)] text-[19px] leading-snug text-[#171a2b]">{tile.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#5b5f74]">{tile.text}</p>
        </div>
      ))}
    </div>
  );
}
