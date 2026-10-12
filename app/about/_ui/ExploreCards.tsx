import Link from "next/link";

const CARDS = [
  { href: "/people/team", title: "Our team", text: "The researchers and staff behind PRI's work." },
  { href: "/about/annual-reports", title: "Annual reports", text: "A yearly account of PRI's work." },
  { href: "/partners", title: "Partners", text: "The institutions and researchers we work with." },
  { href: "/careers", title: "Work with us", text: "Open roles, fellowships and internships." },
];

/** Where to go next from the about page. */
export default function ExploreCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => (
        <Link key={card.href} href={card.href} className="group flex flex-col rounded-lg border border-[#e3e6f0] bg-white p-6 transition-[border-color,box-shadow] hover:border-[#253D9A]/40 hover:shadow-[0_2px_16px_rgba(23,26,43,0.08)]">
          <span className="font-[family-name:var(--font-heading)] text-[18px] text-[#171a2b] group-hover:text-[#253D9A]">{card.title}</span>
          <span className="mt-2 flex-1 text-[14px] leading-relaxed text-[#5b5f74]">{card.text}</span>
          <span aria-hidden="true" className="mt-5 text-[#253D9A] transition-transform group-hover:translate-x-1">&rarr;</span>
        </Link>
      ))}
    </div>
  );
}
