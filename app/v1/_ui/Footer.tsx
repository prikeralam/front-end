import Link from "next/link";
import { org, nav } from "../../_content/org";

export default function Footer() {
  return (
    <footer className="border-t border-[#2e3891]/15 bg-[#f7f7f3]">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-[family-name:var(--font-heading)] text-lg italic text-[#1c2456]">{org.name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#5b5f74]">{org.tagline}</p>
          </div>
          {nav.slice(0, 3).map((n) => (
            <div key={n.label} className="text-sm text-[#5b5f74]">
              <p className="mb-3 text-[12px] uppercase tracking-[0.12em] text-[#1c2456]">{n.label}</p>
              <ul className="space-y-2">
                {(n.items.length ? n.items : [{ label: n.label, href: n.href! }]).map((item) => (
                  <li key={item.href}>
                    <Link href={`/v1${item.href}`} className="hover:text-[#2e3891]">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 border-t border-[#2e3891]/10 pt-6 text-sm text-[#5b5f74] md:grid-cols-2">
          <div>
            {org.address.map((line) => <p key={line}>{line}</p>)}
          </div>
          <div>
            <p>{org.email}</p>
            <p>{org.phone}</p>
          </div>
        </div>
        <p className="mt-8 text-xs text-[#8b8fa3]">
          &copy; {new Date().getFullYear()} {org.name}. Prototype build.
        </p>
      </div>
    </footer>
  );
}
