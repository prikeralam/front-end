"use client";

import { useEffect, useState, type FormEvent, type InputHTMLAttributes } from "react";
import Link from "next/link";
import type { ManagedUser } from "../../_lib/api/userAdapter";
import {
  createUserAction,
  getUserDownloadsAction,
  resendUserVerificationAction,
  sendPasswordResetAction,
  setUserActiveAction,
  deleteUserAction,
  setUserRoleAction,
  updateUserAction,
  type NewUserInput,
  type UserDownload,
  type UserField,
  type UserMutation,
} from "../../_lib/dashboard/userActions";
import { roleLabels, type Role } from "../../_lib/session";
import { PURPOSES } from "../../_lib/signup";
import { Avatar, Badge, buttonClass, dangerClass, dangerSolidClass, mono, primaryClass, type Tone } from "./console";

// Shared by Users & Roles (staff) and Visitors. Access is per role (backend Module H): giving access is choosing a role.

export const STAFF_ROLES: Role[] = ["fellow", "researcher", "editor", "admin"];
export const ALL_ROLES: Role[] = ["public", ...STAFF_ROLES];

export const roleAccess: Record<Role, string> = {
  public: "Public pages and downloads; can request access to restricted datasets.",
  fellow: "Signed-in dashboard; can request access to restricted datasets.",
  researcher: "Drafts content and datasets and submits them for review.",
  editor: "Reviews, approves and publishes content; decides dataset access requests.",
  admin: "Everything, plus users and roles, the audit log and the Django admin site.",
};

const ROLE_TONE: Record<Role, Tone> = { public: "neutral", fellow: "ok", researcher: "brand", editor: "brand", admin: "warn" };

export function RoleBadge({ role }: { role: Role }) {
  return <Badge tone={ROLE_TONE[role]} dot={false}>{roleLabels[role]}</Badge>;
}

export const purposeLabel = (value: string) => PURPOSES.find((p) => p.value === value)?.label ?? (value ? value : "Not given");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "12 Oct 2026", or "Never" / "Unknown"; fixed month names so server and browser agree. */
export function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "Unknown" : `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "3h ago", "2d ago", or the date for anything older than a month. */
export function relativeTime(iso: string | null, now = Date.now()): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Unknown";
  const minutes = Math.round((now - then) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`;
  if (minutes < 60 * 24 * 30) return `${Math.round(minutes / (60 * 24))}d ago`;
  return formatDate(iso);
}

export const labelClass = "mb-1 block text-[12px] font-semibold text-ink-soft";
export const fieldClass =
  "h-9 w-full rounded-lg border border-line-strong bg-surface px-3 text-[13.5px] text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/15 aria-[invalid=true]:border-danger";

const unreachable: UserMutation = { ok: false, message: "We couldn't reach the server. Please try again." };

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="mt-1 text-[12px] text-danger">{message}</p> : null;
}

/** 16 characters from an unambiguous alphabet, from the browser's CSPRNG. */
function generatePassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789-";
  const bytes = new Uint32Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => alphabet[n % alphabet.length]).join("");
}

