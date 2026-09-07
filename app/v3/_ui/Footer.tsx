import Link from "next/link";
import { org, nav } from "../../_content/org";

export default function Footer() {
  return (
    <footer className="border-t-[3px] border-[#6B2737] bg-[#F1E9D8]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#4A1B26]">{org.name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#5b5f74]">{org.summary}</p>
          </div>
          {nav.slice(0, 3).map((n) => (
            <div key={n.label}>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4A1B26]">{n.label}</p>
              <ul className="space-y-2 text-sm text-[#5b5f74]">
                {(n.items.length ? n.items : [{ label: n.label, href: n.href! }]).map((item) => (
                  <li key={item.href}>
                    <Link href={`/v3${item.href}`} className="hover:text-[#6B2737] hover:underline">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 border-t border-[#6B2737]/15 pt-6 text-sm text-[#5b5f74] md:grid-cols-2">
          <address className="not-italic">
            {org.address.map((line) => <p key={line}>{line}</p>)}
          </address>
          <div>
            <p>{org.email}</p>
            <p>{org.phone}</p>
          </div>
        </div>
        <p className="mt-8 text-xs text-[#8b8fa3]">
          &copy; {new Date().getFullYear()} {org.name}. All rights reserved. Prototype build.
        </p>
      </div>
    </footer>
  );
}
