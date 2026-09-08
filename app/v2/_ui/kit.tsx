import Link from "next/link";
import type { ReactNode, ChangeEvent } from "react";
import type { ContentStatus, Person, PRIDocument } from "../../_lib/types";
import MediaSlot from "./MediaSlot";

export function StatusTag({ status }: { status: ContentStatus }) {
  if (status === "real") return null;
  return (
    <span className="shrink-0 rounded-full bg-[#f0f1f5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8b8fa3]">
      Placeholder
    </span>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-[#243D9A]/8 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#243D9A]">
      {children}
    </span>
  );
}

export function PageHeader({ kicker, title, intro }: { kicker: string; title: string; intro?: string }) {
  return (
    <section className="border-b border-[#e6e8f0] bg-[#fafbfc]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <span className="inline-block rounded-full bg-[#243D9A]/8 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#243D9A]">
          {kicker}
        </span>
        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-[#171a2b] sm:text-5xl">
          {title}
        </h1>
        {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#4b4f66]">{intro}</p>}
      </div>
    </section>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="text-2xl font-bold tracking-tight text-[#171a2b]">{children}</h2>;
}

export function Card({ children, href }: { children: ReactNode; href?: string }) {
  const cls = "block rounded-xl border border-[#e6e8f0] bg-white p-6 transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]";
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
    <div className="rounded-xl border border-[#e6e8f0] bg-[#fafbfc] p-6">
      <p className="font-[family-name:var(--font-mono)] text-3xl font-semibold text-[#243D9A]">{value}</p>
      <p className="mt-2 text-sm text-[#5b5f74]">{label}</p>
    </div>
  );
}

export function Quote({ quote, name, role, status }: { quote: string; name: string; role: string; status: ContentStatus }) {
  return (
    <figure className="rounded-xl bg-[#243D9A] p-6 text-white">
      <blockquote className="text-[15px] leading-relaxed text-white/95">&ldquo;{quote}&rdquo;</blockquote>
      <figcaption className="mt-5 flex items-center gap-2 border-t border-white/15 pt-4 text-sm">
        <span className="font-semibold">{name}</span>
        <span className="text-white/60">{role}</span>
        {status === "placeholder" && (
          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/70">
            Placeholder
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#e6e8f0] bg-[#fafbfc] px-6 py-10 text-center text-sm text-[#8b8fa3]">
      {message}
    </div>
  );
}

export function PersonCard({ person }: { person: Person }) {
  return (
    <div className="rounded-xl border border-[#e6e8f0] bg-white p-5">
      {person.photo && <MediaSlot need={person.photo} className="mb-4" />}
      <p className="flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">
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
    <li className="flex items-center justify-between gap-4 rounded-lg border border-[#e6e8f0] bg-white px-5 py-4">
      <div>
        <span className="flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">
          {doc.title}
          <StatusTag status={doc.status} />
        </span>
        {doc.year && <span className="text-[13px] text-[#8b8fa3]">{doc.kind} &middot; {doc.year}</span>}
      </div>
      <span className="shrink-0 rounded-full bg-[#E4633F]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#E4633F]">
        {doc.kind === "Issue" ? "Read" : doc.kind}
      </span>
    </li>
  );
}

export function FilterBar({ facets }: { facets: { label: string; options: string[]; value?: string; onChange?: (value: string) => void }[] }) {
  const wired = facets.some((f) => f.onChange);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e6e8f0] bg-[#fafbfc] p-4">
      {facets.map((f) => (
        <label key={f.label} className="flex items-center gap-2 text-[13px] font-medium text-[#5b5f74]">
          {f.label}
          <select
            className="rounded-full border border-[#dcdee8] bg-white px-3 py-1.5 text-[13px] text-[#3a3f55]"
            {...(f.onChange
              ? { value: f.value ?? "", onChange: (e: ChangeEvent<HTMLSelectElement>) => f.onChange!(e.target.value) }
              : { defaultValue: "" })}
          >
            <option value="">All</option>
            {f.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
      ))}
      {!wired && <span className="text-[12px] text-[#8b8fa3]">Filters are a visual mock — not wired yet.</span>}
    </div>
  );
}

export function FormMock({ title, fields, note }: { title: string; fields: string[]; note?: string }) {
  return (
    <div className="rounded-xl border border-[#e6e8f0] bg-white p-6">
      <h3 className="text-lg font-bold text-[#171a2b]">{title}</h3>
      <div className="mt-4 space-y-3">
        {fields.map((f) => (
          <div key={f}>
            <label className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-[#8b8fa3]">{f}</label>
            <div className="h-10 rounded-lg border border-[#dcdee8] bg-[#fafbfc]" />
          </div>
        ))}
      </div>
      {note && <p className="mt-3 text-[12px] text-[#8b8fa3]">{note}</p>}
      <button type="button" disabled className="mt-4 cursor-not-allowed rounded-full bg-[#243D9A]/40 px-5 py-2.5 text-sm font-semibold text-white">
        Submit (not wired)
      </button>
    </div>
  );
}
