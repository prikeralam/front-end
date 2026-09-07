import Link from "next/link";
import { org, nav } from "../../_content/org";

export default function Footer() {
  return (
    <footer className="bg-[#12142b]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <span className="text-lg font-bold text-white">{org.short}</span>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">{org.summary}</p>
          </div>
          {nav.slice(0, 3).map((n) => (
            <div key={n.label} className="text-sm">
              <p className="mb-3 font-semibold text-white/80">{n.label}</p>
              <ul className="space-y-2 text-white/55">
                {(n.items.length ? n.items : [{ label: n.label, href: n.href! }]).map((item) => (
                  <li key={item.href}>
                    <Link href={`/v2${item.href}`} className="hover:text-[#E4633F]">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 text-sm text-white/55 sm:grid-cols-2">
          <div>{org.address.map((line) => <p key={line}>{line}</p>)}</div>
          <div>
            <p>{org.email}</p>
            <p>{org.phone}</p>
          </div>
        </div>
        <p className="mt-8 text-xs text-white/35">&copy; {new Date().getFullYear()} {org.name}. Prototype build.</p>
      </div>
    </footer>
  );
}
