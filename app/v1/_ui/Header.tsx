"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { nav, org } from "../../_content/org";

const base = "/v1";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-20 border-b border-[#253D9A]/15 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <Link href={base} className="flex shrink-0 items-center gap-3">
          <Image src="/logo.png" alt="PRI mark" width={34} height={34} />
          <span className="font-[family-name:var(--font-heading)] text-lg leading-tight tracking-tight text-[#1c2456] sm:text-xl">
            Policy &amp; Research Initiative
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((n) =>
            n.items.length === 0 ? (
              <Link
                key={n.label}
                href={`${base}${n.href}`}
                className="text-[13px] uppercase tracking-[0.12em] text-[#3a3f55] transition-colors hover:text-[#253D9A]"
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
                  className="text-[13px] uppercase tracking-[0.12em] text-[#3a3f55] transition-colors hover:text-[#253D9A]"
                >
                  {n.label}
                </button>
                {group === n.label && (
                  <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-4">
                    <div className="border border-[#253D9A]/15 bg-white py-2 shadow-[0_8px_28px_rgba(28,36,86,0.10)]">
                      {n.items.map((item) => (
                        <Link
                          key={item.href}
                          href={`${base}${item.href}`}
                          onClick={() => setGroup(null)}
                          className="block px-5 py-2.5 text-[14px] text-[#3a3f55] transition-colors hover:bg-[#f7f7f3] hover:text-[#253D9A]"
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
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-[5px] lg:hidden"
        >
          <span className={`block h-px w-6 bg-[#1c2456] transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`} />
          <span className={`block h-px w-6 bg-[#1c2456] transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-6 bg-[#1c2456] transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="border-t border-[#253D9A]/15 bg-white lg:hidden">
          <nav className="mx-auto max-w-6xl px-6 py-6">
            {nav.map((n) => (
              <div key={n.label} className="border-b border-[#253D9A]/10 py-4 last:border-0">
                {n.items.length === 0 ? (
                  <Link
                    href={`${base}${n.href}`}
                    onClick={() => setOpen(false)}
                    className="font-[family-name:var(--font-heading)] text-lg text-[#1c2456]"
                  >
                    {n.label}
                  </Link>
                ) : (
                  <>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#8b8fa3]">{n.label}</p>
                    <div className="mt-3 space-y-2.5">
                      {n.items.map((item) => (
                        <Link
                          key={item.href}
                          href={`${base}${item.href}`}
                          onClick={() => setOpen(false)}
                          className="block font-[family-name:var(--font-heading)] text-lg text-[#1c2456]"
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
