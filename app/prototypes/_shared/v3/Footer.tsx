import Link from "next/link";
import { org } from "../content";

export default function Footer() {
  return (
    <footer className="border-t-[3px] border-[#2e3891] bg-[#f4f4f7]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#1c2456]">{org.name}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#5b5f74]">{org.summary}</p>
          </div>
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1c2456]">Explore</p>
            <ul className="space-y-2 text-sm text-[#5b5f74]">
              <li><Link href="/prototypes/about/v3" className="hover:text-[#2e3891] hover:underline">About PRI</Link></li>
              <li><Link href="#" className="hover:text-[#2e3891] hover:underline">Data Repository</Link></li>
              <li><Link href="#" className="hover:text-[#2e3891] hover:underline">Publications</Link></li>
              <li><Link href="#" className="hover:text-[#2e3891] hover:underline">Fellowships</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1c2456]">Contact</p>
            <address className="space-y-1 text-sm not-italic text-[#5b5f74]">
              {org.address.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p className="pt-2">{org.email}</p>
              <p>{org.phone}</p>
            </address>
          </div>
        </div>
        <p className="mt-12 border-t border-[#2e3891]/15 pt-6 text-xs text-[#8b8fa3]">
          &copy; {new Date().getFullYear()} {org.name}. All rights reserved. Prototype build.
        </p>
      </div>
    </footer>
  );
}
