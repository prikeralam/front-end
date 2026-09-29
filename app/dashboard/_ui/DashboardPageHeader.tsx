import type { ReactNode } from "react";

/**
 * The top of every dashboard page: breadcrumb, title, a one-line description, and the page's primary action on the
 * right. Compact on purpose; the public site's large `PageHeader` pushed the actual work below the fold.
 */
export default function DashboardPageHeader({ trail, title, description, actions }: { trail?: string[]; title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="border-b border-[#e3e6f0] bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-6 pb-5 pt-6 lg:px-8">
        <div className="min-w-0">
          {trail && trail.length > 0 && (
            <p className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[12px] font-medium text-[#7d86a8]">
              {trail.map((crumb, i) => (
                <span key={crumb} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true" className="text-[#c2c8dc]">/</span>}
                  {crumb}
                </span>
              ))}
            </p>
          )}
          <h1 className="font-[family-name:var(--font-heading)] text-[26px] leading-tight tracking-tight text-[#171a2b]">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#5b6280]">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/** The page's main action (e.g. "+ New person"): solid brand, top right of the header. */
export const primaryButton =
  "inline-flex items-center gap-1.5 rounded-lg bg-[#253D9A] px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(37,61,154,0.25)] transition-colors hover:bg-[#1B2C70] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253D9A] disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-[#d9ddea] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#3a4263] transition-colors hover:bg-[#f3f5fa] disabled:cursor-not-allowed disabled:opacity-60";
