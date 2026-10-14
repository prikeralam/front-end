"use client";

import { useEffect, useState, type FormEvent } from "react";
import { isAdmin, roleLabels, type Role, type Session } from "../../_lib/session";
import { useRequireSession } from "../../_lib/useSession";
import type { ManagedUser } from "../../_lib/api/userAdapter";
import {
  createUserAction,
  listUsersAction,
  sendPasswordResetAction,
  setUserActiveAction,
  setUserRoleAction,
  updateUserAction,
  type NewUserInput,
  type UserField,
  type UserFilters,
  type UserListResult,
  type UserMutation,
} from "../../_lib/dashboard/userActions";
import { EmptyState } from "../../_ui/kit";
import DashboardPageHeader, { primaryButton } from "../_ui/DashboardPageHeader";
import Drawer from "../_ui/Drawer";
import { PURPOSES } from "../../_lib/signup";
import { PlusIcon } from "../_ui/icons";

// Access is per role, not per user (backend Module H): giving someone access means choosing their role.
const ROLE_ORDER: Role[] = ["public", "fellow", "researcher", "editor", "admin"];

const roleAccess: Record<Role, string> = {
  public: "Public pages and downloads; can request access to restricted datasets.",
  fellow: "Signed-in dashboard; can request access to restricted datasets.",
  researcher: "Drafts content and datasets and submits them for review.",
  editor: "Reviews, approves and publishes content; decides dataset access requests.",
  admin: "Everything, plus users and roles, the audit log and the Django admin site.",
};

const roleTone: Record<Role, string> = {
  public: "bg-[#8b8fa3]/12 text-[#5b5f74]",
  fellow: "bg-[#0F6B5C]/10 text-[#0F6B5C]",
  researcher: "bg-[#253D9A]/8 text-[#253D9A]",
  editor: "bg-[#253D9A]/15 text-[#1B2C70]",
  admin: "bg-[#171a2b] text-white",
};

const labelClass = "mb-1 block text-xs font-bold uppercase tracking-wider text-[#8b8fa3]";
const fieldClass =
  "h-10 w-full rounded-lg border border-[#dcdee8] bg-white px-3 text-[14px] text-[#171a2b] outline-none transition-colors focus:border-[#253D9A] focus:ring-2 focus:ring-[#253D9A]/20 aria-[invalid=true]:border-[#E4633F]";
const pillClass = "rounded-full border border-[#dcdee8] bg-white px-3 py-1.5 text-[13px] text-[#171a2b]";
const primaryClass = "rounded-full bg-[#253D9A] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1B2C70] disabled:cursor-not-allowed disabled:opacity-60";
const ghostClass =
  "rounded-full border border-[#dcdee8] px-3.5 py-1.5 text-[12px] font-semibold text-[#3a3f55] enabled:hover:border-[#253D9A] enabled:hover:text-[#253D9A] disabled:cursor-not-allowed disabled:opacity-50";
const dangerClass =
  "rounded-full border border-[#E4633F]/40 px-3.5 py-1.5 text-[12px] font-semibold text-[#B8452A] enabled:hover:bg-[#E4633F]/8 disabled:cursor-not-allowed disabled:opacity-50";

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** 16 characters from an unambiguous alphabet, from the browser's CSPRNG. */
function generatePassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789-";
  const bytes = new Uint32Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => alphabet[n % alphabet.length]).join("");
}

