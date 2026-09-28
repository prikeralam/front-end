"use server";

import { backendRequest, type BackendResult } from "../api/backendRequest";
import { toManagedUser, type ApiUser, type ManagedUser } from "../api/userAdapter";
import { getAccessToken } from "../auth/serverAuth";
import { roleLabels, type Role } from "../session";

// Admin user management (backend Module H). Server Actions are public POST endpoints, so every argument is validated
// here; the backend is what makes these admin-only (403 for anyone else) and guards against locking out the last admin.

const USERS_PATH = "/api/v1/users/";
const USERNAME = /^[\w.@+-]{1,150}$/;
const MAX_EMAIL = 254;
const MAX_NAME = 150;
const MAX_PASSWORD = 128;
const MAX_QUERY = 100;
const MAX_PAGE = 100_000;

export type UserFilters = { q?: string; role?: Role | ""; active?: "active" | "inactive" | ""; page?: number };

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

/** One page of users, ordered by username, optionally filtered by a search term, role and active status. */
export async function listUsersAction(filters: UserFilters = {}): Promise<UserListResult> {
  const { q = "", role = "", active = "", page = 1 } = filters ?? {};
  if (!isText(q, MAX_QUERY)) return { status: "invalid" };
  if (role !== "" && !isRole(role)) return { status: "invalid" };
  if (active !== "" && active !== "active" && active !== "inactive") return { status: "invalid" };
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) return { status: "invalid" };

  const accessToken = await getAccessToken();
  if (!accessToken) return { status: "signed-out" };

  const params = new URLSearchParams({ page: String(page) });
  if (q.trim()) params.set("q", q.trim());
  if (role) params.set("role", role);
  if (active) params.set("is_active", active === "active" ? "true" : "false");

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
