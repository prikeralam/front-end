import Image from "next/image";
import Link from "next/link";
import { org } from "../content";

const nav = [
  { label: "About", href: "/prototypes/about/v3" },
  { label: "Research", href: "#" },
  { label: "Data Repository", href: "#" },
  { label: "Publications", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Header({ active }: { active: "home" | "about" }) {
  return (
    <header>
      {/* Utility bar */}
      <div className="bg-[#2e3891] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-[12px]">
          <span className="tracking-wide text-white/75">{org.tagline}</span>
          <div className="flex items-center gap-4">
            <span className="hidden text-white/75 sm:inline">{org.email}</span>
            <span className="flex items-center gap-1.5 border-l border-white/25 pl-4">
              <button className="font-semibold underline underline-offset-2">EN</button>
              <span className="text-white/40">|</span>
              <button className="text-white/75 hover:text-white">ML</button>
            </span>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="border-b-[3px] border-[#2e3891] bg-white">
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-6 py-5">
          <Link href="/prototypes/home/v3" className="flex items-center gap-4">
            <Image src="/logo.png" alt="PRI emblem" width={52} height={52} />
            <span>
              <span className="block font-[family-name:var(--font-heading)] text-[26px] font-semibold leading-none tracking-tight text-[#1c2456]">
                {org.name}
              </span>
              <span className="mt-1.5 block text-[11px] uppercase tracking-[0.22em] text-[#7b7f96]">
                Research · Policy · Advocacy
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 pb-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`border-b-2 pb-1 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                  active === "about" && item.label === "About"
                    ? "border-[#A64B2A] text-[#2e3891]"
                    : "border-transparent text-[#4b4f66] hover:border-[#A64B2A] hover:text-[#2e3891]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
