import Link from "next/link";
import { org } from "../content";

export default function Footer() {
  return (
    <footer className="bg-[#12142b]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <span className="text-lg font-bold text-white">{org.short}</span>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">{org.summary}</p>
          </div>
          <div className="text-sm">
            <p className="mb-3 font-semibold text-white/80">Explore</p>
            <ul className="space-y-2 text-white/55">
              <li><Link href="/prototypes/about/v2" className="hover:text-[#1B8A6B]">About PRI</Link></li>
              <li><Link href="#" className="hover:text-[#1B8A6B]">Data Repository</Link></li>
              <li><Link href="#" className="hover:text-[#1B8A6B]">Publications</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="mb-3 font-semibold text-white/80">Contact</p>
            <ul className="space-y-1 text-white/55">
              {org.address.map((line) => (
                <li key={line}>{line}</li>
              ))}
              <li className="pt-2">{org.email}</li>
              <li>{org.phone}</li>
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-xs text-white/35">
          &copy; {new Date().getFullYear()} {org.name}. Prototype build.
        </p>
      </div>
    </footer>
  );
}
