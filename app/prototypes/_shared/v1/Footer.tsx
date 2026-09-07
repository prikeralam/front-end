import Link from "next/link";
import { org } from "../content";

export default function Footer() {
  return (
    <footer className="border-t border-[#2e3891]/15 bg-[#f7f7f3]">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-[family-name:var(--font-heading)] text-lg italic text-[#1c2456]">{org.name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#5b5f74]">{org.tagline}</p>
          </div>
          <div className="text-sm text-[#5b5f74]">
            <p className="mb-3 text-[12px] uppercase tracking-[0.12em] text-[#1c2456]">Explore</p>
            <ul className="space-y-2">
              <li><Link href="/prototypes/about/v1" className="hover:text-[#2e3891]">About PRI</Link></li>
              <li><Link href="#" className="hover:text-[#2e3891]">Data Repository</Link></li>
              <li><Link href="#" className="hover:text-[#2e3891]">Publications</Link></li>
            </ul>
          </div>
          <div className="text-sm text-[#5b5f74]">
            <p className="mb-3 text-[12px] uppercase tracking-[0.12em] text-[#1c2456]">Contact</p>
            {org.address.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="mt-2">{org.email}</p>
            <p>{org.phone}</p>
          </div>
        </div>
        <p className="mt-12 border-t border-[#2e3891]/10 pt-6 text-xs text-[#8b8fa3]">
          &copy; {new Date().getFullYear()} {org.name}. Prototype build.
        </p>
      </div>
    </footer>
  );
}
