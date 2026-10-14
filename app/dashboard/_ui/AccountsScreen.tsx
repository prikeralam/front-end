"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ManagedUser } from "../../_lib/api/userAdapter";
import { exportUsersAction, getVisitorStatsAction, listUsersAction, type UserListResult, type VisitorStats } from "../../_lib/dashboard/userActions";
import type { UserFilters, UserOrdering } from "../../_lib/dashboard/userQuery";
import { isAdmin, roleLabels, type Role } from "../../_lib/session";
import { PURPOSES, type Purpose } from "../../_lib/signup";
import { useRequireSession } from "../../_lib/useSession";
import { AccountPanel, NewUserPanel, RoleBadge, STAFF_ROLES, fieldClass, formatDate, purposeLabel, relativeTime, roleAccess } from "./accounts";
import { Avatar, Badge, DataTable, FilterChips, Pagination, StatCard, buttonClass, mono, panelClass, primaryClass, type Column } from "./console";
import DashboardPageHeader from "./DashboardPageHeader";
import Drawer from "./Drawer";
import { PlusIcon, SearchIcon } from "./icons";

const PAGE_SIZE = 25;
const selectClass = `${fieldClass.replace(" w-full", "")} w-auto`;

type Kind = "staff" | "visitor";
type StatusChip = "all" | "active" | "inactive" | "confirmed" | "unconfirmed" | "newsletter";

/** The chips' filters on top of the screen's fixed one (staff or visitors). */
function chipFilters(kind: Kind, chip: StatusChip): UserFilters {
  const base: UserFilters = { staff: kind === "staff" };
  if (chip === "active") return { ...base, active: "active" };
  if (chip === "inactive") return { ...base, active: "inactive" };
  if (chip === "confirmed") return { ...base, confirmed: "yes" };
  if (chip === "unconfirmed") return { ...base, confirmed: "no" };
  if (chip === "newsletter") return { ...base, newsletter: true };
  return base;
}

/** Saves CSV text as a file in the browser. */
function saveCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function staffColumns(selfId?: number): Column<ManagedUser>[] {
  return [
    {
      key: "member",
      header: "Member",
      sortKey: "username",
      cell: (u) => (
        <span className="flex min-w-0 items-center gap-3">
          <Avatar name={u.name} seed={u.id} />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-semibold text-ink">
              <span className="truncate">{u.name}</span>
              {u.id === selfId && <Badge tone="brand" dot={false}>You</Badge>}
            </span>
            <span className="block truncate text-[12.5px] text-muted">{u.email}</span>
          </span>
        </span>
      ),
    },
    { key: "role", header: "Role", cell: (u) => <RoleBadge role={u.role} /> },
    {
      key: "status",
      header: "Status",
      hideBelow: "sm",
      cell: (u) => (!u.active ? <Badge tone="danger">Deactivated</Badge> : u.mustChangePassword ? <Badge tone="warn">Temporary password</Badge> : <Badge tone="ok">Active</Badge>),
    },
    { key: "last", header: "Last active", sortKey: "last_login", hideBelow: "md", cell: (u) => <span className="text-muted">{relativeTime(u.lastLoginAt)}</span> },
    { key: "joined", header: "Joined", sortKey: "date_joined", hideBelow: "lg", cell: (u) => <span className="text-muted">{formatDate(u.joinedAt)}</span> },
  ];
}

const visitorColumns: Column<ManagedUser>[] = [
  {
    key: "visitor",
    header: "Visitor",
    sortKey: "email",
    cell: (u) => (
      <span className="flex min-w-0 items-center gap-3">
        <Avatar name={u.name} seed={u.id} />
        <span className="min-w-0">
          <span className="block truncate font-semibold text-ink">{u.name}</span>
          <span className="block truncate text-[12.5px] text-muted">{u.email}</span>
        </span>
      </span>
    ),
  },
  { key: "org", header: "Organisation", hideBelow: "md", cell: (u) => <span className="block max-w-[14rem] truncate text-ink-soft">{u.organisation || <span className="text-faint">Not given</span>}</span> },
  { key: "purpose", header: "Uses data for", hideBelow: "lg", cell: (u) => <span className="text-ink-soft">{purposeLabel(u.purpose)}</span> },
  {
    key: "status",
    header: "Status",
    hideBelow: "sm",
    cell: (u) => (
      <span className="flex flex-col items-start gap-1">
        {!u.active ? <Badge tone="danger">Deactivated</Badge> : u.emailVerified ? <Badge tone="ok">Confirmed</Badge> : <Badge tone="warn">Unconfirmed</Badge>}
        {u.newsletter && <span className="text-[11.5px] text-muted">Newsletter</span>}
      </span>
    ),
  },
  { key: "downloads", header: "Downloads", className: "text-right", cell: (u) => <span className={`${mono} text-ink`}>{u.downloadCount}</span> },
  { key: "joined", header: "Joined", sortKey: "date_joined", hideBelow: "md", cell: (u) => <span className="text-muted">{relativeTime(u.joinedAt)}</span> },
];

