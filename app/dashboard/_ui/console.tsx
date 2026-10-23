"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { menuPlacement } from "../../_lib/dashboard/menuPlacement";

/*
 * The admin console's building blocks, all on the design tokens in globals.css (ink, muted, line, canvas, brand...):
 * a calm, data-dense look after Stripe and Linear. Numbers are set in the mono face so columns of figures align.
 */

export const mono = "font-[family-name:var(--font-mono)]";
export const panelClass = "rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(22,26,46,0.04)]";
export const buttonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50";
export const primaryClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(37,61,154,0.3)] transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60";
export const dangerClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-danger/30 bg-surface px-3 py-1.5 text-[13px] font-semibold text-danger transition-colors hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-50";
/** The confirming step of something that can't be undone, such as deleting an account. */
export const dangerSolidClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-danger px-3 py-1.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

const AVATAR_TONES = ["bg-[#e7ecfb] text-[#253d9a]", "bg-[#e6f4ee] text-[#1d6b45]", "bg-[#fbf0e2] text-[#8a5a12]", "bg-[#f3e8f7] text-[#6b2d86]", "bg-[#e5f2f6] text-[#145e74]"];

/** Up to two initials from a name or email. */
export function initialsOf(name: string): string {
  const parts = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

/** A tinted circle with initials; the tint is stable per person. */
export function Avatar({ name, seed, size = 32 }: { name: string; seed: string | number; size?: number }) {
  const key = String(seed);
  const tone = AVATAR_TONES[[...key].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_TONES.length];
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full text-[12px] font-semibold ${tone}`} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initialsOf(name)}
    </span>
  );
}

export type Tone = "neutral" | "brand" | "ok" | "warn" | "danger";

const BADGE: Record<Tone, string> = {
  neutral: "bg-canvas text-muted ring-line-strong",
  brand: "bg-brand-soft text-brand ring-brand/20",
  ok: "bg-ok-soft text-ok ring-ok/20",
  warn: "bg-warn-soft text-warn ring-warn/25",
  danger: "bg-danger-soft text-danger ring-danger/20",
};

/** A small status pill with a dot, e.g. "Confirmed", "Deactivated". */
export function Badge({ tone = "neutral", children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset ${BADGE[tone]}`}>
      {dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

/** A tiny trend line for a stat card; no axes, just the shape. */
export function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const w = 100;
  const h = 28;
  const points = values.map((v, i) => [(i / (values.length - 1)) * w, h - 2 - (v / max) * (h - 4)]);
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true" className={`h-7 w-full ${className}`}>
      <path d={`${line} L${w},${h} L0,${h} Z`} className="fill-brand/8" />
      <path d={line} fill="none" vectorEffect="non-scaling-stroke" className="stroke-brand" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
}

/** A key number: label, value, an optional note under it and an optional sparkline. */
export function StatCard({ label, value, note, trend, href }: { label: string; value: ReactNode; note?: ReactNode; trend?: number[]; href?: string }) {
  const body = (
    <>
      <p className="text-[12.5px] font-medium text-muted">{label}</p>
      <p className={`${mono} mt-1.5 text-[28px] font-semibold leading-none tracking-tight text-ink`}>{value}</p>
      {note && <p className="mt-2 text-[12px] text-muted">{note}</p>}
      {trend && <Sparkline values={trend} className="mt-3" />}
    </>
  );
  return href ? (
    <a href={href} className={`${panelClass} block p-4 transition-colors hover:border-line-strong`}>{body}</a>
  ) : (
    <div className={`${panelClass} p-4`}>{body}</div>
  );
}

/** A white panel with an optional header row (title, a muted description, actions on the right). */
export function Panel({ title, description, actions, children, flush = false }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode; flush?: boolean }) {
  return (
    <section className={panelClass}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="text-[14px] font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={flush ? "" : "p-4"}>{children}</div>
    </section>
  );
}

export type Chip<T extends string> = { value: T; label: string; count?: number };

