import Image from "next/image";
import Link from "next/link";

const variations = [
  {
    id: "v1",
    name: "Editorial",
    fonts: "Newsreader (serif) + Inter",
    primary: "#2e3891",
    primaryName: "Deep indigo",
    accent: "#C9972C",
    accentName: "Amber",
    notes: "Documentary/editorial feel, closest to SPRF. Serif headlines, generous whitespace, rule-line dividers, indigo testimonial band. Homepage includes a placeholder project-banner strip.",
  },
  {
    id: "v2",
    name: "Data-Driven",
    fonts: "Public Sans + IBM Plex Mono",
    primary: "#0F6B5C",
    primaryName: "Deep teal",
    accent: "#E4633F",
    accentName: "Coral",
    notes: "Closest to Data for India. All-sans, card grids, mono numerals for stats, rounded corners, topic chips. Homepage includes a placeholder project-banner strip.",
  },
  {
    id: "v3",
    name: "Institutional",
    fonts: "Source Serif 4 + Source Sans 3",
    primary: "#6B2737",
    primaryName: "Oxblood maroon",
    accent: "#B8862F",
    accentName: "Muted gold",
    notes: "Formal policy-institute register on a warm ivory ground. Utility bar + masthead, hard rules, tabular governance/legal data, section index on About.",
  },
];

export default function VariantChooser() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#22263a]">
      <header className="border-b border-[#2e3891]/15 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-6 py-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="PRI mark" width={36} height={36} />
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-[#1c2456]">PRI Website — Full Site Prototypes</h1>
              <p className="text-sm text-[#5b5f74]">Three complete, navigable front ends · all 12 sections</p>
            </div>
          </div>
          <Link href="/content-audit" className="shrink-0 rounded border border-[#2e3891] px-4 py-2 text-sm font-semibold text-[#2e3891] hover:bg-[#2e3891]/5">
            Content &amp; Media Audit
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="max-w-2xl text-[15px] leading-relaxed text-[#4b4f66]">
          Each variation is a complete, integrated site with its own colour palette, typography, and
          layout language — navigate between all 12 sections using the real header/footer, not isolated
          pages. Content is PRI&rsquo;s real copy where it exists; everything else is placeholder,
          clearly marked in-page and summarised in the audit above.
        </p>

        <div className="mt-10 space-y-5">
          {variations.map((v) => (
            <section key={v.id} className="rounded-lg border border-[#2e3891]/15 bg-white p-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8b8fa3]">Variation {v.id.toUpperCase()}</span>
                <h2 className="text-xl font-semibold tracking-tight text-[#171a2b]">{v.name}</h2>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#5b5f74]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ background: v.primary }} />
                  Primary — {v.primaryName} {v.primary}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ background: v.accent }} />
                  Accent — {v.accentName} {v.accent}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#5b5f74]">{v.notes}</p>
              <p className="mt-2 text-xs text-[#8b8fa3]">Type: {v.fonts}</p>
              <div className="mt-5">
                <Link
                  href={`/${v.id}`}
                  className="inline-block rounded px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ background: v.primary }}
                >
                  Enter site
                </Link>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