/**
 * An admin list of accounts: staff (Users & Roles) or self-registered visitors. Search, filter chips, a sortable table,
 * a side panel per account, and (for visitors) the figures strip and CSV exports. `?q=` and `?open=<id>` come from the
 * console's people search.
 */
export default function AccountsScreen({ kind }: { kind: Kind }) {
  const session = useRequireSession();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [applied, setApplied] = useState(query.trim());
  const [chip, setChip] = useState<StatusChip>("all");
  const [role, setRole] = useState<Role | "">("");
  const [purpose, setPurpose] = useState<Purpose | "">("");
  const [ordering, setOrdering] = useState<UserOrdering>(kind === "visitor" ? "-date_joined" : "username");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<UserListResult | null>(null);
  const [tick, setTick] = useState(0);
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [selected, setSelected] = useState<ManagedUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [exporting, setExporting] = useState<"all" | "newsletter" | null>(null);
  const openId = Number(params.get("open")) || null;

  const filters: UserFilters = {
    ...chipFilters(kind, chip),
    q: applied,
    ...(kind === "staff" && role ? { role } : {}),
    ...(kind === "visitor" && purpose ? { purpose } : {}),
    ordering,
  };

  // Search as you type, after a short pause.
  useEffect(() => {
    const timer = setTimeout(() => {
      setApplied(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filterKey = JSON.stringify(filters);
  useEffect(() => {
    let current = true;
    listUsersAction({ ...(JSON.parse(filterKey) as UserFilters), page, pageSize: PAGE_SIZE })
      .catch((): UserListResult => ({ status: "error" }))
      .then((next) => {
        if (!current) return;
        setResult(next);
        // Opened from the people search: show that account's panel once it is in the list.
        if (openId && next.status === "ok") {
          const match = next.users.find((u) => u.id === openId);
          if (match) setSelected((s) => s ?? match);
        }
      });
    return () => {
      current = false;
    };
  }, [filterKey, page, tick, openId]);

  useEffect(() => {
    if (kind !== "visitor") return;
    let current = true;
    getVisitorStatsAction()
      .catch(() => null)
      .then((s) => {
        if (current) setStats(s);
      });
    return () => {
      current = false;
    };
  }, [kind, tick]);

  if (session === undefined) return null;
  if (!isAdmin(session)) {
    return (
      <>
        <DashboardPageHeader trail={["Administration"]} title={kind === "visitor" ? "Visitors" : "Users & roles"} />
        <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
          <p className={`${panelClass} p-6 text-[14px] text-muted`}>This page is limited to admins.</p>
        </section>
      </>
    );
  }

  async function exportCsv(which: "all" | "newsletter") {
    setExporting(which);
    const outcome = await exportUsersAction({ ...filters, ...(which === "newsletter" ? { staff: false } : {}) }, which === "newsletter").catch(() => ({ ok: false as const, message: "The export failed. Please try again." }));
    setExporting(null);
    if (outcome.ok) saveCsv(outcome.filename, outcome.csv);
    else setNotice({ tone: "error", text: outcome.message });
  }

  function changed(user: ManagedUser | null, text: string) {
    setNotice({ tone: "ok", text });
    // null: the account was deleted, so its panel closes.
    setSelected(user);
    setTick((t) => t + 1);
  }

  const visitor = kind === "visitor";
  const chips = visitor
    ? [
        { value: "all" as const, label: "All", count: stats?.visitors.total },
        { value: "confirmed" as const, label: "Confirmed", count: stats?.visitors.confirmed },
        { value: "unconfirmed" as const, label: "Unconfirmed", count: stats ? stats.visitors.total - stats.visitors.confirmed : undefined },
        { value: "newsletter" as const, label: "Newsletter", count: stats?.visitors.newsletter },
      ]
    : [
        { value: "all" as const, label: "All" },
        { value: "active" as const, label: "Active" },
        { value: "inactive" as const, label: "Deactivated" },
      ];

  const users = result?.status === "ok" ? result.users : [];

  return (
    <>
      <DashboardPageHeader
        trail={["Administration"]}
        title={visitor ? "Visitors" : "Users & roles"}
        description={
          visitor
            ? "People who created an account to download PRI's data: who they are, what they use it for, and what they downloaded."
            : "PRI's staff accounts. Access is per role; changing someone's role is how you give or take away access."
        }
        actions={
          visitor ? (
            <>
              <button type="button" onClick={() => exportCsv("newsletter")} disabled={!!exporting} className={buttonClass}>
                {exporting === "newsletter" ? "Exporting…" : "Export newsletter list"}
              </button>
              <button type="button" onClick={() => exportCsv("all")} disabled={!!exporting} className={primaryClass}>
                {exporting === "all" ? "Exporting…" : "Export CSV"}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setCreating(true)} className={primaryClass}>
              <PlusIcon width={16} height={16} /> Invite member
            </button>
          )
        }
      />

      <section className="mx-auto max-w-6xl space-y-5 px-6 py-6 lg:px-8">
        {visitor && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Visitors" value={stats ? stats.visitors.total : "–"} note={stats ? `${stats.visitors.new30Days} in the last 30 days` : " "} trend={stats?.weeklySignups.map((w) => w.count)} />
            <StatCard label="Confirmed email" value={stats ? stats.visitors.confirmed : "–"} note={stats && stats.visitors.total ? `${Math.round((stats.visitors.confirmed / stats.visitors.total) * 100)}% of visitors` : " "} />
            <StatCard label="Newsletter subscribers" value={stats ? stats.visitors.newsletter : "–"} note="Opted in at sign-up" />
            <StatCard label="Downloads, 30 days" value={stats ? stats.downloads.last30Days : "–"} note={stats ? `${stats.downloads.total} in total` : " "} />
          </div>
        )}

        {!visitor && (
          <p className="text-[13px] text-muted">
            Visitors who signed up to download data are listed separately under{" "}
            <a href="/dashboard/visitors" className="font-semibold text-brand hover:underline">Visitors</a>.
          </p>
        )}

        {notice && (
          <p role="status" className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-[13px] ${notice.tone === "ok" ? "border-ok/25 bg-ok-soft text-ok" : "border-danger/25 bg-danger-soft text-danger"}`}>
            {notice.text}
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="text-current opacity-70 hover:opacity-100">✕</button>
          </p>
        )}

        <div className={panelClass}>
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
            <label className="relative min-w-[14rem] flex-1">
              <span className="sr-only">Search</span>
              <SearchIcon width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={visitor ? "Search visitors by name, email…" : "Search members by name, email or username"}
                maxLength={100}
                className={`${fieldClass} pl-9`}
              />
            </label>
            <FilterChips label="Status" chips={chips} value={chip} onChange={(v) => { setChip(v); setPage(1); }} />
            {visitor ? (
              <select aria-label="Uses data for" value={purpose} onChange={(e) => { setPurpose(e.target.value as Purpose | ""); setPage(1); }} className={selectClass}>
                <option value="">Any purpose</option>
                {PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            ) : (
              <select aria-label="Role" value={role} onChange={(e) => { setRole(e.target.value as Role | ""); setPage(1); }} className={selectClass}>
                <option value="">All roles</option>
                {STAFF_ROLES.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
              </select>
            )}
          </div>

          {result && result.status !== "ok" ? (
            <p role="alert" className="px-4 py-12 text-center text-[13.5px] text-muted">
              {result.status === "forbidden" ? "Only admins can see accounts." : result.status === "signed-out" ? "Your session has ended. Please sign in again." : "We couldn't load the accounts. Please refresh to try again."}
            </p>
          ) : (
            <DataTable
              caption={visitor ? "Visitors" : "Staff accounts"}
              columns={visitor ? visitorColumns : staffColumns(session?.id)}
              rows={users}
              rowKey={(u) => u.id}
              loading={result === null}
              onRowClick={setSelected}
              selectedKey={selected?.id ?? null}
              ordering={ordering}
              onOrder={(o) => { setOrdering(o as UserOrdering); setPage(1); }}
              empty={applied || chip !== "all" || role || purpose ? "No accounts match these filters." : visitor ? "No one has signed up yet. Sign-ups from dataset pages will appear here." : "No staff accounts yet."}
            />
          )}
          {result?.status === "ok" && (
            <Pagination page={page} pageSize={PAGE_SIZE} count={result.count} hasNext={result.hasNext} hasPrevious={result.hasPrevious} onPage={setPage} />
          )}
        </div>

        {!visitor && (
          <details className={`${panelClass} group`}>
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[13px] font-semibold text-ink-soft">
              What each role can do
              <span aria-hidden="true" className="text-faint transition-transform group-open:rotate-180">▾</span>
            </summary>
            <ol className="grid gap-px border-t border-line bg-line sm:grid-cols-4">
              {STAFF_ROLES.map((r) => (
                <li key={r} className="bg-surface px-4 py-3">
                  <RoleBadge role={r} />
                  <p className="mt-2 text-[12px] leading-relaxed text-muted">{roleAccess[r]}</p>
                </li>
              ))}
            </ol>
          </details>
        )}
      </section>

      <Drawer open={!!selected} title={selected?.name ?? ""} subtitle={visitor ? "Visitor account" : "Staff account"} onClose={() => setSelected(null)}>
        {selected && <AccountPanel key={selected.id} user={selected} selfId={session?.id} onChanged={changed} />}
      </Drawer>

      <Drawer open={creating} title="Invite a member" subtitle="Staff accounts are created by admins; visitors sign up themselves." onClose={() => setCreating(false)}>
        {creating && (
          <NewUserPanel
            onCancel={() => setCreating(false)}
            onCreated={(user, invite) => {
              setCreating(false);
              changed(null, invite ? `Invite sent${user ? ` to ${user.email}` : ""}.` : "Account created.");
            }}
          />
        )}
      </Drawer>
    </>
  );
}
