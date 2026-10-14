import type { ReactNode } from "react";

/**
 * The top of every dashboard page: breadcrumb, title, a one-line description, and the page's primary action on the
 * right. It sits on the console's canvas under the white top bar, so pages read as one surface.
 */
export default function DashboardPageHeader({ trail, title, description, actions }: { trail?: string[]; title: string; description?: string; actions?: ReactNode }) {
  return (
    <header>
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-6 pb-1 pt-7 lg:px-8">
        <div className="min-w-0">
          {trail && trail.length > 0 && (
            <p className="mb-1 flex flex-wrap items-center gap-1.5 text-[12px] font-medium text-faint">
              {trail.map((crumb, i) => (
                <span key={crumb} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {crumb}
                </span>
              ))}
            </p>
          )}
          <h1 className="font-[family-name:var(--font-heading)] text-[26px] leading-tight tracking-tight text-ink">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/** The page's main action (e.g. "+ New person"): solid brand, top right of the header. */
export const primaryButton =
  "inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(37,61,154,0.3)] transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3.5 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-60";