/** A row of filter chips; one is selected (aria-pressed). */
export function FilterChips<T extends string>({ chips, value, onChange, label }: { chips: Chip<T>[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {chips.map((chip) => {
        const on = chip.value === value;
        return (
          <button
            key={chip.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(chip.value)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-semibold transition-colors ${
              on ? "border-brand bg-brand text-white" : "border-line-strong bg-surface text-ink-soft hover:bg-hover"
            }`}
          >
            {chip.label}
            {chip.count !== undefined && <span className={`${mono} text-[11px] ${on ? "text-white/80" : "text-faint"}`}>{chip.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** "21–40 of 132" with Previous / Next. */
export function Pagination({ page, pageSize, count, hasNext, hasPrevious, onPage }: { page: number; pageSize: number; count: number; hasNext: boolean; hasPrevious: boolean; onPage: (page: number) => void }) {
  if (count === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, count);
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-[12.5px] text-muted">
      <span>
        <span className={mono}>{from}–{to}</span> of <span className={mono}>{count}</span>
      </span>
      <div className="flex gap-1.5">
        <button type="button" disabled={!hasPrevious} onClick={() => onPage(page - 1)} className={buttonClass}>Previous</button>
        <button type="button" disabled={!hasNext} onClick={() => onPage(page + 1)} className={buttonClass}>Next</button>
      </div>
    </div>
  );
}

export type MenuAction = { label: string; run: () => void; danger?: boolean };

/** A "•••" button that opens a short menu of secondary actions. */
export function MoreMenu({ actions, disabled = false, buttonClassName = buttonClass }: { actions: MenuAction[]; disabled?: boolean; buttonClassName?: string }) {
  // Fixed to the viewport, so a list's overflow-hidden can't clip it; opens upward when there isn't room below.
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const open = menuStyle !== null;

  useEffect(() => {
    if (!open) return;
    const close = () => setMenuStyle(null);
    // Scrolling the page would leave the menu behind; scrolling inside a long menu is fine.
    const onScroll = (e: Event) => {
      if (!(e.target instanceof Element && e.target.closest('[role="menu"]'))) close();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  if (actions.length === 0) return null;

  function toggle(button: HTMLElement) {
    if (open) return setMenuStyle(null);
    setMenuStyle(menuPlacement(button.getBoundingClientRect(), { width: window.innerWidth, height: window.innerHeight }, actions.length));
  }

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setMenuStyle(null);
      }}
    >
      <button type="button" disabled={disabled} aria-haspopup="menu" aria-expanded={open} aria-label="More actions" onClick={(e) => { e.stopPropagation(); toggle(e.currentTarget); }} className={`${buttonClassName} px-2 tracking-widest`}>
        •••
      </button>
      {open && (
        <div role="menu" style={menuStyle} className="z-50 max-h-[70vh] min-w-44 overflow-y-auto rounded-lg border border-line bg-surface py-1 shadow-[0_10px_30px_rgba(22,26,46,0.14)]">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setMenuStyle(null);
                a.run();
              }}
              className={`block w-full px-3 py-2 text-left text-[13px] ${a.danger ? "text-danger hover:bg-danger-soft" : "text-ink-soft hover:bg-hover"}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export type Column<Row> = {
  key: string;
  header: string;
  cell: (row: Row) => ReactNode;
  /** Tailwind width / alignment classes for the column, e.g. "w-32 text-right". */
  className?: string;
  /** Hidden below this breakpoint so phones keep the essentials. */
  hideBelow?: "sm" | "md" | "lg";
  /** Set to make the header sortable; the value is the API's ordering key. */
  sortKey?: string;
};

const HIDE: Record<NonNullable<Column<unknown>["hideBelow"]>, string> = { sm: "hidden sm:table-cell", md: "hidden md:table-cell", lg: "hidden lg:table-cell" };

/**
 * A dense table: sticky header, hairline rows, a whole-row click (keyboard too), sortable headers that report the
 * API ordering key ("-date_joined" for descending), and loading / empty states in the body.
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  selectedKey,
  loading = false,
  empty,
  ordering,
  onOrder,
  caption,
}: {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string | number;
  onRowClick?: (row: Row) => void;
  selectedKey?: string | number | null;
  loading?: boolean;
  empty?: ReactNode;
  ordering?: string;
  onOrder?: (ordering: string) => void;
  caption: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[13px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-canvas/60">
            {columns.map((col) => {
              const sorted = ordering?.replace(/^-/, "") === col.sortKey;
              const descending = ordering?.startsWith("-");
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={col.sortKey && sorted ? (descending ? "descending" : "ascending") : undefined}
                  className={`whitespace-nowrap px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted ${col.className ?? ""} ${col.hideBelow ? HIDE[col.hideBelow] : ""}`}
                >
                  {col.sortKey && onOrder ? (
                    <button
                      type="button"
                      onClick={() => onOrder(sorted && !descending ? `-${col.sortKey}` : col.sortKey!)}
                      className="inline-flex items-center gap-1 uppercase hover:text-ink"
                    >
                      {col.header}
                      <span aria-hidden="true" className={sorted ? "text-brand" : "text-faint/60"}>{sorted ? (descending ? "↓" : "↑") : "↕"}</span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }, (_, i) => (
                <tr key={i} className="border-b border-line last:border-b-0">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3.5 ${col.hideBelow ? HIDE[col.hideBelow] : ""}`}>
                      <span className="block h-3 w-3/4 animate-pulse rounded bg-canvas motion-reduce:animate-none" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-14 text-center text-[13.5px] text-muted">{empty ?? "Nothing here yet."}</td>
                </tr>
              )
              : rows.map((row) => {
                  const key = rowKey(row);
                  const selected = selectedKey === key;
                  return (
                    <tr
                      key={key}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      onKeyDown={onRowClick ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onRowClick(row)) : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      aria-selected={onRowClick ? selected : undefined}
                      className={`border-b border-line last:border-b-0 ${onRowClick ? "cursor-pointer outline-none focus-visible:bg-brand-soft" : ""} ${selected ? "bg-brand-soft/70" : onRowClick ? "hover:bg-hover" : ""}`}
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={`px-4 py-3 align-middle ${col.className ?? ""} ${col.hideBelow ? HIDE[col.hideBelow] : ""}`}>
                          {col.cell(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
        </tbody>
      </table>
    </div>
  );
}
