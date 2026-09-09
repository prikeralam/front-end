"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { nav, org } from "../../_content/org";

const base = "/v3";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<string | null>(null);

  return (
    <header>
      {/* Utility bar */}
      <div className="bg-[#121e4d] text-white">
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
      <div className="sticky top-0 z-20 border-b-[3px] border-[#243D9A] bg-white">
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-6 py-5">
          <Link href={base} className="flex items-center gap-4">
            <Image src="/logo.png" alt="PRI emblem" width={48} height={48} />
            <span>
              <span className="block font-[family-name:var(--font-heading)] text-[22px] font-semibold leading-none tracking-tight text-[#4A1B26] sm:text-[26px]">
                {org.name}
              </span>
              <span className="mt-1.5 hidden text-[11px] uppercase tracking-[0.22em] text-[#7b7f96] sm:block">
                Research &middot; Policy &middot; Advocacy
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 pb-1 lg:flex">
            {nav.map((n) =>
              n.items.length === 0 ? (
                <Link
                  key={n.label}
                  href={`${base}${n.href}`}
                  className="border-b-2 border-transparent pb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#4b4f66] transition-colors hover:border-[#B8862F] hover:text-[#243D9A]"
                >
                  {n.label}
                </Link>
              ) : (
                <div
                  key={n.label}
                  className="relative"
                  onMouseEnter={() => setGroup(n.label)}
                  onMouseLeave={() => setGroup(null)}
                >
                  <button
                    onClick={() => setGroup(group === n.label ? null : n.label)}
                    aria-expanded={group === n.label}
                    className="border-b-2 border-transparent pb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#4b4f66] transition-colors hover:border-[#B8862F] hover:text-[#243D9A]"
                  >
                    {n.label}
                  </button>
                  {group === n.label && (
                    <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3">
                      <div className="border border-[#243D9A]/20 bg-white py-1 shadow-[0_10px_30px_rgba(28,36,86,0.12)]">
                        {n.items.map((item) => (
                          <Link
                            key={item.href}
                            href={`${base}${item.href}`}
                            onClick={() => setGroup(null)}
                            className="block px-5 py-2.5 text-[13px] font-medium text-[#3a3f55] transition-colors hover:bg-[#F1E9D8] hover:text-[#243D9A]"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </nav>

          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="mb-1 flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <span className={`block h-[2px] w-6 bg-[#4A1B26] transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block h-[2px] w-6 bg-[#4A1B26] transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-[2px] w-6 bg-[#4A1B26] transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-b border-[#243D9A]/20 bg-white lg:hidden">
          <nav className="mx-auto max-w-6xl px-6 py-6">
            {nav.map((n) => (
              <div key={n.label} className="border-b border-[#243D9A]/10 py-4 last:border-0">
                {n.items.length === 0 ? (
                  <Link
                    href={`${base}${n.href}`}
                    onClick={() => setOpen(false)}
                    className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[#4A1B26]"
                  >
                    {n.label}
                  </Link>
                ) : (
                  <>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8fa3]">{n.label}</p>
                    <div className="mt-3 space-y-2.5">
                      {n.items.map((item) => (
                        <Link
                          key={item.href}
                          href={`${base}${item.href}`}
                          onClick={() => setOpen(false)}
                          className="block font-[family-name:var(--font-heading)] text-lg font-semibold text-[#4A1B26]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
            <p className="mt-6 text-sm text-[#5b5f74]">{org.email}</p>
          </nav>
        </div>
      )}
    </header>
  );
}
