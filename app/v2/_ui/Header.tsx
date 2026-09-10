"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, org } from "../../_content/org";
import { getSession, clearSession, type MockSession } from "../../_lib/mockAuth";

const base = "/v2";

function PortalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, [pathname]);

  function handleSignOut() {
    clearSession();
    router.push(base);
  }

  return (
    <header className="sticky top-0 z-20 bg-[#12142b] text-white">
      <div className="h-1 w-full bg-[#E4633F]" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href={`${base}/data`} className="flex shrink-0 items-center gap-2.5">
          <Image src="/logo.png" alt="PRI mark" width={32} height={32} className="rounded" />
          <span className="text-[16px] font-bold tracking-tight text-white">PRI Data Portal</span>
        </Link>
        {session && (
          <div className="flex items-center gap-4">
            <span className="hidden text-[13px] text-white/60 sm:inline">{session.name} &middot; {session.role}</span>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-white/25 px-4 py-1.5 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<string | null>(null);

  const isPortal = pathname === `${base}/account` || pathname.startsWith(`${base}/dashboard`);
  if (isPortal) return <PortalHeader />;

  return (
    <header className="sticky top-0 z-20 bg-white">
      <div className="h-1 w-full bg-[#253D9A]" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href={base} className="flex shrink-0 items-center gap-2.5">
          <Image src="/logo.png" alt="PRI mark" width={40} height={40} className="rounded" />
          <span className="text-[20px] font-bold tracking-tight text-[#171a2b]">{org.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) =>
            n.items.length === 0 ? (
              <Link
                key={n.label}
                href={`${base}${n.href}`}
                className="rounded-full px-4 py-2 text-[15px] font-semibold text-[#3a3f55] transition-colors hover:bg-[#253D9A]/8"
              >
                {n.label}
              </Link>
            ) : (
              <div key={n.label} className="relative" onMouseEnter={() => setGroup(n.label)} onMouseLeave={() => setGroup(null)}>
                <button
                  onClick={() => setGroup(group === n.label ? null : n.label)}
                  aria-expanded={group === n.label}
                  className={`rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
                    group === n.label ? "bg-[#253D9A] text-white" : "text-[#3a3f55] hover:bg-[#253D9A]/8"
                  }`}
                >
                  {n.label}
                </button>
                {group === n.label && (
                  <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3">
                    <div className="rounded-xl border border-[#e6e8f0] bg-white py-2 shadow-[0_8px_28px_rgba(15,107,92,0.14)]">
                      {n.items.map((item) => (
                        <Link
                          key={item.href}
                          href={`${base}${item.href}`}
                          onClick={() => setGroup(null)}
                          className="block px-5 py-2.5 text-[14px] font-medium text-[#3a3f55] transition-colors hover:bg-[#f0f1f5] hover:text-[#253D9A]"
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

        <Link href={`${base}/donate`} className="hidden shrink-0 rounded-full bg-[#E4633F] px-5 py-2 text-[15px] font-semibold text-white hover:bg-[#C94F2E] lg:inline-block">
          Donate
        </Link>

        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-[5px] lg:hidden"
        >
          <span className={`block h-[2px] w-6 rounded-full bg-[#171a2b] transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`} />
          <span className={`block h-[2px] w-6 rounded-full bg-[#171a2b] transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-[2px] w-6 rounded-full bg-[#171a2b] transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="border-t border-[#e6e8f0] bg-white lg:hidden">
          <nav className="mx-auto max-w-6xl px-6 py-6">
            {nav.map((n) => (
              <div key={n.label} className="border-b border-[#e6e8f0] py-4 last:border-0">
                {n.items.length === 0 ? (
                  <Link href={`${base}${n.href}`} onClick={() => setOpen(false)} className="text-lg font-bold text-[#171a2b]">
                    {n.label}
                  </Link>
                ) : (
                  <>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b8fa3]">{n.label}</p>
                    <div className="mt-3 space-y-3">
                      {n.items.map((item) => (
                        <Link key={item.href} href={`${base}${item.href}`} onClick={() => setOpen(false)} className="block text-lg font-bold text-[#171a2b]">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
            <Link
              href={`${base}/donate`}
              onClick={() => setOpen(false)}
              className="mt-4 inline-block rounded-full bg-[#E4633F] px-4 py-2 text-sm font-semibold text-white"
            >
              Donate
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
