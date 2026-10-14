import type { ReactNode } from "react";
import { mono } from "./console";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-12" -> "12 Oct" (fixed month names, so server and browser agree). */
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return m && d ? `${d} ${MONTHS[m - 1]}` : iso;
}

/**
 * Weekly counts as columns, newest on the right. Each column has a tooltip and an accessible label; the scale is
 * rounded up to a tidy number and drawn as two faint gridlines.
 */
export function WeeklyBars({ weeks, unit }: { weeks: { week: string; count: number }[]; unit: string }) {
  const peak = Math.max(...weeks.map((w) => w.count), 0);
  const scale = peak <= 4 ? 4 : Math.ceil(peak / 4) * 4;
  return (
    <figure>
      <div className="relative h-40">
        {[1, 0.5].map((f) => (
          <div key={f} aria-hidden="true" className="absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: `${f * 100}%` }}>
            <span className={`${mono} absolute -top-2.5 right-0 bg-surface pl-1 text-[10.5px] text-faint`}>{Math.round(scale * f)}</span>
          </div>
        ))}
        <ol className="absolute inset-0 flex items-end gap-1.5 pr-7">
          {weeks.map((w, i) => {
            const last = i === weeks.length - 1;
            return (
              <li key={w.week} className="group relative flex h-full flex-1 items-end" aria-label={`Week of ${shortDate(w.week)}: ${w.count} ${unit}`}>
                <span
                  className={`block w-full rounded-t-[3px] transition-colors ${last ? "bg-brand" : "bg-brand/25 group-hover:bg-brand/45"}`}
                  style={{ height: `${Math.max((w.count / scale) * 100, w.count ? 3 : 1)}%` }}
                />
                <span role="tooltip" className={`${mono} pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[11px] text-white group-hover:block`}>
                  {w.count}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <figcaption className="mt-2 flex justify-between pr-7 text-[11px] text-faint">
        <span>{weeks[0] ? shortDate(weeks[0].week) : ""}</span>
        <span>This week</span>
      </figcaption>
    </figure>
  );
}

/** A ranked list with a proportional bar behind each row, e.g. top datasets by downloads. */
export function BarList({ items, empty }: { items: { key: string; label: ReactNode; value: number }[]; empty: string }) {
  if (items.length === 0) return <p className="py-6 text-center text-[13px] text-muted">{empty}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.key} className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2.5 py-1.5">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 rounded-md bg-brand-soft" style={{ width: `${(item.value / max) * 100}%` }} />
          <span className="relative min-w-0 truncate text-[13px] text-ink-soft">{item.label}</span>
          <span className={`${mono} relative text-[12.5px] font-semibold text-ink`}>{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
