"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { nav, org } from "../_content/org";
import { sessionLabel } from "../_lib/session";
import { useSession } from "../_lib/useSession";
import { checkSession, signOut } from "../_lib/auth/authClient";

function PortalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession() ?? null;

  // The server is the source of truth: asking it refreshes the mirrored session, which `useSession` then follows.
  useEffect(() => {
    void checkSession();
  }, [pathname]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-20 bg-[#12142b] text-white">
      <div className="h-1 w-full bg-[#E4633F]" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/data" className="flex shrink-0 items-center gap-2.5">
          <Image src="/logo.png" alt="PRI mark" width={32} height={32} className="rounded" />
          <span className="text-[16px] font-bold tracking-tight text-white">PRI Data Portal</span>
        </Link>
        {session && (
          <div className="flex items-center gap-4">
            <span className="hidden text-[13px] text-white/60 sm:inline">
              {sessionLabel(session).name && <>{sessionLabel(session).name} &middot; </>}
              {sessionLabel(session).role}
            </span>
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

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** Whether the page has scrolled past the first 40px, which turns the header frosted. */
function useScrolled() {
  return useSyncExternalStore(subscribeToScroll, () => window.scrollY > 40, () => false);
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<string | null>(null);
  const scrolled = useScrolled();
  // Mobile menu: the group holding the current page is open by default; a tap overrides it until the page changes.
  const [mobilePick, setMobilePick] = useState<{ path: string; label: string | null } | null>(null);
  const currentGroup = nav.find((n) => n.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)))?.label ?? null;
  const mobileGroup = mobilePick?.path === pathname ? mobilePick.label : currentGroup;

  const isPortal = pathname === "/account" || pathname.startsWith("/dashboard");
  if (isPortal) return <PortalHeader />;

  return (
    <header
      className={`sticky top-0 z-20 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled || open ? "bg-white/85 shadow-[0_1px_0_#e3e6f0,0_8px_24px_-18px_rgba(23,26,43,0.35)] backdrop-blur-md" : "bg-[#f7f8fc]"
      }`}
    >
      <div className="h-1 w-full bg-[#253D9A]" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4 sm:gap-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Image src="/logo.png" alt="PRI mark" width={40} height={40} className="h-[34px] w-[34px] shrink-0 rounded sm:h-10 sm:w-10" />
          <span className="truncate text-[16px] font-bold tracking-tight text-[#171a2b] sm:text-[20px]">{org.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) =>
            n.items.length === 0 ? (
              <Link
                key={n.label}
                href={`${n.href}`}
                className="rounded-md px-4 py-2 text-[15px] font-semibold text-[#3a3f55] transition-colors hover:bg-[#253D9A]/8"
              >
                {n.label}
              </Link>
            ) : (
              <div key={n.label} className="relative" onMouseEnter={() => setGroup(n.label)} onMouseLeave={() => setGroup(null)}>
                <button
                  onClick={() => setGroup(group === n.label ? null : n.label)}
                  aria-expanded={group === n.label}
                  className={`rounded-md px-4 py-2 text-[15px] font-semibold transition-colors ${
                    group === n.label ? "bg-[#253D9A] text-white" : "text-[#3a3f55] hover:bg-[#253D9A]/8"
                  }`}
                >
                  {n.label}
                </button>
                {group === n.label && (
                  <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3">
                    <div className="rounded-lg border border-[#e6e8f0] bg-white py-2 shadow-[0_8px_28px_rgba(23,26,43,0.14)]">
                      {n.items.map((item) => (
                        <Link
                          key={item.href}
                          href={`${item.href}`}
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

        <Link href={`/donate`} className="hidden shrink-0 rounded-md bg-[#253D9A] px-5 py-2 text-[15px] font-semibold text-white hover:bg-[#1B2C70] lg:inline-block">
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
        <div className="max-h-[calc(100dvh-76px)] overflow-y-auto border-t border-[#e3e6f0] bg-white lg:hidden">
          <nav aria-label="Main" className="mx-auto max-w-6xl px-6 pb-6 pt-2">
            <ul className="divide-y divide-[#e3e6f0]">
              {nav.map((n) => {
                const expanded = mobileGroup === n.label;
                const panelId = `mobile-nav-${n.label.toLowerCase().replace(/\W+/g, "-")}`;
                return (
                  <li key={n.label}>
                    {n.items.length === 0 ? (
                      <Link href={`${n.href}`} onClick={() => setOpen(false)} className="block py-4 text-[17px] font-semibold text-[#171a2b]">
                        {n.label}
                      </Link>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setMobilePick({ path: pathname, label: expanded ? null : n.label })}
                          aria-expanded={expanded}
                          aria-controls={panelId}
                          className="flex w-full items-center justify-between py-4 text-left text-[17px] font-semibold text-[#171a2b]"
                        >
                          {n.label}
                          <svg
                            viewBox="0 0 20 20"
                            width="18"
                            height="18"
                            aria-hidden="true"
                            className={`text-[#6f7899] transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
                          >
                            <path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {/* Grid-rows animates the height of the sub-list without measuring it. */}
                        <div
                          id={panelId}
                          className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                        >
                          <ul className="overflow-hidden" inert={!expanded}>
                            {n.items.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  onClick={() => setOpen(false)}
                                  aria-current={pathname === item.href ? "page" : undefined}
                                  className={`block border-l-2 py-2.5 pl-4 text-[15px] ${
                                    pathname === item.href ? "border-[#253D9A] font-semibold text-[#253D9A]" : "border-[#e3e6f0] text-[#4b4f66]"
                                  }`}
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                            <li aria-hidden="true" className="h-3" />
                          </ul>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
            <Link
              href={`/donate`}
              onClick={() => setOpen(false)}
              className="mt-4 inline-block rounded-md bg-[#253D9A] px-4 py-2 text-sm font-semibold text-white"
            >
              Donate
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
