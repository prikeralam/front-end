import Link from "next/link";
import { auditSections, auditTotals, verifiedContent } from "../_content/audit";

export default function ContentAudit() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#22263a]">
      <header className="border-b border-[#2e3891]/15 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Link href="/" className="text-sm text-[#2e3891] hover:underline">&larr; Back to site</Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#1c2456]">Content & Media Gap Audit</h1>
          <p className="mt-1 text-sm text-[#5b5f74]">
            What&apos;s real, what&apos;s placeholder, and what photos/logos/documents PRI still needs to supply — across all 12 sections.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="border border-[#2e3891]/15 bg-white p-5">
            <p className="text-3xl font-semibold text-[#1c2456]">{auditTotals.real}</p>
            <p className="text-sm text-[#5b5f74]">Real content items</p>
          </div>
          <div className="border border-[#2e3891]/15 bg-white p-5">
            <p className="text-3xl font-semibold text-[#C9972C]">{auditTotals.placeholder}</p>
            <p className="text-sm text-[#5b5f74]">Placeholder items needing copy</p>
          </div>
          <div className="border border-[#2e3891]/15 bg-white p-5">
            <p className="text-3xl font-semibold text-[#A64B2A]">{auditTotals.media}</p>
            <p className="text-sm text-[#5b5f74]">Photos / logos / charts / videos needed</p>
          </div>
          <div className="border border-[#2e3891]/15 bg-white p-5">
            <p className="text-3xl font-semibold text-[#1B8A6B]">{auditTotals.documents}</p>
            <p className="text-sm text-[#5b5f74]">Documents / files needed</p>
          </div>
        </div>

        <section className="mb-10 border border-[#1B8A6B]/25 bg-[#1B8A6B]/5 p-6">
          <h2 className="text-lg font-semibold text-[#1c2456]">Verified content already in place</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#3a3f55]">
            {verifiedContent.map((v) => <li key={v}>{v}</li>)}
          </ul>
        </section>

        <div className="space-y-6">
          {auditSections.map((s) => (
            <section key={s.section} className="border border-[#2e3891]/15 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-[#1c2456]">{s.section}</h2>
                <Link href={s.href} className="text-sm text-[#2e3891] hover:underline">Open page &rarr;</Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <span className="text-[#1c2456]">{s.real} real</span>
                <span className="text-[#C9972C]">{s.placeholder} placeholder</span>
                <span className="text-[#A64B2A]">{s.media.length} media needed</span>
                <span className="text-[#1B8A6B]">{s.documents.length} documents needed</span>
              </div>
              {s.media.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#8b8fa3]">Media needed</p>
                  <ul className="mt-2 grid gap-1 text-sm text-[#3a3f55] sm:grid-cols-2">
                    {s.media.map((m, i) => <li key={i}>&middot; {m.label} ({m.ratio})</li>)}
                  </ul>
                </div>
              )}
              {s.documents.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#8b8fa3]">Documents needed</p>
                  <ul className="mt-2 grid gap-1 text-sm text-[#3a3f55] sm:grid-cols-2">
                    {s.documents.map((d, i) => <li key={i}>&middot; {d}</li>)}
                  </ul>
                </div>
              )}
              {s.notes.length > 0 && (
                <div className="mt-4 border-t border-[#2e3891]/10 pt-3">
                  <ul className="space-y-1 text-sm text-[#5b5f74]">
                    {s.notes.map((n, i) => <li key={i}>&mdash; {n}</li>)}
                  </ul>
                </div>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