function RolePill({ role }: { role: Role }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${roleTone[role]}`}>{roleLabels[role]}</span>;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="mt-1 text-[12px] text-[#B8452A]">{message}</p> : null;
}

/** The access ladder: what each role can do, so choosing a role is choosing a level of access knowingly. */
function RoleLadder() {
  return (
    <details className="group mt-8 rounded-xl border border-[#e6e8f0] bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-[13px] font-semibold text-[#3a3f55]">
        What each role can do
        <span aria-hidden="true" className="text-[#8b8fa3] transition-transform group-open:rotate-180">▾</span>
      </summary>
      <ol className="grid gap-px border-t border-[#e6e8f0] bg-[#e6e8f0] sm:grid-cols-5">
        {ROLE_ORDER.map((role, index) => (
          <li key={role} className="bg-white px-4 py-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#8b8fa3]">{index + 1}</span>
              <RolePill role={role} />
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-[#5b5f74]">{roleAccess[role]}</p>
          </li>
        ))}
      </ol>
    </details>
  );
}

function NewUserPanel({ onCreated, onCancel }: { onCreated: (user: ManagedUser | undefined, invite: boolean) => void; onCancel: () => void }) {
  const [mode, setMode] = useState<NewUserInput["mode"]>("invite");
  const [role, setRole] = useState<Role>("researcher");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Exclude<UserMutation, { ok: true }> | null>(null);
  const errors = result?.fieldErrors ?? {};

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    const outcome = await createUserAction({
      username: String(form.get("username") ?? ""),
      email: String(form.get("email") ?? ""),
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      role,
      mode,
      password: mode === "password" ? password : undefined,
    }).catch((): UserMutation => ({ ok: false, message: "We couldn't reach the server. Please try again." }));
    setBusy(false);
    if (outcome.ok) onCreated(outcome.user, mode === "invite");
    else setResult(outcome);
  }

  const field = (name: UserField, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`new-${name}`} className={labelClass}>{label}</label>
      <input id={`new-${name}`} name={name} className={fieldClass} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `new-${name}-error` : undefined} {...props} />
      <FieldError id={`new-${name}-error`} message={errors[name]} />
    </div>
  );

  return (
    <form onSubmit={submit} noValidate aria-busy={busy}>
      {result && <p role="alert" className="mb-4 rounded-lg border border-[#E4633F]/30 bg-[#E4633F]/8 p-3 text-[13px] text-[#5b5f74]">{result.message}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {field("username", "Username", { required: true, autoCapitalize: "none", spellCheck: false, maxLength: 150, autoComplete: "off" })}
        {field("email", "Email", { required: true, type: "email", maxLength: 254, autoComplete: "off" })}
        {field("firstName", "First name", { maxLength: 150, autoComplete: "off" })}
        {field("lastName", "Last name", { maxLength: 150, autoComplete: "off" })}
      </div>

      <div className="mt-5">
        <label htmlFor="new-role" className={labelClass}>Role</label>
        <select id="new-role" value={role} onChange={(e) => setRole(e.target.value as Role)} className={`${fieldClass} sm:w-64`}>
          {ROLE_ORDER.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
        </select>
        <p className="mt-1.5 text-[12px] text-[#5b5f74]">{roleAccess[role]}</p>
      </div>

      <fieldset className="mt-6">
        <legend className={labelClass}>How they get a password</legend>
        <div className="mt-1 grid gap-3 sm:grid-cols-2">
          {([
            ["invite", "Email an invite", "They receive a link to choose their own password."],
            ["password", "Set a temporary password", "You pass it on; they must change it when they first sign in."],
          ] as const).map(([value, title, hint]) => (
            <label key={value} className={`flex cursor-pointer gap-3 rounded-lg border p-3.5 ${mode === value ? "border-[#253D9A] bg-[#253D9A]/5" : "border-[#dcdee8]"}`}>
              <input type="radio" name="mode" value={value} checked={mode === value} onChange={() => setMode(value)} className="mt-0.5 accent-[#253D9A]" />
              <span>
                <span className="block text-[14px] font-semibold text-[#171a2b]">{title}</span>
                <span className="block text-[12px] text-[#5b5f74]">{hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {mode === "password" && (
        <div className="mt-4">
          <label htmlFor="new-password" className={labelClass}>Temporary password</label>
          <div className="flex gap-2">
            <input
              id="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={128}
              autoComplete="new-password"
              spellCheck={false}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "new-password-error" : undefined}
              className={`${fieldClass} font-mono`}
            />
            <button type="button" onClick={() => setPassword(generatePassword())} className={ghostClass}>Generate</button>
          </div>
          <FieldError id="new-password-error" message={errors.password} />
        </div>
      )}

      <div className="sticky bottom-0 -mx-6 -mb-5 mt-6 flex items-center gap-3 border-t border-[#e3e6f0] bg-white px-6 py-4">
        <button type="submit" disabled={busy} className={primaryClass}>{busy ? "Creating…" : mode === "invite" ? "Create and send invite" : "Create user"}</button>
        <button type="button" onClick={onCancel} className={ghostClass}>Cancel</button>
      </div>
    </form>
  );
}

type RowMode = { kind: "view" } | { kind: "edit" } | { kind: "role"; next: Role } | { kind: "deactivate" };

function UserRow({ user, self, onChanged }: { user: ManagedUser; self: boolean; onChanged: (notice: string) => void }) {
  const [mode, setMode] = useState<RowMode>({ kind: "view" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; fieldErrors?: Partial<Record<UserField, string>> } | null>(null);

  async function run(action: () => Promise<UserMutation>, notice: string) {
    setBusy(true);
    setError(null);
    const outcome = await action().catch((): UserMutation => ({ ok: false, message: "We couldn't reach the server. Please try again." }));
    setBusy(false);
    if (outcome.ok) {
      setMode({ kind: "view" });
      onChanged(notice);
    } else setError(outcome);
  }

  function saveDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    void run(
      () => updateUserAction(user.id, { email: String(form.get("email") ?? ""), firstName: String(form.get("firstName") ?? ""), lastName: String(form.get("lastName") ?? "") }),
      `Saved ${user.username}'s details.`,
    );
  }

  const initial = (user.firstName || user.username).charAt(0).toUpperCase();

  return (
    <li className={`px-5 py-4 ${user.active ? "" : "bg-[#fafbfc]"}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${user.active ? "bg-[#253D9A]/10 text-[#253D9A]" : "bg-[#e6e8f0] text-[#8b8fa3]"}`}>
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`flex flex-wrap items-center gap-2 text-[15px] font-semibold ${user.active ? "text-[#171a2b]" : "text-[#8b8fa3]"}`}>
            {user.name}
            {self && <span className="rounded-full bg-[#253D9A]/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#253D9A]">You</span>}
            {!user.active && <span className="rounded-full bg-[#E4633F]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#B8452A]">Deactivated</span>}
            {user.active && user.mustChangePassword && <span className="rounded-full bg-[#F2B233]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8A6100]">Temporary password</span>}
          </p>
          <p className="truncate text-[13px] text-[#5b5f74]">@{user.username} &middot; {user.email}</p>
          {/* Visitors who signed up themselves: what they told us, and whether they confirmed their email. */}
          {user.role === "public" && (
            <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[#8b8fa3]">
              <span className={user.emailVerified ? "text-[#2f6b45]" : "text-[#8A6100]"}>{user.emailVerified ? "Email confirmed" : "Email not confirmed"}</span>
              {user.organisation && <span>{user.organisation}</span>}
              {user.purpose && <span>Use: {PURPOSES.find((p) => p.value === user.purpose)?.label ?? user.purpose}</span>}
              {user.newsletter && <span>Newsletter: yes</span>}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor={`role-${user.id}`}>Role for {user.username}</label>
          <select
            id={`role-${user.id}`}
            value={mode.kind === "role" ? mode.next : user.role}
            disabled={self || busy || !user.active}
            title={self ? "You can't change your own role. Ask another admin." : undefined}
            onChange={(e) => {
              const next = e.target.value as Role;
              setError(null);
              setMode(next === user.role ? { kind: "view" } : { kind: "role", next });
            }}
            className={`${pillClass} font-semibold disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {ROLE_ORDER.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
          </select>
          <span className="hidden w-28 text-right text-[12px] text-[#8b8fa3] md:block">Last in: {formatDate(user.lastLoginAt)}</span>
        </div>
      </div>

      {mode.kind === "role" && (
        <div className="mt-4 rounded-lg border border-[#253D9A]/25 bg-[#253D9A]/5 p-4">
          <p className="text-[13px] text-[#171a2b]">
            Change <strong>{user.name}</strong> from <RolePill role={user.role} /> to <RolePill role={mode.next} />?
          </p>
          <p className="mt-1.5 text-[12px] text-[#5b5f74]">They will be able to: {roleAccess[mode.next]}</p>
          <div className="mt-3 flex gap-2">
            <button disabled={busy} onClick={() => run(() => setUserRoleAction(user.id, mode.next), `${user.username} is now ${roleLabels[mode.next]}.`)} className={primaryClass}>
              {busy ? "Saving…" : "Change role"}
            </button>
            <button disabled={busy} onClick={() => { setMode({ kind: "view" }); setError(null); }} className={ghostClass}>Cancel</button>
          </div>
        </div>
      )}

      {mode.kind === "edit" && (
        <form onSubmit={saveDetails} noValidate className="mt-4 grid gap-3 rounded-lg border border-[#e6e8f0] bg-white p-4 sm:grid-cols-3">
          {([
            ["firstName", "First name", user.firstName],
            ["lastName", "Last name", user.lastName],
            ["email", "Email", user.email],
          ] as const).map(([name, label, value]) => (
            <div key={name}>
              <label htmlFor={`${name}-${user.id}`} className={labelClass}>{label}</label>
              <input
                id={`${name}-${user.id}`}
                name={name}
                defaultValue={value}
                type={name === "email" ? "email" : "text"}
                maxLength={name === "email" ? 254 : 150}
                aria-invalid={!!error?.fieldErrors?.[name]}
                className={fieldClass}
              />
              <FieldError id={`${name}-${user.id}-error`} message={error?.fieldErrors?.[name]} />
            </div>
          ))}
          <div className="flex gap-2 sm:col-span-3">
            <button type="submit" disabled={busy} className={primaryClass}>{busy ? "Saving…" : "Save"}</button>
            <button type="button" disabled={busy} onClick={() => { setMode({ kind: "view" }); setError(null); }} className={ghostClass}>Cancel</button>
          </div>
        </form>
      )}

      {mode.kind === "deactivate" && (
        <div className="mt-4 rounded-lg border border-[#E4633F]/30 bg-[#E4633F]/5 p-4">
          <p className="text-[13px] text-[#171a2b]">
            Deactivate <strong>{user.name}</strong>? They are signed out everywhere at once and can&apos;t sign in until reactivated.
          </p>
          <p className="mt-1.5 text-[12px] text-[#5b5f74]">Accounts are never deleted, so the content they wrote keeps its author and their history stays in the audit log.</p>
          <div className="mt-3 flex gap-2">
            <button disabled={busy} onClick={() => run(() => setUserActiveAction(user.id, false), `${user.username} was deactivated.`)} className={dangerClass}>
              {busy ? "Deactivating…" : "Deactivate"}
            </button>
            <button disabled={busy} onClick={() => { setMode({ kind: "view" }); setError(null); }} className={ghostClass}>Cancel</button>
          </div>
        </div>
      )}

      {error && mode.kind !== "edit" && <p role="alert" className="mt-3 text-[13px] text-[#B8452A]">{error.message}</p>}
      {error && mode.kind === "edit" && !error.fieldErrors && <p role="alert" className="mt-3 text-[13px] text-[#B8452A]">{error.message}</p>}

      {mode.kind === "view" && (
        <div className="mt-3 flex flex-wrap gap-2 pl-14">
          <button disabled={busy} onClick={() => { setError(null); setMode({ kind: "edit" }); }} className={ghostClass}>Edit details</button>
          <button
            disabled={busy || !user.active}
            title={user.active ? undefined : "Reactivate the account first."}
            onClick={() => run(() => sendPasswordResetAction(user.id), `A password link was emailed to ${user.email}.`)}
            className={ghostClass}
          >
            Send password link
          </button>
          {user.active ? (
            <button
              disabled={busy || self}
              title={self ? "You can't deactivate your own account." : undefined}
              onClick={() => { setError(null); setMode({ kind: "deactivate" }); }}
              className={dangerClass}
            >
              Deactivate
            </button>
          ) : (
            <button disabled={busy} onClick={() => run(() => setUserActiveAction(user.id, true), `${user.username} was reactivated.`)} className={ghostClass}>
              {busy ? "Reactivating…" : "Reactivate"}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function UserManager({ session }: { session: Session }) {
  const [queryInput, setQueryInput] = useState("");
  const [filters, setFilters] = useState<Required<Omit<UserFilters, "page">>>({ q: "", role: "", active: "" });
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState<UserListResult | "loading">("loading");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let current = true;
    listUsersAction({ ...filters, page })
      .then((next) => current && setResult(next))
      .catch(() => current && setResult({ status: "error" }));
    return () => {
      current = false;
    };
  }, [filters, page, reload]);

  function refresh(message: string) {
    setNotice(message);
    setReload((n) => n + 1);
  }

  function applyFilters(next: Partial<typeof filters>) {
    setResult("loading");
    setPage(1);
    setFilters((prev) => ({ ...prev, ...next }));
  }

  function search(e: FormEvent) {
    e.preventDefault();
    applyFilters({ q: queryInput.trim() });
  }

  return (
    <>
      <DashboardPageHeader
        trail={["Administration", "Users & roles"]}
        title="Users & roles"
        description="Create accounts, choose what each person can do, and switch access off when someone leaves."
        actions={
          <button type="button" onClick={() => { setNotice(""); setCreating(true); }} className={primaryButton}>
            <PlusIcon width={16} height={16} /> New user
          </button>
        }
      />
      <section className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        <Drawer open={creating} title="New user" subtitle="They get an account with the role you choose." onClose={() => setCreating(false)}>
          <NewUserPanel
            onCancel={() => setCreating(false)}
            onCreated={(user, invite) => {
              setCreating(false);
              const who = user?.username ?? "The user";
              refresh(invite ? `${who} was created and an invite was emailed to ${user?.email ?? "them"}.` : `${who} was created. Pass on the temporary password; they'll be asked to change it.`);
            }}
          />
        </Drawer>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e3e6f0] bg-white p-3">
          <form onSubmit={search} role="search" className="flex min-w-[14rem] flex-1 gap-2">
            <label htmlFor="user-search" className="sr-only">Search users</label>
            <input id="user-search" value={queryInput} onChange={(e) => setQueryInput(e.target.value)} maxLength={100} placeholder="Search name, username or email" className={`${pillClass} flex-1`} />
            <button type="submit" className={ghostClass}>Search</button>
          </form>
          <label className="flex items-center gap-2 text-[13px] font-medium text-[#5b5f74]">
            Role
            <select value={filters.role} onChange={(e) => applyFilters({ role: e.target.value as Role | "" })} className={pillClass}>
              <option value="">All roles</option>
              {ROLE_ORDER.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
            </select>
          </label>
          <div role="group" aria-label="Status" className="flex rounded-full border border-[#dcdee8] bg-white p-0.5">
            {([["", "All"], ["active", "Active"], ["inactive", "Deactivated"]] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => applyFilters({ active: value })}
                aria-pressed={filters.active === value}
                className={`rounded-full px-3 py-1 text-[12px] font-semibold ${filters.active === value ? "bg-[#253D9A] text-white" : "text-[#5b5f74] hover:text-[#171a2b]"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p role="status" aria-live="polite" className={notice ? "mt-4 rounded-lg border border-[#0F6B5C]/25 bg-[#0F6B5C]/8 px-4 py-2.5 text-[13px] text-[#0F4F44]" : "sr-only"}>
          {notice}
        </p>

        <div className="mt-6">
          {result === "loading" ? (
            <p role="status" className="text-sm text-[#8b8fa3]">Loading users…</p>
          ) : result.status === "forbidden" ? (
            <p className="text-sm text-[#8b8fa3]">The server says this account may not manage users.</p>
          ) : result.status === "signed-out" ? (
            <p className="text-sm text-[#8b8fa3]">Your session has ended. <a href="/account" className="font-semibold text-[#253D9A] hover:underline">Sign in again</a>.</p>
          ) : result.status === "invalid" ? (
            <p className="text-sm text-[#B8452A]">Those filters aren&apos;t valid.</p>
          ) : result.status === "error" ? (
            <p className="text-sm text-[#B8452A]">We couldn&apos;t load users just now. Please try again.</p>
          ) : result.users.length === 0 ? (
            <EmptyState message={filters.q || filters.role || filters.active ? "No users match these filters." : "No accounts yet."} />
          ) : (
            <>
              <ul className="divide-y divide-[#edf0f6] overflow-hidden rounded-xl border border-[#e3e6f0] bg-white shadow-[0_1px_2px_rgba(23,26,43,0.04)]">
                {result.users.map((user) => (
                  <UserRow key={`${user.id}-${reload}`} user={user} self={user.id === session.id} onChanged={refresh} />
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between text-[13px] text-[#8b8fa3]">
                <span>{result.count} {result.count === 1 ? "account" : "accounts"} &middot; page {page}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setResult("loading"); setPage((p) => p - 1); }} disabled={!result.hasPrevious} className={ghostClass}>Previous</button>
                  <button onClick={() => { setResult("loading"); setPage((p) => p + 1); }} disabled={!result.hasNext} className={ghostClass}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>

        <RoleLadder />
      </section>
    </>
  );
}

export default function UsersPage() {
  const session = useRequireSession();
  if (!session) return null;

  return (
    isAdmin(session) ? (
      <UserManager session={session} />
    ) : (
      <>
        <DashboardPageHeader trail={["Administration", "Users & roles"]} title="Users & roles" />
        <section className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
          <p className="text-sm text-[#8b8fa3]">Managing users is limited to the Admin role.</p>
        </section>
      </>
    )
  );
}
