import Image from "next/image";
import Link from "next/link";

const nav = [
  { label: "About", href: "/prototypes/about/v2" },
  { label: "Data Hub", href: "#" },
  { label: "Publications", href: "#" },
  { label: "Get Involved", href: "#" },
];

export default function Header({ active }: { active: "home" | "about" }) {
  return (
    <header className="sticky top-0 z-10 bg-white">
      <div className="h-1 w-full bg-[#2e3891]" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/prototypes/home/v2" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="PRI mark" width={30} height={30} className="rounded" />
          <span className="text-[17px] font-bold tracking-tight text-[#171a2b]">PRI</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active === "about" && item.label === "About"
                  ? "bg-[#2e3891] text-white"
                  : "text-[#3a3f55] hover:bg-[#2e3891]/8"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden items-center rounded-full border border-[#dcdee8] px-1 py-1 text-xs font-semibold text-[#5b5f74] sm:flex">
            <button className="rounded-full px-2 py-0.5 bg-[#2e3891]/10 text-[#2e3891]">EN</button>
            <button className="rounded-full px-2 py-0.5">ML</button>
          </div>
          <Link href="#" className="rounded-full bg-[#1B8A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#166f56]">
            Subscribe
          </Link>
        </div>
      </div>
    </header>
  );
}
