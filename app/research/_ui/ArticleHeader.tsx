import Link from "next/link";
import { formatPublicationDate } from "../../_lib/api/publicationAdapter";
import type { Person, Publication } from "../../_lib/types";
import { StatusTag } from "../../_ui/kit";
import Byline from "./Byline";

/**
 * A publication's header, after Data for India's articles: a dark PRI-blue band holding the breadcrumb, format, title,
 * abstract (as the standfirst) and byline, set in the same centred column as the text below it.
 */
export default function ArticleHeader({ pub, people, column }: { pub: Publication; people: Person[]; column: string }) {
  return (
    <header className="relative overflow-hidden bg-[#16245c] bg-[radial-gradient(900px_420px_at_85%_-20%,rgba(76,104,214,0.55),transparent_65%),radial-gradient(600px_300px_at_-10%_120%,rgba(37,61,154,0.6),transparent_60%)] after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1.4px)] after:bg-[length:24px_24px] after:[mask-image:linear-gradient(100deg,transparent_45%,#000_95%)]">
      <div className={`relative z-10 mx-auto ${column} px-6 pb-12 pt-12 sm:pb-14 sm:pt-16`}>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#aebbf0]">
          <Link href="/research" className="hover:text-white">Research</Link>
          {pub.theme && (
            <>
              <span aria-hidden="true">/</span>
              <span>{pub.theme}</span>
            </>
          )}
        </nav>
        <p className="mt-6 inline-flex rounded border border-white/25 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">
          {pub.format}
        </p>
        <h1 className="mt-4 text-balance text-[2rem] leading-[1.1] tracking-tight text-white sm:text-5xl">{pub.title}</h1>
        {pub.abstract && <p className="mt-5 text-pretty text-[17px] leading-relaxed text-white/75 sm:text-lg">{pub.abstract}</p>}
        <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-white/65">
          <Byline people={people} linked dark size={30} />
          {/* On phones a long byline wraps, so the date takes its own line rather than trailing a lone dot. */}
          {people.length > 0 && <span aria-hidden="true" className="hidden sm:inline">&middot;</span>}
          <span className={people.length > 0 ? "w-full sm:w-auto" : ""}>{formatPublicationDate(pub.date)}</span>
          <StatusTag status={pub.status} />
        </p>
      </div>
    </header>
  );
}
