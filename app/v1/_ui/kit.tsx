import Link from "next/link";
import type { ReactNode, ChangeEvent } from "react";
import type { ContentStatus, Person, PRIDocument } from "../../_lib/types";
import MediaSlot from "./MediaSlot";

export function StatusTag({ status }: { status: ContentStatus }) {
  if (status === "real") return null;
  return (
    <span className="shrink-0 border border-[#253D9A]/25 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#253D9A]">
      Placeholder
    </span>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block bg-[#253D9A]/8 px-2 py-0.5 text-[11px] uppercase tracking-wide text-[#253D9A]">
      {children}
    </span>
  );
}

export function PageHeader({ kicker, title, intro }: { kicker: string; title: string; intro?: string }) {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-12 pt-16">
      <p className="text-[13px] uppercase tracking-[0.2em] text-[#253D9A]">{kicker}</p>
      <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-heading)] text-4xl leading-tight text-[#171a2b] sm:text-5xl">
        {title}
      </h1>
      {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#4b4f66]">{intro}</p>}
    </section>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="font-[family-name:var(--font-heading)] text-2xl italic text-[#171a2b]">{children}</h2>;
}

export function Card({ children, href }: { children: ReactNode; href?: string }) {
  const cls = "block border border-[#253D9A]/12 bg-white p-6 transition-colors hover:border-[#253D9A]/40";
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
    <div className="border-t-2 border-[#253D9A] pt-3">
      <p className="font-[family-name:var(--font-heading)] text-3xl text-[#171a2b]">{value}</p>
      <p className="mt-1 text-sm text-[#5b5f74]">{label}</p>
    </div>
  );
}

export function Quote({ quote, name, role, status }: { quote: string; name: string; role: string; status: ContentStatus }) {
  return (
    <figure className="border-l-2 border-[#C9972C] pl-5">
      <blockquote className="font-[family-name:var(--font-heading)] text-[17px] italic leading-snug text-white/95">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-2 text-sm text-white/60">
        {name} &middot; {role}
        {status === "placeholder" && (
          <span className="border border-white/25 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white/70">
            Placeholder
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-[#253D9A]/25 bg-[#f7f7f3] px-6 py-10 text-center text-sm text-[#8b8fa3]">
      {message}
    </div>
  );
}

export function PersonCard({ person }: { person: Person }) {
  return (
    <div className="border border-[#253D9A]/12 bg-white p-3">
      {person.photo && <MediaSlot need={person.photo} className="mb-3" />}
      <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#171a2b]">
        {person.name}
        <StatusTag status={person.status} />
      </p>
      <p className="mt-0.5 text-[12px] text-[#5b5f74]">{person.role}</p>
      {person.bio && <p className="mt-2 text-[11px] leading-relaxed text-[#5b5f74]">{person.bio}</p>}
    </div>
  );
}

export function DocumentRow({ doc }: { doc: PRIDocument }) {
  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <div>
        <span className="flex items-center gap-2 text-[15px] text-[#22263a]">
          {doc.title}
          <StatusTag status={doc.status} />
        </span>
        {doc.year && <span className="text-[13px] text-[#8b8fa3]">{doc.kind} &middot; {doc.year}</span>}
      </div>
      {doc.href ? (
        <a href={doc.href} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[12px] uppercase tracking-wide text-[#C9972C] hover:underline">
          Download
        </a>
      ) : (
        <span className="shrink-0 text-[12px] uppercase tracking-wide text-[#C9972C]">{doc.kind === "Issue" ? "Read" : doc.kind}</span>
      )}
    </li>
  );
}

export function FilterBar({ facets }: { facets: { label: string; options: string[]; value?: string; onChange?: (value: string) => void }[] }) {
  const wired = facets.some((f) => f.onChange);
  return (
    <div className="flex flex-wrap items-center gap-4 border-y border-[#253D9A]/10 py-4">
      {facets.map((f) => (
        <label key={f.label} className="flex items-center gap-2 text-[13px] text-[#5b5f74]">
          {f.label}
          <select
            className="border border-[#253D9A]/20 bg-white px-2 py-1.5 text-[13px] text-[#3a3f55]"
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
    <div className="border border-[#253D9A]/12 bg-white p-6">
      <h3 className="font-[family-name:var(--font-heading)] text-lg text-[#171a2b]">{title}</h3>
      <div className="mt-4 space-y-3">
        {fields.map((f) => (
          <div key={f}>
            <label className="mb-1 block text-[12px] uppercase tracking-wide text-[#8b8fa3]">{f}</label>
            <div className="h-10 border border-[#253D9A]/20 bg-[#f7f7f3]" />
          </div>
        ))}
      </div>
      {note && <p className="mt-3 text-[12px] text-[#8b8fa3]">{note}</p>}
      <button type="button" disabled className="mt-4 cursor-not-allowed bg-[#253D9A]/40 px-5 py-2.5 text-sm font-medium text-white">
        Submit (not wired)
      </button>
    </div>
  );
}
