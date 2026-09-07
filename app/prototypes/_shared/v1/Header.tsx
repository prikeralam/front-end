import Image from "next/image";
import Link from "next/link";

const nav = [
  { label: "About", href: "/prototypes/about/v1" },
  { label: "Research", href: "#" },
  { label: "Data Hub", href: "#" },
  { label: "Get Involved", href: "#" },
];

export default function Header({ active }: { active: "home" | "about" }) {
  return (
    <header className="border-b border-[#2e3891]/15 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/prototypes/home/v1" className="flex items-center gap-3">
          <Image src="/logo.png" alt="PRI mark" width={34} height={34} className="rounded-sm" />
          <span className="font-[family-name:var(--font-heading)] text-xl tracking-tight text-[#1c2456]">
            Policy &amp; Research Initiative
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-[13px] uppercase tracking-[0.12em] text-[#3a3f55] transition-colors hover:text-[#2e3891] ${
                (active === "about" && item.label === "About") ? "text-[#2e3891]" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
          <span className="flex items-center gap-1 border-l border-[#2e3891]/20 pl-6 text-[12px] tracking-wide text-[#6b7094]">
            <button className="hover:text-[#2e3891]">EN</button>
            <span>/</span>
            <button className="hover:text-[#2e3891]">ML</button>
          </span>
        </nav>
      </div>
    </header>
  );
}
