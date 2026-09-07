import Image from "next/image";
import Link from "next/link";

const variations = [
  {
    id: "v1",
    name: "Editorial",
    fonts: "Newsreader (serif) + Inter",
    accent: "#C9972C",
    accentName: "Amber",
    notes:
      "Documentary/editorial feel, closest to SPRF. Serif headlines, generous whitespace, rule-line dividers, deep indigo testimonial band.",
  },
  {
    id: "v2",
    name: "Data-Driven",
    fonts: "Public Sans + IBM Plex Mono",
    accent: "#1B8A6B",
    accentName: "Emerald",
    notes:
      "Closest to Data for India. All-sans, card grids, mono numerals for stats, rounded corners, topic chips.",
  },
  {
    id: "v3",
    name: "Institutional",
    fonts: "Source Serif 4 + Source Sans 3",
    accent: "#A64B2A",
    accentName: "Terracotta",
    notes:
      "Formal policy-institute register. Utility bar + masthead, hard rules, tabular governance/legal data, section index on About.",
  },
];

export default function PrototypeGallery() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#22263a]">
      <header className="border-b border-[#2e3891]/15 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-6">
          <Image src="/logo.png" alt="PRI mark" width={36} height={36} />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-[#1c2456]">PRI Website — Design Prototypes</h1>
            <p className="text-sm text-[#5b5f74]">Homepage &amp; About PRI · three visual directions</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="max-w-2xl text-[15px] leading-relaxed text-[#4b4f66]">
          Three design systems, each applied to both Phase 1 pages. All share the primary{" "}
          <code className="rounded bg-[#2e3891]/8 px-1.5 py-0.5 text-[13px] text-[#2e3891]">#2e3891</code>{" "}
          and white, and differ in typography, accent colour, and layout rhythm. Content is PRI&rsquo;s
          real copy from the previous site; governance, legal status, reports, and testimonials are
          marked placeholders pending real details.
        </p>

        <div className="mt-10 space-y-5">
          {variations.map((v) => (
            <section key={v.id} className="rounded-lg border border-[#2e3891]/15 bg-white p-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8b8fa3]">
                  Variation {v.id.toUpperCase()}
                </span>
                <h2 className="text-xl font-semibold tracking-tight text-[#171a2b]">{v.name}</h2>
                <span className="flex items-center gap-1.5 text-xs text-[#5b5f74]">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ background: v.accent }} />
                  {v.accentName} {v.accent}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#5b5f74]">{v.notes}</p>
              <p className="mt-2 text-xs text-[#8b8fa3]">Type: {v.fonts}</p>
              <div className="mt-5 flex gap-3">
                <Link
                  href={`/prototypes/home/${v.id}`}
                  className="rounded bg-[#2e3891] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#242c72]"
                >
                  View Homepage
                </Link>
                <Link
                  href={`/prototypes/about/${v.id}`}
                  className="rounded border border-[#2e3891] px-5 py-2.5 text-sm font-semibold text-[#2e3891] hover:bg-[#2e3891]/5"
                >
                  View About PRI
                </Link>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
