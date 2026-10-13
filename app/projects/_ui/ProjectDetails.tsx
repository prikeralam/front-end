import { parseProjectDetails, type DetailSection } from "../../_lib/projectDetails";
import { Blocks } from "../../_ui/RichText";

/** The plus that turns into a minus while its item is open. */
function Toggle() {
  return (
    <span aria-hidden="true" className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#dcdee8] bg-white transition-colors group-hover:border-[#253D9A]`}>
      <span className="absolute h-px w-2.5 bg-[#253D9A]" />
      <span className="absolute h-2.5 w-px bg-[#253D9A] transition-transform duration-300 group-open:rotate-90 group-open:scale-0" />
    </span>
  );
}

function Section({ section, index }: { section: DetailSection; index: number }) {
  const topics = section.subsections.map((s) => s.title);
  return (
    <details className="group border-t border-[#e3e6f0] last:border-b">
      <summary className="flex cursor-pointer list-none items-start gap-4 py-6 outline-none focus-visible:bg-[#253D9A]/[0.04] sm:gap-6 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="w-7 shrink-0 pt-1.5 font-[family-name:var(--font-mono)] text-[13px] font-semibold text-[#253D9A]/60 transition-colors group-open:text-[#253D9A]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-[family-name:var(--font-heading)] text-[19px] leading-snug text-[#171a2b] transition-colors group-hover:text-[#253D9A] sm:text-[21px]">
            {section.title}
          </span>
          {/* While closed, the sub-headings show what is inside. */}
          {topics.length > 0 && (
            <span className="mt-2 block text-[13.5px] leading-relaxed text-[#7d8197] group-open:hidden">
              {topics.join("  ·  ")}
            </span>
          )}
        </span>
        <Toggle />
      </summary>

      <div className="pri-motion animate-[pri-unfold_.35s_cubic-bezier(.22,1,.36,1)] pb-8 pl-11 sm:pl-[3.25rem]">
        {section.blocks.length > 0 && <Blocks blocks={section.blocks} />}
        {section.subsections.length > 0 && (
          <div className={`border-l-2 border-[#253D9A]/15 ${section.blocks.length ? "mt-6" : ""}`}>
            {section.subsections.map((sub, i) => (
              <details key={i} className="group/sub [&:not(:first-child)]:border-t [&:not(:first-child)]:border-[#eceef5]">
                <summary className="group flex cursor-pointer list-none items-center gap-4 py-4 pl-5 outline-none focus-visible:bg-[#253D9A]/[0.04] [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1 text-[16px] font-semibold leading-snug text-[#2a2e45] transition-colors group-hover:text-[#253D9A] group-open/sub:text-[#253D9A]">
                    {sub.title}
                  </span>
                  <SubToggle />
                </summary>
                <div className="pri-motion animate-[pri-unfold_.35s_cubic-bezier(.22,1,.36,1)] pb-5 pl-5">
                  <Blocks blocks={sub.blocks} />
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

/** The sub-section's plus, keyed to its own `details` (the section's `group` is already open). */
function SubToggle() {
  return (
    <span aria-hidden="true" className="relative grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#dcdee8] bg-white transition-colors group-hover:border-[#253D9A]">
      <span className="absolute h-px w-2.5 bg-[#253D9A]" />
      <span className="absolute h-2.5 w-px bg-[#253D9A] transition-transform duration-300 group-open/sub:rotate-90 group-open/sub:scale-0" />
    </span>
  );
}

/**
 * A project's write-up: the overview always shown, then each section as an FAQ-style item that opens on click, with
 * its sub-sections as items of their own. Native `details`, so it works without JavaScript and in-page search finds
 * closed text in browsers that support it.
 */
export default function ProjectDetails({ text }: { text: string }) {
  const { overview, sections } = parseProjectDetails(text);
  return (
    <>
      {overview.length > 0 && <Blocks blocks={overview} size="lead" />}
      {sections.length > 0 && (
        <section className={overview.length ? "mt-14" : ""} aria-label="Project details">
          <h2 className="mb-2 flex items-center gap-3 font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#253D9A]">
            In detail
            <span aria-hidden="true" className="h-px flex-1 bg-[#e3e6f0]" />
            <span className="font-normal normal-case tracking-normal text-[#8b8fa3]">Select a heading to read more</span>
          </h2>
          {sections.map((section, i) => <Section key={i} section={section} index={i} />)}
        </section>
      )}
    </>
  );
}
