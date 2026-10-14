"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ManagedUser } from "../../_lib/api/userAdapter";
import { listUsersAction } from "../../_lib/dashboard/userActions";
import { isAdmin } from "../../_lib/session";
import { useSession } from "../../_lib/useSession";
import { RoleBadge } from "./accounts";
import { Avatar } from "./console";
import { MenuIcon, SearchIcon } from "./icons";

/** Where an account opens: visitors on the Visitors screen, staff on Users & Roles, with its panel already open. */
export function accountHref(user: Pick<ManagedUser, "id" | "role" | "email">): string {
  const screen = user.role === "public" ? "visitors" : "users";
  return `/dashboard/${screen}?q=${encodeURIComponent(user.email)}&open=${user.id}`;
}

/** Finds any account by name, email or username as you type (admins only). */
function PeopleSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ManagedUser[] | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) return;
    let current = true;
    const timer = setTimeout(() => {
      listUsersAction({ q: term, pageSize: 6 })
        .catch(() => null)
        .then((r) => {
          if (!current) return;
          setResults(r && r.status === "ok" ? r.users : []);
          setActive(0);
        });
    }, 250);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query]);

  const shown = query.trim().length >= 2 ? results : null;

  function go(user: ManagedUser) {
    setOpen(false);
    setQuery("");
    setResults(null);
    router.push(accountHref(user));
  }

  return (
    <div
      ref={box}
      className="relative w-full max-w-md"
      onBlur={(e) => {
        if (!box.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <label className="relative block">
        <span className="sr-only">Search people</span>
        <SearchIcon width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!shown?.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, shown.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              go(shown[active]);
            } else if (e.key === "Escape") setOpen(false);
          }}
          role="combobox"
          aria-expanded={open && !!shown}
          aria-controls="people-results"
          aria-autocomplete="list"
          placeholder="Search people by name or email…"
          maxLength={100}
          className="h-9 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-[13.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/15"
        />
      </label>
      {open && shown && (
        <ul id="people-results" role="listbox" className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-[0_14px_40px_rgba(22,26,46,0.16)]">
          {shown.length === 0 ? (
            <li className="px-3 py-3 text-[13px] text-muted">No one matches &ldquo;{query.trim()}&rdquo;.</li>
          ) : (
            shown.map((user, i) => (
              <li key={user.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(user)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left ${i === active ? "bg-hover" : ""}`}
                >
                  <Avatar name={user.name} seed={user.id} size={28} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink">{user.name}</span>
                    <span className="block truncate text-[12px] text-muted">{user.email}</span>
                  </span>
                  <RoleBadge role={user.role} />
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

/** The people search is left out on the Overview (at the owner's request) and on the screens that list accounts, which have their own. */
const NO_SEARCH = ["/dashboard", "/dashboard/users", "/dashboard/visitors"];

/** The console's top bar: the menu button on phones, people search for admins, and a way back to the public site. */
export default function ConsoleTopBar({ onMenu }: { onMenu: () => void }) {
  const session = useSession() ?? null;
  const pathname = usePathname();
  return (
    <div className="relative z-20 flex h-14 items-center gap-3 border-b border-line bg-surface px-4 lg:px-6">
      <button type="button" onClick={onMenu} aria-label="Open menu" className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-soft lg:hidden">
        <MenuIcon />
      </button>
      {isAdmin(session) && !NO_SEARCH.includes(pathname) ? <PeopleSearch /> : <span className="flex-1" />}
      <Link href="/" className="ml-auto shrink-0 text-[13px] font-semibold text-muted hover:text-brand">
        View site <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
