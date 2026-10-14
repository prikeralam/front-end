"use server";

import { backendRequest, type BackendResult } from "../api/backendRequest";
import { toManagedUser, type ApiUser, type ManagedUser } from "../api/userAdapter";
import { apiBaseUrl } from "../api/client";
import { getAccessToken } from "../auth/serverAuth";
import { roleLabels, type Role } from "../session";
import { userQuery, type UserFilters } from "./userQuery";

// Admin user management (backend Module H). Server Actions are public POST endpoints, so every argument is validated
// here; the backend is what makes these admin-only (403 for anyone else) and guards against locking out the last admin.

const USERS_PATH = "/api/v1/users/";
const USERNAME = /^[\w.@+-]{1,150}$/;
const MAX_EMAIL = 254;
const MAX_NAME = 150;
const MAX_PASSWORD = 128;

export type { UserFilters } from "./userQuery";

export type UserListResult =
  | { status: "ok"; users: ManagedUser[]; count: number; hasNext: boolean; hasPrevious: boolean }
  | { status: "signed-out" }
  | { status: "forbidden" }
  | { status: "invalid" }
  | { status: "error" };

/** Form field names, so a 400 can point at the field it is about. */
export type UserField = "username" | "email" | "firstName" | "lastName" | "role" | "password";

export type UserMutation =
  | { ok: true; user?: ManagedUser }
  | { ok: false; message: string; fieldErrors?: Partial<Record<UserField, string>> };

export type NewUserInput = {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  /** `invite` emails a link to set a password; `password` sets a temporary one the user must change at first sign-in. */
  mode: "invite" | "password";
  password?: string;
};

export type UserDetailsInput = { email: string; firstName?: string; lastName?: string };

const isRole = (value: unknown): value is Role => typeof value === "string" && Object.hasOwn(roleLabels, value);
const isId = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value > 0 && value < 2 ** 31;
const isText = (value: unknown, max: number): value is string => typeof value === "string" && value.length <= max;
const isEmail = (value: unknown): value is string => isText(value, MAX_EMAIL) && /^[^\s@]+@[^\s@]+$/.test(value.trim());

const API_FIELDS: Record<string, UserField> = {
  username: "username",
  email: "email",
  first_name: "firstName",
  last_name: "lastName",
  role: "role",
  password: "password",
  new_password: "password",
};

const signedOut = { ok: false, message: "Your session has ended. Please sign in again." } as const;

function failure(result: BackendResult): UserMutation {
  switch (result.status) {
    case 401:
      return signedOut;
    case 403:
      return { ok: false, message: "Only admins can manage users." };
    case 404:
      return { ok: false, message: "That user no longer exists." };
    case 400: {
      // DRF answers {field: [messages]}, or a general message under `detail` (a string, or a list when raised as a
      // ValidationError, as the last-admin guard does) or `non_field_errors`.
      const body = (result.data && typeof result.data === "object" ? result.data : {}) as Record<string, unknown>;
      const fieldErrors: Partial<Record<UserField, string>> = {};
      for (const [key, value] of Object.entries(body)) {
        const field = API_FIELDS[key];
        if (field && Array.isArray(value)) fieldErrors[field] = value.join(" ");
      }
      const text = (value: unknown) => (typeof value === "string" ? value : Array.isArray(value) ? value.join(" ") : "");
      const general = text(body.detail) || text(body.non_field_errors);
      const hasFields = Object.keys(fieldErrors).length > 0;
      return {
        ok: false,
        message: general || (hasFields ? "Check the highlighted fields." : result.message || "The server rejected that."),
        ...(hasFields ? { fieldErrors } : {}),
      };
    }
    default:
      return { ok: false, message: "Something went wrong on the server. Please try again." };
  }
}

function asUser(result: BackendResult): ManagedUser | undefined {
  const data = result.data as ApiUser | null;
  return data && typeof data === "object" && typeof data.id === "number" ? toManagedUser(data) : undefined;
}

