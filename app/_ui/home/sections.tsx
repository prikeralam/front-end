import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { HomeData } from "../../_lib/home/homeData";
import type { PRIEvent } from "../../_lib/types";

export const homeEyebrow = "flex items-center gap-2.5 font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#253D9A]";
export const homeViewAll = "text-sm font-semibold text-[#253D9A] hover:underline";
export const homeMono = "font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.1em]";
export const primaryButton = "inline-flex items-center gap-2 rounded-md bg-[#253D9A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2C70]";

/** Mono kicker with the square marker, the heading, and an optional link on the right. */
export function SectionIntro({ label, title, action }: { label: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-3">
        <p className={homeEyebrow}>
          <span aria-hidden="true" className="h-2 w-2 bg-[#253D9A]" />
          {label}
        </p>
        <h2 className="text-balance text-[28px] leading-tight text-[#171a2b] sm:text-[34px]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Day and month for a date block, or null while the date is only a note. */
export function dateParts(event: PRIEvent): { day: string; month: string; year: string } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(event.startDate);
  if (!event.dateFixed || !match) return null;
  return { day: String(Number(match[3])), month: MONTHS[Number(match[2]) - 1] ?? "", year: match[1] };
}

/** The chairman's words: only once the `chairman-quote` block is published, never invented. */
export function ChairmanQuote({ quote, chairman }: { quote: HomeData["quote"]; chairman: HomeData["chairman"] }) {
  if (!quote || !chairman) return null;
  return (
    <section className="bg-[#171a2b] text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-12 md:grid-cols-[1fr_auto] md:gap-12">
        <figure className="grid max-w-[62ch] gap-5">
          {quote.title && <p className="text-balance font-[family-name:var(--font-heading)] text-[24px] leading-tight sm:text-[30px]">&ldquo;{quote.title}&rdquo;</p>}
          <blockquote className="text-pretty text-[15.5px] leading-relaxed text-white/75">{quote.body}</blockquote>
          <figcaption className="border-l-2 border-[#8fa6ff] pl-4">
            <span className="block text-[15px] font-semibold">{chairman.name}</span>
            <span className="font-[family-name:var(--font-mono)] text-[11.5px] uppercase tracking-[0.08em] text-white/55">{chairman.role}, Policy and Research Initiative</span>
          </figcaption>
        </figure>
        {chairman.photo?.src && (
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-lg md:w-[220px]">
            <Image src={chairman.photo.src} alt={`Portrait of ${chairman.name}`} fill sizes="220px" className="object-cover object-top grayscale" />
          </div>
        )}
      </div>
    </section>
  );
}

/** Partner names with their logos where there is one; links to the partner's site, else /partners. */
export function PartnersRow({ partners, title = "Working with" }: { partners: HomeData["partners"]; title?: string }) {
  if (partners.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <SectionIntro label="Partners" title={title} action={<Link href="/partners" className={homeViewAll}>All partners &rarr;</Link>} />
      <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#e3e6f0] bg-[#e3e6f0] md:grid-cols-4">
        {partners.map((p) => (
          <li key={p.slug} className="bg-white">
            <Link
              href={p.website ?? "/partners"}
              {...(p.website ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex h-full flex-col items-center justify-center gap-3 px-4 py-7 text-center"
            >
              {p.logo?.src ? (
                <span className="relative block h-14 w-full">
                  <Image src={p.logo.src} alt={`${p.name} logo`} fill sizes="200px" className="object-contain opacity-75 grayscale transition-[filter,opacity] group-hover:opacity-100 group-hover:grayscale-0" />
                </span>
              ) : (
                <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-full bg-[#eef1fb] font-[family-name:var(--font-heading)] text-lg text-[#253D9A]">
                  {p.name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("")}
                </span>
              )}
              <span className="text-[13px] font-semibold leading-snug text-[#4b4f66] group-hover:text-[#253D9A]">{p.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The closing invitation. `band` puts it on PRI blue; otherwise it sits on the page. */
export function ClosingCta({ band = false }: { band?: boolean }) {
  const look = band ? "bg-[#253D9A] text-white" : "border-t border-[#e3e6f0] bg-white text-[#171a2b]";
  const primary = band ? "bg-white text-[#171a2b] hover:bg-[#eef1fb]" : "bg-[#253D9A] text-white hover:bg-[#1B2C70]";
  const secondary = band ? "border-white/40 text-white hover:border-white" : "border-[#cdd6f3] text-[#253D9A] hover:border-[#253D9A]";
  return (
    <section className={look}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-8 px-6 py-14 md:py-16">
        <div className="grid max-w-xl gap-3">
          <h2 className="text-balance text-[28px] leading-tight sm:text-[34px]">Do you want to work with us?</h2>
          <p className={`text-[16px] leading-relaxed ${band ? "text-white/75" : "text-[#4b4f66]"}`}>We are always glad to hear from researchers, institutions and people who want to join our team.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/careers" className={`inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-colors ${primary}`}>
            Work with us <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link href="/contact" className={`inline-flex items-center rounded-md border px-5 py-3 text-sm font-semibold transition-colors ${secondary}`}>
            Partner with us
          </Link>
        </div>
      </div>
    </section>
  );
}
