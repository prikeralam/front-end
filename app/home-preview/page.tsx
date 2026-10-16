import Link from "next/link";
import { pageMetadata } from "../_lib/seo";
import { PageHeader } from "../_ui/kit";

export const metadata = pageMetadata({ title: "Homepage previews", description: "Three alternatives for the homepage redesign.", path: "/home-preview", noindex: true });

const VARIANTS = [
  { href: "/home-preview/a", name: "A. Institutional", text: "Full-width photographs with the headline on a navy wash; one feed of the latest research and events. After Brookings, Chatham House and Carnegie." },
  { href: "/home-preview/b", name: "B. Think-tank split", text: "Photograph beside a PRI-blue panel with the slides as tabs; an editorial research list with areas of work, projects and dated events. After ORF and the Centre for Policy Research." },
  { href: "/home-preview/c", name: "C. Data-forward", text: "Wide photograph with a caption card; PRI in numbers, the data by theme, research cards and the next event. After Pew Research, IDinsight and Data for India." },
];

/** Index of the homepage redesign's alternatives (issue #205). Removed once one is chosen. */
export default function HomePreviewIndex() {
  return (
    <>
      <PageHeader kicker="Redesign" title="Homepage alternatives" intro="Each uses the live site's content. Pick one to replace the current homepage." compact />
      <ul className="mx-auto grid max-w-6xl gap-4 px-6 py-12 md:grid-cols-3">
        {VARIANTS.map((v) => (
          <li key={v.href}>
            <Link href={v.href} className="grid h-full gap-3 rounded-lg border border-[#e3e6f0] bg-white p-6 hover:border-[#253D9A]">
              <span className="text-[19px] font-semibold text-[#171a2b]">{v.name}</span>
              <span className="text-[14.5px] leading-relaxed text-[#5b6280]">{v.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