/** One page of users (by username unless `ordering` says otherwise), narrowed by the given filters. */
export async function listUsersAction(filters: UserFilters = {}): Promise<UserListResult> {
  const params = userQuery(filters);
  if (!params) return { status: "invalid" };

  const accessToken = await getAccessToken();
  if (!accessToken) return { status: "signed-out" };

  const result = await backendRequest("GET", `${USERS_PATH}?${params}`, { accessToken });
  if (result.status === 401) return { status: "signed-out" };
  if (result.status === 403) return { status: "forbidden" };
  const body = result.data as { count?: number; next?: string | null; previous?: string | null; results?: ApiUser[] } | null;
  if (!result.ok || !body || !Array.isArray(body.results)) return { status: "error" };

  return {
    status: "ok",
    users: body.results.map(toManagedUser),
    count: body.count ?? body.results.length,
    hasNext: !!body.next,
    hasPrevious: !!body.previous,
  };
}

/** Creates an account: an emailed invite, or a temporary password the user must change at first sign-in. */
export async function createUserAction(input: NewUserInput): Promise<UserMutation> {
  const { username, email, firstName = "", lastName = "", role, mode, password } = input ?? ({} as NewUserInput);
  if (typeof username !== "string" || !USERNAME.test(username.trim())) {
    return { ok: false, message: "Check the highlighted fields.", fieldErrors: { username: "Use up to 150 letters, digits and @ . + - _ only." } };
  }
  if (!isEmail(email)) return { ok: false, message: "Check the highlighted fields.", fieldErrors: { email: "Enter a valid email address." } };
  if (!isText(firstName, MAX_NAME) || !isText(lastName, MAX_NAME)) return { ok: false, message: "Names can be at most 150 characters." };
  if (!isRole(role)) return { ok: false, message: "Choose a role." };
  if (mode !== "invite" && mode !== "password") return { ok: false, message: "Choose how the user gets their password." };
  if (mode === "password" && (typeof password !== "string" || !password || password.length > MAX_PASSWORD)) {
    return { ok: false, message: "Check the highlighted fields.", fieldErrors: { password: "Enter a temporary password (at most 128 characters)." } };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) return signedOut;

  const json = {
    username: username.trim(),
    email: email.trim(),
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    role,
    ...(mode === "password" ? { password } : {}),
  };
  const result = await backendRequest("POST", USERS_PATH, { accessToken, json });
  return result.ok ? { ok: true, user: asUser(result) } : failure(result);
}

/** Edits a user's email and name. Username and role are not editable here (role has its own action). */
export async function updateUserAction(id: number, input: UserDetailsInput): Promise<UserMutation> {
  if (!isId(id)) return { ok: false, message: "That user no longer exists." };
  const { email, firstName = "", lastName = "" } = input ?? ({} as UserDetailsInput);
  if (!isEmail(email)) return { ok: false, message: "Check the highlighted fields.", fieldErrors: { email: "Enter a valid email address." } };
  if (!isText(firstName, MAX_NAME) || !isText(lastName, MAX_NAME)) return { ok: false, message: "Names can be at most 150 characters." };

  const accessToken = await getAccessToken();
  if (!accessToken) return signedOut;

  const json = { email: email.trim(), first_name: firstName.trim(), last_name: lastName.trim() };
  const result = await backendRequest("PATCH", `${USERS_PATH}${id}/`, { accessToken, json });
  return result.ok ? { ok: true, user: asUser(result) } : failure(result);
}

/** Grants or revokes access by changing the role. The backend refuses to demote yourself or the last active admin. */
export async function setUserRoleAction(id: number, role: Role): Promise<UserMutation> {
  if (!isId(id)) return { ok: false, message: "That user no longer exists." };
  if (!isRole(role)) return { ok: false, message: "Choose a role." };

  const accessToken = await getAccessToken();
  if (!accessToken) return signedOut;

  const result = await backendRequest("PATCH", `${USERS_PATH}${id}/role/`, { accessToken, json: { role } });
  // The role endpoint answers with {id, role}, not a full user; the screen reloads the row.
  return result.ok ? { ok: true } : failure(result);
}

/** Deactivates (instead of deleting) or reactivates an account. Deactivation ends the user's sessions at once. */
export async function setUserActiveAction(id: number, active: boolean): Promise<UserMutation> {
  if (!isId(id)) return { ok: false, message: "That user no longer exists." };
  if (typeof active !== "boolean") return { ok: false, message: "The server rejected that." };

  const accessToken = await getAccessToken();
  if (!accessToken) return signedOut;

  const result = await backendRequest("POST", `${USERS_PATH}${id}/${active ? "reactivate" : "deactivate"}/`, { accessToken });
  return result.ok ? { ok: true, user: asUser(result) } : failure(result);
}