/** The invite form for a new staff account (visitors sign up themselves). */
export function NewUserPanel({ onCreated, onCancel }: { onCreated: (user: ManagedUser | undefined, invite: boolean) => void; onCancel: () => void }) {
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
    }).catch(() => unreachable);
    setBusy(false);
    if (outcome.ok) onCreated(outcome.user, mode === "invite");
    else setResult(outcome);
  }

  const field = (name: UserField, label: string, props: InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`new-${name}`} className={labelClass}>{label}</label>
      <input id={`new-${name}`} name={name} className={fieldClass} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `new-${name}-error` : undefined} {...props} />
      <FieldError id={`new-${name}-error`} message={errors[name]} />
    </div>
  );

  return (
    <form onSubmit={submit} noValidate aria-busy={busy}>
      {result && <p role="alert" className="mb-4 rounded-lg border border-danger/25 bg-danger-soft p-3 text-[13px] text-ink-soft">{result.message}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("username", "Username", { required: true, autoCapitalize: "none", spellCheck: false, maxLength: 150, autoComplete: "off" })}
        {field("email", "Email", { required: true, type: "email", maxLength: 254, autoComplete: "off" })}
        {field("firstName", "First name", { maxLength: 150, autoComplete: "off" })}
        {field("lastName", "Last name", { maxLength: 150, autoComplete: "off" })}
      </div>
      <div className="mt-5">
        <label htmlFor="new-role" className={labelClass}>Role</label>
        <select id="new-role" value={role} onChange={(e) => setRole(e.target.value as Role)} className={`${fieldClass} sm:w-64`}>
          {STAFF_ROLES.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
        </select>
        <p className="mt-1.5 text-[12px] text-muted">{roleAccess[role]}</p>
      </div>
      <fieldset className="mt-6">
        <legend className={labelClass}>How they get a password</legend>
        <div className="mt-1 grid gap-3 sm:grid-cols-2">
          {([
            ["invite", "Email an invite", "They receive a link to choose their own password."],
            ["password", "Set a temporary password", "You pass it on; they must change it when they first sign in."],
          ] as const).map(([value, title, hint]) => (
            <label key={value} className={`flex cursor-pointer gap-3 rounded-lg border p-3.5 ${mode === value ? "border-brand bg-brand-soft" : "border-line-strong"}`}>
              <input type="radio" name="mode" value={value} checked={mode === value} onChange={() => setMode(value)} className="mt-0.5 accent-brand" />
              <span>
                <span className="block text-[13.5px] font-semibold text-ink">{title}</span>
                <span className="block text-[12px] text-muted">{hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {mode === "password" && (
        <div className="mt-4">
          <label htmlFor="new-password" className={labelClass}>Temporary password</label>
          <div className="flex gap-2">
            <input id="new-password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={128} autoComplete="new-password" spellCheck={false} aria-invalid={!!errors.password} className={`${fieldClass} ${mono}`} />
            <button type="button" onClick={() => setPassword(generatePassword())} className={buttonClass}>Generate</button>
          </div>
          <FieldError id="new-password-error" message={errors.password} />
        </div>
      )}
      <div className="sticky bottom-0 -mx-6 -mb-5 mt-6 flex items-center gap-2 border-t border-line bg-surface px-6 py-4">
        <button type="submit" disabled={busy} className={primaryClass}>{busy ? "Creating…" : mode === "invite" ? "Create and send invite" : "Create user"}</button>
        <button type="button" onClick={onCancel} className={buttonClass}>Cancel</button>
      </div>
    </form>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
      <dt className="text-[12.5px] text-muted">{label}</dt>
      <dd className="text-right text-[13px] font-medium text-ink">{children}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-6 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-faint">{children}</h3>;
}

type Pending = "edit" | "deactivate" | "delete" | { role: Role } | null;

/**
 * One account in the side panel: who they are, the facts, a visitor's sign-up answers and downloads, and the actions
 * an admin can take. Edits are confirmed in place; the backend re-checks each one (e.g. the last-admin guard).
 */
export function AccountPanel({ user, selfId, onChanged }: { user: ManagedUser; selfId?: number; onChanged: (user: ManagedUser | null, notice: string) => void }) {
  const visitor = user.role === "public";
  const self = selfId === user.id;
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Exclude<UserMutation, { ok: true }> | null>(null);
  const [downloads, setDownloads] = useState<UserDownload[] | null | "loading">(visitor ? "loading" : null);

  useEffect(() => {
    if (!visitor) return;
    let current = true;
    getUserDownloadsAction(user.id)
      .catch(() => null)
      .then((rows) => {
        if (current) setDownloads(rows);
      });
    return () => {
      current = false;
    };
  }, [user.id, visitor]);

  async function run(action: () => Promise<UserMutation>, notice: string, next?: Partial<ManagedUser>) {
    setBusy(true);
    setError(null);
    const outcome = await action().catch(() => unreachable);
    setBusy(false);
    if (!outcome.ok) return setError(outcome);
    setPending(null);
    onChanged(outcome.user ?? (next ? { ...user, ...next } : user), notice);
  }

  async function remove() {
    setBusy(true);
    setError(null);
    const outcome = await deleteUserAction(user.id).catch(() => unreachable);
    setBusy(false);
    if (!outcome.ok) return setError(outcome);
    onChanged(null, `${user.name}'s account was deleted.`);
  }

  async function saveDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const details = { email: String(form.get("email") ?? ""), firstName: String(form.get("firstName") ?? ""), lastName: String(form.get("lastName") ?? "") };
    await run(() => updateUserAction(user.id, details), "Details saved.");
  }

  const errors = error?.fieldErrors ?? {};

  return (
    <div>
      <div className="flex items-center gap-3.5">
        <Avatar name={user.name} seed={user.id} size={48} />
        <div className="min-w-0">
          <p className="truncate text-[17px] font-semibold text-ink">{user.name}</p>
          <p className="truncate text-[13px] text-muted">{user.email}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <RoleBadge role={user.role} />
        {user.active ? <Badge tone="ok">Active</Badge> : <Badge tone="danger">Deactivated</Badge>}
        {visitor && (user.emailVerified ? <Badge tone="ok">Email confirmed</Badge> : <Badge tone="warn">Email not confirmed</Badge>)}
        {user.mustChangePassword && <Badge tone="warn">Temporary password</Badge>}
        {self && <Badge tone="brand">You</Badge>}
      </div>

      {error && !error.fieldErrors && <p role="alert" className="mt-4 rounded-lg border border-danger/25 bg-danger-soft p-3 text-[13px] text-ink-soft">{error.message}</p>}

      <SectionTitle>Account</SectionTitle>
      <dl>
        <Fact label="Username"><span className={mono}>{user.username}</span></Fact>
        <Fact label="Joined">{formatDate(user.joinedAt)}</Fact>
        <Fact label="Last sign-in">{formatDate(user.lastLoginAt)}</Fact>
        {visitor && <Fact label="Downloads"><span className={mono}>{user.downloadCount}</span></Fact>}
      </dl>

      {visitor && (
        <>
          <SectionTitle>Sign-up answers</SectionTitle>
          <dl>
            <Fact label="Organisation">{user.organisation || "Not given"}</Fact>
            <Fact label="Uses data for">{purposeLabel(user.purpose)}</Fact>
            <Fact label="Newsletter">{user.newsletter ? "Subscribed" : "No"}</Fact>
          </dl>
          <SectionTitle>Recent downloads</SectionTitle>
          {downloads === "loading" ? (
            <p className="text-[13px] text-muted">Loading…</p>
          ) : downloads === null ? (
            <p className="text-[13px] text-muted">Couldn&apos;t load their downloads.</p>
          ) : downloads.length === 0 ? (
            <p className="text-[13px] text-muted">No downloads yet.</p>
          ) : (
            <ul className="divide-y divide-line rounded-lg border border-line">
              {downloads.slice(0, 20).map((d, i) => (
                <li key={`${d.dataset}-${d.at}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2">
                  <Link href={`/data/${d.dataset}`} target="_blank" className="min-w-0 truncate text-[13px] font-medium text-brand hover:underline">{d.title || d.dataset}</Link>
                  <span className="flex shrink-0 items-center gap-2 text-[12px] text-muted">
                    <span className={`${mono} uppercase`}>{d.format}</span>
                    {relativeTime(d.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <SectionTitle>Actions</SectionTitle>
      {pending === "edit" ? (
        <form onSubmit={saveDetails} className="space-y-3 rounded-lg border border-line p-3">
          {([
            ["email", "Email", user.email],
            ["firstName", "First name", user.firstName],
            ["lastName", "Last name", user.lastName],
          ] as const).map(([name, label, value]) => (
            <div key={name}>
              <label htmlFor={`edit-${name}`} className={labelClass}>{label}</label>
              <input id={`edit-${name}`} name={name} defaultValue={value} maxLength={name === "email" ? 254 : 150} className={fieldClass} aria-invalid={!!errors[name]} />
              <FieldError id={`edit-${name}-error`} message={errors[name]} />
            </div>
          ))}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className={primaryClass}>{busy ? "Saving…" : "Save"}</button>
            <button type="button" onClick={() => setPending(null)} className={buttonClass}>Cancel</button>
          </div>
        </form>
      ) : pending && typeof pending === "object" ? (
        <div className="rounded-lg border border-brand/25 bg-brand-soft p-3 text-[13px] text-ink-soft">
          <p>
            Change <strong className="text-ink">{user.name}</strong> from <RoleBadge role={user.role} /> to <RoleBadge role={pending.role} />?
          </p>
          <p className="mt-1 text-[12px] text-muted">{roleAccess[pending.role]}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" disabled={busy} onClick={() => run(() => setUserRoleAction(user.id, pending.role), `Role changed to ${roleLabels[pending.role]}.`, { role: pending.role })} className={primaryClass}>
              {busy ? "Saving…" : "Change role"}
            </button>
            <button type="button" onClick={() => setPending(null)} className={buttonClass}>Cancel</button>
          </div>
        </div>
      ) : pending === "deactivate" ? (
        <div className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-[13px] text-ink-soft">
          <p>Deactivate <strong className="text-ink">{user.name}</strong>? They can&apos;t sign in until reactivated. Nothing they made is deleted.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" disabled={busy} onClick={() => run(() => setUserActiveAction(user.id, false), "Account deactivated.", { active: false })} className={dangerClass}>
              {busy ? "Deactivating…" : "Deactivate"}
            </button>
            <button type="button" onClick={() => setPending(null)} className={buttonClass}>Cancel</button>
          </div>
        </div>
      ) : pending === "delete" ? (
        <div className="rounded-lg border border-danger/25 bg-danger-soft p-3 text-[13px] text-ink-soft">
          <p>
            Delete <strong className="text-ink">{user.name}</strong>&apos;s account for good? This can&apos;t be undone.{" "}
            {visitor ? "Their sign-up answers, download history and access requests go with it." : "Their download history and access requests go with it."}
          </p>
          <p className="mt-1 text-[12px] text-muted">An account that created content on the site can&apos;t be deleted; deactivate it instead.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" disabled={busy} onClick={remove} className={dangerSolidClass}>
              {busy ? "Deleting…" : "Delete account"}
            </button>
            <button type="button" onClick={() => setPending(null)} className={buttonClass}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label htmlFor="panel-role" className={labelClass}>Role</label>
            <select
              id="panel-role"
              value={user.role}
              disabled={self || busy || !user.active}
              title={self ? "You can't change your own role. Ask another admin." : undefined}
              onChange={(e) => e.target.value !== user.role && setPending({ role: e.target.value as Role })}
              className={`${fieldClass} disabled:opacity-60`}
            >
              {ALL_ROLES.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {visitor && user.active && (
              <button type="button" disabled={busy} onClick={() => setPending({ role: "researcher" })} className={buttonClass}>Promote to Researcher</button>
            )}
            {visitor && user.active && !user.emailVerified && (
              <button type="button" disabled={busy} onClick={() => run(() => resendUserVerificationAction(user.id), `Confirmation email sent to ${user.email}.`)} className={buttonClass}>
                Resend confirmation
              </button>
            )}
            <button type="button" disabled={busy || !user.active} onClick={() => run(() => sendPasswordResetAction(user.id), `Password link sent to ${user.email}.`)} className={buttonClass}>
              Send password link
            </button>
            <button type="button" disabled={busy} onClick={() => setPending("edit")} className={buttonClass}>Edit details</button>
            {user.active ? (
              <button type="button" disabled={busy || self} title={self ? "You can't deactivate yourself." : undefined} onClick={() => setPending("deactivate")} className={dangerClass}>
                Deactivate
              </button>
            ) : (
              <button type="button" disabled={busy} onClick={() => run(() => setUserActiveAction(user.id, true), "Account reactivated.", { active: true })} className={buttonClass}>
                Reactivate
              </button>
            )}
            <button type="button" disabled={busy || self} title={self ? "You can't delete your own account." : undefined} onClick={() => setPending("delete")} className={dangerClass}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
