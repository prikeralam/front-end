import Link from "next/link";
import type { ReactNode } from "react";
import type { ContentStatus, Person, PRIDocument } from "../../_lib/types";
import MediaSlot from "./MediaSlot";

export function StatusTag({ status }: { status: ContentStatus }) {
  if (status === "real") return null;
  return (
    <span className="shrink-0 border border-[#B8862F]/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#B8862F]">
      Placeholder
    </span>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block bg-[#6B2737]/8 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#6B2737]">
      {children}
    </span>
  );
}

export function PageHeader({ kicker, title, intro }: { kicker: string; title: string; intro?: string }) {
  return (
    <section className="border-b border-[#e6dbc7] bg-[#F1E9D8]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B8862F]">{kicker}</p>
        <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-heading)] text-[38px] font-semibold leading-tight text-[#171a2b] sm:text-[44px]">
          {title}
        </h1>
        {intro && <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#4b4f66]">{intro}</p>}
      </div>
    </section>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="border-b-2 border-[#6B2737] pb-3 font-[family-name:var(--font-heading)] text-[26px] font-semibold text-[#171a2b]">
      {children}
    </h2>
  );
}

export function Card({ children, href }: { children: ReactNode; href?: string }) {
  const cls = "block border border-[#e6dbc7] bg-white p-6 transition-colors hover:border-[#6B2737]";
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t-2 border-[#6B2737] pt-3">
      <p className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-[#171a2b]">{value}</p>
      <p className="mt-1 text-sm text-[#5b5f74]">{label}</p>
    </div>
  );
}

export function Quote({ quote, name, role, status }: { quote: string; name: string; role: string; status: ContentStatus }) {
  return (
    <figure className="border-t-2 border-[#6B2737] bg-white p-7">
      <blockquote className="font-[family-name:var(--font-heading)] text-[17px] leading-relaxed text-[#22263a]">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-2 border-t border-[#e6dbc7] pt-4 text-sm">
        <span className="font-semibold text-[#4A1B26]">{name}</span>
        <span className="text-[#8b8fa3]">{role}</span>
        <StatusTag status={status} />
      </figcaption>
    </figure>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-[#6B2737]/30 bg-[#F1E9D8] px-6 py-10 text-center text-sm text-[#8b8fa3]">
      {message}
    </div>
  );
}

export function PersonCard({ person }: { person: Person }) {
  return (
    <div className="border border-[#e6dbc7] bg-white p-5">
      {person.photo && <MediaSlot need={person.photo} className="mb-4" />}
      <p className="flex items-center gap-2 text-[15px] font-semibold text-[#4A1B26]">
        {person.name}
        <StatusTag status={person.status} />
      </p>
      <p className="mt-1 text-sm text-[#5b5f74]">{person.role}</p>
      {person.bio && <p className="mt-3 text-[13px] leading-relaxed text-[#5b5f74]">{person.bio}</p>}
    </div>
  );
}

export function DocumentRow({ doc }: { doc: PRIDocument }) {
  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <div>
        <span className="flex items-center gap-2 text-[15px] font-semibold text-[#4A1B26]">
          {doc.title}
          <StatusTag status={doc.status} />
        </span>
        {doc.year && <span className="text-[13px] text-[#8b8fa3]">{doc.kind} &middot; {doc.year}</span>}
      </div>
      <span className="shrink-0 border border-[#B8862F]/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#B8862F]">
        {doc.kind === "Issue" ? "Read" : doc.kind}
      </span>
    </li>
  );
}

export function FilterBar({ facets }: { facets: { label: string; options: string[] }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-5 border-y border-[#e6dbc7] py-4">
      {facets.map((f) => (
        <label key={f.label} className="flex items-center gap-2 text-[13px] font-medium text-[#5b5f74]">
          {f.label}
          <select className="border border-[#6B2737]/25 bg-white px-2 py-1.5 text-[13px] text-[#3a3f55]" defaultValue="">
            <option value="">All</option>
            {f.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
      ))}
      <span className="text-[12px] text-[#8b8fa3]">Filters are a visual mock — not wired yet.</span>
    </div>
  );
}

export function FormMock({ title, fields, note }: { title: string; fields: string[]; note?: string }) {
  return (
    <div className="border border-[#e6dbc7] bg-white p-6">
      <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[#4A1B26]">{title}</h3>
      <div className="mt-4 space-y-3">
        {fields.map((f) => (
          <div key={f}>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#8b8fa3]">{f}</label>
            <div className="h-10 border border-[#6B2737]/25 bg-[#F1E9D8]" />
          </div>
        ))}
      </div>
      {note && <p className="mt-3 text-[12px] text-[#8b8fa3]">{note}</p>}
      <button type="button" disabled className="mt-4 cursor-not-allowed bg-[#6B2737]/40 px-5 py-2.5 text-sm font-semibold text-white">
        Submit (not wired)
      </button>
    </div>
  );
}

/** Numbered item with a large faint numeral — the recurring V3 list treatment. */
export function NumberedItem({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[#6B2737]/25">
        {String(n).padStart(2, "0")}
      </span>
      <div className="flex-1 pt-1">{children}</div>
    </div>
  );
}
