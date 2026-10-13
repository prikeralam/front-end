import { parseProjectDetails, splitBold, type DetailBlock } from "../_lib/projectDetails";

/**
 * Text staff type in the dashboard, in the small Markdown subset `parseProjectDetails` reads: paragraphs, "- " bullets,
 * **bold**, and "## " / "### " headings. Project pages show the headings as an accordion; everything else uses this.
 */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {splitBold(text).map((part, i) =>
        part.bold ? <strong key={i} className="font-semibold text-[#171a2b]">{part.text}</strong> : <span key={i}>{part.text}</span>,
      )}
    </>
  );
}

export function Blocks({ blocks, size = "base" }: { blocks: DetailBlock[]; size?: "lead" | "base" }) {
  const text = size === "lead" ? "text-[17px] leading-[1.75]" : "text-[15.5px] leading-relaxed";
  return (
    <div className="space-y-4">
      {blocks.map((block, i) =>
        block.kind === "paragraph" ? (
          <p key={i} className={`${text} text-[#4b4f66]`}><Inline text={block.text} /></p>
        ) : (
          <ul key={i} className="space-y-3">
            {block.items.map((item, j) => (
              <li key={j} className={`relative pl-5 ${text} text-[#4b4f66]`}>
                <span aria-hidden="true" className="absolute left-0 top-[0.7em] h-[5px] w-[5px] rounded-[1px] bg-[#253D9A]/60" />
                <Inline text={item} />
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

/** A whole description: its opening text, then each heading with its text, laid out flat. */
export default function RichText({ text }: { text: string }) {
  const { overview, sections } = parseProjectDetails(text);
  return (
    <div className="space-y-8">
      {overview.length > 0 && <Blocks blocks={overview} />}
      {sections.map((section, i) => (
        <section key={i}>
          <h2 className="font-[family-name:var(--font-heading)] text-xl text-[#171a2b]">{section.title}</h2>
          {section.blocks.length > 0 && (
            <div className="mt-4">
              <Blocks blocks={section.blocks} />
            </div>
          )}
          {section.subsections.map((sub, j) => (
            <div key={j} className="mt-6">
              <h3 className="text-[16px] font-semibold text-[#2a2e45]">{sub.title}</h3>
              <div className="mt-3">
                <Blocks blocks={sub.blocks} />
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