/** Emails the user a password-reset link (or a fresh invite if they never set a password). */
export async function sendPasswordResetAction(id: number): Promise<UserMutation> {
  if (!isId(id)) return { ok: false, message: "That user no longer exists." };

  const accessToken = await getAccessToken();
  if (!accessToken) return signedOut;

  const result = await backendRequest("POST", `${USERS_PATH}${id}/send-password-reset/`, { accessToken });
  return result.ok ? { ok: true } : failure(result);
}

export type VisitorStats = {
  visitors: { total: number; confirmed: number; newsletter: number; new7Days: number; new30Days: number };
  weeklySignups: { week: string; count: number }[];
  purposes: { purpose: string; label: string; count: number }[];
  topOrganisations: { organisation: string; count: number }[];
  downloads: { total: number; last30Days: number; topDatasets: { slug: string; title: string; count: number }[] };
};

const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
const list = (value: unknown) => (Array.isArray(value) ? (value as Record<string, unknown>[]) : []);
const str = (value: unknown) => (typeof value === "string" ? value : "");

/** Visitor and download figures for the admin Overview (backend `/users/stats/`), or null when they can't be read. */
export async function getVisitorStatsAction(): Promise<VisitorStats | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  const result = await backendRequest("GET", `${USERS_PATH}stats/`, { accessToken });
  if (!result.ok || !result.data || typeof result.data !== "object") return null;
  const d = result.data as Record<string, Record<string, unknown> | unknown>;
  const v = (d.visitors ?? {}) as Record<string, unknown>;
  const dl = (d.downloads ?? {}) as Record<string, unknown>;
  return {
    visitors: { total: num(v.total), confirmed: num(v.confirmed), newsletter: num(v.newsletter), new7Days: num(v.new_7_days), new30Days: num(v.new_30_days) },
    weeklySignups: list(d.weekly_signups).map((w) => ({ week: str(w.week), count: num(w.count) })),
    purposes: list(d.purposes).map((p) => ({ purpose: str(p.purpose), label: str(p.label) || "Not given", count: num(p.count) })),
    topOrganisations: list(d.top_organisations).map((o) => ({ organisation: str(o.organisation), count: num(o.count) })),
    downloads: {
      total: num(dl.total),
      last30Days: num(dl.last_30_days),
      topDatasets: list(dl.top_datasets).map((t) => ({ slug: str(t.slug), title: str(t.title), count: num(t.count) })),
    },
  };
}

export type UserDownload = { dataset: string; title: string; format: string; at: string };

/** A user's most recent dataset downloads (newest first), or null when they can't be read. */
export async function getUserDownloadsAction(id: number): Promise<UserDownload[] | null> {
  if (!isId(id)) return null;
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  const result = await backendRequest("GET", `${USERS_PATH}${id}/downloads/`, { accessToken });
  if (!result.ok) return null;
  return list(result.data).map((r) => ({ dataset: str(r.dataset), title: str(r.title), format: str(r.format), at: str(r.at) }));
}

/** Emails a visitor a new confirmation link (when theirs never arrived). */
export async function resendUserVerificationAction(id: number): Promise<UserMutation> {
  if (!isId(id)) return { ok: false, message: "That user no longer exists." };
  const accessToken = await getAccessToken();
  if (!accessToken) return signedOut;
  const result = await backendRequest("POST", `${USERS_PATH}${id}/resend-verification/`, { accessToken });
  return result.ok ? { ok: true } : failure(result);
}

export type ExportResult = { ok: true; filename: string; csv: string } | { ok: false; message: string };

/** The filtered list as a CSV file (audited by the backend). `newsletterOnly` keeps active subscribers only. */
export async function exportUsersAction(filters: UserFilters, newsletterOnly = false): Promise<ExportResult> {
  const params = userQuery(filters, { forExport: true });
  if (!params || typeof newsletterOnly !== "boolean") return { ok: false, message: "Those filters aren't valid." };
  if (newsletterOnly) params.set("newsletter_only", "true");
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, message: "Your session has ended. Please sign in again." };
  const response = await fetch(`${apiBaseUrl()}${USERS_PATH}export/?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "text/csv" },
    cache: "no-store",
  });
  if (response.status === 403) return { ok: false, message: "Only admins can export users." };
  if (!response.ok) return { ok: false, message: "The export failed. Please try again." };
  const disposition = response.headers.get("content-disposition") ?? "";
  const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? "pri-users.csv";
  return { ok: true, filename, csv: await response.text() };
}
